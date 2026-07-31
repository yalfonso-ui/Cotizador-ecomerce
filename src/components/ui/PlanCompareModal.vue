<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useModalFocus } from '@/composables/useModalFocus.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  plans: { type: Array, required: true },
  selectedPlanId: { type: String, default: null },
  recommendedPlanId: { type: String, default: null }
})

const emit = defineEmits(['update:modelValue', 'close', 'select-plan'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const COMPARISON = [
  {
    category: 'Salud y emergencias',
    benefits: [
      { name: 'Atención médica de urgencia', values: { lite: 'USD 10.000', essential: 'USD 15.000', explorer: 'USD 50.000', premium: 'USD 100.000', elite: 'USD 250.000' } },
      { name: 'Repatriación a casa', values: { lite: 'check', essential: 'check', explorer: 'check', premium: 'check', elite: 'check' } },
      { name: 'Teleconsulta cuando la necesites', values: { lite: 'dash', essential: 'check', explorer: 'check', premium: 'check', elite: 'check' } },
      { name: 'Cobertura COVID-19', values: { lite: 'dash', essential: 'check', explorer: 'check', premium: 'check', elite: 'check' } },
      { name: 'Actividades deportivas', values: { lite: 'dash', essential: 'dash', explorer: 'dash', premium: 'check', elite: 'check' } }
    ]
  },
  {
    category: 'Tu viaje y tus pertenencias',
    benefits: [
      { name: 'Cancelación de viaje', values: { lite: 'dash', essential: 'dash', explorer: 'check', premium: 'check', elite: 'check' } },
      { name: 'Equipaje protegido', values: { lite: 'USD 500', essential: 'USD 1.000', explorer: 'USD 1.500', premium: 'USD 3.000', elite: 'USD 5.000' } },
      { name: 'Concierge personal', values: { lite: 'dash', essential: 'dash', explorer: 'dash', premium: 'check', elite: 'check' } },
      { name: 'Acompañamiento 24/7', values: { lite: 'check', essential: 'check', explorer: 'check', premium: 'check', elite: 'check' } }
    ]
  },
  {
    category: 'Límites de tu cobertura',
    benefits: [
      { name: 'Edad máxima', values: { lite: '70 años', essential: '70 años', explorer: '75 años', premium: '80 años', elite: 'Sin límite' } },
      { name: 'Duración del viaje', values: { lite: '30 días', essential: '60 días', explorer: '180 días', premium: '365 días', elite: 'Sin límite' } }
    ]
  }
]

const gridStyle = computed(() => ({
  gridTemplateColumns: `minmax(0, 1.3fr) repeat(${props.plans.length}, minmax(0, 1fr))`
}))

function close() {
  isOpen.value = false
  emit('close')
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    close()
  }
}

function handleSelect(planId) {
  emit('select-plan', planId)
  close()
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
        <div class="absolute inset-0 bg-[#00184C]/40 backdrop-blur-sm" aria-hidden="true" />

        <div
          class="relative w-full md:max-w-6xl md:mx-4 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compare-title"
        >
          <!-- Header -->
          <header class="px-6 md:px-10 pt-5 pb-3 flex-shrink-0 border-b border-slate-100">
            <div class="flex items-center justify-between gap-4">
              <h2 id="compare-title" class="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                ¿Cuál te conviene más?
              </h2>
              <button
                type="button"
                @click="close"
                class="shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
                aria-label="Cerrar modal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto">
            <!-- Sticky plan headers (se quedan fijos al scrollear las filas) -->
            <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
              <div class="min-w-[720px] px-6 md:px-10 py-2">
                <div class="grid gap-3" :style="gridStyle">
                  <!-- Columna fantasma para alinear con las features -->
                  <div></div>

                  <!-- Headers por plan -->
                  <div
                    v-for="plan in plans"
                    :key="plan.id"
                    class="rounded-xl p-3 -m-1 transition-colors duration-200"
                    :class="plan.id === selectedPlanId
                      ? 'bg-[#EDF4F9] ring-1 ring-[#00184C]/10'
                      : 'hover:bg-slate-50'"
                  >
                    <!-- Nombre del plan -->
                    <p class="text-base font-extrabold text-slate-900 tracking-tight text-center leading-tight">
                      {{ plan.name }}
                    </p>

                    <!-- Cobertura destacada -->
                    <p class="mt-1 text-base font-extrabold tabular-nums text-center leading-none" style="color: #00184C;">
                      ${{ plan.coverage }}
                    </p>

                    <!-- Precio discreto -->
                    <p class="mt-1 text-[13px] font-medium text-slate-500 tabular-nums text-center">
                      ${{ plan.price }} <span class="text-[10px] font-normal text-slate-400">USD</span>
                    </p>

                    <!-- Botón Elegir plan -->
                    <button
                      v-if="plan.id === selectedPlanId"
                      type="button"
                      disabled
                      class="mt-2.5 w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                      Seleccionado
                    </button>
                    <button
                      v-else
                      type="button"
                      @click="handleSelect(plan.id)"
                      class="mt-2.5 w-full px-3 py-2 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2 hover:brightness-95"
                      style="background-color: #F9D35A; color: #00184C;"
                    >
                      Elegir plan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filas de comparación -->
            <div class="min-w-[720px] px-6 md:px-10 pb-2">
              <template v-for="group in COMPARISON" :key="group.category">
                <div class="pt-2.5 pb-1 flex items-center gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full" style="background-color: #43D3FF;"></span>
                  <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                    {{ group.category }}
                  </h3>
                </div>

                <div
                  v-for="benefit in group.benefits"
                  :key="benefit.name"
                  class="grid gap-3 py-1.5 border-b border-slate-100"
                  :style="gridStyle"
                >
                  <div class="text-[13px] text-slate-700 self-center leading-snug">
                    {{ benefit.name }}
                  </div>
                  <div
                    v-for="plan in plans"
                    :key="plan.id"
                    class="text-center self-center"
                  >
                    <template v-if="benefit.values[plan.id] === 'check'">
                      <span
                        class="inline-flex items-center justify-center w-7 h-7 rounded-full"
                        :style="plan.id === selectedPlanId
                          ? 'background-color: #00184C;'
                          : 'background-color: rgba(16, 185, 129, 0.12);'"
                      >
                        <svg
                          class="w-3.5 h-3.5"
                          :style="plan.id === selectedPlanId ? 'color: white;' : 'color: #047857;'"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Incluido"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </template>
                    <template v-else-if="benefit.values[plan.id] === 'dash'">
                      <span class="inline-block w-3 h-[2px] bg-slate-300 rounded-full" aria-label="No incluido"></span>
                    </template>
                    <template v-else>
                      <span class="text-[13px] font-bold text-slate-900 tabular-nums">
                        {{ benefit.values[plan.id] }}
                      </span>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Footer eliminado para dar más espacio al contenido -->
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
