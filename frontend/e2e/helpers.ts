import type { Page } from '@playwright/test'

/** Registers a fresh account and leaves the session logged in. */
export async function registerNewUser(page: Page): Promise<string> {
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 10_000)}@example.com`
  await page.goto('/registrarse')
  const form = page.getByRole('form', { name: 'Crear cuenta' })
  await form.getByLabel('Nombres').fill('Prueba')
  await form.getByLabel('Apellidos').fill('E2E Runner')
  await form.getByLabel('Correo electrónico').fill(email)
  await form.getByLabel('Contraseña', { exact: true }).fill('S3guro-y-largo!')
  await form.getByLabel('Repite la contraseña').fill('S3guro-y-largo!')
  await form.getByRole('button', { name: 'Crear cuenta' }).click()
  await page.waitForURL('**/mi-cuenta')
  return email
}

/** Local date N days from now, formatted for <input type="date">. */
export function isoDateFromToday(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10)
}
