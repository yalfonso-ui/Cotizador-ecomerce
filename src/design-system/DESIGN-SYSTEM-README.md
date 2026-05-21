# Sistema de Diseño — Guía Rápida

## Archivos del sistema

| Archivo | Descripción |
|---------|-------------|
| `DESIGN-SYSTEM.md` | Documentación completa del sistema (referencia) |
| `design-tokens.css` | Variables CSS + clases utility |
| `component-examples.vue` | 8 componentes de ejemplo con @vueuse/motion |
| `DESIGN-SYSTEM-README.md` | Esta guía rápida |

---

## Inicio Rápido

### 1. Instalación de dependencias

```bash
npm install @vueuse/motion lucide-vue-next
```

### 2. Importar CSS de tokens

```js
// main.js / main.ts
import './src/design-system/design-tokens.css'
```

### 3. Configurar Motion plugin

```js
// main.js / main.ts
import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'

const app = createApp(App)
app.use(MotionPlugin)
app.mount('#app')
```

### 4. Usar fuente Galano Grotesca (CDN)

```html
<!-- En tu index.html o App.vue, antes de cerrar </head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Galano+Grotesca:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## Reglas de Espaciado (8pt Grid)

### ✅ VALORES VÁLIDOS

| Clase | px  | Uso |
|-------|-----|-----|
| p-0   | 0   | Reset |
| p-1   | 8   | Padding interno pequeño |
| p-2   | 16  | Espaciado estándar |
| p-3   | 24  | Gap entre elementos relacionados |
| p-4   | 32  | Padding container |
| p-6   | 48  | Gap entre cards |
| p-8   | 64  | Secciones internas |
| p-12  | 96  | Separación de secciones |
| p-16  | 128 | Padding secciones principales |

### ❌ VALORES PROHIBIDOS

| Valor | Razón |
|-------|-------|
| p-5   | 40px — No es múltiplo de 8 |
| p-7   | 56px — No es múltiplo de 8 |
| p-9   | 72px — No es múltiplo de 8 |
| p-10  | 80px — Usar p-12 (96px) |
| p-[13px] | Valor arbitrario prohibido |
| m-[15px] | Valor arbitrario prohibido |

### Tabla de decisiones rápidas

| Elemento | Clase | Valor |
|----------|-------|-------|
| Padding card | `p-6` | 48px |
| Margin entre secciones | `my-16` | 128px |
| Gap entre cards | `gap-6` | 48px |
| Padding container | `px-4` | 32px |
| Section padding | `py-16` | 128px |
| Gap entre botones | `gap-3` | 24px |
| Padding badge | `px-2 py-1` | 16/8px |
| Iconos en navbar | `w-6 h-6` | 24px |

---

## Ejemplos de Código

### Botón Primary

```html
<button class="btn btn-primary btn-lg">
  Acción principal
</button>
```

### Botón CTA (siempre accent/amarillo)

```html
<button class="btn btn-accent btn-lg">
  Comprar ahora
</button>
```

### Card de producto

```html
<div class="card p-6">
  <div class="aspect-square bg-gray-100 rounded-lg mb-4"></div>
  <h3 class="font-heading text-lg font-semibold">Nombre producto</h3>
  <p class="text-secondary-500 font-bold">$99.900</p>
  <button class="btn btn-primary btn-md w-full mt-4">Añadir al carrito</button>
</div>
```

### Input con label y error

```html
<div>
  <label class="input-label" for="email">Correo electrónico</label>
  <input
    id="email"
    type="email"
    class="input"
    :class="{ 'input-error': errors.email }"
    placeholder="tu@email.com"
  />
  <span v-if="errors.email" class="input-error-message">
    {{ errors.email }}
  </span>
</div>
```

### Badge de oferta

```html
<span class="badge badge-accent">30% OFF</span>
```

### Animación con @vueuse/motion

```vue
<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 24 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 500, ease: [0.16, 1, 0.3, 1] } }"
  >
    Contenido que aparece con fade-up
  </div>
</template>
```

### Grid responsive de productos

```html
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
  <ProductCard v-for="p in products" :key="p.id" :product="p" />
</div>
```

---

## Checklist Antes de Implementar

### Configuración inicial
- [ ] Tailwind configurado con los colores del brand
- [ ] `@vueuse/motion` instalado y configurado como plugin
- [ ] `lucide-vue-next` instalado
- [ ] Fuentes (Galano Grotesca + Inter) cargadas
- [ ] `design-tokens.css` importado globalmente

### Espaciado
- [ ] No hay valores arbitrarios como `p-[13px]` o `m-[15px]`
- [ ] Todos los espaciados son múltiplos de 8px
- [ ] Padding de secciones usa la escala correcta (py-16 para secciones principales)

### Colores
- [ ] Colores primarios usan la escala `--color-primary-*`
- [ ] CTAs usan `--color-secondary` o `--color-accent`
- [ ] Errores usan `--color-error`, éxito usa `--color-success`

### Tipografía
- [ ] Headings usan `font-heading` (Galano Grotesca)
- [ ] Body usa `font-body` (Inter)
- [ ] Acentos decorativos (solo texto decorativo) usan `font-accent`

### Accesibilidad
- [ ] Contraste mínimo 4.5:1 para texto normal
- [ ] Todos los botones tienen `focus-visible` state
- [ ] Touch targets mínimo 44x44px en mobile
- [ ] Formularios tienen labels visibles (no placeholder-only)

### Animaciones
- [ ] Duración micro-interacciones: 150ms
- [ ] Duración transiciones: 300ms
- [ ] Duración entrada secciones: 600ms
- [ ] Respetar `prefers-reduced-motion`
- [ ] Solo animar transform/opacity (no width/height/top/left)

---

## Mejores Prácticas

### DO ✅
- Usar la escala de espaciado 8pt siempre
- Animar con `transform` y `opacity` para performance
- Usar `container` para centrado con max-width
- Definir z-index en escala (10, 20, 30, 40, 50) — nunca `z-[9999]`
- Usar `gap-*` en lugar de `m-*` entre elementos hijos
- Crear componentes reutilizables para patrones repetidos

### DON'T ❌
- Valores arbitrarios: `p-[13px]`, `m-[15px]`, `text-[15px]`
- Animar propiedades como `width`, `height`, `top`, `left`
- Usar z-index sin escala (z-index arbitrario)
- Fondos con gradiente en elementos interactivos pequeños
- Animaciones de más de 500ms para UI (excepto hero)
- Ignorar `prefers-reduced-motion`
