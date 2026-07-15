<script setup>
import AppSpinner from '@/components/ui/AppSpinner.vue'

defineProps({
  variant: {
    type: String,
    default: 'accent',
    validator: v => ['primary', 'secondary', 'accent', 'outline', 'ghost'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v)
  },
  to: String,
  href: String,
  disabled: Boolean,
  loading: Boolean
})
</script>

<template>
  <component
    :is="to ? 'RouterLink' : href ? 'a' : 'button'"
    :to="to"
    :href="href"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    :class="{
      'bg-accent-300 text-primary-500 hover:bg-accent-400 shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0': variant === 'accent',
      'bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5': variant === 'primary',
      'bg-secondary-300 text-primary-500 hover:bg-secondary-400 shadow-md shadow-secondary/20 hover:shadow-lg hover:-translate-y-0.5': variant === 'secondary',
      'bg-transparent text-primary-500 border-2 border-primary-500 hover:bg-primary-500 hover:text-white': variant === 'outline',
      'bg-transparent text-primary-500 hover:bg-primary-50': variant === 'ghost',
      'px-3 py-2 text-sm': size === 'sm',
      'px-5 py-2.5 text-sm': size === 'md',
      'px-6 py-3 text-base': size === 'lg'
    }"
  >
    <AppSpinner v-if="loading" />
    <slot></slot>
  </component>
</template>