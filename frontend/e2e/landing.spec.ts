import { expect, test } from '@playwright/test'

test.describe('Landing', () => {
  test('shows the hero and the search widget', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Conecta')
    await expect(page.getByRole('form', { name: 'Buscar viajes' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reservar asiento' })).toBeVisible()
  })

  test('search widget navigates to /reservar with params', async ({ page }) => {
    await page.goto('/')

    const form = page.getByRole('form', { name: 'Buscar viajes' })
    await form.getByLabel('Origen').selectOption({ label: 'Lima' })
    await form.getByLabel('Destino').selectOption({ label: 'Arequipa' })
    await form.getByRole('button', { name: 'Buscar viajes' }).click()

    await page.waitForURL('**/reservar?*')
    expect(page.url()).toContain('origin=')
    expect(page.url()).toContain('destination=')
  })
})
