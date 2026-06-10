<script setup>
import { computed } from 'vue'

const props = defineProps({
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
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  }
})

const emit = defineEmits(['click'])

const variantClasses = {
  primary: 'bg-[#00184C] text-white hover:bg-[#00133D] shadow-md hover:shadow-lg',
  accent: 'bg-[#F9D35A] text-[#00184C] hover:bg-[#D4A82A] shadow-md hover:shadow-lg',
  secondary: 'bg-[#43D3FF] text-[#00184C] hover:bg-[#1BA8D4] shadow-md hover:shadow-lg',
  outline: 'border-2 border-[#00184C] text-[#00184C] hover:bg-[#00184C] hover:text-white',
  ghost: 'text-[#00184C] hover:bg-gray-100'
}

const disabledClasses = 'bg-slate-100 text-slate-600 cursor-not-allowed rounded-full'

const baseClasses = computed(() => `w-full sm:w-auto min-w-[250px] px-8 py-3.5 font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/30 mx-auto`)

const buttonClasses = computed(() => {
  const roundedClass = props.disabled ? 'rounded-full' : 'rounded-xl'
  return [baseClasses.value, roundedClass, props.disabled ? disabledClasses : variantClasses[props.variant]]
})
</script>

<template>
  <button
    :type="type"
    @click="emit('click')"
    :disabled="disabled || loading"
    :class="buttonClasses"
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
    <slot v-else-if="text">{{ text }}</slot>
    <slot v-else />
  </button>
</template>