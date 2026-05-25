<script setup>
import { ref } from 'vue'

const emit = defineEmits(['update'])

const props = defineProps({
  modelValue: String
})

const selectedId = ref(props.modelValue || '')

const options = [
  { id: 'solo', label: 'Solo', sublabel: '1 persona', icon: '🧑', price: 'Desde $25' },
  { id: 'pareja', label: 'Pareja', sublabel: '2 personas', icon: '👫', price: 'Desde $40' },
  { id: 'familia', label: 'Familia', sublabel: '3-5 personas', icon: '👨‍👩‍👧‍👦', price: 'Desde $55' },
  { id: 'grupo', label: 'Grupo', sublabel: '6+ personas', icon: '👥', price: 'Desde $70' }
]

function select(option) {
  selectedId.value = option.id
  emit('update', option.id)
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4">
      <button
        v-for="option in options"
        :key="option.id"
        @click="select(option)"
        class="relative p-6 rounded-2xl border-2 bg-white transition-all duration-200 text-center"
        :class="selectedId === option.id
          ? 'border-cyan-500 ring-4 ring-cyan-500/20 bg-cyan-50/30 shadow-lg'
          : 'border-gray-100 hover:border-cyan-500 hover:ring-4 hover:ring-cyan-500/20'"
      >
        <div v-if="selectedId === option.id" class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span class="text-5xl mb-3 block">{{ option.icon }}</span>
        <h3 class="font-semibold text-lg mb-1" :class="selectedId === option.id ? 'text-cyan-700' : 'text-gray-800'">
          {{ option.label }}
        </h3>
        <p class="text-sm mb-3" :class="selectedId === option.id ? 'text-cyan-600/70' : 'text-gray-500'">
          {{ option.sublabel }}
        </p>
        <span class="text-sm font-medium" :class="selectedId === option.id ? 'text-cyan-600' : 'text-[#00184C]'">
          {{ option.price }}
        </span>
      </button>
    </div>
  </div>
</template>