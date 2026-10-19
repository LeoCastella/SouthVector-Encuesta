/** Modelo de dominio del diagnóstico. Sin dependencias de UI, red ni base de datos. */

export type Eje = 'X' | 'Y'
export type Valor = 1 | 2 | 3 | 4
export type ClaveCuadrante = 'codigo-rojo' | 'intervencion-quirurgica' | 'deuda-tecnica' | 'optimizacion'
export type Semaforo = 'verde' | 'amarillo' | 'rojo'

export interface Perspectiva {
  clave: string
  nombre: string
  corto: string
}

export interface Pregunta {
  id: number
  perspectiva: string
  eje: Eje
  peso: number
  nombre: string
  descripcion: string
  /** Cuatro opciones, de la más sana (1) a la más crítica (4). */
  opciones: [string, string, string, string]
}

export interface Servicio {
  nombre: string
  descripcion: string
}

export interface Cuadrante {
  clave: ClaveCuadrante
  numero: 1 | 2 | 3 | 4
  titulo: string
  diagnostico: string
  servicioPrincipal: Servicio
  servicioComplementario?: Servicio
}

export interface VersionCuestionario {
  version: number
  /** Umbral inclusivo: un eje con puntaje >= umbral se considera "alto". */
  umbral: number
  perspectivas: Perspectiva[]
  preguntas: Pregunta[]
  cuadrantes: Record<ClaveCuadrante, Cuadrante>
}

/** Respuestas indexadas por id de pregunta. */
export type Respuestas = Record<number, Valor>

export interface ResultadoPregunta {
  preguntaId: number
  valor: Valor
  semaforo: Semaforo
}

export interface Diagnostico {
  version: number
  ejeX: number
  ejeY: number
  maximoX: number
  maximoY: number
  cuadrante: ClaveCuadrante
  detalle: ResultadoPregunta[]
}
