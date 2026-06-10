<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['next'])

const activeTab = ref(0)
const tabs = ['Titular', 'Emergencia']

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

const tab0Valid = computed(() => titularNameValid.value && titularEmailValid.value && titularPhoneValid.value)
const tab1Valid = computed(() => emergencyNameValid.value && emergencyPhoneValid.value)

function handleNext() {
  if (activeTab.value === 0) {
    activeTab.value = 1
  } else {
    emit('next', {
      personalData: { name: titularName.value, email: titularEmail.value, phone: titularPhone.value },
      emergencyContact: { name: emergencyName.value, phone: emergencyPhone.value, email: emergencyEmail.value }
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
        Tus datos están seguros. Solo los usaremos para emitir tu póliza.
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
          <div v-if="activeTab === 0" key="titular" class="space-y-4">
          <div class="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
            <div class="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
              <svg class="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Datos del titular</h3>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Nombre completo</label>
            <div class="relative">
              <input
                v-model="titularName"
                type="text"
                placeholder="Ej: María García"
                @blur="titularNameTouched = true"
                class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-10"
                :class="[titularNameTouched && titularNameValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', titularNameTouched && !titularNameValid ? 'border-red-300 ring-4 ring-red-50' : '']"
              />
              <div v-if="titularNameTouched && titularNameValid" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p v-if="titularNameTouched && !titularNameValid" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
              Mínimo 3 caracteres
            </p>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Correo electrónico</label>
            <div class="relative">
              <input
                v-model="titularEmail"
                type="email"
                placeholder="Ej: maria@email.com"
                @blur="titularEmailTouched = true"
                class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-10"
                :class="[titularEmailTouched && titularEmailValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', titularEmailTouched && !titularEmailValid ? 'border-red-300 ring-4 ring-red-50' : '']"
              />
              <div v-if="titularEmailTouched && titularEmailValid" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p v-if="titularEmailTouched && !titularEmailValid" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
              Ingresa un correo válido
            </p>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Teléfono</label>
            <div class="relative">
              <input
                v-model="titularPhone"
                type="tel"
                placeholder="Ej: +52 55 1234 5678"
                @blur="titularPhoneTouched = true"
                class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-10"
                :class="[titularPhoneTouched && titularPhoneValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', titularPhoneTouched && !titularPhoneValid ? 'border-red-300 ring-4 ring-red-50' : '']"
              />
              <div v-if="titularPhoneTouched && titularPhoneValid" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p v-if="titularPhoneTouched && !titularPhoneValid" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
              Mínimo 10 dígitos
            </p>
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
              class="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none"
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
          </div>
        </transition>
      </div>
    </div>

    <button
      @click="handleNext"
      :disabled="activeTab === 0 ? !tab0Valid : !tab1Valid"
      class="w-full sm:w-auto min-w-[250px] px-8 py-3.5 bg-yellow-400 text-slate-900 font-extrabold rounded-xl hover:bg-yellow-500 transition-all shadow-sm mx-auto block disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <span>{{ activeTab === 0 ? 'Siguiente' : 'Ir al resumen' }}</span>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>
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
