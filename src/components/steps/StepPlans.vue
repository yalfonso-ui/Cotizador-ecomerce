<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import PlanCompareModal from '@/components/ui/PlanCompareModal.vue'
import MultitripInfoModal from '@/components/ui/MultitripInfoModal.vue'
import QuoteEmailModal from '@/components/ui/QuoteEmailModal.vue'
import CurrencySwitcher from '@/components/ui/CurrencySwitcher.vue'

import { PLANS as allPlans } from '@/data/plans.js'
import { showToast } from '@/composables/useToast.js'
import { useCurrencyStore, formatCurrency } from '@/stores/useCurrencyStore.js'

const emit = defineEmits(['update:modelValue', 'next', 'go-to-step'])
const props = defineProps({
  modelValue: String,
  destination: { type: [Object, Array], default: null }
})

const selectedPlan = ref(null)
const isCompareModalOpen = ref(false)
const isMultitripModalOpen = ref(false)
const isQuoteEmailModalOpen = ref(false)

// FASE 6: Slots del modal comparador (3 columnas independientes)
// Cada slot puede contener un plan ID distinto, permitiendo comparación
// libre sin perder los otros al cambiar uno.
// Precargamos el plan recomendado en slot 0 para que el modal nunca abra vacío.
const compareSlotIds = ref([null, null, null])
const slotsInitialized = ref(false)

const fx = useCurrencyStore()

// Precios en USD (base). El formateador convierte a la moneda activa del store.
function fmt(usd) { return formatCurrency(usd, fx) }

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

// UX: Duración máxima de cobertura por plan (en días).
const PLAN_MAX_DAYS = {
  lite: 30,
  essential: 60,
  explorer: 90,
  premium: 180,
  elite: 365
}

function initCompareSlots() {
  if (slotsInitialized.value) return
  compareSlotIds.value = [recommendedPlanId.value, null, null]
  slotsInitialized.value = true
}

function handleColumnChange(columnIndex, planId) {
  if (columnIndex < 0 || columnIndex > 2) return
  if (!planId) return
  slotsInitialized.value = true
  const next = [...compareSlotIds.value]
  next[columnIndex] = planId
  compareSlotIds.value = next
}

function selectPlan(planId) {
  // QA-17 FIX: Si el plan ya está seleccionado, no navegar
  if (selectedPlan.value === planId) return
  selectedPlan.value = planId
  emit('update:modelValue', planId)
  emit('next', { selectedPlan: planId })
}

function openCompareModal() {
  // Inicializar slots con el recomendado al abrir por primera vez
  initCompareSlots()
  isCompareModalOpen.value = true
}

