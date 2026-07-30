<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { getPlanPrice as planPrice, getPlanName as planName } from '@/data/plans.js'
import { showToast } from '@/composables/useToast.js'
import { STEPS, TOTAL_STEPS } from '@/composables/useWizardSteps.js'
import { useWizardStore } from '@/stores/useWizardStore.js'
import { useCheckoutStore } from '@/stores/useCheckoutStore.js'
import LandingPage from './LandingPage.vue'
import StepRoute from './steps/StepRoute.vue'
import StepDates from './steps/StepDates.vue'
import TravelersBirthdateStep from './steps/TravelersBirthdateStep.vue'
import StepPlans from './steps/StepPlans.vue'
import DataStep from './steps/DataStep.vue'
import StepUpgrades from './steps/StepUpgrades.vue'
import StepCheckout from './steps/StepCheckout.vue'
import SuccessStep from './steps/SuccessStep.vue'
import TourOverlay from './ui/TourOverlay.vue'

const wizardStore = useWizardStore()
const checkoutStore = useCheckoutStore()
const router = useRouter()
const {
  currentStep,
  direction,
  isPaymentCompleted,
  showLanding,
  formData
} = storeToRefs(wizardStore)
const { finalTotal } = storeToRefs(checkoutStore)

const showWizard = computed(() => !showLanding.value)

function getPlanPrice() {
  return planPrice(formData.value.selectedPlan)
}

function getPlanName() {
  return planName(formData.value.selectedPlan)
}

function handleStart() {
  router.push({ path: '/cotizacion', query: { step: 0 } })
}

function nextStep(data = {}) {
  const targetStep = currentStep.value + 1
  wizardStore.nextStep(data)
  router.push({ path: '/cotizacion', query: { step: targetStep } })
}

function prevStep() {
  if (currentStep.value > 0) {
    router.back()
  }
}

function goToStep(step) {
  if (step === currentStep.value) return
  router.push({ path: '/cotizacion', query: { step } })
}

function restart() {
  wizardStore.resetWizard()
  router.push('/')
}

watch(currentStep, () => {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}, { flush: 'post' })

onMounted(() => {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

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
  e.preventDefault()
  e.returnValue = ''
  return ''
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <TourOverlay />
    <Transition name="fade">
      <LandingPage v-if="showLanding" @start="handleStart" />
    </Transition>

    <Transition name="fade">
      <div v-if="showWizard" class="flex flex-col bg-white">
        <main class="flex-1 flex items-start justify-center">
          <div class="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <Transition :name="'slide-' + direction" mode="out-in">
              <div :key="currentStep">
                <div v-if="currentStep === STEPS.ROUTE">
                  <StepRoute
                    :originModel="formData.origin"
                    :destinationModel="formData.destination"
                    @next="nextStep"
                  />
                </div>
                <div v-else-if="currentStep === STEPS.DATES">
                  <StepDates @next="nextStep" />
                </div>
                <div v-else-if="currentStep === STEPS.TRAVELERS">
                  <TravelersBirthdateStep v-model="formData" @next="nextStep" />
                </div>
                <div v-else-if="currentStep === STEPS.PLANS">
                  <StepPlans v-model="formData.selectedPlan" :destination="formData.destination" @next="nextStep" />
                </div>
                <div v-else-if="currentStep === STEPS.DATA">
                  <DataStep
                    :selectedPlan="formData.selectedPlan"
                    :travelers="formData.travelers"
                    :travelersCount="formData.travelersCount"
                    :origin="formData.origin"
                    :destination="formData.destination"
                    :dates="formData.dates"
                    :preloadedBirthdates="formData.birthdates"
                    :personalData="formData.travelersInfo"
                    :upgrades="formData.upgrades"
                    @next="nextStep"
                    @go-to-step="goToStep"
                  />
                </div>
                <div v-else-if="currentStep === STEPS.UPGRADES">
                  <StepUpgrades
                    v-model="formData.upgrades"
                    :travelers="formData.travelers"
                    :travelersCount="formData.travelersCount"
                    :personalData="formData.travelersInfo"
                    @next="nextStep"
                  />
                </div>
                <div v-else-if="currentStep === STEPS.CHECKOUT">
                  <StepCheckout :data="formData" @go-to-step="goToStep" />
                </div>
                <div v-else-if="currentStep === STEPS.SUCCESS">
                  <SuccessStep
                    :formData="formData"
                    :selectedPlan="{ name: getPlanName(), price: getPlanPrice() }"
                    :totalPaid="finalTotal"
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

/* Summary bar fade + slide from top */
.summary-enter-active {
  transition: opacity 0.28s ease-out, transform 0.28s ease-out;
}
.summary-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}
.summary-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.summary-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
