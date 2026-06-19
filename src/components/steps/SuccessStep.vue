<script setup>
import { ref, computed } from 'vue'
import { generateVoucherCode } from '@/utils/voucher.js'
import { getTravelerCount } from '@/composables/useTravelerInfo.js'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'
import TripHeroBanner from '@/components/ui/TripHeroBanner.vue'

const props = defineProps({
  formData: { type: Object, default: () => ({}) },
  selectedPlan: { type: Object, default: () => ({}) }
})

defineEmits(['restart-flow'])

const voucherCode = generateVoucherCode(props.formData?.selectedPlan)
const copied = ref(false)
const copyError = ref(false)

async function copyVoucher() {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard API no disponible')
    await navigator.clipboard.writeText(voucherCode)
    copied.value = true
    copyError.value = false
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    copyError.value = true
    copied.value = false
  }
}

function formatDestination(dest) {
  if (!dest) return 'Destino'
  if (Array.isArray(dest)) {
    return dest[0]?.name || dest[0] || 'Destino'
  }
  if (typeof dest === 'object' && dest.name) return dest.name
  return String(dest)
}

function formatOrigin(origin) {
  if (!origin) return 'Origen'
  if (typeof origin === 'object' && origin.name) return origin.name
  return String(origin)
}

function formatDateSafe(dateVal) {
  return fmtDate(dateVal)
}

function travelerCount() {
  const ages = props.formData?.travelerAges
  if (ages && ages.length > 0) return ages.length
  return getTravelerCount(props.formData?.travelers, props.formData?.travelersCount)
}

const tripDuration = computed(() => {
  const start = props.formData?.dates?.start
  const end = props.formData?.dates?.end
  if (!start || !end) return 8
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diff = endDate.getTime() - startDate.getTime()
  if (isNaN(diff)) return 8
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1)
})

const summaryRows = computed(() => [
  {
    label: 'Fechas',
    value: `${formatDateSafe(props.formData?.dates?.start)} → ${formatDateSafe(props.formData?.dates?.end)}`
  },
  {
    label: 'Pasajeros',
    value: `${travelerCount()} ${travelerCount() === 1 ? 'persona' : 'personas'}`
  }
])
</script>

<template>
  <div class="max-w-xl mx-auto px-6 py-5 sm:py-6">

    <div class="text-center space-y-3 mb-4">
      <div class="inline-flex items-center justify-center">
        <div class="w-16 h-16 rounded-full border flex items-center justify-center" style="border-color: rgba(0, 24, 76, 0.15);">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style="color: #00184C;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div class="space-y-2">
        <span class="ds-eyebrow">Compra exitosa</span>
        <h1 class="ds-heading-1">
          Listo. <span style="color: #43D3FF;">Tu viaje</span> ya está protegido.
        </h1>
        <p class="ds-helper max-w-sm mx-auto">
          Te enviamos tus documentos de asistencia al correo. Estamos contigo de principio a fin.
        </p>
      </div>
    </div>

    <TripHeroBanner
      :origin="formatOrigin(props.formData?.origin)"
      :destination="formatDestination(props.formData?.destination)"
      :durationDays="tripDuration"
    />

    <div class="space-y-5 mt-5">

      <section>
        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-medium text-slate-400 uppercase tracking-[0.15em] mb-3">
                Tu código de asistencia
              </p>
              <p class="font-mono text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-wider truncate">
                {{ voucherCode }}
              </p>
            </div>
            <button
              type="button"
              @click="copyVoucher"
              class="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
              :class="copyError ? 'border-red-200 text-red-600 hover:bg-red-50' : ''"
              :aria-label="copyError ? 'No se pudo copiar. Cópialo manualmente.' : (copied ? 'Código copiado al portapapeles' : 'Copiar código de asistencia')"
            >
              <svg v-if="copyError" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
              </svg>
              <svg v-else-if="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style="color: #43D3FF;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ copyError ? 'Cópialo' : (copied ? 'Listo, copiado' : 'Cópialo') }}</span>
            </button>
          </div>
        </div>
      </section>

      <section>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-100 py-4 w-full max-w-xl mx-auto">
          <div v-for="row in summaryRows" :key="row.label">
            <p class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{{ row.label }}</p>
            <p class="text-sm font-semibold text-slate-800 mt-0.5">{{ row.value }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Tu plan contratado</p>
            <p class="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{{ selectedPlan?.name || 'Asistencia' }}</p>
          </div>
        </div>
      </section>

    </div>

    <div class="mt-5 pt-4 border-t border-slate-100 flex flex-col items-center gap-3">
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Tus documentos ya están en tu correo</span>
      </div>

      <button
        type="button"
        @click="$emit('restart-flow')"
        class="ds-cta"
      >
        Empieza otra compra
      </button>
    </div>

  </div>
</template>