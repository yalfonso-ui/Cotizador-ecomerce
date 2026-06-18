<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { getPlanPrice as planPrice, getPlanName as planName } from '@/data/plans.js'
import { showToast } from '@/composables/useToast.js'
import { STEPS, TOTAL_STEPS } from '@/composables/useWizardSteps.js'
import LandingPage from './LandingPage.vue'
import StepOrigin from './steps/StepOrigin.vue'
import StepDestination from './steps/StepDestination.vue'
import StepDates from './steps/StepDates.vue'
import TravelersBirthdateStep from './steps/TravelersBirthdateStep.vue'
import StepPlans from './steps/StepPlans.vue'
import DataStep from './steps/DataStep.vue'
import StepUpgrades from './steps/StepUpgrades.vue'
import StepCheckout from './steps/StepCheckout.vue'
import SuccessStep from './steps/SuccessStep.vue'
import TourOverlay from './ui/TourOverlay.vue'

const showLanding = ref(true)
const showWizard = ref(false)
const currentStep = ref(0)
const direction = ref('left')
const isPaymentCompleted = ref(false)

const formData = ref({
  origin: null,
  destination: [],
  dates: { start: null, end: null },
  tripDuration: null,
  travelersCount: 1,
  birthdates: [],
  ages: [],
  selectedPlan: null,
  personalData: { name: '', email: '', phone: '' },
  companions: [],
  travelersInfo: [],
  upgrades: {},
  emergencyContact: { name: '', phone: '', email: '' }
})

const progress = computed(() => ((currentStep.value) / (TOTAL_STEPS - 1)) * 100)

function getPlanPrice() {
  return planPrice(formData.value.selectedPlan)
}

function getPlanName() {
  return planName(formData.value.selectedPlan)
}

const stepTitles = [
  { title: '¿Desde dónde viajas?', subtitle: 'Detectamos tu ubicación automáticamente' },
  { title: '¿A dónde viajas?', subtitle: 'Selecciona tus destinos' },
  { title: '¿Cuándo es tu aventura?', subtitle: 'Selecciona las fechas de tu viaje' },
  { title: 'Datos de los viajeros', subtitle: 'Ingresa las fechas de nacimiento' },
  { title: 'Elige tu plan de protección', subtitle: 'Compara los planes disponibles' },
  { title: 'Tus datos de contacto', subtitle: 'Titular y emergencia' },
  { title: 'Mejora tu cobertura', subtitle: 'Coberturas adicionales opcionales' },
  { title: 'Revisa y paga', subtitle: 'Confirma los detalles y completa el pago' },
  { title: '¡Viaje confirmado!', subtitle: 'Tu asistencia está activa' }
]

function handleStart() {
  showLanding.value = false
  setTimeout(() => {
    showWizard.value = true
  }, 300)
}

function nextStep(data = {}) {
  let nextData = { ...data }
  if (data.dates?.start && data.dates?.end) {
    const start = new Date(data.dates.start)
    const end = new Date(data.dates.end)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    nextData.tripDuration = days
  }
  formData.value = { ...formData.value, ...nextData }
  direction.value = 'left'
  currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0) {
    direction.value = 'right'
    currentStep.value--
  }
}

function goToStep(step) {
  if (step >= 0 && step < TOTAL_STEPS) {
    direction.value = step < currentStep.value ? 'right' : 'left'
    currentStep.value = step
  }
}

function handlePaymentSuccess(data) {
  isPaymentCompleted.value = true
  clearWizardState()
  direction.value = 'left'
  currentStep.value = STEPS.SUCCESS
}

function restart() {
  isPaymentCompleted.value = false
  showWizard.value = false
  currentStep.value = 0
  formData.value = {
    origin: null,
destination: [],
    dates: { start: null, end: null },
    tripDuration: null,
    travelersCount: 1,
    birthdates: [],
    ages: [],
    selectedPlan: null,
    personalData: { name: '', email: '', phone: '' },
    companions: [],
    travelersInfo: [],
    upgrades: {},
    emergencyContact: { name: '', phone: '', email: '' }
  }
  setTimeout(() => {
    showLanding.value = true
  }, 300)
}

