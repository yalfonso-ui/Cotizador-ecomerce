<script setup>
const emit = defineEmits(['select-travelers', 'next'])

const travelerOptions = [
  { id: 'solo', label: 'Solo', sublabel: '1 persona', icon: '🧑', price: 'Desde $25' },
  { id: 'pareja', label: 'Pareja', sublabel: '2 personas', icon: '👫', price: 'Desde $40' },
  { id: 'familia', label: 'Familia', sublabel: '3-5 personas', icon: '👨‍👩‍👧‍👦', price: 'Desde $55' },
  { id: 'grupo', label: 'Grupo', sublabel: '6+ personas', icon: '👥', price: 'Desde $70' }
]

function select(option) {
  emit('select-travelers', option)
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4">
      <button
        v-for="option in travelerOptions"
        :key="option.id"
        @click="select(option)"
        class="relative p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-primary-500 hover:bg-primary-500 group transition-all duration-200 text-center"
      >
        <span class="text-5xl mb-3 block">{{ option.icon }}</span>
        <h3 class="font-semibold text-lg text-gray-800 group-hover:text-white mb-1">{{ option.label }}</h3>
        <p class="text-sm text-gray-500 group-hover:text-white/80 mb-3">{{ option.sublabel }}</p>
        <span class="text-sm font-medium text-primary-500 group-hover:text-white/90">{{ option.price }}</span>
      </button>
    </div>
  </div>
</template>