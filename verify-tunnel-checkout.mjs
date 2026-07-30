// Verify the wizard end-to-end via the cloudflare tunnel.
// Fresh load → landing → "Inicia aquí tu compra" → wizard at step 6 (pre-seeded).
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { Resolver } from 'node:dns'

const TUNNEL_URL = 'https://featured-permit-searching-oops.trycloudflare.com'
const SHOTS = 'C:\\Users\\yalfonso\\Documents\\OPENCODE\\Ecommerce-lemonade\\screenshots'
mkdirSync(SHOTS, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (m) => console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${m}`)

const resolver = new Resolver()
resolver.setServers(['1.1.1.1', '8.8.8.8'])
const tunnelIP = await new Promise((resolve, reject) => {
  resolver.resolve4('featured-permit-searching-oops.trycloudflare.com', (err, addrs) => {
    if (err) reject(err); else resolve(addrs[0])
  })
})
log(`Resolved tunnel IP: ${tunnelIP}`)

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  ignoreHTTPSErrors: true
})
const page = await ctx.newPage()

await page.addInitScript(() => { localStorage.setItem('lemonade_tour_seen', '1') })

await page.route('**://featured-permit-searching-oops.trycloudflare.com/**', async (route) => {
  const u = route.request().url().replace('featured-permit-searching-oops.trycloudflare.com', tunnelIP)
  const h = { ...route.request().headers(), host: 'featured-permit-searching-oops.trycloudflare.com' }
  try { await route.fulfill({ response: await route.fetch({ url: u, headers: h }) }) }
  catch (e) { await route.abort() }
})

const consoleErrors = []
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
page.on('pageerror', (e) => consoleErrors.push(e.message))

let failures = 0
try {
  // 1) Fresh load → landing
  log('=== Step 1: Fresh load → landing ===')
  await page.goto(TUNNEL_URL + '/', { waitUntil: 'networkidle', timeout: 30000 })
  await sleep(1500)
  const heroOk = !!(await page.$('text=Viaja tranquilo'))
  const ctaOk = !!(await page.$('text=Inicia aquí tu compra'))
  log(`  hero=${heroOk} cta=${ctaOk}`)
  if (!heroOk || !ctaOk) { log('  FAIL landing'); failures++ }

  // 2) Click "Inicia aquí tu compra" → wizard
  log('=== Step 2: Click CTA → wizard ===')
  await page.click('text=Inicia aquí tu compra')
  await sleep(1500)
  await page.screenshot({ path: `${SHOTS}\\checkout_01_wizard.png` })

  // 3) Now sessionStorage is marked, so /cotizacion?step=6 respects the query
  log('=== Step 3: Navigate to /cotizacion?step=6 (session already started) ===')
  await page.goto(TUNNEL_URL + '/cotizacion?step=6', { waitUntil: 'networkidle', timeout: 30000 })
  await sleep(1500)
  const cardInput = await page.$('#card-number')
  if (!cardInput) {
    log('  FAIL: no card-number input — wizard not at step 6')
    await page.screenshot({ path: `${SHOTS}\\checkout_02_FAIL.png` })
    failures++
  } else {
    log('  PASS: at checkout step')

    // 4) Fill with garbage
    await page.fill('#card-number', '1')
    await page.fill('#card-name', 'A')
    await page.fill('#card-expiry', '1')
    await page.fill('#card-cvv', '1')
    await sleep(800)
    await page.screenshot({ path: `${SHOTS}\\checkout_03_filled.png` })

    // 5) Click submit
    const submit = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find((b) => /Activa tu cobertura/.test(b.innerText))
    })
    const disabled = await submit.evaluate((b) => b.disabled)
    log(`  submit disabled: ${disabled}`)
    if (disabled) { log('  FAIL: submit disabled'); failures++ }
    else {
      await submit.asElement().click()
      log('  clicked submit')

      // 6) Wait for success
      let success = false
      for (let i = 0; i < 20; i++) {
        await sleep(1000)
        const headings = await page.$$eval('h1,h2,h3', (els) => els.map((e) => e.innerText?.trim()).filter(Boolean))
        const has = headings.some((t) => /Felicidades|protegido|empezó tu cobertura|gracias/i.test(t))
        if (has) { success = true; break }
      }
      if (!success) {
        log('  FAIL: no success page')
        await page.screenshot({ path: `${SHOTS}\\checkout_04_FAIL.png` })
        failures++
      } else {
        log('  PASS: success page reached')
        await page.screenshot({ path: `${SHOTS}\\checkout_05_success.png`, fullPage: true })
        // Scroll to bottom to see badges
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await sleep(800)
        await page.screenshot({ path: `${SHOTS}\\checkout_06_badges.png` })

        // 7) Check badges
        const badgeInfo = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll('a[aria-label*="App Store"], a[aria-label*="Google Play"]'))
          return anchors.map((a) => {
            const svg = a.querySelector('svg')
            const rect = svg?.getBoundingClientRect()
            return {
              label: a.getAttribute('aria-label'),
              hasSvg: !!svg,
              width: rect ? rect.width : 0,
              height: rect ? rect.height : 0
            }
          })
        })
        log(`  badges: ${JSON.stringify(badgeInfo)}`)
        if (badgeInfo.length === 2 && badgeInfo.every((b) => b.hasSvg && b.width > 30 && b.height > 10)) {
          log('  PASS: both badges render correctly')
        } else {
          log('  FAIL: badges not rendering')
          failures++
        }
      }
    }
  }

  log(`\n=== END-TO-END: ${failures === 0 ? 'ALL PASSED ✓' : `${failures} FAILED ✗`} ===`)
  log(`Console errors: ${consoleErrors.length}`)
  consoleErrors.slice(0, 10).forEach((e) => log(`  ${e}`))
  await browser.close()
  process.exit(failures === 0 ? 0 : 1)
} catch (err) {
  log(`EXCEPTION: ${err.message}`)
  await browser.close()
  process.exit(2)
}
