import { ref } from 'vue'
import AppToast from '@/components/ui/AppToast.vue'

const toasts = ref([])

export function showToast(message, options = {}) {
  const id = Date.now() + Math.random()
  toasts.value.push({
    id,
    message,
    variant: options.variant || 'success',
    duration: options.duration ?? 4000
  })
  return id
}

export function dismissToast(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export function getToasts() {
  return toasts
}
