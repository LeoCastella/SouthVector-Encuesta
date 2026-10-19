import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('muestra el resultado sin pedir datos personales', async () => {
    const usuario = userEvent.setup()
    render(<App />)
    const boton = screen.getByRole('button', { name: 'Ver mi diagnóstico' })
    expect(boton).toBeDisabled()

    // Respuesta real de la Sheet original: X=17, Y=12 → Deuda técnica operativa.
    const valores = [3, 4, 3, 2, 3, 2, 2, 2, 3, 1, 2, 2]
    for (const [i, valor] of valores.entries()) {
      const radios = document.querySelectorAll<HTMLInputElement>(`input[name="pregunta-${i + 1}"]`)
      await usuario.click(radios[valor - 1])
    }

    expect(boton).toBeEnabled()
    await usuario.click(boton)

    expect(screen.getByRole('heading', { level: 1, name: 'Deuda técnica operativa' })).toBeInTheDocument()
    expect(screen.getByText('Frecuencia 17/24 · Impacto 12/24')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Quality Engineering' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
