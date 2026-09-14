<script setup>
/**
 * Botón CTA reutilizable "Cotizar tu viaje".
 * Variantes:
 *   - primary (default): fondo amarillo (#FDB714), texto navy
 *   - ghost: borde blanco, texto blanco (para fondos oscuros)
 * Tamaños:
 *   - sm: px-4 py-2 text-sm
 *   - md (default): px-7 py-3.5 text-base
 *   - lg: fixed bottom-right FAB (position + z-50)
 */

const props = defineProps({
  variant: { type: String, default: 'primary', validator: v => ['primary', 'ghost'].includes(v) },
  size: { type: String, default: 'md', validator: v => ['sm', 'md', 'lg'].includes(v) },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['click'])

function handleClick(e) {
  if (!props.disabled && !props.loading) emit('click', e)
}
</script>

<template>
  <!-- FAB flotante (lg) -->
  <button
    v-if="size === 'lg'"
    type="button"
    @click="handleClick"
    :disabled="disabled || loading"
    class="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-full shadow-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-80 disabled:cursor-wait"
    :class="variant === 'ghost'
      ? 'bg-white/15 text-white border border-white/25 hover:bg-white/25'
      : 'text-[#00184C]'"
    :style="variant !== 'ghost'
      ? { backgroundColor: '#FDB714', color: '#00184C', boxShadow: '0 12px 32px rgba(253, 183, 20, 0.35), 0 4px 12px rgba(0,0,0,0.2)' }
      : {}"
    aria-label="Cotizar tu viaje"
  >
    <span>Cotizar tu viaje</span>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 transform rotate-45">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  </button>

  <!-- Botón inline (sm/md) -->
  <button
    v-else
    type="button"
    @click="handleClick"
    :disabled="disabled || loading"
    class="inline-flex items-center gap-2 font-bold rounded-full transition-all hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-80 disabled:cursor-wait"
    :class="[
      size === 'sm' ? 'px-4 py-2 text-sm' : 'px-7 py-3.5 text-base',
      variant === 'ghost'
        ? 'text-white border border-white/25 hover:bg-white/10'
        : 'text-[#00184C]'
    ]"
    :style="variant !== 'ghost'
      ? { backgroundColor: '#FDB714', color: '#00184C', boxShadow: '0 8px 24px rgba(253, 183, 20, 0.25)' }
      : {}"
  >
    <span>Cotizar tu viaje</span>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 transform rotate-45">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  </button>
</template>
