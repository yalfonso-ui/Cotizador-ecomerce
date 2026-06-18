<script setup>
import { ref, computed } from 'vue'
import { generateVoucherCode } from '@/utils/voucher.js'
import { getTravelerCount } from '@/composables/useTravelerInfo.js'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'

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
  if (!dest) return 'Internacional'
  if (Array.isArray(dest)) {
    return dest.map(d => d.name || d).join(', ')
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

const summaryRows = computed(() => [
  {
    label: 'Origen',
    value: formatOrigin(props.formData?.origin)
  },
  {
    label: 'Destino',
    value: formatDestination(props.formData?.destination)
  },
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
  <div class="max-w-xl mx-auto px-6 py-16 sm:py-20">

    <div class="text-center space-y-5 mb-14">
      <div class="inline-flex items-center justify-center">
        <div class="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center">
          <svg class="w-7 h-7 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div class="space-y-3">
        <h1 class="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-tight">
          ¡Tu viaje ya está protegido!
        </h1>
        <p class="text-base text-slate-500 max-w-sm mx-auto leading-relaxed">
          Hemos enviado los documentos de tu asistencia a tu correo electrónico.
        </p>
      </div>
    </div>

    <div class="space-y-10">

      <section>
        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-6">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-medium text-slate-400 uppercase tracking-[0.15em] mb-3">
                Código de asistencia
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
              <svg v-else class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ copyError ? 'Cópialo' : (copied ? 'Copiado' : 'Copiar') }}</span>
            </button>
          </div>
        </div>
      </section>

      <section>
        <dl class="divide-y divide-slate-100">
          <div
            v-for="row in summaryRows"
            :key="row.label"
            class="flex items-baseline justify-between gap-4 py-4"
          >
            <dt class="text-xs font-medium text-slate-400 uppercase tracking-[0.1em] shrink-0">
              {{ row.label }}
            </dt>
            <dd class="text-sm font-medium text-slate-900 text-right truncate">
              {{ row.value }}
            </dd>
          </div>
        </dl>
      </section>

      <section class="pt-2">
        <div class="flex items-center justify-between gap-4 py-4 border-t border-slate-100">
          <div class="min-w-0">
            <p class="text-[11px] font-medium text-slate-400 uppercase tracking-[0.1em] mb-1.5">
              Plan contratado
            </p>
            <p class="text-sm font-semibold text-slate-900 capitalize">
              {{ selectedPlan?.name || 'Asistencia' }}
            </p>
          </div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-700 bg-slate-50 border border-slate-200 rounded-full shrink-0">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Activo
          </div>
        </div>
      </section>

    </div>

    <div class="mt-16 pt-10 border-t border-slate-100 flex flex-col items-center gap-6">
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Documentos enviados a tu correo</span>
      </div>

      <button
        type="button"
        @click="$emit('restart-flow')"
        class="inline-flex items-center gap-2 px-7 py-3 bg-[#00184C] hover:bg-[#002a6e] active:scale-[0.98] active:bg-[#000f33] text-white text-sm font-semibold rounded-full transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Volver al inicio
      </button>
    </div>

  </div>
</template>