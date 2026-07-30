<script setup>
import { storeToRefs } from 'pinia'
import { useCheckoutStore } from '@/stores/useCheckoutStore.js'
import AppSpinner from './AppSpinner.vue'

const checkoutStore = useCheckoutStore()
const { isProcessing, processingStep } = storeToRefs(checkoutStore)
</script>

<template>
  <!-- Teleport a body para que el overlay NO se desmonte al cambiar de ruta.
       Vive en GlobalLayout, así que persiste entre /cotizacion → /confirmacion-pago
       y puede hacer fade-out suave sobre la vista de éxito. -->
  <Teleport to="body">
    <Transition name="processing-fade">
      <div
        v-if="isProcessing"
        class="fixed inset-0 z-[60] bg-white flex items-center justify-center p-4"
        role="alert"
        aria-live="assertive"
        aria-busy="true"
      >
        <div class="flex flex-col items-center space-y-7 max-w-sm">
          <!--
            Logo: momento crítico del flujo (procesamiento de pago). Refuerza
            la identidad de marca mientras el usuario espera.

            Importante: el fondo del overlay es 100% opaco (bg-white) para
            que no se transparente el logo del header que vive detrás. Eso
            elimina el efecto de "dos logos" en pantalla.
          -->
          <img
            src="@/assets/images/uploads/Logotipo PNG.png"
            alt="Continental Assist"
            class="h-12 md:h-16 w-auto"
          />

          <!--
            Spinner limpio: usamos el SVG nativo (AppSpinner) en vez del GIF
            con marca de agua, porque el GIF traía el isotipo "Continental Assist"
            adentro y eso duplicaba visualmente el logo que ya está arriba.
            SVG puro = un solo logo visible en pantalla.
            Para usuarios con prefers-reduced-motion, el animation: spin
            de Tailwind se desactiva automáticamente (configurado en tailwind.config).
          -->
          <div class="flex justify-center">
            <AppSpinner size="2xl" class="text-[#00184C]" />
          </div>
          <div class="text-center">
            <p class="text-lg font-bold text-slate-900">{{ processingStep || 'Procesando…' }}</p>
            <p class="text-xs text-slate-500 mt-2">No cierres esta ventana.</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.processing-fade-enter-active,
.processing-fade-leave-active {
  transition: opacity 0.2s ease;
}
.processing-fade-enter-from,
.processing-fade-leave-to {
  opacity: 0;
}
</style>
