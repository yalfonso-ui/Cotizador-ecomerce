<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useModalFocus } from '@/composables/useModalFocus.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'close'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

function close() {
  isOpen.value = false
  emit('close')
}

const { handleKeydown } = useModalFocus(isOpen, close)

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="privacy-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        <div
          class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-title"
        >
          <header class="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 flex-shrink-0">
            <div>
              <h2 id="privacy-title" class="text-xl md:text-2xl font-bold text-slate-900">
                Tu tranquilidad, nuestra prioridad.
              </h2>
              <p class="text-sm text-slate-500 mt-1">
                Última actualización: Enero 2026
              </p>
            </div>
            <button
              type="button"
              @click="close"
              class="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
              aria-label="Cerrar modal de políticas de privacidad"
            >
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">Quién cuida tus datos</h3>
              <p>
                Continental Assist es quien resguarda tus datos personales. Los usamos solo para
                acompañarte en tu viaje, de principio a fin.
              </p>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">Qué información nos confías</h3>
              <p>Para emitir tu asistencia y estar contigo cuando lo necesites, recopilamos:</p>
              <ul class="list-disc list-inside mt-2 space-y-1">
                <li>Tu nombre completo y documento de identidad</li>
                <li>Fecha de nacimiento y edad</li>
                <li>Correo electrónico y teléfono de contacto</li>
                <li>Persona de contacto en caso de emergencia</li>
                <li>Datos del viaje (origen, destino y fechas)</li>
              </ul>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">Para qué los usamos</h3>
              <p>Tus datos nos sirven únicamente para:</p>
              <ul class="list-disc list-inside mt-2 space-y-1">
                <li>Emitir tu póliza y gestionar tu asistencia</li>
                <li>Acompañarte durante tu viaje, estés donde estés</li>
                <li>Cumplir con las obligaciones legales aplicables</li>
                <li>Mantenerte informado sobre tu cobertura</li>
              </ul>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">Cuánto tiempo los guardamos</h3>
              <p>
                Conservamos tus datos el tiempo necesario para brindarte el servicio y,
                luego, durante el plazo legal que correspondan a tus viajes contratados.
              </p>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">Tus derechos</h3>
              <p>Cuando quieras, puedes:</p>
              <ul class="list-disc list-inside mt-2 space-y-1">
                <li>Acceder a tu información</li>
                <li>Corregir datos inexactos</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Oponerte a un uso específico</li>
                <li>Llevar tus datos a otro proveedor</li>
              </ul>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">Cómo los protegemos</h3>
              <p>
                Aplicamos medidas técnicas y organizativas para que tu información esté siempre
                resguardada contra accesos no autorizados.
              </p>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">¿Tienes preguntas?</h3>
              <p>
                Escríbenos a
                <a href="mailto:privacidad@continental-assist.com" class="font-semibold hover:underline" style="color: #00184C;">privacidad@continental-assist.com</a>
                y te respondemos a la brevedad.
              </p>
            </section>
          </div>

          <footer class="flex items-center justify-between gap-3 p-4 md:p-5 border-t border-slate-100 flex-shrink-0" style="background-color: #EDF4F9;">
            <a
              href="https://www.ejemplo.com/politica-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs font-semibold underline underline-offset-2 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2 rounded"
              style="color: #00184C;"
            >
              Lee la política completa
              <svg class="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              type="button"
              @click="close"
              class="relative inline-flex items-center justify-between gap-2 px-5 py-2.5 text-sm font-bold rounded-full shadow-sm transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
              style="background-color: #F9D35A; color: #00184C;"
            >
              <span>Perfecto, gracias</span>
              <span
                class="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 ml-1"
                aria-hidden="true"
                style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300184C' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M7 17L17 7M17 7H8M17 7v9'/%3E%3C/svg%3E&quot;); background-size: 12px 12px; background-repeat: no-repeat; background-position: center;"
              ></span>
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.privacy-modal-enter-active,
.privacy-modal-leave-active {
  transition: opacity 0.25s ease;
}

.privacy-modal-enter-active > div:last-child,
.privacy-modal-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
}

.privacy-modal-enter-from,
.privacy-modal-leave-to {
  opacity: 0;
}

.privacy-modal-enter-from > div:last-child,
.privacy-modal-leave-to > div:last-child {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}
</style>
