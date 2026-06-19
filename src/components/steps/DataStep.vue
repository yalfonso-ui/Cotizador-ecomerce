<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import PrivacyPolicyModal from '@/components/ui/PrivacyPolicyModal.vue'
import SubStepIndicator from '@/components/ui/SubStepIndicator.vue'
import { getTravelerCount as resolveCount, calculateAge } from '@/composables/useTravelerInfo.js'
import { formatBirthdate as fmtBirthdate, formatDate } from '@/composables/useDateFormatter.js'
import { showToast } from '@/composables/useToast.js'

const emit = defineEmits(['next', 'go-to-step'])

const props = defineProps({
  modelValue: Object,
  selectedPlan: { type: String, default: null },
  travelers: { type: [String, Number], default: () => 'solo' },
  travelersCount: { type: Number, default: 1 },
  preloadedBirthdates: { type: Array, default: () => [] },
  origin: { type: [Object, String], default: null },
  destination: { type: [Object, Array, String], default: null },
  dates: { type: Object, default: null }
})

const activeTab = ref(0)
const tabs = ['Datos del titular', 'Contacto de emergencia']  
const isDev = import.meta.env.DEV

const travelers_data = ref([])
const expandedTraveler = ref(1)
const emergencyName = ref('')
const emergencyPhone = ref('')
const emergencyEmail = ref('')
const privacyAccepted = ref(false)

const touched = ref({})
const isPrivacyModalOpen = ref(false)

const travelersLabels = { solo: '1 viajero', pareja: '2 viajeros', familia: '4 viajeros', grupo: '6+ viajeros' }

const getTravelerCount = () => resolveCount(props.travelers, props.travelersCount)

const initTravelers = () => {
  const count = getTravelerCount()
  const preloaded = props.preloadedBirthdates || []
  const next = []
  for (let i = 0; i < count; i++) {
    const b = preloaded[i] || {}
    next.push({
      id: i + 1,
      name: '',
      idNumber: '',
      email: '',
      phone: '',
      day: b.day || '',
      month: b.month || '',
      year: b.year || ''
    })
  }
  travelers_data.value = next
}

const resetFormState = () => {
  travelers_data.value = []
  emergencyName.value = ''
  emergencyPhone.value = ''
  emergencyEmail.value = ''
  privacyAccepted.value = false
  touched.value = {}
  activeTab.value = 0
  expandedTraveler.value = 1
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
    case 'phone': return (t.phone || '').replace(/\D/g, '').length >= 10
    case 'idNumber': {
      const v = (t.idNumber || '').trim()
      return v.length >= 6 && v.length <= 20 && /^[a-zA-Z0-9]+$/.test(v)
    }
    case 'birthdate': {
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
  })
  emergencyName.value = 'Ana Martínez'
  emergencyPhone.value = '+52 55 5555 5555'
  emergencyEmail.value = 'ana.martinez@email.com'
  privacyAccepted.value = true
  showToast('Datos de prueba cargados.', { variant: 'success', duration: 2000 })
}

function formatBirthdate(traveler) {
  return fmtBirthdate(traveler.day, traveler.month, traveler.year)
}

