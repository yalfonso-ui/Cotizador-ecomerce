<script setup>
import { useRouter } from 'vue-router'

/**
 * ReembolsosHome
 * ─────────────────────────────────────────────────────────────
 * Vista principal del módulo de reembolsos. Pregunta al usuario
 * qué quiere hacer y le ofrece dos caminos:
 *   1. Crear reembolso (wizard de 5 pasos)
 *   2. Consultar reembolso (input de código de seguimiento)
 *
 * Estilo: dos tarjetas de acción de igual tamaño, sin botones
 * pesados — usa enlaces de acción con flecha (rotated 45° como
 * en el resto de la plataforma).
 */

const router = useRouter()

function goCreate() {
  router.push({ name: 'reembolsos-crear' })
}

function goConsult() {
  router.push({ name: 'reembolsos-consultar' })
}
</script>

<template>
  <section
    class="bg-white rounded-3xl shadow-sm border border-slate-100/70 p-8 sm:p-10 lg:p-12"
    aria-labelledby="reembolsos-home-title"
  >
    <!-- Eyebrow -->
    <p class="text-[11px] font-bold tracking-[0.18em] text-[#43D3FF] uppercase">
      Portal de reembolsos
    </p>

    <!-- Título -->
    <h2
      id="reembolsos-home-title"
      class="mt-3 text-3xl sm:text-4xl font-bold text-[#00184C] leading-tight tracking-tight"
    >
      ¿Qué quieres hacer hoy?
    </h2>

    <!-- Subtítulo -->
    <p class="mt-3 text-sm sm:text-base text-slate-500">
      Elige una opción para empezar.
    </p>

    <!-- Grid de acciones: Crear | Consultar -->
    <div class="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      <!-- ── Card 1: Crear reembolso ── -->
      <button
        type="button"
        @click="goCreate"
        class="group relative text-left bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 transition-all duration-200 ease-out hover:border-[#43D3FF]/60 hover:shadow-md hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
      >
        <!-- Icono: plus en cuadrado rounded con fondo cyan claro (igual que el de Consultar) -->
        <div
          class="w-12 h-12 rounded-2xl bg-[#43D3FF]/12 flex items-center justify-center mb-5 border border-[#43D3FF]/20 transition-transform duration-200 group-hover:scale-105"
          aria-hidden="true"
        >
          <svg
            class="w-5 h-5 text-[#00184C]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M12 5v14M5 12h14"
            />
          </svg>
        </div>

        <h3 class="text-lg sm:text-xl font-bold text-[#00184C] tracking-tight">
          Crear reembolso
        </h3>
        <p class="mt-2 text-sm text-slate-500 leading-relaxed">
          Radica una nueva solicitud. Te guiamos paso a paso; toma unos minutos.
        </p>

        <!-- Action link con flecha -->
        <span
          class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#43D3FF] group-hover:gap-2.5 transition-all duration-200"
        >
          Empezar solicitud
          <svg
            class="w-3.5 h-3.5 text-current transform rotate-45"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </span>
      </button>

      <!-- ── Card 2: Consultar reembolso ── -->
      <button
        type="button"
        @click="goConsult"
        class="group relative text-left bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 transition-all duration-200 ease-out hover:border-[#43D3FF]/60 hover:shadow-md hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
      >
        <!-- Icono: lupa en cuadrado rounded con fondo sutil cyan -->
        <div
          class="w-12 h-12 rounded-2xl bg-[#43D3FF]/12 flex items-center justify-center mb-5 border border-[#43D3FF]/20 transition-transform duration-200 group-hover:scale-105"
          aria-hidden="true"
        >
          <svg
            class="w-5 h-5 text-[#00184C]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>

        <h3 class="text-lg sm:text-xl font-bold text-[#00184C] tracking-tight">
          Consultar reembolso
        </h3>
        <p class="mt-2 text-sm text-slate-500 leading-relaxed">
          ¿Ya radicaste? Mira el estado de tu caso con tu código de seguimiento.
        </p>

        <!-- Action link con flecha -->
        <span
          class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#43D3FF] group-hover:gap-2.5 transition-all duration-200"
        >
          Consultar estado
          <svg
            class="w-3.5 h-3.5 text-current transform rotate-45"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </span>
      </button>
    </div>
  </section>
</template>
