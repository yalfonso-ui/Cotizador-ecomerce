<script setup>
import { storeToRefs } from 'pinia'
import { useCheckoutStore } from '@/stores/useCheckoutStore.js'
import AppSpinner from './AppSpinner.vue'
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
        class="fixed inset-0 z-[60] bg-white/95 backdrop-blur-md flex items-center justify-center p-4"
        role="alert"
        aria-live="assertive"
        aria-busy="true"
      >
        <div class="text-center space-y-8 max-w-sm">
          <!--
            Logo: momento crítico del flujo (procesamiento de pago). Refuerza
            la identidad de marca mientras el usuario espera. El header del
            GlobalLayout se ve difuminado detrás del overlay, así que este
            logo propio se vuelve el foco visual.
          -->
          <img
            src="@/assets/images/uploads/Logotipo PNG.png"
            alt="Continental Assist"
            class="h-14 md:h-20 w-auto mx-auto opacity-95"
          />

          <!--
            Spinner con marca: aquí SÍ vale la pena usar el GIF.
            Es el momento más importante del flujo (procesamiento del pago).
            El GIF transmite profesionalismo y refuerza la identidad de marca.
            Para usuarios con prefers-reduced-motion, fallback al AppSpinner SVG
            (más sutil, sin animación continua).
          -->
          <div class="relative mx-auto w-32 h-32 md:w-36 md:h-36">
            <img
              :src="spinnerGif"
              alt="Procesando tu pago"
              width="144"
              height="144"
              class="w-32 h-32 md:w-36 md:h-36 object-contain object-center motion-reduce:hidden"
            />
            <AppSpinner
              size="lg"
              class="absolute inset-0 m-auto hidden motion-reduce:block text-[#00184C]"
            />
          </div>
          <div>
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
