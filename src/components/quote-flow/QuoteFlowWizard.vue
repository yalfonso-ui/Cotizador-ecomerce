<script setup>
import { ref, computed, shallowRef, watch } from 'vue'
import QuoteProgressBar from './QuoteProgressBar.vue'
import StepOrigin from './steps/lemonade/StepOrigin.vue'
import StepDestination from './steps/lemonade/StepDestination.vue'
import StepDates from './steps/lemonade/StepDates.vue'
import StepTravelers from './steps/lemonade/StepTravelers.vue'
import StepBirthdate from './steps/lemonade/StepBirthdate.vue'
import StepPlans from './steps/lemonade/StepPlans.vue'
import StepPersonal from './steps/lemonade/StepPersonal.vue'
import StepPayment from './steps/lemonade/StepPayment.vue'
import StepSuccess from './steps/lemonade/StepSuccess.vue'

const STEP_IDS = ['origin', 'destination', 'dates', 'travelers', 'birthdate', 'plans', 'personal', 'payment', 'success']

const currentStepIndex = ref(0)
const slideDirection = ref('left')
const isAnimating = ref(false)

const quoteData = ref({
  origin: null,
  destination: null,
  dates: { start: '', end: '' },
  travelers: null,
  birthdate: { day: '', month: '', year: '' },
  selectedPlan: null,
  personalData: {
    name: '',
    email: '',
    phone: ''
  },
  paymentData: {
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  },
  policyNumber: null
})

const currentStep = computed(() => STEP_IDS[currentStepIndex.value])
const totalSteps = computed(() => STEP_IDS.length)
const progress = computed(() => ((currentStepIndex.value) / (totalSteps.value - 1)) * 100)

const stepComponents = {
  origin: StepOrigin,
  destination: StepDestination,
  dates: StepDates,
  travelers: StepTravelers,
  birthdate: StepBirthdate,
  plans: StepPlans,
  personal: StepPersonal,
  payment: StepPayment,
  success: StepSuccess
}

const currentComponent = computed(() => stepComponents[currentStep.value])

function goToStep(index) {
  if (index === currentStepIndex.value) return
  slideDirection.value = index > currentStepIndex.value ? 'left' : 'right'
  isAnimating.value = true
  setTimeout(() => {
    currentStepIndex.value = index
    isAnimating.value = false
  }, 300)
}

function nextStep() {
  if (currentStepIndex.value < STEP_IDS.length - 1) {
    slideDirection.value = 'left'
    isAnimating.value = true
    setTimeout(() => {
      currentStepIndex.value++
      isAnimating.value = false
    }, 300)
  }
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    slideDirection.value = 'right'
    isAnimating.value = true
    setTimeout(() => {
      currentStepIndex.value--
      isAnimating.value = false
    }, 300)
  }
}

function handleSelectOrigin(country) {
  quoteData.value.origin = country
  nextStep()
}

function handleSelectDestination(country) {
  quoteData.value.destination = country
  nextStep()
}

function handleSelectTravelers(type) {
  quoteData.value.travelers = type
  nextStep()
}

function handleSelectPlan(plan) {
  quoteData.value.selectedPlan = plan
  nextStep()
}

function handlePaymentSubmit() {
  const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase()
  quoteData.value.policyNumber = `CA-2026-${randomPart}`
  nextStep()
}

function handleRestart() {
  quoteData.value = {
    origin: null,
    destination: null,
    dates: { start: '', end: '' },
    travelers: null,
    birthdate: { day: '', month: '', year: '' },
    selectedPlan: null,
    personalData: {
      name: '',
      email: '',
      phone: ''
    },
    paymentData: {
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvv: ''
    },
    policyNumber: null
  }
  currentStepIndex.value = 0
}

const stepTitles = {
  origin: '¿Desde dónde viajas?',
  destination: '¿A dónde viajas?',
  dates: '¿Cuándo es tu aventura?',
  travelers: '¿Quiénes van en este viaje?',
  birthdate: '¿Cuándo naciste?',
  plans: 'Elige tu plan de protección',
  personal: 'Tus datos',
  payment: 'Pago',
  success: '¡Todo listo!'
}

const stepSubtitles = {
  origin: 'Selecciona tu país de origen',
  destination: 'Selecciona tu destino principal',
  dates: 'Elige las fechas de tu viaje',
  travelers: 'Cuéntanos quiénes viajan',
  birthdate: 'Necesitamos tu fecha de nacimiento',
  plans: 'Compara los planes disponibles',
  personal: 'Completa tus datos personales',
  payment: 'Ingresa los datos de tu tarjeta',
  success: 'Tu asistencia está protegida'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 px-4 py-4">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span class="text-white font-bold text-sm">CA</span>
            </div>
            <span class="font-semibold text-primary-500">Continental Assist</span>
          </div>
          <span class="text-sm text-gray-400">{{ currentStepIndex + 1 }} / {{ totalSteps }}</span>
        </div>
        <QuoteProgressBar :progress="progress" :current-step="currentStepIndex" />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <!-- Step Title -->
        <div class="text-center mb-8">
          <h1 class="text-2xl md:text-3xl font-semibold text-primary-500 mb-2">
            {{ stepTitles[currentStep] }}
          </h1>
          <p class="text-gray-500 text-sm">{{ stepSubtitles[currentStep] }}</p>
        </div>

        <!-- Step Content with Slide Transition -->
        <div class="relative overflow-hidden">
          <Transition
            :name="slideDirection === 'left' ? 'slide-left' : 'slide-right'"
            mode="out-in"
          >
            <div :key="currentStep">
              <component
                :is="currentComponent"
                :quote-data="quoteData"
                @update="(field, value) => quoteData[field] = value"
                @next="nextStep"
                @prev="prevStep"
                @select-origin="handleSelectOrigin"
                @select-destination="handleSelectDestination"
                @select-travelers="handleSelectTravelers"
                @select-plan="handleSelectPlan"
                @submit-payment="handlePaymentSubmit"
                @restart="handleRestart"
              />
            </div>
          </Transition>
        </div>
      </div>
    </main>

    <!-- Back Button (when available) -->
    <footer class="bg-white border-t border-gray-100 px-4 py-4">
      <div class="max-w-2xl mx-auto flex justify-center">
        <button
          v-if="currentStepIndex > 0 && currentStep !== 'success'"
          @click="prevStep"
          class="text-gray-500 hover:text-primary-500 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Atrás
        </button>
      </div>
    </footer>
  </div>
</template>

<style>
/* Slide Transitions */
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