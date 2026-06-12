<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import PrivacyPolicyModal from '@/components/ui/PrivacyPolicyModal.vue'
import UpgradesModal from '@/components/ui/UpgradesModal.vue'

const emit = defineEmits(['next'])

const props = defineProps({
  modelValue: Object,
  selectedPlan: { type: String, default: null },
  travelers: { type: [String, Number], default: 'solo' },
  travelersCount: { type: Number, default: 1 }
})

const activeTab = ref(0)
const tabs = ['Titular', 'Emergencia']

const travelers_data = ref([])
const emergencyName = ref('')
const emergencyPhone = ref('')
const emergencyEmail = ref('')
const privacyAccepted = ref(false)

const touched = ref({})
const isPrivacyModalOpen = ref(false)
const isUpgradesModalOpen = ref(false)
const activeUpgradesTravelerId = ref(null)

const getTravelerCount = () => {
  if (typeof props.travelers === 'number') return props.travelers
  const counts = { solo: 1, pareja: 2, familia: 4, grupo: 6 }
  return counts[props.travelers] || props.travelersCount || 1
}

const initTravelers = () => {
  const count = getTravelerCount()
  const existing = travelers_data.value
  const next = []
  for (let i = 0; i < count; i++) {
    if (existing[i]) {
      next.push(existing[i])
    } else {
      next.push({
        id: i + 1,
        name: '',
        idNumber: '',
        email: '',
        phone: '',
        day: '',
        month: '',
        year: '',
        upgrades: []
      })
    }
  }
  travelers_data.value = next
}

onMounted(() => {
  initTravelers()
})

watch(() => [props.travelers, props.travelersCount], () => {
  initTravelers()
})

const calculateAge = (day, month, year) => {
  const d = parseInt(day)
  const m = parseInt(month)
  const y = parseInt(year)
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900) return null
  const today = new Date()
  const birthDate = new Date(y, m - 1, d)
  let age = today.getFullYear() - birthDate.getFullYear()
  const mDiff = today.getMonth() - birthDate.getMonth()
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

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
      return age !== null && age >= 18 && age <= 120
    }
    default: return false
  }
}

