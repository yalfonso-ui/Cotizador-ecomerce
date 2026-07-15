# Sistema de Diseño — Lemonade

Sistema de diseño minimalista, riguroso y legible. Pensado para interfaces que respiran, con jerarquía clara y un toque editorial tipo Apple.

## ¿Qué es esto?

Un kit portable con:

- **Tokens de color** (CSS custom properties `--ds-*`)
- **Paleta Tailwind** (`primary`, `secondary`, `accent`)
- **Clases de componente** reutilizables (`.ds-*`)
- **Tipografía** con Galano Grotesque + Inter (fallback) + Freestyle Script (acento)
- **Sistema de espaciado, radios y sombras**
- **Recetas de patrones** comunes (botones, inputs validados, sticky bars, carruseles)

Cada pieza está desacoplada. Puedes tomar solo lo que necesites.

---

## Integración rápida (5 minutos)

### 1. Tailwind config

Añade estas extensiones a tu `tailwind.config.js`:

```js
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8ECF3', 100: '#C5CDE2', 200: '#8E9EC2', 300: '#5A6F9E',
          400: '#2E4978', 500: '#00184C', 600: '#00133D', 700: '#0B1A3D',
          800: '#000A20', 900: '#000510'
        },
        secondary: {
          50: '#ECFAFF', 100: '#C5F0FF', 200: '#7BE0FF', 300: '#43D3FF',
          400: '#1BA8D4', 500: '#0A7A9E'
        },
        accent: {
          50: '#FFF8E6', 100: '#FEEFC3', 200: '#FBE38A', 300: '#F9D35A',
          400: '#D4A82A', 500: '#A67D1A'
        }
      },
      fontFamily: {
        heading: ['Galano Grotesque', 'Inter', 'sans-serif'],
        body: ['Galano Grotesque', 'Inter', 'sans-serif'],
        accent: ['Freestyle Script', 'cursive']
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem'
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px'
      }
    }
  },
  plugins: []
}
```

### 2. CSS base

