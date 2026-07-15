<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const channels = [
  { id: 'phone', label: 'Llámanos', value: '01 800 123 4567', href: 'tel:+528001234567', icon: 'phone' },
  { id: 'whatsapp', label: 'WhatsApp', value: '+52 55 1234 5678', href: 'https://wa.me/525512345678', icon: 'chat' },
  { id: 'email', label: 'Correo electrónico', value: 'ayuda@continentalassist.com', href: 'mailto:ayuda@continentalassist.com', icon: 'mail' },
  { id: 'chat', label: 'Chat en vivo', value: 'Disponible 24/7', href: '#', icon: 'live' },
]

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
})

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).dataset.backdrop !== undefined) {
    emit('close')
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
      >
        <div
          class="absolute inset-0 bg-black/40"
          data-backdrop
        ></div>

        <div
          class="relative w-full md:max-w-md bg-white md:rounded-2xl shadow-xl"
          :class="isMobile ? 'rounded-t-2xl max-h-[85vh] overflow-y-auto' : 'mb-0'"
          role="dialog"
          aria-modal="true"
          aria-label="Canales de contacto"
        >
          <div class="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-slate-100">
            <h2 class="text-lg font-bold" style="color: #00184C;">Contáctanos</h2>
            <button
              type="button"
              @click="emit('close')"
              class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-4 space-y-3">
            <a
              v-for="ch in channels"
              :key="ch.id"
              :href="ch.href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#43D3FF] hover:bg-sky-50/30 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
            >
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                :style="{ backgroundColor: '#43D3FF' }"
              >
                <svg v-if="ch.icon === 'phone'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <svg v-else-if="ch.icon === 'chat'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <svg v-else-if="ch.icon === 'mail'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-800">{{ ch.label }}</p>
                <p class="text-xs text-slate-500 truncate">{{ ch.value }}</p>
              </div>
              <svg class="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.modal-enter-from > div:last-child {
  transform: translateY(100%);
}
.modal-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>
