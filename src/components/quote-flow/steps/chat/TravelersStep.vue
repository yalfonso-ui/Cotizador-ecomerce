<script setup>
import OptionCard from '../../ui/OptionCard.vue'
import StepButton from '../../ui/StepButton.vue'

const emit = defineEmits(['update', 'next'])

const travelers = [
  { id: 'solo', label: 'Solo', icon: '🙋', sublabel: 'Viajo tranquilo' },
  { id: 'couple', label: 'Pareja', icon: '👫', sublabel: 'Mi compañero/a' },
  { id: 'family', label: 'Familia', icon: '👨‍👩‍👧', sublabel: 'Con niños' },
  { id: 'group', label: 'Grupo', icon: '👥', sublabel: '+4 personas' }
]

const selectedTravelers = defineModel('value', { default: null })

function handleSelect(id) {
  selectedTravelers.value = id
  emit('update', 'travelers', id)
}

function handleNext() {
  if (selectedTravelers.value) {
    emit('next')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#43D3FF]/20 mb-4">
        <span class="text-3xl">👥</span>
      </div>
      <h2 class="font-heading text-2xl md:text-3xl font-semibold text-[#00184C] mb-2">
        ¿Quiénes van en este viaje?
      </h2>
      <p class="text-gray-500">Selecciona el tipo de viajero</p>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <OptionCard
        v-for="traveler in travelers"
        :key="traveler.id"
        :icon="traveler.icon"
        :label="traveler.label"
        :sublabel="traveler.sublabel"
        :selected="selectedTravelers === traveler.id"
        @click="handleSelect(traveler.id)"
      />
    </div>

    <div class="pt-4">
      <StepButton
        text="Ver mis planes"
        :disabled="!selectedTravelers"
        @click="handleNext"
      />
    </div>
  </div>
</template>