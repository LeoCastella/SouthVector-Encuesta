import { cuestionarioV1, type Valor } from '../src/domain'

/** Pedido válido de ejemplo: respuesta real de la Sheet original (Deuda técnica). */
export const pedidoValido = () => ({
  version: 1,
  respuestas: Object.fromEntries(([3, 4, 3, 2, 3, 2, 2, 2, 3, 1, 2, 2] as Valor[]).map((v, i) => [String(i + 1), v])),
  nombre: 'Ana Pérez',
  empresa: 'ACME Ñandú',
  email: 'ana@acme.com',
  consentimiento: true,
  utm: { source: 'linkedin' },
})

export { cuestionarioV1 }
