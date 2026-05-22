<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['update', 'next'])

const props = defineProps({
  quoteData: Object
})

const name = ref('')
const email = ref('')
const phone = ref('')

const isValid = computed(() => {
  return name.value.trim().length >= 3 &&
    email.value.includes('@') &&
    phone.value.length >= 7
})

function handleContinue() {
  if (isValid.value) {
    emit('update', 'personalData', {
      name: name.value,
      email: email.value,
      phone: phone.value
    })
    emit('next')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Nombre completo</label>
        <input
          v-model="name"
          type="text"
          placeholder="Ej: María García"
          class="w-full h-14 px-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Correo electrónico</label>
        <input
          v-model="email"
          type="email"
          placeholder="Ej: maria@email.com"
          class="w-full h-14 px-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Teléfono</label>
        <input
          v-model="phone"
          type="tel"
          placeholder="Ej: +52 55 1234 5678"
          class="w-full h-14 px-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
        />
      </div>
    </div>

    <button
      @click="handleContinue"
      :disabled="!isValid"
      class="w-full h-14 bg-accent-300 text-primary-500 font-semibold text-lg rounded-xl hover:bg-accent-400 disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-200 shadow-lg shadow-accent/20"
    >
      Continuar
    </button>
  </div>
</template>