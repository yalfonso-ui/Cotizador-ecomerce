<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const sections = [
  {
    title: '1. Cobertura',
    content: 'El plan contratado cubre asistencia médica en viajes, incluyendo consultas, hospitalización, medicamentos recetados y repatriación sanitaria, según los límites establecidos en las condiciones particulares de la póliza.',
  },
  {
    title: '2. Exclusiones',
    content: 'Quedan excluidos: preexistencias no declaradas, actividades de alto riesgo sin cobertura contratada, accidentes bajo efectos de alcohol o drogas, y eventos derivados de desastres naturales declarados.',
  },
  {
    title: '3. Vigencia',
    content: 'La cobertura inicia a las 00:00 horas del día de salida indicado en la póliza y finaliza a las 23:59 horas del día de regreso. No aplica para estancias mayores a 90 días consecutivos.',
  },
  {
    title: '4. Cancelación',
    content: 'Puedes cancelar dentro de los primeros 15 días desde la compra con reembolso total. Después de ese periodo, aplican cargos administrativos según la tabla de cancelación disponible en nuestro sitio web.',
  },
  {
    title: '5. Reclamaciones',
    content: 'Para reclamar, contacta a nuestra central de asistencia 24/7 dentro de las primeras 24 horas del evento. Guarda todos los recibos y documentos médicos originales para tu reembolso.',
  },
  {
    title: '6. Datos personales',
    content: 'Tus datos serán tratados conforme a nuestra Política de Privacidad. No compartimos información con terceros no autorizados. Puedes ejercer tus derechos ARCO en cualquier momento.',
  },
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
        <div class="absolute inset-0 bg-black/40" data-backdrop></div>

        <div
          class="relative w-full md:max-w-2xl bg-white md:rounded-2xl shadow-xl max-h-[85vh] flex flex-col"
          :class="isMobile ? 'rounded-t-2xl' : ''"
          role="dialog"
          aria-modal="true"
          aria-label="Términos y condiciones"
        >
          <div class="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
            <h2 class="text-lg font-bold" style="color: #00184C;">Términos y condiciones</h2>
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

          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <section v-for="(sec, i) in sections" :key="i">
              <h3 class="text-sm font-bold text-slate-800 mb-1">{{ sec.title }}</h3>
              <p class="text-sm text-slate-600 leading-relaxed">{{ sec.content }}</p>
            </section>
          </div>

          <div class="sticky bottom-0 bg-white p-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              @click="emit('close')"
              class="w-full bg-[#F9D35A] text-[#00184C] font-bold text-base py-3.5 rounded-full transition-all hover:brightness-95 shadow-sm"
            >
              Entendido
            </button>
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
