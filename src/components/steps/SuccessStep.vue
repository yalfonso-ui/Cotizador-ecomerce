<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { generateVoucherCode } from '@/utils/voucher.js'
import { getTravelerCount } from '@/composables/useTravelerInfo.js'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'
import ContactChannelsModal from '@/components/ui/ContactChannelsModal.vue'
import GeneralTermsModal from '@/components/ui/GeneralTermsModal.vue'
import bannerExito from '@/assets/images/imagenes/Banner final exito.png'

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

// ── Datos mock para preview sin backend ──
// Mientras el backend no está conectado, se usan estos datos
// realistas para que la pantalla se vea como va a quedar.
// Cuando el backend envíe datos reales, estos caen automáticamente
// porque los getters detectan los valores reales primero.
const MOCK_ORIGIN = { name: 'Bogotá, Colombia' }
const MOCK_DESTINATION = { name: 'Madrid, España' }
const MOCK_PLAN_NAME = 'Explorer'
const MOCK_COVERAGE = '50,000 USD'
const MOCK_TOTAL_PAID = 43.20
const MOCK_START_DATE = '2026-08-15'
const MOCK_END_DATE = '2026-08-23'

// ── Confeti nativo (Canvas API, sin dependencias) ──
// Paleta corporativa: navy primario + cyan acento + dorado celebración.
const CONFETTI_COLORS = ['#00184C', '#43D3FF', '#F9D35A', '#FFFFFF', '#0B2553']
let confettiCanvas = null
let confettiRAF = null
let confettiParticles = []
let confettiStartTime = 0

function resizeConfettiCanvas() {
  if (!confettiCanvas) return
  const dpr = window.devicePixelRatio || 1
  confettiCanvas.width = window.innerWidth * dpr
  confettiCanvas.height = window.innerHeight * dpr
  confettiCanvas.style.width = `${window.innerWidth}px`
  confettiCanvas.style.height = `${window.innerHeight}px`
  const ctx = confettiCanvas.getContext('2d')
  ctx.scale(dpr, dpr)
}

function createConfettiParticles(count) {
  const cx = window.innerWidth / 2
  const cy = -20
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: cx + (Math.random() - 0.5) * window.innerWidth * 0.6,
      y: cy + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 3 + 2,
      gravity: 0.12 + Math.random() * 0.04,
      size: Math.random() * 6 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      opacity: 1
    })
  }
}

function drawConfetti() {
  if (!confettiCanvas) return
  const ctx = confettiCanvas.getContext('2d')
  const w = window.innerWidth
  const h = window.innerHeight
  ctx.clearRect(0, 0, w, h)

  const elapsed = performance.now() - confettiStartTime
  const fadeStart = 1800
  const fadeEnd = 2800

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i]
    p.vy += p.gravity
    p.x += p.vx
    p.y += p.vy
    p.rotation += p.rotationSpeed

    if (elapsed > fadeStart) {
      p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / (fadeEnd - fadeStart))
    }

    if (p.y > h + 20 || p.opacity <= 0) {
      confettiParticles.splice(i, 1)
      continue
    }

    ctx.save()
    ctx.globalAlpha = p.opacity
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    ctx.fillStyle = p.color
    if (p.shape === 'rect') {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
    } else {
      ctx.beginPath()
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  if (confettiParticles.length > 0 && elapsed < 3000) {
    confettiRAF = requestAnimationFrame(drawConfetti)
  } else {
    cleanupConfetti()
  }
}

function fireConfetti() {
  if (typeof window === 'undefined') return
  // Respeta accesibilidad: si el usuario prefiere movimiento reducido, no animar.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  confettiCanvas = document.createElement('canvas')
  confettiCanvas.setAttribute('aria-hidden', 'true')
  confettiCanvas.style.position = 'fixed'
  confettiCanvas.style.top = '0'
  confettiCanvas.style.left = '0'
  confettiCanvas.style.pointerEvents = 'none'
  // z-index alto para que flote sobre el header sin taparlo visualmente.
  confettiCanvas.style.zIndex = '40'
  resizeConfettiCanvas()
  document.body.appendChild(confettiCanvas)
  window.addEventListener('resize', resizeConfettiCanvas)

  // 2 ráfagas desde los costados para emular cañones de confeti.
  confettiStartTime = performance.now()
  createConfettiParticles(70)
  setTimeout(() => createConfettiParticles(50), 250)
  setTimeout(() => createConfettiParticles(40), 550)
  confettiRAF = requestAnimationFrame(drawConfetti)
}

function cleanupConfetti() {
  if (confettiRAF) {
    cancelAnimationFrame(confettiRAF)
    confettiRAF = null
  }
  if (confettiCanvas) {
    window.removeEventListener('resize', resizeConfettiCanvas)
    confettiCanvas.remove()
    confettiCanvas = null
  }
  confettiParticles = []
}