function getAge(traveler) {
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
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
})

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
  <div class="w-full max-w-5xl mx-auto px-4 md:px-8">
    <header class="space-y-2 text-center mb-6">
      <span class="ds-eyebrow">Casi listos para protegerte</span>
      <h1 class="ds-heading-1">Cuéntanos de <span style="color: #43D3FF;">ti</span></h1>
      <p class="ds-helper max-w-md mx-auto">Así de simple. Así de rápido.</p>
    </header>

    <p class="flex items-start gap-2 text-xs text-slate-600 px-1 max-w-md mx-auto mb-6">
      <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Tus datos están seguros con nosotros. Los usamos solo para emitir tu asistencia.
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section class="lg:col-span-2 w-full space-y-4">
        <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden w-full">
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
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
                  Viajero {{ traveler.id }} · {{ traveler.id === 1 ? 'Titular' : 'Acompañante' }}
                  <span v-if="getAge(traveler) !== null" class="text-slate-300"> · {{ getAge(traveler) }} años</span>
                  <span
                    v-if="isTravelerComplete(traveler)"
                    class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ml-2 align-middle"
                    style="background-color: rgba(67, 211, 255, 0.12); color: #00184C;"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #43D3FF;">
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
                          class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-sm"
                          :class="[isFieldTouched(traveler.id, 'name') && isFieldValid(traveler, 'name') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'name') && !isFieldValid(traveler, 'name') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'name') && isFieldValid(traveler, 'name')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                          class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-sm uppercase"
                          :class="[isFieldTouched(traveler.id, 'idNumber') && isFieldValid(traveler, 'idNumber') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'idNumber') && !isFieldValid(traveler, 'idNumber') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'idNumber') && isFieldValid(traveler, 'idNumber')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                          class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-sm"
                          :class="[isFieldTouched(traveler.id, 'email') && isFieldValid(traveler, 'email') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'email') && !isFieldValid(traveler, 'email') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'email') && isFieldValid(traveler, 'email')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p v-if="isFieldTouched(traveler.id, 'email') && !isFieldValid(traveler, 'email')" class="text-red-500 text-xs mt-1">Correo inválido</p>
                    </div>

                    <div>
                      <label :for="`phone-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block text-left">
                        Teléfono <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          :id="`phone-${traveler.id}`"
                          v-model="traveler.phone"
                          type="tel"
                          placeholder="+52 55 1234 5678"
                          @blur="touchField(traveler.id, 'phone')"
                          class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-sm"
                          :class="[isFieldTouched(traveler.id, 'phone') && isFieldValid(traveler, 'phone') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'phone') && !isFieldValid(traveler, 'phone') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'phone') && isFieldValid(traveler, 'phone')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p v-if="isFieldTouched(traveler.id, 'phone') && !isFieldValid(traveler, 'phone')" class="text-red-500 text-xs mt-1">Mínimo 10 dígitos</p>
                    </div>

                    <div>
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block text-left">
                        Fecha de nacimiento
                      </label>
                      <div class="relative">
                        <div
                          class="group w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-400 flex items-center gap-2 text-sm cursor-default transition-colors hover:border-slate-300"
                          aria-readonly="true"
                        >
                          <svg
                            class="w-4 h-4 text-slate-300 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span class="font-medium tabular-nums tracking-wide">{{ formatBirthdate(traveler) || '—' }}</span>
                          <svg
                            class="w-3.5 h-3.5 text-slate-200 ml-auto shrink-0 transition-colors group-hover:text-slate-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>
                      <p class="text-[10px] text-slate-400 mt-1">
                        <span v-if="getAge(traveler) !== null">{{ getAge(traveler) }} años · pre-cargada del paso anterior</span>
                        <span v-else>Pre-cargada del paso anterior</span>
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
                    class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-sm"
                    :class="[emergencyNameTouched && emergencyNameValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', emergencyNameTouched && !emergencyNameValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <svg v-if="emergencyNameTouched && emergencyNameValid" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p v-if="emergencyNameTouched && !emergencyNameValid" class="text-red-500 text-xs mt-1">Mínimo 3 caracteres</p>
              </div>

              <div>
                <label for="emergency-phone" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block text-left">Teléfono</label>
                <div class="relative">
                  <input
                    id="emergency-phone"
                    v-model="emergencyPhone"
                    type="tel"
                    placeholder="+52 55 9876 5432"
                    @blur="emergencyPhoneTouched = true"
                    class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none pr-9 text-sm"
                    :class="[emergencyPhoneTouched && emergencyPhoneValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', emergencyPhoneTouched && !emergencyPhoneValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <svg v-if="emergencyPhoneTouched && emergencyPhoneValid" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p v-if="emergencyPhoneTouched && !emergencyPhoneValid" class="text-red-500 text-xs mt-1">Mínimo 10 dígitos</p>
              </div>

              <div class="md:col-span-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block text-left">Correo electrónico (opcional)</label>
                <input
                  v-model="emergencyEmail"
                  type="email"
                  placeholder="contacto@email.com"
                  class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all focus:bg-white focus:border-[#43D3FF] focus:ring-4 focus:ring-[#43D3FF]/15 outline-none text-sm"
                />
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100">
              <label class="flex items-start gap-3 cursor-pointer group">
                <div class="relative flex items-center justify-center mt-0.5">
                  <input
                    v-model="privacyAccepted"
                    type="checkbox"
                    class="peer sr-only"
                  />
                  <div
                    class="w-5 h-5 rounded border-2 transition-all flex items-center justify-center"
                    :class="privacyAccepted ? '' : 'bg-white border-slate-300 group-hover:border-[#43D3FF]'"
                    :style="privacyAccepted ? { backgroundColor: '#43D3FF', borderColor: '#43D3FF' } : {}"
                  >
                    <svg v-if="privacyAccepted" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-slate-700 leading-relaxed">
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
            </div>
          </div>
        </transition>
      </div>
        </div>

        <button type="button"
          @click="handleNext"
          :disabled="activeTab === 0 ? !tab0Valid : !canSubmit"
          class="ds-cta w-auto sm:w-auto min-w-0 px-6 py-2.5 text-sm mx-auto"
        >
          <span>{{ activeTab === 0 ? 'Sigue con tu contacto de emergencia' : 'Continúa a tus coberturas opcionales' }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <button
          v-if="isDev"
          type="button"
          @click="fillTestData"
          class="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 mx-auto block"
        >
          [Dev] Llenar datos de prueba
        </button>
      </section>

      <aside class="lg:col-span-1 w-full space-y-2 lg:sticky lg:top-20 lg:self-start">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm w-full">
          <div class="flex items-center justify-between p-4">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tu reserva</p>
            <button type="button" @click="$emit('go-to-step', 1)" class="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Editar todo
            </button>
          </div>

          <div class="px-4 pb-4">
            <div class="flex items-center gap-3 p-4 rounded-xl" style="background-color: rgba(67, 211, 255, 0.08);">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style="background-color: rgba(67, 211, 255, 0.15);">
                <svg class="w-5 h-5" style="color: #43D3FF;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tu ruta</p>
                <p class="font-semibold text-slate-800 text-sm whitespace-nowrap">
                  {{ formatOrigin(props.origin) }}
                  <span class="text-slate-400 mx-1">→</span>
                  {{ formatDestination(props.destination) }}
                </p>
              </div>
              <button type="button" @click="$emit('go-to-step', 1)" class="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Editar
              </button>
            </div>
          </div>

          <div class="px-4 pb-4">
            <div class="flex items-center gap-3 p-4 rounded-xl" style="background-color: rgba(67, 211, 255, 0.08);">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style="background-color: rgba(67, 211, 255, 0.15);">
                <svg class="w-5 h-5" style="color: #43D3FF;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fechas del viaje</p>
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="font-semibold text-slate-800 text-sm whitespace-nowrap">
                    {{ props.dates?.start ? formatDate(props.dates.start) : '—' }}
                    <span v-if="props.dates?.start && props.dates?.end" class="text-slate-400 mx-1">→</span>
                    {{ props.dates?.end ? formatDate(props.dates.end) : '' }}
                  </p>
                  <span v-if="tripDays > 0" class="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style="background-color: rgba(67, 211, 255, 0.15); color: #43D3FF;">
                    {{ tripDays }} días
                  </span>
                </div>
              </div>
              <button type="button" @click="$emit('go-to-step', 2)" class="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Editar
              </button>
            </div>
          </div>

          <div class="px-4 pb-4">
            <div class="flex items-center gap-3 p-4 rounded-xl" style="background-color: rgba(67, 211, 255, 0.08);">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style="background-color: rgba(67, 211, 255, 0.15);">
                <svg class="w-5 h-5" style="color: #43D3FF;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Viajeros</p>
                <p class="font-semibold text-slate-800 text-sm">{{ travelersLabels[props.travelers] || props.travelersCount || '—' }} {{ travelersLabels[props.travelers] ? '' : 'personas' }}</p>
              </div>
              <button type="button" @click="$emit('go-to-step', 3)" class="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Editar
              </button>
            </div>
          </div>

          <div v-if="props.selectedPlan" class="px-4 pb-4">
            <div class="flex items-center gap-3 p-4 rounded-xl" style="background-color: rgba(249, 211, 90, 0.12);">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style="background-color: rgba(249, 211, 90, 0.20);">
                <svg class="w-5 h-5" style="color: #F9D35A;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tu plan</p>
                <p class="font-semibold text-slate-800 text-sm capitalize">{{ props.selectedPlan }}</p>
              </div>
              <button type="button" @click="$emit('go-to-step', 4)" class="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Editar
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>

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
</style>