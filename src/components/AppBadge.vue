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
    :class="{
      'bg-primary-100 text-primary-500': variant === 'primary',
      'bg-secondary-100 text-secondary-500': variant === 'secondary',
      'bg-accent-100 text-accent-500': variant === 'accent',
      'bg-green-100 text-green-600': variant === 'success',
      'bg-red-100 text-red-600': variant === 'error',
      'bg-yellow-100 text-yellow-600': variant === 'warning'
    }"
  >
    <slot></slot>
  </span>
</template>