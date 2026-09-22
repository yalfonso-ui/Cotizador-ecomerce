<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CompareTableModalMobile from './CompareTableModalMobile.vue'
import CompareTableModalDesktop from './CompareTableModalDesktop.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  plans: { type: Array, required: true },
  selectedPlanId: { type: String, default: null },
  recommendedPlanId: { type: String, default: null }
})

const emit = defineEmits(['update:modelValue', 'select-plan'])

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

// Detección de viewport desktop (≥ 768px)
const isDesktop = ref(false)
let mql = null

function handleBreakpointChange(e) {
  // Si el modal está abierto y cambia el viewport, lo cerramos
  // para evitar bugs visuales de layout entre mobile/desktop
  if (open.value && isDesktop.value !== e.matches) {
    open.value = false
  }
  isDesktop.value = e.matches
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    mql = window.matchMedia('(min-width: 768px)')
    isDesktop.value = mql.matches
    mql.addEventListener('change', handleBreakpointChange)
  }
})

onUnmounted(() => {
  if (mql) mql.removeEventListener('change', handleBreakpointChange)
})
</script>

<template>
  <CompareTableModalDesktop
    v-if="isDesktop"
    v-model="open"
    :plans="plans"
    :selectedPlanId="selectedPlanId"
    :recommendedPlanId="recommendedPlanId"
    @select-plan="(id) => emit('select-plan', id)"
  />
  <CompareTableModalMobile
    v-else
    v-model="open"
    :plans="plans"
    :selectedPlanId="selectedPlanId"
    :recommendedPlanId="recommendedPlanId"
    @select-plan="(id) => emit('select-plan', id)"
  />
</template>
