<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useWizardStore } from '@/stores/useWizardStore.js'
import { useCheckoutStore } from '@/stores/useCheckoutStore.js'
import { getPlanPrice, getPlanName, getPlanCoverage } from '@/data/plans.js'
import { STEPS } from '@/composables/useWizardSteps.js'
import SuccessStep from '@/components/steps/SuccessStep.vue'

const wizardStore = useWizardStore()
const checkoutStore = useCheckoutStore()
const router = useRouter()

const formData = computed(() => wizardStore.formData)
const selectedPlan = computed(() => ({
  name: getPlanName(wizardStore.formData?.selectedPlan),
  price: getPlanPrice(wizardStore.formData?.selectedPlan)
}))

// Total final cobrado en el checkout (plan + adicionales - descuento).
// Se lee del checkout store donde se congeló al momento del pago exitoso.
const { finalTotal } = storeToRefs(checkoutStore)

// Forzar currentStep = SUCCESS para que la barra se muestre al 100%.
onMounted(() => {
  try {
    if (wizardStore.currentStep !== STEPS.SUCCESS) {
      wizardStore.currentStep = STEPS.SUCCESS
    }
  } catch (_) {}
})

function restart() {
  // 1. Limpiar localStorage (datos persistidos del wizard)
  wizardStore.clearPersistedState()
  // 2. Resetear el state en memoria (formData, currentStep, showLanding, etc.)
  wizardStore.resetWizard()
  // 3. Resetear el checkout store (incluye finalTotal)
  checkoutStore.resetForm()
  // 4. Navegar al inicio para que el usuario vea la landing y pueda
  //    empezar una nueva compra. router.replace (no push) para que el
  //    back del navegador no devuelva a una página de éxito con datos vacíos.
  router.replace('/')
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <SuccessStep
      :formData="formData"
      :selectedPlan="selectedPlan"
      :totalPaid="finalTotal"
      @restart-flow="restart"
    />
  </div>
</template>
