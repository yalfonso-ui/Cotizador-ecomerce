<script setup>
import { computed } from 'vue'

const props = defineProps({
  steps: {
    type: Array,
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['go-to-step'])

const progressPercentage = computed(() => {
  return (props.currentStep / (props.totalSteps - 1)) * 100
})

function handleStepClick(index) {
  // User Control & Freedom: Only allow navigation to completed steps
  if (index <= props.currentStep) {
    emit('go-to-step', index)
  }
}

const isCompleted = (index) => index < props.currentStep
const isCurrent = (index) => index === props.currentStep
</script>

<template>
  <div class="w-full">
    <!-- Mobile Step Label -->
    <div class="flex justify-between items-center mb-4 lg:hidden">
      <span class="text-base font-semibold text-[#00184C]">
        {{ steps[currentStep]?.label }}
      </span>
      <span class="text-sm text-gray-400">
        {{ currentStep + 1 }} / {{ totalSteps }}
      </span>
    </div>

    <!-- Desktop Progress Bar -->
    <div class="hidden lg:flex items-center justify-between mb-2">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="flex items-center"
        :class="{ 'flex-1': index < steps.length - 1 }"
      >
        <button
          @click="handleStepClick(index)"
          :disabled="index > currentStep"
          class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shrink-0 relative group"
          :class="[
            isCompleted(index)
              ? 'bg-[#00184C] text-white cursor-pointer hover:bg-[#00133D]'
              : isCurrent(index)
                ? 'bg-[#00184C] text-white ring-4 ring-[#43D3FF]/30'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
          ]"
          :title="step.label + (index > currentStep ? ' (no disponible)' : '')"
        >
          <!-- Completed checkmark -->
          <svg v-if="isCompleted(index)" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span v-else>{{ index + 1 }}</span>
          
          <!-- Tooltip on hover -->
          <span v-if="index > currentStep" class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Completa los pasos anteriores
          </span>
        </button>
        
        <!-- Connector line -->
        <div
          v-if="index < steps.length - 1"
          class="h-1 flex-1 mx-2 rounded-full overflow-hidden transition-all duration-500"
          :class="index < currentStep ? 'bg-[#00184C]' : 'bg-gray-200'"
        />
      </div>
    </div>

    <!-- Step Labels (Desktop) -->
    <div class="hidden lg:flex justify-between items-center mt-2">
      <span class="text-sm text-gray-500 font-medium">
        {{ steps[currentStep]?.label }}
      </span>
      <span class="text-sm text-gray-400">
        Paso {{ currentStep + 1 }} de {{ totalSteps }}
      </span>
    </div>

    <!-- Mobile Progress Bar (simplified) -->
    <div class="lg:hidden">
      <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          class="h-full bg-[#00184C] rounded-full transition-all duration-500"
          :style="{ width: progressPercentage + '%' }"
        />
      </div>
    </div>
  </div>
</template>