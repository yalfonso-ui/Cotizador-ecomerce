<script setup>
const emit = defineEmits(['start'])

function handleStart() {
  emit('start')
}
</script>

<template>
  <div class="min-h-screen relative overflow-hidden" style="background-color: #00184C;">
    <div class="absolute inset-0 z-0">
      <img
        src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&h=1080&fit=crop"
        alt=""
        class="w-full h-full object-cover opacity-40"
      />
      <div class="absolute inset-0" style="background: linear-gradient(135deg, #00184C 0%, #00184C 40%, rgba(0, 24, 76, 0.7) 70%, rgba(0, 24, 76, 0.4) 100%);"></div>
    </div>

    <div class="relative z-10 min-h-screen flex items-center">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border" style="background-color: rgba(67, 211, 255, 0.10); border-color: rgba(67, 211, 255, 0.30);">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: #43D3FF;"></span>
              <span class="relative inline-flex rounded-full h-2 w-2" style="background-color: #43D3FF;"></span>
            </span>
            <span class="text-sm font-medium" style="color: #43D3FF;">Tu respaldo, estés donde estés</span>
          </div>

          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Viaja tranquilo.<br />
            <span style="color: #43D3FF;">Pase lo que pase,</span> te acompañamos.
          </h1>

          <p class="text-lg text-white/85 mb-10 leading-relaxed max-w-xl">
            Asistencia internacional para los momentos que nadie espera.
            Así de simple. Así de rápido.
          </p>

          <button
            type="button"
            @click="handleStart"
            class="inline-flex items-center justify-center gap-2.5 bg-[#F9D35A] text-[#00184C] font-bold text-base md:text-lg px-7 md:px-8 py-3 md:py-3.5 rounded-full transition-all duration-200 ease-out shadow-md hover:-translate-y-px hover:brightness-95 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
          >
            <span>Inicia aquí tu compra</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-current transform rotate-45">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </button>

          <div class="flex flex-wrap gap-6 mt-14">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full flex items-center justify-center border" style="background-color: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15);">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">Aseguradora certificada</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full flex items-center justify-center border" style="background-color: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15);">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">Contigo 24/7</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full flex items-center justify-center border" style="background-color: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15);">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">+500 mil viajeros</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full flex items-center justify-center border" style="background-color: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15);">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" style="color: #F9D35A;">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">4.9/5 de calificación</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 z-10">
      <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
        <path d="M0 60L60 56C120 52 240 44 360 40C480 36 600 36 720 40C840 44 960 52 1080 54C1200 56 1320 52 1380 50L1440 48V60H0Z" fill="#EDF4F9"/>
      </svg>
    </div>
  </div>
</template>