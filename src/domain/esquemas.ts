import { z } from 'zod'
import type { Respuestas, VersionCuestionario } from './types'

/** Esquema de validación de respuestas, compartido por el navegador y el servidor. */
export function esquemaRespuestas(cuestionario: VersionCuestionario) {
  const forma = Object.fromEntries(
    cuestionario.preguntas.map((p) => [
      String(p.id),
      z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    ]),
  )
  return z.object({
    version: z.literal(cuestionario.version),
    respuestas: z.strictObject(forma),
  })
}

export function aRespuestas(crudas: Record<string, 1 | 2 | 3 | 4>): Respuestas {
  return Object.fromEntries(Object.entries(crudas).map(([k, v]) => [Number(k), v]))
}

const texto = (max: number) => z.string().trim().min(1, 'Obligatorio').max(max)

/** Pedido del informe PDF: respuestas + contacto + consentimiento explícito (RGPD). */
export function esquemaPedidoInforme(cuestionario: VersionCuestionario) {
  return esquemaRespuestas(cuestionario).extend({
    nombre: texto(100),
    empresa: texto(150),
    email: z.email('Email inválido').max(254),
    consentimiento: z.literal(true, 'Hace falta tu consentimiento'),
    utm: z
      .object({
        source: z.string().max(100).optional(),
        medium: z.string().max(100).optional(),
        campaign: z.string().max(100).optional(),
      })
      .optional(),
    /** Campo trampa para bots: un humano nunca lo completa. */
    sitio: z.string().max(200).optional(),
  })
}

export type PedidoInforme = z.infer<ReturnType<typeof esquemaPedidoInforme>>
