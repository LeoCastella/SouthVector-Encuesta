import type { Config } from '@netlify/functions'
import { cuestionarioV1 } from '../../src/domain'
import { avisosTelegram } from '../../server/adaptadores/telegram'
import { envioBrevo } from '../../server/adaptadores/brevo'
import { repositorioSheets } from '../../server/adaptadores/sheets'
import { pedirInforme, type Dependencias } from '../../server/informe'

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json; charset=utf-8' } })

function variable(nombre: string): string {
  const valor = process.env[nombre]
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`)
  return valor
}

/** POST /api/informe: guarda el lead, envía el PDF por email y avisa por Telegram. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  let cuerpo: unknown
  try {
    cuerpo = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  let dependencias: Dependencias
  try {
    dependencias = {
      cuestionario: cuestionarioV1,
      leads: repositorioSheets(variable('SHEETS_WEBHOOK_URL'), variable('SHEETS_TOKEN')),
      email: envioBrevo(variable('BREVO_API_KEY'), {
        email: variable('EMAIL_REMITENTE'),
        nombre: process.env.EMAIL_REMITENTE_NOMBRE ?? 'South Vector',
      }),
      avisos: avisosTelegram(variable('TELEGRAM_BOT_TOKEN'), variable('TELEGRAM_CHAT_ID'), cuestionarioV1),
      registro: { error: (mensaje, detalle) => console.error(mensaje, detalle) },
    }
  } catch (e) {
    console.error(e)
    return json({ error: 'El servicio no está configurado.' }, 500)
  }

  const resultado = await pedirInforme(cuerpo, dependencias)

  switch (resultado.estado) {
    case 'enviado':
      return json({ ok: true })
    case 'invalido':
      return json({ error: 'Datos inválidos', problemas: resultado.problemas }, 422)
    case 'error':
      return json({ error: resultado.mensaje }, 502)
  }
}

export const config: Config = {
  path: '/api/informe',
  // Antispam: como máximo 5 pedidos por minuto por IP.
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
}
