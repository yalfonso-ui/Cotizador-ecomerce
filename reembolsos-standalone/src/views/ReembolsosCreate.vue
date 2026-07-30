<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import ReembolsosProgressBar from '@/components/reembolsos/ReembolsosProgressBar.vue'

/**
 * ReembolsosCreate
 * ─────────────────────────────────────────────────────────────
 * Wizard de 5 pasos para crear una solicitud de reembolso.
 *
 * Estructura:
 *   1. Bienvenida       → intro + CTA "Comenzar"
 *   2. Gasto            → datos del gasto (tipo, fecha, monto, descripción)
 *   3. Documentos       → soportes (facturas, recibos)
 *   4. Pago             → datos bancarios del beneficiario
 *   5. Éxito            → confirmación + número de caso
 *
 * Esta primera entrega incluye paso 1 (Bienvenida/Identificación)
 * con la estructura completa. Los pasos 2-5 se completan en
 * iteraciones siguientes (mismo patrón, state machine).
 *
 * Diseño:
 *   - ProgressBar arriba (margen generoso, no toca el header)
 *   - Card blanca con sombra tenue
 *   - Eyebrow "PASO N · NOMBRE" en cyan
 *   - Tipografía editorial (heading bold, body regular)
 *   - Botones con patrón unificado (cancelar secundario, continuar primario)
 */

const router = useRouter()
const currentStep = ref(1)

const STEPS = [
  { title: 'Bienvenida', subtitle: 'Empezamos' },
  { title: 'Gasto', subtitle: 'Tu reclamo' },
  { title: 'Documentos', subtitle: 'Soportes' },
  { title: 'Pago', subtitle: 'Datos bancarios' },
  { title: 'Éxito', subtitle: 'Listo' }
]

// ── Form state (paso 1: Identificación) ──
const form = reactive({
  idNumber: '',
  idType: 'Pasaporte', // Cédula | Pasaporte | Cédula ext. | DNI
  titularName: '',
  requesterName: '',
  assistanceNumber: '',
  email: '',
  country: 'Colombia (CO)'
})

const idTypes = ['Cédula', 'Pasaporte', 'Cédula ext.', 'DNI']

// Validación: paso 1 → requiere idNumber, titularName, idType, email, country
const isStep1Valid = computed(() => {
  return (
    form.idNumber.trim().length >= 4 &&
    form.titularName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.country.trim().length > 0
  )
})

