<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWizardStore } from '@/stores/useWizardStore.js'
import { getPlanPrice, getPlanName, getPlanCoverage } from '@/data/plans.js'
import SuccessStep from '@/components/steps/SuccessStep.vue'

const wizardStore = useWizardStore()
const router = useRouter()

const formData = computed(() => wizardStore.formData)
const selectedPlan = computed(() => ({
  name: getPlanName(wizardStore.formData?.selectedPlan),
  price: getPlanPrice(wizardStore.formData?.selectedPlan)
}))

function restart() {
  // 1. Limpiar localStorage (datos persistidos del wizard)
  wizardStore.clearPersistedState()
  // 2. Resetear el state en memoria (formData, currentStep, showLanding, etc.)
  wizardStore.resetWizard()
  // 3. Navegar al inicio para que el usuario vea la landing y pueda
  //    empezar una nueva compra. router.replace (no push) para que el
  //    back del navegador no devuelva a una página de éxito con datos vacíos.
  router.replace('/')
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <SuccessStep :formData="formData" :selectedPlan="selectedPlan" @restart-flow="restart" />
  </div>
</template>
