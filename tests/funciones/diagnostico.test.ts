import { describe, expect, it } from 'vitest'
import handler from '../../netlify/functions/diagnostico.mts'

const pedir = (cuerpo: unknown, method = 'POST') =>
  handler(
    new Request('http://localhost/api/diagnostico', {
      method,
      body: method === 'POST' ? (typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo)) : undefined,
    }),
  )

const respuestas = Object.fromEntries([3, 4, 3, 2, 3, 2, 2, 2, 3, 1, 2, 2].map((v, i) => [String(i + 1), v]))

describe('POST /api/diagnostico', () => {
  it('recalcula el diagnóstico en el servidor', async () => {
    const res = await pedir({ version: 1, respuestas })
    expect(res.status).toBe(200)
    const { diagnostico } = await res.json()
    expect(diagnostico).toMatchObject({ ejeX: 17, ejeY: 12, cuadrante: 'deuda-tecnica' })
  })

  it('ignora un puntaje enviado por el cliente', async () => {
    const res = await pedir({ version: 1, respuestas, cuadrante: 'optimizacion' })
    expect((await res.json()).diagnostico.cuadrante).toBe('deuda-tecnica')
  })

  it('responde 422 si faltan respuestas', async () => {
    const { '1': _omitida, ...incompletas } = respuestas
    expect((await pedir({ version: 1, respuestas: incompletas })).status).toBe(422)
  })

  it('responde 400 con JSON inválido', async () => {
    expect((await pedir('{no es json')).status).toBe(400)
  })

  it('responde 405 a otros métodos', async () => {
    expect((await pedir(null, 'GET')).status).toBe(405)
  })
})
