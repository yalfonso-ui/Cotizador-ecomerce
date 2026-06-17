<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = 'lemonade_tour_seen'

const emit = defineEmits(['finish'])

const isVisible = ref(false)
let escHandler = null

onMounted(() => {
  try {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      setTimeout(() => { isVisible.value = true }, 600)
    }
  } catch (e) {
    isVisible.value = true
  }
  escHandler = (e) => {
    if (e.key === 'Escape' && isVisible.value) {
      e.preventDefault()
      finish()
    }
  }
  document.addEventListener('keydown', escHandler)
})

onUnmounted(() => {
  if (escHandler) document.removeEventListener('keydown', escHandler)
})

function finish() {
  isVisible.value = false
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch (e) { /* ignore */ }
  emit('finish')
}

const steps = [
  { icon: 'M9 20l-5.447-5.482A1 1 0 013 13.554V5a2 2 0 012-2h14a2 2 0 012 2v8.554a1 1 0 01-.293.707L15 20l-3-3-3 3z', title: 'Confirma tu origen', desc: 'Detectamos tu país automáticamente. Puedes cambiarlo si no es correcto.' },
  { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Elige tu destino', desc: 'Selecciona uno o más países. Puedes agregar hasta 5 destinos.' },
  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Paga seguro', desc: 'Tu pago se procesa de forma segura. Te enviaremos la póliza por correo.' }
]
</script>

<template>
  <Teleport to="body">
    <Transition name="tour-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        @click.self="finish"
      >
        <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
          <div class="p-6 text-center">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-100 mb-4">
              <svg class="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 id="tour-title" class="text-2xl font-heading font-bold text-slate-900 mb-2">¡Bienvenido a Continental Assist!</h2>
            <p class="text-sm text-slate-500 mb-6">En 3 pasos simples tendrás tu asistencia de viaje activa.</p>

            <div class="space-y-3 text-left">
              <div v-for="(s, idx) in steps" :key="idx" class="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                <div class="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {{ idx + 1 }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-slate-800">{{ s.title }}</p>
                  <p class="text-xs text-slate-500 leading-snug">{{ s.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <label class="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
              <input type="checkbox" class="w-3.5 h-3.5 rounded text-cyan-500" />
              No mostrar de nuevo
            </label>
            <button
              type="button"
              @click="finish"
              class="px-5 py-2 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 active:scale-95 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Comenzar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tour-fade-enter-active,
.tour-fade-leave-active {
  transition: opacity 0.3s ease;
}
.tour-fade-enter-from,
.tour-fade-leave-to {
  opacity: 0;
}
</style>
