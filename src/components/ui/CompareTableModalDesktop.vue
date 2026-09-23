<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import CurrencySwitcher from '@/components/ui/CurrencySwitcher.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  plans: { type: Array, required: true },
  selectedPlanId: { type: String, default: null },
  recommendedPlanId: { type: String, default: null }
})

const emit = defineEmits(['update:modelValue', 'select-plan'])

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const MAX_COMPARE = 3
// Columna izquierda fija para títulos de beneficios (240px)
const LEFT_COL_WIDTH = 240
// Columna de cada plan (220px, esbeltas y simétricas)
const PLAN_COL_WIDTH = 220
// Zebra striping vertical: idx 0=sky-100, idx 1=white, idx 2=sky-100
const PLAN_COL_ZEBRA_CLASS = ['bg-sky-100', 'bg-white', 'bg-sky-100']

const initialSelection = computed(() => {
  const recommended = props.recommendedPlanId || props.plans[0]?.id
  const others = props.plans
    .map(p => p.id)
    .filter(id => id !== recommended)
    .slice(0, MAX_COMPARE - 1)
  return [recommended, ...others].slice(0, MAX_COMPARE)
})

const selectedIds = ref([...initialSelection.value])

// ── SCROLL LOCK: evitar scroll del body mientras el modal está abierto ─────────
watch(open, (isOpen) => {
  if (typeof document === 'undefined') return
  if (isOpen) {
    // Guardar scroll position para restaurarla al cerrar
    scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    nextTick(() => {
      document.addEventListener('click', onClickOutside)
      document.addEventListener('keydown', onEscapeKey)
    })
  } else {
    document.removeEventListener('click', onClickOutside)
    document.removeEventListener('keydown', onEscapeKey)
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, scrollY)
    openDropdownIdx.value = null
  }
})

let scrollY = 0

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('click', onClickOutside)
    document.removeEventListener('keydown', onEscapeKey)
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
  }
})

watch(open, (v) => {
  if (v) selectedIds.value = [...initialSelection.value]
})

const selectedPlans = computed(() =>
  selectedIds.value
    .map(id => props.plans.find(p => p.id === id))
    .filter(Boolean)
)

// ── DROPDOWNS ────────────────────────────────────────────────────────────────
const openDropdownIdx = ref(null)
const dropdownRefs = ref([])

function toggleDropdown(idx) {
  openDropdownIdx.value = openDropdownIdx.value === idx ? null : idx
}

function selectPlanForColumn(columnIdx, planId) {
  if (columnIdx < 0 || columnIdx > MAX_COMPARE - 1) return
  const next = [...selectedIds.value]
  next[columnIdx] = planId
  selectedIds.value = next
  openDropdownIdx.value = null
}

function isCurrentPlan(columnIdx, planId) {
  return selectedIds.value[columnIdx] === planId
}

function onClickOutside(e) {
  if (openDropdownIdx.value === null) return
  const ref = dropdownRefs.value[openDropdownIdx.value]
  if (ref && !ref.contains(e.target)) {
    openDropdownIdx.value = null
  }
}

function onEscapeKey(e) {
  if (e.key === 'Escape' && openDropdownIdx.value !== null) {
    openDropdownIdx.value = null
  }
}

// ── ACCIONES ────────────────────────────────────────────────────────────────

function isSelected(planId) {
  return planId === props.selectedPlanId
}

function choosePlan(planId) {
  emit('select-plan', planId)
  open.value = false
}

function closeModal() {
  open.value = false
}

function onBackdrop(e) {
  if (e.target === e.currentTarget) closeModal()
}

// ── DATOS DE COMPARACIÓN ─────────────────────────────────────────────────────

const COMPARISON = [
  {
    category: 'Salud y emergencias',
    benefits: [
      { name: 'Atención médica de urgencia', key: 'coverage', suffix: ' USD' },
      { name: 'Repatriación médica', key: 'repatriacion' },
      { name: 'Medicamentos recetados', key: 'teleconsulta' },
      { name: 'Cobertura COVID-19', key: 'covid' },
      { name: 'Actividades deportivas', key: 'deportes' }
    ]
  },
  {
    category: 'Tu viaje',
    benefits: [
      { name: 'Cancelación', key: 'cancelacion' },
      { name: 'Equipaje', key: 'equipaje', suffix: ' USD' },
      { name: 'Concierge', key: 'concierge' },
      { name: 'Acompañamiento 24/7', key: 'acompanamiento' }
    ]
  },
  {
    category: 'Límites',
    benefits: [
      { name: 'Edad máxima', key: 'edad_max', suffix: ' años' },
      { name: 'Duración viaje', key: 'duracion', suffix: ' días' }
    ]
  }
]

