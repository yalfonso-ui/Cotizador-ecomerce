<script setup>
import { ref, computed, watch } from 'vue'
import QuoteProgress from './QuoteProgress.vue'

import OriginStep from './steps/chat/OriginStep.vue'
import DestinationStep from './steps/chat/DestinationStep.vue'
import DurationStep from './steps/chat/DurationStep.vue'
import TravelersStep from './steps/chat/TravelersStep.vue'

import PlanSelectionStep from './steps/plan/PlanSelectionStep.vue'

import NameStep from './steps/personal/NameStep.vue'
import EmailStep from './steps/personal/EmailStep.vue'
import PhoneStep from './steps/personal/PhoneStep.vue'
import BirthdateStep from './steps/personal/BirthdateStep.vue'
import EmergencyContactStep from './steps/personal/EmergencyContactStep.vue'

import DiscountStep from './steps/payment/DiscountStep.vue'
import CardStep from './steps/payment/CardStep.vue'

import SuccessStep from './steps/success/SuccessStep.vue'

const QUOTE_STEPS = [
  { id: 'origin', label: 'Origen' },
  { id: 'destination', label: 'Destino' },
  { id: 'duration', label: 'Duración' },
  { id: 'travelers', label: 'Viajeros' },
  { id: 'plan', label: 'Plan' },
  { id: 'name', label: 'Nombre' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Teléfono' },
  { id: 'birthdate', label: 'Nacimiento' },
  { id: 'emergency', label: 'Emergencia' },
  { id: 'discount', label: 'Descuento' },
  { id: 'card', label: 'Pago' },
  { id: 'success', label: '¡Listo!' }
]

const currentStepIndex = ref(0)

const quoteData = ref({
  origin: null,
  destination: null,
  duration: null,
  travelers: null,
  selectedPlan: null,
  personalData: {
    name: '',
    email: '',
    phone: '',
    birthdate: { day: '', month: '', year: '' },
    emergencyContact: ''
  },
  discountCode: '',
  paymentData: {
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  },
  policyNumber: null
})

const currentStep = computed(() => QUOTE_STEPS[currentStepIndex.value].id)
const totalSteps = computed(() => QUOTE_STEPS.length)

function goToStep(index) {
  currentStepIndex.value = index
}

function updateQuoteData(field, value) {
  if (field.includes('.')) {
    const [parent, child] = field.split('.')
    quoteData.value[parent][child] = value
  } else {
    quoteData.value[field] = value
  }
}

function nextStep() {
  if (currentStepIndex.value < QUOTE_STEPS.length - 1) {
    currentStepIndex.value++
  }
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

function handlePlanSelect(plan) {
  quoteData.value.selectedPlan = plan
  nextStep()
}

function handlePaymentSubmit() {
  const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase()
  quoteData.value.policyNumber = `CA-2026-${randomPart}`
  nextStep()
}

const stepComponents = {
  origin: OriginStep,
  destination: DestinationStep,
  duration: DurationStep,
  travelers: TravelersStep,
  plan: PlanSelectionStep,
  name: NameStep,
  email: EmailStep,
  phone: PhoneStep,
  birthdate: BirthdateStep,
  emergency: EmergencyContactStep,
  discount: DiscountStep,
  card: CardStep,
  success: SuccessStep
}

const currentComponent = computed(() => stepComponents[currentStep.value])

const stepProps = computed(() => {
  switch (currentStep.value) {
    case 'plan':
      return { quoteData: quoteData.value }
    case 'card':
      return { quoteData: quoteData.value, selectedPlan: quoteData.value.selectedPlan }
    case 'discount':
      return { quoteData: quoteData.value }
    case 'success':
      return { policyNumber: quoteData.value.policyNumber, email: quoteData.value.personalData.email }
    default:
      return {}
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50/20 flex items-center justify-center p-4 md:p-6 lg:p-8">
    <div class="w-full max-w-4xl">
      <QuoteProgress
        :steps="QUOTE_STEPS"
        :current-step="currentStepIndex"
        :total-steps="totalSteps"
        @go-to-step="goToStep"
      />

      <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-10 mt-4 border border-gray-100">
        <Transition name="fade" mode="out-in">
          <component
            :is="currentComponent"
            :key="currentStep"
            v-bind="stepProps"
            @update="updateQuoteData"
            @next="nextStep"
            @prev="prevStep"
            @select-plan="handlePlanSelect"
            @submit-payment="handlePaymentSubmit"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>