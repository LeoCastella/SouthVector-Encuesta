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
