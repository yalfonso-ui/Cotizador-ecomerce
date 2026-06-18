# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.js >> Flujo Completo de Compra - Continental Assist >> Debería completar exitosamente los 8 pasos del checkout
- Location: tests\checkout.spec.js:21:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.check: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('checkbox', { name: /Acepto las políticas/ })
    - locator resolved to <input type="checkbox" data-v-f34d996d="" class="peer sr-only"/>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-v-f34d996d="" class="w-5 h-5 rounded border-2 transition-all flex items-center justify-center bg-white border-slate-300 group-hover:border-cyan-400">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-v-f34d996d="" class="w-5 h-5 rounded border-2 transition-all flex items-center justify-center bg-white border-slate-300 group-hover:border-cyan-400">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    94 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div data-v-f34d996d="" class="w-5 h-5 rounded border-2 transition-all flex items-center justify-center bg-white border-slate-300 group-hover:border-cyan-400">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - button "Volver al paso anterior" [ref=e9] [cursor=pointer]:
          - img [ref=e10]
          - generic [ref=e12]: Volver
        - img "Continental Assist Logo" [ref=e14]
        - generic [ref=e15]:
          - link "¿Necesitas ayuda?" [ref=e16] [cursor=pointer]:
            - /url: https://www.ejemplo.com/ayuda
            - img [ref=e17]
            - text: ¿Necesitas ayuda?
          - generic [ref=e19]: Paso 6 de 9
      - 'progressbar "Progreso del wizard: paso 6 de 9" [ref=e20]'
  - main [ref=e22]:
    - generic [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]: Tus datos de contacto
        - heading "Cuéntanos de ti" [level=1] [ref=e29]
      - paragraph [ref=e31]:
        - img [ref=e32]
        - text: Tus datos están seguros. Solo los usaremos para emitir tu asistencia.
      - generic [ref=e34]:
        - list [ref=e36]:
          - listitem [ref=e37]:
            - img [ref=e39]
            - generic [ref=e41]: Titular
          - listitem [ref=e42]
          - listitem [ref=e43]:
            - generic [ref=e45]: "2"
            - generic [ref=e46]: Emergencia
        - generic [ref=e48]:
          - generic [ref=e49]:
            - img [ref=e51]
            - heading "Contacto de emergencia" [level=3] [ref=e53]
          - generic [ref=e54]:
            - generic [ref=e55]:
              - generic [ref=e56]: Nombre completo
              - generic [ref=e57]:
                - textbox "Nombre completo" [ref=e58]:
                  - /placeholder: Juan García
                  - text: Juan Garcia
                - generic:
                  - img
            - generic [ref=e59]:
              - generic [ref=e60]: Teléfono
              - textbox "Teléfono" [active] [ref=e62]:
                - /placeholder: +52 55 9876 5432
                - text: "3212654891"
            - generic [ref=e63]:
              - generic [ref=e64]: Correo electrónico (opcional)
              - textbox "contacto@email.com" [ref=e65]
          - generic [ref=e67] [cursor=pointer]:
            - checkbox "Acepto las políticas de privacidad y el tratamiento de mis datos personales. *" [ref=e69]
            - paragraph [ref=e72]:
              - text: Acepto las
              - button "políticas de privacidad" [ref=e73]
              - text: y el tratamiento de mis datos personales. *
      - button "Ver coberturas opcionales" [disabled] [ref=e74]:
        - generic [ref=e75]: Ver coberturas opcionales
        - img [ref=e76]
      - button "[Dev] Llenar datos de prueba" [ref=e78] [cursor=pointer]