const PLAN_VALUES = {
  lite:      { coverage: '10.000', repatriacion: true,  teleconsulta: false, covid: false, deportes: false, cancelacion: false, equipaje: '500',   concierge: false, acompanamiento: true,  edad_max: '70',         duracion: '30'         },
  essential: { coverage: '15.000', repatriacion: true,  teleconsulta: true,  covid: true,  deportes: false, cancelacion: false, equipaje: '1.000', concierge: false, acompanamiento: true,  edad_max: '70',         duracion: '60'         },
  explorer:  { coverage: '50.000', repatriacion: true,  teleconsulta: true,  covid: true,  deportes: false, cancelacion: true,  equipaje: '1.500', concierge: false, acompanamiento: true,  edad_max: '75',         duracion: '180'        },
  premium:   { coverage: '100.000', repatriacion: true, teleconsulta: true, covid: true,  deportes: true,  cancelacion: true,  equipaje: '3.000', concierge: true,  acompanamiento: true,  edad_max: '80',         duracion: '365'        },
  elite:     { coverage: '250.000', repatriacion: true, teleconsulta: true, covid: true,  deportes: true,  cancelacion: true,  equipaje: '5.000', concierge: true,  acompanamiento: true,  edad_max: 'Sin límite', duracion: 'Sin límite' }
}

function getValue(planId, benefit) {
  const v = PLAN_VALUES[planId]?.[benefit.key]
  if (typeof v === 'boolean') return v ? 'yes' : 'no'
  return v
}

