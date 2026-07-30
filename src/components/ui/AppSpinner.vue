<script setup>
defineProps({
  size: { type: String, default: 'md' }
})
</script>

<template>
  <!--
    SVG inline con viewBox 24x24 → siempre proporcional sin importar
    el tamaño de render. El `width`/`height` HTML actúa como red de
    seguridad (intrinsic size) para evitar CLS si las clases de Tailwind
    no se aplican por algún motivo. `shrink-0` evita que se comprima
    dentro de layouts flex.
  -->
  <svg
    class="animate-spin shrink-0 motion-reduce:animate-none"
    :class="{
      'w-3 h-3': size === 'sm',
      'w-4 h-4': size === 'md',
      'w-5 h-5': size === 'lg',
      'w-10 h-10': size === 'xl',
      'w-20 h-20': size === '2xl'
    }"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" stroke-opacity="0.25" />
    <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  </svg>
</template>
