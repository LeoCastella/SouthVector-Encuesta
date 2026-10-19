import { aRespuestas, calcularDiagnostico, esquemaPedidoInforme, type VersionCuestionario } from '../src/domain'
import { generarInformePdf } from './pdf'
import type { Avisos, EnvioEmail, Registro, RepositorioLeads } from './puertos'

export interface Dependencias {
  cuestionario: VersionCuestionario
  leads: RepositorioLeads
  email: EnvioEmail
  avisos: Avisos
  registro: Registro
  ahora?: () => Date
}

export type ResultadoPedido =
  | { estado: 'enviado' }
  | { estado: 'invalido'; problemas: { campo: string; mensaje: string }[] }
  | { estado: 'error'; mensaje: string }

/**
 * Caso de uso "pedir informe": valida, recalcula, guarda el lead, envía el PDF y avisa al equipo.
 * Las dependencias se inyectan para poder probarlo sin red.
 */
export async function pedirInforme(cuerpo: unknown, deps: Dependencias): Promise<ResultadoPedido> {
  const parseo = esquemaPedidoInforme(deps.cuestionario).safeParse(cuerpo)
  if (!parseo.success) {
    return {
      estado: 'invalido',
      problemas: parseo.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
    }
  }
  const pedido = parseo.data

  // Un bot completó el campo trampa: respondemos como si todo fuera bien y no hacemos nada.
  if (pedido.sitio) return { estado: 'enviado' }

  const diagnostico = calcularDiagnostico(deps.cuestionario, aRespuestas(pedido.respuestas))
  const fecha = (deps.ahora?.() ?? new Date()).toISOString()
  const lead = {
    fecha,
    nombre: pedido.nombre,
    empresa: pedido.empresa,
    email: pedido.email,
    diagnostico,
    utm: pedido.utm,
  }

  let duplicado: boolean
  try {
    ;({ duplicado } = await deps.leads.registrar(lead))
  } catch (e) {
    deps.registro.error('No se pudo guardar el lead', e)
    return { estado: 'error', mensaje: 'No pudimos registrar tu pedido. Probá de nuevo en unos minutos.' }
  }

  try {
    const pdf = await generarInformePdf(deps.cuestionario, lead)
    const cuadrante = deps.cuestionario.cuadrantes[diagnostico.cuadrante].titulo
    await deps.email.enviarInforme({ email: pedido.email, nombre: pedido.nombre }, pdf, cuadrante)
  } catch (e) {
    deps.registro.error('No se pudo enviar el informe', e)
    return { estado: 'error', mensaje: 'No pudimos enviar el informe. Probá de nuevo en unos minutos.' }
  }

  if (!duplicado) {
    // El aviso interno no debe impedir que el usuario reciba su informe.
    await deps.avisos
      .nuevoLead(diagnostico.cuadrante, fecha)
      .catch((e) => deps.registro.error('Falló el aviso de Telegram', e))
  }

  return { estado: 'enviado' }
}
