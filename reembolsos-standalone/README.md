# Módulo de Reembolsos — Continental Assist

Módulo independiente de gestión de reembolsos. Diseño minimalista premium
(estilo Apple) con fondo gradient azul suave, tarjetas blancas con `shadow-sm`
y tipografía editorial.

## 📁 Estructura

```
src/
├── components/
│   ├── ReembolsosInfoCard.vue      # Columna izq: ilustración + bienvenida + beneficios + soporte
│   └── ReembolsosProgressBar.vue   # Indicador horizontal de 5 pasos
├── views/
│   ├── ReembolsosView.vue          # Layout wrapper (2 cols / 1 col según ruta)
│   ├── ReembolsosHome.vue          # "¿Qué quieres hacer hoy?" — 2 action cards
│   ├── ReembolsosConsult.vue       # Input código de seguimiento con validación
│   └── ReembolsosCreate.vue        # Wizard 5 pasos (paso 1 completo, resto placeholders)
└── assets/
    └── Asesor.png                  # Ilustración del info card
```

## 🛣️ Rutas

| Ruta | Vista | Info card visible |
|---|---|---|
| `/reembolsos` | `ReembolsosHome` | ✅ Sí (4/12) |
| `/reembolsos/crear` | `ReembolsosCreate` | ❌ No (1 col, max-w-3xl) |
| `/reembolsos/consultar` | `ReembolsosConsult` | ❌ No (1 col, max-w-3xl) |

## 🔌 Integración

### 1. Copiar los archivos

Copiá los 6 `.vue` y el `Asesor.png` a tu proyecto respetando la estructura.

### 2. Alias `@` (si no lo tenés)

`vite.config.js`:

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
})
```

### 3. Rutas en `src/router/index.js`

```js
const ReembolsosView    = () => import('@/views/reembolsos/ReembolsosView.vue')
const ReembolsosHome    = () => import('@/views/reembolsos/ReembolsosHome.vue')
const ReembolsosCreate  = () => import('@/views/reembolsos/ReembolsosCreate.vue')
const ReembolsosConsult = () => import('@/views/reembolsos/ReembolsosConsult.vue')

const routes = [
  // ... tus otras rutas
  {
    path: '/reembolsos',
    component: ReembolsosView,
    children: [
      { path: '',           name: 'reembolsos-home',      component: ReembolsosHome },
      { path: 'crear',      name: 'reembolsos-crear',     component: ReembolsosCreate },
      { path: 'consultar',  name: 'reembolsos-consultar', component: ReembolsosConsult }
    ]
  }
]
```

### 4. Link en el navbar (opcional)

Si querés que el usuario pueda entrar al módulo desde el navbar principal,
agregá un `RouterLink`:

```html
<RouterLink
  to="/reembolsos"
  class="text-xs font-semibold text-slate-600 hover:opacity-70"
>
  Reembolsos
</RouterLink>
```

## 🎨 Sistema de diseño

Todo el módulo usa los tokens del design system existente:

| Token | Valor | Uso |
|---|---|---|
| `--ds-primary` | `#00184C` | Headings, texto principal, botones primarios |
| `--ds-secondary` | `#43D3FF` | Acentos, links, íconos del info card |
| `--ds-cta` | `#F9D35A` | (reservado, no usado en este módulo) |
| `--ds-bg-alt` | `#EDF4F9` | Color base del gradient de fondo |
| `--ds-focus` | `#43D3FF` | Focus rings de inputs/buttons |

**Gradient de fondo:**
```css
background: linear-gradient(135deg, #EDF4F9 0%, #F7FBFD 50%, #FFFFFF 100%);
```

**Tarjetas:**
- `bg-white`
- `rounded-3xl`
- `shadow-sm`
- `border border-slate-100/70`

**Inputs:**
- `border-slate-200` (idle)
- `border-[#43D3FF] focus:ring-[#43D3FF]/15` (focus)

## 📐 Layout rules

### Contenedor principal
- `w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto`
- `pt-6 sm:pt-8 lg:pt-10 pb-10 sm:pb-14 lg:pb-16`

### Grid
- **Home** (`/reembolsos`): `grid-cols-1 lg:grid-cols-12 gap-8`
  - Info card: `lg:col-span-4 lg:sticky lg:top-10 lg:self-start`
  - Contenido: `lg:col-span-8`
- **Crear / Consultar**: `flex justify-center` con contenido `w-full max-w-3xl`

## ⚙️ Funcionalidad actual

| Vista | Estado |
|---|---|
| `ReembolsosHome` | ✅ Completa (links a crear/consultar) |
| `ReembolsosConsult` | ✅ UI + validación regex `^CA-[A-Z0-9]{5}-[A-Z0-9]{5}$` — `Consultar` simula 800ms |
| `ReembolsosCreate` | 🟡 Paso 1 (Identificación) completo. Pasos 2-5 son placeholders con state machine lista |

## 🔌 Endpoints a conectar (TODO)

- `POST /api/refunds` — Crear solicitud (paso 1 → 5)
- `GET /api/refunds/:code` — Consultar estado (ReembolsosConsult)
- `POST /api/refunds/:code/resend` — Reenviar código al correo
- Selector de idioma ES/EN/PT/FR — UI lista, falta i18n real

## 🚀 Stack

- Vue 3 (Composition API + `<script setup>`)
- Vue Router 4 (lazy-loading de vistas)
- Tailwind CSS (utility-first, tokens del design system)
- Sin dependencias externas adicionales
