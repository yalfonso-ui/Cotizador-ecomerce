<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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

const planIds = computed(() => props.plans.map(p => p.id))

const buildComparisonData = (ids) => [
  {
    category: 'Salud y emergencias',
    benefits: [
      { name: 'Atención médica de urgencia', values: { lite: 'USD 10.000', essential: 'USD 15.000', explorer: 'USD 50.000', premium: 'USD 100.000', elite: 'USD 250.000' }, ids },
      { name: 'Repatriación a casa', values: { lite: 'check', essential: 'check', explorer: 'check', premium: 'check', elite: 'check' }, ids },
      { name: 'Teleconsulta cuando la necesites', values: { lite: 'dash', essential: 'check', explorer: 'check', premium: 'check', elite: 'check' }, ids },
      { name: 'Cobertura COVID-19', values: { lite: 'dash', essential: 'check', explorer: 'check', premium: 'check', elite: 'check' }, ids },
      { name: 'Actividades deportivas', values: { lite: 'dash', essential: 'dash', explorer: 'dash', premium: 'check', elite: 'check' }, ids }
    ]
  },
  {
    category: 'Tu viaje y tus pertenencias',
    benefits: [
      { name: 'Cancelación de viaje', values: { lite: 'dash', essential: 'dash', explorer: 'check', premium: 'check', elite: 'check' }, ids },
      { name: 'Equipaje protegido', values: { lite: 'USD 500', essential: 'USD 1.000', explorer: 'USD 1.500', premium: 'USD 3.000', elite: 'USD 5.000' }, ids },
      { name: 'Concierge personal', values: { lite: 'dash', essential: 'dash', explorer: 'dash', premium: 'check', elite: 'check' }, ids },
      { name: 'Acompañamiento 24/7', values: { lite: 'check', essential: 'check', explorer: 'check', premium: 'check', elite: 'check' }, ids }
    ]
  },
  {
    category: 'Límites de tu cobertura',
    benefits: [
      { name: 'Edad máxima', values: { lite: '70 años', essential: '70 años', explorer: '75 años', premium: '80 años', elite: 'Sin límite' }, ids },
      { name: 'Duración del viaje', values: { lite: '30 días', essential: '60 días', explorer: '180 días', premium: '365 días', elite: 'Sin límite' }, ids }
    ]
  }
]  

const comparisonData = computed(() => buildComparisonData(planIds.value))

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
        class="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
        @click="handleBackdropClick"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

        <div
          class="relative w-full md:max-w-6xl md:mx-4 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compare-title"
        >
          <header class="flex items-center justify-between px-8 pt-8 pb-6 flex-shrink-0">
            <div>
              <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-1">Compara sin compromiso</p>
              <h2 id="compare-title" class="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                Lo que te cubre cada plan
              </h2>
            </div>
            <button
              type="button"
              @click="close"
              class="flex items-center justify-center w-10 h-10 rounded-full active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
              style="background-color: #EDF4F9;"
              aria-label="Cerrar modal"
            >
              <svg class="w-4 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style="color: #00184C;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="flex-1 overflow-y-auto">
            <table class="w-full min-w-[900px] border-collapse">
              <thead class="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-slate-100">
                <tr>
                  <th
                    scope="col"
                    class="sticky left-0 z-30 backdrop-blur-md bg-white/80 text-left pl-8 pr-6 py-4 font-medium text-[13px] text-slate-500 min-w-[180px]"
                  >
                    Tu respaldo
                  </th>
                  <th
                    v-for="plan in plans"
                    :key="plan.id"
                    scope="col"
                    class="text-center px-4 py-4 min-w-[140px] relative"
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
                        class="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
                        style="background-color: #43D3FF; color: #00184C;"
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
                      class="text-center px-4 py-3.5 text-[14px]"
                      :class="plan.id === selectedPlanId ? 'bg-slate-50/40' : ''"
                    >
                      <template v-if="benefit.values[plan.id] === 'check'">
                        <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Incluido" style="color: #00184C;">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </template>
                      <template v-else-if="benefit.values[plan.id] === 'dash'">
                        <span class="inline-block w-4 h-px bg-slate-300" aria-label="No incluido"></span>
                      </template>
                      <template v-else>
                        <span class="font-medium text-slate-900 tabular-nums">{{ benefit.values[plan.id] }}</span>
                      </template>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <footer class="flex items-center justify-between gap-3 px-8 py-5 border-t border-slate-100 flex-shrink-0" style="background-color: #EDF4F9;">
            <p class="text-xs" style="color: #00184C; opacity: 0.6;">
              Precios en dólares estadounidenses. Así de simple.
            </p>
            <button
              type="button"
              @click="close"
              class="relative inline-flex items-center justify-between gap-2 px-5 py-2.5 text-sm font-bold rounded-full shadow-sm transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
              style="background-color: #F9D35A; color: #00184C;"
            >
              <span>Listo, gracias</span>
              <span
                class="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 ml-1"
                aria-hidden="true"
                style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300184C' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M7 17L17 7M17 7H8M17 7v9'/%3E%3C/svg%3E&quot;); background-size: 12px 12px; background-repeat: no-repeat; background-position: center;"
              ></span>
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