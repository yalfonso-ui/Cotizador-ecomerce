<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useModalFocus } from '@/composables/useModalFocus.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  plans: { type: Array, required: true },
  selectedPlanId: { type: String, default: null },
  recommendedPlanId: { type: String, default: null },
  // Modo selector: muestra 3 slots donde el usuario elige qué planes comparar
  selectorMode: { type: Boolean, default: false },
  // Array de 3 elementos con los plan IDs seleccionados para cada columna
  selectedPlanIds: { type: Array, default: () => [null, null, null] },
  currentCategory: { type: String, default: null }
})

const emit = defineEmits(['update:modelValue', 'close', 'select-plan', 'update:column'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

// Los planes que se muestran en cada columna del comparador
// Si selectorMode, usamos selectedPlanIds; si no, usamos los planes recibidos
const comparePlans = computed(() => {
  if (props.selectorMode) {
    return props.selectedPlanIds
      .map(id => id ? props.plans.find(p => p.id === id) : null)
      .filter(Boolean)
  }
  return props.plans
})

// Los 3 slots para el modo selector
const slots = computed(() => {
  return [0, 1, 2].map(i => ({
    index: i,
    planId: props.selectedPlanIds[i] || null,
    plan: props.selectedPlanIds[i] ? props.plans.find(p => p.id === props.selectedPlanIds[i]) : null,
    isRecommended: props.selectedPlanIds[i] === props.recommendedPlanId
  }))
})

// Plan actualmente seleccionado en el wizard (para mostrar "Ya lo elegiste")
const isCurrentlySelected = (planId) => planId === props.selectedPlanId

// Cambiar el plan de un slot
function changeSlotPlan(slotIndex, planId) {
  emit('update:column', slotIndex, planId)
}

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

const gridStyle = computed(() => {
  const cols = comparePlans.value.length
  return {
    gridTemplateColumns: `minmax(0, 1.3fr) repeat(${cols}, minmax(0, 1fr))`
  }
})

// Grid para el selector: siempre 3 slots (más ghost column)
// Esto asegura que los dropdowns se alineen con las columnas de la tabla de abajo
const selectorGridStyle = computed(() => ({
  gridTemplateColumns: `minmax(0, 1.3fr) repeat(3, minmax(0, 1fr))`
}))

// Mobile accordion state
const openPlanId = ref(null)

watch(() => props.plans, (next) => {
  if (next?.length) openPlanId.value = next[0].id
}, { immediate: true })

function toggleAccordion(planId) {
  openPlanId.value = openPlanId.value === planId ? null : planId
}

function formatValue(v, planId) {
  if (v === 'check') return { type: 'check' }
  if (v === 'dash') return { type: 'dash' }
  return { type: 'text', value: v }
}

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

// Focus restoration
let openerElement = null

watch(isOpen, (val) => {
  if (typeof document === 'undefined') return
  if (val) {
    openerElement = document.activeElement
  } else if (openerElement && typeof openerElement.focus === 'function') {
    setTimeout(() => {
      try { openerElement.focus() } catch (_) {}
      openerElement = null
    }, 80)
  }
})

// Back del navegador cierra el modal
let pushedHistoryState = false

function handleBackClose() {
  pushedHistoryState = false
  isOpen.value = false
  emit('close')
  window.removeEventListener('popstate', handleBackClose)
}

function setupBackHandler() {
  if (pushedHistoryState) return
  try {
    history.pushState({ modal: 'plan-compare' }, '', location.href)
    pushedHistoryState = true
    window.addEventListener('popstate', handleBackClose)
  } catch (e) {}
}

function cleanupBackHandler() {
  if (!pushedHistoryState) return
  pushedHistoryState = false
  window.removeEventListener('popstate', handleBackClose)
  if (typeof history !== 'undefined' && history.state?.modal === 'plan-compare') {
    history.back()
  }
}

watch(isOpen, (val) => {
  if (val) setupBackHandler()
  else cleanupBackHandler()
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  cleanupBackHandler()
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

            <!-- ════════════════════════════════════════════════════════
                 MOBILE: Pills sticky + lista de acordeones por plan
                 ════════════════════════════════════════════════════════ -->

            <!-- Sticky plan-pills (mobile only) -->
            <div class="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
              <div class="px-4 py-3 overflow-x-auto hide-scroll-bar">
                <div class="flex gap-2 min-w-min">
                  <button
                    v-for="plan in comparePlans"
                    :key="'pill-' + plan.id"
                    type="button"
                    @click="toggleAccordion(plan.id)"
                    :aria-pressed="openPlanId === plan.id"
                    class="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
                    :class="openPlanId === plan.id
                      ? 'bg-[#00184C] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  >
                    {{ plan.name }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Mobile acordeon list -->
            <div class="md:hidden px-4 py-4 space-y-3 pb-6">
              <div
                v-for="plan in comparePlans"
                :key="'acc-' + plan.id"
                class="rounded-2xl border bg-white overflow-hidden transition-all"
                :class="[
                  plan.id === selectedPlanId
                    ? 'border-[#00184C] ring-2 ring-[#00184C]/15'
                    : 'border-slate-200',
                  plan.id === recommendedPlanId ? 'shadow-md' : 'shadow-sm'
                ]"
              >
                <!-- Accordion trigger -->
                <button
                  type="button"
                  @click="toggleAccordion(plan.id)"
                  :aria-expanded="openPlanId === plan.id"
                  :aria-controls="`acc-panel-${plan.id}`"
                  :id="`acc-trigger-${plan.id}`"
                  class="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-inset"
                  :class="plan.id === openPlanId ? 'bg-slate-50/60' : 'bg-white hover:bg-slate-50/40'"
                >
                  <div class="min-w-0 flex-1">
                    <p class="text-base font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                      {{ plan.name }}
                      <span v-if="plan.id === recommendedPlanId" class="ml-1 inline-block align-middle px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider" style="background-color: #00184C; color: #43D3FF;">Recomendado</span>
                    </p>
                    <p class="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                      Cobertura: <span class="font-semibold text-slate-900">${{ plan.coverage }} USD</span> · ${{ plan.price }} USD
                    </p>
                  </div>
                  <span
                    class="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full transition-transform"
                    :class="openPlanId === plan.id ? 'rotate-180 text-[#00184C]' : 'text-slate-400'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                <!-- Accordion panel -->
                <div
                  v-if="openPlanId === plan.id"
                  :id="`acc-panel-${plan.id}`"
                  role="region"
                  :aria-labelledby="`acc-trigger-${plan.id}`"
                  class="px-4 pb-4 border-t border-slate-100"
                >
                  <template v-for="group in COMPARISON" :key="group.category">
                    <h4 class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mt-4 mb-2 flex items-center gap-2">
                      <span class="w-1 h-1 rounded-full" style="background-color: #43D3FF;"></span>
                      {{ group.category }}
                    </h4>
                    <ul class="space-y-1.5">
                      <li
                        v-for="benefit in group.benefits"
                        :key="benefit.name"
                        class="flex items-center justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0"
                      >
                        <span class="text-[13px] text-slate-700 leading-snug flex-1 min-w-0">
                          {{ benefit.name }}
                        </span>
                        <span class="shrink-0 text-right">
                          <template v-if="formatValue(benefit.values[plan.id], plan.id).type === 'check'">
                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full" style="background-color: rgba(16, 185, 129, 0.18);">
                              <svg class="w-3 h-3" style="color: #047857;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Incluido">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          </template>
                          <template v-else-if="formatValue(benefit.values[plan.id], plan.id).type === 'dash'">
                            <span class="inline-block w-3 h-[2px] bg-slate-300 rounded-full" aria-label="No incluido"></span>
                          </template>
                          <template v-else>
                            <span class="text-[13px] font-bold text-slate-900 tabular-nums">
                              {{ formatValue(benefit.values[plan.id], plan.id).value }}
                            </span>
                          </template>
                        </span>
                      </li>
                    </ul>
                  </template>

                  <!-- CTA dentro del acordeon -->
                  <button
                    v-if="isCurrentlySelected(plan.id)"
                    type="button"
                    disabled
                    class="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                    Ya lo elegiste
                  </button>
                  <button
                    v-else
                    type="button"
                    @click="handleSelect(plan.id)"
                    class="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
                    style="background-color: #F9D35A; color: #00184C;"
                  >
                    Continuar con {{ plan.name }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- ════════════════════════════════════════════════════════
                 DESKTOP: Tabla con slots selector (modo selector)
                 o tabla normal (modo legacy)
                 ════════════════════════════════════════════════════════ -->

            <!-- Fila superior de selectores sincronizada con el Grid (desktop) -->
            <div class="hidden md:block sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
              <div class="min-w-[720px] px-6 md:px-10 pt-3 pb-2">
                <!-- Selector row: grid unificado con ghost column + 3 slots fijos -->
                <div class="grid gap-3 items-center mb-3" :style="selectorGridStyle">
                  <!-- Columna fantasma (alineada con títulos de beneficios de la tabla) -->
                  <div></div>

                  <!-- Selectores de planes (siempre 3 slots) -->
                  <div v-for="(slot, idx) in slots" :key="'selector-' + idx">
                    <select
                      :value="slot.planId"
                      @change="changeSlotPlan(idx, $event.target.value)"
                      class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 hover:border-slate-400 transition-colors"
                    >
                      <option value="" disabled>Seleccionar...</option>
                      <option
                        v-for="plan in plans"
                        :key="plan.id"
                        :value="plan.id"
                      >
                        {{ plan.name }}
                        {{ plan.id === recommendedPlanId ? '★' : '' }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Preview row: muestra los planes seleccionados con info + botón -->
                <div class="grid gap-3 items-start" :style="selectorGridStyle">
                  <!-- Columna fantasma -->
                  <div></div>

                  <!-- Preview por slot -->
                  <div v-for="(slot, idx) in slots" :key="'preview-' + idx" class="text-center">
                    <template v-if="slot.plan">
                      <p class="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                        {{ slot.plan.name }}
                        <span v-if="slot.isRecommended" class="ml-1 inline-block align-middle px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider" style="background-color: #00184C; color: #43D3FF;">★ Recomendado</span>
                      </p>
                      <p class="mt-1 text-base font-extrabold tabular-nums leading-none" style="color: #00184C;">
                        ${{ slot.plan.coverage }}
                      </p>
                      <p class="mt-1 text-[13px] font-medium text-slate-500 tabular-nums">
                        ${{ slot.plan.price }} <span class="text-[10px] font-normal text-slate-400">USD</span>
                      </p>
                      <button
                        v-if="isCurrentlySelected(slot.planId)"
                        type="button"
                        disabled
                        class="mt-2 w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                        Seleccionado
                      </button>
                      <button
                        v-else-if="slot.planId"
                        type="button"
                        @click="handleSelect(slot.planId)"
                        class="mt-2 w-full px-3 py-2 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2 hover:brightness-95"
                        style="background-color: #F9D35A; color: #00184C;"
                      >
                        Elegir plan
                      </button>
                    </template>
                    <template v-else>
                      <div class="h-[80px] flex items-center justify-center text-slate-400 text-xs">
                        —
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filas de comparación (desktop) -->
            <div class="hidden md:block min-w-[720px] px-6 md:px-10 pb-2">
              <template v-for="group in COMPARISON" :key="group.category">
                <div class="pt-2.5 pb-1 flex items-center gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full" style="background-color: #43D3FF;"></span>
                  <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                    {{ group.category }}
                  </h3>
                </div>

                <div
                  v-for="(benefit, bIdx) in group.benefits"
                  :key="benefit.name"
                  class="grid gap-3 py-1.5 border-b border-slate-100"
                  :class="bIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'"
                  :style="gridStyle"
                >
                  <div class="text-[13px] text-slate-700 self-center leading-snug">
                    {{ benefit.name }}
                  </div>
                  <div
                    v-for="plan in comparePlans"
                    :key="plan.id"
                    class="text-center self-center"
                    :class="plan.id === recommendedPlanId ? 'bg-[#43D3FF]/8 rounded mx-1' : ''"
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
