<script setup>
import { ref, computed, watch, onMounted, reactive, shallowRef, triggerRef } from 'vue'
import PrivacyPolicyModal from '@/components/ui/PrivacyPolicyModal.vue'
import SubStepIndicator from '@/components/ui/SubStepIndicator.vue'
import StepHeader from '@/components/ui/StepHeader.vue'
import { getTravelerCount as resolveCount, calculateAge } from '@/composables/useTravelerInfo.js'
import { getPlanPrice as planPrice } from '@/data/plans.js'
import { getUpgradesTotal } from '@/data/upgrades.js'
import { formatBirthdate as fmtBirthdate, formatDate } from '@/composables/useDateFormatter.js'
import { showToast } from '@/composables/useToast.js'
import { usePhoneFormatter, isValidPhone, getCountryName } from '@/composables/usePhoneFormatter.js'
import { useBirthdateMask } from '@/composables/useBirthdateMask.js'

const emit = defineEmits(['next', 'go-to-step'])

const props = defineProps({
  modelValue: Object,
  selectedPlan: { type: String, default: null },
  travelers: { type: [String, Number, Array], default: () => 'solo' },
  travelersCount: { type: Number, default: 1 },
  preloadedBirthdates: { type: Array, default: () => [] },
  personalData: { type: Array, default: () => [] },
  origin: { type: [Object, String], default: null },
  destination: { type: [Object, Array, String], default: null },
  dates: { type: Object, default: null },
  upgrades: { type: Object, default: () => ({}) }
})

const activeTab = ref(0)
const tabs = ['Datos del titular', 'Contacto de emergencia']

// Guard doble para evitar que el botón de dev data se filtre a producción
// incluso si alguien buildea accidentalmente con --mode development.
// Requiere AMBOS: MODE === 'development' Y la variable de build estándar.
// Vite inyecta `import.meta.env.DEV=true` en `vite build --mode development`,
// pero ese flag queda fuera de prod builds normales. Aquí nos aseguramos
// de que NUNCA se vea en producción real.
const isDev = import.meta.env.DEV
const showDevTools = isDev && import.meta.env.MODE === 'development'

const travelers_data = ref([])
const expandedTraveler = ref(1)
const emergencyName = ref('')
const emergencyPhone = ref('')
const emergencyEmail = ref('')
const privacyAccepted = ref(false)

// Formatters de teléfono por viajero (uno por id de viajero).
// Almacenamos las instancias en un Map plano FUERA de un `ref` o
// `reactive` para que Vue no envuelva los composables en un proxy
// y desenvuelva los refs/computeds internos. La reactividad se
// mantiene con un counter de versión.
const _phoneFormatters = new Map()
const _birthdateMasks = new Map()
const _formattersVersion = ref(0)
function bumpFormatters() { _formattersVersion.value++ }

function getPhoneFormatter(id) {
  void _formattersVersion.value // dependency tracking
  return _phoneFormatters.get(id)
}
function getBirthdateMaskById(id) {
  void _formattersVersion.value
  return _birthdateMasks.get(id)
}

// Formatter de teléfono para el contacto de emergencia.
const emergencyPhoneFormatter = usePhoneFormatter(PHONE_INITIAL_DIAL)
const emergencyPhoneDialCode = computed(() => emergencyPhoneFormatter.dialCode.value)
const emergencyPhoneCountryName = computed(() => emergencyPhoneFormatter.countryName.value)

// Trigger de animación shake para el checkbox de privacidad cuando
// el usuario intenta continuar sin aceptarlo.
const privacyShake = ref(false)
const emergencyShake = ref(false)
const PHONE_INITIAL_DIAL = '57' // +57 Colombia por default

// Set de IDs de viajero cuyo birthdate fue desbloqueado manualmente por
// el usuario (los demás quedan en modo "solo lectura" cuando vienen
// pre-cargados del paso de selección de pasajeros).
const unlockedBirthdates = ref(new Set())

const touched = ref({})
const isPrivacyModalOpen = ref(false)
const isMobileSummaryExpanded = ref(false)

const travelersLabels = { solo: '1 viajero', pareja: '2 viajeros', familia: '4 viajeros', grupo: '6+ viajeros' }

const getTravelerCount = () => resolveCount(props.travelers, props.travelersCount)

const totalViajeros = computed(() => {
  if (Array.isArray(props.personalData) && props.personalData.length > 0) {
    return props.personalData.length
  }
  return getTravelerCount()
})

const travelersLabel = computed(() => {
  const n = totalViajeros.value
  if (!n || n < 1) return '—'
  return `${n} ${n === 1 ? 'viajero' : 'viajeros'}`
})

