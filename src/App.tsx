import { useState } from 'react'
import { calcularDiagnostico, cuestionarioV1, type Diagnostico, type Respuestas } from './domain'
import { Formulario } from './ui/Formulario'
import { Resultado } from './ui/Resultado'

export function App() {
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null)

  const finalizar = (respuestas: Respuestas) => {
    setDiagnostico(calcularDiagnostico(cuestionarioV1, respuestas))
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <header className="cabecera">
        <span className="marca">South Vector</span>
        <span className="subtitulo">Diagnóstico de madurez en calidad de software</span>
      </header>
      <main className="contenido">
        {diagnostico ? (
          <Resultado cuestionario={cuestionarioV1} diagnostico={diagnostico} onReiniciar={() => setDiagnostico(null)} />
        ) : (
          <Formulario cuestionario={cuestionarioV1} onFinalizar={finalizar} />
        )}
      </main>
      <footer className="pie">© South Vector</footer>
    </>
  )
}
