<script setup>
import { ref, computed } from 'vue'
import { generateVoucherCode } from '@/utils/voucher.js'
import { getTravelerCount } from '@/composables/useTravelerInfo.js'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'
import TripHeroBanner from '@/components/ui/TripHeroBanner.vue'
import ContactChannelsModal from '@/components/ui/ContactChannelsModal.vue'
import GeneralTermsModal from '@/components/ui/GeneralTermsModal.vue'

const props = defineProps({
  formData: { type: Object, default: () => ({}) },
  selectedPlan: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['restart-flow'])

const showContact = ref(false)
const showTerms = ref(false)

function handlePrint() {
  window.print()
}

function handleDownloadPdf() {
  window.print()
}

function handleShare() {
  if (navigator.share) {
    navigator.share({
      title: 'Mi asistencia Continental Assist',
      text: `Código: ${voucherCode}`,
    }).catch(() => {})
  } else {
    navigator.clipboard.writeText(voucherCode).catch(() => {})
  }
}

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
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  if (isNaN(diffTime)) return 8
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
})

const titularName = computed(() => {
  const info = props.formData?.travelersInfo
  if (Array.isArray(info) && info.length > 0 && info[0]?.name) return info[0].name
  const pd = props.formData?.personalData
  if (Array.isArray(pd) && pd.length > 0 && pd[0]?.name) return pd[0].name
  return '—'
})

const summaryRows = computed(() => [
  {
    label: 'Fechas',
    value: `${formatDateSafe(props.formData?.dates?.start)} → ${formatDateSafe(props.formData?.dates?.end)}`
  },
  {
    label: 'Pasajeros',
    value: `${travelerCount()} ${travelerCount() === 1 ? 'persona' : 'personas'}`
  },
  {
    label: 'Titular',
    value: titularName.value
  },
  {
    label: 'Total pagado',
    value: `$${props.selectedPlan?.price || 0} USD`
  }
])
</script>