Copia el contenido de `DESIGN_SYSTEM.md` sección "Tokens base" dentro de un `@layer base { :root { ... } }` en tu CSS principal. Ejemplo mínimo:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --ds-primary: #00184C;
    --ds-primary-soft: #002a6e;
    --ds-primary-dark: #000f33;
    --ds-secondary: #43D3FF;
    --ds-secondary-soft: rgba(67, 211, 255, 0.10);
    --ds-secondary-glow: rgba(67, 211, 255, 0.30);
    --ds-cta: #F9D35A;
    --ds-cta-hover: #e6c14d;
    --ds-cta-soft: rgba(249, 211, 90, 0.10);
    --ds-bg-alt: #EDF4F9;
    --ds-focus: #43D3FF;
    --ds-focus-ring: rgba(67, 211, 255, 0.20);
  }

  html, body {
    @apply bg-white text-slate-900 antialiased;
    font-family: 'Galano Grotesque', 'Inter', sans-serif;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Galano Grotesque', 'Inter', sans-serif';
    @apply font-bold tracking-tight text-slate-900;
  }
}
```

### 3. Componentes

Las clases `.ds-*` (botones, inputs, eyebrows, headings) están definidas en `DESIGN_SYSTEM.md` sección "Clases de componente". Cópialas en `@layer components { ... }` de tu CSS principal.

### 4. Tipografía (opcional)

Si quieres usar Galano Grotesque, coloca los archivos `.otf` en `src/assets/font/` y añade:

```css
@font-face {
  font-family: 'Galano Grotesque';
  src: url('./assets/font/GalanoGrotesqueRegular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
/* Repite para Light (300), Medium (500), SemiBold (600), Bold (700) */
```

Si no usas Galano, el sistema hace fallback automático a Inter (declarado en `font-family`).

---

## Cómo usar el sistema

Tienes tres formas de referenciar los tokens:

| Forma | Ejemplo | Cuándo |
|---|---|---|
| **CSS custom property** | `style="background-color: #00184C"` o `class="text-[color:var(--ds-primary)]"` | Valores únicos que no se repiten |
| **Clase Tailwind de paleta** | `class="bg-primary-500"` | Cualquier color de la paleta, repetido en muchos sitios |
| **Clase de componente** | `class="ds-cta"` `class="ds-eyebrow"` | Componentes listos para usar, sin tocar markup extra |

**Regla general**: si el mismo color aparece en 3+ lugares, conviene tener una clase de componente o usar la paleta de Tailwind. Si aparece solo una vez, `style="color: var(--ds-xxx)"` está bien.

---

## Cómo cambiar la marca (rebranding)

El sistema está pensado para que cambiar la identidad visual sea un cambio mínimo. Hay **5 valores** que controlan prácticamente todo:

1. `--ds-primary` (azul oscuro institucional)
2. `--ds-secondary` (celeste decorativo)
3. `--ds-cta` (amarillo de conversión)
4. `--ds-bg-alt` (fondo alternativo)
5. `--ds-focus` (color del anillo de foco)

Cámbialos en `tokens.css` (o donde declares los `:root`) y propaga automáticamente a:

- Las clases `.ds-*` que los referencian
- Las clases Tailwind que extiendes (`primary-500`, `secondary-300`, etc.)

Las **paletas extendidas** de Tailwind (`primary-50` → `primary-900`, etc.) son gradientes del color principal. Si quieres una marca con un solo tono, puedes dejar solo `primary-500`. Si quieres matices, genera el resto con un generador de paletas ([Tailwind Shades](https://www.tailwindshades.com/), [Palette App](https://palette.app/)) usando el valor 500 como ancla.

---

## Arquitectura del sistema

```
src/design-system/
├── README.md              ← este archivo (punto de entrada)
└── DESIGN_SYSTEM.md       ← referencia completa
```

Todo cabe en estos dos archivos. Si en el futuro necesitas separarlos más (ej. para un sistema multi-marca), la estructura es trivialmente extensible:

```
src/design-system/
├── README.md
├── DESIGN_SYSTEM.md
├── tokens.css              ← @layer base + custom properties (opcional)
├── tailwind.config.js      ← extensión de Tailwind (opcional)
├── font-face.css           ← @font-face blocks (opcional)
└── components.css          ← @layer components con .ds-* (opcional)
```

---

## Filosofía de diseño

1. **Minimalismo riguroso**: menos elementos, más espacio negativo, tipografía editorial.
2. **Legibilidad absoluta**: contraste alto, tamaños de fuente cómodos, estados de foco claros.
3. **Espacio en blanco como ritmo**: la separación entre elementos guía la lectura.
4. **Jerarquía visual clara**: títulos grandes, eyebrows sutiles, body sin compite.
5. **Movimiento intencional**: transiciones de 200ms, easing por defecto, sin bouncing.

### Anti-patrones que evitamos

- Bordes de 1px cuando el contexto pide más presencia
- Colores cyan o magenta para acentos (la paleta es azul + blanco + amarillo editorial)
- Backdrop-blur en sticky bars (causa jank de scroll)
- Múltiples sombras pesadas apiladas
- Inputs con placeholder como label
- Texto uppercase con letter-spacing > 0.1em para cosas que no son eyebrows

---

## Convenciones de nomenclatura

| Prefijo | Tipo | Ejemplo |
|---|---|---|
| `--ds-*` | CSS custom property (token) | `--ds-primary` |
| `.ds-*` | Clase de componente | `.ds-cta` |
| `--ds-success` | Estados (propuesto, aún no implementado en este proyecto) | `--ds-success` |
| `.hide-scroll-bar` | Utilidad miscelánea (sin prefijo `ds-` porque no es de diseño per se) | `.hide-scroll-bar` |

---

## Próximos pasos sugeridos

Si adoptas este sistema en un nuevo proyecto, considera:

1. **Añadir tokens de estado**: `--ds-success`, `--ds-error`, `--ds-warning` para estandarizar los patrones actuales de borde verde/rojo
2. **Documentar iconografía**: actualmente todo es SVG inline con stroke-width 1.75 (fino) o 2.5 (énfasis). Vale la pena formalizar este patrón.
3. **Crear un Storybook o similar**: para documentar visualmente cada componente y sus estados (default, hover, disabled, loading, error, success)

---

## Licencia y atribución

Tipografía **Galano Grotesque** — verifica la licencia antes de usar comercialmente. El sistema en sí (estructura, tokens, clases) es portable y reutilizable.