const upgradesTotalPrice = computed(() => getUpgradesTotal(props.upgrades))
const planTotalPrice = computed(() => {
  const base = planPrice(props.selectedPlan)
  return base + upgradesTotalPrice.value
})

const initTravelers = () => {
  const count = getTravelerCount()
  const preloaded = props.preloadedBirthdates || []
  const next = []
  for (let i = 0; i < count; i++) {
    const id = i + 1
    const b = preloaded[i] || {}
    next.push({
      id,
      name: '',
      idNumber: '',
      email: '',
      phone: '',
      day: b.day || '',
      month: b.month || '',
      year: b.year || ''
    })

    // Phone formatter: lazy por viajero
    if (!_phoneFormatters.has(id)) {
      _phoneFormatters.set(id, usePhoneFormatter(PHONE_INITIAL_DIAL))
    } else {
      _phoneFormatters.get(id).reset()
    }

    // Birthdate mask: lazy por viajero
    if (!_birthdateMasks.has(id)) {
      _birthdateMasks.set(id, useBirthdateMask({ day: b.day, month: b.month, year: b.year }))
    } else {
      _birthdateMasks.get(id).setValue({ d: b.day, m: b.month, y: b.year })
    }
  }
  bumpFormatters()
  travelers_data.value = next
}

const resetFormState = () => {
  travelers_data.value = []
  unlockedBirthdates.value = new Set()
  emergencyName.value = ''
  emergencyPhone.value = ''
  emergencyEmail.value = ''
  privacyAccepted.value = false
  touched.value = {}
  activeTab.value = 0
  expandedTraveler.value = 1
  for (const fmt of _phoneFormatters.values()) fmt?.reset?.()
  for (const m of _birthdateMasks.values()) m?.reset?.()
  bumpFormatters()
}

const FORM_STORAGE_KEY = 'data_step_form_state'

onMounted(() => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY)
  } catch (e) { /* noop */ }
  resetFormState()
  initTravelers()
})

watch(() => [props.travelers, props.travelersCount], () => {
  initTravelers()
})

const isFieldValid = (traveler, field) => {
  const t = traveler
  switch (field) {
    case 'name': return (t.name || '').trim().length >= 3
    case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.email || '')
    case 'phone':
      // Prioriza la validación del formatter (longitud por país)
      // y cae al conteo de dígitos para casos donde el formateador
      // aún no se inicializó.
      return isValidPhone(t.phone || '') || ((t.phone || '').replace(/\D/g, '').length >= 10)
    case 'idNumber': {
      const v = (t.idNumber || '').trim()
      return v.length >= 6 && v.length <= 20 && /^[a-zA-Z0-9]+$/.test(v)
    }
    case 'birthdate': {
      // Usa el formateador de máscara si está disponible; si no, cae
      // al calculateAge existente.
      const mask = getBirthdateMaskById(traveler.id)
      if (mask && mask.isValid) return !!mask.isValid.value
      const age = calculateAge(t.day, t.month, t.year)
      return age !== null && age >= 0 && age <= 120
    }
    default: return false
  }
}

const isTravelerValid = (traveler) => {
  return ['name', 'idNumber', 'email', 'phone', 'birthdate'].every(f => isFieldValid(traveler, f))
}

const isTravelerComplete = (traveler) => {
  return ['name', 'idNumber', 'email', 'phone'].every(f => isFieldValid(traveler, f))
}

const allTravelersValid = computed(() => travelers_data.value.every(isTravelerValid))

const emergencyNameValid = computed(() => (emergencyName.value || '').trim().length >= 3)
const emergencyPhoneValid = computed(() => (emergencyPhone.value || '').replace(/\D/g, '').length >= 10)
const privacyValid = computed(() => privacyAccepted.value === true)

const tab0Valid = computed(() => allTravelersValid.value)
const tab1Valid = computed(() => emergencyNameValid.value && emergencyPhoneValid.value)
const canSubmit = computed(() => tab0Valid.value && tab1Valid.value && privacyValid.value)

const emergencyNameTouched = ref(false)
const emergencyPhoneTouched = ref(false)
const privacyTouched = ref(false)

const titulErrorsCount = computed(() => {
  if (activeTab.value !== 0) return 0
  let n = 0
  for (const t of travelers_data.value) {
    for (const field of ['name', 'idNumber', 'email', 'phone', 'birthdate']) {
      if (isFieldTouched(t.id, field) && !isFieldValid(t, field)) n++
    }
  }
  return n
})

const emergenciaErrorsCount = computed(() => {
  if (activeTab.value !== 1) return 0
  let n = 0
  if (emergencyNameTouched.value && !emergencyNameValid.value) n++
  if (emergencyPhoneTouched.value && !emergencyPhoneValid.value) n++
  if (privacyTouched.value && !privacyValid.value) n++
  return n
})

