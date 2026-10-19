import { useState } from 'react'
import { calcularDiagnostico, cuestionarioV1, type Diagnostico, type Respuestas } from './domain'
import { Formulario } from './ui/Formulario'
import { Privacidad } from './ui/Privacidad'
import { Resultado } from './ui/Resultado'

export function App() {
  const [resultado, setResultado] = useState<{ diagnostico: Diagnostico; respuestas: Respuestas } | null>(null)

  const finalizar = (respuestas: Respuestas) => {
    setResultado({ diagnostico: calcularDiagnostico(cuestionarioV1, respuestas), respuestas })
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <header className="cabecera">
        <span className="marca">South Vector</span>
        <span className="subtitulo">Diagnóstico de madurez en calidad de software</span>
      </header>
      <main className="contenido">
        {window.location.pathname === '/privacidad' ? (
          <Privacidad />
        ) : resultado ? (
          <Resultado cuestionario={cuestionarioV1} {...resultado} onReiniciar={() => setResultado(null)} />
        ) : (
          <Formulario cuestionario={cuestionarioV1} onFinalizar={finalizar} />
        )}
      </main>
      <footer className="pie">
        © South Vector · <a href="/privacidad">Política de privacidad</a>
      </footer>
    </>
  )
}