function next() {
  if (currentStep.value === 1 && !isStep1Valid.value) return
  if (currentStep.value < STEPS.length) {
    currentStep.value += 1
    // Scroll al top para que el usuario vea el progress bar actualizado
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

function prev() {
  if (currentStep.value > 1) {
    currentStep.value -= 1
  } else {
    // Desde paso 1 → volver al home
    router.push({ name: 'reembolsos-home' })
  }
}
</script>

<template>
  <section
    class="bg-white rounded-3xl shadow-sm border border-slate-100/70 p-8 sm:p-10 lg:p-12"
    aria-labelledby="reembolsos-create-title"
  >
    <!-- ── Progress bar (5 pasos) ── -->
    <div class="mb-10 sm:mb-12">
      <ReembolsosProgressBar
        :steps="STEPS"
        :current-step="currentStep"
      />
    </div>

    <!-- ── Paso 1: Identificación ── -->
    <template v-if="currentStep === 1">
      <p class="text-[11px] font-bold tracking-[0.18em] text-[#43D3FF] uppercase">
        Paso 1 · Identificación
      </p>
      <h2
        id="reembolsos-create-title"
        class="mt-3 text-2xl sm:text-3xl font-bold text-[#00184C] leading-tight tracking-tight"
      >
        Cuéntanos quién eres
      </h2>

      <!-- Sub-pasos visuales (tabs sutiles) -->
      <div class="mt-6 flex flex-wrap items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-[#00184C] text-white text-xs font-bold"
        >
          <span
            class="w-4 h-4 rounded-full bg-[#43D3FF] text-[#00184C] text-[10px] font-bold flex items-center justify-center"
            aria-hidden="true"
          >1</span>
          Identificación
        </span>
        <span class="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-white border border-slate-200 text-slate-400 text-xs font-semibold">
          <span class="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center" aria-hidden="true">2</span>
          Datos del gasto
        </span>
        <span class="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-white border border-slate-200 text-slate-400 text-xs font-semibold">
          <span class="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center" aria-hidden="true">3</span>
          Confirmación
        </span>
      </div>

      <!-- Notice: privacidad -->
      <div
        class="mt-7 p-4 rounded-2xl bg-[#43D3FF]/8 border border-[#43D3FF]/20 flex items-start gap-3"
        role="note"
      >
        <span
          class="shrink-0 w-5 h-5 rounded-full bg-[#00184C] text-white text-[11px] font-bold flex items-center justify-center mt-0.5"
          aria-hidden="true"
        >i</span>
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
          <strong class="font-semibold text-slate-800">Tus datos están protegidos.</strong>
          Solo los usamos para gestionar tu reembolso. Los campos marcados con
          <span class="text-[#43D3FF] font-bold">*</span> son obligatorios.
        </p>
      </div>

      <!-- Form grid -->
      <form
        class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5"
        @submit.prevent="next"
        novalidate
      >
        <!-- Número de identificación -->
        <div>
          <label for="idNumber" class="block text-sm font-semibold text-slate-700">
            Número de identificación <span class="text-[#43D3FF]">*</span>
          </label>
          <div class="mt-1.5 relative">
            <span
              class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none"
              aria-hidden="true"
            >#</span>
            <input
              id="idNumber"
              v-model="form.idNumber"
              type="text"
              placeholder="6516513"
              class="w-full h-11 pl-8 pr-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/15 focus:border-[#43D3FF] transition-all duration-200"
            />
          </div>
          <p class="mt-1.5 text-xs text-slate-400">Tal como aparece en tu documento.</p>
        </div>

        <!-- Nombre del titular -->
        <div>
          <label for="titularName" class="block text-sm font-semibold text-slate-700">
            Nombre del titular <span class="text-[#43D3FF]">*</span>
          </label>
          <div class="mt-1.5 relative">
            <span
              class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none"
              aria-hidden="true"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input
              id="titularName"
              v-model="form.titularName"
              type="text"
              placeholder="Tu nombre"
              class="w-full h-11 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/15 focus:border-[#43D3FF] transition-all duration-200"
            />
          </div>
          <p class="mt-1.5 text-xs text-slate-400">La persona dueña de la póliza.</p>
        </div>

        <!-- Nombre de quien carga la solicitud (opcional) -->
        <div>
          <label for="requesterName" class="block text-sm font-semibold text-slate-700">
            Nombre de quien carga la solicitud <span class="text-slate-400 font-normal">(opcional)</span>
          </label>
          <div class="mt-1.5 relative">
            <span
              class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none"
              aria-hidden="true"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input
              id="requesterName"
              v-model="form.requesterName"
              type="text"
              placeholder="Si eres otra persona, indica tu nombre"
              class="w-full h-11 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/15 focus:border-[#43D3FF] transition-all duration-200"
            />
          </div>
          <p class="mt-1.5 text-xs text-slate-400">Déjalo en blanco si eres el titular.</p>
        </div>

        <!-- Número consecutivo de asistencia -->
        <div>
          <label for="assistanceNumber" class="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            Número consecutivo de asistencia
            <span class="text-slate-400 cursor-help" title="Lo recibiste cuando llamaste a la central">?</span>
          </label>
          <div class="mt-1.5 relative">
            <span
              class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none"
              aria-hidden="true"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <input
              id="assistanceNumber"
              v-model="form.assistanceNumber"
              type="text"
              placeholder="AS-XXXXX-NN"
              class="w-full h-11 pl-9 pr-3 text-sm font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/15 focus:border-[#43D3FF] transition-all duration-200"
            />
          </div>
          <p class="mt-1.5 text-xs text-slate-400">Tiene el formato AS-XXXXX-NN.</p>
        </div>

        <!-- Tipo de documento (selector de tarjetas) -->
        <div class="sm:col-span-2">
          <p class="text-sm font-semibold text-slate-700">
            Tipo de documento <span class="text-[#43D3FF]">*</span>
          </p>
          <div class="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              v-for="type in idTypes"
              :key="type"
              type="button"
              @click="form.idType = type"
              :aria-pressed="form.idType === type"
              class="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
              :class="form.idType === type
                ? 'bg-[#43D3FF]/10 border-[#43D3FF]/50 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'"
            >
              <svg
                class="w-5 h-5"
                :class="form.idType === type ? 'text-[#00184C]' : 'text-slate-400'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                />
              </svg>
              <span
                class="text-xs sm:text-sm font-semibold"
                :class="form.idType === type ? 'text-[#00184C]' : 'text-slate-500'"
              >{{ type }}</span>
            </button>
          </div>
        </div>

        <!-- Correo de confirmación -->
        <div>
          <label for="email" class="block text-sm font-semibold text-slate-700">
            Correo de confirmación <span class="text-[#43D3FF]">*</span>
          </label>
          <div class="mt-1.5 relative">
            <span
              class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none"
              aria-hidden="true"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="tu@correo.com"
              class="w-full h-11 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/15 focus:border-[#43D3FF] transition-all duration-200"
            />
          </div>
          <p class="mt-1.5 text-xs text-slate-400">Ahí te enviaremos el estado de tu solicitud.</p>
        </div>

        <!-- País de residencia -->
        <div>
          <label for="country" class="block text-sm font-semibold text-slate-700">
            País de residencia <span class="text-[#43D3FF]">*</span>
          </label>
          <div class="mt-1.5 relative">
            <span
              class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none"
              aria-hidden="true"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <select
              id="country"
              v-model="form.country"
              class="w-full h-11 pl-9 pr-9 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/15 focus:border-[#43D3FF] transition-all duration-200 appearance-none"
            >
              <option>Colombia (CO)</option>
              <option>México (MX)</option>
              <option>Argentina (AR)</option>
              <option>Chile (CL)</option>
              <option>Perú (PE)</option>
              <option>Ecuador (EC)</option>
              <option>Estados Unidos (US)</option>
              <option>España (ES)</option>
            </select>
            <span
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 pointer-events-none"
              aria-hidden="true"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          <p class="mt-1.5 text-xs text-slate-400">Donde reside el asegurado. No es el país del evento.</p>
        </div>
      </form>

      <!-- Help box (canales de contacto) -->
      <div
        class="mt-8 p-5 rounded-2xl bg-slate-50 border border-slate-100"
        role="complementary"
        aria-label="Canales de ayuda"
      >
        <p class="text-sm font-bold text-[#00184C]">¿Necesitas ayuda?</p>
        <p class="mt-1 text-sm text-slate-600 leading-relaxed">
          En caso de dudas, comunícate con nuestra Central de Asistencia:
        </p>
        <ul class="mt-3 space-y-1.5 text-sm">
          <li>
            <a
              href="https://wa.me/13057225824"
              target="_blank"
              rel="noopener"
              class="text-[#43D3FF] hover:text-[#00184C] font-semibold underline underline-offset-2 decoration-[#43D3FF]/40 hover:decoration-[#00184C] transition-colors duration-200"
            >
              WhatsApp: +1 305 722 5824
            </a>
          </li>
          <li>
            <a
              href="tel:+13057225824"
              class="text-[#43D3FF] hover:text-[#00184C] font-semibold underline underline-offset-2 decoration-[#43D3FF]/40 hover:decoration-[#00184C] transition-colors duration-200"
            >
              Llámanos: +1 305 722 5824
            </a>
          </li>
        </ul>
      </div>
    </template>

    <!-- ── Pasos 2-5: placeholders (próximas iteraciones) ── -->
    <template v-else>
      <div class="text-center py-16">
        <div
          class="inline-flex w-12 h-12 rounded-2xl bg-[#43D3FF]/10 items-center justify-center mb-5"
          aria-hidden="true"
        >
          <span class="text-2xl font-bold text-[#00184C]">{{ currentStep }}</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-[#00184C] tracking-tight">
          {{ STEPS[currentStep - 1]?.title }}
        </h2>
        <p class="mt-3 text-slate-500 max-w-md mx-auto">
          Estamos construyendo este paso. Por ahora puedes navegar entre pasos con los botones de abajo.
        </p>
      </div>
    </template>

    <!-- ── Action bar (común a todos los pasos) ── -->
    <div
      class="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3"
    >
      <button
        type="button"
        @click="prev"
        class="inline-flex items-center justify-center px-6 h-11 rounded-full text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
      >
        {{ currentStep === 1 ? 'Volver' : 'Atrás' }}
      </button>

      <button
        v-if="currentStep < STEPS.length"
        type="button"
        @click="next"
        :disabled="currentStep === 1 && !isStep1Valid"
        class="inline-flex items-center justify-center gap-2.5 px-7 h-11 rounded-full text-sm font-bold transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        :class="currentStep === 1 && !isStep1Valid
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-[#00184C] text-white hover:brightness-110 shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:ring-[#43D3FF]'"
      >
        <span>Continuar</span>
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
      </button>
    </div>
  </section>
</template>
