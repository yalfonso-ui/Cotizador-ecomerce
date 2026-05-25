<script setup>
const emit = defineEmits(['start'])

function handleStart() {
  emit('start')
}
</script>

<template>
  <div class="min-h-screen bg-[#00184C] relative overflow-hidden">
    <div class="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&h=1080&fit=crop" 
        alt="Viajero" 
        class="w-full h-full object-cover" 
      />
      <div class="absolute inset-0 bg-[#00184C]/70"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-[#00184C]/90 via-transparent to-transparent"></div>
    </div>

    <div class="relative z-10 min-h-screen flex items-center">
      <div class="max-w-5xl mx-auto px-6 py-16 w-full">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
            </span>
            <span class="text-white/90 text-sm font-medium">Potenciado con IA</span>
          </div>

          <h1 class="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight">
            Viaja con <span class="text-yellow-400">confianza</span>,<br />
            vuelve con <span class="text-cyan-400">historias</span>
          </h1>

          <p class="text-xl text-white/80 mb-4">
            <strong class="text-yellow-400">¿Sabías que una emergencia médica en EE.UU. puede costar más de $50,000?</strong>
          </p>
          <p class="text-lg text-white/70 mb-8">
            Protege tu aventura desde solo <strong class="text-yellow-400">$25 USD</strong> — menos que tu café diario.
          </p>

          <button
            @click="handleStart"
            class="inline-flex items-center gap-3 bg-yellow-400 text-[#00184C] font-bold px-8 py-4 rounded-xl hover:bg-yellow-500 transition-all duration-200 shadow-lg shadow-yellow-400/30 text-lg"
          >
            <span class="text-xl">✨</span>
            ¡Comenzar ahora!
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <div class="flex flex-wrap gap-6 mt-12">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">Aseguradora</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">24/7</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">+500K</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">4.9/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 z-10">
      <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
        <path d="M0 60L60 56C120 52 240 44 360 40C480 36 600 36 720 40C840 44 960 52 1080 54C1200 56 1320 52 1380 50L1440 48V60H0Z" fill="#f8fafc"/>
      </svg>
    </div>
  </div>
</template>