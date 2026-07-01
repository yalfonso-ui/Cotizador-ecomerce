<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useModalFocus } from '@/composables/useModalFocus.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  destinationName: { type: String, default: 'tu destino' }
})
const emit = defineEmits(['update:modelValue', 'close', 'submit', 'download-pdf'])

const email = ref('')
const isSubmitting = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

function close() {
  if (isSubmitting.value) return
  isOpen.value = false
  setTimeout(() => {
    email.value = ''
  }, 300)
  emit('close')
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) close()
}

async function handleSubmit() {
  if (!emailValid.value || isSubmitting.value) return
  isSubmitting.value = true
  emit('submit', { email: email.value.trim() })
  setTimeout(() => {
    isSubmitting.value = false
    close()
  }, 800)
}

function handleDownload() {
  emit('download-pdf')
  close()
}

const { handleKeydown } = useModalFocus(isOpen, close)

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out"
        @click="handleBackdropClick"
      >
        <div class="absolute inset-0 bg-[#00184C]/10 backdrop-blur-md" aria-hidden="true" />

        <div
          class="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-100"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-email-title"
        >
          <button
            type="button"
            @click="close"
            class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-[#00184C] hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
            aria-label="Cerrar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div>
            <h2 id="quote-email-title" class="text-xl font-bold text-[#00184C] tracking-tight">
              Recibe tu cotización en segundos
            </h2>
            <p class="text-slate-500 text-sm mt-2">
              Enviaremos los precios detallados para tu viaje a {{ destinationName }}.
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="mt-6">
            <label for="quote-email" class="sr-only">Correo electrónico</label>
            <div class="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 px-4 py-3 focus-within:border-[#43D3FF] focus-within:bg-white transition-all">
              <svg class="w-4 h-4 text-slate-400 shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                id="quote-email"
                v-model="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                placeholder="tu@correo.com"
                class="border-none bg-transparent focus:ring-0 text-base w-full p-0 text-[#00184C] placeholder-slate-400 outline-none"
                :disabled="isSubmitting"
                required
              />
            </div>

            <button
              type="submit"
              :disabled="!emailValid || isSubmitting"
              class="w-full bg-[#F9D35A] text-[#00184C] font-bold text-sm py-3.5 rounded-full flex items-center justify-center gap-2 mt-4 hover:brightness-95 shadow-sm transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:brightness-100"
            >
              <span>{{ isSubmitting ? 'Enviando…' : 'Enviar cotización' }}</span>
              <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-white transform rotate-45">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </button>
          </form>

          <button
            type="button"
            @click="handleDownload"
            class="text-xs text-slate-400 hover:text-blue-600 font-medium text-center block mt-4 transition-colors cursor-pointer w-full"
            :disabled="isSubmitting"
          >
            O prefiero descargar en PDF ahora
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease-out;
}
.modal-fade-enter-active > div:last-child,
.modal-fade-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease-out;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from > div:last-child,
.modal-fade-leave-to > div:last-child {
  transform: scale(0.96) translateY(8px);
  opacity: 0;
}
</style>