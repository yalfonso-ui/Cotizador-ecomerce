<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

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
    category: 'Relacionados con la salud',
    benefits: [
      { name: 'Emergencias médicas', essential: 'USD 15.000', explorer: 'USD 50.000', premium: 'USD 100.000' },
      { name: 'Repatriación básica', essential: 'check', explorer: 'check', premium: 'check' },
      { name: 'Teleconsulta 24/7', essential: 'check', explorer: 'check', premium: 'check' },
      { name: 'COVID-19', essential: false, explorer: 'check', premium: 'check' },
      { name: 'Asistencia de actividades', essential: false, explorer: false, premium: 'check' }
    ]
  },
  {
    category: 'Viaje, equipajes y cancelaciones',
    benefits: [
      { name: 'Cancelación de viaje', essential: false, explorer: 'check', premium: 'check' },
      { name: 'Equipaje protegido', essential: 'USD 500', explorer: 'USD 1.500', premium: 'USD 3.000' },
      { name: 'Concierge personal', essential: false, explorer: false, premium: 'check' },
      { name: 'Cobertura familiar', essential: false, explorer: false, premium: 'check' },
      { name: 'Asistencia 24/7', essential: 'check', explorer: 'check', premium: 'check' }
    ]
  },
  {
    category: 'Mayores límites',
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

function handleKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
}

watch(isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
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
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        <div
          class="relative w-full md:max-w-4xl md:mx-4 bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compare-title"
        >
          <header class="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 flex-shrink-0">
            <div>
              <h2 id="compare-title" class="text-xl md:text-2xl font-bold text-slate-900">
                Comparación detallada de planes
              </h2>
              <p class="text-sm text-slate-500 mt-1">
                Compara las coberturas y beneficios de cada plan
              </p>
            </div>
            <button
              type="button"
              @click="close"
              class="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
              aria-label="Cerrar modal"
            >
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="flex-1 overflow-y-auto overflow-x-hidden">
            <div class="relative">
              <div class="overflow-x-auto">
                <table class="w-full min-w-[640px] border-collapse">
                  <thead class="sticky top-0 bg-white z-10 shadow-sm">
                    <tr>
                      <th
                        scope="col"
                        class="sticky left-0 z-20 bg-white text-left p-3 md:p-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 min-w-[180px] max-w-[200px]"
                      >
                        Beneficios
                      </th>
                      <th
                        v-for="plan in plans"
                        :key="plan.id"
                        scope="col"
                        class="text-center p-3 md:p-4 font-bold text-sm border-b border-slate-200 min-w-[140px] relative"
                        :class="plan.id === selectedPlanId ? 'bg-cyan-50/70' : ''"
                      >
                        <div v-if="plan.id === selectedPlanId" class="absolute top-1 right-2 text-cyan-500" aria-label="Plan seleccionado">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                        <p class="text-slate-900">{{ plan.name }}</p>
                        <p class="text-xs font-normal text-slate-500 mt-1">${{ plan.price }} USD</p>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <template v-for="group in comparisonData" :key="group.category">
                      <tr>
                        <td
                          colspan="100"
                          class="sticky left-0 bg-slate-50 px-3 md:px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-100"
                        >
                          {{ group.category }}
                        </td>
                      </tr>
                      <tr
                        v-for="benefit in group.benefits"
                        :key="benefit.name"
                        class="border-b border-slate-50"
                      >
                        <th
                          scope="row"
                          class="sticky left-0 z-10 bg-white text-left p-3 md:p-4 font-medium text-sm text-slate-700 min-w-[180px] max-w-[200px]"
                        >
                          {{ benefit.name }}
                        </th>
                        <td
                          v-for="plan in plans"
                          :key="plan.id"
                          class="text-center p-3 md:p-4 text-sm"
                          :class="plan.id === selectedPlanId ? 'bg-cyan-50/40' : ''"
                        >
                          <template v-if="benefit[plan.id] === 'check'">
                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100">
                              <svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          </template>
                          <template v-else-if="benefit[plan.id] === false">
                            <span class="inline-block w-5 h-0.5 bg-slate-300 rounded" aria-label="No incluido"></span>
                          </template>
                          <template v-else>
                            <span class="font-semibold text-slate-700">{{ benefit[plan.id] }}</span>
                          </template>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <footer class="flex items-center justify-end gap-3 p-4 md:p-5 border-t border-slate-100 flex-shrink-0 bg-white">
            <button
              type="button"
              @click="close"
              class="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
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
    transform: translateY(20px) scale(0.98);
  }
}
</style>
