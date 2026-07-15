<script setup>
defineProps({
  variant: { type: String, default: 'error' },
  dismissible: { type: Boolean, default: false }
})

const emit = defineEmits(['dismiss'])
</script>

<template>
  <div
    role="alert"
    aria-live="assertive"
    :class="[
      'flex items-start gap-3 rounded-xl p-4 text-sm border transition-all duration-200',
      variant === 'error'
        ? 'bg-red-50 border-red-200 text-red-800'
        : variant === 'warning'
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : variant === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
    ]"
  >
    <!-- Icon -->
    <svg
      v-if="variant === 'error'"
      class="w-5 h-5 shrink-0 mt-0.5 text-red-500"
      fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <svg
      v-else-if="variant === 'warning'"
      class="w-5 h-5 shrink-0 mt-0.5 text-amber-500"
      fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86a1.73 1.73 0 001.5 2.58h17.62a1.73 1.73 0 001.5-2.58l-8.6-14.86a1.73 1.73 0 00-3 0z" />
    </svg>
    <svg
      v-else-if="variant === 'success'"
      class="w-5 h-5 shrink-0 mt-0.5 text-emerald-500"
      fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke-width="2" stroke="currentColor" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
    </svg>
    <svg
      v-else
      class="w-5 h-5 shrink-0 mt-0.5 text-blue-500"
      fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>

    <!-- Content -->
    <div class="flex-1 min-w-0 leading-relaxed">
      <slot />
    </div>

    <!-- Dismiss -->
    <button
      v-if="dismissible"
      type="button"
      @click="emit('dismiss')"
      class="shrink-0 w-5 h-5 rounded flex items-center justify-center hover:bg-black/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      :class="variant === 'error' ? 'focus-visible:ring-red-500 text-red-400' : variant === 'warning' ? 'focus-visible:ring-amber-500 text-amber-400' : 'focus-visible:ring-blue-500 text-blue-400'"
      aria-label="Cerrar mensaje"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
