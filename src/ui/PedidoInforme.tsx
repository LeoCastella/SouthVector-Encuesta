import { useState, type FormEvent } from 'react'
import type { Respuestas } from '../domain'

interface Props {
  version: number
  respuestas: Respuestas
}

type Estado = { tipo: 'editando' } | { tipo: 'enviando' } | { tipo: 'enviado' } | { tipo: 'error'; mensaje: string }

/** Lee los parámetros UTM de la URL para registrar el origen del lead. */
function leerUtm() {
  const p = new URLSearchParams(window.location.search)
  const utm = {
    source: p.get('utm_source') ?? undefined,
    medium: p.get('utm_medium') ?? undefined,
    campaign: p.get('utm_campaign') ?? undefined,
  }
  return Object.values(utm).some(Boolean) ? utm : undefined
}

export function PedidoInforme({ version, respuestas }: Props) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'editando' })

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const datos = new FormData(e.currentTarget)
    setEstado({ tipo: 'enviando' })
    try {
      const res = await fetch('/api/informe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          version,
          respuestas,
          nombre: datos.get('nombre'),
          empresa: datos.get('empresa'),
          email: datos.get('email'),
          consentimiento: datos.get('consentimiento') === 'si',
          sitio: datos.get('sitio') || undefined,
          utm: leerUtm(),
        }),
      })
      if (res.ok) return setEstado({ tipo: 'enviado' })
      const cuerpo = (await res.json().catch(() => ({}))) as { error?: string; problemas?: { mensaje: string }[] }
      const detalle = cuerpo.problemas?.map((p) => p.mensaje).join('. ')
      setEstado({ tipo: 'error', mensaje: detalle || cuerpo.error || 'No pudimos enviar el pedido.' })
    } catch {
      setEstado({ tipo: 'error', mensaje: 'Sin conexión. Probá de nuevo.' })
    }
  }

  if (estado.tipo === 'enviado') {
    return (
      <section className="pedido" aria-live="polite">
        <h2>¡Listo!</h2>
        <p>Te enviamos el informe completo por email. Si no lo ves en unos minutos, revisá la carpeta de spam.</p>
      </section>
    )
  }

  return (
    <section className="pedido" aria-labelledby="titulo-pedido">
      <h2 id="titulo-pedido">Recibí el informe completo en PDF</h2>
      <p>Con el detalle de cada indicador y los próximos pasos recomendados para tu empresa.</p>
      <form onSubmit={enviar}>
        <label>
          Nombre
          <input name="nombre" required maxLength={100} autoComplete="name" />
        </label>
        <label>
          Empresa
          <input name="empresa" required maxLength={150} autoComplete="organization" />
        </label>
        <label>
          Email
          <input name="email" type="email" required maxLength={254} autoComplete="email" />
        </label>
        <label className="trampa" aria-hidden="true">
          Sitio web
          <input name="sitio" tabIndex={-1} autoComplete="off" />
        </label>
        <label className="consentimiento">
          <input name="consentimiento" type="checkbox" value="si" required />
          <span>
            Acepto que South Vector trate mis datos para enviarme el informe y contactarme sobre él, según la{' '}
            <a href="/privacidad" target="_blank" rel="noopener">
              política de privacidad
            </a>
            .
          </span>
        </label>
        <button type="submit" disabled={estado.tipo === 'enviando'}>
          {estado.tipo === 'enviando' ? 'Enviando…' : 'Enviarme el informe'}
        </button>
        {estado.tipo === 'error' && (
          <p className="error" role="alert">
            {estado.mensaje}
          </p>
        )}
      </form>
    </section>
  )
}
