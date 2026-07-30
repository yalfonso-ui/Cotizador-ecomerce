<script setup>
import { ref, computed } from 'vue'

/**
 * ReembolsosConsult
 * ─────────────────────────────────────────────────────────────
 * Vista para "Consultar reembolso". El usuario ingresa su código
 * de seguimiento con formato `CA-XXXXX-XXXXX` (5 chars + 5 chars
 * alfanuméricos) y la app valida antes de habilitar el botón.
 *
 * Estados:
 *   - idle: input vacío, botón disabled
 *   - typing: usuario está escribiendo
 *   - valid: formato OK, botón habilitado
 *   - invalid: formato incorrecto tras onBlur, mensaje de error sutil
 *
 * Estilo: input minimalista (borde apenas visible, focus ring
 * cyan), botón primario redondeado con flecha (mismo patrón
 * que el resto de CTAs de la plataforma).
 *
 * NOTA: "Consultar" no hace fetch real todavía.
 * Solo simula un pequeño loader y muestra un mensaje de "próximamente".
 */

const code = ref('')
const touched = ref(false)
const isLoading = ref(false)

const CODE_REGEX = /^CA-[A-Z0-9]{5}-[A-Z0-9]{5}$/

const isValid = computed(() => CODE_REGEX.test(code.value.trim().toUpperCase()))
const showError = computed(() => touched.value && code.value.length > 0 && !isValid.value)

function onInput(event) {
  // Auto-uppercase + recortar al formato esperado (max 13 chars: CA-XXXXX-XXXXX)
  const raw = event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
  code.value = raw.slice(0, 13)
}

function onBlur() {
  touched.value = true
}

function onConsult() {
  if (!isValid.value || isLoading.value) return
  isLoading.value = true
  // Simulación: el endpoint real se conectará cuando el backend esté listo.
  setTimeout(() => {
    isLoading.value = false
    // TODO: navegar a vista de detalle del caso
  }, 800)
}

function resendCode() {
  // TODO: disparar flujo de reenvío por correo
}
</script>

<template>
  <section
    class="bg-white rounded-3xl shadow-sm border border-slate-100/70 p-8 sm:p-10 lg:p-12"
    aria-labelledby="reembolsos-consult-title"
  >
    <!-- Eyebrow -->
    <p class="text-[11px] font-bold tracking-[0.18em] text-[#43D3FF] uppercase">
      Seguimiento
    </p>

    <!-- Título -->
    <h2
      id="reembolsos-consult-title"
      class="mt-3 text-3xl sm:text-4xl font-bold text-[#00184C] leading-tight tracking-tight"
    >
      Consultar reembolso
    </h2>

    <!-- Subtítulo -->
    <p class="mt-3 text-sm sm:text-base text-slate-500">
      Pega tu código de seguimiento para ver el estado de tu caso.
    </p>

    <!-- Form -->
    <form
      class="mt-10 space-y-2"
      @submit.prevent="onConsult"
      novalidate
    >
      <label
        for="refund-code"
        class="block text-sm font-semibold text-slate-700"
      >
        Código de seguimiento
      </label>

      <div class="relative">
        <!-- Ícono lock a la izquierda del input -->
        <span
          class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none"
          aria-hidden="true"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 11c-1.66 0-3 1.34-3 3v3h6v-3c0-1.66-1.34-3-3-3zM6 11V8a6 6 0 0112 0v3"
            />
            <rect
              x="5"
              y="11"
              width="14"
              height="10"
              rx="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        </span>

        <input
          id="refund-code"
          type="text"
          inputmode="text"
          autocomplete="off"
          spellcheck="false"
          placeholder="CA-XXXXX-XXXXX"
          :value="code"
          @input="onInput"
          @blur="onBlur"
          :aria-invalid="showError"
          aria-describedby="refund-code-hint refund-code-error"
          class="w-full h-12 pl-10 pr-4 text-sm font-mono tracking-wider bg-white border rounded-xl text-slate-900 placeholder:text-slate-300 transition-all duration-200 focus:outline-none focus:ring-4"
          :class="showError
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-slate-200 focus:border-[#43D3FF] focus:ring-[#43D3FF]/15'"
        />
      </div>

      <!-- Hint + error -->
      <p
        id="refund-code-hint"
        class="text-xs text-slate-400"
      >
        Lo encuentras en el correo de confirmación. Ejemplo:
        <span class="font-mono text-slate-500">CA-7F3KM-92BDI</span>.
      </p>
      <p
        v-if="showError"
        id="refund-code-error"
        class="text-xs text-red-500 font-medium"
        role="alert"
      >
        Formato inválido. Debe ser CA-XXXXX-XXXXX.
      </p>
    </form>

    <!-- CTA Consultar -->
    <div class="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
      <button
        type="button"
        @click="onConsult"
        :disabled="!isValid || isLoading"
        class="inline-flex items-center justify-center gap-2.5 px-7 h-12 rounded-full text-sm font-bold transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        :class="!isValid || isLoading
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-[#00184C] text-white hover:brightness-110 shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:ring-[#43D3FF]'"
      >
        <span v-if="isLoading">Consultando…</span>
        <template v-else>
          <span>Consultar</span>
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
        </template>
      </button>

      <p class="text-sm text-slate-500">
        ¿No tienes tu código?
        <button
          type="button"
          @click="resendCode"
          class="font-semibold text-[#43D3FF] hover:text-[#00184C] underline underline-offset-2 decoration-[#43D3FF]/40 hover:decoration-[#00184C] transition-colors duration-200"
        >
          Te lo reenviamos a tu correo
        </button>
      </p>
    </div>

    <!-- Empty state: cuando aún no se ha consultado -->
    <div
      class="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center text-center"
      aria-live="polite"
    >
      <div
        class="w-12 h-12 rounded-2xl bg-[#43D3FF]/10 flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <svg class="w-5 h-5 text-[#43D3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.2"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </div>
      <p class="text-sm text-slate-500 max-w-xs leading-relaxed">
        El estado de tu caso aparecerá aquí cuando ingreses tu código.
      </p>
    </div>
  </section>
</template>
