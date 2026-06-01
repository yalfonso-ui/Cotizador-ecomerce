<script setup>
import { ref } from 'vue'
import StepButton from '@/components/quote-flow/ui/StepButton.vue'

const emit = defineEmits(['select-travelers', 'next'])

const selectedOption = ref(null)

const travelerOptions = [
  { id: 'solo', label: 'Solo', sublabel: '1 persona', icon: '🧑', price: 'Desde $25' },
  { id: 'pareja', label: 'Pareja', sublabel: '2 personas', icon: '👫', price: 'Desde $40' },
  { id: 'familia', label: 'Familia', sublabel: '3-5 personas', icon: '👨‍👩‍👧‍👦', price: 'Desde $55' },
  { id: 'grupo', label: 'Grupo', sublabel: '6+ personas', icon: '👥', price: 'Desde $70' }
]

function select(option) {
  selectedOption.value = option
  emit('select-travelers', option)
}

function handleContinue() {
  if (selectedOption.value) {
    emit('next')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4">
      <button
        v-for="option in travelerOptions"
        :key="option.id"
        @click="select(option)"
        class="relative p-6 rounded-2xl border-2 bg-white transition-all duration-200 text-center flex flex-col items-center gap-2"
        :class="selectedOption?.id === option.id
          ? 'ring-2 ring-cyan-500 bg-cyan-50 border-transparent shadow-md'
          : 'border-slate-200 hover:border-cyan-500 hover:bg-slate-50'"
      >
        <span class="text-3xl font-bold text-slate-800">{{ option.icon }}</span>
        <h3 class="font-semibold text-lg text-slate-800">{{ option.label }}</h3>
        <p class="text-sm text-slate-500">{{ option.sublabel }}</p>
        <span class="text-sm font-medium text-cyan-600">{{ option.price }}</span>
      </button>
    </div>

    <StepButton
      @click="handleContinue"
      :disabled="!selectedOption"
      variant="accent"
    >
      <span>Continuar</span>
    </StepButton>
  </div>
</template>