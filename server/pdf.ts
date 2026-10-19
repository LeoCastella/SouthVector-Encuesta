import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib'
import type { Semaforo, VersionCuestionario } from '../src/domain'
import type { Lead } from './puertos'

const ANCHO = 595.28 // A4
const ALTO = 841.89
const MARGEN = 50
const UTIL = ANCHO - MARGEN * 2

const COLOR = {
  texto: rgb(0.1, 0.12, 0.18),
  tenue: rgb(0.42, 0.45, 0.52),
  marca: rgb(0.17, 0.48, 0.43),
  linea: rgb(0.85, 0.87, 0.9),
}
const COLOR_SEMAFORO: Record<Semaforo, ReturnType<typeof rgb>> = {
  verde: rgb(0.13, 0.77, 0.37),
  amarillo: rgb(0.96, 0.7, 0),
  rojo: rgb(0.94, 0.27, 0.27),
}
const ETIQUETA_SEMAFORO: Record<Semaforo, string> = { verde: 'Óptimo', amarillo: 'Precaución', rojo: 'Crítico' }

/** Caracteres fuera de Latin-1 que las fuentes estándar del PDF (WinAnsi) sí pueden dibujar. */
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ')

/** Quita lo que la fuente estándar no puede dibujar (emojis, flechas, etc.). */
export function aWinAnsi(texto: string): string {
  return [...texto]
    .filter((c) => (c.charCodeAt(0) <= 0xff && c !== '­') || WIN_ANSI_EXTRA.has(c))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

export function partirEnLineas(texto: string, fuente: PDFFont, tamano: number, ancho: number): string[] {
  const lineas: string[] = []
  let actual = ''
  for (const palabra of aWinAnsi(texto).split(' ')) {
    const prueba = actual ? `${actual} ${palabra}` : palabra
    if (actual && fuente.widthOfTextAtSize(prueba, tamano) > ancho) {
      lineas.push(actual)
      actual = palabra
    } else {
      actual = prueba
    }
  }
  if (actual) lineas.push(actual)
  return lineas
}

/** Genera el informe PDF del diagnóstico. */
export async function generarInformePdf(cuestionario: VersionCuestionario, lead: Lead): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle('Diagnóstico de madurez en calidad de software')
  doc.setAuthor('South Vector')
  const normal = await doc.embedFont(StandardFonts.Helvetica)
  const negrita = await doc.embedFont(StandardFonts.HelveticaBold)

  let pagina: PDFPage = doc.addPage([ANCHO, ALTO])
  let y = ALTO - MARGEN

  const asegurarEspacio = (alto: number) => {
    if (y - alto < MARGEN) {
      pagina = doc.addPage([ANCHO, ALTO])
      y = ALTO - MARGEN
    }
  }
  const parrafo = (
    texto: string,
    opciones: { fuente?: PDFFont; tamano?: number; color?: ReturnType<typeof rgb>; x?: number } = {},
  ) => {
    const { fuente = normal, tamano = 10.5, color = COLOR.texto, x = MARGEN } = opciones
    for (const linea of partirEnLineas(texto, fuente, tamano, UTIL - (x - MARGEN))) {
      asegurarEspacio(tamano * 1.5)
      pagina.drawText(linea, { x, y: y - tamano, size: tamano, font: fuente, color })
      y -= tamano * 1.5
    }
  }
  const espacio = (alto: number) => (y -= alto)

  const { diagnostico } = lead
  const cuadrante = cuestionario.cuadrantes[diagnostico.cuadrante]

  parrafo('SOUTH VECTOR', { fuente: negrita, tamano: 11, color: COLOR.marca })
  parrafo('Diagnóstico de madurez en calidad de software', { tamano: 18, fuente: negrita })
  parrafo(`Preparado para ${lead.nombre} · ${lead.empresa} · ${lead.fecha.slice(0, 10)}`, { color: COLOR.tenue })
  espacio(16)

  parrafo(`Cuadrante ${cuadrante.numero}`, { color: COLOR.tenue, tamano: 9.5 })
  parrafo(cuadrante.titulo, { fuente: negrita, tamano: 16 })
  parrafo(cuadrante.diagnostico)
  espacio(6)
  parrafo(
    `Frecuencia de fallos: ${diagnostico.ejeX} de ${diagnostico.maximoX}   ·   Impacto en el negocio: ${diagnostico.ejeY} de ${diagnostico.maximoY}   ·   Umbral: ${cuestionario.umbral}`,
    { fuente: negrita, tamano: 10 },
  )
  espacio(14)

  parrafo('Lo que recomendamos', { fuente: negrita, tamano: 13 })
  parrafo(cuadrante.servicioPrincipal.nombre, { fuente: negrita })
  parrafo(cuadrante.servicioPrincipal.descripcion)
  if (cuadrante.servicioComplementario) {
    espacio(4)
    parrafo(`Complementario: ${cuadrante.servicioComplementario.nombre}`, { fuente: negrita })
    parrafo(cuadrante.servicioComplementario.descripcion)
  }
  espacio(14)

  parrafo('Detalle por indicador', { fuente: negrita, tamano: 13 })
  for (const perspectiva of cuestionario.perspectivas) {
    espacio(4)
    parrafo(perspectiva.nombre, { fuente: negrita, color: COLOR.marca, tamano: 10 })
    for (const r of diagnostico.detalle) {
      const pregunta = cuestionario.preguntas.find((p) => p.id === r.preguntaId)!
      if (pregunta.perspectiva !== perspectiva.clave) continue
      asegurarEspacio(40)
      pagina.drawCircle({ x: MARGEN + 4, y: y - 6, size: 4, color: COLOR_SEMAFORO[r.semaforo] })
      parrafo(`${pregunta.id}. ${pregunta.nombre} — ${ETIQUETA_SEMAFORO[r.semaforo]}`, {
        fuente: negrita,
        tamano: 10,
        x: MARGEN + 14,
      })
      parrafo(pregunta.opciones[r.valor - 1], { tamano: 9.5, color: COLOR.tenue, x: MARGEN + 14 })
    }
  }

  espacio(18)
  asegurarEspacio(30)
  pagina.drawLine({ start: { x: MARGEN, y }, end: { x: ANCHO - MARGEN, y }, thickness: 0.5, color: COLOR.linea })
  espacio(8)
  parrafo('¿Querés conversar sobre este resultado? Respondé este email y te contactamos.', {
    tamano: 9.5,
    color: COLOR.tenue,
  })

  return doc.save()
}
