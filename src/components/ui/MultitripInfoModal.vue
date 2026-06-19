<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useModalFocus } from '@/composables/useModalFocus.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'close'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

function close() {
  isOpen.value = false
  emit('close')
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) close()
}

const { handleKeydown } = useModalFocus(isOpen, close)

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const benefits = [
  { title: 'Cobertura continua', desc: 'Acompañamiento todo el año, viaje tras viaje.' },
  { title: 'Ahorro real', desc: 'Hasta 40% menos que contratar un seguro cada vez.' },
  { title: 'Cero papeleo repetido', desc: 'Una sola contratación. Sin formularios cada salida.' },
  { title: 'A donde vayas', desc: 'Cobertura válida en todos tus destinos del año.' }
]  
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        <div
          class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="multitrip-title"
        >
          <header class="p-6 pb-4 text-center">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 mb-3">
              <span class="text-2xl" aria-hidden="true">🌍</span>
            </div>
            <h2 id="multitrip-title" class="text-xl font-bold text-slate-900">
              Tu respaldo, todo el año.
            </h2>
            <p class="text-sm text-slate-500 mt-1.5">
              Para quienes viajan más de 2 veces al año y quieren hacerlo sin repetir papeleo.
            </p>
          </header>

          <div class="px-6 pb-2 space-y-3">
            <div
              v-for="(benefit, idx) in benefits"
              :key="idx"
              class="flex items-start gap-3"
            >
              <div class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style="background-color: #43D3FF;">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-slate-800 text-sm">{{ benefit.title }}</p>
                <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ benefit.desc }}</p>
              </div>
            </div>
          </div>

          <footer class="p-6 pt-4">
            <button type="button"
              @click="close"
              class="relative w-full inline-flex items-center justify-between gap-3 py-3 pl-6 pr-3 text-sm font-bold rounded-full shadow-sm transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
              style="background-color: #F9D35A; color: #00184C;"
            >
              <span class="flex-1 text-center">Perfecto, gracias</span>
              <span
                class="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0"
                aria-hidden="true"
                style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300184C' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M7 17L17 7M17 7H8M17 7v9'/%3E%3C/svg%3E&quot;); background-size: 14px 14px; background-repeat: no-repeat; background-position: center;"
              ></span>
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-active > div:last-child,
.fade-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-from > div:last-child,
.fade-leave-to > div:last-child {
  transform: scale(0.95) translateY(20px);
}
</style>
