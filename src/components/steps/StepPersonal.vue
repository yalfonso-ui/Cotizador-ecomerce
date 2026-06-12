<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import PrivacyPolicyModal from '@/components/ui/PrivacyPolicyModal.vue'

const emit = defineEmits(['next'])

const props = defineProps({
  selectedPlan: {
    type: String,
    default: null
  },
  travelers: {
    type: String,
    default: 'solo'
  },
  travelerAges: {
    type: Array,
    default: () => []
  }
})

const activeTab = ref(0)
const tabs = ['Datos de Viajeros', 'Contacto de Emergencia']

const titularName = ref('')
const titularEmail = ref('')
const titularPhone = ref('')
const titularIdNumber = ref('')
const emergencyName = ref('')
const emergencyPhone = ref('')
const privacyAccepted = ref(false)

const titularNameTouched = ref(false)
const titularEmailTouched = ref(false)
const titularPhoneTouched = ref(false)
const titularIdNumberTouched = ref(false)
const emergencyNameTouched = ref(false)
const emergencyPhoneTouched = ref(false)
const isPrivacyModalOpen = ref(false)

const dayRefs = ref([])
const monthRefs = ref([])
const yearRefs = ref([])

const travelerCount = computed(() => {
  const counts = { solo: 1, pareja: 2, familia: 5, grupo: 6 }
  return counts[props.travelers] || 1
})

const companionCount = computed(() => Math.max(0, travelerCount.value - 1))

const companionNames = ref([])
const birthdates = ref([])
const companionBirthdates = computed(() => birthdates.value.slice(1))

watch(travelerCount, (newCount) => {
  birthdates.value = Array(newCount).fill(null).map(() => ({ day: '', month: '', year: '' }))
  companionNames.value = Array(Math.max(0, newCount - 1)).fill('')
}, { immediate: true })

onMounted(() => {
  setTimeout(() => {
    document.getElementById('titular-name')?.focus()
  }, 100)
})

const titularNameValid = computed(() => titularName.value.trim().length >= 3)
const titularEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(titularEmail.value))
const titularPhoneValid = computed(() => titularPhone.value.replace(/\D/g, '').length >= 10)
const titularIdNumberValid = computed(() => {
  const v = titularIdNumber.value.trim()
  return v.length >= 6 && v.length <= 20 && /^[a-zA-Z0-9]+$/.test(v)
})
const emergencyNameValid = computed(() => emergencyName.value.trim().length >= 3)
const emergencyPhoneValid = computed(() => emergencyPhone.value.replace(/\D/g, '').length >= 10)

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

const titularAge = computed(() => 
  calculateAge(birthdates.value[0]?.day, birthdates.value[0]?.month, birthdates.value[0]?.year)
)

const titularAgeValid = computed(() => {
  const age = titularAge.value
  return age !== null && age >= 18 && age <= 120
})

const birthdatesValid = computed(() => {
  if (birthdates.value.length === 0) return false
  return birthdates.value.every(b => calculateAge(b.day, b.month, b.year) !== null) && titularAgeValid.value
})

const privacyValid = computed(() => privacyAccepted.value === true)

const travelersTabValid = computed(() => {
  if (!titularNameValid.value || !titularEmailValid.value || !titularPhoneValid.value) return false
  if (!titularIdNumberValid.value) return false
  if (!birthdatesValid.value) return false
  const companionsNameValid = companionNames.value.every(n => n.trim().length >= 3)
  return companionsNameValid
})

const emergencyTabValid = computed(() => emergencyNameValid.value && emergencyPhoneValid.value)

const canSubmit = computed(() => travelersTabValid.value && emergencyTabValid.value && privacyValid.value)

const isLastTab = computed(() => activeTab.value === 1)

function handleDayInput(index, event) {
  let value = event.target.value.replace(/\D/g, '').slice(0, 2)
  birthdates.value[index].day = value
  if (value.length === 2) {
    nextTick(() => monthRefs.value[index]?.focus())
  }
}

function handleMonthInput(index, event) {
  let value = event.target.value.replace(/\D/g, '').slice(0, 2)
  birthdates.value[index].month = value
  if (value.length === 2) {
    nextTick(() => yearRefs.value[index]?.focus())
  }
}

function handleYearInput(index, event) {
  let value = event.target.value.replace(/\D/g, '').slice(0, 4)
  birthdates.value[index].year = value
}

