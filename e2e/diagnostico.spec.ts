import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('flujo completo: 12 respuestas → Código rojo, sin violaciones de accesibilidad', async ({ page }) => {
  await page.goto('/')
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])

  for (let id = 1; id <= 12; id++) {
    await page.locator(`input[name="pregunta-${id}"]`).nth(3).check()
  }
  await page.getByRole('button', { name: 'Ver mi diagnóstico' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Código rojo (caos total)')
  await expect(page.getByText('Frecuencia 24/24 · Impacto 24/24')).toBeVisible()
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
})
