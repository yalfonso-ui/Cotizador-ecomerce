<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import PrivacyPolicyModal from '@/components/ui/PrivacyPolicyModal.vue'
import SubStepIndicator from '@/components/ui/SubStepIndicator.vue'
import { getTravelerCount as resolveCount, calculateAge } from '@/composables/useTravelerInfo.js'
import { formatBirthdate as fmtBirthdate } from '@/composables/useDateFormatter.js'
import { showToast } from '@/composables/useToast.js'

const emit = defineEmits(['next'])

const props = defineProps({
  modelValue: Object,
  selectedPlan: { type: String, default: null },
  travelers: { type: [String, Number], default: 'solo' },
  travelersCount: { type: Number, default: 1 },
  preloadedBirthdates: { type: Array, default: () => [] }
})

const activeTab = ref(0)
const tabs = ['Titular', 'Emergencia']
const isDev = import.meta.env.DEV

const travelers_data = ref([])
const expandedTraveler = ref(1)
const emergencyName = ref('')
const emergencyPhone = ref('')
const emergencyEmail = ref('')
const privacyAccepted = ref(false)

const touched = ref({})
const isPrivacyModalOpen = ref(false)

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
  <div class="ds-focus-column max-w-5xl mx-auto space-y-6 w-full">
    <header class="space-y-2 text-center">
      <span class="ds-eyebrow">Tus datos de contacto</span>
      <h1 class="ds-heading-1">Cuéntanos de ti</h1>
    </header>

    <p class="flex items-start gap-2 text-xs text-slate-600 px-1">
      <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Tus datos están seguros. Solo los usaremos para emitir tu asistencia.
    </p>

    <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
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
              Tienes {{ titulErrorsCount }} {{ titulErrorsCount === 1 ? 'campo por completar' : 'campos por completar' }} en este formulario.
            </p>

            <article
              v-for="traveler in travelers_data"
              :key="traveler.id"
              class="rounded-xl border-2 transition-colors"
              :class="[
                expandedTraveler === traveler.id
                  ? 'bg-white border-cyan-400'
                  : isTravelerComplete(traveler)
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
              ]"
            >
              <div class="flex items-center justify-between gap-3 px-4 py-3">
                <button
                  type="button"
                  @click="toggleTravelerAccordion(traveler.id)"
                  class="flex items-center gap-3 min-w-0 flex-1 text-left"
                  :aria-expanded="expandedTraveler === traveler.id"
                  :aria-controls="`traveler-panel-${traveler.id}`"
                >
                  <span
                    class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white transition-colors"
                    :class="isTravelerComplete(traveler)
                      ? 'bg-emerald-500'
                      : expandedTraveler === traveler.id
                        ? 'bg-cyan-500'
                        : 'bg-slate-300'"
                  >
                    <svg v-if="isTravelerComplete(traveler)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                    <span v-else>{{ traveler.id }}</span>
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-sm font-bold text-slate-800 truncate">
                      Viajero {{ traveler.id }} — {{ traveler.id === 1 ? 'Titular' : 'Acompañante' }}
                      <span v-if="getAge(traveler) !== null" class="text-xs font-medium text-slate-400 ml-1">
                        ({{ getAge(traveler) }} años)
                      </span>
                    </span>
                    <span v-if="expandedTraveler !== traveler.id && traveler.name" class="block text-xs text-slate-500 truncate">
                      {{ traveler.name }}
                    </span>
                    <span v-else-if="expandedTraveler !== traveler.id" class="block text-xs text-slate-400 truncate">
                      Pendiente
                    </span>
                  </span>
                  <svg
                    class="w-4 h-4 text-slate-400 shrink-0 transition-transform"
                    :class="expandedTraveler === traveler.id ? 'rotate-180' : ''"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  v-if="traveler.id > 1 && expandedTraveler === traveler.id && travelers_data[0]"
                  type="button"
                  @click.stop="copyFromTitular(traveler)"
                  class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  :aria-label="`Usar los mismos datos del titular para el viajero ${traveler.id}`"
                  title="Copia nombre, identificación, email y teléfono del titular"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span class="hidden sm:inline">Usar datos del titular</span>
                  <span class="sm:hidden">Copiar</span>
                </button>
              </div>

              <transition name="accordion">
                <div
                  v-if="expandedTraveler === traveler.id"
                  :id="`traveler-panel-${traveler.id}`"
                  class="px-4 pb-4 pt-2 space-y-4 border-t border-slate-100"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label :for="`name-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                        Nombre completo <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          :id="`name-${traveler.id}`"
                          v-model="traveler.name"
                          type="text"
                          placeholder="María García"
                          @blur="touchField(traveler.id, 'name')"
                          class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-9 text-sm"
                          :class="[isFieldTouched(traveler.id, 'name') && isFieldValid(traveler, 'name') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'name') && !isFieldValid(traveler, 'name') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'name') && isFieldValid(traveler, 'name')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p v-if="isFieldTouched(traveler.id, 'name') && !isFieldValid(traveler, 'name')" class="text-red-500 text-xs mt-1">Mínimo 3 caracteres</p>
                    </div>

                    <div>
                      <label :for="`id-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
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
                          class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-9 text-sm uppercase"
                          :class="[isFieldTouched(traveler.id, 'idNumber') && isFieldValid(traveler, 'idNumber') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'idNumber') && !isFieldValid(traveler, 'idNumber') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'idNumber') && isFieldValid(traveler, 'idNumber')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p v-if="isFieldTouched(traveler.id, 'idNumber') && !isFieldValid(traveler, 'idNumber')" class="text-red-500 text-xs mt-1">Mínimo 6 caracteres</p>
                    </div>

                    <div>
                      <label :for="`email-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                        Correo electrónico <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          :id="`email-${traveler.id}`"
                          v-model="traveler.email"
                          type="email"
                          placeholder="maria@email.com"
                          @blur="touchField(traveler.id, 'email')"
                          class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-9 text-sm"
                          :class="[isFieldTouched(traveler.id, 'email') && isFieldValid(traveler, 'email') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'email') && !isFieldValid(traveler, 'email') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'email') && isFieldValid(traveler, 'email')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p v-if="isFieldTouched(traveler.id, 'email') && !isFieldValid(traveler, 'email')" class="text-red-500 text-xs mt-1">Correo inválido</p>
                    </div>

                    <div>
                      <label :for="`phone-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                        Teléfono <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          :id="`phone-${traveler.id}`"
                          v-model="traveler.phone"
                          type="tel"
                          placeholder="+52 55 1234 5678"
                          @blur="touchField(traveler.id, 'phone')"
                          class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-9 text-sm"
                          :class="[isFieldTouched(traveler.id, 'phone') && isFieldValid(traveler, 'phone') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'phone') && !isFieldValid(traveler, 'phone') ? 'border-red-300 ring-4 ring-red-50' : '']"
                        />
                        <svg v-if="isFieldTouched(traveler.id, 'phone') && isFieldValid(traveler, 'phone')" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p v-if="isFieldTouched(traveler.id, 'phone') && !isFieldValid(traveler, 'phone')" class="text-red-500 text-xs mt-1">Mínimo 10 dígitos</p>
                    </div>

                    <div>
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
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
                Tienes {{ emergenciaErrorsCount }} {{ emergenciaErrorsCount === 1 ? 'campo por completar' : 'campos por completar' }} en este formulario.
              </p>
            </div>

            <div class="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
              <div class="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <svg class="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto de emergencia</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="emergency-name" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Nombre completo</label>
                <div class="relative">
                  <input
                    id="emergency-name"
                    v-model="emergencyName"
                    type="text"
                    placeholder="Juan García"
                    @blur="emergencyNameTouched = true"
                    class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-9 text-sm"
                    :class="[emergencyNameTouched && emergencyNameValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', emergencyNameTouched && !emergencyNameValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <svg v-if="emergencyNameTouched && emergencyNameValid" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p v-if="emergencyNameTouched && !emergencyNameValid" class="text-red-500 text-xs mt-1">Mínimo 3 caracteres</p>
              </div>

              <div>
                <label for="emergency-phone" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Teléfono</label>
                <div class="relative">
                  <input
                    id="emergency-phone"
                    v-model="emergencyPhone"
                    type="tel"
                    placeholder="+52 55 9876 5432"
                    @blur="emergencyPhoneTouched = true"
                    class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-9 text-sm"
                    :class="[emergencyPhoneTouched && emergencyPhoneValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', emergencyPhoneTouched && !emergencyPhoneValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <svg v-if="emergencyPhoneTouched && emergencyPhoneValid" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p v-if="emergencyPhoneTouched && !emergencyPhoneValid" class="text-red-500 text-xs mt-1">Mínimo 10 dígitos</p>
              </div>

              <div class="md:col-span-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Correo electrónico (opcional)</label>
                <input
                  v-model="emergencyEmail"
                  type="email"
                  placeholder="contacto@email.com"
                  class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none text-sm"
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
                    :class="privacyAccepted ? 'bg-cyan-500 border-cyan-500' : 'bg-white border-slate-300 group-hover:border-cyan-400'"
                  >
                    <svg v-if="privacyAccepted" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-slate-700 leading-relaxed">
                    Acepto las
                    <button
                      type="button"
                      @click.stop="openPrivacyPolicy"
                      class="text-cyan-600 font-semibold underline underline-offset-2 hover:text-cyan-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1 rounded"
                    >
                      políticas de privacidad
                    </button>
                    y el tratamiento de mis datos personales.
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
      <span>{{ activeTab === 0 ? 'Siguiente' : 'Ver coberturas opcionales' }}</span>
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