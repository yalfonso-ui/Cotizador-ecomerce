<script setup>
defineProps({
  origin: { type: String, default: 'México' },
  destination: { type: String, default: 'Colombia' },
  durationDays: { type: [Number, String], default: 8 }
})
</script>

<template>
  <div class="relative w-full h-32 md:h-40 rounded-2xl overflow-hidden shadow-sm">
    <img
      src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=400&fit=crop"
      alt=""
      class="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
    />

    <div class="absolute inset-0" style="background: linear-gradient(135deg, #00184C 0%, rgba(0, 24, 76, 0.4) 50%, #00184C 100%);"></div>

    <div class="relative h-full grid grid-cols-3 items-center px-4 md:px-6 text-white">

      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 -rotate-45" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-[10px] uppercase tracking-[0.15em] opacity-70 leading-tight">Sales de</p>
          <p class="text-sm md:text-base font-bold truncate">{{ origin }}</p>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center">
        <div class="flex items-center gap-1 mb-1.5">
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: #F9D35A;"></span>
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: #F9D35A; animation-delay: 0.2s"></span>
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: #F9D35A; animation-delay: 0.4s"></span>
        </div>
        <p class="text-[10px] uppercase tracking-[0.15em] opacity-70 leading-tight">Vas a estar</p>
        <p class="text-sm md:text-base font-bold">{{ durationDays }} días</p>
      </div>

      <div class="flex items-center gap-3 justify-end">
        <div class="text-right min-w-0">
          <p class="text-[10px] uppercase tracking-[0.15em] opacity-70 leading-tight">Vas hacia</p>
          <p class="text-sm md:text-base font-bold truncate">{{ destination }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 rotate-45" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>