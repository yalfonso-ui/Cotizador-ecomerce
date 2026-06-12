<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'

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

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    close()
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
}

watch(isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
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
                Políticas de Privacidad
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
              <h3 class="text-base font-bold text-slate-900 mb-2">1. Responsable del Tratamiento</h3>
              <p>
                Continental Assist es el responsable del tratamiento de los datos personales que usted nos proporciona
                a través de este sitio web y durante el proceso de cotización y contratación de nuestros servicios.
              </p>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">2. Datos que Recopilamos</h3>
              <p>Para为您提供適切なサービスを提供するため、以下の個人情報を収集します：</p>
              <ul class="list-disc list-inside mt-2 space-y-1">
                <li>Nombre completo y datos de identificación (DNI/Pasaporte)</li>
                <li>Fecha de nacimiento y edad</li>
                <li>Correo electrónico y número de teléfono</li>
                <li>Información de contacto de emergencia</li>
                <li>Datos del viaje (origen, destino, fechas)</li>
              </ul>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">3. Finalidad del Tratamiento</h3>
              <p>Sus datos personales serán utilizados para:</p>
              <ul class="list-disc list-inside mt-2 space-y-1">
                <li>Procesar la cotización y emisión de su póliza de seguro de viaje</li>
                <li>Gestionar la asistencia durante su viaje</li>
                <li>Cumplir con obligaciones legales y regulatorsias</li>
                <li>Enviar comunicaciones relacionadas con su seguro</li>
              </ul>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">4. Conservación de los Datos</h3>
              <p>
                Conservaremos sus datos personales durante el tiempo necesario para cumplir con las finalidades
                para las que fueron recabados y, posteriormente, durante el plazo legal de prescripción de las
                obligaciones que puedan derivarse de la relación contractual.
              </p>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">5. Sus Derechos</h3>
              <p>Usted tiene derecho a:</p>
              <ul class="list-disc list-inside mt-2 space-y-1">
                <li>Acceder a sus datos personales</li>
                <li>Rectificar datos inexactos</li>
                <li>Solicitar la supresión de sus datos</li>
                <li>Oponerse al tratamiento</li>
                <li>Solicitar la portabilidad de sus datos</li>
              </ul>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">6. Seguridad</h3>
              <p>
                Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales
                contra el acceso no autorizado, la alteración, divulgación o destrucción.
              </p>
            </section>

            <section>
              <h3 class="text-base font-bold text-slate-900 mb-2">7. Contacto</h3>
              <p>
                Para cualquier consulta sobre el tratamiento de sus datos personales, puede contactarnos a través
                de: <a href="mailto:privacidad@continental-assist.com" class="text-cyan-600 font-semibold hover:underline">privacidad@continental-assist.com</a>
              </p>
            </section>
          </div>

          <footer class="flex items-center justify-end gap-3 p-4 md:p-5 border-t border-slate-100 flex-shrink-0 bg-slate-50">
            <button
              type="button"
              @click="close"
              class="px-5 py-2.5 text-sm font-semibold text-white bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
            >
              Entendido
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
