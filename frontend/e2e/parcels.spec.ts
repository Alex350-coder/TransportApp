import { expect, test } from '@playwright/test'

import { registerNewUser } from './helpers'

test.describe('Parcels flow', () => {
  test('quote → create shipment → public tracking', async ({ page }) => {
    await registerNewUser(page)

    await page.goto('/encomiendas')
    const form = page.getByRole('form', { name: 'Registrar encomienda' })
    await form.getByLabel('Origen').selectOption({ label: 'Lima' })
    await form.getByLabel('Destino').selectOption({ label: 'Cusco' })
    await form.getByLabel('Peso (kg)').fill('4.5')
    await form.getByRole('button', { name: 'Cotizar precio' }).click()
    await expect(page.getByText('Precio estimado')).toBeVisible()

    await form.getByLabel('Nombre completo').fill('Jorge Huamán')
    await form.getByLabel('DNI o documento').fill('45128799')
    await form.getByRole('button', { name: 'Registrar envío' }).click()

    await expect(page.getByRole('heading', { name: '¡Encomienda registrada!' })).toBeVisible()
    const code = (await page.getByText(/RTX-ENV-[A-Z2-9]{6}/).first().textContent())?.trim()
    expect(code).toBeTruthy()

    // Public tracking (no session required): use a fresh context-free page.
    await page.context().clearCookies()
    await page.goto(`/rastrear/${code}`)
    await expect(page.getByText(code!)).toBeVisible()
    await expect(page.getByText('Encomienda registrada en agencia RUTEX.')).toBeVisible()
  })

  test('unknown tracking code shows a friendly Spanish error', async ({ page }) => {
    await page.goto('/rastrear/RTX-ENV-ZZZZZZ')
    await expect(page.getByRole('alert')).toContainText('No encontramos un envío')
  })
})
