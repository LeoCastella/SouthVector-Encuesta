import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pedidoValido } from '../../server/prueba-utils'
import handler from '../../netlify/functions/informe.mts'

const ENTORNO = {
  SHEETS_WEBHOOK_URL: 'https://script.example/exec',
  SHEETS_TOKEN: 'secreto',
  BREVO_API_KEY: 'clave',
  EMAIL_REMITENTE: 'hola@southvector.com',
  TELEGRAM_BOT_TOKEN: 'tok',
  TELEGRAM_CHAT_ID: '-100',
}

const pedir = (cuerpo: unknown, method = 'POST') =>
  handler(
    new Request('http://localhost/api/informe', {
      method,
      body: method === 'POST' ? (typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo)) : undefined,
    }),
  )

/** Simula Apps Script, Brevo y Telegram según la URL. */
function redFalsa(opciones: { brevoStatus?: number } = {}) {
  return vi.fn(async (url: string) => {
    if (url.startsWith('https://script.example')) return new Response('{"ok":true,"duplicado":false}')
    if (url.startsWith('https://api.brevo.com')) return new Response('{}', { status: opciones.brevoStatus ?? 201 })
    return new Response('{"ok":true}')
  })
}

beforeEach(() => {
  for (const [k, v] of Object.entries(ENTORNO)) vi.stubEnv(k, v)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('POST /api/informe', () => {
  it('guarda, envía y avisa: responde 200', async () => {
    const red = redFalsa()
    vi.stubGlobal('fetch', red)
    const res = await pedir(pedidoValido())
    expect(res.status).toBe(200)
    expect(red.mock.calls.map(([url]) => new URL(url).host)).toEqual([
      'script.example',
      'api.brevo.com',
      'api.telegram.org',
    ])
  })

  it('responde 422 con datos inválidos', async () => {
    vi.stubGlobal('fetch', redFalsa())
    const res = await pedir({ ...pedidoValido(), consentimiento: false })
    expect(res.status).toBe(422)
    expect((await res.json()).problemas[0].campo).toBe('consentimiento')
  })

  it('responde 502 si falla un servicio externo', async () => {
    vi.stubGlobal('fetch', redFalsa({ brevoStatus: 500 }))
    expect((await pedir(pedidoValido())).status).toBe(502)
  })

  it('responde 500 si falta configuración', async () => {
    vi.stubEnv('BREVO_API_KEY', '')
    expect((await pedir(pedidoValido())).status).toBe(500)
  })

  it('responde 400 con JSON inválido y 405 a otros métodos', async () => {
    expect((await pedir('{')).status).toBe(400)
    expect((await pedir(null, 'GET')).status).toBe(405)
  })
})
