<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import PlanCompareModal from '@/components/ui/PlanCompareModal.vue'
import MultitripInfoModal from '@/components/ui/MultitripInfoModal.vue'
import QuoteEmailModal from '@/components/ui/QuoteEmailModal.vue'
import { PLANS as allPlans } from '@/data/plans.js'
import { showToast } from '@/composables/useToast.js'

const emit = defineEmits(['update:modelValue', 'next'])
const props = defineProps({
  modelValue: String,
  destination: { type: [Object, Array], default: null }
})

const selectedPlan = ref(null)
const isCompareModalOpen = ref(false)
const isMultitripModalOpen = ref(false)
const isQuoteEmailModalOpen = ref(false)

const selectedForComparison = ref([])
const MAX_COMPARE = 3
const MIN_COMPARE = 2

const destinationLabel = computed(() => {
  const dests = Array.isArray(props.destination) ? props.destination : [props.destination]
  const first = dests.find(Boolean)
  if (!first) return 'tu destino'
  if (typeof first === 'string') return first
  return first.name || 'tu destino'
})

const recommendedPlanId = computed(() => {
  const dests = Array.isArray(props.destination) ? props.destination : [props.destination]
  const codes = dests.filter(Boolean).map(d => d.code?.toLowerCase()).filter(Boolean)
  if (codes.length === 0) return 'explorer'
  for (const plan of allPlans) {
    if (plan.bestFor.some(c => codes.includes(c))) return plan.id
  }
  return 'explorer'
})

const plans = computed(() => {
  return allPlans.map(p => ({
    ...p,
    recommended: p.id === recommendedPlanId.value
  }))
})

const comparePlans = computed(() =>
  selectedForComparison.value
    .map(id => allPlans.find(p => p.id === id))
    .filter(Boolean)
)

const isCompareDisabled = computed(() => selectedForComparison.value.length < MIN_COMPARE)
const isMaxCompareReached = computed(() => selectedForComparison.value.length >= MAX_COMPARE)

function selectPlan(planId) {
  selectedPlan.value = planId
  emit('update:modelValue', planId)
  emit('next', { selectedPlan: planId })
}

function toggleSelectForComparison(planId) {
  const idx = selectedForComparison.value.indexOf(planId)
  if (idx > -1) {
    selectedForComparison.value.splice(idx, 1)
    return
  }
  if (selectedForComparison.value.length >= MAX_COMPARE) {
    showToast(`Puedes comparar hasta ${MAX_COMPARE} planes. Desmarca uno para agregar otro.`, {
      variant: 'warning',
      duration: 4000
    })
    return
  }
  selectedForComparison.value.push(planId)
}

function openCompareModal() {
  if (isCompareDisabled.value) return
  isCompareModalOpen.value = true
}

// Cuando el usuario elige un plan desde el modal de comparación:
// seleccionamos el plan y cerramos el modal (v-model), pero NO avanzamos
// al siguiente step. Así el usuario ve el carrusel con su nueva selección
// antes de decidir continuar.
function handleSelectFromCompare(planId) {
  selectedPlan.value = planId
  emit('update:modelValue', planId)
}

function openMultitripInfo() {
  isMultitripModalOpen.value = true
}

function handleSaveQuote() {
  isQuoteEmailModalOpen.value = true
}

function handleQuoteSubmit({ email }) {
  showToast(`Cotización enviada a ${email}. Revisa tu bandeja de entrada.`, { variant: 'success', duration: 8000 })
}

function handleQuoteDownload() {
  showToast('Generando PDF…', { variant: 'info', duration: 4000 })
}

// ── Carousel navigation ──
const carouselRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
let isArrowScrolling = false

function scrollCarousel(direction) {
  if (!carouselRef.value) return
  const amount = direction === 'right' ? 300 : -300
  isArrowScrolling = true
  if (carouselRef.value.style) {
    carouselRef.value.style.scrollSnapType = 'none'
  }
  carouselRef.value.scrollBy({ left: amount, behavior: 'smooth' })
  const restoreSnap = () => {
    if (carouselRef.value && carouselRef.value.style) {
      carouselRef.value.style.scrollSnapType = ''
    }
    isArrowScrolling = false
  }
  let safetyTimer = setTimeout(restoreSnap, 600)
  const onScrollEnd = () => {
    clearTimeout(safetyTimer)
    carouselRef.value?.removeEventListener('scrollend', onScrollEnd)
    restoreSnap()
  }
  carouselRef.value.addEventListener('scrollend', onScrollEnd, { once: true })
}

