import type { Diagnostico } from '../domain'

interface Props {
  diagnostico: Diagnostico
  umbral: number
}

const TAM = 240
const MARGEN = 40

/** Matriz 2x2 con la posición del diagnóstico. X = frecuencia de fallos, Y = impacto en el negocio. */
export function Matriz({ diagnostico, umbral }: Props) {
  const { ejeX, ejeY, maximoX, maximoY } = diagnostico
  const minX = maximoX / 4
  const minY = maximoY / 4
  const escalaX = (v: number) => MARGEN + ((v - minX) / (maximoX - minX)) * TAM
  const escalaY = (v: number) => MARGEN + TAM - ((v - minY) / (maximoY - minY)) * TAM
  const corteX = escalaX(umbral - 0.5)
  const corteY = escalaY(umbral - 0.5)

  return (
    <figure className="matriz">
      <svg
        viewBox={`0 0 ${TAM + MARGEN * 2} ${TAM + MARGEN * 2}`}
        role="img"
        aria-label={`Frecuencia de fallos ${ejeX} de ${maximoX}, impacto en el negocio ${ejeY} de ${maximoY}`}
      >
        <rect
          x={MARGEN}
          y={MARGEN}
          width={corteX - MARGEN}
          height={corteY - MARGEN}
          className="zona zona-intervencion-quirurgica"
        />
        <rect
          x={corteX}
          y={MARGEN}
          width={MARGEN + TAM - corteX}
          height={corteY - MARGEN}
          className="zona zona-codigo-rojo"
        />
        <rect
          x={MARGEN}
          y={corteY}
          width={corteX - MARGEN}
          height={MARGEN + TAM - corteY}
          className="zona zona-optimizacion"
        />
        <rect
          x={corteX}
          y={corteY}
          width={MARGEN + TAM - corteX}
          height={MARGEN + TAM - corteY}
          className="zona zona-deuda-tecnica"
        />
        <circle cx={escalaX(ejeX)} cy={escalaY(ejeY)} r={9} className="punto" />
        <text x={MARGEN + TAM / 2} y={MARGEN + TAM + 28} textAnchor="middle" className="eje">
          Frecuencia de fallos →
        </text>
        <text
          x={14}
          y={MARGEN + TAM / 2}
          textAnchor="middle"
          className="eje"
          transform={`rotate(-90 14 ${MARGEN + TAM / 2})`}
        >
          Impacto en el negocio →
        </text>
      </svg>
      <figcaption>
        Frecuencia {ejeX}/{maximoX} · Impacto {ejeY}/{maximoY}
      </figcaption>
    </figure>
  )
}
