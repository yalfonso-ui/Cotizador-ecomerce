<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['next'])

const titularName = ref('')
const titularEmail = ref('')
const titularPhone = ref('')
const emergencyName = ref('')
const emergencyPhone = ref('')
const emergencyEmail = ref('')

const titularNameTouched = ref(false)
const titularEmailTouched = ref(false)
const titularPhoneTouched = ref(false)
const emergencyNameTouched = ref(false)
const emergencyPhoneTouched = ref(false)

const titularNameValid = computed(() => (titularName.value || '').trim().length >= 3)
const titularEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(titularEmail.value || ''))
const titularPhoneValid = computed(() => (titularPhone.value || '').replace(/\D/g, '').length >= 10)
const emergencyNameValid = computed(() => (emergencyName.value || '').trim().length >= 3)
const emergencyPhoneValid = computed(() => (emergencyPhone.value || '').replace(/\D/g, '').length >= 10)

const isValid = computed(() => {
  return titularNameValid.value && titularEmailValid.value && titularPhoneValid.value &&
    emergencyNameValid.value && emergencyPhoneValid.value
})

function handleContinue() {
  if (isValid.value) {
    emit('next', {
      personalData: {
        name: titularName.value,
        email: titularEmail.value,
        phone: titularPhone.value
      },
      emergencyContact: {
        name: emergencyName.value,
        phone: emergencyPhone.value,
        email: emergencyEmail.value
      }
    })
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
        Tus datos están seguros. Solo los usaremos para emitir tu póliza y asistencia en viaje.
      </p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-4">
      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider">Titular del seguro</h3>
      <div>
        <label class="block text-xs text-slate-500 mb-2">Nombre completo</label>
        <input
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
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-4">
      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider">Contacto de emergencia</h3>
      <p class="text-xs text-slate-400">A quién contactamos en caso de emergencia</p>
      <div>
        <label class="block text-xs text-slate-500 mb-2">Nombre completo</label>
        <input
          v-model="emergencyName"
          type="text"
          placeholder="Ej: Juan García"
          @blur="emergencyNameTouched = true"
          class="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
        />
        <p v-if="emergencyNameTouched && !emergencyNameValid" class="text-red-500 text-xs mt-1">Mínimo 3 caracteres</p>
      </div>
      <div>
        <label class="block text-xs text-slate-500 mb-2">Correo electrónico</label>
        <input
          v-model="emergencyEmail"
          type="email"
          placeholder="Ej: contacto@email.com"
          class="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
        />
      </div>
      <div>
        <label class="block text-xs text-slate-500 mb-2">Teléfono</label>
        <input
          v-model="emergencyPhone"
          type="tel"
          placeholder="Ej: +52 55 9876 5432"
          @blur="emergencyPhoneTouched = true"
          class="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
        />
        <p v-if="emergencyPhoneTouched && !emergencyPhoneValid" class="text-red-500 text-xs mt-1">Mínimo 10 dígitos</p>
      </div>
    </div>

    <button
      @click="handleContinue"
      :disabled="!isValid"
      class="w-full h-14 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-slate-900 disabled:text-gray-400 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
    >
      <span>Ir al plan</span>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>
  </div>
</template>
