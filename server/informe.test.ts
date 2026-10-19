import { describe, expect, it, vi } from 'vitest'
import { pedirInforme, type Dependencias } from './informe'
import type { Lead } from './puertos'
import { cuestionarioV1, pedidoValido } from './prueba-utils'

function dependencias(opciones: { duplicado?: boolean } = {}) {
  const guardados: Lead[] = []
  const deps = {
    cuestionario: cuestionarioV1,
    leads: {
      registrar: vi.fn(async (lead: Lead) => {
        guardados.push(lead)
        return { duplicado: opciones.duplicado ?? false }
      }),
    },
    email: { enviarInforme: vi.fn(async () => {}) },
    avisos: { nuevoLead: vi.fn(async () => {}) },
    registro: { error: vi.fn() },
    ahora: () => new Date('2026-10-19T12:00:00Z'),
  } satisfies Dependencias
  return { deps, guardados }
}

describe('pedirInforme', () => {
  it('guarda el lead con el diagnóstico recalculado, envía el PDF y avisa sin datos personales', async () => {
    const { deps, guardados } = dependencias()
    const resultado = await pedirInforme({ ...pedidoValido(), cuadrante: 'optimizacion' }, deps)

    expect(resultado).toEqual({ estado: 'enviado' })
    expect(guardados[0]).toMatchObject({
      fecha: '2026-10-19T12:00:00.000Z',
      email: 'ana@acme.com',
      utm: { source: 'linkedin' },
      diagnostico: { ejeX: 17, ejeY: 12, cuadrante: 'deuda-tecnica' },
    })
    const [destino, pdf, cuadrante] = deps.email.enviarInforme.mock.calls[0] as unknown as [unknown, Uint8Array, string]
    expect(destino).toEqual({ email: 'ana@acme.com', nombre: 'Ana Pérez' })
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe('%PDF-')
    expect(cuadrante).toBe('Deuda técnica operativa')
    expect(deps.avisos.nuevoLead).toHaveBeenCalledWith('deuda-tecnica', '2026-10-19T12:00:00.000Z')
  })

  it('no repite el aviso si el email ya pidió un informe, pero reenvía el PDF', async () => {
    const { deps } = dependencias({ duplicado: true })
    expect(await pedirInforme(pedidoValido(), deps)).toEqual({ estado: 'enviado' })
    expect(deps.email.enviarInforme).toHaveBeenCalledOnce()
    expect(deps.avisos.nuevoLead).not.toHaveBeenCalled()
  })

  it('devuelve los problemas de validación sin guardar nada', async () => {
    const { deps } = dependencias()
    const resultado = await pedirInforme({ ...pedidoValido(), email: 'x', consentimiento: false }, deps)
    expect(resultado.estado).toBe('invalido')
    if (resultado.estado === 'invalido') {
      expect(resultado.problemas.map((p) => p.campo)).toEqual(['email', 'consentimiento'])
    }
    expect(deps.leads.registrar).not.toHaveBeenCalled()
  })

  it('ignora en silencio a los bots que completan el campo trampa', async () => {
    const { deps } = dependencias()
    expect(await pedirInforme({ ...pedidoValido(), sitio: 'http://spam' }, deps)).toEqual({ estado: 'enviado' })
    expect(deps.leads.registrar).not.toHaveBeenCalled()
    expect(deps.email.enviarInforme).not.toHaveBeenCalled()
  })

  it('informa el error si no se puede guardar el lead y no envía nada', async () => {
    const { deps } = dependencias()
    deps.leads.registrar.mockRejectedValueOnce(new Error('sin red'))
    expect((await pedirInforme(pedidoValido(), deps)).estado).toBe('error')
    expect(deps.email.enviarInforme).not.toHaveBeenCalled()
    expect(deps.registro.error).toHaveBeenCalled()
  })

  it('informa el error si falla el email y no avisa por Telegram', async () => {
    const { deps } = dependencias()
    deps.email.enviarInforme.mockRejectedValueOnce(new Error('brevo caído'))
    expect((await pedirInforme(pedidoValido(), deps)).estado).toBe('error')
    expect(deps.avisos.nuevoLead).not.toHaveBeenCalled()
  })

  it('si falla Telegram, el usuario igual recibe su informe', async () => {
    const { deps } = dependencias()
    deps.avisos.nuevoLead.mockRejectedValueOnce(new Error('telegram caído'))
    expect(await pedirInforme(pedidoValido(), deps)).toEqual({ estado: 'enviado' })
    expect(deps.registro.error).toHaveBeenCalledWith('Falló el aviso de Telegram', expect.any(Error))
  })
})
