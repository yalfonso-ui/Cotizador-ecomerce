import { test, expect } from '@playwright/test'

/**
 * Focused diagnostic test: what happens in the DOM between click and transition?
 */

test('StepPlans: trace DOM changes after click', async ({ page }) => {
  page.on('console', msg => console.log(`[browser-${msg.type()}]`, msg.text()))
  page.on('pageerror', err => console.log(`[pageerror]`, err.message))

  // Skip tour overlay
  await page.goto('http://localhost:5173/')
  await page.evaluate(() => localStorage.setItem('lemonade_tour_seen', '1'))
  await page.reload()

  // Open wizard
  await page.click('button:has-text("Inicia aquí tu compra")')
  await page.waitForSelector('button:has-text("Sigue con tu destino")')
  await page.click('button:has-text("Sigue con tu destino")')

  // Destination
  await page.waitForSelector('input[placeholder*="primer destino"], input[placeholder*="otro destino"], input[placeholder*="país"], input[placeholder*="Buscar"]')
  await page.locator('input[placeholder*="primer destino"], input[placeholder*="otro destino"], input[placeholder*="país"], input[placeholder*="Buscar"]').first().click()
  await page.waitForTimeout(500)
  await page.locator('button[type="button"]:has(img[src*="flagcdn"])').first().click({ force: true })
  await page.waitForTimeout(300)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Confirma tus destinos'))
    if (btn) btn.click()
  })

  // Dates (panel auto-opens)
  await page.waitForSelector('.fixed.z-30')
  await page.waitForTimeout(500)
  const calendarButtons = page.locator('.grid.grid-cols-7 button:not([disabled])')
  const count = await calendarButtons.count()
  if (count >= 6) {
    await calendarButtons.nth(0).click()
    await page.waitForTimeout(200)
    await calendarButtons.nth(5).click()
  }
  await page.waitForTimeout(300)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Confirma tus fechas'))
    if (btn) btn.click()
  })

  // Travelers
  await page.waitForSelector('input[placeholder*="DD/MM/AAAA"]')
  const birthInputs = await page.locator('input[placeholder*="DD/MM/AAAA"]').all()
  for (const input of birthInputs) {
    await input.fill('15/05/1990')
    await input.blur()
  }
  await page.waitForTimeout(500)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Sigue con tus coberturas'))
    if (btn) btn.click()
  })

  // PLANS STEP
  await page.waitForSelector('h1:has-text("cobertura ideal")')
  console.log('\n=== AT PLANS STEP ===')

  // Inject diagnostic into the page
  await page.evaluate(() => {
    const root = document.querySelector('#app')?.__vue_app__
    if (!root) {
      console.log('No Vue app found')
      return
    }

    // Hook into console to monitor changes
    let lastStepText = ''
    let observerInterval = setInterval(() => {
      const stepText = document.querySelector('span.tabular-nums')?.textContent || ''
      const h1 = document.querySelector('main h1')?.textContent?.trim() || 'NO H1'
      const dataStepInputs = document.querySelectorAll('input[id^="name-"]').length
      if (stepText !== lastStepText) {
        console.log(`[tick] step="${stepText}" h1="${h1}" dataStepInputs=${dataStepInputs}`)
        lastStepText = stepText
      }
    }, 100)

    // Stop observer after 5s
    setTimeout(() => clearInterval(observerInterval), 5000)

    // Save global to prevent GC
    window.__observerInterval = observerInterval
  })

  // Click the Elegir button
  const elegirBtn = page.locator('button:has-text("Elegir")').first()
  await elegirBtn.click()

  // Wait for transition + observation
  await page.waitForTimeout(4500)

  // Final state
  const finalH1 = await page.locator('main h1').first().textContent().catch(() => 'NO H1')
  const finalStep = await page.locator('span.tabular-nums').textContent().catch(() => 'NO STEP')
  console.log(`\n=== FINAL ===`)
  console.log(`step counter: "${finalStep}"`)
  console.log(`h1: "${finalH1}"`)
  console.log(`has data step inputs: ${await page.locator('input[id^="name-"]').count() > 0}`)
})
