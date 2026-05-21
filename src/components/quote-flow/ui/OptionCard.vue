<script setup>
defineProps({
  selected: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    required: true
  },
  sublabel: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<template>
  <button
    @click="$emit('click')"
    :disabled="disabled"
    class="w-full p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[100px] md:min-h-[120px] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/30"
    :class="[
      selected
        ? 'border-[#00184C] bg-[#00184C] text-white shadow-lg'
        : 'border-gray-200 bg-white text-gray-700 hover:border-[#43D3FF] hover:bg-gray-50',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
  >
    <span v-if="icon" class="text-3xl md:text-4xl">{{ icon }}</span>
    <span class="font-semibold text-base md:text-lg text-center">{{ label }}</span>
    <span v-if="sublabel" class="text-sm text-gray-500 text-center">{{ sublabel }}</span>
  </button>
</template>