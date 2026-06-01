<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'

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
const emergencyName = ref('')
const emergencyPhone = ref('')

const titularNameTouched = ref(false)
const titularEmailTouched = ref(false)
const titularPhoneTouched = ref(false)
const emergencyNameTouched = ref(false)
const emergencyPhoneTouched = ref(false)

const dayRefs = ref([])
const monthRefs = ref([])
const yearRefs = ref([])

const travelerCount = computed(() => {
  const counts = { solo: 1, pareja: 2, familia: 5, grupo: 6 }
  return counts[props.travelers] || 1
})

const companionCount = computed(() => Math.max(0, travelerCount.value - 1))

const companionNames = ref([])
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
const emergencyNameValid = computed(() => emergencyName.value.trim().length >= 3)
const emergencyPhoneValid = computed(() => emergencyPhone.value.replace(/\D/g, '').length >= 10)

const birthdatesValid = computed(() => {
  if (birthdates.value.length === 0) return false
  return birthdates.value.every(b => {
    const d = parseInt(b.day)
    const m = parseInt(b.month)
    const y = parseInt(b.year)
    return !isNaN(d) && d >= 1 && d <= 31 &&
           !isNaN(m) && m >= 1 && m <= 12 &&
           !isNaN(y) && y >= 1900 && y <= new Date().getFullYear()
  })
})

const travelersTabValid = computed(() => {
  if (!titularNameValid.value || !titularEmailValid.value || !titularPhoneValid.value || !birthdatesValid.value) return false
  const companionsNameValid = companionNames.value.every(n => n.trim().length >= 3)
  return companionsNameValid
})

const emergencyTabValid = computed(() => emergencyNameValid.value && emergencyPhoneValid.value)

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

function handleNext() {
  if (isLastTab.value) {
    if (emergencyTabValid.value) {
      emit('next', {
        personalData: {
          name: titularName.value,
          email: titularEmail.value,
          phone: titularPhone.value,
          companions: companionNames.value
        },
        birthdates: birthdates.value,
        emergencyContact: {
          name: emergencyName.value,
          phone: emergencyPhone.value
        }
      })
    }
  } else {
    activeTab.value = 1
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
          <p class="text-xs text-slate-400 mb-2">Información del viaje</p>

          <div class="bg-slate-50 rounded-xl p-4 space-y-4">
            <p class="text-sm font-semibold text-slate-700">Titular</p>
            <div>
              <label class="block text-xs text-slate-500 mb-2">Nombre completo</label>
              <input
                id="titular-name"
                v-model="titularName"
                type="text"
                placeholder="Ej: María García"
                @blur="titularNameTouched = true"
                class="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
              <p v-if="titularNameTouched && !titularNameValid" class="text-red-500 text-xs mt-1">Mínimo 3 caracteres</p>
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-2">Correo electrónico</label>
              <input
                v-model="titularEmail"
                type="email"
                placeholder="Ej: maria@email.com"
                @blur="titularEmailTouched = true"
                class="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
              <p v-if="titularEmailTouched && !titularEmailValid" class="text-red-500 text-xs mt-1">Ingresa un correo válido</p>
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-2">Teléfono</label>
              <input
                v-model="titularPhone"
                type="tel"
                placeholder="Ej: +52 55 1234 5678"
                @blur="titularPhoneTouched = true"
                class="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
              <p v-if="titularPhoneTouched && !titularPhoneValid" class="text-red-500 text-xs mt-1">Mínimo 10 dígitos</p>
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-2">Fecha de nacimiento (DD/MM/AAAA)</label>
              <div class="flex items-center gap-2">
                <input
                  :ref="el => { if (el) dayRefs[0] = el }"
                  :value="birthdates[0]?.day"
                  @input="handleDayInput(0, $event)"
                  type="text"
                  inputmode="numeric"
                  maxlength="2"
                  placeholder="DD"
                  class="w-14 h-10 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                />
                <span class="text-slate-400">/</span>
                <input
                  :ref="el => { if (el) monthRefs[0] = el }"
                  :value="birthdates[0]?.month"
                  @input="handleMonthInput(0, $event)"
                  type="text"
                  inputmode="numeric"
                  maxlength="2"
                  placeholder="MM"
                  class="w-14 h-10 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                />
                <span class="text-slate-400">/</span>
                <input
                  :ref="el => { if (el) yearRefs[0] = el }"
                  :value="birthdates[0]?.year"
                  @input="handleYearInput(0, $event)"
                  type="text"
                  inputmode="numeric"
                  maxlength="4"
                  placeholder="AAAA"
                  class="w-18 h-10 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                />
              </div>
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
                <label class="block text-xs text-slate-500 mb-2">Nombre completo</label>
                <input
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
                    class="w-14 h-10 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                  />
                  <span class="text-slate-400">/</span>
                  <input
                    :ref="el => { if (el) monthRefs[index + 1] = el }"
                    :value="birthdates[index + 1]?.month"
                    @input="handleMonthInput(index + 1, $event)"
                    type="text"
                    inputmode="numeric"
                    maxlength="2"
                    placeholder="MM"
                    class="w-14 h-10 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                  />
                  <span class="text-slate-400">/</span>
                  <input
                    :ref="el => { if (el) yearRefs[index + 1] = el }"
                    :value="birthdates[index + 1]?.year"
                    @input="handleYearInput(index + 1, $event)"
                    type="text"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="AAAA"
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
            <label class="block text-xs text-slate-500 mb-2">Nombre completo</label>
            <input
              v-model="emergencyName"
              type="text"
              placeholder="Ej: Juan García"
              @blur="emergencyNameTouched = true"
              class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
            <p v-if="emergencyNameTouched && !emergencyNameValid" class="text-red-500 text-xs mt-1">Mínimo 3 caracteres</p>
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-2">Teléfono</label>
            <input
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

    <button
      @click="handleNext"
      :disabled="activeTab === 0 ? !travelersTabValid : !emergencyTabValid"
      class="w-full h-14 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-slate-900 disabled:text-gray-400 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
    >
      <span>{{ isLastTab ? 'Continuar al Resumen' : 'Siguiente' }}</span>
      <svg v-if="!isLastTab" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>
  </div>
</template>