// Cuando el usuario elige un plan desde el modal de comparación:
// emitimos `next` para navegar de inmediato al siguiente paso.
function handleSelectFromCompare(planId) {
  selectedPlan.value = planId
  emit('update:modelValue', planId)
  emit('next', { selectedPlan: planId })
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

const currentSlideIndex = ref(0)

function getCards() {
  if (!carouselRef.value) return []
  return Array.from(carouselRef.value.querySelectorAll(':scope > div.contents > article'))
}

function scrollToSlide(index) {
  const cards = getCards()
  if (!cards[index]) return
  const card = cards[index]
  const container = carouselRef.value
  const scrollLeft = card.offsetLeft - (container.offsetWidth - card.offsetWidth) / 2
  container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
}

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
    // Calcular slide visible actual para dots
    const children = getCards()
    const containerCenter = el.scrollLeft + el.offsetWidth / 2
    let closestIdx = 0
    let closestDist = Infinity
    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2
      const dist = Math.abs(containerCenter - childCenter)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = i
      }
    })
    currentSlideIndex.value = closestIdx
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
  <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-28">
    <div class="space-y-6">
      <!-- Header -->
      <div class="space-y-2 text-center">
        <span class="ds-eyebrow">Tu respaldo, a tu medida</span>
        <h1 class="ds-heading-1">Elige la cobertura<span style="color: #43D3FF;"> ideal para ti</span></h1>
        <p class="text-sm sm:text-base text-slate-500 max-w-md mx-auto leading-snug">
          Explora y compara hasta 3 planes lado a lado para encontrar el que mejor se adapte a tu viaje.
        </p>
      </div>

      <!-- Selector de moneda (sincroniza con landing/checkout/summary) -->
      <div class="flex items-center justify-center pt-1">
        <CurrencySwitcher />
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
          class="hidden md:flex pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 items-center justify-center rounded-full bg-white text-[#00184C] border border-slate-200 shadow-xl hover:shadow-2xl hover:bg-slate-50 hover:text-[#00184C] hover:border-[#00184C] active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
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
          class="hidden md:flex pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 items-center justify-center rounded-full bg-white text-[#00184C] border border-slate-200 shadow-xl hover:shadow-2xl hover:bg-slate-50 hover:text-[#00184C] hover:border-[#00184C] active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Carrusel con gradiente de máscara en los bordes -->
        <div
          class="relative md:[mask-image:linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)] md:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)]"
        >
          <div
            ref="carouselRef"
            @scroll="updateScrollState"
            class="flex flex-nowrap gap-4 overflow-x-auto snap-x snap-proximity w-full pb-4 md:pb-8 min-h-[420px] md:min-h-[480px] hide-scroll-bar"
          >
          <TransitionGroup
            appear
            enter-active-class="plan-card-enter"
            tag="div"
            class="contents"
          >
          <article
            v-for="(plan, index) in plans"
            :key="plan.id"
            class="shrink-0 w-[calc(100%-2rem)] sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.5rem)] snap-center mx-2 sm:mx-4 relative rounded-2xl bg-white flex flex-col transition-all duration-200 overflow-hidden border"
            :class="[
              plan.recommended
                ? 'border-2 border-[#00184C] shadow-lg ring-1 ring-[#43D3FF]/30'
                : (selectedPlan === plan.id
                    ? 'border-[#00184C] shadow-xl ring-1 ring-[#00184C]/15'
                    : 'border-slate-200 shadow-md hover:shadow-lg hover:border-slate-300'),
              plan.recommended ? 'plan-card-delight' : ''
            ]"
            :style="{ '--plan-delay': `${index * 100}ms` }"
          >
            <!-- Ribbon "Recomendado" en la parte superior -->
            <div
              v-if="plan.recommended"
              class="absolute top-0 left-0 right-0 z-10 text-[10px] font-bold uppercase tracking-[0.15em] text-white text-center py-1.5 pointer-events-none"
              style="background-color: #00184C;"
            >
              ★ Recomendado
            </div>

            <!-- Header area: solo título + descripción (sin checkbox) -->
            <div
              class="relative px-6 pt-9 pb-4 text-center"
              :class="plan.recommended ? 'pt-9' : 'pt-6'"
            >
              <h3 class="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                {{ plan.name }}
              </h3>
              <p class="text-[13px] text-slate-500 mt-2 leading-snug px-2">
                {{ plan.description }}
              </p>
            </div>

            <!-- Price section: clickable for plan selection -->
            <div @click="selectPlan(plan.id)" class="cursor-pointer px-6">

              <!-- Precio hero (sincronizado con CurrencySwitcher global) -->
              <div class="text-center border-t border-slate-100 pt-5">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Desde
                </p>
                <p class="mt-1 font-black text-slate-900 tabular-nums leading-none tracking-tight" style="font-size: 1.75rem;">
                  {{ fmt(plan.price) }}
                </p>
                <p v-if="plan.anchorPrice" class="mt-1.5 text-xs text-slate-400">
                  <span class="line-through">{{ fmt(plan.anchorPrice) }}</span>
                  <span class="ml-1.5 font-semibold" style="color: #43D3FF;">
                    Ahorras {{ fmt(plan.anchorPrice - plan.price) }}
                  </span>
                </p>
              </div>

              <!-- Cobertura -->
              <div class="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                  Cobertura médica
                </span>
                <span class="text-sm font-extrabold text-slate-900 tabular-nums">
                  ${{ plan.coverage }} USD
                </span>
              </div>

              <!-- UX: Duración máxima de cobertura por plan -->
              <p
                v-if="PLAN_MAX_DAYS[plan.id]"
                class="mt-2 text-[11px] font-semibold flex items-center gap-1.5"
                style="color: #00184C; opacity: 0.65;"
              >
                <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cobertura máxima: hasta {{ PLAN_MAX_DAYS[plan.id] }} días por viaje
              </p>

              <!-- Features -->
              <ul class="mt-5 space-y-2.5">
                <li
                  v-for="feature in plan.features"
                  :key="feature"
                  class="flex items-start gap-2.5 text-[13px] text-slate-700 leading-snug"
                >
                  <span class="shrink-0 mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full" style="background-color: rgba(67, 211, 255, 0.18);">
                    <svg class="w-2.5 h-2.5" style="color: #00184C;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>

            <!-- CTA -->
            <div class="mt-auto p-6 pt-5">
              <button
                v-if="selectedPlan === plan.id"
                type="button"
                @click.stop="selectPlan(plan.id)"
                class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all"
                style="background-color: #EDF4F9; color: #00184C; border: 1px solid #00184C;"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
                Plan activo
              </button>
              <button
                v-else
                type="button"
                @click.stop="selectPlan(plan.id)"
                class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
                style="background-color: #F9D35A; color: #00184C;"
              >
                <span>Continuar con {{ plan.name }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </article>
          </TransitionGroup>
          </div>
        </div>
      </div>
      <!-- /carousel + /mask-wrapper + /relative wrapper -->

      <!-- Dot pagination (solo mobile) -->
      <div class="flex md:hidden items-center justify-center gap-2 -mt-2 pb-2" role="tablist" aria-label="Navegación de planes">
        <button
          v-for="(plan, i) in plans"
          :key="'dot-' + plan.id"
          type="button"
          role="tab"
          :aria-selected="currentSlideIndex === i"
          :aria-label="`Ir al plan ${plan.name}`"
          @click="scrollToSlide(i)"
          class="rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
          :class="currentSlideIndex === i
            ? 'w-7 h-2.5 bg-[#00184C]'
            : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'"
        />
      </div>

    <!-- Bottom group: multitrip + send quote -->
    <div class="max-w-5xl mx-auto border-t border-slate-100 py-4 sm:py-6">
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <button type="button"
          @click="openMultitripInfo"
          class="inline-flex items-center justify-center gap-2.5 py-3 px-6 text-sm font-semibold text-[#00184C] bg-white border-2 border-[#00184C] hover:bg-[#00184C] hover:text-white active:scale-[0.98] rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Viajes anuales / multiviaje
        </button>

        <button type="button"
          @click="handleSaveQuote"
          class="inline-flex items-center justify-center gap-2.5 py-3 px-6 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
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
            Compara hasta 3 planes lado a lado
          </p>
          <p class="text-xs text-slate-500 mt-0.5 leading-tight">
            Selecciona los planes que te interesan dentro del comparador
          </p>
        </div>
        <div class="shrink-0">
          <button
            type="button"
            @click.stop="openCompareModal"
            @mousedown.stop
            @touchstart.stop
            class="pointer-events-auto inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2 bg-[#00184C] text-white border border-[#00184C] hover:bg-[#002a6e] active:scale-[0.98]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Comparar planes</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PlanCompareModal
      v-model="isCompareModalOpen"
      :plans="allPlans"
      :selectedPlanId="selectedPlan"
      :recommendedPlanId="recommendedPlanId"
      selector-mode
      :selectedPlanIds="compareSlotIds"
      :currentCategory="null"
      @select-plan="handleSelectFromCompare"
      @update:column="handleColumnChange"
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

<style scoped>
/*
 * Micro-interacción fintech: entrada en cascada + delight cyan en recomendada.
 */

@keyframes plan-card-slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.plan-card-enter {
  animation: plan-card-slide-up 600ms cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--plan-delay, 0ms);
}

/* Delight: scale + glow cyan destellando */
@keyframes plan-card-delight-glow {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(67, 211, 255, 0);
  }
  20% {
    transform: scale(1.02);
    box-shadow: 0 0 0 6px rgba(67, 211, 255, 0.4),
                0 0 24px 4px rgba(67, 211, 255, 0.3);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(67, 211, 255, 0);
  }
}

.plan-card-delight {
  animation: plan-card-delight-glow 1000ms ease-out 700ms 1 both;
}

/* Borde permanente para la card recomendada */
article.plan-card-delight {
  border-color: #00184C !important;
  border-width: 2px !important;
}

@media (prefers-reduced-motion: reduce) {
  .plan-card-enter,
  .plan-card-delight {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
