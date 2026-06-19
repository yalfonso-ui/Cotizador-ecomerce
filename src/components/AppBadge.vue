<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'secondary', 'accent', 'success', 'error', 'warning'].includes(v)
  }
})
</script>

<template>
  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
    :style="{
      backgroundColor: variant === 'primary' ? '#00184C' : variant === 'secondary' ? 'rgba(67, 211, 255, 0.12)' : variant === 'accent' ? 'rgba(249, 211, 90, 0.15)' : variant === 'success' ? 'rgba(67, 211, 255, 0.12)' : variant === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 211, 90, 0.15)',
      color: variant === 'primary' ? 'white' : variant === 'secondary' ? '#00184C' : variant === 'accent' ? '#00184C' : variant === 'success' ? '#00184C' : variant === 'error' ? '#dc2626' : '#00184C'
    }"
  >
    <slot></slot>
  </span>
</template>