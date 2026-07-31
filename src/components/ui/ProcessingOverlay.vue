<script setup>
import { storeToRefs } from 'pinia'
import { useCheckoutStore } from '@/stores/useCheckoutStore.js'
import spinnerGif from '@/assets/images/spinner/spinner.gif'

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
            Spinner: GIF corporativo en src/assets/images/spinner/spinner.gif
            El fondo del overlay es 100% opaco (bg-white) para que no se
            transparente el header que vive detrás.
          -->
          <div class="flex justify-center">
            <img
              :src="spinnerGif"
              alt="Procesando tu pago"
              class="h-16 md:h-20 w-auto"
            />
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
