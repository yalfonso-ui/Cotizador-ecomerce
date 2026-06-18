<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useModalFocus } from '@/composables/useModalFocus.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  plans: { type: Array, required: true },
  selectedPlanId: { type: String, default: null }
})

const emit = defineEmits(['update:modelValue', 'close'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const comparisonData = [
  {
    category: 'Salud y emergencias',
    benefits: [
      { name: 'Emergencias médicas', essential: 'USD 15.000', explorer: 'USD 50.000', premium: 'USD 100.000' },
      { name: 'Repatriación básica', essential: 'check', explorer: 'check', premium: 'check' },
      { name: 'Teleconsulta 24/7', essential: 'check', explorer: 'check', premium: 'check' },
      { name: 'COVID-19', essential: 'dash', explorer: 'check', premium: 'check' },
      { name: 'Asistencia de actividades', essential: 'dash', explorer: 'dash', premium: 'check' }
    ]
  },
  {
    category: 'Viaje, equipajes y cancelaciones',
    benefits: [
      { name: 'Cancelación de viaje', essential: 'dash', explorer: 'check', premium: 'check' },
      { name: 'Equipaje protegido', essential: 'USD 500', explorer: 'USD 1.500', premium: 'USD 3.000' },
      { name: 'Concierge personal', essential: 'dash', explorer: 'dash', premium: 'check' },
      { name: 'Cobertura familiar', essential: 'dash', explorer: 'dash', premium: 'check' },
      { name: 'Asistencia 24/7', essential: 'check', explorer: 'check', premium: 'check' }
    ]
  },
  {
    category: 'Límites',
    benefits: [
      { name: 'Límite de edad', essential: '70 años', explorer: '75 años', premium: 'Sin límite' },
      { name: 'Duración del viaje', essential: '60 días', explorer: '180 días', premium: '365 días' }
    ]
  }
]

function close() {
  isOpen.value = false
  emit('close')
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    close()
  }
}

const { handleKeydown } = useModalFocus(isOpen, close)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        @click="handleBackdropClick"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

        <div
          class="relative w-full md:max-w-5xl md:mx-4 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compare-title"
        >
          <header class="flex items-center justify-between px-8 pt-8 pb-6 flex-shrink-0">
            <div>
              <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-1">Comparativa</p>
              <h2 id="compare-title" class="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                Detalle de coberturas
              </h2>
            </div>
            <button
              type="button"
              @click="close"
              class="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
              aria-label="Cerrar modal"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="flex-1 overflow-y-auto">
            <table class="w-full min-w-[720px] border-collapse">
              <thead class="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-slate-100">
                <tr>
                  <th
                    scope="col"
                    class="sticky left-0 z-30 backdrop-blur-md bg-white/80 text-left pl-8 pr-6 py-4 font-medium text-[13px] text-slate-500 min-w-[180px]"
                  >
                    Beneficios
                  </th>
                  <th
                    v-for="plan in plans"
                    :key="plan.id"
                    scope="col"
                    class="text-center px-6 py-4 min-w-[160px] relative"
                  >
                    <div class="flex flex-col items-center gap-1">
                      <span class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        {{ plan.name }}
                      </span>
                      <span class="text-xl font-semibold text-slate-900 tracking-tight">
                        ${{ plan.price }}
                      </span>
                      <span class="text-[11px] text-slate-400">USD</span>
                      <span
                        v-if="plan.id === selectedPlanId"
                        class="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-medium text-white uppercase tracking-wider"
                      >
                        Tu plan
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                <template v-for="group in comparisonData" :key="group.category">
                  <tr>
                    <td
                      colspan="100"
                      class="sticky left-0 bg-slate-50 pl-8 pr-6 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.1em] border-y border-slate-100"
                    >
                      {{ group.category }}
                    </td>
                  </tr>
                  <tr
                    v-for="benefit in group.benefits"
                    :key="benefit.name"
                    class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <th
                      scope="row"
                      class="sticky left-0 bg-white text-left pl-8 pr-6 py-3.5 font-normal text-[14px] text-slate-700 min-w-[180px]"
                    >
                      {{ benefit.name }}
                    </th>
                    <td
                      v-for="plan in plans"
                      :key="plan.id"
                      class="text-center px-6 py-3.5 text-[14px]"
                      :class="plan.id === selectedPlanId ? 'bg-slate-50/40' : ''"
                    >
                      <template v-if="benefit[plan.id] === 'check'">
                        <svg class="w-5 h-5 text-cyan-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Incluido">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </template>
                      <template v-else-if="benefit[plan.id] === 'dash'">
                        <span class="inline-block w-4 h-px bg-slate-300" aria-label="No incluido"></span>
                      </template>
                      <template v-else>
                        <span class="font-medium text-slate-900 tabular-nums">{{ benefit[plan.id] }}</span>
                      </template>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <footer class="flex items-center justify-between gap-3 px-8 py-5 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
            <p class="text-xs text-slate-500">
              Los precios están expresados en dólares estadounidenses.
            </p>
            <button
              type="button"
              @click="close"
              class="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
            >
              Cerrar
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .modal-enter-from > div:last-child,
  .modal-leave-to > div:last-child {
    transform: scale(0.98) translateY(20px);
  }
}
</style>