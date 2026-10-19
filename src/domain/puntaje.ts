import type { ClaveCuadrante, Diagnostico, Respuestas, Semaforo, Valor, VersionCuestionario } from './types'

export class RespuestasIncompletasError extends Error {
  readonly faltantes: number[]

  constructor(faltantes: number[]) {
    super(`Faltan respuestas para las preguntas: ${faltantes.join(', ')}`)
    this.name = 'RespuestasIncompletasError'
    this.faltantes = faltantes
  }
}

/** Semáforo por pregunta: 1 óptimo, 2–3 precaución, 4 crítico. */
export function semaforoDe(valor: Valor): Semaforo {
  if (valor === 1) return 'verde'
  if (valor === 4) return 'rojo'
  return 'amarillo'
}

/**
 * Ubica los puntajes en la matriz 2x2.
 * X = frecuencia de fallos / fricción operativa, Y = impacto en el negocio.
 */
export function cuadranteDe(ejeX: number, ejeY: number, umbral: number): ClaveCuadrante {
  const xAlto = ejeX >= umbral
  const yAlto = ejeY >= umbral
  if (xAlto && yAlto) return 'codigo-rojo'
  if (yAlto) return 'intervencion-quirurgica'
  if (xAlto) return 'deuda-tecnica'
  return 'optimizacion'
}

/** Calcula el diagnóstico completo. Función pura: mismo input, mismo output. */
export function calcularDiagnostico(cuestionario: VersionCuestionario, respuestas: Respuestas): Diagnostico {
  const faltantes = cuestionario.preguntas.filter((p) => respuestas[p.id] === undefined).map((p) => p.id)
  if (faltantes.length > 0) throw new RespuestasIncompletasError(faltantes)

  let ejeX = 0
  let ejeY = 0
  let maximoX = 0
  let maximoY = 0
  const detalle = cuestionario.preguntas.map((p) => {
    const valor = respuestas[p.id]
    if (p.eje === 'X') {
      ejeX += valor * p.peso
      maximoX += 4 * p.peso
    } else {
      ejeY += valor * p.peso
      maximoY += 4 * p.peso
    }
    return { preguntaId: p.id, valor, semaforo: semaforoDe(valor) }
  })

  return {
    version: cuestionario.version,
    ejeX,
    ejeY,
    maximoX,
    maximoY,
    cuadrante: cuadranteDe(ejeX, ejeY, cuestionario.umbral),
    detalle,
  }
}
