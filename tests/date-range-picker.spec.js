import { test, expect } from '@playwright/test'

test.describe('DateRangePicker — selección de rango', () => {
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
    await page.locator('[data-testid="destination-trigger"]').click()
    await page.getByRole('button', { name: /España/ }).first().click()
    await page.getByRole('button', { name: 'Hecho' }).click()
    await page.getByRole('button', { name: /Continuar/i }).click()

    await expect(page.getByText(/¿Cuándo viajas\?/i)).toBeVisible({ timeout: 5000 })
  })

  test('1. Muestra dos recuadros Desde / Hasta antes de abrir', async ({ page }) => {
    await expect(page.locator('[data-testid="date-from-trigger"]')).toBeVisible()
    await expect(page.locator('[data-testid="date-to-trigger"]')).toBeVisible()

    const fromLabel = await page.locator('[data-testid="date-from-trigger"] span').first().innerText()
    const toLabel = await page.locator('[data-testid="date-to-trigger"] span').first().innerText()
    expect(fromLabel).toBe('Desde')
    expect(toLabel).toBe('Hasta')

    await expect(page.locator('.absolute.z-30')).toHaveCount(0)
  })

  test('2. Click en Desde abre el panel con dos meses lado a lado', async ({ page }) => {
    await page.locator('[data-testid="date-from-trigger"]').click()

    const calendar = page.locator('.absolute.z-30')
    await expect(calendar).toBeVisible()

    const monthHeaders = await calendar.locator('span.text-sm.font-semibold').count()
    expect(monthHeaders).toBe(2)

    const navButtons = await calendar.locator('button[aria-label]').count()
    expect(navButtons).toBeGreaterThanOrEqual(2)
  })

  test('3. Selección de rango aplica estilos azul corporativo', async ({ page }) => {
    await page.locator('[data-testid="date-from-trigger"]').click()

    const enabledDays = page.locator('.absolute.z-30 div.grid.grid-cols-7 button:not([disabled])')
    const total = await enabledDays.count()
    expect(total).toBeGreaterThan(5)

    const startDay = enabledDays.nth(0)
    const endDay = enabledDays.nth(4)

    await startDay.click()
    await page.waitForTimeout(200)
    const startClassBefore = await startDay.getAttribute('class')
    expect(startClassBefore).toContain('bg-blue-600')
    expect(startClassBefore).toContain('text-white')

    await endDay.click()
    await page.waitForTimeout(200)
    const endClassBefore = await endDay.getAttribute('class')
    expect(endClassBefore).toContain('bg-blue-600')
    expect(endClassBefore).toContain('text-white')

    await page.waitForTimeout(500)

    const fromText = await page.locator('[data-testid="date-from-trigger"] span').last().innerText()
    const toText = await page.locator('[data-testid="date-to-trigger"] span').last().innerText()

    expect(fromText).toMatch(/\d{2} [a-z]{3} \d{4}/)
    expect(toText).toMatch(/\d{2} [a-z]{3} \d{4}/)
    expect(fromText).not.toBe(toText)
  })

  test('4. Días intermedios muestran fondo azul translúcido', async ({ page }) => {
    await page.locator('[data-testid="date-from-trigger"]').click()

    const enabledDays = page.locator('.absolute.z-30 div.grid.grid-cols-7 button:not([disabled])')
    await enabledDays.nth(0).click()
    await page.waitForTimeout(200)
    await enabledDays.nth(4).click()
    await page.waitForTimeout(200)

    const intermediate = enabledDays.nth(2)
    const intClass = await intermediate.getAttribute('class')
    expect(intClass).toContain('bg-blue-50')
  })

  test('5. Click fuera del panel cierra el calendario', async ({ page }) => {
    await page.locator('[data-testid="date-from-trigger"]').click()
    await expect(page.locator('.absolute.z-30')).toBeVisible()

    await page.locator('body').click({ position: { x: 10, y: 10 } })
    await page.waitForTimeout(300)

    await expect(page.locator('.absolute.z-30')).toHaveCount(0)
  })

  test('6. Botón Limpiar resetea el rango', async ({ page }) => {
    await page.locator('[data-testid="date-from-trigger"]').click()

    const enabledDays = page.locator('.absolute.z-30 div.grid.grid-cols-7 button:not([disabled])')
    await enabledDays.nth(0).click()
    await page.waitForTimeout(200)
    await enabledDays.nth(3).click()

    await expect(page.getByRole('button', { name: 'Limpiar' })).toBeVisible()
    await page.getByRole('button', { name: 'Limpiar' }).click()
    await page.waitForTimeout(300)

    const fromText = await page.locator('[data-testid="date-from-trigger"] span').last().innerText()
    expect(fromText).toBe('Seleccionar')
  })

  test('7. Click en día anterior a startDate reasigna el inicio', async ({ page }) => {
    await page.locator('[data-testid="date-from-trigger"]').click()

    const enabledDays = page.locator('.absolute.z-30 div.grid.grid-cols-7 button:not([disabled])')
    await enabledDays.nth(5).click()
    await page.waitForTimeout(300)

    const firstFromText = await page.locator('[data-testid="date-from-trigger"] span').last().innerText()

    await enabledDays.nth(1).click()
    await page.waitForTimeout(300)

    const newFromText = await page.locator('[data-testid="date-from-trigger"] span').last().innerText()
    expect(newFromText).not.toBe(firstFromText)
  })

  test('8. Días anteriores a minDate están deshabilitados', async ({ page }) => {
    await page.locator('[data-testid="date-from-trigger"]').click()

    const disabledDays = page.locator('.absolute.z-30 div.grid.grid-cols-7 button[disabled]')
    const count = await disabledDays.count()
    expect(count).toBeGreaterThan(0)
  })

  test('9. Panel se cierra automáticamente tras completar el rango', async ({ page }) => {
    await page.locator('[data-testid="date-from-trigger"]').click()
    await expect(page.locator('.absolute.z-30')).toBeVisible()

    const enabledDays = page.locator('.absolute.z-30 div.grid.grid-cols-7 button:not([disabled])')
    await enabledDays.nth(0).click()
    await page.waitForTimeout(200)
    await enabledDays.nth(2).click()

    await expect(page.locator('.absolute.z-30')).toBeVisible()
    await page.waitForTimeout(500)
    await expect(page.locator('.absolute.z-30')).toHaveCount(0)
  })

  test('10. Botón Continuar se habilita tras seleccionar rango válido', async ({ page }) => {
    const continuar = page.getByRole('button', { name: /Continuar/i })
    await expect(continuar).toBeDisabled()

    await page.locator('[data-testid="date-from-trigger"]').click()
    const enabledDays = page.locator('.absolute.z-30 div.grid.grid-cols-7 button:not([disabled])')
    await enabledDays.nth(0).click()
    await page.waitForTimeout(200)
    await enabledDays.nth(3).click()
    await page.waitForTimeout(500)

    await expect(continuar).toBeEnabled()
  })
})