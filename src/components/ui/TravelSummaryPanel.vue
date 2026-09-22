<script setup>
/**
 * TravelSummaryPanel — Resumen de viaje reutilizable (mobile).
 *
 * Replicar el diseño exacto del panel "Ver resumen de viaje" del StepCheckout
 * y unificarlo en todos los pasos del wizard móvil.
 *
 * Lee directamente del useWizardStore (formData) y del useCurrencyStore.
 * Emite 'go-to-step' cuando el usuario toca un botón de ajuste.
 */
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useWizardStore } from '@/stores/useWizardStore.js'
import { useCurrencyStore, formatCurrency } from '@/stores/useCurrencyStore.js'
import { getPlanName as planName, getPlanCoverage as planCoverage, getPlanPrice as planPrice } from '@/data/plans.js'
import { getUpgradesTotal } from '@/data/upgrades.js'
import { getTravelerCount as resolveCount } from '@/composables/useTravelerInfo.js'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'
import { STEPS } from '@/composables/useWizardSteps.js'

const emit = defineEmits(['go-to-step'])

const wizardStore = useWizardStore()
const { formData } = storeToRefs(wizardStore)
const fx = useCurrencyStore()
function fmt(usd) { return formatCurrency(usd, fx) }

// ── State ──
const isOpen = ref(false)

// ── Data computed ──
const originLabel = computed(() => formData.value.origin?.name || formData.value.origin || '—')

const destLabel = computed(() => {
  const dest = formData.value.destination
  if (!dest || (Array.isArray(dest) && dest.length === 0)) return '—'
  if (Array.isArray(dest)) {
    if (dest.length <= 2) return dest.map(d => d?.name || d).join(', ')
    return `${dest[0]?.name || dest[0]} +${dest.length - 1}`
  }
  if (typeof dest === 'object' && dest?.name) return dest.name
  return dest || '—'
})

const hasDates = computed(() => !!(formData.value.dates?.start && formData.value.dates?.end))

const dateStartLabel = computed(() => {
  if (!formData.value.dates?.start) return '—'
  return fmtDate(formData.value.dates.start)
})

const dateEndLabel = computed(() => {
  if (!formData.value.dates?.end) return '—'
  return fmtDate(formData.value.dates.end)
})

