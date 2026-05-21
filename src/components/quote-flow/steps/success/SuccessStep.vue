<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  policyNumber: {
    type: String,
    default: 'CA-2026-XXXXXX'
  },
  email: {
    type: String,
    default: ''
  }
})

const showConfetti = ref(false)
const showContent = ref(false)

onMounted(() => {
  setTimeout(() => {
    showContent.value = true
  }, 300)
  
  setTimeout(() => {
    showConfetti.value = true
  }, 800)
})

function copyPolicyNumber() {
  navigator.clipboard.writeText(props.policyNumber)
}
</script>

<template>
  <div class="space-y-6 text-center">
    <div class="relative">
      <div 
        class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6"
        :class="{ 'animate-bounce': showContent }"
      >
        <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div v-if="showConfetti" class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span class="absolute w-3 h-3 bg-yellow-400 rounded-full animate-ping" style="animation-delay: 0s; top: -50px; left: -30px;"></span>
          <span class="absolute w-3 h-3 bg-blue-400 rounded-full animate-ping" style="animation-delay: 0.2s; top: -40px; left: 40px;"></span>
          <span class="absolute w-3 h-3 bg-green-400 rounded-full animate-ping" style="animation-delay: 0.4s; top: 20px; left: -50px;"></span>
          <span class="absolute w-3 h-3 bg-pink-400 rounded-full animate-ping" style="animation-delay: 0.6s; top: 30px; left: 50px;"></span>
          <span class="absolute w-3 h-3 bg-purple-400 rounded-full animate-ping" style="animation-delay: 0.8s; top: -20px; left: 0px;"></span>
        </div>
      </div>
    </div>

    <div>
      <h2 class="font-heading text-3xl md:text-4xl font-semibold text-[#00184C] mb-2">
        ¡Felicidades! 🎉
      </h2>
      <p class="text-gray-600 text-lg">
        Tu aventura está protegida
      </p>
    </div>

    <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
      <div>
        <p class="text-sm text-gray-500 mb-1">Número de póliza</p>
        <div class="flex items-center justify-center gap-2">
          <span class="text-2xl font-bold font-mono text-[#00184C]">
            {{ policyNumber }}
          </span>
          <button 
            @click="copyPolicyNumber"
            class="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            title="Copiar"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div class="border-t border-gray-200 pt-4">
        <p class="text-sm text-gray-500 mb-1">Confirmación enviada a</p>
        <p class="font-semibold text-[#00184C]">{{ email }}</p>
      </div>
    </div>

    <div class="bg-[#43D3FF]/10 rounded-xl p-4">
      <div class="flex items-center justify-center gap-2 text-[#00184C]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span class="text-sm font-medium">Revisa tu email para descargar tu credencial</span>
      </div>
    </div>

    <div class="pt-4">
      <button
        class="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 bg-[#00184C] text-white hover:bg-[#00133D]"
      >
        Descargar credencial PDF
      </button>
    </div>

    <p class="text-xs text-gray-400">
      ¿Necesitas ayuda? Escríbenos a <span class="text-[#43D3FF]">soporte@continentalassist.com</span>
    </p>
  </div>
</template>