<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'accent',
    validator: (value) => ['primary', 'accent', 'secondary', 'outline', 'ghost'].includes(value)
  },
  text: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const variantClasses = {
  primary: 'bg-[#00184C] text-white hover:bg-[#00133D] shadow-md hover:shadow-lg',
  accent: 'bg-[#F9D35A] text-[#00184C] hover:bg-[#D4A82A] shadow-md hover:shadow-lg',
  secondary: 'bg-[#43D3FF] text-[#00184C] hover:bg-[#1BA8D4] shadow-md hover:shadow-lg',
  outline: 'border-2 border-[#00184C] text-[#00184C] hover:bg-[#00184C] hover:text-white',
  ghost: 'text-[#00184C] hover:bg-gray-100'
}

const disabledClasses = 'bg-gray-200 text-gray-400 cursor-not-allowed hover:shadow-none hover:bg-gray-200 hover:text-gray-400'
</script>

<template>
  <button
    @click="$emit('click')"
    :disabled="disabled || loading"
    class="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/30 disabled:cursor-not-allowed"
    :class="[disabled ? disabledClasses : variantClasses[variant]]"
  >
    <svg
      v-if="loading"
      class="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <span v-if="loading">Procesando...</span>
    <span v-else>{{ text }}</span>
  </button>
</template>