watch(currentStep, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

const STORAGE_KEY = 'wizard_state'
const STATE_TTL_DAYS = 7
const SAVE_DEBOUNCE_MS = 500

function saveWizardState() {
  try {
    const payload = {
      formData: formData.value,
      currentStep: currentStep.value,
      savedAt: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (e) {
    console.warn('Failed to save wizard state:', e)
  }
}

let saveDebounceTimeout = null
function saveWizardStateDebounced() {
  if (saveDebounceTimeout) clearTimeout(saveDebounceTimeout)
  saveDebounceTimeout = setTimeout(() => {
    if (!isPaymentCompleted.value) saveWizardState()
  }, SAVE_DEBOUNCE_MS)
}

function isStateExpired(savedAt) {
  if (!savedAt) return true
  const ageMs = Date.now() - savedAt
  return ageMs > STATE_TTL_DAYS * 24 * 60 * 60 * 1000
}

function flushSave() {
  if (saveDebounceTimeout) {
    clearTimeout(saveDebounceTimeout)
    saveDebounceTimeout = null
  }
  if (!isPaymentCompleted.value) saveWizardState()
}

watch([formData, currentStep], () => {
  saveWizardStateDebounced()
}, { deep: true })

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const resumeToken = urlParams.get('resume')

  if (resumeToken) {
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(resumeToken)))
      if (decoded.data) {
        formData.value = { ...formData.value, ...decoded.data }
      }
      if (typeof decoded.step === 'number' && decoded.step >= 0 && decoded.step < TOTAL_STEPS) {
        currentStep.value = decoded.step
        showLanding.value = false
        showWizard.value = true
        if (decoded.data?.selectedPlan === null && typeof decoded.step === 'number') {
          currentStep.value = Math.min(decoded.step, TOTAL_STEPS - 2)
        }
      }
      window.history.replaceState({}, '', window.location.pathname)
    } catch (e) {
      console.warn('Failed to parse resume token:', e)
      showTransientNotice('No pudimos recuperar tu progreso. Empezando de nuevo.')
    }
    return
  }

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const state = JSON.parse(saved)
      if (isStateExpired(state.savedAt)) {
        localStorage.removeItem(STORAGE_KEY)
        return
      }
      if (state.formData) {
        formData.value = { ...formData.value, ...state.formData }
      }
      if (typeof state.currentStep === 'number' && state.currentStep > 0 && state.currentStep < TOTAL_STEPS) {
        currentStep.value = state.currentStep
        showLanding.value = false
        showWizard.value = true
      }
    } catch (e) {
      console.warn('Failed to restore wizard state:', e)
      showTransientNotice('No pudimos recuperar tu progreso guardado.')
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', beforeUnloadHandler)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('beforeunload', beforeUnloadHandler)
  }
})

function beforeUnloadHandler(e) {
  if (isPaymentCompleted.value) return
  if (currentStep.value <= 0 || currentStep.value >= TOTAL_STEPS - 1) return
  flushSave()
  e.preventDefault()
  e.returnValue = ''
  return ''
}

function clearWizardState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.warn('Failed to clear wizard state:', e)
  }
}

function showTransientNotice(message) {
  showToast(message, { variant: 'warning', duration: 5000 })
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <TourOverlay />
    <Transition name="fade">
      <LandingPage v-if="showLanding" @start="handleStart" />
    </Transition>

    <Transition name="fade">
      <div v-if="showWizard" class="min-h-screen flex flex-col bg-white">
        <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 h-16 flex items-center">
          <div class="max-w-5xl mx-auto w-full px-4">
            <div class="grid grid-cols-3 items-center">
              <div class="flex items-center gap-2">
                <button type="button"
                  v-if="currentStep > 0 && currentStep < STEPS.SUCCESS"
                  @click="prevStep"
                  aria-label="Volver al paso anterior"
                  class="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 rounded px-2 py-1"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span class="hidden sm:inline">Volver</span>
                </button>
              </div>

              <div class="flex items-center justify-center">
                <img src="@/assets/images/uploads/Logotipo PNG.png" alt="Continental Assist Logo" class="h-7 w-auto opacity-80" />
              </div>

              <div class="flex items-center justify-end gap-2">
                <span v-if="currentStep === STEPS.SUCCESS" class="text-xs font-medium text-green-500">¡Completado!</span>
                <span v-else class="text-[11px] font-medium text-slate-500 tabular-nums">
                  Paso {{ currentStep + 1 }} de {{ TOTAL_STEPS }}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div class="bg-white border-b border-slate-100">
          <div class="max-w-5xl mx-auto w-full px-4 py-1.5">
            <div
              class="h-1 bg-slate-100 rounded-full overflow-hidden"
              role="progressbar"
              :aria-valuenow="Math.round(progress)"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Progreso del wizard: paso ${currentStep + 1} de ${TOTAL_STEPS}`"
            >
              <div
                class="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
                :style="{ width: progress + '%' }"
              />
            </div>
          </div>
        </div>

        <main class="flex-1 flex items-start justify-center px-4 py-10">
          <div class="w-full max-w-md">
            <Transition :name="'slide-' + direction" mode="out-in">
              <div :key="currentStep">
                <div v-if="currentStep === 0">
                  <StepOrigin v-model="formData.origin" @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 1">
                  <StepDestination v-model="formData.destination" @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 2">
                  <StepDates @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 3">
                  <TravelersBirthdateStep :modelValue="formData" @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 4">
                  <StepPlans v-model="formData.selectedPlan" :destination="formData.destination" @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 5">
                  <DataStep
                    :selectedPlan="formData.selectedPlan"
                    :travelers="formData.travelers"
                    :travelersCount="formData.travelersCount"
                    :preloadedBirthdates="formData.birthdates"
                    @next="nextStep"
                  />
                </div>
                <div v-else-if="currentStep === 6">
                  <StepUpgrades
                    v-model="formData.upgrades"
                    :travelers="formData.travelers"
                    :travelersCount="formData.travelersCount"
                    :personalData="formData.travelersInfo"
                    @next="nextStep"
                  />
                </div>
                <div v-else-if="currentStep === STEPS.CHECKOUT">
                  <StepCheckout :data="formData" @go-to-step="goToStep" @payment-success="handlePaymentSuccess" />
                </div>
                <div v-else-if="currentStep === STEPS.SUCCESS">
                  <SuccessStep
                    :formData="formData"
                    :selectedPlan="{ name: getPlanName(), price: getPlanPrice() }"
                    @restart-flow="restart"
                  />
                </div>
              </div>
            </Transition>
          </div>
        </main>
      </div>
    </Transition>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