function updateScrollState() {
  if (isArrowScrolling) return
  requestAnimationFrame(() => {
    const el = carouselRef.value
    if (!el) return
    canScrollLeft.value = el.scrollLeft > 2
    canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 2
  })
}

let resizeObserver = null

onMounted(() => {
  nextTick(() => {
    updateScrollState()
  })
  carouselRef.value?.addEventListener('scroll', updateScrollState, { passive: true })
  window.addEventListener('resize', updateScrollState)

  if (typeof ResizeObserver !== 'undefined' && carouselRef.value) {
    resizeObserver = new ResizeObserver(() => updateScrollState())
    resizeObserver.observe(carouselRef.value)
  }
})

onUnmounted(() => {
  carouselRef.value?.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('resize', updateScrollState)
  resizeObserver?.disconnect()
})
</script>

<template>
  <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-28">
    <div class="space-y-6">
      <!-- Header -->
      <div class="space-y-2 text-center">
        <span class="ds-eyebrow">Tu respaldo, a tu medida</span>
        <h1 class="ds-heading-1">Elige la cobertura<span style="color: #43D3FF;"> ideal para ti</span></h1>
      </div>

      <!-- ── BROWSE VIEW (5 plans, 3 visible + 4th peek) ── -->
      <div class="relative">
        <!-- Left arrow (md+) -->
        <button
          v-show="canScrollLeft"
          type="button"
          @click.stop="scrollCarousel('left')"
          @mousedown.stop
          @touchstart.stop
          aria-label="Desplazar planes a la izquierda"
          class="hidden md:flex pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/80 text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-white active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Right arrow (md+) -->
        <button
          v-show="canScrollRight"
          type="button"
          @click.stop="scrollCarousel('right')"
          @mousedown.stop
          @touchstart.stop
          aria-label="Desplazar planes a la derecha"
          class="hidden md:flex pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/80 text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-white active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div
          ref="carouselRef"
          @scroll="updateScrollState"
          class="flex flex-nowrap gap-4 overflow-x-auto snap-x snap-proximity w-full pb-8 min-h-[480px] hide-scroll-bar"
        >
          <article
            v-for="plan in plans"
            :key="plan.id"
            class="shrink-0 w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.5rem)] snap-center mx-4 relative border rounded-xl p-7 bg-white flex flex-col transition-all duration-200"
        :class="[
          selectedPlan === plan.id
            ? 'border-slate-900 ring-2 ring-slate-900/10'
            : 'border-slate-200',
          selectedForComparison.includes(plan.id) ? 'bg-slate-50/60' : 'bg-white'
        ]"
      >
        <!-- Header area: entire top section is clickable to toggle comparison -->
        <button
          type="button"
          @click.stop="toggleSelectForComparison(plan.id)"
          :aria-pressed="selectedForComparison.includes(plan.id)"
          :aria-label="`${selectedForComparison.includes(plan.id) ? 'Quitar' : 'Añadir'} ${plan.name} a la comparación`"
          class="relative -m-7 mb-0 p-7 pb-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-inset rounded-xl transition-colors hover:bg-slate-50/40"
        >
          <!-- Visual checkbox indicator (top-left) -->
          <span
            class="absolute top-3 left-3 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-150 z-10"
            :class="selectedForComparison.includes(plan.id)
              ? 'bg-[#00184C] border-[#00184C]'
              : 'bg-white border-slate-300'"
            aria-hidden="true"
          >
            <svg
              v-if="selectedForComparison.includes(plan.id)"
              class="w-3.5 h-3.5 text-white"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </span>

          <!-- Selected checkmark indicator (top-right) -->
          <span
            v-if="selectedPlan === plan.id"
            class="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center z-10"
            style="background-color: #00184C;"
            aria-hidden="true"
          >
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </span>

          <h3 class="text-lg font-bold text-slate-900 text-center leading-tight pt-7">
            {{ plan.name }}
            <span
              v-if="plan.recommended"
              class="ml-1.5 inline-block align-middle text-[10px] font-semibold uppercase tracking-wider"
              style="color: #43D3FF;"
            >
              Recomendado
            </span>
          </h3>
          <p class="text-sm text-slate-500 text-center leading-relaxed">{{ plan.description }}</p>
        </button>

        <!-- Price section: NOT part of comparison hit area, clickable for plan selection -->
        <div @click="selectPlan(plan.id)" class="cursor-pointer">

        <p class="text-3xl font-black text-slate-900 text-center border-t border-slate-100 pt-3">
          <span class="text-sm font-medium text-slate-500">Desde </span>${{ plan.price }}<span class="text-xs font-semibold text-slate-500"> {{ plan.currency }}</span>
        </p>
        <p v-if="plan.anchorPrice" class="text-sm text-slate-400 text-center leading-relaxed">
          <span class="line-through">${{ plan.anchorPrice }}</span>
          <span class="ml-1 font-semibold" style="color: #43D3FF;">Ahorras ${{ plan.anchorPrice - plan.price }}</span>
        </p>
        <p class="text-sm text-slate-500 text-center leading-relaxed">
          Cobertura <span class="font-semibold text-slate-700">${{ plan.coverage }} {{ plan.currency }}</span>
        </p>

        <ul class="space-y-2 text-left">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-start gap-2 text-sm text-slate-600"
          >
            <svg class="w-4 h-4 text-slate-900 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <span class="leading-relaxed">{{ feature }}</span>
          </li>
        </ul>
        </div>

        <button
          v-if="selectedPlan === plan.id"
          type="button"
          @click.stop="selectPlan(plan.id)"
          class="mt-auto w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-bold bg-[color:var(--ds-primary)] text-white"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          Activo
        </button>
        <button
          v-else
          type="button"
          @click.stop="selectPlan(plan.id)"
          class="mt-auto w-full inline-flex items-center justify-center gap-1.5 py-2 px-6 rounded-full text-sm font-bold transition-all hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-secondary)]"
          style="background-color: #F9D35A; color: #00184C;"
        >
          <span>Elegir</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-current transform rotate-45">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </button>
      </article>
        </div>
        </div>
        <!-- /carousel + /relative wrapper -->

    <!-- Bottom group: multitrip + send quote -->
    <div class="max-w-5xl mx-auto border-t border-slate-100 pt-6 space-y-3">
      <div class="flex justify-center">
        <button type="button"
          @click="openMultitripInfo"
          class="inline-flex items-center gap-2.5 py-3 px-6 text-sm font-semibold text-[#00184C] bg-white border-2 border-[#00184C] hover:bg-[#00184C] hover:text-white active:scale-[0.98] rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Viajes anuales / multiviaje
        </button>
      </div>

      <div class="flex justify-center">
        <button type="button"
          @click="handleSaveQuote"
          class="inline-flex items-center gap-2.5 py-3 px-6 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Enviar cotización por correo
        </button>
      </div>
    </div>
    </div>
    <!-- /space-y-6 -->

    <!-- ── Sticky bottom compare bar ── -->
    <div
      class="sticky bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3"
      role="region"
      aria-label="Barra de comparación de planes"
    >
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div class="min-w-0">
          <p class="text-sm font-semibold text-slate-900 leading-tight">
            <span v-if="selectedForComparison.length === 0">Compara hasta 3 planes</span>
            <span v-else>{{ selectedForComparison.length }} de {{ MAX_COMPARE }} planes seleccionados</span>
          </p>
          <p class="text-xs text-slate-500 mt-0.5 leading-tight">
            <span v-if="selectedForComparison.length === 0">Marca los planes que quieres comparar</span>
            <span v-else-if="selectedForComparison.length < MIN_COMPARE">Selecciona al menos {{ MIN_COMPARE }} para comparar</span>
            <span v-else>Listo para comparar</span>
          </p>
        </div>
        <button
          type="button"
          @click.stop="openCompareModal"
          @mousedown.stop
          @touchstart.stop
          :disabled="isCompareDisabled"
          class="pointer-events-auto shrink-0 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
          :class="isCompareDisabled
            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            : 'bg-[#00184C] text-white border border-[#00184C] hover:bg-[#002a6e] active:scale-[0.98]'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span v-if="selectedForComparison.length < MIN_COMPARE">Comparar planes</span>
          <span v-else-if="selectedForComparison.length === MAX_COMPARE">Comparar 3 planes</span>
          <span v-else>Comparar {{ selectedForComparison.length }} planes</span>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <PlanCompareModal
      v-model="isCompareModalOpen"
      :plans="comparePlans"
      :selectedPlanId="selectedPlan"
      :recommendedPlanId="recommendedPlanId"
      @select-plan="handleSelectFromCompare"
    />

    <MultitripInfoModal v-model="isMultitripModalOpen" />

    <QuoteEmailModal
      v-model="isQuoteEmailModalOpen"
      :destinationName="destinationLabel"
      @submit="handleQuoteSubmit"
      @download-pdf="handleQuoteDownload"
    />
  </div>
</template>