```

# Test source

```ts
  32  |     // =================================================================
  33  |     await test.step('Paso 1: Confirmar país de origen', async () => {
  34  |       await expect(page.getByText('¿Desde dónde viajas?')).toBeVisible();
  35  |       await expect(page.getByText('Colombia')).toBeVisible();
  36  |       await page.getByRole('button', { name: 'Continuar' }).click();
  37  |     });
  38  | 
  39  |     // =================================================================
  40  |     // PASO 2: Destinos
  41  |     // =================================================================
  42  |     await test.step('Paso 2: Seleccionar destinos', async () => {
  43  |       await expect(page.getByText('¿A dónde viajas?')).toBeVisible();
  44  | 
  45  |       // Nuevo selector: data-testid
  46  |       await page.locator('[data-testid="destination-trigger"]').click();
  47  |       await page.getByRole('button', { name: /España/ }).first().click();
  48  |       await page.getByRole('button', { name: /Hecho/ }).click();
  49  | 
  50  |       // Reabrir y buscar Alemania en el catálogo (no está en populares)
  51  |       await page.locator('[data-testid="destination-trigger"]').click();
  52  |       await page.locator('input[placeholder="Busca un país o región"]').fill('alem');
  53  |       await page.getByRole('button', { name: /Alemania/ }).first().click();
  54  |       await page.getByRole('button', { name: /Hecho/ }).click();
  55  | 
  56  |       await page.getByRole('button', { name: /Continuar/i }).click();
  57  |     });
  58  | 
  59  |     // =================================================================
  60  |     // PASO 3: Calendario
  61  |     // =================================================================
  62  |     await test.step('Paso 3: Seleccionar rango de fechas del viaje', async () => {
  63  |       await expect(page.getByText('¿Cuándo viajas?')).toBeVisible();
  64  | 
  65  |       await page.locator('[data-testid="date-from-trigger"]').click();
  66  |       const dayButtons = page.locator('.absolute.z-30 div.grid.grid-cols-7 button:not([disabled])');
  67  |       const totalDays = await dayButtons.count();
  68  |       expect(totalDays).toBeGreaterThan(5);
  69  | 
  70  |       const startDay = dayButtons.nth(2);
  71  |       const endDay = dayButtons.nth(6);
  72  | 
  73  |       await startDay.click();
  74  |       await page.waitForTimeout(300);
  75  |       await endDay.click();
  76  |       await page.waitForTimeout(300);
  77  | 
  78  |       await expect(page.getByText(/Salida/)).toBeVisible();
  79  |       await expect(page.getByText(/Regreso/)).toBeVisible();
  80  | 
  81  |       await page.getByRole('button', { name: /Continuar/i }).click();
  82  |     });
  83  | 
  84  |     // =================================================================
  85  |     // PASO 4: Fecha de nacimiento (input unificado)
  86  |     // =================================================================
  87  |     await test.step('Paso 4: Ingresar fecha de nacimiento única', async () => {
  88  |       await expect(page.getByText('¿Quiénes viajan?')).toBeVisible();
  89  | 
  90  |       const inputFechaNacimiento = page.getByPlaceholder('DD/MM/AAAA');
  91  |       await inputFechaNacimiento.fill('02/05/1980');
  92  | 
  93  |       await page.getByRole('button', { name: /Continuar con \d+ viajero/ }).click();
  94  |     });
  95  | 
  96  |     // =================================================================
  97  |     // PASO 5: Plan
  98  |     // =================================================================
  99  |     await test.step('Paso 5: Seleccionar plan de protección', async () => {
  100 |       await expect(page.getByText('¿Qué plan necesitas?')).toBeVisible();
  101 | 
  102 |       // Selector estable: la card de plan es un <article> con el nombre del plan
  103 |       const cardEssential = page.locator('article').filter({ hasText: 'Essential' }).first();
  104 |       await cardEssential.getByRole('button', { name: 'Elegir este plan' }).click();
  105 |     });
  106 | 
  107 |     // =================================================================
  108 |     // PASO 6: Datos de contacto (Titular + Emergencia)
  109 |     // =================================================================
  110 |     await test.step('Paso 6: Llenar información de contacto y emergencia', async () => {
  111 |       await expect(page.getByText('Tus datos de contacto')).toBeVisible();
  112 | 
  113 |       // --- SUB-PASO: Titular ---
  114 |       // Inputs de titular dentro del primer accordion (Viajero 1)
  115 |       const titularCard = page.locator('div').filter({ hasText: 'Viajero 1' }).first();
  116 |       await titularCard.getByLabel('Nombre completo').fill('Yeison Andres Alfonso');
  117 |       await titularCard.getByLabel('Identificación / Pasaporte').fill('89208984942');
  118 |       await titularCard.getByLabel('Correo electrónico').fill('yalfonso@continentalassist.com');
  119 |       await titularCard.getByLabel('Teléfono').fill('3124567898');
  120 | 
  121 |       await page.getByRole('button', { name: 'Siguiente' }).click();
  122 | 
  123 |       // --- SUB-PASO: Emergencia ---
  124 |       // Validación no anticipada: no debe haber banner rojo agresivo
  125 |       await expect(page.getByText('Tienes campos por completar')).not.toBeVisible();
  126 | 
  127 |       // IDs únicos añadidos: emergency-name y emergency-phone
  128 |       await page.locator('#emergency-name').fill('Juan Garcia');
  129 |       await page.locator('#emergency-phone').fill('3212654891');
  130 | 
  131 |       // Aceptar términos y avanzar
> 132 |       await page.getByRole('checkbox', { name: /Acepto las políticas/ }).check();
      |                                                                          ^ Error: locator.check: Test timeout of 60000ms exceeded.
  133 |       await page.getByRole('button', { name: 'Ver coberturas opcionales' }).click();
  134 |     });
  135 | 
  136 |     // =================================================================
  137 |     // PASO 7: Upgrades — Validación del bug del total
  138 |     // =================================================================
  139 |     await test.step('Paso 7: Seleccionar 2 upgrades y validar total en paso 8', async () => {
  140 |       await expect(page.getByText('Mejora tu cobertura')).toBeVisible();
  141 |       await expect(page.getByText('Coberturas opcionales')).toBeVisible();
  142 | 
  143 |       // Constantes de precios declaradas en src/data/upgrades.js
  144 |       // Plan seleccionado en paso 5: Essential = $25.00
  145 |       const PLAN_PRICE = 25.00;
  146 |       const UPGRADE_PREE_XISTENCIAS = 18.20;
  147 |       const UPGRADE_EQUIPAJE_EXTRA = 9.80;
  148 |       const EXPECTED_TOTAL = PLAN_PRICE + UPGRADE_PREE_XISTENCIAS + UPGRADE_EQUIPAJE_EXTRA;
  149 |       // = 25.00 + 18.20 + 9.80 = $53.00
  150 | 
  151 |       // Seleccionar 2 upgrades por nombre accesible (role="checkbox" + aria-label)
  152 |       const upgradePreexistencias = page.getByRole('checkbox', {
  153 |         name: 'Preexistencias médicas para Viajero 1'
  154 |       });
  155 |       const upgradeEquipajeExtra = page.getByRole('checkbox', {
  156 |         name: 'Equipaje extra para Viajero 1'
  157 |       });
  158 | 
  159 |       // Verificar que inicialmente NO estén seleccionados
  160 |       await expect(upgradePreexistencias).not.toBeChecked();
  161 |       await expect(upgradeEquipajeExtra).not.toBeChecked();
  162 | 
  163 |       // Activar ambos upgrades
  164 |       await upgradePreexistencias.check();
  165 |       await upgradeEquipajeExtra.check();
  166 | 
  167 |       // Verificar que ahora SÍ estén seleccionados (aria-checked="true")
  168 |       await expect(upgradePreexistencias).toBeChecked();
  169 |       await expect(upgradeEquipajeExtra).toBeChecked();
  170 | 
  171 |       // Avanzar al Paso 8
  172 |       await page.getByRole('button', { name: 'Continuar' }).click();
  173 | 
  174 |       // =================================================================
  175 |       // PASO 8: Validación del total dinámico en el botón de pago
  176 |       // =================================================================
  177 |       // Esperar a que el botón de pago sea visible (indica que estamos en Checkout)
  178 |       const botonPago = page.locator('button[type="submit"]').filter({ hasText: /Pagar \$/ });
  179 |       await expect(botonPago).toBeVisible();
  180 | 
  181 |       // Verificar el texto exacto: debe contener el total matemático correcto
  182 |       // usando .toFixed(2) para evitar problemas de precisión float
  183 |       const expectedText = `Pagar $${EXPECTED_TOTAL.toFixed(2)} USD`;
  184 |       await expect(botonPago).toContainText(expectedText);
  185 | 
  186 |       // Verificación adicional: extraer el precio del texto del botón y comparar
  187 |       const botonText = await botonPago.textContent();
  188 |       const match = botonText.match(/\$(\d+\.\d{2})/);
  189 |       expect(match).not.toBeNull();
  190 |       const precioEnBoton = parseFloat(match[1]);
  191 |       expect(precioEnBoton).toBeCloseTo(EXPECTED_TOTAL, 2);
  192 | 
  193 |       // Verificar que NO contenga el valor incorrecto del bug original (solo plan base)
  194 |       expect(botonText).not.toContain('$25.00 USD');
  195 |       expect(botonText).not.toContain('$43.20 USD'); // Solo plan + 1 upgrade
  196 | 
  197 |       // Llenar tarjeta y procesar pago (bypass Luhn activo en dev)
  198 |       await page.locator('#card-number').fill('8949 8161 3351 6851');
  199 |       await page.locator('#card-name').fill('Yeison Alfonso');
  200 |       await page.locator('#card-expiry').fill('05/32');
  201 |       await page.locator('#card-cvv').fill('321');
  202 | 
  203 |       // El botón debe estar habilitado con el total correcto
  204 |       await expect(botonPago).toBeEnabled();
  205 |       await botonPago.click();
  206 | 
  207 |       // Verificar pantalla de éxito
  208 |       await expect(page.getByText('¡Tu viaje ya está protegido!')).toBeVisible({ timeout: 5000 });
  209 |     });
  210 | 
  211 |   });
  212 | 
  213 |   test('Debería calcular correctamente el total con descuento aplicado', async ({ page }) => {
  214 | 
  215 |     // Constantes esperadas
  216 |     const PLAN_PRICE = 25.00;
  217 |     const UPGRADE_PREE_XISTENCIAS = 18.20;
  218 |     const UPGRADE_DEPORTES = 14.50;
  219 |     const DISCOUNT_PROMO20 = 20; // %
  220 | 
  221 |     // Total esperado: (25 - 25*0.20) + 18.20 + 14.50 = 20 + 32.70 = $52.70
  222 | 
  223 |     await page.context().clearCookies();
  224 |     await page.goto('http://localhost:3000/cotizacion');
  225 |     await page.evaluate(() => {
  226 |       try {
  227 |         localStorage.removeItem('wizard_state');
  228 |         localStorage.removeItem('lemonade_tour_seen');
  229 |       } catch (e) {}
  230 |     });
  231 |     await page.reload();
  232 | 
```