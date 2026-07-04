import { expect, test } from '@playwright/test'

import { isoDateFromToday, registerNewUser } from './helpers'

test.describe('Booking flow', () => {
  test('register → search → pick seats → passenger data → ticket', async ({ page }) => {
    await registerNewUser(page)

    await page.goto('/reservar')
    const searchForm = page.getByRole('form', { name: 'Buscar viajes' })
    await searchForm.getByLabel('Origen').selectOption({ label: 'Lima' })
    await searchForm.getByLabel('Destino').selectOption({ label: 'Arequipa' })
    await searchForm.getByLabel('Fecha de viaje').fill(isoDateFromToday(2))
    await searchForm.getByRole('button', { name: 'Buscar viajes' }).click()

    await page.getByRole('button', { name: 'Elegir asientos' }).first().click()

    // Pick the first two free seats on the map.
    const freeSeats = page.getByRole('button', { name: /Asiento \d+, libre/ })
    await freeSeats.first().click()
    await freeSeats.first().click()
    await page.getByRole('button', { name: 'Continuar' }).click()

    // Passenger data, one fieldset per seat.
    const nameInputs = page.getByLabel('Nombre completo')
    const documentInputs = page.getByLabel('DNI o documento')
    await nameInputs.nth(0).fill('Ana Torres Ríos')
    await documentInputs.nth(0).fill('45128799')
    await nameInputs.nth(1).fill('Luis Quispe Mamani')
    await documentInputs.nth(1).fill('41887702')
    await page.getByRole('button', { name: 'Confirmar y pagar (simulado)' }).click()

    await page.waitForURL('**/reservar/confirmacion/**')
    await expect(page.getByRole('heading', { name: '¡Reserva confirmada!' })).toBeVisible()
    await expect(page.getByText(/RTX-[A-Z2-9]{6}/)).toBeVisible()
    await expect(page.getByText('Ana Torres Ríos — asiento', { exact: false })).toBeVisible()
  })
})
