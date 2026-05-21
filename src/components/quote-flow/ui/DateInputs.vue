<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ day: '', month: '', year: '' })
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const maxLength = {
  day: 2,
  month: 2,
  year: 4
}

function handleInput(field, value) {
  const filtered = value.replace(/\D/g, '')
  if (filtered.length <= maxLength[field]) {
    emit('update:modelValue', {
      ...props.modelValue,
      [field]: filtered
    })
  }
}

function handleKeydown(field, event) {
  if (event.key === 'Backspace' && props.modelValue[field].length === 0) {
    const order = ['day', 'month', 'year']
    const currentIndex = order.indexOf(field)
    if (currentIndex > 0) {
      const prevField = order[currentIndex - 1]
      const input = event.target.parentElement.querySelector(`input[data-field="${prevField}"]`)
      if (input) input.focus()
    }
  }
}

function handlePaste(event) {
  const paste = event.clipboardData.getData('text').replace(/\D/g, '')
  if (paste.length >= 2) {
    emit('update:modelValue', {
      day: paste.slice(0, 2),
      month: paste.slice(2, 4),
      year: paste.slice(4, 8)
    })
    event.preventDefault()
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex gap-3 justify-center" @paste="handlePaste">
      <div class="flex-1 text-center">
        <label class="text-sm font-medium text-gray-600 mb-1 block">Día</label>
        <input
          type="text"
          inputmode="numeric"
          maxlength="2"
          data-field="day"
          :value="modelValue.day"
          @input="handleInput('day', $event.target.value)"
          @keydown="handleKeydown('day', $event)"
          placeholder="DD"
          class="w-full h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl focus:border-[#43D3FF] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/20 transition-all"
          :class="error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''"
        />
      </div>
      
      <div class="flex-1 text-center">
        <label class="text-sm font-medium text-gray-600 mb-1 block">Mes</label>
        <input
          type="text"
          inputmode="numeric"
          maxlength="2"
          data-field="month"
          :value="modelValue.month"
          @input="handleInput('month', $event.target.value)"
          @keydown="handleKeydown('month', $event)"
          placeholder="MM"
          class="w-full h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl focus:border-[#43D3FF] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/20 transition-all"
          :class="error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''"
        />
      </div>
      
      <div class="flex-1 text-center">
        <label class="text-sm font-medium text-gray-600 mb-1 block">Año</label>
        <input
          type="text"
          inputmode="numeric"
          maxlength="4"
          data-field="year"
          :value="modelValue.year"
          @input="handleInput('year', $event.target.value)"
          @keydown="handleKeydown('year', $event)"
          placeholder="AAAA"
          class="w-full h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl focus:border-[#43D3FF] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/20 transition-all"
          :class="error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''"
        />
      </div>
    </div>
    
    <p v-if="error" class="text-red-500 text-sm text-center mt-2">{{ error }}</p>
  </div>
</template>