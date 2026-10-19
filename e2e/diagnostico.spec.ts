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

test('pedido de informe: exige consentimiento y confirma el envío', async ({ page }) => {
  await page.route('/api/informe', (ruta) => ruta.fulfill({ json: { ok: true } }))
  await page.goto('/?utm_source=linkedin')
  for (let id = 1; id <= 12; id++) await page.locator(`input[name="pregunta-${id}"]`).first().check()
  await page.getByRole('button', { name: 'Ver mi diagnóstico' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Zona de optimización')

  await page.getByLabel('Nombre').fill('Ana')
  await page.getByLabel('Empresa').fill('ACME')
  await page.getByLabel('Email').fill('ana@acme.com')
  const pedido = page.waitForRequest('/api/informe')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Enviarme el informe' }).click()
  expect((await pedido).postDataJSON()).toMatchObject({ consentimiento: true, utm: { source: 'linkedin' } })
  await expect(page.getByText(/Te enviamos el informe completo/)).toBeVisible()
})

test('política de privacidad accesible', async ({ page }) => {
  await page.goto('/privacidad')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de privacidad')
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
})