function formatPrice(n) {
  if (n == null) return ''
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      @click="onBackdrop"
    >
      <div
        class="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- ── HEADER (título + selector de moneda + cerrar) ── -->
        <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-bold text-slate-900">Comparar planes</h2>
            <CurrencySwitcher variant="light" />
          </div>
          <button
            type="button"
            @click="closeModal"
            class="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
            aria-label="Cerrar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- ── CABECERA DE PLANOS: spacer izq 240px + 3 columnas de 220px,
             alineadas pixel-perfect con la tabla de beneficios ── -->
        <div class="flex shrink-0 border-b border-slate-100">

          <!-- Spacer izquierdo transparente (240px) para alinear con la columna de beneficios -->
          <div
            class="shrink-0"
            :style="{ width: `${LEFT_COL_WIDTH}px`, minWidth: `${LEFT_COL_WIDTH}px` }"
            aria-hidden="true"
          />

          <!-- 3 columnas de plan (220px cada una, esbeltas y simétricas) -->
          <div class="flex divide-x divide-slate-100">

            <!-- ── PLAN COLUMN (idx 0=sky-50, idx 1=white, idx 2=sky-50) ── -->
            <div
              v-for="(plan, idx) in selectedPlans"
              :key="'header-' + plan.id + '-' + idx"
              class="shrink-0 px-3 pt-3 pb-4 flex flex-col items-center gap-2"
              :style="{ width: `${PLAN_COL_WIDTH}px`, minWidth: `${PLAN_COL_WIDTH}px` }"
              :class="[
                PLAN_COL_ZEBRA_CLASS[idx],
                plan.id === recommendedPlanId ? 'bg-[#43D3FF]/10' : ''
              ]"
            >
              <!-- Label "Plan 1 / 2 / 3" -->
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-start">
                Plan {{ idx + 1 }}
              </span>

              <!-- Dropdown: nombre del plan -->
              <div
                :ref="el => dropdownRefs[idx] = el"
                class="w-full relative"
              >
                <button
                  type="button"
                  @click="toggleDropdown(idx)"
                  :aria-expanded="openDropdownIdx === idx"
                  :aria-haspopup="'listbox'"
                  class="w-full px-3 py-2 rounded-xl border bg-white flex items-center justify-between gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
                  :class="openDropdownIdx === idx
                    ? 'border-[#00184C] ring-2 ring-[#00184C]/10 shadow-sm'
                    : 'border-slate-200 hover:border-slate-400'"
                >
                  <span class="text-sm font-semibold text-slate-900 truncate">{{ plan.name }}</span>
                  <svg
                    class="w-4 h-4 shrink-0 transition-transform duration-200"
                    :class="openDropdownIdx === idx ? 'rotate-180 text-[#00184C]' : 'text-slate-400'"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Menú desplegable -->
                <Transition name="ds-dropdown">
                  <ul
                    v-if="openDropdownIdx === idx"
                    role="listbox"
                    class="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-52 overflow-y-auto"
                  >
                    <li
                      v-for="opt in plans"
                      :key="'opt-' + idx + '-' + opt.id"
                      role="option"
                      :aria-selected="isCurrentPlan(idx, opt.id)"
                      @click="selectPlanForColumn(idx, opt.id)"
                      class="px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors flex items-center justify-between gap-2"
                      :class="[
                        isCurrentPlan(idx, opt.id)
                          ? 'bg-[#43D3FF]/10 text-[#00184C]'
                          : 'text-slate-700 hover:bg-slate-50',
                        opt.id === recommendedPlanId ? 'font-semibold' : ''
                      ]"
                    >
                      <span class="flex items-center gap-2 min-w-0">
                        <span class="truncate">{{ opt.name }}</span>
                        <span
                          v-if="opt.id === recommendedPlanId"
                          class="shrink-0 inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded"
                          style="background-color: #00184C; color: #43D3FF;"
                        >Recomendado</span>
                      </span>
                      <svg
                        v-if="isCurrentPlan(idx, opt.id)"
                        class="w-4 h-4 shrink-0 text-[#00184C]"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </li>
                  </ul>
                </Transition>
              </div>

              <!-- Info del plan + botón Elegir -->
              <div class="w-full flex flex-col items-center gap-0.5 mt-1">
                <p class="text-[15px] font-extrabold text-slate-900 truncate">
                  {{ plan.name }}
                  <span
                    v-if="plan.id === recommendedPlanId"
                    class="ml-1 inline-block px-1 py-0.5 text-[9px] font-bold rounded uppercase align-middle"
                    style="background-color: #00184C; color: #43D3FF;"
                  >★</span>
                </p>
                <p class="text-base font-black text-slate-900 tabular-nums leading-none">
                  ${{ formatPrice(plan.price) }}
                </p>
                <p class="text-[10px] text-slate-500 tabular-nums">${{ plan.coverage }} USD</p>
              </div>

                <button
                  v-if="!isSelected(plan.id)"
                  type="button"
                  @click="choosePlan(plan.id)"
                  class="mt-1 w-full max-w-[192px] py-2 rounded-full text-[12px] font-bold transition-all hover:brightness-95 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
                  style="background-color: #F9D35A; color: #00184C;"
                >
                  Elegir plan
                </button>
              <p
                v-else
                class="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Elegido
              </p>
            </div>
          </div>
        </div>

        <!-- ── TABLA: matriz de beneficios, columnas alineadas con la cabecera ── -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden">
          <div>
            <template v-for="group in COMPARISON" :key="group.category">
              <!-- Category header -->
              <div class="bg-slate-50/70 px-4 py-2 flex items-center gap-2 border-y border-slate-100">
                <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background-color: #43D3FF;"></span>
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ group.category }}</span>
              </div>

              <!-- Benefit rows -->
              <div
                v-for="(benefit, bIdx) in group.benefits"
                :key="benefit.name"
                class="flex border-b border-slate-50"
                :class="bIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'"
              >
                <!-- Left column: benefit name (240px fixed) -->
                <div
                  class="shrink-0 px-4 py-3 text-[13px] text-slate-700 font-medium leading-snug border-r border-slate-100 flex items-center"
                  :class="bIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'"
                  :style="{ width: `${LEFT_COL_WIDTH}px`, minWidth: `${LEFT_COL_WIDTH}px` }"
                >
                  {{ benefit.name }}
                </div>

                <!-- 3 plan value columns (220px cada una, zebra striping idx 0/2=sky-50, idx 1=white) -->
                <div class="flex divide-x divide-slate-100">
                  <div
                    v-for="(plan, idx) in selectedPlans"
                    :key="plan.id + '-' + benefit.name"
                    class="shrink-0 px-2 py-3 text-center text-[13px] flex items-center justify-center transition-colors duration-200"
                    :style="{ width: `${PLAN_COL_WIDTH}px`, minWidth: `${PLAN_COL_WIDTH}px`, minHeight: '52px' }"
                    :class="[
                      PLAN_COL_ZEBRA_CLASS[idx],
                      plan.id === recommendedPlanId ? 'bg-[#43D3FF]/10' : ''
                    ]"
                  >
                    <template v-if="getValue(plan.id, benefit) === 'yes'">
                      <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100">
                        <svg class="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </template>
                    <template v-else-if="getValue(plan.id, benefit) === 'no'">
                      <span class="inline-block w-3 h-[2px] bg-slate-300 rounded-full"></span>
                    </template>
                    <template v-else>
                      <span class="font-bold text-slate-900 tabular-nums leading-tight">
                        {{ getValue(plan.id, benefit) }}
                        <span v-if="benefit.suffix" class="block text-[10px] font-normal text-slate-400">{{ benefit.suffix }}</span>
                      </span>
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── DROPDOWN MENU ─────────────────────────────────────────────────────────── */
.ds-dropdown-enter-active,
.ds-dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.ds-dropdown-enter-from,
.ds-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scaleY(0.96);
  transform-origin: top center;
}

/* ── TRANSICIONES DE COLUMNA (cuando cambia el plan de un slot) ─────────────── */
.ds-col-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.ds-col-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  position: absolute;
}
.ds-col-enter-from {
  opacity: 0;
  transform: scaleX(0.92) translateX(-8px);
  transform-origin: left center;
}
.ds-col-leave-to {
  opacity: 0;
  transform: scaleX(0.92) translateX(8px);
  transform-origin: right center;
}
.ds-col-move {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Accesibilidad: respetar prefers-reduced-motion ───────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .ds-dropdown-enter-active,
  .ds-dropdown-leave-active,
  .ds-col-enter-active,
  .ds-col-leave-active,
  .ds-col-move {
    animation: none !important;
    transition: none !important;
  }
}
</style>
