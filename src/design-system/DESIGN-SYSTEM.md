# Sistema de Diseño — E-commerce

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Sistema de Espaciado (8pt Grid)](#2-sistema-de-espaciado-8pt-grid)
3. [Paleta de Colores](#3-paleta-de-colores)
4. [Tipografía](#4-tipografía)
5. [Componentes UI](#5-componentes-ui)
6. [Iconografía](#6-iconografía)
7. [Layout & Grid System](#7-layout--grid-system)
8. [Animaciones](#8-animaciones)
9. [Sombras](#9-sombras)
10. [Bordes y Radius](#10-bordes-y-radius)
11. [Breakpoints Responsive](#11-breakpoints-responsive)
12. [Patrones de Diseño](#12-patrones-de-diseño)
13. [Checklist de Implementación](#13-checklist-de-implementación)

---

## 1. Introducción

Este sistema de diseño unifica la identidad visual del e-commerce. Está construido sobre un **8pt Grid** y utiliza **Tailwind CSS** como framework de utilidades con **Vue 3** + **@vueuse/motion** para animaciones.

### Principios de diseño

- **Consistencia**: Cada elemento sigue una escala predecible.
- **Performance**: Animaciones optimizadas con transform/opacity.
- **Accesibilidad**: Contraste mínimo 4.5:1, focus visible en todos los interactivos.
- **Mobile-first**: Diseñado desde mobile hacia desktop.

---

## 2. Sistema de Espaciado (8pt Grid)

Todos los espacios deben ser **múltiplos de 8px** para mantener consistencia visual.

### Escala de espaciado

| Clase | px  | Uso típico                     |
|-------|-----|---------------------------------|
| p-0   | 0   | Reset                           |
| p-1   | 8   | Padding interno pequeño         |
| p-2   | 16  | Padding interno estándar        |
| p-3   | 24  | Gap entre secciones relacionadas |
| p-4   | 32  | Padding container               |
| p-6   | 48  | Gap entre cards                 |
| p-8   | 64  | Secciones internas              |
| p-12  | 96  | Separación de secciones         |
| p-16  | 128 | Padding de secciones principal  |

### ❌ Valores NO permitidos

| Clase | px  | Motivo                          |
|-------|-----|---------------------------------|
| p-5   | 40  | No es múltiplo de 8             |
| p-7   | 56  | No es múltiplo de 8             |
| p-9   | 72  | No es múltiplo de 8             |
| p-10  | 80  | Usar p-12 (96px) mejor          |
| p-14  | 112 | Usar p-16 (128px) mejor         |
| p-[*] | -   | Evitar valores arbitrarios      |

### Usos recomendados

| Elemento              | Clase Tailwind | Valor |
|-----------------------|----------------|-------|
| Padding interno card  | p-6            | 48px  |
| Margin entre secciones| my-16          | 128px |
| Gap entre cards       | gap-6          | 48px  |
| Padding container     | px-4           | 32px  |
| Section vertical pad  | py-16          | 128px |
| Gap entre botones     | gap-3          | 24px  |
| Padding badge         | px-2 py-1      | 16/8px|

---

## 3. Paleta de Colores

### Colores de marca

| Token                | HEX      | RGB               | Uso                          |
|----------------------|----------|-------------------|------------------------------|
| --color-primary      | #00184C  | 0, 24, 76         | Fondo nav, headings, footer  |
| --color-secondary    | #43D3FF  | 67, 211, 255      | Botones, links, highlights   |
| --color-accent       | #F9D35A  | 249, 211, 90      | CTAs, badges, precio oferta  |

### Escala de primario

| Token                | HEX      | Uso                        |
|----------------------|----------|----------------------------|
| primary-50           | #E8ECF3  | Fondo claro                |
| primary-100          | #C5CDE2  | Hover en fondos            |
| primary-200          | #8E9EC2  | Borde sutil                |
| primary-300          | #5A6F9E  | Borde activo               |
| primary-400          | #2E4978  | Texto secundario           |
| primary-500          | #00184C  | Texto principal, fondo     |
| primary-600          | #00133D  | Hover estado oscuro        |
| primary-700          | #000F30  | Fondo footer               |
| primary-800          | #000A20  | Overlay                    |
| primary-900          | #000510  | Fondo extremo              |

### Escala de secundario

| Token                | HEX      | Uso                        |
|----------------------|----------|----------------------------|
| secondary-50         | #ECFAFF  | Fondo claro                |
| secondary-100        | #C5F0FF  | Badge informativo          |
| secondary-200        | #7BE0FF  | Hover                      |
| secondary-300        | #43D3FF  | Color principal            |
| secondary-400        | #1BA8D4  | Active state               |
| secondary-500        | #0A7A9E  | Texto link visitado        |

### Escala de acento

| Token                | HEX      | Uso                        |
|----------------------|----------|----------------------------|
| accent-50            | #FFF8E6  | Fondo promocional          |
| accent-100           | #FEEFC3  | Badge oferta               |
| accent-200           | #FBE38A  | Hover                      |
| accent-300           | #F9D35A  | Color principal            |
| accent-400           | #D4A82A  | Active state               |
| accent-500           | #A67D1A  | Texto                      |

### Neutros

| Token       | HEX      | Uso                          |
|-------------|----------|------------------------------|
| white       | #FFFFFF  | Fondos, cards                |
| gray-50     | #F8F9FA  | Fondos alternos              |
| gray-100    | #F0F2F5  | Borde sutil, hover           |
| gray-200    | #E1E4E8  | Borde estándar               |
| gray-300    | #C4C9D0  | Divider, disabled            |
| gray-400    | #9BA1AB  | Placeholder, texto muted     |
| gray-500    | #6B7380  | Texto secundario             |
| gray-600    | #4A5260  | Texto cuerpo                 |
| gray-700    | #343A45  | Heading                      |
| gray-800    | #1F232D  | Heading oscuro               |
| gray-900    | #0F1219  | Texto sobre claro            |
| black       | #000000  | Usar solo en casos extremos  |

### Semánticos

| Token           | HEX      | Uso                          |
|-----------------|----------|------------------------------|
| success         | #22C55E  | Stock disponible, confirmación|
| error           | #EF4444  | Error, stock agotado         |
| warning         | #F59E0B  | Advertencia, baja stock      |
| info            | #3B82F6  | Información                  |

### Gradientes predefinidos

```css
--gradient-primary: linear-gradient(135deg, #00184C 0%, #002B8A 100%);
--gradient-secondary: linear-gradient(135deg, #43D3FF 0%, #1BA8D4 100%);
--gradient-accent: linear-gradient(135deg, #F9D35A 0%, #D4A82A 100%);
--gradient-hero: linear-gradient(135deg, #00184C 0%, #0040A0 50%, #00184C 100%);
--gradient-cta: linear-gradient(135deg, #43D3FF 0%, #F9D35A 100%);
--gradient-dark: linear-gradient(180deg, #00184C 0%, #000F30 100%);
```

---

## 4. Tipografía

### Font Families

| Función  | Font             | Fallback            | Peso disponible       |
|----------|------------------|---------------------|-----------------------|
| Heading  | Galano Grotesca  | Montserrat, sans-serif | 300, 400, 500, 600, 700 |
| Accent   | Freestyle Script | Brush Script MT, cursive | 400                |
| Body     | Inter            | system-ui, sans-serif   | 300, 400, 500, 600    |
| Mono     | JetBrains Mono   | monospace           | 400, 500              |

### Escala tipográfica

| Clase Tailwind  | px   | rem    | Uso                        |
|-----------------|------|--------|----------------------------|
| text-xs         | 12   | 0.75   | Caption, metadata          |
| text-sm         | 14   | 0.875  | Labels, badges             |
| text-base       | 16   | 1      | Body text                  |
| text-lg         | 18   | 1.125  | Intro, lead                |
| text-xl         | 20   | 1.25   | Subheading                 |
| text-2xl        | 24   | 1.5    | Section heading pequeña    |
| text-3xl        | 32   | 2      | Section heading mediana    |
| text-4xl        | 40   | 2.5    | Hero heading pequeña       |
| text-5xl        | 48   | 3      | Hero heading               |
| text-6xl        | 56   | 3.5    | Hero heading grande        |
| text-7xl        | 64   | 4      | Display heading            |

### Line Height

| Uso        | Leading |
|------------|---------|
| Body text  | 1.625   |
| Headings   | 1.1     |
| Labels     | 1.2     |

### Ejemplos de uso

```html
<!-- Heading con Galano Grotesca -->
<h1 class="font-heading text-5xl text-primary-500">Nuevos Lanzamientos</h1>

<!-- Acento decorativo con Freestyle Script -->
<span class="font-accent text-3xl text-accent-300">Oferta Especial</span>

<!-- Body con Inter -->
<p class="font-body text-base text-gray-600 leading-relaxed">
  Descripción del producto...
</p>
```

---

## 5. Componentes UI

### 5.1 Botones

**Regla principal:** Los CTAs siempre usan la variante `accent` (amarillo sólido).

| Variante    | Clase                          | Uso                        |
|-------------|--------------------------------|----------------------------|
| Primary     | `btn btn-primary`              | Fondo azul oscuro (#00184C) |
| **Accent**  | `btn btn-accent`               | **CTA principal (amarillo)** |
| Secondary   | `btn btn-secondary`            | Cyan (#43D3FF)            |
| Outline     | `btn btn-outline`              | Acción alternativa         |
| Ghost       | `btn btn-ghost`                | Acción sutil               |
| Danger      | `btn btn-danger`               | Eliminar, destructivo      |

**Estados por defecto:**

| Estado | Comportamiento |
|--------|----------------|
| Default | Color sólido sin gradiente |
| Hover | Fondo ligeramente más oscuro + sombra del color del botón + translateY(-1px) |
| Active/Click | **Scale pulse** (scale 1 → 0.95 → 1.02 → 1, 200ms) + sombra removida |
| Disabled | opacity-50, cursor-not-allowed |
| Loading | Spinner animado + texto "Cargando..." |

**Hover shadow por variante:**

| Variante | Sombra en hover |
|----------|----------------|
| Primary | `0 4px 20px rgba(0, 24, 76, 0.35)` |
| Secondary | `0 4px 20px rgba(67, 211, 255, 0.35)` |
| Accent | `0 4px 20px rgba(249, 211, 90, 0.35)` |

**Tamaños**:

| Tamaño | Clase | px  |
|--------|-------|-----|
| sm     | btn-sm| 32  |
| md     | btn-md| 40  |
| lg     | btn-lg| 48  |
| xl     | btn-xl| 56  |

### 5.2 Cards

| Tipo          | Uso                          |
|---------------|------------------------------|
| ProductCard   | Producto con img, precio, CTA|
| InfoCard      | Contenido informativo        |
| FeatureCard   | Características con icono    |
| TestimonialCard| Review de cliente           |

### 5.3 Inputs

| Tipo           | Descripción                  |
|----------------|------------------------------|
| Input          | Texto, email, password       |
| Select         | Desplegable                  |
| Textarea       | Texto multi-línea            |
| SearchInput    | Búsqueda con icono           |
| QuantityInput  | Selector de cantidad         |

**Estados**: default, focus, error, disabled, success.

### 5.4 Badges

| Variante    | Clase              | Uso                        |
|-------------|--------------------|----------------------------|
| Default     | `badge`            | Etiqueta genérica          |
| Secondary   | `badge-secondary`  | Info                       |
| Accent      | `badge-accent`     | Oferta, promoción          |
| Success     | `badge-success`    | En stock                   |
| Error       | `badge-error`      | Agotado                    |
| Warning     | `badge-warning`    | Bajo stock                 |

### 5.5 Navegación

- **Navbar**: Logo + links + carrito + usuario (sticky, z-20).
- **Breadcrumbs**: Home > Categoría > Producto.
- **Pagination**: Navegación entre páginas de productos.
- **TabBar**: Filtros o categorías en mobile.
- **BottomNav** (mobile): Navegación inferior.

### 5.6 Feedback

| Componente    | Uso                         |
|---------------|------------------------------|
| Toast         | Notificación transitoria     |
| Skeleton      | Loading state de contenido   |
| Spinner       | Carga de acciones            |
| Modal         | Confirmación, formularios    |
| Drawer        | Carrito lateral, filtros     |
| EmptyState    | Sin resultados               |

---

## 6. Iconografía

### Librería

Usamos **[Lucide Icons](https://lucide.dev/icons/)** (`lucide-vue-next`) via el componente wrapper `AppIcon`.

**Instalación:**
```bash
npm install lucide-vue-next
```

### Componente AppIcon

```vue
<AppIcon name="cart" :size="24" />
<AppIcon name="search" :size="20" color="#00184C" />
<AppIcon name="heart" :size="16" class="text-red-500" />
```

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `name` | String | requerido | Nombre del icono (ver lista abajo) |
| `size` | Number | 24 | Tamaño en px |
| `strokeWidth` | Number | 1.5 | Grosor del trazo |
| `color` | String | currentColor | Color del icono |

### Tamaños

| Tamaño | Clase Tailwind | px  |
|--------|----------------|-----|
| xs     | w-4 h-4        | 16  |
| sm     | w-5 h-5        | 20  |
| md     | w-6 h-6        | 24  |
| lg     | w-8 h-8        | 32  |
| xl     | w-12 h-12      | 48  |

### Iconos disponibles

**Navegación:**
| name | Descripción |
|------|-------------|
| `search` | Búsqueda |
| `cart` | Carrito de compras |
| `user` | Usuario/perfil |
| `menu` | Menú hamburguesa |
| `x` | Cerrar |
| `chevron-left` | Flecha izquierda |
| `chevron-right` | Flecha derecha |
| `chevron-down` | Flecha abajo |
| `arrow-right` | Flecha derecha |
| `arrow-left` | Flecha izquierda |
| `home` | Inicio |

**E-commerce:**
| name | Descripción |
|------|-------------|
| `heart` | Favoritos |
| `star` | Rating/estrellas |
| `tag` | Etiqueta |
| `percent` | Descuento |
| `gift` | Regalo |
| `truck` | Envío |
| `package` | Paquete |
| `credit-card` | Pago |
| `shield-check` | Compra segura |
| `refresh-cw` | Devolución |
| `headphones` | Soporte |
| `shopping-bag` | Bolsa de compras |

**Social:**
| name | Descripción |
|------|-------------|
| `instagram` | Instagram |
| `facebook` | Facebook |
| `twitter` | Twitter/X |

**Contacto:**
| name | Descripción |
|------|-------------|
| `mail` | Email |
| `phone` | Teléfono |
| `map-pin` | Ubicación |
| `message-circle` | Chat |

**UI:**
| name | Descripción |
|------|-------------|
| `plus` | Más |
| `minus` | Menos |
| `check` | Check/confirmado |
| `alert-circle` | Error |
| `info` | Info |
| `loader` | Loading/spinner |
| `eye` | Ver |
| `eye-off` | Ocultar |
| `lock` | Candado |
| `external-link` | Abrir enlace |

**General:**
| name | Descripción |
|------|-------------|
| `settings` | Configuración |
| `logout` | Cerrar sesión |
| `help-circle` | Ayuda |
| `zap` | Relámpago/rápido |
| `trending-up` | Tendencia |
| `clock` | Reloj |
| `calendar` | Calendario |
| `globe` | Idioma/mundo |
| `filter` | Filtro |
| `sliders` | Ajustes |
| `image` | Imagen |
| `trash-2` | Eliminar |
| `edit` | Editar |
| `copy` | Copiar |

### Convenciones de uso

| Contexto          | Tamaño | Color                      |
|-------------------|--------|----------------------------|
| Navbar            | md (24)| text-gray-600             |
| Botones           | sm (20)| inherit del texto          |
| Input icons       | sm (20)| text-gray-400              |
| Feature cards     | xl (48)| text-secondary-300         |
| Rating stars      | sm (16)| text-accent-300            |
| Badges            | xs (16)| inherit                    |

### Agregar nuevos iconos

Para agregar un icono que no está en la lista, editar `src/components/AppIcon.vue` y añadir al objeto `iconImports`:

```js
// Dentro de iconImports
'my-icon': () => import('lucide-vue-next').then(m => m.MyIcon),
```

---

## 7. Layout & Grid System

### Grid base

```html
<!-- 12-column grid -->
<div class="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-6">
  ...
</div>
```

### Containers

```css
.container {
  @apply mx-auto px-4 max-w-7xl;
  /* 32px padding horizontal, 1280px max-width */
}
```

### Product Grid

```html
<!-- Responsive: 2 cols mobile, 3 tablet, 4 desktop -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
  <ProductCard v-for="product in products" :key="product.id" :product="product" />
</div>
```

### Layout de página

```
┌────────────────────────────────┐
│           Navbar (z-20)        │
├────────────────────────────────┤
│         Hero Section           │
├───────────┬────────────────────┤
│  Sidebar  │    Main Content    │
│  (filters) │    (product grid)  │
│   w-72    │    flex-1          │
├───────────┴────────────────────┤
│           Footer               │
└────────────────────────────────┘
```

### Z-Index System

| Componente     | z-index |
|----------------|---------|
| Base           | 0       |
| Dropdown       | 10      |
| Sticky Navbar  | 20      |
| Modal Backdrop | 30      |
| Modal          | 40      |
| Toast          | 50      |
| Tooltip        | 60      |

---

## 8. Animaciones

Usamos **@vueuse/motion** para animaciones declarativas con Vue.

### Instalación

```bash
npm install @vueuse/motion
```

### Configuración

```js
// main.js / main.ts
import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'

const app = createApp(App)
app.use(MotionPlugin)
app.mount('#app')
```

### Variantes predefinidas

| Variante      | Descripción                          |
|---------------|--------------------------------------|
| fade          | Opacity 0 → 1                        |
| fade-up       | Opacity 0 + translateY(24) → 0      |
| fade-down     | Opacity 0 + translateY(-24) → 0     |
| fade-left     | Opacity 0 + translateX(24) → 0      |
| fade-right    | Opacity 0 + translateX(-24) → 0     |
| scale-in      | Scale 0.9 → 1 + opacity 0 → 1       |
| slide-up      | translateY(48) → 0                   |

### Duración

| Tipo              | ms    |
|-------------------|-------|
| Micro-interacción | 150   |
| Transición estándar | 300 |
| Entrada de sección | 600  |
| Hero entrance      | 800  |

### Easing

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

### Ejemplo

```vue
<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 24 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 600, ease: easeOut } }"
  >
    Contenido animado
  </div>
</template>

<script setup>
const easeOut = [0.16, 1, 0.3, 1]
</script>
```

---

## 9. Sombras

| Token            | Clase Tailwind | Offset | Blur | Opacidad | Uso                  |
|------------------|----------------|--------|------|----------|----------------------|
| --shadow-sm      | shadow-sm      | 0 1px  | 2px  | 0.05     | Cards sutiles        |
| --shadow-md      | shadow-md      | 0 4px  | 6px  | 0.10     | Dropdown, cards      |
| --shadow-lg      | shadow-lg      | 0 10px | 15px | 0.15     | Modals               |
| --shadow-xl      | shadow-xl      | 0 20px | 25px | 0.20     | Drawers              |
| --shadow-2xl     | shadow-2xl     | 0 25px | 50px | 0.25     | Toasts, notificaciones|

### Sombras de color

```css
--shadow-primary: 0 4px 14px rgba(0, 24, 76, 0.25);
--shadow-secondary: 0 4px 14px rgba(67, 211, 255, 0.35);
--shadow-accent: 0 4px 14px rgba(249, 211, 90, 0.35);
```

---

## 10. Bordes y Radius

| Token            | px  | Clase Tailwind | Uso                    |
|------------------|-----|----------------|------------------------|
| --radius-sm      | 8   | rounded-lg     | Cards, inputs, botones |
| --radius-md      | 12  | rounded-xl     | Modals, dropdowns       |
| --radius-lg      | 16  | rounded-2xl    | Cards hero             |
| --radius-xl      | 24  | rounded-3xl    | Badges, tags            |
| --radius-full    | 32  | rounded-[32px] | Pill buttons, avatars  |

---

## 11. Breakpoints Responsive

| Breakpoint | Min-width | Clase Tailwind | Target                  |
|------------|-----------|----------------|-------------------------|
| xs         | 0        | default        | Mobile                  |
| sm         | 640px    | sm:            | Mobile landscape        |
| md         | 768px    | md:            | Tablet                  |
| lg         | 1024px   | lg:            | Desktop                 |
| xl         | 1280px   | xl:            | Desktop wide            |
| 2xl        | 1536px   | 2xl:           | Large screens           |

---

## 12. Patrones de Diseño

### 12.1 Hero Section

```
┌─────────────────────────────────┐
│  ┌─────────┐                    │
│  │  Logo   │  Nav  Cart  User   │ ← Navbar (sticky, z-20)
│  └─────────┘                    │
├─────────────────────────────────┤
│                                 │
│    Heading (Galano Grotesca)    │
│    Subheading (Inter)           │
│    [CTA Primary] [CTA Ghost]    │
│                                 │
│    ┌─────┐ ┌─────┐ ┌─────┐     │ ← Stats row
│    │ 12K │ │ 50+ │ │ 99% │     │
│    └─────┘ └─────┘ └─────┘     │
│                                 │
└─────────────────────────────────┘
```

**Background**: --gradient-hero o --gradient-primary.

### 12.2 Feature Cards

```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Icon   │ │  Icon   │ │  Icon   │ │  Icon   │ ← xl (48px)
│ Heading │ │ Heading │ │ Heading │ │ Heading │
│ Text     │ │ Text     │ │ Text     │ │ Text     │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

Grid: 1 col mobile → 2 tablet → 4 desktop.

### 12.3 CTA Section

```
┌─────────────────────────────────┐
│        Heading grande           │ ← text-4xl
│     Subheading descriptivo      │
│       [CTA Principal]           │
│   Última oferta - texto chico   │ ← accent text
└─────────────────────────────────┘
```

**Background**: --gradient-cta o --gradient-secondary.

### 12.4 Product Grid

```
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│  img  │ │  img  │ │  img  │ │  img  │ ← aspect-square
│ Nombre│ │ Nombre│ │ Nombre│ │ Nombre│
│ $99   │ │ $99   │ │ $99   │ │ $99   │ ← badge "Oferta"
│ [CTA] │ │ [CTA] │ │ [CTA] │ │ [CTA] │
└───────┘ └───────┘ └───────┘ └───────┘
```

Grid: 2 cols mobile → 3 tablet → 4 desktop.

---

## 13. Checklist de Implementación

### Fase 1: Fundación
- [ ] Configurar Tailwind con `tailwind.config.js` (colores, fonts, spacing)
- [ ] Agregar `@vueuse/motion` al proyecto
- [ ] Instalar `lucide-vue-next` para íconos
- [ ] Crear `design-tokens.css` e importarlo globalmente
- [ ] Configurar fuente Galano Grotesca (archivo local o CDN)
- [ ] Configurar fuente Freestyle Script (archivo local o CDN)
- [ ] Configurar fuente Inter (Google Fonts)

### Fase 2: Layout
- [ ] Crear componente `AppLayout.vue` (Navbar + slot + Footer)
- [ ] Crear `Navbar.vue` con estado sticky
- [ ] Crear `Footer.vue`
- [ ] Crear sistema de grid responsivo

### Fase 3: Componentes Base
- [ ] `AppButton.vue` (variantes + tamaños + estados)
- [ ] `AppInput.vue` (con label + error + estados)
- [ ] `AppCard.vue` (variantes)
- [ ] `AppBadge.vue` (variantes)
- [ ] `AppModal.vue`
- [ ] `AppToast.vue`
- [ ] `AppSkeleton.vue`

### Fase 4: Componentes de Dominio
- [ ] `ProductCard.vue`
- [ ] `ProductGrid.vue`
- [ ] `CartDrawer.vue`
- [ ] `SearchBar.vue`
- [ ] `QuantitySelector.vue`
- [ ] `PriceDisplay.vue`
- [ ] `Breadcrumbs.vue`
- [ ] `Pagination.vue`

### Fase 5: Páginas
- [ ] Home page
- [ ] Product Listing (categoría)
- [ ] Product Detail
- [ ] Cart
- [ ] Checkout
- [ ] Login / Register
- [ ] Account / Orders

### Fase 6: Testing y QA
- [ ] Verificar contraste de colores (mín 4.5:1)
- [ ] Testear todos los breakpoints (320 → 1920px)
- [ ] Verificar focus states en todos los interactivos
- [ ] Testear con lector de pantalla
- [ ] Verificar animaciones con `prefers-reduced-motion`
- [ ] Revisar que no hay valores de espaciado no-8pt
