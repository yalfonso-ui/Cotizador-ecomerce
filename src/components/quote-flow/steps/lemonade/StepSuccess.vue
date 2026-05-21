<script setup>
defineProps({
  policyNumber: String
})
</script>

<template>
  <div class="text-center space-y-6 py-8">
    <!-- Success Icon -->
    <div class="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
      <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <div>
      <h2 class="text-2xl font-semibold text-[#00184C] mb-2">¡Listo!</h2>
      <p class="text-gray-500">Tu asistencia de viaje está activa</p>
    </div>

    <!-- Policy Number -->
    <div v-if="policyNumber" class="bg-gray-50 rounded-xl p-4">
      <p class="text-sm text-gray-500 mb-1">Número de póliza</p>
      <p class="text-xl font-mono font-bold text-[#00184C]">{{ policyNumber }}</p>
    </div>

    <!-- Info -->
    <div class="space-y-3 text-left bg-blue-50 rounded-xl p-4">
      <p class="text-sm font-medium text-blue-800">¿Qué sigue?</p>
      <ul class="text-sm text-blue-700 space-y-2">
        <li class="flex items-start gap-2">
          <span class="text-blue-500">✓</span>
          Recibirás un correo con los detalles de tu póliza
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500">✓</span>
          Tienes acceso a teleconsulta 24/7
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500">✓</span>
          Descarga tu certificado de cobertura
        </li>
      </ul>
    </div>

    <!-- Actions -->
    <div class="space-y-3 pt-4">
      <a
        href="/"
        class="block w-full h-14 bg-[#00184C] text-white font-semibold text-lg rounded-xl hover:bg-[#00133D] transition-all duration-200 flex items-center justify-center"
      >
        Volver al inicio
      </a>
    </div>
  </div>
</template>