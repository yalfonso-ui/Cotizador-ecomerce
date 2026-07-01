<script setup>
defineProps({
  origin: { type: String, default: 'México' },
  destination: { type: String, default: 'Colombia' },
  durationDays: { type: [Number, String], default: 8 }
})
</script>

<template>
  <div class="relative w-full h-28 md:h-32 rounded-2xl overflow-hidden shadow-sm">
    <img
      src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=400&fit=crop"
      alt=""
      class="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
    />

    <div class="absolute inset-0" style="background: linear-gradient(135deg, #00184C 0%, rgba(0, 24, 76, 0.4) 50%, #00184C 100%);"></div>

    <div class="relative h-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4 px-4 md:px-6 text-white">

      <div class="min-w-0 text-left">
        <p class="text-[9px] uppercase tracking-[0.15em] opacity-70 leading-tight mb-0.5">Sales de</p>
        <p class="text-sm md:text-base font-bold leading-snug break-words line-clamp-2">{{ origin }}</p>
      </div>

      <div class="flex flex-col items-center justify-center px-2 shrink-0">
        <div class="flex items-center gap-1 mb-1">
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: #F9D35A;"></span>
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: #F9D35A; animation-delay: 0.2s"></span>
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: #F9D35A; animation-delay: 0.4s"></span>
        </div>
        <p class="text-[9px] uppercase tracking-[0.15em] opacity-70 leading-tight whitespace-nowrap">Vas a estar</p>
        <p class="text-sm font-bold whitespace-nowrap">{{ durationDays }} días</p>
      </div>

      <div class="min-w-0 text-right">
        <p class="text-[9px] uppercase tracking-[0.15em] opacity-70 leading-tight mb-0.5">Vas hacia</p>
        <p class="text-sm md:text-base font-bold leading-snug break-words line-clamp-2">{{ destination }}</p>
      </div>
    </div>
  </div>
</template>