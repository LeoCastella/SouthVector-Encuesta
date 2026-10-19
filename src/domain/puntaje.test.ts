import { describe, expect, it } from 'vitest'
import { cuestionarioV1 } from './cuestionario-v1'
import { calcularDiagnostico, cuadranteDe, RespuestasIncompletasError, semaforoDe } from './puntaje'
import type { Respuestas, Valor } from './types'

const todas = (valor: Valor): Respuestas => Object.fromEntries(cuestionarioV1.preguntas.map((p) => [p.id, valor]))

/** Construye respuestas en el orden KPI 1..12. */
const enOrden = (...valores: Valor[]): Respuestas => Object.fromEntries(valores.map((v, i) => [i + 1, v]))

describe('cuestionario v1', () => {
  it('tiene 12 preguntas con 4 opciones y peso 1', () => {
    expect(cuestionarioV1.preguntas).toHaveLength(12)
    for (const p of cuestionarioV1.preguntas) {
      expect(p.opciones).toHaveLength(4)
      expect(p.peso).toBe(1)
    }
  })

  it('reparte 6 preguntas por eje como la web original', () => {
    const ids = (eje: 'X' | 'Y') => cuestionarioV1.preguntas.filter((p) => p.eje === eje).map((p) => p.id)
    expect(ids('X')).toEqual([1, 2, 4, 5, 6, 9])
    expect(ids('Y')).toEqual([3, 7, 8, 10, 11, 12])
  })

  it('ofrece Quality Engineering como complementario solo en Código rojo y Deuda técnica', () => {
    const conQE = Object.values(cuestionarioV1.cuadrantes)
      .filter((c) => c.servicioComplementario?.nombre === 'Quality Engineering')
      .map((c) => c.clave)
    expect(conQE).toEqual(['codigo-rojo', 'deuda-tecnica'])
  })
})

describe('semaforoDe', () => {
  it.each([
    [1, 'verde'],
    [2, 'amarillo'],
    [3, 'amarillo'],
    [4, 'rojo'],
  ] as const)('%i → %s', (valor, esperado) => {
    expect(semaforoDe(valor)).toBe(esperado)
  })
})

describe('cuadranteDe (umbral 15, inclusivo)', () => {
  it.each([
    [15, 15, 'codigo-rojo'],
    [24, 24, 'codigo-rojo'],
    [14, 15, 'intervencion-quirurgica'],
    [15, 14, 'deuda-tecnica'],
    [14, 14, 'optimizacion'],
    [6, 6, 'optimizacion'],
  ] as const)('X=%i, Y=%i → %s', (x, y, esperado) => {
    expect(cuadranteDe(x, y, 15)).toBe(esperado)
  })
})

describe('calcularDiagnostico', () => {
  it('todo en 1 da el mínimo (6/6) y Zona de optimización', () => {
    const d = calcularDiagnostico(cuestionarioV1, todas(1))
    expect(d).toMatchObject({ ejeX: 6, ejeY: 6, maximoX: 24, maximoY: 24, cuadrante: 'optimizacion' })
    expect(d.detalle.every((r) => r.semaforo === 'verde')).toBe(true)
  })

  it('todo en 4 da el máximo (24/24) y Código rojo', () => {
    const d = calcularDiagnostico(cuestionarioV1, todas(4))
    expect(d).toMatchObject({ ejeX: 24, ejeY: 24, cuadrante: 'codigo-rojo' })
  })

  it('reproduce una respuesta real de la Sheet original (X=17, Y=12, Deuda técnica)', () => {
    const d = calcularDiagnostico(cuestionarioV1, enOrden(3, 4, 3, 2, 3, 2, 2, 2, 3, 1, 2, 2))
    expect(d).toMatchObject({ ejeX: 17, ejeY: 12, cuadrante: 'deuda-tecnica' })
  })

  it('caso Intervención quirúrgica: operación sana, impacto alto', () => {
    const d = calcularDiagnostico(cuestionarioV1, enOrden(1, 1, 4, 1, 1, 1, 4, 4, 1, 4, 4, 4))
    expect(d).toMatchObject({ ejeX: 6, ejeY: 24, cuadrante: 'intervencion-quirurgica' })
  })

  it('aplica los pesos de cada pregunta', () => {
    const conPeso = {
      ...cuestionarioV1,
      preguntas: cuestionarioV1.preguntas.map((p) => (p.id === 1 ? { ...p, peso: 2 } : p)),
    }
    const d = calcularDiagnostico(conPeso, todas(2))
    expect(d.ejeX).toBe(14)
    expect(d.maximoX).toBe(28)
  })

  it('rechaza respuestas incompletas indicando cuáles faltan', () => {
    const incompletas = todas(2)
    delete incompletas[5]
    delete incompletas[11]
    expect(() => calcularDiagnostico(cuestionarioV1, incompletas)).toThrow(RespuestasIncompletasError)
    try {
      calcularDiagnostico(cuestionarioV1, incompletas)
    } catch (e) {
      expect((e as RespuestasIncompletasError).faltantes).toEqual([5, 11])
    }
  })
})
