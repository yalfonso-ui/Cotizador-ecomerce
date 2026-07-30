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
  selectedPlan: { type: Object, default: () => ({}) },
  // Total final cobrado (plan base + adicionales - descuento).
  // Se setea desde el checkout store al momento del pago exitoso.
  // Si no se pasa, cae al precio base del plan para mantener compatibilidad.
  totalPaid: { type: Number, default: null }
})

const emit = defineEmits(['restart-flow'])

// Logos oficiales de las tiendas — SVGs inlined en el template para
// que no dependan de archivos sueltos en /dist y siempre carguen
// sin importar el bundler. Ver <template> más abajo.
const showContact = ref(false)
const showTerms = ref(false)

// ── Total a mostrar en "Total pagado" ──
// Prioridad: prop totalPaid (cifra real cobrada) > selectedPlan.price (fallback).
// Esto es lo que el usuario ve en la pantalla de éxito y DEBE coincidir
// con lo que se cobró en la pantalla de checkout (incluye adicionales
// como "Deportes y aventura" y descuentos aplicados).
const totalPaidDisplay = computed(() => {
  if (props.totalPaid != null && isFinite(props.totalPaid) && props.totalPaid >= 0) {
    return props.totalPaid
  }
  return Number(props.selectedPlan?.price) || 0
})

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
    value: `$${totalPaidDisplay.value} USD`
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

    <!-- Action links — flex-wrap con gap-3 para evitar compresión en pantallas medianas/pequeñas -->
    <section class="mt-5 sm:mt-6 flex flex-wrap items-stretch justify-center gap-2.5 sm:gap-3 text-xs text-slate-500">
      <button
        type="button"
        @click="handlePrint"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 flex-1 sm:flex-none justify-center min-w-[120px]"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span class="font-medium whitespace-nowrap">Imprimir</span>
      </button>

      <button
        type="button"
        @click="handleDownloadPdf"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 flex-1 sm:flex-none justify-center min-w-[140px]"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="font-medium whitespace-nowrap">Descargar PDF</span>
      </button>

      <button
        type="button"
        @click="handleShare"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 flex-1 sm:flex-none justify-center min-w-[150px]"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span class="font-medium whitespace-nowrap">Compartir / enviar</span>
      </button>

      <button
        type="button"
        @click="showContact = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 flex-1 sm:flex-none justify-center min-w-[140px]"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span class="font-medium whitespace-nowrap">Canales de contacto</span>
      </button>

      <button
        type="button"
        @click="showTerms = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 flex-1 sm:flex-none justify-center min-w-[120px]"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="font-medium whitespace-nowrap">Condiciones</span>
      </button>
    </section>

    <div class="mt-6 sm:mt-7 text-center opacity-60 hover:opacity-100 transition-opacity">
      <p class="text-slate-400 text-xs sm:text-sm font-medium mb-3">
        Lleva tu asistencia a la mano durante tu viaje
      </p>
      <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <a
          href="#"
          aria-label="Descargar en App Store"
          class="inline-block transition-opacity hover:opacity-80"
        >
          <!-- App Store badge: SVG inlined para garantizar carga en build de prod -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 360 108"
            width="120"
            height="36"
            class="h-10 sm:h-9 w-auto"
            role="img"
            aria-label="Descargar en App Store"
          >
            <title>Descargar en App Store</title>
            <!-- Apple mark (white on black) -->
            <g transform="translate(20, 22)" fill="#000">
              <path d="M50.5 49.4c-.1-9.3 7.6-13.7 8-13.9-4.3-6.3-11.1-7.2-13.5-7.3-5.7-.6-11.2 3.4-14.1 3.4-3 0-7.4-3.3-12.2-3.2-6.3.1-12.1 3.7-15.3 9.3-6.5 11.3-1.7 28 4.7 37.1 3.1 4.5 6.8 9.5 11.7 9.3 4.7-.2 6.5-3 12.1-3 5.6 0 7.3 3 12.2 2.9 5 0 8.2-4.5 11.3-9 3.5-5.2 5-10.3 5-10.5-.1-.1-9.9-3.8-9.9-15.1zM40.7 21.2c2.6-3.1 4.3-7.5 3.8-11.8-3.7.1-8.2 2.5-10.8 5.6-2.4 2.7-4.4 7.1-3.9 11.3 4 .3 8.3-2 10.9-5.1z" />
            </g>
            <!-- Text block -->
            <g transform="translate(108, 0)" fill="#000" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif">
              <text x="0" y="50" font-size="22" font-weight="400" letter-spacing="-0.2">Descargar en</text>
              <text x="0" y="86" font-size="38" font-weight="700" letter-spacing="-1.2">App Store</text>
            </g>
          </svg>
        </a>

        <a
          href="#"
          aria-label="Descargar en Google Play"
          class="inline-block transition-opacity hover:opacity-80"
        >
          <!-- Google Play badge: SVG inlined para garantizar carga en build de prod -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 420 124"
            width="135"
            height="40"
            class="h-10 sm:h-9 w-auto"
            role="img"
            aria-label="Descargar en Google Play"
          >
            <title>Descargar en Google Play</title>
            <!-- Multicolor Google Play triangle (the actual mark) -->
            <g transform="translate(18, 18)">
              <!-- Back slope (cyan) -->
              <path d="M0 4.2c0-1.6.6-3 1.5-4L50.6 44 0 83.8c-1-.9-1.5-2.3-1.5-4V4.2z" fill="#00D4FF" />
              <!-- Right slope (yellow) -->
              <path d="M50.6 44L0 83.8c.6 1.4 1.7 2.4 3 2.7l57-32.4-10-10.1z" fill="#FFCE00" />
              <!-- Top-left slope (red) -->
              <path d="M0 .2C.7 0 1.3 0 2 0c.9 0 1.8.2 2.5.6l54.5 31L50.6 44 0 .2z" fill="#FF3A44" />
              <!-- Front-right (green) -->
              <path d="M50.6 44l10-10.1 13.5 7.7c2.7 1.5 2.7 5.4 0 6.9l-13.5 7.7-10-12.2z" fill="#00F076" />
            </g>
            <!-- Text block -->
            <g transform="translate(120, 0)" fill="#000" font-family="Roboto, 'Helvetica Neue', Arial, sans-serif">
              <text x="0" y="48" font-size="22" font-weight="400" letter-spacing="0.4">DISPONIBLE EN</text>
              <text x="0" y="90" font-size="42" font-weight="700" letter-spacing="-0.5">Google Play</text>
            </g>
          </svg>
        </a>
      </div>
    </div>

    <div class="mt-6 sm:mt-8 pt-5 border-t-2 border-slate-100 flex flex-col items-center gap-4">
      <div class="flex items-center gap-2 text-xs text-slate-400 text-center">
        <svg class="hidden sm:block w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Tus documentos ya están en tu correo</span>
      </div>

      <!-- CTA principal: mayor jerarquía visual con navy + acento cian -->
      <button
        type="button"
        @click="$emit('restart-flow')"
        class="relative bg-[#00184C] text-white font-bold text-base flex items-center justify-center gap-3 px-12 py-4 rounded-full transition-all duration-200 ease-out shadow-xl ring-4 ring-[#00184C]/20 hover:-translate-y-0.5 hover:bg-[#00184C] hover:shadow-2xl hover:ring-[#43D3FF]/50 active:translate-y-0 active:scale-[0.98] w-full sm:w-auto min-w-[260px]"
      >
        <span class="absolute inset-0 rounded-full bg-gradient-to-r from-[#00184C] via-[#00184C] to-[#43D3FF]/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true"></span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 relative z-10" style="color: #43D3FF;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        <span class="relative z-10">Empieza otra compra</span>
      </button>
    </div>

    <ContactChannelsModal :visible="showContact" @close="showContact = false" />
    <GeneralTermsModal :visible="showTerms" @close="showTerms = false" />
  </div>
</template>