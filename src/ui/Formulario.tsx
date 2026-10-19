import { useState, type FormEvent } from 'react'
import type { Respuestas, Valor, VersionCuestionario } from '../domain'

interface Props {
  cuestionario: VersionCuestionario
  onFinalizar: (respuestas: Respuestas) => void
}

export function Formulario({ cuestionario, onFinalizar }: Props) {
  const [respuestas, setRespuestas] = useState<Partial<Respuestas>>({})
  const total = cuestionario.preguntas.length
  const respondidas = Object.keys(respuestas).length
  const completo = respondidas === total

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (completo) onFinalizar(respuestas as Respuestas)
  }

  return (
    <form onSubmit={enviar} aria-describedby="intro">
      <section className="intro" id="intro">
        <h1>¿Qué tan madura es la calidad de su software?</h1>
        <p>
          Responda 12 preguntas sobre su equipo, su operación, sus clientes y sus finanzas. Verá el resultado al
          instante, sin dejar sus datos.
        </p>
      </section>

      <div
        className="progreso"
        role="progressbar"
        aria-label="Preguntas respondidas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={respondidas}
      >
        <div className="progreso-barra" style={{ width: `${(respondidas / total) * 100}%` }} />
        <span className="progreso-texto">
          {respondidas} de {total}
        </span>
      </div>

      {cuestionario.perspectivas.map((perspectiva) => (
        <section key={perspectiva.clave} className={`bloque bloque-${perspectiva.clave}`}>
          <h2>{perspectiva.nombre}</h2>
          {cuestionario.preguntas
            .filter((p) => p.perspectiva === perspectiva.clave)
            .map((p) => (
              <fieldset key={p.id} className="pregunta">
                <legend>
                  {p.id}. {p.nombre}
                </legend>
                <p className="pregunta-desc">{p.descripcion}</p>
                {p.opciones.map((opcion, i) => {
                  const valor = (i + 1) as Valor
                  return (
                    <label key={valor} className="opcion">
                      <input
                        type="radio"
                        name={`pregunta-${p.id}`}
                        value={valor}
                        checked={respuestas[p.id] === valor}
                        onChange={() => setRespuestas((r) => ({ ...r, [p.id]: valor }))}
                      />
                      <span>{opcion}</span>
                    </label>
                  )
                })}
              </fieldset>
            ))}
        </section>
      ))}

      <div className="acciones">
        <button type="submit" disabled={!completo}>
          Ver mi diagnóstico
        </button>
        <p className="pista" aria-live="polite">
          {completo ? 'Todo listo.' : `Faltan ${total - respondidas} preguntas.`}
        </p>
      </div>
    </form>
  )
}