const submitAttempted = ref(false)

function touchField(travelerId, field) {
  if (!touched.value[travelerId]) touched.value[travelerId] = {}
  touched.value[travelerId][field] = true
}

function isFieldTouched(travelerId, field) {
  return touched.value[travelerId]?.[field] === true
}

function handleIdNumberInput(traveler, event) {
  traveler.idNumber = event.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
}

function openPrivacyPolicy() {
  isPrivacyModalOpen.value = true
}

function toggleTravelerAccordion(id) {
  expandedTraveler.value = expandedTraveler.value === id ? null : id
}

function copyFromTitular(target) {
  const titular = travelers_data.value[0]
  if (!titular) return
  target.name = titular.name
  target.idNumber = titular.idNumber
  target.email = titular.email
  target.phone = titular.phone
  showToast(`Datos del titular copiados al viajero ${target.id}.`, { variant: 'info', duration: 3000 })
}

function fillTestData() {
  const samples = [
    { name: 'María García López', idNumber: '12345678', email: 'maria.garcia@email.com', phone: '+52 55 1234 5678' },
    { name: 'Juan García López', idNumber: '87654321', email: 'juan.garcia@email.com', phone: '+52 55 8765 4321' },
    { name: 'Sofía García', idNumber: '11223344', email: 'sofia@email.com', phone: '+52 55 1122 3344' }
  ]
  travelers_data.value.forEach((t, i) => {
    const s = samples[i % samples.length]
    t.name = s.name
    t.idNumber = s.idNumber
    t.email = s.email
    t.phone = s.phone
    const fmt = getPhoneFormatter(t.id)
    if (fmt) {
      fmt.onPhoneInput(s.phone)
    }
  })
  emergencyName.value = 'Ana Martínez'
  emergencyPhone.value = '+52 55 5555 5555'
  emergencyPhoneFormatter.onPhoneInput('+52 55 5555 5555')
  emergencyEmail.value = 'ana.martinez@email.com'
  privacyAccepted.value = true
  showToast('Datos de prueba cargados.', { variant: 'success', duration: 2000 })
}

function formatBirthdate(traveler) {
  // Si el formateador de máscara ya inicializó, devuelve el string
  // formateado reactivo. Si no, cae al helper del composable de fechas.
  const mask = getBirthdateMaskById(traveler.id)
  if (mask && (mask.day.value || mask.month.value || mask.year.value)) {
    return mask.masked.value
  }
  return fmtBirthdate(traveler.day, traveler.month, traveler.year)
}

function getBirthdateMaskString(traveler) {
  const mask = getBirthdateMaskById(traveler.id)
  if (mask) {
    return mask.masked.value
  }
  // Fallback estático
  const d = (traveler.day || '__')
  const m = (traveler.month || '__')
  const y = (traveler.year || '____')
  return `${d}/${m}/${y}`
}

/**
 * Determina si el campo birthdate de un viajero debe mostrarse en modo
 * "solo lectura" (campo bloqueado). Esto ocurre cuando la fecha ya fue
 * capturada en el paso de selección de pasajeros y el usuario no la ha
 * desbloqueado explícitamente.
 */
function isBirthdateLocked(traveler) {
  if (unlockedBirthdates.value.has(traveler.id)) return false
  const b = traveler
  return !!(b.day && b.month && b.year)
}

function toggleBirthdateLock(traveler) {
  // Crea un nuevo Set para asegurar la reactividad (Vue 3 detecta el
  // reemplazo de la referencia, no las mutaciones internas).
  const next = new Set(unlockedBirthdates.value)
  if (next.has(traveler.id)) {
    next.delete(traveler.id)
  } else {
    next.add(traveler.id)
  }
  unlockedBirthdates.value = next
}

function applyBirthdateMask(traveler, rawValue) {
  // Aplica la máscara al estado del formateador reactivo y sincroniza
  // los campos day/month/year del traveler para que la lógica existente
  // (calculateAge, emit) siga funcionando.
  const mask = getBirthdateMaskById(traveler.id)
  if (!mask) return
  mask.onInput(rawValue)
  traveler.day = mask.day.value
  traveler.month = mask.month.value
  traveler.year = mask.year.value
}

function applyPhoneMask(traveler, rawValue) {
  // El input NO incluye el prefijo del país (éste se muestra a la izquierda
  // como un badge estático). Por tanto, al construir el número completo
  // para el formateador, le anteponemos el dial code actual.
  const fmt = getPhoneFormatter(traveler.id)
  if (!fmt) {
    traveler.phone = rawValue
    return
  }
  const localDigits = String(rawValue || '').replace(/\D/g, '')
  const fullValue = `+${fmt.dialCode.value}${localDigits}`
  fmt.onPhoneInput(fullValue)
  const formatted = fmt.formatted.value
  const parts = formatted.split(' ')
  const local = parts.slice(1).join(' ')
  traveler.phone = local
}

