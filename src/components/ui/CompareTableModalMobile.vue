<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import CurrencySwitcher from '@/components/ui/CurrencySwitcher.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  plans: { type: Array, required: true },
  selectedPlanId: { type: String, default: null },
  recommendedPlanId: { type: String, default: null }
})

const emit = defineEmits(['update:modelValue', 'select-plan'])

// ─────────────────────────────────────────────────────────────
// Estado del modal
// ─────────────────────────────────────────────────────────────
const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const MAX_COMPARE = 3
const COL_WIDTH = 160     // ancho fijo de cada columna de plan
const STICKY_WIDTH = 152  // columna izquierda (incluye pl-4 de respiro interno)

// Zebra striping por columna (índice 0, 1, 2 → plan 1, 2, 3)
// El override recommended (bg-[#43D3FF]/10) siempre gana sobre esto
const PLAN_COL_ZEBRA_CLASS = ['bg-sky-100', 'bg-white', 'bg-sky-100']

const initialSelection = computed(() => {
  // Experiencia progresiva: solo el plan recomendado seleccionado al inicio.
  // El usuario descubre la comparación añadiendo chips manualmente.
  const recommended = props.recommendedPlanId || props.plans[0]?.id
  return [recommended]
})

const selectedIds = ref([...initialSelection.value])