onMounted(() => {
  // Disparo automático al cargar la pantalla (celebración elegante, ~2.5s).
  fireConfetti()
})

onBeforeUnmount(() => {
  cleanupConfetti()
})

// ── Total a mostrar en "Total pagado" ──
// Prioridad: prop totalPaid (cifra real cobrada) > selectedPlan.price (fallback).
// Esto es lo que el usuario ve en la pantalla de éxito y DEBE coincidir
// con lo que se cobró en la pantalla de checkout (incluye adicionales
// como "Deportes y aventura" y descuentos aplicados).
const totalPaidDisplay = computed(() => {
  if (props.totalPaid != null && isFinite(props.totalPaid) && props.totalPaid >= 0) {
    return props.totalPaid
  }
  if (Number(props.selectedPlan?.price) > 0) {
    return Number(props.selectedPlan.price)
  }
  return MOCK_TOTAL_PAID
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
  if (!dest) return MOCK_DESTINATION.name
  if (Array.isArray(dest)) {
    return dest[0]?.name || dest[0] || MOCK_DESTINATION.name
  }
  if (typeof dest === 'object' && dest.name) return dest.name
  return String(dest)
}

function formatOrigin(origin) {
  if (!origin) return MOCK_ORIGIN.name
  if (typeof origin === 'object' && origin.name) return origin.name
  return String(origin)
}

function resolveDate(dateVal, fallback) {
  if (!dateVal) return fmtDate(fallback)
  return fmtDate(dateVal)
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

const titularId = computed(() => {
  const info = props.formData?.travelersInfo
  if (Array.isArray(info) && info.length > 0 && info[0]?.idNumber) return info[0].idNumber
  return '—'
})

const titularEmail = computed(() => {
  const info = props.formData?.travelersInfo
  if (Array.isArray(info) && info.length > 0 && info[0]?.email) return info[0].email
  return '—'
})

const titularPhone = computed(() => {
  const info = props.formData?.travelersInfo
  if (Array.isArray(info) && info.length > 0 && info[0]?.phone) return info[0].phone
  return '—'
})

const titularBirthdate = computed(() => {
  const info = props.formData?.travelersInfo
  if (Array.isArray(info) && info.length > 0 && info[0]?.birthdate) {
    return formatDateSafe(info[0].birthdate)
  }
  return '—'
})

const emergencyContact = computed(() => {
  return props.formData?.emergencyContact || { name: '—', phone: '—', email: '—' }
})

const planName = computed(() => {
  const real = props.selectedPlan?.name || props.formData?.selectedPlan
  if (real && real !== '—' && real !== 'Sin plan' && real !== '') return real
  return MOCK_PLAN_NAME
})
const coverageDisplay = computed(() => {
  const cov = props.selectedPlan?.coverage || props.formData?.coverage
  if (cov && cov !== '—' && cov !== '') return `${cov} USD`
  return MOCK_COVERAGE
})

const tripDaysDisplay = computed(() => `${tripDuration.value} ${tripDuration.value === 1 ? 'día' : 'días'}`)

// Fechas con fallback a datos mock cuando el backend no envía datos.
const startDateDisplay = computed(() => {
  const real = props.formData?.dates?.start
  return real ? fmtDate(real) : fmtDate(MOCK_START_DATE)
})
const endDateDisplay = computed(() => {
  const real = props.formData?.dates?.end
  return real ? fmtDate(real) : fmtDate(MOCK_END_DATE)
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
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">

    <!-- ════════════════ HEADER ════════════════ -->
    <div class="text-center space-y-2.5 max-w-xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full" style="background-color: rgba(67, 211, 255, 0.15);">
        <svg class="w-3.5 h-3.5" style="color: #00184C;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="color: #00184C;">
          Compra exitosa
        </span>
      </div>
      <h1 class="text-2xl md:text-3xl font-extrabold text-[#00184C] tracking-tight leading-tight">
        ¡Listo! Tu viaje <span style="color: #43D3FF;">ya está protegido</span>
      </h1>
      <p class="text-sm text-slate-600 leading-relaxed">
        Hemos enviado toda la información de tu asistencia a tu correo.
      </p>
    </div>

    <!-- ════════════════ LAYOUT A 2 COLUMNAS ════════════════ -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">

      <!-- ════ COLUMNA PRINCIPAL (voucher + viaje) ════ -->
      <div class="lg:col-span-3 space-y-5">

        <!-- Hero voucher con gradient cyan corporativo -->
        <div
          class="relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-cyan-400/30"
          style="background: linear-gradient(135deg, #0B2553 0%, #091E42 50%, #0A365C 100%);"
        >
          <!-- Acento decorativo cyan -->
          <div class="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none" style="background-color: #43D3FF;"></div>

          <div class="relative p-6 text-center">
            <p class="text-[10px] font-bold uppercase tracking-[0.2em]" style="color: rgba(67, 211, 255, 0.85);">
              Código de Voucher
            </p>
            <p class="mt-2 font-mono text-2xl sm:text-[1.75rem] font-extrabold text-white tracking-wider break-all">
              {{ voucherCode }}
            </p>
            <button
              type="button"
              @click="copyVoucher"
              class="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
              :style="copied
                ? 'background-color: #43D3FF; color: #00184C;'
                : 'background-color: rgba(67, 211, 255, 0.18); color: white; border: 1px solid rgba(67, 211, 255, 0.35);'"
              :aria-label="copyError ? 'No se pudo copiar' : (copied ? 'Código copiado al portapapeles' : 'Copiar código de voucher')"
            >
              <svg v-if="copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{{ copyError ? 'No se pudo copiar' : (copied ? 'Copiado al portapapeles' : 'Copiar código') }}</span>
            </button>
          </div>

          <div class="relative grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-center border-t border-white/10">
            <div class="px-3 py-4">
              <p class="text-[10px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em]" style="color: rgba(67, 211, 255, 0.85);">Plan</p>
              <p class="mt-1.5 font-extrabold text-white text-sm">{{ planName }}</p>
            </div>
            <div class="px-3 py-4">
              <p class="text-[10px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em]" style="color: rgba(67, 211, 255, 0.85);">Duración</p>
              <p class="mt-1.5 font-extrabold text-white text-sm tabular-nums">{{ tripDaysDisplay }}</p>
            </div>
            <div class="px-3 py-4">
              <p class="text-[10px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em]" style="color: rgba(67, 211, 255, 0.85);">Cobertura</p>
              <p class="mt-1.5 font-extrabold text-white text-sm tabular-nums">{{ coverageDisplay }}</p>
            </div>
          </div>
        </div>

        <!-- Resumen del viaje -->
        <section class="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden shadow-md">
          <div class="grid grid-cols-2 divide-x divide-slate-100">
            <div class="px-5 py-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Origen</p>
              <p class="mt-1 font-semibold text-slate-900 text-sm">{{ formatOrigin(props.formData?.origin) }}</p>
            </div>
            <div class="px-5 py-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Destino(s)</p>
              <p class="mt-1 font-semibold text-slate-900 text-sm">{{ formatDestination(props.formData?.destination) }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 divide-x divide-slate-100">
            <div class="px-5 py-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Fecha de salida</p>
              <p class="mt-1 font-semibold text-slate-900 text-sm tabular-nums">{{ formatDateSafe(props.formData?.dates?.start) }}</p>
            </div>
            <div class="px-5 py-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Fecha de regreso</p>
              <p class="mt-1 font-semibold text-slate-900 text-sm tabular-nums">{{ formatDateSafe(props.formData?.dates?.end) }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 divide-x divide-slate-100">
            <div class="px-5 py-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Viajero(s)</p>
              <p class="mt-1 font-semibold text-slate-900 text-sm tabular-nums">
                {{ travelerCount() }} <span class="text-slate-500 font-normal">persona{{ travelerCount() === 1 ? '' : 's' }}</span>
              </p>
            </div>
            <div class="px-5 py-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Total pagado</p>
              <p class="mt-1 font-extrabold text-[#00184C] text-sm tabular-nums">USD ${{ totalPaidDisplay }}</p>
            </div>
          </div>
        </section>
      </div>

      <!-- ════ COLUMNA SECUNDARIA (acciones + ayuda) ════ -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Gestiona tu asistencia -->
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] mb-4">
            Gestiona tu asistencia
          </p>
          <div class="flex flex-col gap-2">
            <button
              type="button"
              @click="handleDownloadPdf"
              class="inline-flex items-center justify-between gap-2 px-4 py-4 bg-white border border-slate-200 rounded-xl text-[#00184C] font-bold text-sm shadow-md hover:border-[#00184C] hover:bg-slate-50 hover:shadow-lg active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
            >
              <span class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              </span>
              <svg class="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              type="button"
              @click="handlePrint"
              class="inline-flex items-center justify-between gap-2 px-4 py-4 bg-white border border-slate-200 rounded-xl text-[#00184C] font-bold text-sm shadow-md hover:border-[#00184C] hover:bg-slate-50 hover:shadow-lg active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
            >
              <span class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </span>
              <svg class="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              type="button"
              @click="handleShare"
              class="inline-flex items-center justify-between gap-2 px-4 py-4 bg-white border border-slate-200 rounded-xl text-[#00184C] font-bold text-sm shadow-md hover:border-[#00184C] hover:bg-slate-50 hover:shadow-lg active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
            >
              <span class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Compartir / enviar
              </span>
              <svg class="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              type="button"
              @click="showTerms = true"
              class="inline-flex items-center justify-between gap-2 px-4 py-4 bg-white border border-slate-200 rounded-xl text-[#00184C] font-bold text-sm shadow-md hover:border-[#00184C] hover:bg-slate-50 hover:shadow-lg active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
            >
              <span class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Condiciones
              </span>
              <svg class="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </section>

        <!-- CTA principal en columna lateral, debajo de 'Gestiona tu asistencia' -->
        <button
          type="button"
          @click="$emit('restart-flow')"
          class="w-full bg-[#F9D35A] text-[#00184C] font-extrabold text-base flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all duration-200 ease-out shadow-lg ring-1 ring-[#F9D35A]/30 hover:-translate-y-0.5 hover:shadow-xl hover:bg-[#FFC933] active:translate-y-0 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-[#00184C]">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span>Empieza otra compra</span>
        </button>

        <!-- Ayuda 24/7 eliminada -->
      </div>
    </div>

    <!-- ════════════════ BANNER APP (reubicado al final) ════════════════ -->
    <section class="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50/60 mt-2">
      <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 sm:py-3">
        <div>
          <p class="text-sm font-extrabold text-[#00184C]">Lleva tu asistencia a la mano</p>
          <p class="text-xs text-slate-500 leading-snug mt-0.5">Descarga nuestra app y ten tu voucher siempre a un toque.</p>
        </div>
        <div class="flex items-center gap-2 sm:justify-end">
          <a href="#" aria-label="Descargar en App Store" class="inline-block transition-opacity hover:opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 108" width="120" height="36" class="h-9 w-auto" role="img" aria-label="Descargar en App Store">
              <title>Descargar en App Store</title>
              <g transform="translate(20, 22)" fill="#000">
                <path d="M50.5 49.4c-.1-9.3 7.6-13.7 8-13.9-4.3-6.3-11.1-7.2-13.5-7.3-5.7-.6-11.2 3.4-14.1 3.4-3 0-7.4-3.3-12.2-3.2-6.3.1-12.1 3.7-15.3 9.3-6.5 11.3-1.7 28 4.7 37.1 3.1 4.5 6.8 9.5 11.7 9.3 4.7-.2 6.5-3 12.1-3 5.6 0 7.3 3 12.2 2.9 5 0 8.2-4.5 11.3-9 3.5-5.2 5-10.3 5-10.5-.1-.1-9.9-3.8-9.9-15.1zM40.7 21.2c2.6-3.1 4.3-7.5 3.8-11.8-3.7.1-8.2 2.5-10.8 5.6-2.4 2.7-4.4 7.1-3.9 11.3 4 .3 8.3-2 10.9-5.1z" />
              </g>
              <g transform="translate(108, 0)" fill="#000" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif">
                <text x="0" y="50" font-size="22" font-weight="400" letter-spacing="-0.2">Descargar en</text>
                <text x="0" y="86" font-size="38" font-weight="700" letter-spacing="-1.2">App Store</text>
              </g>
            </svg>
          </a>
          <a href="#" aria-label="Descargar en Google Play" class="inline-block transition-opacity hover:opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 124" width="135" height="40" class="h-9 w-auto" role="img" aria-label="Descargar en Google Play">
              <title>Descargar en Google Play</title>
              <g transform="translate(18, 18)">
                <path d="M0 4.2c0-1.6.6-3 1.5-4L50.6 44 0 83.8c-1-.9-1.5-2.3-1.5-4V4.2z" fill="#00D4FF" />
                <path d="M50.6 44L0 83.8c.6 1.4 1.7 2.4 3 2.7l57-32.4-10-10.1z" fill="#FFCE00" />
                <path d="M0 .2C.7 0 1.3 0 2 0c.9 0 1.8.2 2.5.6l54.5 31L50.6 44 0 .2z" fill="#FF3A44" />
                <path d="M50.6 44l10-10.1 13.5 7.7c2.7 1.5 2.7 5.4 0 6.9l-13.5 7.7-10-12.2z" fill="#00F076" />
              </g>
              <g transform="translate(120, 0)" fill="#000" font-family="Roboto, 'Helvetica Neue', Arial, sans-serif">
                <text x="0" y="48" font-size="22" font-weight="400" letter-spacing="0.4">DISPONIBLE EN</text>
                <text x="0" y="90" font-size="42" font-weight="700" letter-spacing="-0.5">Google Play</text>
              </g>
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- ════════════════ FOOTER ════════════════ -->
    <p class="text-xs text-slate-400 text-center pt-2">
      Continental Assist · Contigo, globalmente.
    </p>

    <ContactChannelsModal :visible="showContact" @close="showContact = false" />
    <GeneralTermsModal :visible="showTerms" @close="showTerms = false" />
  </div>
</template>