function isPhoneComplete(traveler) {
  const fmt = getPhoneFormatter(traveler.id)
  if (fmt) return fmt.isValid.value
  return (traveler.phone || '').replace(/\D/g, '').length >= 10
}

function onEmergencyPhoneInput(value) {
  // emergencyPhoneFormatter NO está dentro de un `reactive({})`, por
  // lo que SÍ mantenemos `.value` aquí.
  const localDigits = String(value || '').replace(/\D/g, '')
  const fullValue = `+${emergencyPhoneFormatter.dialCode.value}${localDigits}`
  emergencyPhoneFormatter.onPhoneInput(fullValue)
  const parts = emergencyPhoneFormatter.formatted.value.split(' ')
  emergencyPhone.value = parts.slice(1).join(' ')
}

function getPhoneCountry(traveler) {
  const fmt = getPhoneFormatter(traveler.id)
  if (!fmt) return getCountryName(PHONE_INITIAL_DIAL)
  return fmt.countryName.value
}

function getPhoneDialCode(traveler) {
  const fmt = getPhoneFormatter(traveler.id)
  return fmt?.dialCode?.value || '57'
}

function getPhonePlaceholder() {
  // Placeholder genérico usando el país default. El prefijo +57 está
  // visible a la izquierda del input, así que el placeholder arranca
  // con el número local.
  return '300 123 4567'
}

function getAge(traveler) {
  const mask = getBirthdateMaskById(traveler.id)
  if (mask && mask.isValid && mask.isValid.value) {
    return mask.age.value
  }
  return calculateAge(traveler.day, traveler.month, traveler.year)
}

function formatOrigin(origin) {
  if (!origin) return 'Origen'
  if (typeof origin === 'object' && origin.name) return origin.name
  return String(origin)
}

function formatDestination(dest) {
  if (!dest) return 'Destino'
  if (Array.isArray(dest)) return dest[0]?.name || dest[0] || 'Destino'
  if (typeof dest === 'object' && dest.name) return dest.name
  return String(dest)
}