<template>
  <div class="max-w-xl mx-auto px-6 py-3 sm:py-4">

    <div class="text-center space-y-2 mb-4 sm:mb-5">
      <span class="ds-eyebrow">Compra exitosa</span>
      <h1 class="text-2xl md:text-3xl font-bold text-[#00184C] tracking-tight leading-tight">
        ¡Listo! Tu viaje <span style="color: #43D3FF;">ya está protegido</span>
      </h1>
    </div>

    <TripHeroBanner
      :origin="formatOrigin(props.formData?.origin)"
      :destination="formatDestination(props.formData?.destination)"
      :durationDays="tripDuration"
    />

    <div class="space-y-4 mt-4 sm:mt-5">

      <section>
        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-3">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-medium text-slate-400 uppercase tracking-[0.15em] mb-1.5">
                Tu código de asistencia
              </p>
              <p class="font-mono text-lg sm:text-xl font-semibold text-slate-900 tracking-wider truncate">
                {{ voucherCode }}
              </p>
            </div>
            <button
              type="button"
              @click="copyVoucher"
              class="shrink-0 inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
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
        <div class="grid grid-cols-2 gap-3 sm:gap-4 border-t border-b border-slate-100 py-4 sm:py-3 w-full">
          <div v-for="row in summaryRows" :key="row.label">
            <p class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{{ row.label }}</p>
            <p class="text-sm font-semibold text-slate-800 mt-0.5 leading-snug">{{ row.value }}</p>
          </div>
        </div>
      </section>

    </div>

    <!-- Action links -->
    <section class="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-xs text-slate-500">
      <button type="button" @click="handlePrint" class="inline-flex items-center gap-1.5 hover:text-slate-800 transition-colors focus:outline-none focus-visible:underline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span>Imprimir</span>
      </button>

      <button type="button" @click="handleDownloadPdf" class="inline-flex items-center gap-1.5 hover:text-slate-800 transition-colors focus:outline-none focus-visible:underline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Descargar PDF</span>
      </button>

      <button type="button" @click="handleShare" class="inline-flex items-center gap-1.5 hover:text-slate-800 transition-colors focus:outline-none focus-visible:underline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>Compartir / enviar</span>
      </button>

      <button type="button" @click="showContact = true" class="inline-flex items-center gap-1.5 hover:text-slate-800 transition-colors focus:outline-none focus-visible:underline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span>Ver canales de contacto</span>
      </button>

      <button type="button" @click="showTerms = true" class="inline-flex items-center gap-1.5 hover:text-slate-800 transition-colors focus:outline-none focus-visible:underline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Ver condiciones generales</span>
      </button>
    </section>

    <div class="mt-5 sm:mt-6 text-center">
      <p class="text-[#00184C] font-semibold text-sm text-center mb-3 sm:mb-4">
        Lleva tu asistencia a la mano durante tu viaje
      </p>
      <div class="flex items-center justify-center gap-3">
        <a
          href="#"
          aria-label="Descargar en App Store"
          class="inline-flex items-center justify-center h-10 sm:h-9 px-3 rounded-lg bg-black hover:bg-slate-800 transition-colors"
        >
          <svg class="h-10 sm:h-9 w-auto" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M24.6 19.4c0-3.3 2.7-4.9 2.8-5-1.5-2.2-3.9-2.5-4.7-2.5-2-.2-3.9 1.2-4.9 1.2-1 0-2.6-1.2-4.2-1.1-2.2 0-4.2 1.3-5.3 3.2-2.3 3.9-.6 9.7 1.6 12.9 1.1 1.6 2.4 3.3 4 3.2 1.6-.1 2.2-1 4.1-1 1.9 0 2.5 1 4.2 1 1.7 0 2.8-1.6 3.9-3.1 1.2-1.8 1.7-3.5 1.7-3.6-.1-.1-3.3-1.3-3.2-5.2zM21.4 9.6c.9-1 1.4-2.5 1.3-4-1.2.1-2.7.8-3.6 1.9-.8.9-1.5 2.4-1.3 3.8 1.4.1 2.8-.7 3.6-1.7z" fill="#fff"/>
            <text x="36" y="17" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-size="9" font-weight="500">Descargar en</text>
            <text x="36" y="31" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" letter-spacing="-0.3">App Store</text>
          </svg>
        </a>

        <a
          href="#"
          aria-label="Descargar en Google Play"
          class="inline-flex items-center justify-center h-10 sm:h-9 px-3 rounded-lg bg-black hover:bg-slate-800 transition-colors"
        >
          <svg class="h-10 sm:h-9 w-auto" viewBox="0 0 130 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 3.5c-.3.3-.5.8-.5 1.4v30.2c0 .6.2 1.1.5 1.4l15.7-16.5L5 3.5z" fill="#5BC9F4"/>
            <path d="M26.4 25.7l-5.7-5.7L5 36.5c.5.5 1.3.6 2.2.1l19.2-10.9z" fill="#FBC72E"/>
            <path d="M26.4 14.3L7.2 3.4c-.9-.5-1.7-.4-2.2.1L20.7 20l5.7-5.7z" fill="#E53935"/>
            <path d="M26.4 14.3L20.7 20l5.7 5.7 4.7-2.7c1.4-.8 1.4-2.9 0-3.7l-4.7-2.7z" fill="#43A047"/>
            <text x="36" y="17" fill="#fff" font-family="Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="8" font-weight="400">DISPONIBLE EN</text>
            <text x="36" y="31" fill="#fff" font-family="Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="0.3">Google Play</text>
          </svg>
        </a>
      </div>
    </div>

    <div class="mt-5 sm:mt-6 pt-4 border-t border-slate-100 flex flex-col items-center gap-3 sm:gap-2">
      <div class="flex items-center gap-2 text-xs text-slate-400 text-center">
        <svg class="hidden sm:block w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Tus documentos ya están en tu correo</span>
      </div>

      <button
        type="button"
        @click="$emit('restart-flow')"
        class="bg-[#F9D35A] text-[#00184C] font-bold text-base flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full transition-all duration-200 ease-out shadow-sm hover:-translate-y-px hover:brightness-95 hover:shadow-md active:translate-y-0 active:scale-[0.98] w-full sm:w-auto"
      >
        <span>Empieza otra compra</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-current transform rotate-45">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      </button>
    </div>

    <ContactChannelsModal :visible="showContact" @close="showContact = false" />
    <GeneralTermsModal :visible="showTerms" @close="showTerms = false" />
  </div>
</template>