import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Respuestas } from '../domain'
import { PedidoInforme } from './PedidoInforme'

const respuestas = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 2])) as Respuestas

async function completar(conConsentimiento = true) {
  const usuario = userEvent.setup()
  await usuario.type(screen.getByLabelText('Nombre'), 'Ana')
  await usuario.type(screen.getByLabelText('Empresa'), 'ACME')
  await usuario.type(screen.getByLabelText('Email'), 'ana@acme.com')
  if (conConsentimiento) await usuario.click(screen.getByRole('checkbox'))
  await usuario.click(screen.getByRole('button', { name: 'Enviarme el informe' }))
}

afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('PedidoInforme', () => {
  it('envía respuestas, contacto, consentimiento y UTM', async () => {
    window.history.replaceState(null, '', '/?utm_source=linkedin&utm_campaign=otono')
    const fetchFalso = vi.fn(async (..._args: unknown[]) => new Response('{"ok":true}', { status: 200 }))
    vi.stubGlobal('fetch', fetchFalso)
    render(<PedidoInforme version={1} respuestas={respuestas} />)
    await completar()

    expect(await screen.findByText(/Te enviamos el informe completo por email/)).toBeInTheDocument()
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/informe')
    expect(JSON.parse(init.body as string)).toEqual({
      version: 1,
      respuestas: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [String(i + 1), 2])),
      nombre: 'Ana',
      empresa: 'ACME',
      email: 'ana@acme.com',
      consentimiento: true,
      utm: { source: 'linkedin', campaign: 'otono' },
    })
  })

  it('no envía sin consentimiento', async () => {
    const fetchFalso = vi.fn()
    vi.stubGlobal('fetch', fetchFalso)
    render(<PedidoInforme version={1} respuestas={respuestas} />)
    await completar(false)
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('muestra el error que devuelve el servidor', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"error":"No pudimos enviar el informe."}', { status: 502 })),
    )
    render(<PedidoInforme version={1} respuestas={respuestas} />)
    await completar()
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos enviar el informe.')
  })

  it('avisa si no hay conexión', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('offline'))),
    )
    render(<PedidoInforme version={1} respuestas={respuestas} />)
    await completar()
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión')
  })
})