const tripDays = computed(() => {
  if (!props.dates?.start || !props.dates?.end) return 0
  const start = new Date(props.dates.start)
  const end = new Date(props.dates.end)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

function triggerShake(target) {
  // Dispara una animación de shake rápida sobre el elemento target
  // y la limpia después de 500ms (duración total del keyframe).
  target.value = true
  setTimeout(() => { target.value = false }, 500)
}

function handleNext() {
  if (activeTab.value === 0) {
    travelers_data.value.forEach(t => {
      ['name', 'idNumber', 'email', 'phone', 'birthdate'].forEach(f => touchField(t.id, f))
    })
    if (tab0Valid.value) {
      activeTab.value = 1
    }
  } else {
    emergencyNameTouched.value = true
    emergencyPhoneTouched.value = true
    privacyTouched.value = true

    // Si privacidad no está aceptada, dispara shake sobre el bloque
    // para señalizar visualmente el error.
    if (!privacyAccepted.value) {
      triggerShake(privacyShake)
    }
    // Si los datos de emergencia están incompletos, shake también.
    if (!emergencyNameValid.value || !emergencyPhoneValid.value) {
      triggerShake(emergencyShake)
    }

    if (canSubmit.value) {
      const personalDataArray = travelers_data.value.map(t => ({
        name: t.name,
        idNumber: t.idNumber,
        email: t.email,
        phone: t.phone,
        birthdate: t.year && t.month && t.day
          ? `${t.year}-${t.month.padStart(2, '0')}-${t.day.padStart(2, '0')}`
          : null
      }))
      emit('next', {
        personalData: personalDataArray[0],
        companions: personalDataArray.slice(1),
        travelersInfo: personalDataArray,
        emergencyContact: { name: emergencyName.value, phone: emergencyPhone.value, email: emergencyEmail.value },
        privacyAccepted: privacyAccepted.value
      })
    }
  }
}

watch(travelers_data, () => {
  for (const t of travelers_data.value) {
    if (isTravelerComplete(t) && expandedTraveler.value === t.id) {
      const nextId = t.id + 1
      if (nextId <= travelers_data.value.length) {
        expandedTraveler.value = nextId
        break
      }
    }
  }
}, { deep: true })
</script>

<template>
  <div class="w-full max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-10">
    <StepHeader />

    <div class="lg:hidden sticky top-0 z-20 -mx-4 px-4 py-2 bg-white/90 backdrop-blur-md border-b border-slate-100 mb-3">
      <button
        type="button"
        @click="isMobileSummaryExpanded = !isMobileSummaryExpanded"
        class="w-full flex items-center gap-2 text-left"
        :aria-expanded="isMobileSummaryExpanded"
      >
        <div class="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
          <svg class="w-4 h-4 shrink-0 text-[#00184C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span class="text-xs font-semibold text-slate-900 truncate">
            {{ formatOrigin(props.origin) }} → {{ formatDestination(props.destination) }}
          </span>
          <span v-if="props.dates?.start && props.dates?.end" class="text-[10px] text-slate-400 shrink-0 hidden sm:inline">
            · {{ formatDate(props.dates.start) }} → {{ formatDate(props.dates.end) }}
          </span>
          <span v-if="props.selectedPlan" class="text-[10px] font-medium text-slate-500 capitalize shrink-0 hidden sm:inline">
            · {{ props.selectedPlan }}
          </span>
        </div>
        <svg
          class="w-4 h-4 shrink-0 text-slate-400 transition-transform"
          :class="isMobileSummaryExpanded ? 'rotate-180' : ''"
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <transition name="fade">
        <div v-if="isMobileSummaryExpanded" class="pt-3 mt-3 border-t border-slate-100 space-y-2">
          <div class="flex items-start gap-2.5">
            <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider w-20 shrink-0 pt-0.5">Resumen</span>
            <span class="text-xs text-slate-800 font-medium">{{ formatOrigin(props.origin) }} → {{ formatDestination(props.destination) }}</span>
          </div>
          <div class="flex items-start gap-2.5">
            <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider w-20 shrink-0 pt-0.5">Fechas</span>
            <span class="text-xs text-slate-800 font-medium">
              <template v-if="props.dates?.start && props.dates?.end">
                {{ formatDate(props.dates.start) }} → {{ formatDate(props.dates.end) }}
                <span class="text-slate-400 ml-1">({{ tripDays }} {{ tripDays === 1 ? 'día' : 'días' }})</span>
              </template>
              <template v-else>—</template>
            </span>
          </div>
          <div class="flex items-start gap-2.5">
            <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider w-20 shrink-0 pt-0.5">Viajeros</span>
            <span class="text-xs text-slate-800 font-medium">{{ travelersLabel }}</span>
          </div>
          <div v-if="props.selectedPlan" class="flex items-start gap-2.5">
            <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider w-20 shrink-0 pt-0.5">Plan</span>
            <span class="text-xs text-slate-800 font-medium capitalize">{{ props.selectedPlan }}</span>
          </div>
          <button
            type="button"
            @click="$emit('go-to-step', 1)"
            class="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#00184C] py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar todo
          </button>
        </div>
      </transition>
    </div>

      <section class="w-full space-y-4">
        <header class="space-y-2 text-center mb-2">
          <span class="ds-eyebrow">Casi listos para protegerte</span>
          <h1 class="ds-heading-1">Cuéntanos de <span style="color: #43D3FF;">ti</span></h1>
        </header>
        <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden w-full shadow-md">
          <div class="px-5 pt-5 border-b border-slate-100">
            <SubStepIndicator :current-sub-step="activeTab + 1" :steps="tabs" />
          </div>

          <div class="p-5">
            <transition name="fade" mode="out-in">
              <div v-if="activeTab === 0" key="titular" class="space-y-4">
            <p
              v-if="titulErrorsCount > 0"
              class="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-sm text-red-700"
              role="alert"
              aria-live="polite"
            >
              <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
              </svg>
              Aún te faltan {{ titulErrorsCount }} {{ titulErrorsCount === 1 ? 'dato por completar' : 'datos por completar' }}.
            </p>

            <article
              v-for="traveler in travelers_data"
              :key="traveler.id"
              class="transition-colors"
            >
              <div
                class="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100 cursor-pointer text-left"
                role="button"
                tabindex="0"
                @click="toggleTravelerAccordion(traveler.id)"
                @keydown.space.prevent="toggleTravelerAccordion(traveler.id)"
                @keydown.enter.prevent="toggleTravelerAccordion(traveler.id)"
                :aria-expanded="expandedTraveler === traveler.id"
                :aria-controls="`traveler-panel-${traveler.id}`"
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style="background-color: rgba(67, 211, 255, 0.12);"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #43D3FF;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider text-left flex items-center gap-2 flex-wrap">
                  <span>Viajero {{ traveler.id }} · {{ traveler.id === 1 ? 'Titular' : 'Acompañante' }}</span>
                  <span
                    v-if="getAge(traveler) !== null"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full normal-case bg-slate-100"
                  >
                    <span class="text-sm font-black tabular-nums text-slate-900">{{ getAge(traveler) }}</span>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">años</span>
                  </span>
                  <span
                    v-if="isTravelerComplete(traveler)"
                    class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ml-2 align-middle bg-emerald-50 text-emerald-700"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                    Listo
                  </span>
                </h3>
                <svg
                  class="w-4 h-4 text-slate-400 shrink-0 ml-auto transition-transform"
                  :class="expandedTraveler === traveler.id ? 'rotate-180' : ''"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <transition name="accordion">
                <div
                  v-if="expandedTraveler === traveler.id"
                  :id="`traveler-panel-${traveler.id}`"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label :for="`name-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block text-left">
                        Nombre completo <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          :id="`name-${traveler.id}`"
                          v-model="traveler.name"
                          type="text"
                          placeholder="María García"
                          @blur="touchField(traveler.id, 'name')"
                          class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-base"
                          :class="[isFieldTouched(traveler.id, 'name') && isFieldValid(traveler, 'name') ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' : 'border-slate-200', isFieldTouched(traveler.id, 'name') && !isFieldValid(traveler, 'name') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'name') && isFieldValid(traveler, 'name')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p v-if="isFieldTouched(traveler.id, 'name') && !isFieldValid(traveler, 'name')" class="text-red-500 text-xs mt-1">Mínimo 3 caracteres</p>
                    </div>

                    <div>
                      <label :for="`id-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block text-left">
                        Identificación / Pasaporte <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          :id="`id-${traveler.id}`"
                          :value="traveler.idNumber"
                          @input="handleIdNumberInput(traveler, $event)"
                          @blur="touchField(traveler.id, 'idNumber')"
                          type="text"
                          placeholder="12345678 o AB123456"
                          maxlength="20"
                          class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-base uppercase"
                          :class="[isFieldTouched(traveler.id, 'idNumber') && isFieldValid(traveler, 'idNumber') ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' : 'border-slate-200', isFieldTouched(traveler.id, 'idNumber') && !isFieldValid(traveler, 'idNumber') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'idNumber') && isFieldValid(traveler, 'idNumber')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p v-if="isFieldTouched(traveler.id, 'idNumber') && !isFieldValid(traveler, 'idNumber')" class="text-red-500 text-xs mt-1">Mínimo 6 caracteres</p>
                    </div>

                    <div>
                      <label :for="`email-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block text-left">
                        Correo electrónico <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          :id="`email-${traveler.id}`"
                          v-model="traveler.email"
                          type="email"
                          placeholder="maria@email.com"
                          @blur="touchField(traveler.id, 'email')"
                          class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-base"
                          :class="[isFieldTouched(traveler.id, 'email') && isFieldValid(traveler, 'email') ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' : 'border-slate-200', isFieldTouched(traveler.id, 'email') && !isFieldValid(traveler, 'email') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'email') && isFieldValid(traveler, 'email')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p v-if="isFieldTouched(traveler.id, 'email') && !isFieldValid(traveler, 'email')" class="text-red-500 text-xs mt-1">Correo inválido</p>
                    </div>

                    <div>
                      <label :for="`phone-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block text-left">
                        Teléfono <span class="text-red-500">*</span>
                      </label>
                      <div class="relative flex">
                        <!-- Prefijo de país persistente, no editable -->
                        <span
                          class="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 text-sm font-semibold tabular-nums"
                          style="color: #00184C;"
                          :title="getPhoneCountry(traveler)"
                        >
                          +{{ getPhoneDialCode(traveler) }}
                        </span>
                        <input
                          :id="`phone-${traveler.id}`"
                          :value="traveler.phone"
                          @input="applyPhoneMask(traveler, $event.target.value); touchField(traveler.id, 'phone')"
                          @blur="touchField(traveler.id, 'phone')"
                          type="tel"
                          inputmode="tel"
                          :placeholder="getPhonePlaceholder()"
                          maxlength="18"
                          class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-r-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-base tabular-nums tracking-wide"
                          :class="[isFieldTouched(traveler.id, 'phone') && isFieldValid(traveler, 'phone') ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' : 'border-slate-200', isFieldTouched(traveler.id, 'phone') && !isFieldValid(traveler, 'phone') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'phone') && isFieldValid(traveler, 'phone')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p v-if="isFieldTouched(traveler.id, 'phone') && !isFieldValid(traveler, 'phone')" class="text-red-500 text-xs mt-1">Mínimo 10 dígitos (incluyendo código de país)</p>
                      <p v-else-if="traveler.phone" class="text-slate-400 text-[11px] mt-1">
                        {{ getPhoneCountry(traveler) }}
                      </p>
                    </div>

                    <div>
                      <div class="flex items-center justify-between mb-1.5">
                        <label :for="`birthdate-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide text-left">
                          Fecha de nacimiento <span class="text-red-500">*</span>
                        </label>
                        <button
                          v-if="isBirthdateLocked(traveler)"
                          type="button"
                          @click="toggleBirthdateLock(traveler); $nextTick(() => $event.target.blur())"
                          class="text-[10px] font-semibold uppercase tracking-wider text-[#00184C] hover:opacity-70 transition-opacity focus:outline-none focus-visible:underline inline-flex items-center gap-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Editar
                        </button>
                      </div>
                      <div class="relative">
                        <input
                          :id="`birthdate-${traveler.id}`"
                          :value="getBirthdateMaskString(traveler)"
                          :readonly="isBirthdateLocked(traveler)"
                          :tabindex="isBirthdateLocked(traveler) ? -1 : 0"
                          :aria-readonly="isBirthdateLocked(traveler) ? 'true' : 'false'"
                          @input="applyBirthdateMask(traveler, $event.target.value); touchField(traveler.id, 'birthdate')"
                          @blur="touchField(traveler.id, 'birthdate')"
                          @focus="isBirthdateLocked(traveler) && toggleBirthdateLock(traveler)"
                          inputmode="numeric"
                          maxlength="10"
                          placeholder="DD/MM/AAAA"
                          class="w-full h-12 px-4 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 outline-none pr-9 text-base tabular-nums tracking-wide"
                          :class="[
                            isBirthdateLocked(traveler)
                              ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500 focus:bg-slate-100 focus:border-slate-200 focus:ring-0'
                              : (isFieldTouched(traveler.id, 'birthdate') && isFieldValid(traveler, 'birthdate')
                                  ? 'bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-400/30 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-400/30'
                                  : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15'),
                            !isBirthdateLocked(traveler) && isFieldTouched(traveler.id, 'birthdate') && !isFieldValid(traveler, 'birthdate') ? 'border-red-300 ring-4 ring-red-50' : ''
                          ]"
                        />
                        <!-- Lock icon cuando está bloqueado -->
                        <svg
                          v-if="isBirthdateLocked(traveler)"
                          class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <!-- Check verde cuando es válido (sólo si no está bloqueado) -->
                        <svg
                          v-else-if="isFieldTouched(traveler.id, 'birthdate') && isFieldValid(traveler, 'birthdate')"
                          class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <!-- Icono calendario por defecto -->
                        <svg
                          v-else
                          class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p
                        v-if="isBirthdateLocked(traveler)"
                        class="text-slate-400 text-[11px] mt-1.5 inline-flex items-center gap-1.5"
                      >
                        <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        {{ getAge(traveler) !== null ? getAge(traveler) + ' años ·' : '' }} Pre-cargada del paso anterior
                      </p>
                      <p
                        v-else-if="isFieldTouched(traveler.id, 'birthdate') && !isFieldValid(traveler, 'birthdate')"
                        class="text-red-500 text-xs mt-1"
                      >
                        Fecha inválida
                      </p>
                      <p
                        v-else-if="getAge(traveler) !== null"
                        class="text-slate-400 text-[11px] mt-1"
                      >
                        {{ getAge(traveler) }} años
                      </p>
                    </div>
                  </div>
                </div>
              </transition>
            </article>

          </div>

          <div v-else key="emergencia" class="space-y-4">
            <div
              v-if="emergenciaErrorsCount > 0"
              class="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5"
              role="alert"
              aria-live="polite"
            >
              <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
              </svg>
              <p class="text-sm text-red-700">
                Aún te faltan {{ emergenciaErrorsCount }} {{ emergenciaErrorsCount === 1 ? 'dato' : 'datos' }} para completar.
              </p>
            </div>

            <div class="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100 text-left">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background-color: rgba(67, 211, 255, 0.12);">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #43D3FF;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">¿A quién llamamos si lo necesitas?</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="emergency-name" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block text-left">Nombre completo</label>
                <div class="relative">
                  <input
                    id="emergency-name"
                    v-model="emergencyName"
                    type="text"
                    placeholder="Juan García"
                    @blur="emergencyNameTouched = true"
                    class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-base"
                    :class="[emergencyNameTouched && emergencyNameValid ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' : 'border-slate-200', emergencyNameTouched && !emergencyNameValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <svg v-if="emergencyNameTouched && emergencyNameValid" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p v-if="emergencyNameTouched && !emergencyNameValid" class="text-red-500 text-xs mt-1">Mínimo 3 caracteres</p>
              </div>

              <div>
                <label for="emergency-phone" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block text-left">Teléfono</label>
                <div class="relative flex">
                  <span
                    class="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 text-sm font-semibold tabular-nums"
                    style="color: #00184C;"
                    title="Colombia"
                  >
                    +{{ emergencyPhoneDialCode }}
                  </span>
                  <input
                    id="emergency-phone"
                    :value="emergencyPhone"
                    @input="onEmergencyPhoneInput($event.target.value); emergencyPhoneTouched = true"
                    @blur="emergencyPhoneTouched = true"
                    type="tel"
                    inputmode="tel"
                    placeholder="300 987 6543"
                    maxlength="18"
                    class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-r-xl text-slate-700 placeholder:text-slate-300 transition-all focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-base tabular-nums tracking-wide"
                    :class="[emergencyPhoneTouched && emergencyPhoneValid ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' : 'border-slate-200', emergencyPhoneTouched && !emergencyPhoneValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <svg v-if="emergencyPhoneTouched && emergencyPhoneValid" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p v-if="emergencyPhoneTouched && !emergencyPhoneValid" class="text-red-500 text-xs mt-1">Mínimo 10 dígitos (incluyendo código de país)</p>
              </div>

              <div class="md:col-span-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block text-left">Correo electrónico (opcional)</label>
                <input
                  v-model="emergencyEmail"
                  type="email"
                  placeholder="contacto@email.com"
                  class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none text-base"
                />
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100">
              <div
                :class="['rounded-xl transition-all duration-200', privacyTouched && !privacyValid ? '-mx-2 px-2 py-2 ring-2 ring-red-200 bg-red-50/40' : '', privacyShake ? 'shake' : '']"
              >
                <label class="flex items-start gap-3 cursor-pointer group">
                  <div class="relative flex items-center justify-center mt-0.5">
                    <input
                      v-model="privacyAccepted"
                      type="checkbox"
                      class="peer sr-only"
                    />
                    <div
                      class="w-5 h-5 rounded border-2 transition-all flex items-center justify-center"
                      :class="[
                        privacyAccepted ? '' : (privacyTouched ? 'bg-white border-red-400 group-hover:border-red-500' : 'bg-white border-slate-300 group-hover:border-[#43D3FF]')
                      ]"
                      :style="privacyAccepted ? { backgroundColor: '#43D3FF', borderColor: '#43D3FF' } : {}"
                      role="checkbox"
                      :aria-checked="privacyAccepted"
                      :aria-invalid="privacyTouched && !privacyValid ? 'true' : 'false'"
                    >
                      <svg v-if="privacyAccepted" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p
                      class="text-sm leading-relaxed"
                      :class="privacyTouched && !privacyValid ? 'text-red-700' : 'text-slate-700'"
                    >
                      Confirmo que he leído las
                      <button
                        type="button"
                        @click.stop="openPrivacyPolicy"
                        class="font-semibold underline underline-offset-2 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-1 rounded"
                        style="color: #00184C;"
                      >
                        políticas de privacidad
                      </button>
                      y autorizo el uso de mis datos para gestionar mi asistencia.
                      <span class="text-red-500">*</span>
                    </p>
                  </div>
                </label>
                <p
                  v-if="privacyTouched && !privacyValid"
                  class="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium"
                  role="alert"
                  aria-live="polite"
                >
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
                  </svg>
                  Debes aceptar las políticas de privacidad para continuar.
                </p>
              </div>
            </div>
          </div>
        </transition>
      </div>
        </div>

        <p class="flex items-start gap-2 text-xs text-slate-500 px-1 max-w-md mx-auto mb-3">
          <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tus datos están seguros con nosotros. Los usamos solo para emitir tu asistencia.
        </p>

        <button type="button"
          @click="handleNext"
          :disabled="activeTab === 0 ? !tab0Valid : (!emergencyNameValid || !emergencyPhoneValid)"
          class="bg-[#F9D35A] text-[#00184C] font-bold text-base flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full transition-all hover:brightness-95 shadow-sm w-full max-w-md mx-auto disabled:bg-slate-200 disabled:text-slate-400"
        >
          <span v-if="activeTab === 0">
            <span class="hidden md:inline">Sigue con tu contacto de emergencia</span>
            <span class="md:hidden">Continuar</span>
          </span>
          <span v-else>
            <span class="hidden md:inline">Continúa a tus coberturas opcionales</span>
            <span class="md:hidden">Siguiente</span>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-current transform rotate-45">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </button>

        <button
          v-if="showDevTools"
          type="button"
          @click="fillTestData"
          class="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 mx-auto block"
        >
          [Dev] Llenar datos de prueba
        </button>
      </section>



    <PrivacyPolicyModal v-model="isPrivacyModalOpen" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}
.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 800px;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}
.shake {
  animation: shake 0.4s ease-in-out;
  background-color: rgba(254, 226, 226, 0.35);
}
</style>



