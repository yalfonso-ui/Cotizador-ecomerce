<script setup>
import { ref } from 'vue'
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
</script>

<template>
  <div class="w-full max-w-xl mx-auto bg-white px-6 py-12 sm:py-16">

    <div class="text-center mb-12">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-cyan-300 mb-6">
        <svg class="w-7 h-7 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="text-3xl sm:text-4xl font-heading font-semibold text-slate-900 tracking-tight mb-3">
        ¡Tu viaje ya está protegido!
      </h1>
      <p class="text-base sm:text-lg font-medium text-slate-700 max-w-md mx-auto leading-relaxed">
        Hemos enviado los documentos de tu asistencia a tu correo electrónico.
      </p>
      <p class="text-xs text-slate-400 mt-2 max-w-md mx-auto">
        Revisa tu bandeja de entrada y la carpeta de promociones. Si no los encuentras, contáctanos desde la sección de ayuda.
      </p>
    </div>

    <div class="border border-slate-200 rounded-2xl overflow-hidden">

      <div class="px-6 py-6 border-b border-slate-100 flex items-center justify-between gap-3">
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-medium text-slate-400 tracking-wide mb-2">Código de asistencia</p>
          <p class="font-mono text-xl sm:text-2xl font-bold text-slate-900 tracking-wider truncate">
            {{ voucherCode }}
          </p>
        </div>
        <button
          type="button"
          @click="copyVoucher"
          class="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border rounded-lg transition-colors focus:outline-none focus-visible:ring-2"
          :class="copyError
            ? 'text-red-600 border-red-200 hover:bg-red-50 focus-visible:ring-red-300'
            : 'text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300 focus-visible:ring-slate-300'"
          :aria-label="copyError ? 'No se pudo copiar. Cópialo manualmente.' : (copied ? 'Código copiado al portapapeles' : 'Copiar código de asistencia')"
        >
          <svg v-if="copyError" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
          </svg>
          <svg v-else-if="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else class="w-3.5 h-3.5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ copyError ? 'Cópialo manualmente' : (copied ? 'Copiado' : 'Copiar') }}</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

        <div class="px-6 py-6">
          <p class="text-[11px] font-medium text-slate-400 tracking-wide mb-2">Ruta</p>
          <p class="text-sm font-semibold text-slate-900 leading-snug">
            {{ formatOrigin(formData?.origin) }}
          </p>
          <p class="text-xs text-slate-300 my-1">→</p>
          <p class="text-sm font-semibold text-slate-900 leading-snug">
            {{ formatDestination(formData?.destination) }}
          </p>
        </div>

        <div class="px-6 py-6 space-y-5">
          <div>
            <p class="text-[11px] font-medium text-slate-400 tracking-wide mb-2">Fechas</p>
            <p class="text-sm font-semibold text-slate-900">
              {{ formatDateSafe(formData?.dates?.start) }}
            </p>
            <p class="text-xs text-slate-400 font-normal">al {{ formatDateSafe(formData?.dates?.end) }}</p>
          </div>
          <div class="pt-3 border-t border-slate-100">
            <p class="text-[11px] font-medium text-slate-400 tracking-wide mb-2">Pasajeros</p>
            <p class="text-sm font-semibold text-slate-900">
              {{ travelerCount() }} {{ travelerCount() === 1 ? 'persona' : 'personas' }}
            </p>
          </div>
        </div>
      </div>

      <div class="px-6 py-6 border-t border-slate-100 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[11px] font-medium text-slate-400 tracking-wide mb-2">Plan</p>
          <p class="text-sm font-semibold text-slate-900 capitalize truncate">
            {{ selectedPlan?.name || 'Asistencia' }}
          </p>
        </div>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-full shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
          Activo
        </span>
      </div>

      <div class="px-6 py-5 border-t border-slate-100 bg-slate-50/50">
        <details class="group">
          <summary class="flex items-center justify-between gap-2 cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 rounded">
            <span class="text-[11px] font-medium text-slate-400 tracking-wide">Detalle de la compra</span>
            <svg class="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div class="mt-3 space-y-2.5 text-xs">
            <div class="flex justify-between gap-3">
              <span class="text-slate-500">Plan {{ selectedPlan?.name || '' }}</span>
              <span class="font-semibold text-slate-700 tabular-nums">${{ selectedPlan?.price || 0 }} USD</span>
            </div>
            <div v-if="formData?.discount" class="flex justify-between gap-3">
              <span class="text-slate-500">Descuento {{ formData.discount.code }}</span>
              <span class="font-semibold text-emerald-600 tabular-nums">-{{ formData.discount.discountPercent }}%</span>
            </div>
            <div v-if="formData?.cardLast4" class="flex justify-between gap-3">
              <span class="text-slate-500">Tarjeta</span>
              <span class="font-mono font-semibold text-slate-700">•••• {{ formData.cardLast4 }}</span>
            </div>
            <div class="flex justify-between gap-3 pt-2 border-t border-slate-200">
              <span class="font-semibold text-slate-700">Total pagado</span>
              <span class="font-bold text-slate-900 tabular-nums">${{ selectedPlan?.price || 0 }} USD</span>
            </div>
          </div>
        </details>
      </div>
    </div>

    <div class="mt-12 flex flex-col items-center gap-4">
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Documentos enviados a tu correo</span>
      </div>

      <button
        type="button"
        @click="$emit('restart-flow')"
        class="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.99] rounded-xl transition-all shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Volver al Inicio
      </button>
    </div>
  </div>
</template>