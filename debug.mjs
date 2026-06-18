import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

page.on('pageerror', (err) => console.log('[ERROR]', err.message))

await page.goto('http://localhost:3000/cotizacion')
await page.evaluate(() => {
  localStorage.removeItem('wizard_state')
  localStorage.setItem('lemonade_tour_seen', '1')
})
await page.reload()
await page.waitForTimeout(1500)

const comenzar = page.getByRole('button', { name: /Comenzar ahora/i })
if (await comenzar.count() > 0) {
  await comenzar.click()
  await page.waitForTimeout(2000)
}

await page.getByRole('button', { name: /^Continuar$/i }).click()
await page.waitForTimeout(1500)

await page.locator('[data-testid="destination-trigger"]').click()
await page.getByRole('button', { name: /España/ }).first().click()
await page.getByRole('button', { name: /Hecho/ }).click()
await page.getByRole('button', { name: /Continuar/i }).click()
await page.waitForTimeout(1500)

await page.locator('[data-testid="date-from-trigger"]').click()
const days = page.locator('.absolute.z-30 div.grid.grid-cols-7 button:not([disabled])')
await days.nth(2).click()
await page.waitForTimeout(200)
await days.nth(6).click()
await page.waitForTimeout(300)
await page.getByRole('button', { name: /Continuar/i }).click()
await page.waitForTimeout(1500)

// Step 4: birthdate
const bd = page.getByPlaceholder('DD/MM/AAAA')
await bd.fill('02/05/1980')
await page.getByRole('button', { name: /Continuar con/i }).click()
await page.waitForTimeout(1500)

// Step 5: plans
await page.locator('article').filter({ hasText: 'Essential' }).first().getByRole('button', { name: 'Elegir este plan' }).click()
await page.waitForTimeout(1500)

console.log('After plan selection, h1:', await page.locator('h1').first().innerText())
console.log('selected plan from localStorage:', await page.evaluate(() => JSON.parse(localStorage.getItem('wizard_state')).formData.selectedPlan))

// Step 6: data
await page.locator('#emergency-name').fill('Test')
await page.locator('#emergency-phone').fill('1234567')
await page.getByRole('checkbox', { name: /Acepto/ }).check()
await page.getByRole('button', { name: 'Siguiente' }).click()
await page.waitForTimeout(500)

await page.getByRole('checkbox', { name: /Preexistencias/ }).check()
await page.getByRole('checkbox', { name: /Equipaje/ }).check()
await page.getByRole('button', { name: /Continuar$/ }).click()
await page.waitForTimeout(1500)

const total = await page.locator('button[type="submit"]').filter({ hasText: /Pagar/ }).innerText()
console.log('Total:', total)
const wizardState = await page.evaluate(() => JSON.parse(localStorage.getItem('wizard_state')).formData)
console.log('Form data:', JSON.stringify(wizardState, null, 2).slice(0, 1000))

await browser.close()