function handleIdNumberInput(event) {
  titularIdNumber.value = event.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
}

function openPrivacyPolicy() {
  isPrivacyModalOpen.value = true
}

function handleNext() {
  titularNameTouched.value = true
  titularEmailTouched.value = true
  titularPhoneTouched.value = true
  titularIdNumberTouched.value = true
  emergencyNameTouched.value = true
  emergencyPhoneTouched.value = true

  if (isLastTab.value) {
    if (canSubmit.value) {
      emit('next', {
        personalData: {
          name: titularName.value,
          email: titularEmail.value,
          phone: titularPhone.value,
          idNumber: titularIdNumber.value,
          birthdate: birthdates.value[0] ? `${birthdates.value[0].year}-${birthdates.value[0].month.padStart(2, '0')}-${birthdates.value[0].day.padStart(2, '0')}` : null,
          companions: companionNames.value
        },
        birthdates: birthdates.value,
        emergencyContact: {
          name: emergencyName.value,
          phone: emergencyPhone.value
        },
        privacyAccepted: privacyAccepted.value
      })
    }
  } else {
    if (travelersTabValid.value) {
      activeTab.value = 1
    }
  }
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="selectedPlan" class="bg-gradient-to-r from-[#00184C] to-[#0B1A3D] rounded-xl p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-yellow-400/20 flex items-center justify-center">
          <span class="text-lg">🛡️</span>
        </div>
        <div>
          <p class="text-xs text-cyan-400 uppercase tracking-wide">Plan seleccionado</p>
          <p class="text-white font-semibold">{{ selectedPlan }}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-2xl font-bold text-yellow-400">${{ travelerAges.length > 0 ? (travelerAges.length * 25) : '?' }}</p>
        <p class="text-xs text-gray-400">USD</p>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex border-b border-slate-200 -mx-6 px-6">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="activeTab = index"
          class="pb-3 px-2 text-xs font-semibold uppercase tracking-wider transition-all relative"
          :class="activeTab === index ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'"
        >
          {{ tab }}
          <div
            v-if="activeTab === index"
            class="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-t-full"
          ></div>
        </button>
      </div>

      <div class="pt-4">
        <div v-show="activeTab === 0" class="space-y-5">
          <p class="text-xs text-slate-400 mb-2">Información del titular</p>

          <div class="bg-slate-50 rounded-xl p-4 space-y-4">
            <p class="text-sm font-semibold text-slate-700">Titular</p>
            <div>
              <label for="titular-name" class="block text-xs text-slate-500 mb-2">
                Nombre completo <span class="text-red-500" aria-label="obligatorio">*</span>
              </label>
              <input
                id="titular-name"
                v-model="titularName"
                type="text"
                placeholder="Ej: María García"
                :aria-invalid="titularNameTouched && !titularNameValid"
                :aria-describedby="titularNameTouched && !titularNameValid ? 'titular-name-error' : undefined"
                @blur="titularNameTouched = true"
                class="w-full h-12 px-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                :class="titularNameTouched && !titularNameValid ? 'border-red-400' : 'border-slate-200'"
              />
              <p v-if="titularNameTouched && !titularNameValid" id="titular-name-error" class="text-red-500 text-xs mt-1" role="alert">Mínimo 3 caracteres</p>
            </div>
            <div>
              <label for="titular-id" class="block text-xs text-slate-500 mb-2">
                Identificación / Pasaporte <span class="text-red-500" aria-label="obligatorio">*</span>
              </label>
              <input
                id="titular-id"
                v-model="titularIdNumber"
                type="text"
                placeholder="Ej: 12345678 o AB123456"
                :aria-invalid="titularIdNumberTouched && !titularIdNumberValid"
                :aria-describedby="titularIdNumberTouched && !titularIdNumberValid ? 'titular-id-error' : undefined"
                @input="handleIdNumberInput"
                @blur="titularIdNumberTouched = true"
                class="w-full h-12 px-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all uppercase"
                :class="titularIdNumberTouched && !titularIdNumberValid ? 'border-red-400' : 'border-slate-200'"
                maxlength="20"
              />
              <p v-if="titularIdNumberTouched && !titularIdNumberValid" id="titular-id-error" class="text-red-500 text-xs mt-1" role="alert">
                Mínimo 6 caracteres alfanuméricos
              </p>
            </div>
            <div>
              <label for="titular-email" class="block text-xs text-slate-500 mb-2">
                Correo electrónico <span class="text-red-500" aria-label="obligatorio">*</span>
              </label>
              <input
                id="titular-email"
                v-model="titularEmail"
                type="email"
                placeholder="Ej: maria@email.com"
                :aria-invalid="titularEmailTouched && !titularEmailValid"
                :aria-describedby="titularEmailTouched && !titularEmailValid ? 'titular-email-error' : undefined"
                @blur="titularEmailTouched = true"
                class="w-full h-12 px-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                :class="titularEmailTouched && !titularEmailValid ? 'border-red-400' : 'border-slate-200'"
              />
              <p v-if="titularEmailTouched && !titularEmailValid" id="titular-email-error" class="text-red-500 text-xs mt-1" role="alert">Ingresa un correo válido</p>
            </div>
            <div>
              <label for="titular-phone" class="block text-xs text-slate-500 mb-2">
                Teléfono <span class="text-red-500" aria-label="obligatorio">*</span>
              </label>
              <input
                id="titular-phone"
                v-model="titularPhone"
                type="tel"
                placeholder="Ej: +52 55 1234 5678"
                :aria-invalid="titularPhoneTouched && !titularPhoneValid"
                :aria-describedby="titularPhoneTouched && !titularPhoneValid ? 'titular-phone-error' : undefined"
                @blur="titularPhoneTouched = true"
                class="w-full h-12 px-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                :class="titularPhoneTouched && !titularPhoneValid ? 'border-red-400' : 'border-slate-200'"
              />
              <p v-if="titularPhoneTouched && !titularPhoneValid" id="titular-phone-error" class="text-red-500 text-xs mt-1" role="alert">Mínimo 10 dígitos</p>
            </div>
            <div>
              <fieldset>
                <legend class="block text-xs text-slate-500 mb-2">
                  Fecha de nacimiento (DD/MM/AAAA) <span class="text-red-500" aria-label="obligatorio">*</span>
                </legend>
                <div class="flex items-center gap-2">
                  <input
                    :ref="el => { if (el) dayRefs[0] = el }"
                    :value="birthdates[0]?.day"
                    @input="handleDayInput(0, $event)"
                    type="text"
                    inputmode="numeric"
                    maxlength="2"
                    placeholder="DD"
                    aria-label="Día de nacimiento"
                    :aria-invalid="birthdates[0]?.day && !titularAgeValid"
                    class="w-14 h-10 text-center bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                    :class="birthdates[0]?.day && !titularAgeValid ? 'border-red-400' : 'border-slate-200'"
                  />
                  <span class="text-slate-400" aria-hidden="true">/</span>
                  <input
                    :ref="el => { if (el) monthRefs[0] = el }"
                    :value="birthdates[0]?.month"
                    @input="handleMonthInput(0, $event)"
                    type="text"
                    inputmode="numeric"
                    maxlength="2"
                    placeholder="MM"
                    aria-label="Mes de nacimiento"
                    :aria-invalid="birthdates[0]?.month && !titularAgeValid"
                    class="w-14 h-10 text-center bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                    :class="birthdates[0]?.month && !titularAgeValid ? 'border-red-400' : 'border-slate-200'"
                  />
                  <span class="text-slate-400" aria-hidden="true">/</span>
                  <input
                    :ref="el => { if (el) yearRefs[0] = el }"
                    :value="birthdates[0]?.year"
                    @input="handleYearInput(0, $event)"
                    type="text"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="AAAA"
                    aria-label="Año de nacimiento"
                    :aria-invalid="birthdates[0]?.year && !titularAgeValid"
                    class="w-18 h-10 text-center bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                    :class="birthdates[0]?.year && !titularAgeValid ? 'border-red-400' : 'border-slate-200'"
                  />
                </div>
                <p v-if="titularAge !== null && titularAge < 18" class="text-red-500 text-xs mt-1" role="alert">
                  Debes ser mayor de 18 años para contratar este seguro
                </p>
                <p v-else-if="titularAge !== null && titularAge > 120" class="text-red-500 text-xs mt-1" role="alert">
                  Fecha de nacimiento inválida
                </p>
              </fieldset>
            </div>
          </div>

          <div v-if="companionCount > 0" class="space-y-4">
            <p class="text-xs text-slate-400 mb-2">Acompañantes</p>
            <div
              v-for="(_, index) in companionCount"
              :key="index"
              class="bg-slate-50 rounded-xl p-4 space-y-4"
            >
              <p class="text-sm font-semibold text-slate-700">Viajero {{ index + 2 }}</p>
              <div>
                <label :for="`companion-name-${index}`" class="block text-xs text-slate-500 mb-2">Nombre completo</label>
                <input
                  :id="`companion-name-${index}`"
                  v-model="companionNames[index]"
                  type="text"
                  :placeholder="`Ej: Viajero ${index + 2}`"
                  class="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-2">Fecha de nacimiento (DD/MM/AAAA)</label>
                <div class="flex items-center gap-2">
                  <input
                    :ref="el => { if (el) dayRefs[index + 1] = el }"
                    :value="birthdates[index + 1]?.day"
                    @input="handleDayInput(index + 1, $event)"
                    type="text"
                    inputmode="numeric"
                    maxlength="2"
                    placeholder="DD"
                    :aria-label="`Día de nacimiento del viajero ${index + 2}`"
                    class="w-14 h-10 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                  />
                  <span class="text-slate-400" aria-hidden="true">/</span>
                  <input
                    :ref="el => { if (el) monthRefs[index + 1] = el }"
                    :value="birthdates[index + 1]?.month"
                    @input="handleMonthInput(index + 1, $event)"
                    type="text"
                    inputmode="numeric"
                    maxlength="2"
                    placeholder="MM"
                    :aria-label="`Mes de nacimiento del viajero ${index + 2}`"
                    class="w-14 h-10 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                  />
                  <span class="text-slate-400" aria-hidden="true">/</span>
                  <input
                    :ref="el => { if (el) yearRefs[index + 1] = el }"
                    :value="birthdates[index + 1]?.year"
                    @input="handleYearInput(index + 1, $event)"
                    type="text"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="AAAA"
                    :aria-label="`Año de nacimiento del viajero ${index + 2}`"
                    class="w-18 h-10 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-show="activeTab === 1" class="space-y-4">
          <p class="text-xs text-slate-400 mb-4">A quién contactamos en caso de emergencia</p>
          <div>
            <label for="emergency-name" class="block text-xs text-slate-500 mb-2">Nombre completo</label>
            <input
              id="emergency-name"
              v-model="emergencyName"
              type="text"
              placeholder="Ej: Juan García"
              @blur="emergencyNameTouched = true"
              class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
            <p v-if="emergencyNameTouched && !emergencyNameValid" class="text-red-500 text-xs mt-1">Mínimo 3 caracteres</p>
          </div>
          <div>
            <label for="emergency-phone" class="block text-xs text-slate-500 mb-2">Teléfono</label>
            <input
              id="emergency-phone"
              v-model="emergencyPhone"
              type="tel"
              placeholder="Ej: +52 55 9876 5432"
              @blur="emergencyPhoneTouched = true"
              class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
            <p v-if="emergencyPhoneTouched && !emergencyPhoneValid" class="text-red-500 text-xs mt-1">Mínimo 10 dígitos</p>
          </div>
        </div>
      </div>
    </div>

    <div v-show="isLastTab" class="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
      <label class="flex items-start gap-3 cursor-pointer group">
        <div class="relative flex items-center justify-center mt-0.5">
          <input
            v-model="privacyAccepted"
            type="checkbox"
            class="peer sr-only"
            aria-describedby="privacy-description"
          />
          <div class="w-5 h-5 rounded border-2 transition-all flex items-center justify-center"
            :class="privacyAccepted 
              ? 'bg-cyan-500 border-cyan-500' 
              : 'bg-white border-slate-300 group-hover:border-cyan-400'">
            <svg v-if="privacyAccepted" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div id="privacy-description" class="flex-1">
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

    <button
      @click="handleNext"
      :disabled="isLastTab ? !canSubmit : !travelersTabValid"
      class="w-full h-14 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-slate-900 disabled:text-gray-400 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
    >
      <span>{{ isLastTab ? 'Continuar al Resumen' : 'Siguiente' }}</span>
      <svg v-if="!isLastTab" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>

    <PrivacyPolicyModal v-model="isPrivacyModalOpen" />
  </div>
</template>
