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
const carouselRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const currentCarouselIndex = ref(0)

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

function selectPlan(plan) {
  selectedPlan.value = plan.id
  emit('update:modelValue', plan.id)
  emit('next', { selectedPlan: plan.id })
}

function openCompare() {
  isCompareModalOpen.value = true
}

function openMultitripInfo() {
  isMultitripModalOpen.value = true
}

function scrollCarousel(direction) {
  if (!carouselRef.value) return
  const cardWidth = carouselRef.value.firstElementChild?.offsetWidth || 280
  const gap = 16
  carouselRef.value.scrollBy({
    left: direction === 'left' ? -(cardWidth + gap) : (cardWidth + gap),
    behavior: 'smooth'
  })
}

function updateScrollButtons() {
  if (!carouselRef.value) return
  canScrollLeft.value = carouselRef.value.scrollLeft > 4
  canScrollRight.value = carouselRef.value.scrollLeft < carouselRef.value.scrollWidth - carouselRef.value.clientWidth - 4
  const cardWidth = carouselRef.value.firstElementChild?.offsetWidth || 300
  const gap = 16
  const idx = Math.round(carouselRef.value.scrollLeft / (cardWidth + gap))
  currentCarouselIndex.value = Math.min(Math.max(idx, 0), (plans.value?.length || 1) - 1)
}

function scrollToPlan(index) {
  if (!carouselRef.value) return
  const card = carouselRef.value.children[index]
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }
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

onMounted(() => {
  nextTick(() => {
    updateScrollButtons()
    if (carouselRef.value) {
      carouselRef.value.addEventListener('scroll', updateScrollButtons, { passive: true })
    }
  })
})

onUnmounted(() => {
  if (carouselRef.value) {
    carouselRef.value.removeEventListener('scroll', updateScrollButtons)
  }
})
</script>

<template>
  <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
    <div class="space-y-2 text-center">
      <span class="ds-eyebrow">Tu respaldo, a tu medida</span>
      <h1 class="ds-heading-1">Elige la cobertura<span style="color: #43D3FF;"> ideal para ti</span> </h1>
    </div>

    <div class="max-w-4xl mx-auto">
      <p class="text-sm text-slate-600 text-center mb-4">
        ¿Vas a viajar varias veces al año?
        <button type="button"
          @click="openMultitripInfo"
          class="ml-1 font-semibold underline underline-offset-2 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-1 rounded"
          style="color: #00184C;"
        >
          Descubre el plan anual
        </button>
      </p>

      <div class="relative">
        <button
          type="button"
          @click="scrollCarousel('left')"
          :disabled="!canScrollLeft"
          class="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] disabled:opacity-0 disabled:pointer-events-none"
          aria-label="Planes anteriores"
        >
          <svg class="w-5 h-5" style="color: #00184C;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          @click="scrollCarousel('right')"
          :disabled="!canScrollRight"
          class="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] disabled:opacity-0 disabled:pointer-events-none"
          aria-label="Siguientes planes"
        >
          <svg class="w-5 h-5" style="color: #00184C;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div
          ref="carouselRef"
          class="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide pb-2 px-4 md:px-6"
          style="scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; touch-action: pan-x;"
        >
          <article
            v-for="plan in plans"
            :key="plan.id"
            @click="selectPlan(plan)"
            class="snap-start shrink-0 relative border rounded-xl p-4 sm:p-3 transition-colors duration-200 cursor-pointer bg-white flex flex-col gap-2 sm:gap-1.5 sm:w-[40%] md:w-[33.80%] lg:w-[33.80%]"
            :class="[
              selectedPlan === plan.id
                ? 'border-slate-900 ring-2 ring-slate-900/10'
                : 'border-slate-200 hover:border-slate-400'
            ]"
          >
            <div class="h-5 flex items-start">
              <span
                v-if="plan.recommended"
                class="inline-block self-start px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                style="background-color: #43D3FF; color: #00184C;"
              >
                Recomendado
              </span>
            </div>

            <div
              v-if="selectedPlan === plan.id"
              class="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
              style="background-color: #00184C;"
              aria-label="Plan seleccionado"
            >
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div class="text-center">
              <h3 class="text-base font-bold text-slate-900 leading-tight">{{ plan.name }}</h3>
              <p class="text-sm sm:text-[11px] text-slate-500 mt-1 sm:mt-0.5 leading-relaxed sm:leading-snug min-h-[1.75rem]">{{ plan.description }}</p>
            </div>

            <div class="text-center pt-3 sm:pt-2 border-t border-slate-100">
              <div class="flex items-baseline justify-center gap-1">
                <span class="text-3xl font-black text-slate-900">${{ plan.price }}</span>
                <span class="text-xs font-semibold text-slate-500">{{ plan.currency }}</span>
              </div>
              <p v-if="plan.anchorPrice" class="text-sm sm:text-[11px] text-slate-400 mt-1 sm:mt-0.5 leading-relaxed sm:leading-tight">
                <span class="line-through">${{ plan.anchorPrice }}</span>
                <span class="ml-1 font-semibold" style="color: #43D3FF;">Ahorras ${{ plan.anchorPrice - plan.price }}</span>
              </p>
              <p class="text-sm sm:text-[10px] text-slate-500 mt-1.5 sm:mt-1 leading-relaxed sm:leading-tight">
                Cobertura <span class="font-semibold text-slate-700">${{ plan.coverage }} {{ plan.currency }}</span>
              </p>
            </div>

            <ul class="space-y-1.5 sm:space-y-0.5 mt-3 sm:mt-2 text-left flex-1">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-start gap-2 sm:gap-1.5 text-sm sm:text-[11px] text-slate-600"
              >
                <svg class="w-3.5 h-3.5 sm:w-3 sm:h-3 text-slate-900 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
                <span class="leading-relaxed sm:leading-tight">{{ feature }}</span>
              </li>
            </ul>

            <button
              v-if="selectedPlan === plan.id"
              type="button"
              @click.stop="selectPlan(plan)"
              class="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-bold bg-[color:var(--ds-primary)] text-white"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Activo
            </button>
            <button
              v-else
              type="button"
              @click.stop="selectPlan(plan)"
              class="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-full text-xs font-bold transition-all hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-secondary)]"
              style="background-color: #F9D35A; color: #00184C;"
            >
              <span>Elegir</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 text-white transform rotate-45">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </button>
          </article>
        </div>

        <div class="flex items-center justify-center gap-1.5 mt-4 sm:hidden" role="tablist" aria-label="Posición en el carrusel de planes">
          <button
            v-for="(plan, idx) in plans"
            :key="plan.id"
            type="button"
            @click="scrollToPlan(idx)"
            :aria-label="`Ir al plan ${idx + 1}: ${plan.name}`"
            :aria-current="currentCarouselIndex === idx"
            class="transition-all rounded-full"
            :class="currentCarouselIndex === idx
              ? 'w-6 h-2'
              : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'"
            :style="currentCarouselIndex === idx ? { backgroundColor: '#00184C' } : {}"
          />
          <span class="ml-2 text-xs text-slate-500 tabular-nums" aria-live="polite">
            {{ currentCarouselIndex + 1 }} / {{ plans.length }}
          </span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
        <button type="button"
          @click="openCompare"
          class="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Compara los planes lado a lado
        </button>
      </div>

      <div class="text-center mt-4">
        <button type="button"
          @click="handleSaveQuote"
          class="text-xs text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Enviar cotización por correo
        </button>
      </div>
    </div>

    <PlanCompareModal
      v-model="isCompareModalOpen"
      :plans="plans"
      :selectedPlanId="selectedPlan"
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
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
