<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useWizardStore } from '@/stores/useWizardStore.js'
import { useCheckoutStore } from '@/stores/useCheckoutStore.js'
import { getPlanPrice } from '@/data/plans.js'
import { STEPS } from '@/composables/useWizardSteps.js'
import SummaryHeader from './SummaryHeader.vue'
import StepProgressBar from './StepProgressBar.vue'
import ProcessingOverlay from './ProcessingOverlay.vue'

const wizardStore = useWizardStore()
const checkoutStore = useCheckoutStore()
const { formData, currentStep, showLanding } = storeToRefs(wizardStore)
const { isProcessing } = storeToRefs(checkoutStore)

const isMenuOpen = ref(false)
const menuRef = ref(null)
const buttonRef = ref(null)

const isHome = computed(() => showLanding.value === true)
const routeComplete = computed(() => wizardStore.hasRoute)
const datesComplete = computed(() => !!(formData.value.dates?.start && formData.value.dates?.end))
const price = computed(() => getPlanPrice(formData.value.selectedPlan))

const shouldShowEdit = computed(() =>
  !isHome.value
  && currentStep.value > STEPS.ROUTE
  && currentStep.value < STEPS.CHECKOUT
)

// "Tu reserva" en el navbar: visible desde Paso 2 (DATES) hasta justo antes del Checkout.
// En Checkout el panel lateral "Tu reserva" ya muestra todo, así que el del navbar se oculta para evitar redundancia.
const shouldShowNavbarSummary = computed(() => {
  return currentStep.value >= STEPS.DATES && currentStep.value < STEPS.CHECKOUT
})

const editOptions = computed(() => [
  {
    step: STEPS.ROUTE,
    label: 'Ruta',
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    available: routeComplete.value,
    hint: 'Origen y destino'
  },
  {
    step: STEPS.DATES,
    label: 'Fechas',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    available: datesComplete.value,
    hint: 'Salida y regreso'
  },
  {
    step: STEPS.TRAVELERS,
    label: 'Viajeros',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    available: datesComplete.value,
    hint: 'Cantidad y edades'
  },
  {
    step: STEPS.PLANS,
    label: 'Plan',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    available: !!price.value,
    hint: 'Cobertura elegida'
  }
])

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function selectOption(step) {
  wizardStore.goToStep(step)
  closeMenu()
}

function onDocumentClick(e) {
  if (!isMenuOpen.value) return
  if (menuRef.value?.contains(e.target) || buttonRef.value?.contains(e.target)) return
  closeMenu()
}

function onKeydown(e) {
  if (e.key === 'Escape' && isMenuOpen.value) {
    closeMenu()
    buttonRef.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- FIXED HEADER -->
    <!--
      Header ADAPTATIVO:
      - En la landing (hero oscuro) → transparente, sin border, logo blanco
        (vía `brightness-0 invert`) para que se funda con el fondo navy.
      - En el wizard (fondo blanco) → blanco/95 con backdrop-blur, border
        sutil slate, logo en color.
      La transición de color es animada (300ms) para que sea suave al
      pasar de landing → primer step.
      Ancho unificado con el resto de la app: max-w-6xl.
      Se oculta cuando el ProcessingOverlay está activo (`isProcessing`)
      porque el overlay tiene su propio logo y si no se verían duplicados.
    -->
    <header
      v-if="!isProcessing"
      class="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
      :class="isHome
        ? 'bg-transparent'
        : 'bg-white/95 backdrop-blur-sm border-b border-slate-100'"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 text-xs">

        <!-- LEFT: Logo -->
        <a href="/" class="shrink-0 flex items-center" aria-label="Continental Assist - Inicio">
          <img
            src="@/assets/images/uploads/Logotipo PNG.png"
            alt="Continental Assist"
            class="h-9 w-auto opacity-90 hidden sm:block"
          />
          <img
            src="@/assets/images/uploads/Logotipo PNG.png"
            alt="Continental Assist"
            class="h-8 w-auto opacity-90 sm:hidden"
          />
        </a>

        <!-- RIGHT: Summary + Edit button + dropdown (hidden on home) -->
        <div class="flex items-center gap-2 shrink-0">
          <SummaryHeader v-if="shouldShowNavbarSummary" />
          <div v-if="shouldShowEdit" class="relative">
          <button
            ref="buttonRef"
            type="button"
            @click="toggleMenu"
            :aria-expanded="isMenuOpen"
            aria-haspopup="menu"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Editar</span>
          </button>

          <Transition name="dropdown">
            <div
              v-if="isMenuOpen"
              ref="menuRef"
              role="menu"
              class="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden z-50"
            >
              <div class="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                ¿Qué quieres editar?
              </div>
              <ul class="py-1">
                <li v-for="opt in editOptions" :key="opt.step">
                  <button
                    type="button"
                    role="menuitem"
                    @click="opt.available && selectOption(opt.step)"
                    :disabled="!opt.available"
                    :aria-current="currentStep === opt.step ? 'page' : undefined"
                    class="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors focus:outline-none focus-visible:bg-slate-50"
                  >
                    <span
                      class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      :class="currentStep === opt.step ? 'bg-[#00184C] text-white' : 'bg-slate-100 text-slate-500'"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="opt.icon" />
                      </svg>
                    </span>
                    <span class="flex-1 min-w-0">
                      <span class="block font-semibold">{{ opt.label }}</span>
                      <span v-if="opt.hint" class="block text-[10px] text-slate-400 font-normal leading-tight">{{ opt.hint }}</span>
                    </span>
                    <svg v-if="currentStep === opt.step" class="w-3 h-3 text-[#43D3FF] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    </header>

    <!-- MAIN CONTENT (wrapped slot) -->
    <!--
      IMPORTANTE: no usar `overflow-hidden` aquí. Eso convierte al <main>
      en el scroll container para los hijos `sticky`, y como el main
      no scrollea, el `sticky` deja de funcionar y el progress bar se
      va con el scroll en vez de quedarse pegado a top-16.
      El body sigue siendo el scroll container, y el sticky funciona bien.
    -->
    <main class="pt-16">
      <StepProgressBar />
      <slot />
    </main>

    <!-- Overlay global de procesamiento de pago (teleport a body, sobrevive al route change) -->
    <ProcessingOverlay />
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