// Cuando se abre el modal, resetear selección al default
watch(open, (v) => {
  if (v) {
    selectedIds.value = [...initialSelection.value]
    isScrolled.value = false
    // Mostrar guía de onboarding al abrir (autohide en 5s)
    showHelper('Tocá los chips para agregar o quitar planes de la comparación')
    nextTick(() => {
      // Scroll al plan recomendado
      const el = wrapperRef.value?.querySelector(`[data-plan-id="${recommendedId.value}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    })
  } else {
    dismissHelper()
  }
})

const selectedPlans = computed(() =>
  selectedIds.value
    .map(id => props.plans.find(p => p.id === id))
    .filter(Boolean)
)

const recommendedId = computed(() => {
  return selectedPlans.value.find(p => p.id === props.recommendedPlanId)?.id
    || props.recommendedPlanId
})

// Ancho total de la tabla (incluye +24px de pr-6 en el último plan)
const tableTotalWidth = computed(() =>
  STICKY_WIDTH + (selectedPlans.length * COL_WIDTH) + 24
)

// ─────────────────────────────────────────────────────────────
// Phase 1: Chips toggle (max 3)
// ─────────────────────────────────────────────────────────────
const isPlanSelected = (id) => selectedIds.value.includes(id)

// true cuando ya hay 3 planes seleccionados Y el chip no está entre ellos
const isChipDisabled = (planId) =>
  selectedIds.value.length >= MAX_COMPARE && !selectedIds.value.includes(planId)

// true cuando solo queda 1 plan seleccionado → no se puede cerrar ese único plan
const canRemovePlan = computed(() => selectedIds.value.length > 1)

const limitMessage = ref(null)
const shakeChipId = ref(null)
let limitTimer = null
let shakeTimer = null

// Helper de onboarding (autohide tras 5s o al primer toggle)
const helperMessage = ref(null)
let helperTimer = null

function showHelper(msg) {
  clearTimeout(helperTimer)
  helperMessage.value = msg
  helperTimer = setTimeout(() => { helperMessage.value = null }, 5000)
}

function dismissHelper() {
  clearTimeout(helperTimer)
  helperMessage.value = null
}

function togglePlan(planId) {
  // Descartar helper de onboarding en la primera interacción del usuario
  dismissHelper()

  // Si ya hay 3 planes y este no es uno de ellos, no hacer nada (visualmente ya está disabled)
  if (isChipDisabled(planId)) return

  if (isPlanSelected(planId)) {
    // Issue 2: preservar scroll antes de mutar
    preserveScroll()
    selectedIds.value = selectedIds.value.filter(id => id !== planId)
    hapticTap('light')
    // Restaurar scroll al mismo plan después del re-render
    nextTick(() => restoreScroll())
  } else {
    if (selectedIds.value.length >= MAX_COMPARE) {
      // No debería alcanzarse si isChipDisabled funciona, pero por seguridad silenciamos
      return
    }
    // Issue 2: preservar scroll antes de mutar
    preserveScroll()
    selectedIds.value = [...selectedIds.value, planId]
    hapticTap('success')
    // Issue 2: restaurar scroll después del re-render (no al nuevo, al anterior)
    nextTick(() => restoreScroll())
  }
}

function triggerShake(planId) {
  shakeChipId.value = planId
  if (shakeTimer) clearTimeout(shakeTimer)
  shakeTimer = setTimeout(() => {
    shakeChipId.value = null
  }, 500)
}

function showLimit(msg) {
  limitMessage.value = msg
  if (limitTimer) clearTimeout(limitTimer)
  limitTimer = setTimeout(() => {
    limitMessage.value = null
  }, 3500)
}

function hapticTap(kind = 'light') {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const pattern = kind === 'success' ? 15 : kind === 'error' ? [10, 30, 10] : 8
      navigator.vibrate(pattern)
    }
  } catch (_) {}
}

// ─────────────────────────────────────────────────────────────
// Phase 3: remover plan desde cabecera
// ─────────────────────────────────────────────────────────────
function removePlan(planId) {
  // Issue 2: preservar scroll antes de remover
  preserveScroll()
  selectedIds.value = selectedIds.value.filter(id => id !== planId)
  hapticTap('light')
  // Issue 2: restaurar scroll al plan más cercano
  nextTick(() => restoreScroll())
}

// ─────────────────────────────────────────────────────────────
// Selección / cierre
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Phase 2: scroll, snap, alineación estricta
// ─────────────────────────────────────────────────────────────
const wrapperRef = ref(null)
const outerRef = ref(null)       // wrapper exterior con overflow-y-auto
const activeScrollIndex = ref(0)
const isScrolled = ref(false)     // activa shadow en sticky header cuando hay scroll vertical

function onOuterScroll() {
  if (!outerRef.value) return
  isScrolled.value = outerRef.value.scrollTop > 4
}

function scrollToPlan(planId) {
  if (!wrapperRef.value) return
  const colEl = wrapperRef.value.querySelector(`[data-plan-id="${planId}"]`)
  if (!colEl) return
  // Centrar la columna en el wrapper (compensando la columna fija izquierda)
  const stickyCol = wrapperRef.value.querySelector('[data-sticky-col]')
  const stickyWidth = stickyCol ? stickyCol.offsetWidth : STICKY_WIDTH
  const wrapperWidth = wrapperRef.value.offsetWidth
  const colWidth = colEl.offsetWidth
  // Posición absoluta del centro de la columna objetivo dentro del wrapper
  const colAbsoluteCenter = colEl.offsetLeft + colWidth / 2
  // Queremos que ese centro quede centrado en la parte visible DESPUÉS de la columna fija
  const visibleStart = stickyWidth
  const visibleWidth = wrapperWidth - stickyWidth
  const visibleCenter = visibleStart + visibleWidth / 2
  const targetScrollLeft = colAbsoluteCenter - visibleCenter
  wrapperRef.value.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' })
}

function updateActiveIndex() {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  const stickyCol = wrapper.querySelector('[data-sticky-col]')
  const stickyWidth = stickyCol ? stickyCol.offsetWidth : STICKY_WIDTH
  const wrapperWidth = wrapper.offsetWidth
  const visibleCenter = stickyWidth + (wrapperWidth - stickyWidth) / 2
  const cols = wrapper.querySelectorAll('[data-plan-col]')
  let closestIdx = 0
  let closestDist = Infinity
  cols.forEach((col, i) => {
    const colCenter = col.offsetLeft + col.offsetWidth / 2
    const dist = Math.abs(colCenter - visibleCenter)
    if (dist < closestDist) {
      closestDist = dist
      closestIdx = i
    }
  })
  activeScrollIndex.value = closestIdx
}

// ─────────────────────────────────────────────────────────────
// Phase 2: preservar posición de scroll al cambiar columnas
// ─────────────────────────────────────────────────────────────
// Antes de mutar, guardamos qué plan está centrado. Después de mutar,
// scrolleamos al mismo plan si sigue visible, o al más cercano.
let preservedScrollPlanId = null

function preserveScroll() {
  if (!wrapperRef.value) return
  const wrapper = wrapperRef.value
  const stickyCol = wrapper.querySelector('[data-sticky-col]')
  const stickyWidth = stickyCol ? stickyCol.offsetWidth : STICKY_WIDTH
  const wrapperWidth = wrapper.offsetWidth
  const visibleCenter = stickyWidth + (wrapperWidth - stickyWidth) / 2
  const cols = wrapper.querySelectorAll('[data-plan-col]')
  let closestId = null
  let closestDist = Infinity
  cols.forEach((col) => {
    const id = col.getAttribute('data-plan-id')
    const colCenter = col.offsetLeft + col.offsetWidth / 2
    const dist = Math.abs(colCenter - visibleCenter)
    if (dist < closestDist) {
      closestDist = dist
      closestId = id
    }
  })
  preservedScrollPlanId = closestId
}

function restoreScroll() {
  if (!preservedScrollPlanId || !wrapperRef.value) return
  const exists = selectedPlans.value.some(p => p.id === preservedScrollPlanId)
  if (exists) {
    nextTick(() => scrollToPlan(preservedScrollPlanId))
  }
  preservedScrollPlanId = null
}

// ─────────────────────────────────────────────────────────────
// Datos de comparación
// ─────────────────────────────────────────────────────────────
const COMPARISON = [
  {
    category: 'Salud',
    benefits: [
      { name: 'Atención médica', key: 'coverage', suffix: ' USD' },
      { name: 'Repatriación', key: 'repatriacion' },
      { name: 'Teleconsulta', key: 'teleconsulta' },
      { name: 'COVID-19', key: 'covid' },
      { name: 'Deportes', key: 'deportes' }
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
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-end justify-center bg-black/40"
      @click="onBackdrop"
    >
      <div
        class="relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- ── HEADER ── -->
        <div class="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div>
              <h2 class="text-base font-bold text-slate-900">Comparar planes</h2>
              <p class="text-[11px] text-slate-500 mt-0.5">Seleccioná hasta 3 planes para comparar</p>
            </div>
            <CurrencySwitcher variant="light" />
          </div>
          <button
            type="button"
            @click="closeModal"
            class="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all shrink-0"
            aria-label="Cerrar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- ── PHASE 1: Selector de chips (área táctil máxima) ── -->
        <div class="px-4 py-4 bg-slate-50/50 border-b border-slate-100">
          <div class="flex gap-4 overflow-x-auto hide-scroll-bar -mx-1 px-1">
            <button
              v-for="plan in plans"
              :key="'chip-' + plan.id"
              type="button"
              @click="togglePlan(plan.id)"
              :aria-pressed="isPlanSelected(plan.id)"
              :disabled="isChipDisabled(plan.id)"
              :class="[
                'shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]',
                isPlanSelected(plan.id)
                  ? (plan.id === recommendedPlanId
                      ? 'bg-[#00184C] text-white shadow-md ring-1 ring-[#43D3FF]/40'
                      : 'bg-[#00184C] text-white shadow-md')
                  : isChipDisabled(plan.id)
                    ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-white border-2 border-dashed border-[#43D3FF] text-slate-700 hover:border-solid hover:border-[#43D3FF] hover:bg-sky-50',
                shakeChipId === plan.id ? 'ds-chip-shake' : '',
                shakeChipId === plan.id ? 'ring-2 ring-red-400' : '',
                !isPlanSelected(plan.id) && !isChipDisabled(plan.id) ? 'ds-chip-pulse' : ''
              ]"
            >
              <!-- Check (seleccionado) o + (para agregar) -->
              <svg
                v-if="isPlanSelected(plan.id)"
                class="w-3.5 h-3.5"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
              <svg
                v-else
                class="w-3.5 h-3.5"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>{{ plan.name }}</span>
              <span
                v-if="plan.id === recommendedPlanId"
                class="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
                :class="isPlanSelected(plan.id) ? 'bg-[#43D3FF]/20 text-[#43D3FF]' : 'bg-[#00184C] text-[#43D3FF]'"
              >★</span>
            </button>
          </div>

          <!-- Helper de onboarding (navy, contraste AAA) -->
          <Transition name="limit-toast">
            <div
              v-if="helperMessage"
              role="status"
              class="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#00184C] text-white text-[12px] font-medium shadow-md"
            >
              <svg class="w-4 h-4 shrink-0 text-[#43D3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="leading-snug">{{ helperMessage }}</span>
            </div>
          </Transition>

          <!-- Mensaje de límite (ámbar, solo cuando se intenta agregar más de 3) -->
          <Transition name="limit-toast">
            <div
              v-if="limitMessage"
              role="alert"
              class="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[12px] font-medium shadow-sm"
            >
              <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14a1 1 0 00.82-1.573l-7.1-12.25a1 1 0 00-1.64 0L3.18 17.427A1 1 0 004 19z" />
              </svg>
              <span class="leading-snug">{{ limitMessage }}</span>
            </div>
          </Transition>
        </div>

        <!-- ── PHASE 2: Tabla compacta con snap horizontal ── -->
        <!-- Outer: scroll vertical. Inner: scroll horizontal + sticky header context. -->
        <div
          ref="outerRef"
          @scroll="onOuterScroll"
          class="relative flex-1 overflow-y-auto overflow-x-hidden px-4"
          :class="isScrolled ? 'pb-2' : ''"
        >
          <!-- Contenedor interior: scroll horizontal, sticky header vive aquí -->
          <div
            ref="wrapperRef"
            @scroll="updateActiveIndex"
            class="relative overflow-x-auto min-w-0"
          >
          <div
            class="relative"
            :style="{ width: `${tableTotalWidth}px`, minWidth: `${tableTotalWidth}px` }"
          >
            <!-- HEADER (sticky top, shadow crece al hacer scroll vertical) -->
            <div
              class="sticky top-0 z-30 bg-white flex transition-shadow duration-200"
              :class="isScrolled ? 'shadow-[0_4px_16px_rgba(0,24,76,0.14)]' : 'shadow-sm'"
              :style="{ width: `${tableTotalWidth}px` }"
            >
              <!-- Columna fija: "Plan" (pl-4 da respiro lateral izquierdo) -->
              <div
                data-sticky-col
                class="shrink-0 bg-white border-r border-slate-100 flex items-end px-3 pb-3 pl-4"
                :style="{ width: `${STICKY_WIDTH}px`, minWidth: `${STICKY_WIDTH}px`, height: '112px' }"
              >
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</span>
              </div>

              <!-- Cabeceras de planes (transición fade) -->
              <TransitionGroup
                tag="div"
                class="flex"
                enter-active-class="ds-col-enter"
                leave-active-class="ds-col-leave"
                enter-from-class="ds-col-enter-from"
                leave-to-class="ds-col-leave-to"
                move-class="ds-col-move"
              >
                <div
                  v-for="(plan, idx) in selectedPlans"
                  :key="'th-' + plan.id"
                  :data-plan-id="plan.id"
                  :data-plan-col="idx"
                  class="shrink-0 relative px-3 py-3 text-center transition-colors duration-200"
                  :class="[
                    PLAN_COL_ZEBRA_CLASS[idx],
                    plan.id === recommendedPlanId ? 'bg-[#43D3FF]/10' : '',
                    activeScrollIndex === idx && plan.id !== recommendedPlanId ? 'bg-[#43D3FF]/15' : '',
                    idx === selectedPlans.length - 1 ? 'pr-6' : ''
                  ]"
                  :style="{ width: `${COL_WIDTH}px`, minWidth: `${COL_WIDTH}px`, height: '112px' }"
                >
                  <!-- Phase 3: Botón X (deshabilitado si es el último plan) -->
                  <button
                    type="button"
                    @click.stop="canRemovePlan && removePlan(plan.id)"
                    class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    :class="canRemovePlan
                      ? 'bg-white/95 hover:bg-red-50 border border-slate-300 hover:border-red-400 text-slate-500 hover:text-red-600 active:scale-90'
                      : 'bg-slate-100/80 border border-slate-200 text-slate-300 cursor-not-allowed'"
                    :aria-label="canRemovePlan ? `Quitar ${plan.name} de la comparación` : `No se puede quitar ${plan.name}, debe haber al menos 1 plan`"
                    :aria-disabled="!canRemovePlan"
                    :tabindex="canRemovePlan ? 0 : -1"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div class="flex flex-col items-center h-full justify-between">
                    <div class="w-full">
                      <p class="text-sm font-extrabold text-slate-900 pr-6 truncate">
                        {{ plan.name }}
                        <span
                          v-if="plan.id === recommendedPlanId"
                          class="ml-1 inline-block px-1 py-0.5 text-[9px] font-bold rounded uppercase"
                          style="background-color: #00184C; color: #43D3FF;"
                        >★</span>
                      </p>
                      <p class="mt-0.5 text-base font-black text-slate-900 tabular-nums leading-none">${{ plan.price }}</p>
                      <p class="mt-0.5 text-[10px] text-slate-500 tabular-nums">${{ plan.coverage }} USD</p>
                    </div>

                    <button
                      v-if="!isSelected(plan.id)"
                      type="button"
                      @click.stop="choosePlan(plan.id)"
                      class="mt-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all hover:brightness-95 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
                      style="background-color: #F9D35A; color: #00184C;"
                    >
                      Elegir
                    </button>
                    <p
                      v-else
                      class="mt-1.5 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Elegido
                    </p>
                  </div>
                </div>
              </TransitionGroup>
            </div>

            <!-- BODY: cada fila es un flex con sticky left + transition group de celdas -->
            <div class="bg-white">
              <template v-for="(group, gIdx) in COMPARISON" :key="group.category">
                <!-- Category separator (colspan) -->
                <div class="bg-slate-50/70 px-3 py-2 flex items-center gap-2 border-y border-slate-100">
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
                  <!-- Celda fija izquierda -->
                  <div
                    class="shrink-0 px-3 py-3 text-[12px] text-slate-700 font-medium leading-snug border-r border-slate-100 flex items-center"
                    :class="bIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'"
                    :style="{ width: `${STICKY_WIDTH}px`, minWidth: `${STICKY_WIDTH}px` }"
                  >
                    {{ benefit.name }}
                  </div>

                  <!-- Celdas por plan con TransitionGroup -->
                  <TransitionGroup
                    tag="div"
                    class="flex"
                    enter-active-class="ds-col-enter"
                    leave-active-class="ds-col-leave"
                    enter-from-class="ds-col-enter-from"
                    leave-to-class="ds-col-leave-to"
                    move-class="ds-col-move"
                  >
                    <div
                      v-for="(plan, idx) in selectedPlans"
                      :key="plan.id + '-' + benefit.name"
                      class="shrink-0 px-2 py-3 text-center text-[12px] flex items-center justify-center transition-colors duration-200"
                      :class="[
                        PLAN_COL_ZEBRA_CLASS[idx],
                        plan.id === recommendedPlanId ? 'bg-[#43D3FF]/8' : ''
                      ]"
                      :style="{ width: `${COL_WIDTH}px`, minWidth: `${COL_WIDTH}px`, minHeight: '52px' }"
                    >
                      <template v-if="getValue(plan.id, benefit) === 'yes'">
                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
                          <svg class="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  </TransitionGroup>
                </div>
              </template>
            </div>
          </div>
        </div>
        </div>

        <!-- ── Snap dots (mobile) ── -->
        <div
          v-if="selectedPlans.length > 1"
          class="flex items-center justify-center gap-1.5 py-2 border-t border-slate-100 bg-white"
          role="tablist"
          aria-label="Navegación de planes"
        >
          <button
            v-for="(plan, idx) in selectedPlans"
            :key="'dot-' + plan.id"
            type="button"
            role="tab"
            :aria-selected="activeScrollIndex === idx"
            :aria-label="`Ir al plan ${plan.name}`"
            @click="scrollToPlan(plan.id)"
            class="w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C]"
          >
            <span
              class="block rounded-full transition-all duration-300"
              :class="activeScrollIndex === idx ? 'w-6 h-2 bg-[#00184C]' : 'w-2 h-2 bg-slate-300'"
            />
          </button>
        </div>

        <!-- ── Bottom: Cerrar ── -->
        <div class="px-4 py-3 border-t border-slate-100 bg-white">
          <button
            type="button"
            @click="closeModal"
            class="w-full py-3 rounded-full text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Animación del mensaje de límite (Issue 3) */
.limit-toast-enter-active,
.limit-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease, max-height 0.25s ease;
}
.limit-toast-enter-from,
.limit-toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}

/* Shake animation para chip que intenta agregar 4to (Issue 3) */
@keyframes ds-chip-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
.ds-chip-shake {
  animation: ds-chip-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* Phase 2: transición de columnas — slide suave sin collapse de layout */
.ds-col-enter-active {
  transition: opacity 0.25s ease-out, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.ds-col-leave-active {
  transition: opacity 0.2s ease-in, transform 0.25s cubic-bezier(0.55, 0, 1, 0.45);
  position: absolute;
  z-index: 5;
}
.ds-col-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.ds-col-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.92);
}
.ds-col-move {
  transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Pulso sutil en chips no seleccionados para invitar a tocar */
@keyframes ds-chip-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(67, 211, 255, 0.4);
    border-color: #43D3FF;
  }
  50% {
    box-shadow: 0 0 0 5px rgba(67, 211, 255, 0);
    border-color: rgba(67, 211, 255, 0.6);
  }
}
.ds-chip-pulse {
  animation: ds-chip-pulse 2.2s ease-in-out infinite;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ds-chip-shake,
  .ds-chip-pulse,
  .ds-col-enter-active,
  .ds-col-leave-active,
  .ds-col-move {
    animation: none !important;
    transition: none !important;
  }
}
</style>
