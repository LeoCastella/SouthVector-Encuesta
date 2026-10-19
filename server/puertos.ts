import type { ClaveCuadrante, Diagnostico, PedidoInforme } from '../src/domain'

/** Lead tal como se guarda en la Sheet. */
export interface Lead {
  fecha: string
  nombre: string
  empresa: string
  email: string
  diagnostico: Diagnostico
  utm?: PedidoInforme['utm']
}

export interface RepositorioLeads {
  /** Guarda el lead. `duplicado` es true si el mismo email ya pidió un informe en las últimas 24 h. */
  registrar(lead: Lead): Promise<{ duplicado: boolean }>
}

export interface EnvioEmail {
  enviarInforme(destino: { email: string; nombre: string }, pdf: Uint8Array, cuadrante: string): Promise<void>
}

export interface Avisos {
  /** Aviso interno de nuevo lead. Nunca incluye datos personales. */
  nuevoLead(cuadrante: ClaveCuadrante, fecha: string): Promise<void>
}

export interface Registro {
  error(mensaje: string, detalle?: unknown): void
}