const tripDays = computed(() => {
  if (!formData.value.dates?.start || !formData.value.dates?.end) return 0
  const start = new Date(formData.value.dates.start)
  const end = new Date(formData.value.dates.end)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const totalViajeros = computed(() => {
  const arr = formData.value.travelersInfo
  if (Array.isArray(arr) && arr.length > 0) return arr.length
  return resolveCount(formData.value.travelers, formData.value.travelersCount)
})

const travelersLabel = computed(() => {
  const n = totalViajeros.value
  if (!n || n < 1) return '—'
  return `${n} ${n === 1 ? 'viajero' : 'viajeros'}`
})

const selectedPlanName = computed(() => planName(formData.value.selectedPlan))
const selectedPlanCoverage = computed(() => planCoverage(formData.value.selectedPlan))

const planPriceVal = computed(() => planPrice(formData.value.selectedPlan))
const upgradesTotal = computed(() => getUpgradesTotal(formData.value.upgrades))

const finalPrice = computed(() => {
  return Math.max(0, planPriceVal.value + upgradesTotal.value)
})

// ── Availability for edit buttons ──
const canEditRoute = computed(() => wizardStore.hasRoute)
const canEditDates = computed(() => !!(formData.value.dates?.start && formData.value.dates?.end))
const canEditTravelers = computed(() => !!formData.value.travelersCount)
const canEditPlan = computed(() => !!formData.value.selectedPlan)

// ── Has any summary data to show? ──
const hasSummary = computed(() => wizardStore.hasTravelSummary)

// ── Touch drag to dismiss ──
const sheetRef = ref(null)
let dragStartY = 0
let dragCurrentY = 0
let isDragging = false
const dragOffset = ref(0)

const dragStyle = computed(() => {
  if (dragOffset.value === 0) return {}
  return { transform: `translateY(${dragOffset.value}px)`, transition: 'none' }
})

function onTouchStart(e) {
  if (e.touches.length !== 1) return
  if (sheetRef.value && sheetRef.value.scrollTop > 4) {
    isDragging = false
    return
  }
  dragStartY = e.touches[0].clientY
  isDragging = true
}

function onTouchMove(e) {
  if (!isDragging) return
  const delta = e.touches[0].clientY - dragStartY
  if (delta < 0) {
    dragOffset.value = 0
    isDragging = false
    return
  }
  dragCurrentY = Math.max(0, delta)
  dragOffset.value = dragCurrentY
}

function onTouchEnd() {
  if (!isDragging) return
  isDragging = false
  if (dragCurrentY > 80) {
    isOpen.value = false
  }
  dragOffset.value = 0
  dragCurrentY = 0
}

// ── Body scroll lock ──
function lockBody() {
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${window.scrollY}px`
  document.body.style.width = '100%'
}

function unlockBody() {
  const scrollY = document.body.style.top
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  if (scrollY) window.scrollTo(0, parseInt(scrollY || '0', 10) * -1)
}

// ── Escape key ──
function onKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    e.preventDefault()
    isOpen.value = false
  }
}

watch(isOpen, (val) => {
  if (val) {
    lockBody()
    document.addEventListener('keydown', onKeydown)
  } else {
    unlockBody()
    document.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  if (isOpen.value) unlockBody()
  document.removeEventListener('keydown', onKeydown)
})

// ── Edit section handler ──
function handleEditSection(targetStep) {
  isOpen.value = false
  emit('go-to-step', targetStep)
}
</script>

<template>
  <div v-if="hasSummary" class="lg:hidden">
    <!-- ── Trigger bar (sticky at top) ── -->
    <div class="sticky top-0 z-20 -mx-4 px-4 py-3 bg-white/85 backdrop-blur-md border-b border-slate-100/80">
      <button
        type="button"
        @click="isOpen = true"
        class="w-full flex items-center justify-between gap-3 text-left group"
        :aria-expanded="isOpen"
        aria-haspopup="dialog"
      >
        <span class="text-sm font-medium tracking-tight" style="color: #00184C;">
          Ver resumen de viaje
        </span>
        <span class="flex items-center gap-1.5">
          <span class="text-sm font-bold tabular-nums tracking-tight" style="color: #00184C;">
            {{ fmt(finalPrice) }}
          </span>
          <svg
            class="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-y-0.5"
            style="color: #00184C;"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
    </div>

    <!-- ── Bottom sheet (teleported to body) ── -->
    <Teleport to="body">
      <!-- Backdrop -->
      <Transition name="ts-sheet-fade">
        <div
          v-if="isOpen"
          class="lg:hidden fixed inset-0 z-50 bg-[#00184C]/20 backdrop-blur-md"
          @click.self="isOpen = false"
          aria-hidden="true"
        ></div>
      </Transition>

      <!-- Sheet panel -->
      <Transition name="ts-sheet">
        <div
          v-if="isOpen"
          ref="sheetRef"
          class="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Resumen de viaje"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          :style="dragStyle"
        >
          <!-- Drag handle -->
          <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" aria-hidden="true"></div>

          <!-- Header + Close -->
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-semibold tracking-tight" style="color: #00184C;">
              Tu reserva
            </h2>
            <button
              type="button"
              @click="isOpen = false"
              class="w-8 h-8 -mr-2 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Cerrar resumen"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Summary details -->
          <dl class="divide-y divide-slate-100">
            <!-- Tu ruta -->
            <div class="flex items-start gap-3 py-3">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Tu ruta</dt>
                <dd class="font-semibold text-slate-800 text-sm">
                  {{ originLabel }}
                  <span class="text-slate-300 mx-1">&rarr;</span>
                  {{ destLabel }}
                </dd>
              </div>
            </div>

            <!-- Fechas del viaje -->
            <div class="flex items-start gap-3 py-3">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Fechas del viaje</dt>
                <dd class="font-semibold text-slate-800 text-sm">
                  <template v-if="hasDates">
                    {{ dateStartLabel }}
                    <span class="text-slate-300 mx-1">&rarr;</span>
                    {{ dateEndLabel }}
                  </template>
                  <template v-else>&mdash;</template>
                </dd>
                <dd v-if="tripDays > 0" class="text-xs text-slate-400 mt-0.5">
                  {{ tripDays }} {{ tripDays === 1 ? 'dia' : 'dias' }}
                </dd>
              </div>
            </div>

            <!-- Viajeros -->
            <div class="flex items-start gap-3 py-3">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Viajeros</dt>
                <dd class="font-semibold text-slate-800 text-sm">{{ travelersLabel }}</dd>
              </div>
            </div>

            <!-- Tu plan -->
            <div class="flex items-start gap-3 py-3">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Tu plan</dt>
                <dd class="font-semibold text-slate-800 text-sm">{{ selectedPlanName }}</dd>
                <dd class="text-xs text-slate-400">Cobertura hasta {{ selectedPlanCoverage }} USD</dd>
              </div>
            </div>
          </dl>

          <!-- Total -->
          <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">Total</span>
            <span class="text-lg font-bold tabular-nums" style="color: #00184C;">
              {{ fmt(finalPrice) }}
            </span>
          </div>

          <!-- Adjust buttons -->
          <div class="mt-5 pt-5 border-t border-slate-100">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Necesitas ajustar algo?
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="handleEditSection(STEPS.ROUTE)"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
                :disabled="!canEditRoute"
                :class="!canEditRoute ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ruta
              </button>
              <button
                type="button"
                @click="handleEditSection(STEPS.DATES)"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
                :disabled="!canEditDates"
                :class="!canEditDates ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fechas
              </button>
              <button
                type="button"
                @click="handleEditSection(STEPS.TRAVELERS)"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
                :disabled="!canEditTravelers"
                :class="!canEditTravelers ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Viajeros
              </button>
              <button
                type="button"
                @click="handleEditSection(STEPS.PLANS)"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
                :disabled="!canEditPlan"
                :class="!canEditPlan ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Plan
              </button>
            </div>
            <p class="text-[10px] text-slate-400 mt-2.5 leading-relaxed">
              Al editar, tu pago aun no se procesa &mdash; los datos del formulario se conservan.
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── Sheet slide up ── */
.ts-sheet-enter-active,
.ts-sheet-leave-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.ts-sheet-enter-from,
.ts-sheet-leave-to {
  transform: translateY(100%);
}

/* ── Backdrop fade ── */
.ts-sheet-fade-enter-active,
.ts-sheet-fade-leave-active {
  transition: opacity 0.28s ease;
}
.ts-sheet-fade-enter-from,
.ts-sheet-fade-leave-to {
  opacity: 0;
}
</style>
