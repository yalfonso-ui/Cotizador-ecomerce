# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.js >> Flujo Completo de Compra - Continental Assist >> Debería calcular correctamente el total con descuento aplicado
- Location: tests\checkout.spec.js:213:3

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 52.7
Received: 57.7

Expected precision:    2
Expected difference: < 0.005
Received difference:   5
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
          - generic [ref=e19]: Paso 8 de 9
      - 'progressbar "Progreso del wizard: paso 8 de 9" [ref=e20]'
  - main [ref=e22]:
    - generic [ref=e27]:
      - complementary [ref=e28]:
        - generic [ref=e30]:
          - generic [ref=e32]:
            - paragraph [ref=e33]: Tu plan
            - paragraph [ref=e34]: Essential
            - paragraph [ref=e35]: Cobertura 15,000 USD
          - generic [ref=e36]:
            - paragraph [ref=e37]: $25
            - paragraph [ref=e38]: USD
        - generic [ref=e39]:
          - generic [ref=e40]:
            - generic [ref=e41]:
              - paragraph [ref=e42]: Origen
              - paragraph [ref=e43]: Colombia
            - generic [ref=e44]:
              - paragraph [ref=e45]: Destinos
              - paragraph [ref=e46]: España
          - generic [ref=e47]:
            - generic [ref=e48]:
              - paragraph [ref=e49]: Fechas
              - paragraph [ref=e50]: 18 jul 2026 — 25 jul 2026
            - generic [ref=e51]:
              - paragraph [ref=e52]: Viajeros
              - paragraph [ref=e53]: 1 viajero
          - generic [ref=e54]:
            - paragraph [ref=e55]: Upgrades
            - paragraph [ref=e56]: Preexistencias, Deportes
          - generic [ref=e57]:
            - paragraph [ref=e58]: Contacto de emergencia
            - paragraph [ref=e59]: Test
            - paragraph [ref=e60]: "3001234567"
        - generic [ref=e61]:
          - button "Editar origen" [ref=e62] [cursor=pointer]: Origen
          - generic [ref=e63]: ·
          - button "Editar destinos" [ref=e64] [cursor=pointer]: Destinos
          - generic [ref=e65]: ·
          - button "Editar fechas" [ref=e66] [cursor=pointer]: Fechas
          - generic [ref=e67]: ·
          - button "Editar viajeros" [ref=e68] [cursor=pointer]: Viajeros
          - generic [ref=e69]: ·
          - button "Editar upgrades" [ref=e70] [cursor=pointer]: Upgrades
          - generic [ref=e71]: ·
          - button "Editar contacto de emergencia" [ref=e72] [cursor=pointer]: Contacto
      - generic [ref=e74]:
        - generic [ref=e75]:
          - generic [ref=e76]:
            - img [ref=e78]
            - generic [ref=e80]:
              - paragraph [ref=e81]: ¿Tienes un código de descuento?
              - paragraph [ref=e82]: Aplica un cupón para ahorrar en tu compra
          - generic [ref=e83]:
            - textbox "Ingresa un código de descuento. Prueba WELCOME10, PROMO20 o TRAVEL15" [ref=e85]:
              - /placeholder: "Ej: WELCOME10"
            - button "Aplicar" [disabled] [ref=e86]:
              - generic [ref=e87]: Aplicar
          - generic [ref=e88]:
            - img [ref=e89]
            - generic [ref=e91]:
              - text: "Prueba con:"
              - code [ref=e92]: WELCOME10
              - text: ","
              - code [ref=e93]: PROMO20
              - text: o
              - code [ref=e94]: TRAVEL15
        - generic [ref=e95]:
          - generic [ref=e96]:
            - img [ref=e98]
            - heading "Tarjeta de Crédito o Débito" [level=3] [ref=e100]
          - generic [ref=e101]:
            - generic [ref=e102]:
              - generic [ref=e103]: Número de tarjeta
              - generic [ref=e104]:
                - generic:
                  - img
                - textbox "Número de tarjeta" [ref=e105]:
                  - /placeholder: 1234 5678 9012 3456
            - generic [ref=e106]:
              - generic [ref=e107]: Nombre en la tarjeta
              - textbox "Nombre en la tarjeta" [ref=e109]:
                - /placeholder: Como aparece en tu tarjeta
            - generic [ref=e110]:
              - generic [ref=e111]:
                - generic [ref=e112]: Vencimiento
                - textbox "Vencimiento" [ref=e114]:
                  - /placeholder: MM/AA
              - generic [ref=e115]:
                - generic [ref=e116]: Código de seguridad
                - generic [ref=e117]:
                  - textbox "Código de seguridad" [ref=e118]:
                    - /placeholder: CVV
                  - generic:
                    - img
        - generic [ref=e119]:
          - button "Pagar $57.70 USD" [disabled] [ref=e120]:
            - generic [ref=e121]: Pagar $57.70 USD
          - generic [ref=e122]:
            - generic [ref=e123]:
              - img [ref=e124]
              - generic [ref=e126]: Pago 100% encriptado
            - generic [ref=e127]:
              - img "Visa" [ref=e128]
              - img "Mastercard" [ref=e129]
              - img "Amex" [ref=e130]
            - button "Guardar cotización" [ref=e131] [cursor=pointer]
