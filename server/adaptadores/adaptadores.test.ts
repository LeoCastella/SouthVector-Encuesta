import { describe, expect, it, vi } from 'vitest'
import { aRespuestas, calcularDiagnostico } from '../../src/domain'
import { cuestionarioV1, pedidoValido } from '../prueba-utils'
import { envioBrevo } from './brevo'
import { repositorioSheets } from './sheets'
import { avisosTelegram } from './telegram'

const respuesta = (cuerpo: unknown, status = 200) => new Response(JSON.stringify(cuerpo), { status })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cuerpoDe = (f: { mock: { calls: any[][] } }) => JSON.parse((f.mock.calls[0][1] as RequestInit).body as string)

const pedido = pedidoValido()
const lead = {
  fecha: '2026-10-19T12:00:00.000Z',
  nombre: pedido.nombre,
  empresa: pedido.empresa,
  email: pedido.email,
  utm: pedido.utm,
  diagnostico: calcularDiagnostico(cuestionarioV1, aRespuestas(pedido.respuestas)),
}

describe('repositorioSheets', () => {
  it('envía la fila con el token y las 12 respuestas en orden', async () => {
    const fetcher = vi.fn(async (..._args: unknown[]) => respuesta({ ok: true, duplicado: true }))
    const repo = repositorioSheets('https://script.example/exec', 'secreto', fetcher)
    expect(await repo.registrar(lead)).toEqual({ duplicado: true })
    expect(cuerpoDe(fetcher)).toMatchObject({
      token: 'secreto',
      respuestas: [3, 4, 3, 2, 3, 2, 2, 2, 3, 1, 2, 2],
      ejeX: 17,
      ejeY: 12,
      cuadrante: 'deuda-tecnica',
      utmSource: 'linkedin',
      utmMedium: '',
    })
  })

  it('falla si el script rechaza el pedido o responde con error HTTP', async () => {
    await expect(
      repositorioSheets(
        'u',
        't',
        vi.fn(async (..._args: unknown[]) => respuesta({ ok: false, error: 'token inválido' })),
      ).registrar(lead),
    ).rejects.toThrow('token inválido')
    await expect(
      repositorioSheets(
        'u',
        't',
        vi.fn(async (..._args: unknown[]) => respuesta({}, 500)),
      ).registrar(lead),
    ).rejects.toThrow('500')
  })
})

describe('envioBrevo', () => {
  it('adjunta el PDF en base64 y escapa el nombre en el HTML', async () => {
    const fetcher = vi.fn(async (..._args: unknown[]) => respuesta({ messageId: '1' }, 201))
    const envio = envioBrevo('clave', { email: 'hola@southvector.com', nombre: 'South Vector' }, fetcher)
    await envio.enviarInforme(
      { email: 'ana@acme.com', nombre: '<Ana>' },
      new Uint8Array([37, 80, 68, 70]),
      'Código rojo',
    )

    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.brevo.com/v3/smtp/email')
    expect((init.headers as Record<string, string>)['api-key']).toBe('clave')
    const cuerpo = cuerpoDe(fetcher)
    expect(cuerpo.to).toEqual([{ email: 'ana@acme.com', name: '<Ana>' }])
    expect(cuerpo.htmlContent).toContain('&lt;Ana&gt;')
    expect(cuerpo.attachment[0]).toEqual({ name: 'diagnostico-south-vector.pdf', content: 'JVBERg==' })
  })

  it('falla si Brevo responde con error', async () => {
    const envio = envioBrevo(
      'k',
      { email: 'a@b.com', nombre: 'SV' },
      vi.fn(async (..._args: unknown[]) => new Response('mal', { status: 400 })),
    )
    await expect(envio.enviarInforme({ email: 'x@y.com', nombre: 'X' }, new Uint8Array(), 'c')).rejects.toThrow('400')
  })
})

describe('avisosTelegram', () => {
  it('avisa con cuadrante y fecha, sin datos personales', async () => {
    const fetcher = vi.fn(async (..._args: unknown[]) => respuesta({ ok: true }))
    await avisosTelegram('tok', '-100123', cuestionarioV1, fetcher).nuevoLead('codigo-rojo', '2026-10-19T12:34:56Z')
    expect(fetcher.mock.calls[0][0]).toBe('https://api.telegram.org/bottok/sendMessage')
    const { chat_id, text } = cuerpoDe(fetcher)
    expect(chat_id).toBe('-100123')
    expect(text).toContain('Código rojo (caos total)')
    expect(text).toContain('2026-10-19 12:34 UTC')
    for (const dato of [lead.nombre, lead.empresa, lead.email]) expect(text).not.toContain(dato)
  })

  it('falla si Telegram responde con error', async () => {
    const avisos = avisosTelegram(
      't',
      'c',
      cuestionarioV1,
      vi.fn(async (..._args: unknown[]) => respuesta({}, 403)),
    )
    await expect(avisos.nuevoLead('optimizacion', '2026-10-19T00:00:00Z')).rejects.toThrow('403')
  })
})
