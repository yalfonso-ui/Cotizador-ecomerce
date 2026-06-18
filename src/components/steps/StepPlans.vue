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
  <div class="ds-focus-column space-y-8 w-full max-w-6xl">
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

      <div>
        <div
          ref="carouselRef"
          class="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide pb-2 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:snap-none sm:gap-4"
          style="scrollbar-width: none; -ms-overflow-style: none;"
        >
          <article
            v-for="plan in plans"
            :key="plan.id"
            @click="selectPlan(plan)"
            class="snap-start shrink-0 relative w-[260px] sm:w-auto min-w-[260px] sm:min-w-0 border rounded-xl p-4 transition-colors duration-200 cursor-pointer bg-white flex flex-col"
            :class="[
              selectedPlan === plan.id
                ? 'border-slate-900 ring-2 ring-slate-900/10'
                : 'border-slate-200 hover:border-slate-400'
            ]"
          >
            <span
              v-if="plan.recommended"
              class="inline-block self-start mb-2 px-2 py-0.5 rounded-full bg-slate-900 text-[9px] font-bold text-white uppercase tracking-wider"
            >
              Recomendado
            </span>

            <div
              v-if="selectedPlan === plan.id"
              class="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center bg-slate-900"
              aria-label="Plan seleccionado"
            >
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div class="text-center">
              <h3 class="text-base font-bold text-slate-900">{{ plan.name }}</h3>
              <p class="text-[11px] text-slate-500 mt-1 leading-snug min-h-[2rem]">{{ plan.description }}</p>
            </div>

            <div class="text-center mt-3 pt-3 border-t border-slate-100">
              <div class="flex items-baseline justify-center gap-1">
                <span class="text-3xl font-black text-slate-900">${{ plan.price }}</span>
                <span class="text-xs font-semibold text-slate-500">{{ plan.currency }}</span>
              </div>
              <p v-if="plan.anchorPrice" class="text-[11px] text-slate-400 mt-1">
                <span class="line-through">${{ plan.anchorPrice }}</span>
                <span class="ml-1 text-emerald-600 font-semibold">Ahorras ${{ plan.anchorPrice - plan.price }}</span>
              </p>
              <p class="text-[10px] text-slate-500 mt-1.5">
                Cobertura <span class="font-semibold text-slate-700">${{ plan.coverage }} {{ plan.currency }}</span>
              </p>
            </div>

            <ul class="space-y-1 mt-3 mb-3 text-left flex-1">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-start gap-1.5 text-[11px] text-slate-600"
              >
                <svg class="w-3 h-3 text-slate-900 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
                <span class="leading-tight">{{ feature }}</span>
              </li>
            </ul>

            <button type="button"
              @click.stop="selectPlan(plan)"
              class="w-full py-2 rounded-full text-xs font-semibold transition-colors mt-auto"
              :class="selectedPlan === plan.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'"
            >
              <span v-if="selectedPlan === plan.id" class="flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Activo
              </span>
              <span v-else>Elegir este plan</span>
            </button>
          </article>
        </div>

        <div class="flex items-center justify-center gap-1.5 mt-4" role="tablist" aria-label="Posición en el carrusel de planes">
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
