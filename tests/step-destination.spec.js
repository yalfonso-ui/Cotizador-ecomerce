import { test, expect } from '@playwright/test'

test.describe('StepDestination — selección múltiple de destinos', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.localStorage.setItem('lemonade_tour_seen', '1')
    })
    await page.goto('/')

    await page.getByRole('button', { name: /Inicia aquí tu compra/i }).click()

    await page.waitForSelector('button:has-text("Sigue con tu destino")', { timeout: 10000 })
    await page.click('button:has-text("Sigue con tu destino")')

    await expect(page.locator('[data-destination-root]')).toBeVisible({ timeout: 5000 })
  })

  test('1. El dropdown se abre al hacer clic en el input principal', async ({ page }) => {
    const root = page.locator('[data-destination-root]')

    await expect(root.locator('input[placeholder="Busca tu primer destino"]')).toBeVisible()
    await expect(root.locator('input[placeholder="Escribe el país o región que buscas"]')).toHaveCount(0)

    await root.getByTestId('destination-trigger').click()

    await expect(root.locator('input[placeholder="Escribe el país o región que buscas"]')).toBeVisible()
    await expect(root.getByText(/Destinos principales/i)).toBeVisible()

    await expect(root.getByRole('button', { name: /España/ })).toBeVisible()

    await root.getByRole('button', { name: /España/ }).first().click()

    await expect(root.getByRole('button', { name: 'Hecho' })).toBeVisible()
  })

  test('2. Al escribir en el buscador se filtran los países', async ({ page }) => {
    const root = page.locator('[data-destination-root]')

    await root.getByTestId('destination-trigger').click()
    const searchInput = root.locator('input[placeholder="Escribe el país o región que buscas"]')

    await searchInput.fill('alema')

    await expect(root.getByRole('button', { name: /Alemania/ })).toBeVisible()
    await expect(root.getByRole('button', { name: /Francia/ })).toHaveCount(0)

    await expect(root.getByText(/1 resultado$/i)).toBeVisible()

    await searchInput.fill('zzz')

    await expect(root.getByText(/No encontramos resultados para "zzz"/)).toBeVisible()

    await searchInput.fill('')

    await expect(root.getByText(/Destinos principales/i)).toBeVisible()
    await expect(root.getByRole('button', { name: /España/ })).toBeVisible()
  })

  test('3. Seleccionar múltiples países muestra etiquetas; "Hecho" cierra y actualiza el input principal', async ({ page }) => {
    const root = page.locator('[data-destination-root]')

    await root.getByTestId('destination-trigger').click()

    const searchInput = root.locator('input[placeholder="Escribe el país o región que buscas"]')
    await searchInput.fill('e')
    await root.getByRole('button', { name: /España/ }).first().click()

    await searchInput.fill('')
    await root.getByRole('button', { name: /Estados Unidos/ }).first().click()

    await searchInput.fill('f')
    await root.getByRole('button', { name: /Francia/ }).first().click()

    await expect(root.getByText('España', { exact: true }).first()).toBeVisible()
    await expect(root.getByText('Francia', { exact: true }).first()).toBeVisible()
    await expect(root.getByText('Estados Unidos', { exact: true }).first()).toBeVisible()

    await expect(root.locator('input[placeholder="Añade otra parada a tu viaje"]')).toBeVisible()

    await root.getByRole('button', { name: 'Hecho' }).click()

    await expect(root.locator('input[placeholder="Escribe el país o región que buscas"]')).toHaveCount(0)
    await expect(root.locator('input[placeholder="Añade otra parada a tu viaje"]')).toHaveCount(0)

    await expect(root.getByText(/España, Estados Unidos/)).toBeVisible()
    await expect(root.getByText(/\+1$/)).toBeVisible()

    await expect(root.getByRole('button', { name: /Confirma tus destinos.*3/i })).toBeEnabled()
  })

  test('4. El botón limpiar (x) del input principal vacía toda la selección', async ({ page }) => {
    const root = page.locator('[data-destination-root]')

    await root.getByTestId('destination-trigger').click()
    const searchInput = root.locator('input[placeholder="Escribe el país o región que buscas"]')
    await searchInput.fill('ita')
    await root.getByRole('button', { name: /Italia/ }).first().click()

    await searchInput.fill('por')
    await root.getByRole('button', { name: /Portugal/ }).first().click()

    await root.getByRole('button', { name: 'Hecho' }).click()

    await expect(root.getByText('Italia, Portugal')).toBeVisible()

    await root.getByRole('button', { name: 'Limpiar selección' }).click()

    await expect(root.getByText('Italia, Portugal')).toHaveCount(0)
    await expect(root.locator('input[placeholder="Busca tu primer destino"]')).toBeVisible()
    await expect(root.getByRole('button', { name: /Elige al menos un destino/i })).toBeDisabled()
  })

  test('5. Click fuera del dropdown lo cierra', async ({ page }) => {
    const root = page.locator('[data-destination-root]')

    await root.getByTestId('destination-trigger').click()
    await expect(root.locator('input[placeholder="Escribe el país o región que buscas"]')).toBeVisible()

    await page.locator('body').click({ position: { x: 10, y: 10 } })

    await expect(root.locator('input[placeholder="Escribe el país o región que buscas"]')).toHaveCount(0)
  })
})
