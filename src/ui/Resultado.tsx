import type { Diagnostico, Semaforo, VersionCuestionario } from '../domain'
import { Matriz } from './Matriz'

interface Props {
  cuestionario: VersionCuestionario
  diagnostico: Diagnostico
  onReiniciar: () => void
}

const etiquetaSemaforo: Record<Semaforo, string> = { verde: 'Óptimo', amarillo: 'Precaución', rojo: 'Crítico' }

export function Resultado({ cuestionario, diagnostico, onReiniciar }: Props) {
  const cuadrante = cuestionario.cuadrantes[diagnostico.cuadrante]
  const pregunta = (id: number) => cuestionario.preguntas.find((p) => p.id === id)!

  return (
    <article className="resultado" aria-labelledby="titulo-resultado">
      <p className="antetitulo">Cuadrante {cuadrante.numero}</p>
      <h1 id="titulo-resultado" className={`cuadrante cuadrante-${cuadrante.clave}`}>
        {cuadrante.titulo}
      </h1>
      <p>{cuadrante.diagnostico}</p>

      <Matriz diagnostico={diagnostico} umbral={cuestionario.umbral} />

      <section className="servicios">
        <h2>Lo que recomendamos</h2>
        <div className="servicio">
          <h3>{cuadrante.servicioPrincipal.nombre}</h3>
          <p>{cuadrante.servicioPrincipal.descripcion}</p>
        </div>
        {cuadrante.servicioComplementario && (
          <div className="servicio complementario">
            <h3>{cuadrante.servicioComplementario.nombre}</h3>
            <p>{cuadrante.servicioComplementario.descripcion}</p>
          </div>
        )}
      </section>

      <section>
        <h2>Detalle por indicador</h2>
        {cuestionario.perspectivas.map((perspectiva) => (
          <div key={perspectiva.clave} className="tablero-grupo">
            <h3>{perspectiva.corto}</h3>
            <ul className="tablero">
              {diagnostico.detalle
                .filter((r) => pregunta(r.preguntaId).perspectiva === perspectiva.clave)
                .map((r) => (
                  <li key={r.preguntaId}>
                    <span className="tablero-kpi">{pregunta(r.preguntaId).nombre}</span>
                    <span className={`semaforo semaforo-${r.semaforo}`}>{etiquetaSemaforo[r.semaforo]}</span>
                    <span className="tablero-valor">{pregunta(r.preguntaId).opciones[r.valor - 1]}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      <button type="button" className="secundario" onClick={onReiniciar}>
        Volver a empezar
      </button>
    </article>
  )
}
