<script setup>
/**
 * ReembolsosInfoCard
 * ─────────────────────────────────────────────────────────────
 * Tarjeta informativa de la columna izquierda. Se comparte entre
 * todas las vistas del módulo de reembolsos. Contiene:
 *   - Ilustración SVG de línea fina (persona con headset)
 *   - Título de bienvenida
 *   - Lista de beneficios con checks sutiles
 *   - Footer con correo de soporte
 *
 * Estilo: Apple-like, mucho aire, tipografía clara, sin colores
 * saturados. Tarjeta blanca con shadow-sm + border sutil slate-100.
 */
</script>

<template>
  <aside
    class="bg-white rounded-3xl shadow-sm border border-slate-100/70 p-6 sm:p-7 flex flex-col"
    aria-label="Información del módulo de reembolsos"
  >
    <!-- Ilustración: asesor (imagen PNG) -->
    <div class="flex justify-center mb-5">
      <img
        src="@/assets/images/imagenes/Asesor.png"
        alt="Asesor de Continental Assist"
        width="96"
        height="96"
        loading="lazy"
        class="w-24 h-24 object-contain"
      />
    </div>

    <!-- Título de bienvenida -->
    <h1 class="text-lg sm:text-xl font-bold text-[#00184C] leading-tight tracking-tight">
      ¡Hola, bienvenido a nuestro módulo de reembolsos!
    </h1>

    <!-- Descripción -->
    <p class="mt-2 text-sm text-slate-500 leading-relaxed">
      Radica tu solicitud en pocos minutos. Estamos para acompañarte en cada paso.
    </p>

    <!-- Lista de beneficios con checks sutiles — más compacta -->
    <ul class="mt-5 space-y-2.5">
      <li class="flex items-start gap-2.5 text-sm text-slate-600">
        <span
          class="mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full bg-[#43D3FF]/10 flex items-center justify-center"
          aria-hidden="true"
        >
          <svg class="w-2.5 h-2.5 text-[#43D3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span>
          Proceso <strong class="font-semibold text-slate-800">100% en línea</strong>, sin filas ni papeleo.
        </span>
      </li>
      <li class="flex items-start gap-2.5 text-sm text-slate-600">
        <span
          class="mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full bg-[#43D3FF]/10 flex items-center justify-center"
          aria-hidden="true"
        >
          <svg class="w-2.5 h-2.5 text-[#43D3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span>
          Respuesta en <strong class="font-semibold text-slate-800">24 h a 5 días hábiles</strong> según el caso.
        </span>
      </li>
      <li class="flex items-start gap-2.5 text-sm text-slate-600">
        <span
          class="mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full bg-[#43D3FF]/10 flex items-center justify-center"
          aria-hidden="true"
        >
          <svg class="w-2.5 h-2.5 text-[#43D3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span>
          <strong class="font-semibold text-slate-800">Soporte humano</strong> cuando lo necesites.
        </span>
      </li>
    </ul>

    <!-- Footer: correo de soporte (más compacto) -->
    <div
      class="mt-auto pt-5 mt-6 border-t border-slate-100 flex items-center gap-3"
    >
      <span
        class="shrink-0 w-9 h-9 rounded-xl bg-[#00184C] flex items-center justify-center"
        aria-hidden="true"
      >
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </span>
      <div class="min-w-0">
        <p class="text-[11px] text-slate-400 font-medium leading-tight">¿Tienes dudas? Escríbenos</p>
        <a
          href="mailto:reembolsos@continentalassist.com"
          class="block text-sm font-semibold text-[#00184C] hover:text-[#43D3FF] transition-colors duration-200 truncate"
        >
          reembolsos@continentalassist.com
        </a>
      </div>
    </div>
  </aside>
</template>
