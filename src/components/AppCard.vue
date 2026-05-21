<script setup>
defineProps({
  variant: {
    type: String,
    default: 'elevated',
    validator: v => ['elevated', 'filled', 'outlined'].includes(v)
  },
  padding: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg', 'none'].includes(v)
  },
  hoverable: {
    type: Boolean,
    default: false
  }
})

const paddingMap = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  none: ''
}
</script>

<template>
  <div
    class="relative transition-all duration-300"
    :class="[
      variant === 'elevated' && 'bg-white shadow-md hover:shadow-lg',
      variant === 'filled' && 'bg-gray-50',
      variant === 'outlined' && 'bg-white border border-gray-200',
      hoverable && 'cursor-pointer hover:-translate-y-0.5'
    ]"
  >
    <div :class="paddingMap[padding]">
      <slot></slot>
    </div>
  </div>
</template>