const isTravelerValid = (traveler) => {
  return ['name', 'idNumber', 'email', 'phone', 'birthdate'].every(f => isFieldValid(traveler, f))
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

function handleDayInput(traveler, event) {
  traveler.day = event.target.value.replace(/\D/g, '').slice(0, 2)
  if (traveler.day.length === 2) {
    const next = document.getElementById(`month-${traveler.id}`)
    next?.focus()
  }
}

function handleMonthInput(traveler, event) {
  traveler.month = event.target.value.replace(/\D/g, '').slice(0, 2)
  if (traveler.month.length === 2) {
    const next = document.getElementById(`year-${traveler.id}`)
    next?.focus()
  }
}

function handleYearInput(traveler, event) {
  traveler.year = event.target.value.replace(/\D/g, '').slice(0, 4)
}

function openUpgradesModal(travelerId) {
  activeUpgradesTravelerId.value = travelerId
  isUpgradesModalOpen.value = true
}

function handleUpgradesUpdate({ travelerId, upgrades }) {
  const traveler = travelers_data.value.find(t => t.id === travelerId)
  if (traveler) {
    traveler.upgrades = upgrades
  }
}

function getUpgradesCount(travelerId) {
  const traveler = travelers_data.value.find(t => t.id === travelerId)
  return traveler?.upgrades?.length || 0
}

const UPGRADE_PRICES = {
  preexistencias: 18.20,
  deportes: 14.50,
  'futura-mama': 22.00,
  'equipaje-extra': 9.80,
  'cancelacion-flex': 12.40
}

function getUpgradesTotal(travelerId) {
  const traveler = travelers_data.value.find(t => t.id === travelerId)
  if (!traveler?.upgrades) return 0
  return traveler.upgrades.reduce((sum, id) => sum + (UPGRADE_PRICES[id] || 0), 0)
}

function getActiveTraveler() {
  return travelers_data.value.find(t => t.id === activeUpgradesTravelerId.value)
}

function openPrivacyPolicy() {
  isPrivacyModalOpen.value = true
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
    if (canSubmit.value) {
      const personalDataArray = travelers_data.value.map(t => ({
        name: t.name,
        idNumber: t.idNumber,
        email: t.email,
        phone: t.phone,
        birthdate: t.year && t.month && t.day
          ? `${t.year}-${t.month.padStart(2, '0')}-${t.day.padStart(2, '0')}`
          : null,
        upgrades: t.upgrades
      }))
      emit('next', {
        personalData: personalDataArray[0],
        companions: personalDataArray.slice(1),
        emergencyContact: { name: emergencyName.value, phone: emergencyPhone.value, email: emergencyEmail.value },
        privacyAccepted: privacyAccepted.value
      })
    }
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
      <p class="text-xs text-cyan-700 flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Tus datos están seguros. Solo los usaremos para emitir tu asistencia.
      </p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="flex border-b border-slate-200">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="activeTab = index"
          class="flex-1 py-4 px-2 text-sm font-semibold uppercase tracking-wider transition-all relative"
          :class="activeTab === index ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'"
        >
          {{ tab }}
          <div
            v-if="activeTab === index"
            class="absolute bottom-0 left-4 right-4 h-1 bg-cyan-400 rounded-t-full"
          />
        </button>
      </div>

      <div class="p-6">
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 0" key="titular" class="space-y-6">
            <div
              v-for="traveler in travelers_data"
              :key="traveler.id"
              class="space-y-4"
            >
              <div class="pb-3 border-b border-slate-200 space-y-2">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                      <svg class="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Información</p>
                      <h3 class="text-sm font-bold text-slate-700">Viajero {{ traveler.id }}</h3>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  @click="openUpgradesModal(traveler.id)"
                  class="group relative w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs font-semibold rounded-xl transition-all duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1"
                  :class="getUpgradesCount(traveler.id) > 0
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-300'
                    : 'bg-cyan-50/70 hover:bg-cyan-100 border border-dashed border-cyan-300'"
                  :aria-label="`Personalizar coberturas adicionales para Viajero ${traveler.id}`"
                >
                  <div
                    class="flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-transform group-hover:scale-110"
                    :class="getUpgradesCount(traveler.id) > 0 ? 'bg-emerald-500' : 'bg-cyan-500'"
                  >
                    <svg v-if="getUpgradesCount(traveler.id) > 0" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>

                  <div class="flex-1 min-w-0">
                    <p
                      class="font-bold leading-tight"
                      :class="getUpgradesCount(traveler.id) > 0 ? 'text-emerald-900' : 'text-cyan-900'"
                    >
                      <span v-if="getUpgradesCount(traveler.id) > 0">
                        {{ getUpgradesCount(traveler.id) }} cobertura{{ getUpgradesCount(traveler.id) === 1 ? '' : 's' }} extra{{ getUpgradesCount(traveler.id) === 1 ? '' : 's' }}
                      </span>
                      <span v-else>Mejora tu cobertura</span>
                    </p>
                    <p
                      class="text-[10px] font-medium mt-0.5"
                      :class="getUpgradesCount(traveler.id) > 0 ? 'text-emerald-700' : 'text-cyan-700'"
                    >
                      <span v-if="getUpgradesCount(traveler.id) > 0">
                        +${{ getUpgradesTotal(traveler.id).toFixed(2) }} USD · Toca para editar
                      </span>
                      <span v-else>Opcional · Desde $9.80 USD</span>
                    </p>
                  </div>

                  <svg
                    class="w-4 h-4 transition-transform group-hover:translate-x-0.5 shrink-0"
                    :class="getUpgradesCount(traveler.id) > 0 ? 'text-emerald-600' : 'text-cyan-600'"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div>
                <label :for="`name-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Nombre completo <span class="text-red-500" aria-label="obligatorio">*</span>
                </label>
                <div class="relative">
                  <input
                    :id="`name-${traveler.id}`"
                    v-model="traveler.name"
                    type="text"
                    placeholder="Ej: María García"
                    @blur="touchField(traveler.id, 'name')"
                    class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-10"
                    :class="[isFieldTouched(traveler.id, 'name') && isFieldValid(traveler, 'name') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'name') && !isFieldValid(traveler, 'name') ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <div v-if="isFieldTouched(traveler.id, 'name') && isFieldValid(traveler, 'name')" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p v-if="isFieldTouched(traveler.id, 'name') && !isFieldValid(traveler, 'name')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                  Mínimo 3 caracteres
                </p>
              </div>

              <div>
                <label :for="`id-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Identificación / Pasaporte <span class="text-red-500" aria-label="obligatorio">*</span>
                </label>
                <div class="relative">
                  <input
                    :id="`id-${traveler.id}`"
                    :value="traveler.idNumber"
                    @input="handleIdNumberInput(traveler, $event)"
                    @blur="touchField(traveler.id, 'idNumber')"
                    type="text"
                    placeholder="Ej: 12345678 o AB123456"
                    class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-10 uppercase"
                    :class="[isFieldTouched(traveler.id, 'idNumber') && isFieldValid(traveler, 'idNumber') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'idNumber') && !isFieldValid(traveler, 'idNumber') ? 'border-red-300 ring-4 ring-red-50' : '']"
                    maxlength="20"
                  />
                  <div v-if="isFieldTouched(traveler.id, 'idNumber') && isFieldValid(traveler, 'idNumber')" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p v-if="isFieldTouched(traveler.id, 'idNumber') && !isFieldValid(traveler, 'idNumber')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                  Mínimo 6 caracteres alfanuméricos
                </p>
              </div>

              <div>
                <label :for="`email-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Correo electrónico <span class="text-red-500" aria-label="obligatorio">*</span>
                </label>
                <div class="relative">
                  <input
                    :id="`email-${traveler.id}`"
                    v-model="traveler.email"
                    type="email"
                    placeholder="Ej: maria@email.com"
                    @blur="touchField(traveler.id, 'email')"
                    class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-10"
                    :class="[isFieldTouched(traveler.id, 'email') && isFieldValid(traveler, 'email') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'email') && !isFieldValid(traveler, 'email') ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <div v-if="isFieldTouched(traveler.id, 'email') && isFieldValid(traveler, 'email')" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p v-if="isFieldTouched(traveler.id, 'email') && !isFieldValid(traveler, 'email')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                  Ingresa un correo válido
                </p>
              </div>

              <div>
                <label :for="`phone-${traveler.id}`" class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Teléfono <span class="text-red-500" aria-label="obligatorio">*</span>
                </label>
                <div class="relative">
                  <input
                    :id="`phone-${traveler.id}`"
                    v-model="traveler.phone"
                    type="tel"
                    placeholder="Ej: +52 55 1234 5678"
                    @blur="touchField(traveler.id, 'phone')"
                    class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-10"
                    :class="[isFieldTouched(traveler.id, 'phone') && isFieldValid(traveler, 'phone') ? 'border-green-300 bg-green-50/30' : 'border-slate-200', isFieldTouched(traveler.id, 'phone') && !isFieldValid(traveler, 'phone') ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <div v-if="isFieldTouched(traveler.id, 'phone') && isFieldValid(traveler, 'phone')" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p v-if="isFieldTouched(traveler.id, 'phone') && !isFieldValid(traveler, 'phone')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                  Mínimo 10 dígitos
                </p>
              </div>

              <div>
                <fieldset>
                  <legend class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    Fecha de nacimiento (DD/MM/AAAA) <span class="text-red-500" aria-label="obligatorio">*</span>
                  </legend>
                  <div class="flex items-center gap-2">
                    <input
                      :id="`day-${traveler.id}`"
                      :value="traveler.day"
                      @input="handleDayInput(traveler, $event)"
                      @blur="touchField(traveler.id, 'birthdate')"
                      type="text"
                      inputmode="numeric"
                      maxlength="2"
                      placeholder="DD"
                      :aria-label="`Día de nacimiento del Viajero ${traveler.id}`"
                      class="w-14 h-12 text-center bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none text-sm font-semibold"
                      :class="isFieldTouched(traveler.id, 'birthdate') && !isFieldValid(traveler, 'birthdate') ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'"
                    />
                    <span class="text-slate-400" aria-hidden="true">/</span>
                    <input
                      :id="`month-${traveler.id}`"
                      :value="traveler.month"
                      @input="handleMonthInput(traveler, $event)"
                      @blur="touchField(traveler.id, 'birthdate')"
                      type="text"
                      inputmode="numeric"
                      maxlength="2"
                      placeholder="MM"
                      :aria-label="`Mes de nacimiento del Viajero ${traveler.id}`"
                      class="w-14 h-12 text-center bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none text-sm font-semibold"
                      :class="isFieldTouched(traveler.id, 'birthdate') && !isFieldValid(traveler, 'birthdate') ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'"
                    />
                    <span class="text-slate-400" aria-hidden="true">/</span>
                    <input
                      :id="`year-${traveler.id}`"
                      :value="traveler.year"
                      @input="handleYearInput(traveler, $event)"
                      @blur="touchField(traveler.id, 'birthdate')"
                      type="text"
                      inputmode="numeric"
                      maxlength="4"
                      placeholder="AAAA"
                      :aria-label="`Año de nacimiento del Viajero ${traveler.id}`"
                      class="w-20 h-12 text-center bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none text-sm font-semibold"
                      :class="isFieldTouched(traveler.id, 'birthdate') && !isFieldValid(traveler, 'birthdate') ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'"
                    />
                  </div>
                  <p v-if="isFieldTouched(traveler.id, 'birthdate') && calculateAge(traveler.day, traveler.month, traveler.year) !== null && calculateAge(traveler.day, traveler.month, traveler.year) < 18" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                    Debe ser mayor de 18 años
                  </p>
                </fieldset>
              </div>
            </div>
          </div>

          <div v-else key="emergencia" class="space-y-4">
            <div class="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
              <div class="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <svg class="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto de emergencia</h3>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Nombre completo</label>
              <div class="relative">
                <input
                  v-model="emergencyName"
                  type="text"
                  placeholder="Ej: Juan García"
                  @blur="emergencyNameTouched = true"
                  class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-10"
                  :class="[emergencyNameTouched && emergencyNameValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', emergencyNameTouched && !emergencyNameValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                />
                <div v-if="emergencyNameTouched && emergencyNameValid" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p v-if="emergencyNameTouched && !emergencyNameValid" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                Mínimo 3 caracteres
              </p>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Correo electrónico</label>
              <input
                v-model="emergencyEmail"
                type="email"
                placeholder="Ej: contacto@email.com"
                class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none"
              />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Teléfono</label>
              <div class="relative">
                <input
                  v-model="emergencyPhone"
                  type="tel"
                  placeholder="Ej: +52 55 9876 5432"
                  @blur="emergencyPhoneTouched = true"
                  class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-10"
                  :class="[emergencyPhoneTouched && emergencyPhoneValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', emergencyPhoneTouched && !emergencyPhoneValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                />
                <div v-if="emergencyPhoneTouched && emergencyPhoneValid" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p v-if="emergencyPhoneTouched && !emergencyPhoneValid" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                Mínimo 10 dígitos
              </p>
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
                    y el tratamiento de mis datos personales conforme a la normativa vigente.
                    <span class="text-red-500" aria-label="obligatorio">*</span>
                  </p>
                </div>
              </label>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <button
      @click="handleNext"
      :disabled="activeTab === 0 ? !tab0Valid : !canSubmit"
      class="w-full sm:w-auto min-w-[250px] px-8 py-3.5 bg-yellow-400 text-slate-900 font-extrabold rounded-xl hover:bg-yellow-500 transition-all shadow-sm mx-auto block disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <span>{{ activeTab === 0 ? 'Siguiente' : 'Ir al resumen' }}</span>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>

    <PrivacyPolicyModal v-model="isPrivacyModalOpen" />

    <UpgradesModal
      v-model="isUpgradesModalOpen"
      :travelerId="activeUpgradesTravelerId"
      :travelerLabel="getActiveTraveler() ? `Viajero ${getActiveTraveler().id}` : 'Viajero'"
      :selectedUpgrades="getActiveTraveler()?.upgrades || []"
      @update="handleUpgradesUpdate"
    />
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
</style>
