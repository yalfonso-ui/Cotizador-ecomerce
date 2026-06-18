<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import PlanCompareModal from '@/components/ui/PlanCompareModal.vue'
import MultitripInfoModal from '@/components/ui/MultitripInfoModal.vue'
import { PLANS as allPlans } from '@/data/plans.js'
import { showToast } from '@/composables/useToast.js'

const emit = defineEmits(['update', 'next'])
const props = defineProps({
  modelValue: String,
  destination: { type: [Object, Array], default: null }
})

const selectedPlan = ref(null)
const isCompareModalOpen = ref(false)
const isMultitripModalOpen = ref(false)
const carouselRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const currentCarouselIndex = ref(0)

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
  const scrollAmount = 320
  carouselRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
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
  showToast('Cotización enviada a tu correo. Revisa tu bandeja de entrada.', { variant: 'success', duration: 8000 })
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
  <div class="ds-focus-column space-y-8 w-full max-w-3xl">
    <div class="space-y-2">
      <span class="ds-eyebrow">Elige tu protección</span>
      <h1 class="ds-heading-1">¿Qué plan necesitas?</h1>
      <p class="ds-helper">Selecciona un plan para continuar.</p>
    </div>

    <div class="w-full">
      <p class="text-sm text-slate-600 text-center mb-4">
        ¿Vas a viajar varias veces al año?
        <button type="button"
          @click="openMultitripInfo"
          class="ml-1 text-slate-900 font-semibold underline underline-offset-2 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] focus-visible:ring-offset-1 rounded"
        >
          Ver más
        </button>
      </p>

      <div class="relative">
        <button type="button"
          v-if="canScrollLeft"
          @click="scrollCarousel('left')"
          class="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-700 hover:text-slate-900 transition-all active:scale-95"
          aria-label="Anterior"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button type="button"
          v-if="canScrollRight"
          @click="scrollCarousel('right')"
          class="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-700 hover:text-slate-900 transition-all active:scale-95"
          aria-label="Siguiente"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div
          ref="carouselRef"
          class="flex gap-4 pb-2 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:snap-none"
          style="scrollbar-width: none; -ms-overflow-style: none;"
        >
          <article
            v-for="plan in plans"
            :key="plan.id"
            @click="selectPlan(plan)"
            class="snap-start shrink-0 w-[280px] sm:w-auto border rounded-xl p-5 transition-colors duration-200 relative cursor-pointer bg-white"
            :class="[
              selectedPlan === plan.id
                ? 'border-slate-900 ring-2 ring-slate-900/10'
                : 'border-slate-200 hover:border-slate-400'
            ]"
          >
            <span
              v-if="plan.recommended"
              class="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-slate-900 text-[10px] font-bold text-white uppercase tracking-wider"
            >
              Recomendado
            </span>

            <div
              v-if="selectedPlan === plan.id"
              class="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center bg-slate-900"
              aria-label="Plan seleccionado"
            >
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div class="text-center mb-4">
              <h3 class="text-lg font-bold text-slate-900">{{ plan.name }}</h3>
              <p class="text-xs text-slate-500 mt-1 leading-snug min-h-[2.5rem]">{{ plan.description }}</p>
            </div>

            <div class="text-center mb-4 pb-4 border-b border-slate-100">
              <div class="flex items-baseline justify-center gap-1">
                <span class="text-4xl font-black text-slate-900">${{ plan.price }}</span>
                <span class="text-sm font-semibold text-slate-500">{{ plan.currency }}</span>
              </div>
              <p v-if="plan.anchorPrice" class="text-xs text-slate-400 mt-1">
                <span class="line-through">${{ plan.anchorPrice }}</span>
                <span class="ml-1 text-emerald-600 font-semibold">Ahorras ${{ plan.anchorPrice - plan.price }}</span>
              </p>
              <p class="text-[11px] text-slate-500 mt-2">
                Cobertura <span class="font-semibold text-slate-700">${{ plan.coverage }} {{ plan.currency }}</span>
              </p>
            </div>

            <ul class="space-y-1.5 mb-5 min-h-[7rem] text-left">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-start gap-2 text-xs text-slate-600"
              >
                <svg class="w-3.5 h-3.5 text-slate-900 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <button type="button"
              @click.stop="selectPlan(plan)"
              class="w-full py-2.5 rounded-full text-sm font-semibold transition-colors"
              :class="selectedPlan === plan.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'"
            >
              <span v-if="selectedPlan === plan.id" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Activo
              </span>
              <span v-else>Elegir este plan</span>
            </button>
          </article>
        </div>

        <div class="flex items-center justify-center gap-1.5 mt-3" role="tablist" aria-label="Posición en el carrusel de planes">
          <button
            v-for="(plan, idx) in plans"
            :key="plan.id"
            type="button"
            @click="scrollToPlan(idx)"
            :aria-label="`Ir al plan ${idx + 1}: ${plan.name}`"
            :aria-current="currentCarouselIndex === idx"
            class="transition-all rounded-full"
            :class="currentCarouselIndex === idx
              ? 'w-6 h-2 bg-slate-900'
              : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'"
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
          Comparar planes
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
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
