<script setup>
import { ref } from 'vue'

const emit = defineEmits(['next'])

const travelerType = ref('')

const options = [
  { id: 'solo', label: 'Solo', sublabel: '1 persona', icon: '🧑', count: 1 },
  { id: 'pareja', label: 'Pareja', sublabel: '2 personas', icon: '👫', count: 2 },
  { id: 'familia', label: 'Familia', sublabel: '3-5 personas', icon: '👨‍👩‍👧‍👦', count: 4 },
  { id: 'grupo', label: 'Grupo', sublabel: '6+ personas', icon: '👥', count: 6 }
]

function selectType(id) {
  travelerType.value = id
  emit('next', { travelers: id })
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <button
      v-for="option in options"
      :key="option.id"
      @click="selectType(option.id)"
      class="relative p-6 rounded-2xl border-2 bg-white transition-all duration-200 text-center hover:border-cyan-500 hover:ring-4 hover:ring-cyan-500/20"
      :class="travelerType === option.id
        ? 'border-cyan-500 ring-4 ring-cyan-500 bg-cyan-50 shadow-lg'
        : 'border-gray-100'"
    >
      <span class="text-5xl mb-3 block">{{ option.icon }}</span>
      <h3 class="font-semibold text-lg mb-1" :class="travelerType === option.id ? 'text-cyan-700' : 'text-slate-900'">
        {{ option.label }}
      </h3>
      <p class="text-sm" :class="travelerType === option.id ? 'text-cyan-600' : 'text-gray-500'">
        {{ option.sublabel }}
      </p>
    </button>
  </div>
</template>
