<script setup>
import OptionCard from '../../ui/OptionCard.vue'
import StepButton from '../../ui/StepButton.vue'

const emit = defineEmits(['update', 'next'])

const durations = [
  { id: '1-7', label: '1-7 días', icon: '✈️', sublabel: 'Escapada rápida' },
  { id: '8-15', label: '8-15 días', icon: '🧳', sublabel: 'Viaje estándar' },
  { id: '16-30', label: '16-30 días', icon: '📅', sublabel: 'Vacaciones largas' },
  { id: '30+', label: '30+ días', icon: '🌴', sublabel: 'Avturero digital' }
]

const selectedDuration = defineModel('value', { default: null })

function handleSelect(id) {
  selectedDuration.value = id
  emit('update', 'duration', id)
}

function handleNext() {
  if (selectedDuration.value) {
    emit('next')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#43D3FF]/20 mb-4">
        <span class="text-3xl">📆</span>
      </div>
      <h2 class="font-heading text-2xl md:text-3xl font-semibold text-[#00184C] mb-2">
        ¿Cuánto tiempo dura tu aventura?
      </h2>
      <p class="text-gray-500">Selecciona la duración de tu viaje</p>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <OptionCard
        v-for="duration in durations"
        :key="duration.id"
        :icon="duration.icon"
        :label="duration.label"
        :sublabel="duration.sublabel"
        :selected="selectedDuration === duration.id"
        @click="handleSelect(duration.id)"
      />
    </div>

    <div class="pt-4">
      <StepButton
        text="Siguiente"
        :disabled="!selectedDuration"
        @click="handleNext"
      />
    </div>
  </div>
</template>