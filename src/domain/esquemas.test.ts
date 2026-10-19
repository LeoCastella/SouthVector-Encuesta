import { describe, expect, it } from 'vitest'
import { cuestionarioV1 } from './cuestionario-v1'
import { esquemaPedidoInforme, esquemaRespuestas } from './esquemas'

const esquema = esquemaRespuestas(cuestionarioV1)
const validas = Object.fromEntries(cuestionarioV1.preguntas.map((p) => [String(p.id), 2]))

describe('esquemaRespuestas', () => {
  it('acepta 12 respuestas entre 1 y 4', () => {
    expect(esquema.safeParse({ version: 1, respuestas: validas }).success).toBe(true)
  })

  it.each([0, 5, 2.5, '3', null])('rechaza el valor %s', (valor) => {
    expect(esquema.safeParse({ version: 1, respuestas: { ...validas, '3': valor } }).success).toBe(false)
  })

  it('rechaza preguntas faltantes o desconocidas', () => {
    const { '7': _omitida, ...faltante } = validas
    expect(esquema.safeParse({ version: 1, respuestas: faltante }).success).toBe(false)
    expect(esquema.safeParse({ version: 1, respuestas: { ...validas, '13': 1 } }).success).toBe(false)
  })

  it('rechaza otra versión del cuestionario', () => {
    expect(esquema.safeParse({ version: 2, respuestas: validas }).success).toBe(false)
  })
})

describe('esquemaPedidoInforme', () => {
  const pedido = esquemaPedidoInforme(cuestionarioV1)
  const base = {
    version: 1,
    respuestas: validas,
    nombre: 'Ana',
    empresa: 'ACME',
    email: 'ana@acme.com',
    consentimiento: true,
  }

  it('acepta un pedido completo con UTM', () => {
    expect(pedido.safeParse({ ...base, utm: { source: 'linkedin' } }).success).toBe(true)
  })

  it('exige consentimiento explícito', () => {
    expect(pedido.safeParse({ ...base, consentimiento: false }).success).toBe(false)
    const { consentimiento: _c, ...sinConsentimiento } = base
    expect(pedido.safeParse(sinConsentimiento).success).toBe(false)
  })

  it.each(['', 'no-es-email', 'a@b'])('rechaza el email %j', (email) => {
    expect(pedido.safeParse({ ...base, email }).success).toBe(false)
  })

  it('rechaza nombre o empresa vacíos', () => {
    expect(pedido.safeParse({ ...base, nombre: '   ' }).success).toBe(false)
    expect(pedido.safeParse({ ...base, empresa: '' }).success).toBe(false)
  })
})
