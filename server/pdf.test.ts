import { PDFDocument, StandardFonts } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { aRespuestas, calcularDiagnostico } from '../src/domain'
import { aWinAnsi, generarInformePdf, partirEnLineas } from './pdf'
import { cuestionarioV1, pedidoValido } from './prueba-utils'

describe('aWinAnsi', () => {
  it('conserva acentos, eñes y signos del castellano', () => {
    expect(aWinAnsi('¿Señal crítica? ¡Sí! — 10–20%')).toBe('¿Señal crítica? ¡Sí! — 10–20%')
  })
  it('quita emojis y flechas que la fuente no puede dibujar', () => {
    expect(aWinAnsi('🔴 Código rojo → ya')).toBe('Código rojo ya')
  })
})

describe('partirEnLineas', () => {
  it('ninguna línea supera el ancho disponible', async () => {
    const fuente = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica)
    const lineas = partirEnLineas(cuestionarioV1.cuadrantes['codigo-rojo'].diagnostico, fuente, 10, 200)
    expect(lineas.length).toBeGreaterThan(1)
    for (const l of lineas) expect(fuente.widthOfTextAtSize(l, 10)).toBeLessThanOrEqual(200)
  })
})

describe('generarInformePdf', () => {
  it.each(['optimizacion', 'codigo-rojo'] as const)('genera un PDF válido para %s', async (esperado) => {
    const valor = esperado === 'codigo-rojo' ? 4 : 1
    const respuestas = aRespuestas(Object.fromEntries(cuestionarioV1.preguntas.map((p) => [String(p.id), valor])))
    const diagnostico = calcularDiagnostico(cuestionarioV1, respuestas)
    expect(diagnostico.cuadrante).toBe(esperado)
    const { nombre, empresa, email } = pedidoValido()
    const bytes = await generarInformePdf(cuestionarioV1, {
      fecha: '2026-10-19T12:00:00Z',
      nombre,
      empresa,
      email,
      diagnostico,
    })

    const doc = await PDFDocument.load(bytes)
    expect(doc.getTitle()).toBe('Diagnóstico de madurez en calidad de software')
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1)
  })
})