```

# Test source

```ts
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
  233 |     // Paso 1-6 (skip directo al paso 8 via localStorage para acelerar)
  234 |     // Setup: setear el wizard_state directamente con los datos completos
  235 |     await page.evaluate(([plan, upgrades]) => {
  236 |       const start = new Date();
  237 |       start.setDate(start.getDate() + 30);
  238 |       const end = new Date(start);
  239 |       end.setDate(end.getDate() + 7);
  240 |       const fmt = (d) => d.toISOString().split('T')[0];
  241 |       const state = {
  242 |         formData: {
  243 |           origin: { code: 'CO', name: 'Colombia' },
  244 |           destination: [{ code: 'ES', name: 'España' }],
  245 |           dates: { start: fmt(start), end: fmt(end) },
  246 |           tripDuration: 8,
  247 |           selectedPlan: plan,
  248 |           travelersCount: 1,
  249 |           travelers: ['solo'],
  250 |           upgrades: { 1: upgrades },
  251 |           personalData: { name: 'Test', email: 'test@test.com', phone: '3001234567' },
  252 |           emergencyContact: { name: 'Test', phone: '3001234567', email: 'test@test.com' }
  253 |         },
  254 |         currentStep: 7,
  255 |         savedAt: Date.now()
  256 |       };
  257 |       localStorage.setItem('wizard_state', JSON.stringify(state));
  258 |     }, ['essential', ['preexistencias', 'deportes']]);
  259 |     await page.reload();
  260 | 
  261 |     // Aplicar cupón PROMO20
  262 |     await page.evaluate(() => {
  263 |       const stored = JSON.parse(localStorage.getItem('wizard_state'));
  264 |       stored.formData.appliedDiscount = {
  265 |         code: 'PROMO20',
  266 |         discountPercent: 20,
  267 |         label: '20% de descuento'
  268 |       };
  269 |       stored.currentStep = 7;
  270 |       localStorage.setItem('wizard_state', JSON.stringify(stored));
  271 |     });
  272 |     await page.reload();
  273 | 
  274 |     const botonPago = page.locator('button[type="submit"]').filter({ hasText: /Pagar \$/ });
  275 |     await expect(botonPago).toBeVisible();
  276 |     const botonText = await botonPago.textContent();
  277 |     const match = botonText.match(/\$(\d+\.\d{2})/);
  278 |     expect(match).not.toBeNull();
  279 | 
  280 |     // Cálculo: (plan - descuento) + upgrades = (25 - 5) + 32.70 = $52.70
  281 |     const precioEnBoton = parseFloat(match[1]);
  282 |     const expectedTotal = (PLAN_PRICE - (PLAN_PRICE * DISCOUNT_PROMO20 / 100)) + UPGRADE_PREE_XISTENCIAS + UPGRADE_DEPORTES;
> 283 |     expect(precioEnBoton).toBeCloseTo(expectedTotal, 2);
      |                           ^ Error: expect(received).toBeCloseTo(expected, precision)
  284 | 
  285 |     // Verificar que el descuento se aplicó correctamente (no aparece el precio sin descuento)
  286 |     expect(botonText).not.toContain(`$${PLAN_PRICE.toFixed(2)} USD`);
  287 |   });
  288 | 
  289 |   test('Debería rechazar números de tarjeta con formato inválido en producción', async ({ page }) => {
  290 |     // Este test verifica que el bypass de dev NO aplica en build de producción.
  291 |     // Nota: requiere `npm run build && npm run preview` corriendo.
  292 |     // En modo dev (isDev = true), el bypass siempre acepta 13-19 dígitos.
  293 |     // Este test documenta el comportamiento esperado para QA.
  294 |     test.skip(process.env.NODE_ENV !== 'production', 'Solo aplica en build de producción');
  295 |     // ... lógica condicional de Luhn
  296 |   });
  297 | });
```