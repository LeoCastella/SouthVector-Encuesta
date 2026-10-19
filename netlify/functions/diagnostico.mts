import type { Config } from '@netlify/functions'
import { aRespuestas, calcularDiagnostico, cuestionarioV1, esquemaRespuestas } from '../../src/domain'

const esquema = esquemaRespuestas(cuestionarioV1)

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json; charset=utf-8' } })

/**
 * POST /api/diagnostico
 * Recalcula el diagnóstico en el servidor; nunca confía en el puntaje que envía el navegador.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  let cuerpo: unknown
  try {
    cuerpo = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const parseo = esquema.safeParse(cuerpo)
  if (!parseo.success) return json({ error: 'Respuestas inválidas', detalle: parseo.error.issues }, 422)

  const diagnostico = calcularDiagnostico(cuestionarioV1, aRespuestas(parseo.data.respuestas))
  return json({ diagnostico })
}

export const config: Config = { path: '/api/diagnostico' }
