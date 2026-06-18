import { test, expect } from '@playwright/test'

test.describe('StepDestination — selección múltiple de destinos', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.localStorage.setItem('lemonade_tour_seen', '1')
    })
    await page.goto('/')

    await page.getByRole('button', { name: /Comenzar ahora/i }).click()

    await expect(page.getByText(/¿Desde dónde viajas\?/i)).toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: /^Continuar$/i }).click()

    await expect(page.locator('[data-destination-root]')).toBeVisible({ timeout: 5000 })
  })

  test('1. El dropdown se abre al hacer clic en el input principal', async ({ page }) => {
    const root = page.locator('[data-destination-root]')

    await expect(root.locator('input[placeholder="Selecciona un país o región"]')).toBeVisible()
    await expect(root.locator('input[placeholder="Busca un país o región"]')).toHaveCount(0)

    await root.getByTestId('destination-trigger').click()

    await expect(root.locator('input[placeholder="Busca un país o región"]')).toBeVisible()
    await expect(root.getByText(/Destinos principales/i)).toBeVisible()

    await expect(root.getByRole('button', { name: /España/ })).toBeVisible()

    await root.getByRole('button', { name: /España/ }).first().click()

    await expect(root.getByRole('button', { name: 'Hecho' })).toBeVisible()
  })

  test('2. Al escribir en el buscador se filtran los países', async ({ page }) => {
    const root = page.locator('[data-destination-root]')

    await root.getByTestId('destination-trigger').click()
    const searchInput = root.locator('input[placeholder="Busca un país o región"]')

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

    const searchInput = root.locator('input[placeholder="Busca un país o región"]')
    await searchInput.fill('e')
    await root.getByRole('button', { name: /España/ }).first().click()

    await searchInput.fill('')
    await root.getByRole('button', { name: /Estados Unidos/ }).first().click()

    await searchInput.fill('f')
    await root.getByRole('button', { name: /Francia/ }).first().click()

    await expect(root.getByText('España', { exact: true }).first()).toBeVisible()
    await expect(root.getByText('Francia', { exact: true }).first()).toBeVisible()
    await expect(root.getByText('Estados Unidos', { exact: true }).first()).toBeVisible()

    await expect(root.locator('input[placeholder="Añade otro destino"]')).toBeVisible()

    await root.getByRole('button', { name: 'Hecho' }).click()

    await expect(root.locator('input[placeholder="Busca un país o región"]')).toHaveCount(0)
    await expect(root.locator('input[placeholder="Añade otro destino"]')).toHaveCount(0)

    await expect(root.getByText(/España, Estados Unidos/)).toBeVisible()
    await expect(root.getByText(/\+1$/)).toBeVisible()

    await expect(root.getByRole('button', { name: /Continuar.*3 destinos/i })).toBeEnabled()
  })

  test('4. El botón limpiar (x) del input principal vacía toda la selección', async ({ page }) => {
    const root = page.locator('[data-destination-root]')

    await root.getByTestId('destination-trigger').click()
    const searchInput = root.locator('input[placeholder="Busca un país o región"]')
    await searchInput.fill('ita')
    await root.getByRole('button', { name: /Italia/ }).first().click()

    await searchInput.fill('por')
    await root.getByRole('button', { name: /Portugal/ }).first().click()

    await root.getByRole('button', { name: 'Hecho' }).click()

    await expect(root.getByText('Italia, Portugal')).toBeVisible()

    await root.getByRole('button', { name: 'Limpiar selección' }).click()

    await expect(root.getByText('Italia, Portugal')).toHaveCount(0)
    await expect(root.locator('input[placeholder="Selecciona un país o región"]')).toBeVisible()
    await expect(root.getByRole('button', { name: /Selecciona un destino/i })).toBeDisabled()
  })

  test('5. Click fuera del dropdown lo cierra', async ({ page }) => {
    const root = page.locator('[data-destination-root]')

    await root.getByTestId('destination-trigger').click()
    await expect(root.locator('input[placeholder="Busca un país o región"]')).toBeVisible()

    await page.locator('body').click({ position: { x: 10, y: 10 } })

    await expect(root.locator('input[placeholder="Busca un país o región"]')).toHaveCount(0)
  })
})