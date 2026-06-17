<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  message: { type: String, required: true },
  variant: { type: String, default: 'success', validator: (v) => ['success', 'info', 'warning', 'error'].includes(v) },
  duration: { type: Number, default: 4000 }
})

const emit = defineEmits(['close'])

let timer = null

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(() => emit('close'), props.duration)
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

const variantClasses = {
  success: 'bg-cyan-600 text-white',
  info: 'bg-slate-700 text-white',
  warning: 'bg-amber-50 border border-amber-300 text-amber-900',
  error: 'bg-red-600 text-white'
}

const iconPaths = {
  success: 'M5 13l4 4L19 7',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z',
  error: 'M6 18L18 6M6 6l12 12'
}
</script>

<template>
  <div
    class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 max-w-md animate-fade-in"
    :class="variantClasses[variant]"
    role="status"
    aria-live="polite"
  >
    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="iconPaths[variant]" />
    </svg>
    <span>{{ message }}</span>
  </div>
</template>
