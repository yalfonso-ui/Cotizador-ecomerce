# Sistema de Diseño — Referencia Completa

Documentación técnica de cada token, clase y patrón del sistema. Para la guía de adopción, ver `README.md` en esta misma carpeta.

---

## Tabla de contenidos

1. [Filosofía](#filosofía)
2. [Tokens de color](#tokens-de-color)
3. [Tipografía](#tipografía)
4. [Espaciado y radios](#espaciado-y-radios)
5. [Estados visuales](#estados-visuales)
6. [Clases de componente](#clases-de-componente)
7. [Patrones de interacción](#patrones-de-interacción)
8. [Recetas](#recetas)
9. [Accesibilidad](#accesibilidad)

---

## Filosofía

Tres principios rectores:

1. **Minimalismo riguroso** — Cada elemento gana su lugar. Si no aporta, se quita.
2. **Legibilidad absoluta** — Tipografía editorial, contraste alto, foco claro.
3. **Espacio en blanco como ritmo** — La separación guía la lectura más que el color o el tamaño.

### Tono visual

- Limpio, atemporal, sin tendencias
- Profesional pero accesible
- Inspirado en interfaces Apple/editorial (no skeuomórfico, no maximalista)

---

## Tokens de color

### Paleta primaria (azul oscuro institucional)

| Token | Hex | Uso |
|---|---|---|
| `--ds-primary` | `#00184C` | Botones primarios, texto destacado, fondos de marca |
| `--ds-primary-soft` | `#002a6e` | Hover state del primary |
| `--ds-primary-dark` | `#000f33` | Active state del primary |
| `--ds-bg-alt` | `#EDF4F9` | Fondo alternativo (soft blue-gray) |

**Paleta Tailwind equivalente** (gradiente de 50 a 900):

```js
primary: {
  50:  '#E8ECF3', 100: '#C5CDE2', 200: '#8E9EC2', 300: '#5A6F9E',
  400: '#2E4978', 500: '#00184C', 600: '#00133D', 700: '#0B1A3D',
  800: '#000A20', 900: '#000510'
}
```

### Paleta secundaria (celeste)

| Token | Hex | Uso |
|---|---|---|
| `--ds-secondary` | `#43D3FF` | Acentos decorativos, highlights |
| `--ds-secondary-soft` | `rgba(67, 211, 255, 0.10)` | Backgrounds suaves |
| `--ds-secondary-glow` | `rgba(67, 211, 255, 0.30)` | Glows, sombras de acento |

```js
secondary: {
  50: '#ECFAFF', 100: '#C5F0FF', 200: '#7BE0FF', 300: '#43D3FF',
  400: '#1BA8D4', 500: '#0A7A9E'
}
```

### Paleta CTA (amarillo de conversión)

| Token | Hex | Uso |
|---|---|---|
| `--ds-cta` | `#F9D35A` | Botones primarios de acción (continuar, pagar) |
| `--ds-cta-hover` | `#e6c14d` | Hover state del CTA |
| `--ds-cta-soft` | `rgba(249, 211, 90, 0.10)` | Backgrounds suaves |

```js
accent: {
  50: '#FFF8E6', 100: '#FEEFC3', 200: '#FBE38A', 300: '#F9D35A',
  400: '#D4A82A', 500: '#A67D1A'
}
```

### Foco

| Token | Valor | Uso |
|---|---|---|
| `--ds-focus` | `#43D3FF` | Anillo de focus ring (azul) |
| `--ds-focus-ring` | `rgba(67, 211, 255, 0.20)` | Halo de focus |

---

## Tipografía

### Familias

| Familia | Uso | Stack |
|---|---|---|
| **Galano Grotesque** | Headings + body principal | `'Galano Grotesque', 'Inter', sans-serif` |
| Inter | Fallback universal | Incluido en stack |
| **Freestyle Script** | Acentos editoriales (decorativos) | `'Freestyle Script', cursive` |

### Pesos Galano Grotesque

- Light (300) — text editorial sutil
- Regular (400) — body por defecto
- Medium (500) — UI emphasis
- SemiBold (600) — subheadings
- Bold (700) — headings

### Escala tipográfica (jerarquía visual)

| Rol | Tamaño | Peso | Tracking | Color | Uso |
|---|---|---|---|---|---|
| **Eyebrow** | `text-xs` (12px) | medium | normal | `text-slate-500` | Etiqueta sobre sección, kicker |
| **H1** | `text-3xl md:text-4xl` | bold | tight | `text-slate-900` | Título principal de step/página |
| **H2** | `text-2xl md:text-3xl` | semibold | tight | `text-slate-900` | Subsección importante |
| **H3** | `text-lg` (18px) | bold | tight | `text-slate-900` | Título de card |
| **Body** | `text-base` (16px) | regular | normal | `text-slate-700/900` | Contenido principal |
| **Helper** | `text-xs` (12px) | medium | normal | `text-slate-400` | Texto de apoyo |
| **Label** | `text-[10px]` | bold | `tracking-wider` (uppercase) | `text-slate-500` | Labels de inputs |

### Convenciones

- **Eyebrows en sentence-case** (`"Tu respaldo, a tu medida"`), no uppercase
- **Tracking tight** (`tracking-tight`) en todos los headings
- **Body usa medium/regular** para legibilidad, no light

---

## Espaciado y radios

### Espaciado

Tailwind estándar + dos extensiones:

| Clase | Valor | Uso |
|---|---|---|
| `spacing.18` | `4.5rem` (72px) | Padding vertical de hero |
| `spacing.22` | `5.5rem` (88px) | Padding vertical extra generoso |

Para el resto, usar la escala estándar de Tailwind (`p-2`, `p-4`, `p-6`, `gap-4`, `gap-6`, etc.).

### Radios (border radius)

| Clase | Valor | Uso |
|---|---|---|
| `rounded-md` | 6px | Elementos pequeños (badges) |
| `rounded-xl` | 12px | Inputs, cards pequeñas |
| `rounded-2xl` | 16px | Inputs grandes, dropdowns |
| `rounded-3xl` | 24px | Cards principales, modales |
| `rounded-full` | 50% | Botones pill, avatares |

**Convención**: el sistema tiende hacia radios generosos (`rounded-2xl` como default para inputs grandes, `rounded-3xl` para cards). Solo `rounded-md` para badges pequeños.

### Shadows

El sistema prefiere **bordes sutiles** sobre sombras pesadas. Cuando se usan sombras:

- `shadow-sm` — separador ligero entre elementos
- `shadow-md` — tarjetas elevadas (dropdowns, modales)
- `shadow-xl` / `shadow-2xl` — overlays importantes (modales fullscreen)

**Anti-patrón**: no apilar múltiples sombras (`shadow-md shadow-lg` no se ve bien, genera efecto borroso).

---

## Estados visuales

### Estados de input (estandarizados)

Todos los inputs del sistema siguen la misma convención de tres estados:

| Estado | Border | Ring | Background |
|---|---|---|---|
| **Default** | `border-slate-200` (2px) | — | `bg-white` |
| **Focus** | `border-[color:var(--ds-focus)]` | `focus:ring-2 focus:ring-[color:var(--ds-focus-ring)]` | `bg-white` |
| **Valid (tocado)** | `border-emerald-500` | `ring-2 ring-emerald-400/30` | `bg-emerald-50/40` |
| **Error** | `border-red-400` | `focus:ring-red-100` | `bg-red-50/30` |
| **Disabled** | `border-slate-200` | `cursor-not-allowed` | `bg-slate-50/50` |

**Implementación**:

```vue
<input
  class="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-2xl
         text-slate-900 placeholder:text-slate-400 transition-all
         focus:outline-none focus:border-[color:var(--ds-focus)]
         focus:ring-2 focus:ring-[color:var(--ds-focus-ring)]"
  :class="[
    isValid && isTouched
      ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40'
      : '',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30'
      : ''
  ]"
/>
```

### Estados de botón

| Estado | Primary CTA (amarillo) | Botón secundario |
|---|---|---|
| **Default** | `bg-[color:var(--ds-cta)] text-[color:var(--ds-primary)]` | `bg-white border-2 border-[color:var(--ds-primary)] text-[color:var(--ds-primary)]` |
| **Hover** | `hover:brightness-95` | `hover:bg-[color:var(--ds-primary)] hover:text-white` |
| **Active** | `active:scale-[0.98]` | `active:scale-[0.98]` |
| **Disabled** | `opacity-50 cursor-not-allowed` | `opacity-50 cursor-not-allowed` |
| **Focus** | `focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] focus-visible:ring-offset-2` | (igual) |

### Estados de loading

Tres patrones oficiales:

1. **Spinner simple** — para validación rápida
   ```html
   <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
     <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="3" />
     <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
   </svg>
   ```

2. **Botón deshabilitado con texto** — durante validación
   ```html
   <button :disabled="isValidating">
     <span v-if="isValidating" class="inline-flex items-center gap-2">
       <svg class="w-4 h-4 animate-spin">...</svg>
       Validando…
     </span>
     <span v-else>Confirma tus fechas</span>
   </button>
   ```

3. **Estado de proceso (multi-step)** — para flujos largos
   ```js
   // procesar → validar → activar
   setTimeout(() => processingStep.value = 'Validando tu tarjeta…', 0)
   setTimeout(() => processingStep.value = 'Procesando tu pago…', 500)
   setTimeout(() => processingStep.value = 'Activando tu cobertura…', 1000)
   ```

---

## Clases de componente

### `.ds-focus-column`

Columna central estricta para steps y formularios.

```vue
<div class="ds-focus-column gap-8">
  <!-- contenido centrado, max-w-md -->
</div>
```

CSS generado: `w-full max-w-md mx-auto flex flex-col items-center text-center`

### `.ds-input` + `.ds-input--lg`

Inputs con bordes sutiles, focus ring celeste.

```vue
<input class="ds-input ds-input--lg" placeholder="..." />
```

CSS generado:
```css
.ds-input { @apply w-full bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-[color:var(--ds-focus)] focus:ring-2 focus:ring-[color:var(--ds-focus-ring)]; }
.ds-input--lg { @apply h-14 px-4 text-base; }
```

### `.ds-cta`

Botón CTA amarillo píldora con todos los estados.

```vue
<button class="ds-cta">Inicia aquí</button>
```

CSS generado:
```css
.ds-cta { @apply inline-flex items-center justify-center gap-2.5 bg-[color:var(--ds-cta)] hover:bg-[color:var(--ds-cta-hover)] active:scale-[0.99] text-[color:var(--ds-primary)] font-bold text-base px-8 py-3.5 rounded-full shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-secondary)] focus-visible:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:active:scale-100; }
```

### `.ds-eyebrow`

Etiqueta pequeña sobre secciones.

```vue
<span class="ds-eyebrow">Tu respaldo, a tu medida</span>
```

CSS: `text-slate-500 text-sm font-medium tracking-wide block`

### `.ds-heading-1`

Título principal H1.

```vue
<h1 class="ds-heading-1">Elige la cobertura ideal</h1>
```

CSS: `text-3xl md:text-4xl font-bold text-[color:var(--ds-primary)] tracking-tight`

### `.ds-helper`

Texto de ayuda discreto.

```vue
<p class="ds-helper">Información adicional</p>
```

CSS: `text-xs text-slate-400`

### `.ds-selector`

Bloque selector tipo tarjeta plana (inputs de país/fecha grandes).

```vue
<div class="ds-selector">...</div>
```

CSS: `w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between transition-colors duration-200 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]`

### `.ds-upgrade-card` + `.ds-upgrade-card-active`

Tarjetas de upgrade (estado normal y activo sobre fondo oscuro).

```vue
<article class="ds-upgrade-card">...</article>
<article class="ds-upgrade-card-active">...</article>
```

### `.ds-bento-card` + `.ds-bento-card-secondary`

Tarjetas bento informativas.

```vue
<div class="ds-bento-card">Información positiva</div>
<div class="ds-bento-card-secondary">Información alternativa</div>
```

### `.ds-bg-alt`

Helper para aplicar el background alternativo.

```vue
<div class="ds-bg-alt">...</div>
```

### `.hide-scroll-bar` (utility)

Oculta las barras de scroll nativas manteniendo el scroll por inercia.

```vue
<div class="hide-scroll-bar overflow-x-auto">...</div>
```

CSS:
```css
.hide-scroll-bar { scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
.hide-scroll-bar::-webkit-scrollbar { display: none; width: 0; height: 0; }
```

---

## Patrones de interacción

### Focus ring estándar

Todos los elementos interactivos (botones, inputs, links) deben tener:

```html
class="focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] focus-visible:ring-offset-2"
```

**Variantes**:
- Sin `ring-offset` para inputs con borde propio (el ring compite)
- Con `ring-offset-2` para botones sin fondo (mejor contraste sobre fondo blanco)

### Hover/active/disabled

Convención estándar:
- **Hover**: cambio de color o background, transición 200ms
- **Active**: `active:scale-[0.98]` para feedback táctil
- **Disabled**: `opacity-50 cursor-not-allowed disabled:active:scale-100`

### Sticky bottom bar (patrón fijo)

Patrón para barras fijas al fondo del viewport:

```html
<div class="sticky bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 sm:px-6 py-3">
  <!-- contenido -->
</div>
```

**Reglas críticas** (lo que NO hacer):
- ❌ No usar `backdrop-blur-md` con `bg-white/90` (causa jank de scroll)
- ❌ No usar `shadow-[0_-4px_12px_rgba(...)]` arbitrario (causa repaints)
- ✅ Usar `bg-white` sólido + `border-t border-slate-200` para separar
- ✅ Padding inferior generoso (`pb-20`+) en el contenedor padre para evitar solapamiento

### Carrusel horizontal (patrón fijo)

Patrón para carruseles de cards con scroll-snap:

```html
<div class="relative">
  <!-- Flechas absolutas -->
  <button class="absolute left-2 top-1/2 -translate-y-1/2 z-20 ..." @click="scrollCarousel('left')">←</button>
  <button class="absolute right-2 top-1/2 -translate-y-1/2 z-20 ..." @click="scrollCarousel('right')">→</button>
  
  <!-- Contenedor scrollable -->
  <div ref="carouselRef" class="flex flex-nowrap gap-4 overflow-x-auto snap-x snap-proximity w-full pb-8 hide-scroll-bar">
    <article class="shrink-0 w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%+0.25rem)] snap-center mx-4 ...">
      <!-- card -->
    </article>
  </div>
</div>
```

**Reglas críticas**:
- ❌ NO usar `scroll-smooth` Tailwind class (choca con `snap-proximity` durante drag)
- ✅ Usar `snap-proximity` (no `snap-mandatory`) para evitar saltos bruscos
- ✅ Deshabilitar `scrollSnapType` inline durante `scrollBy` y restaurar tras `scrollend`
- ✅ Flechas deben tener `@mousedown.stop @touchstart.stop` para no iniciar drag accidental
- ✅ Cada flecha debe tener `pointer-events-auto`

### Modal con backdrop

Patrón para modales con backdrop:

```html
<Teleport to="body">
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-end md:items-center justify-center" @click.self="close">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
    <div class="relative w-full md:max-w-6xl md:mx-4 bg-white rounded-t-3xl md:rounded-2xl shadow-xl max-h-[92vh] flex flex-col overflow-hidden">
      <!-- contenido -->
    </div>
  </div>
</Teleport>
```

---

## Recetas

### Nuevo botón primario (amarillo)

```vue
<button class="ds-cta">
  Acción principal
  <svg class="w-4 h-4 text-white"><!-- flecha --></svg>
</button>
```

### Nuevo botón secundario (outline)

```vue
<button class="inline-flex items-center justify-center gap-2.5 py-3 px-6 text-sm font-semibold text-[color:var(--ds-primary)] bg-white border-2 border-[color:var(--ds-primary)] hover:bg-[color:var(--ds-primary)] hover:text-white active:scale-[0.98] rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-secondary)]">
  Acción secundaria
</button>
```

### Nuevo input con validación

```vue
<template>
  <div>
    <label :for="id" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
      Label
    </label>
    <div class="relative">
      <input
        :id="id"
        v-model="value"
        type="text"
        placeholder="Placeholder"
        class="w-full h-12 px-3.5 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 text-base placeholder:text-slate-400 transition-all focus:outline-none font-semibold"
        :class="[
          isValid && touched
            ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40'
            : 'focus:border-[color:var(--ds-focus)] focus:ring-2 focus:ring-[color:var(--ds-focus-ring)]',
          hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30'
            : ''
        ]"
      />
      <svg v-if="isValid && touched" class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none">
        <path d="M5 13l4 4L19 7" stroke-width="2.5" />
      </svg>
    </div>
  </div>
</template>
```

### Nuevo sticky bottom bar

```html
<!-- Última sección del template del step -->
<div class="sticky bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3">
  <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
    <div class="min-w-0">
      <p class="text-sm font-semibold text-slate-900">Contexto</p>
      <p class="text-xs text-slate-500">Detalle adicional</p>
    </div>
    <button class="ds-cta">Acción</button>
  </div>
</div>
```

**Importante**: añadir `pb-20` o más al contenedor padre para evitar solapamiento del contenido con la barra sticky.

### Nuevo selector de país (dropdown)

```vue
<template>
  <div class="relative">
    <button
      @click="toggle"
      class="w-full bg-white border border-slate-200/80 rounded-2xl pl-3 pr-4 py-3 flex items-center justify-between hover:border-slate-300 focus:outline-none focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
    >
      <!-- contenido seleccionado -->
    </button>
    
    <div v-if="isOpen" class="absolute left-0 right-0 top-full mt-2 z-30 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      <div class="relative">
        <input v-model="search" type="text" class="w-full h-12 pl-10 ..." />
      </div>
      <div class="max-h-60 overflow-y-auto">
        <button v-for="opt in filtered" :key="opt.code" @click="select(opt)" class="...">
          <!-- opción con flag/checkbox -->
        </button>
      </div>
      <button v-if="hasSelection" @click="confirm" class="w-full bg-[color:var(--ds-primary)] text-white ...">
        Hecho
      </button>
    </div>
  </div>
</template>
```

---

## Accesibilidad

### Checklist obligatorio para todo componente nuevo

- [ ] **Botones**: `aria-label` cuando es solo icono, `aria-pressed` cuando es toggle
- [ ] **Inputs**: `id` enlazado con `label[for]`, `aria-invalid` cuando hay error, `aria-describedby` para errores
- [ ] **Secciones**: `role="region"` con `aria-label` para sticky bars
- [ ] **Modales**: `role="dialog"` + `aria-modal="true"` + `aria-labelledby` apuntando al título
- [ ] **Estados**: `aria-checked` en checkboxes, `aria-expanded` en collapsibles
- [ ] **Focus trap**: el modal debe atrapar el foco (composable `useModalFocus`)
- [ ] **Live regions**: `aria-live="polite"` para toasts/notifications
- [ ] **Tab order**: debe seguir el orden visual (no usar `tabindex` positivo arbitrario)

### Atajos de teclado estándar

- **Esc** — cerrar modal/dropdown
- **Tab** — siguiente elemento
- **Shift+Tab** — elemento anterior
- **Enter/Space** — activar botón/link
- **Arrow keys** — navegar entre opciones (en dropdowns/calendarios)

---

## Versión y mantenimiento

- **Versión actual**: 1.0
- **Última revisión**: coincide con la implementación del proyecto Lemonade
- **Compatibilidad**: Vue 3 + Tailwind CSS 3.x

Cuando agregues un nuevo token o clase, actualiza este documento en la misma PR.