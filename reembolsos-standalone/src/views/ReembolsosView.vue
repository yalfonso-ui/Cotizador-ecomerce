<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import ReembolsosInfoCard from '@/components/reembolsos/ReembolsosInfoCard.vue'

/**
 * ReembolsosView
 * ─────────────────────────────────────────────────────────────
 * Layout principal del módulo de reembolsos. NO usa el GlobalLayout
 * de la app (ese es para el wizard de cotización).
 *
 * Estructura:
 *   /reembolsos          → 2 columnas (info card + home)
 *   /reembolsos/crear    → 1 columna (solo el wizard, sin info card)
 *   /reembolsos/consultar→ 1 columna (solo el input, sin info card)
 *
 * La info card se oculta en los flujos internos (crear / consultar)
 * para reducir fatiga visual: una vez el usuario ya vio la bienvenida,
 * no necesita el recordatorio constante de los beneficios.
 *
 * El link "Reembolsos" y el selector de idioma están consolidados
 * en el navbar global (GlobalLayout) para mantener una sola barra
 * de navegación sin duplicaciones.
 *
 * Fondo: degradado azul muy suave (coherente con el módulo).
 * Responsive: en mobile siempre 1 columna; en desktop 2 solo en home.
 */

const route = useRoute()

// La info card solo se muestra en la home del módulo
const showInfoCard = computed(() => route.name === 'reembolsos-home')
</script>

<template>
  <div
    class="min-h-screen flex flex-col"
    style="background: linear-gradient(135deg, #EDF4F9 0%, #F7FBFD 50%, #FFFFFF 100%);"
  >
    <!--
      Contenido principal.
      Reglas de layout premium (Apple-like):
        - max-w-6xl + mx-auto → evita que se estire en pantallas grandes
        - Mobile: w-full con px-4 para respiro mínimo
        - Desktop: max-w-6xl con px-6/px-8 para que las tarjetas no
          lleguen a los bordes
        - En home: grid 12 cols (info 4 + acciones 8)
        - En flujos internos: el contenido toma el ancho completo
          (max-w-3xl) para que el form/input no quede demasiado ancho
    -->
    <main class="flex-1 w-full">
      <div
        class="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pt-6 sm:pt-8 lg:pt-10 pb-10 sm:pb-14 lg:pb-16"
      >
        <div
          :class="showInfoCard
            ? 'grid grid-cols-1 lg:grid-cols-12 gap-8'
            : 'flex justify-center'"
        >
          <!-- Columna izquierda: info card (solo en home) — 4/12 -->
          <div
            v-if="showInfoCard"
            class="lg:col-span-4 lg:sticky lg:top-10 lg:self-start"
          >
            <ReembolsosInfoCard />
          </div>

          <!-- Columna derecha: contenido ruteado -->
          <!-- En home ocupa 8/12; en flujos internos se centra con max-w-3xl -->
          <div
            :class="showInfoCard ? 'lg:col-span-8' : 'w-full max-w-3xl'"
          >
            <RouterView v-slot="{ Component }">
              <Transition name="refund-fade" mode="out-in">
                <component :is="Component" />
              </Transition>
            </RouterView>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="w-full py-6 text-center">
      <p class="text-xs text-slate-400">
        Continental Assist · Acompañándote donde estés.
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* Transición entre vistas del módulo (Home → Create → Consult) */
.refund-fade-enter-active,
.refund-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.refund-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.refund-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Respeta prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .refund-fade-enter-active,
  .refund-fade-leave-active {
    transition: none;
  }
}
</style>
