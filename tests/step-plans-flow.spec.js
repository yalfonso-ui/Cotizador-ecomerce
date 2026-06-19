import { test, expect } from '@playwright/test'

/**
 * Test focused on the StepPlans → StepData transition bug.
 *
 * We navigate through the wizard up to StepPlans, then click a plan and verify
 * the wizard actually advances to StepData.
 */

test('StepPlans: clicking a plan advances to StepData', async ({ page }) => {
  const consoleLogs = []
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', err => consoleLogs.push(`[pageerror] ${err.message}`))

  // Skip tour overlay
  await page.goto('http://localhost:5173/')
  await page.evaluate(() => localStorage.setItem('lemonade_tour_seen', '1'))
  await page.reload()

  // Open wizard
  await page.click('button:has-text("Inicia aquí tu compra")', { timeout: 10000 })

  // Origin (auto-detected)
  await page.waitForSelector('button:has-text("Sigue con tu destino")', { timeout: 10000 })
  await page.click('button:has-text("Sigue con tu destino")')

  // Destination: click any country from the dropdown
  await page.waitForSelector('input[placeholder*="primer destino"], input[placeholder*="otro destino"], input[placeholder*="país"], input[placeholder*="Buscar"]', { timeout: 10000 })
  const destInput = page.locator('input[placeholder*="primer destino"], input[placeholder*="otro destino"], input[placeholder*="país"], input[placeholder*="Buscar"]').first()
  await destInput.click()
  await page.waitForTimeout(500)
  // Click first visible country button in dropdown (use force to bypass chips overlay)
  await page.locator('button[type="button"]:has(img[src*="flagcdn"])').first().click({ force: true, timeout: 5000 })
  await page.waitForTimeout(300)
  // Click the confirmar button via JS to bypass overlapping chip bar
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Confirma tus destinos'))
    if (btn) btn.click()
  })

  // Dates: panel auto-opens — pick first available day, then second
  await page.waitForSelector('.fixed.z-30', { timeout: 10000 })
  await page.waitForTimeout(500)
  // Pick today in current month + a day 5 days later
  const calendarButtons = page.locator('.grid.grid-cols-7 button:not([disabled])')
  const count = await calendarButtons.count()
  console.log(`Available days in calendar: ${count}`)
  if (count >= 6) {
    await calendarButtons.nth(0).click()
    await page.waitForTimeout(200)
    await calendarButtons.nth(5).click()
  } else {
    await calendarButtons.nth(0).click()
  }
  await page.waitForTimeout(300)
  await page.click('button:has-text("Confirma tus fechas")')

  // Travelers birthdates
  await page.waitForSelector('input[placeholder*="DD/MM/AAAA"]', { timeout: 10000 })
  const birthInputs = await page.locator('input[placeholder*="DD/MM/AAAA"]').all()
  for (const input of birthInputs) {
    await input.fill('15/05/1990')
    await input.blur()
  }
  await page.waitForTimeout(500)
  await page.click('button:has-text("Sigue con tus coberturas")')

  // ====== PLANS STEP — the one we're testing ======
  await page.waitForSelector('h1:has-text("cobertura ideal")', { timeout: 10000 })
  console.log('🟢 Plans step loaded')

  await page.screenshot({ path: 'tests/screenshots/plans-before.png', fullPage: true })

  // Get current step counter
  const stepCounterBefore = await page.locator('text=/Paso \\d+ de \\d+/').textContent().catch(() => '?')
  console.log(`Before click: ${stepCounterBefore?.trim()}`)

  // Click the first "Elegir" button (any plan)
  const elegirBtn = page.locator('button:has-text("Elegir")').first()
  await elegirBtn.waitFor({ state: 'visible', timeout: 5000 })

  console.log('🟡 Clicking Elegir button...')
  await elegirBtn.click()

  // Wait for the transition to complete
  await page.waitForTimeout(2500)

  await page.screenshot({ path: 'tests/screenshots/plans-after-click.png', fullPage: true })

  // Check what step we're on now
  const stepCounterAfter = await page.locator('text=/Paso \\d+ de \\d+/').textContent().catch(() => '?')
  console.log(`After click: ${stepCounterAfter?.trim()}`)

  const headingAfter = await page.locator('h1').first().textContent({ timeout: 3000 }).catch(() => 'NOT FOUND')
  console.log(`After click, heading is: "${headingAfter?.trim()}"`)

  // Verify we're now on StepData (heading should mention "ti" or "Datos")
  const onDataStep = await page.locator('h1:has-text("ti"), h1:has-text("Datos")').count()
  console.log(`On data step: ${onDataStep > 0}`)

  if (onDataStep === 0) {
    console.log('❌ BUG REPRODUCED: still on plans step')
  } else {
    console.log('✅ Step transitioned correctly to data step')
  }

  expect(onDataStep).toBeGreaterThan(0)
})
