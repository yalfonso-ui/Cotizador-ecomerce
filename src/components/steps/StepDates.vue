<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'
import { CATEGORY_DATE_BOUNDS } from '@/composables/useWizardSteps.js'
import { useHaptic } from '@/composables/useHaptic.js'
import { useWizardStore } from '@/stores/useWizardStore.js'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'

const emit = defineEmits(['next', 'go-to-step'])

const wizardStore = useWizardStore()
const { formData } = storeToRefs(wizardStore)
const haptic = useHaptic()

const calendarRef = ref(null)
const isConfirming = ref(false)
const justCompleted = ref(false) // Para animación de confirmación

// Extraer fechas guardadas del store (restauración al navegar/volver)
const savedStart = formData.value.dates?.start
  ? new Date(formData.value.dates.start)
  : null
const savedEnd = formData.value.dates?.end
  ? new Date(formData.value.dates.end)
  : null

const dateRange = ref(
  savedStart && savedEnd ? [savedStart, savedEnd] : []
)

const isValid = computed(() => Array.isArray(dateRange.value) && !!dateRange.value[0] && !!dateRange.value[1])

// Datos de la categoría seleccionada
const categoryData = computed(() => {
  const cat = formData.value.travelCategory
  const catInfo = {
    short_trips: { name: 'Viajes Cortos', coverage: '3 y 120 días' },
    long_stays: { name: 'Largas Estadías', coverage: '60 y 365 días' },
    students: { name: 'Estudiantes', coverage: '15 y 365 días' },
    annual_multitrip: { name: 'Anuales Multiviajes', coverage: '30, 60 y 90 días' }
  }
  return cat ? (catInfo[cat] || null) : null
})

// Límites de días según la categoría
const categoryBounds = computed(() => {
  const cat = formData.value.travelCategory
  if (!cat || !CATEGORY_DATE_BOUNDS[cat]) {
    return { minDays: 1, maxDays: 365, hasLimits: false }
  }
  return { ...CATEGORY_DATE_BOUNDS[cat], hasLimits: true }
})

const tripDays = computed(() => {
  if (!isValid.value) return 0
  const [start, end] = dateRange.value
  if (!start || !end) return 0
  const normalize = (d) => {
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    return date
  }
  const dateSalida = normalize(start)
  const dateRegreso = normalize(end)
  const diffTime = Math.abs(dateRegreso.getTime() - dateSalida.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const isWithinBounds = computed(() => {
  if (!categoryBounds.value.hasLimits) return true
  const days = tripDays.value
  return days >= categoryBounds.value.minDays && days <= categoryBounds.value.maxDays
})

const boundsError = computed(() => {
  if (!isValid.value) return null
  if (isWithinBounds.value) return null
  const { minDays, maxDays } = categoryBounds.value
  if (tripDays.value < minDays) {
    return `Mínimo ${minDays} días`
  }
  if (tripDays.value > maxDays) {
    return `Máximo ${maxDays} días`
  }
  return null
})

// Hint de bounds para mostrar debajo del calendario
const boundsHint = computed(() => {
  if (!categoryBounds.value.hasLimits) return null
  const { minDays, maxDays } = categoryBounds.value
  return `${minDays} a ${maxDays} días`
})

// Formatear fecha corta (ej: "08 oct 2026")
function formatShortDate(date) {
  if (!date) return ''
  const d = String(date.getDate()).padStart(2, '0')
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const m = months[date.getMonth()]
  const y = date.getFullYear()
  return `${d} ${m} ${y}`
}

const dateRangeDisplay = computed(() => {
  if (!isValid.value || !dateRange.value[0] || !dateRange.value[1]) return ''
  return `${formatShortDate(dateRange.value[0])} – ${formatShortDate(dateRange.value[1])}`
})

function onDateChange(value) {
  dateRange.value = value || []
  justCompleted.value = false
}

function clearDates() {
  haptic.tap()
  dateRange.value = []
  justCompleted.value = false
  calendarRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// Animar cuando se completa el rango
watch(isValid, (newVal) => {
  if (newVal) {
    justCompleted.value = true
    setTimeout(() => { justCompleted.value = false }, 600)
  }
})

function onRangeCommitted() {
  // No auto-advance
}

function goToCategory() {
  emit('go-to-step', 1)
}

function scrollToCalendar() {
  calendarRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleContinue() {
  if (!isValid.value || !isWithinBounds.value || isConfirming.value) return
  haptic.success()
  isConfirming.value = true
  const [start, end] = dateRange.value
  const payload = {
    dates: {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    },
    tripDuration: tripDays.value
  }
  setTimeout(() => {
    isConfirming.value = false
    emit('next', payload)
  }, 300)
}
</script>

<template>
  <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-40 md:pb-44">
    <!-- Header -->
    <div class="text-center mb-5">
      <span class="ds-eyebrow">Marca las</span>
      <h1 class="ds-heading-1">Fechas de tu<span style="color: #43D3FF;"> viaje</span></h1>
    </div>

    <!-- Barra de categoría compacta: una sola línea en mobile -->
    <div v-if="categoryData" class="flex justify-center mb-4">
      <div
        class="inline-flex items-center gap-2 max-w-sm w-full bg-white border border-slate-200 rounded-full px-3 py-2 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors group"
        @click="goToCategory"
        role="button"
        :aria-label="`Categoría: ${categoryData.name}. Toca para cambiar.`"
      >
        <!-- Icono pequeño -->
        <span class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style="background-color: #00184C;">
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </span>

        <!-- Texto compacto: categoría + cobertura en una línea cuando cabe -->
        <span class="flex-1 min-w-0 text-center">
          <span class="text-xs font-bold uppercase tracking-wide" style="color: #00184C;">{{ categoryData.name }}</span>
          <span class="text-xs text-slate-400 mx-1.5">·</span>
          <span class="text-xs text-slate-500">{{ categoryData.coverage }}</span>
        </span>

        <!-- Editar icono -->
        <span class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#00184C] group-hover:bg-[#00184C]/8 transition-all">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </span>
      </div>
    </div>

    <!-- Botón prominente: Cambiar categoría (visible cuando hay error de bounds) -->
    <Transition name="bounds-error-enter">
      <div
        v-if="boundsError"
        class="flex justify-center mb-4"
      >
        <button
          type="button"
          @click="goToCategory"
          class="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#00184C] bg-[#F9D35A] hover:bg-[#f0c847] rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
          aria-label="Cambiar categoría de viaje"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          <span>Cambiar categoría</span>
          <svg class="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Calendario -->
    <div ref="calendarRef" class="mb-4 flex justify-center">
      <div class="w-full max-w-3xl">
        <DateRangePicker
          :modelValue="dateRange"
          :always-open="true"
          @update:modelValue="onDateChange"
          @change="onRangeCommitted"
        />
        <!-- Hint de bounds (recordatorio de días válidos) -->
        <div
          v-if="categoryData"
          class="flex items-center justify-center gap-1.5 mt-2"
        >
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-[11px] text-slate-400">
            Para <span class="font-medium text-slate-600">{{ categoryData.name }}</span> necesitas <span class="font-medium text-slate-700">{{ boundsHint }}</span>
        </span>
        </div>
      </div>
    </div>

    <!--
      Barra de resumen unificada inferior (STICKY en mobile y desktop).
      - Sticky para que el usuario nunca pierda el CTA ni la referencia de su selección.
      - Backdrop blur + gradiente para que el contenido scrolleado detrás no choque visualmente.
      - Padding bottom extra para respetar safe-area en iOS.
      - Layout VERTICAL (2 filas) cuando hay boundsError para evitar que los textos se corten.
    -->
    <div class="sticky bottom-0 left-0 right-0 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white/95 to-white/0 backdrop-blur-sm">
      <div
        class="w-full max-w-3xl mx-auto bg-white border rounded-2xl px-4 transition-all duration-300 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]"
        :class="[
          isValid
            ? (isWithinBounds ? 'border-emerald-200 shadow-sm' : 'border-red-300')
            : 'border-slate-200',
          justCompleted ? 'ring-2 ring-[#43D3FF] shadow-md' : '',
          !isValid ? 'opacity-60' : '',
          // Padding adaptativo según contexto
          boundsError ? 'py-2.5' : 'py-3'
        ]"
      >
        <!-- Validando -->
        <div v-if="isConfirming" class="flex items-center gap-2">
          <AppSpinner size="sm" class="text-cyan-700" />
          <span class="text-sm text-slate-600">Validando…</span>
        </div>

        <!-- Contenido principal (cuando hay fechas) -->
        <template v-else-if="isValid">
          <!-- Fila 1: fechas + limpiar + pastilla días + continuar -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                :class="isWithinBounds ? 'bg-emerald-100' : 'bg-red-100'"
              >
                <svg
                  class="w-4 h-4"
                  :class="isWithinBounds ? 'text-emerald-600' : 'text-red-500'"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-sm font-semibold text-slate-800 truncate">{{ dateRangeDisplay }}</span>

              <!-- Botón limpiar fechas -->
              <button
                type="button"
                @click.stop="clearDates"
                class="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                aria-label="Limpiar fechas seleccionadas"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Pastilla días + Continuar -->
            <div class="flex items-center gap-2 shrink-0">
              <div
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all"
                :class="boundsError
                  ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
                  : 'bg-emerald-50 text-emerald-700'"
              >
                <svg v-if="!boundsError" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ tripDays }} días</span>
              </div>

              <span
                v-if="!boundsError"
                class="text-xs font-medium text-emerald-600 hidden sm:inline"
              >
                ✓ Válido
              </span>
            </div>
          </div>

          <!-- Fila 2: mensaje de error (solo cuando hay boundsError) — full width, sin truncamiento -->
          <div
            v-if="boundsError"
            class="mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl"
            role="alert"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14a1 1 0 00.82-1.573l-7.1-12.25a1 1 0 00-1.64 0L3.18 17.427A1 1 0 004 19z" />
            </svg>
            <span>{{ boundsError }} — elige fechas dentro del rango</span>
          </div>
        </template>

        <!-- Estado inicial (sin fechas) -->
        <div v-else class="flex items-center gap-2 flex-1">
          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="text-sm text-slate-400">Selecciona salida y regreso</span>
        </div>
      </div>

      <!-- Botón Continuar (sticky-bottom separado, debajo del card resumen) -->
      <button
        v-if="!boundsError"
        type="button"
        @click="handleContinue"
        :disabled="!isValid || !isWithinBounds || isConfirming"
        class="mt-2 w-full max-w-3xl mx-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
        :class="isValid && isWithinBounds && !isConfirming
          ? 'hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98]'
          : 'opacity-50 md:opacity-40 cursor-not-allowed'"
        style="background-color: #F9D35A; color: #00184C;"
      >
        <template v-if="isConfirming">
          <AppSpinner size="sm" />
          <span>Validando...</span>
        </template>
        <template v-else>
          <span>Continuar</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </template>
      </button>
    </div>
  </div>
</template>

<style scoped>
.state-fade-enter-active,
.state-fade-leave-active {
  transition: opacity 0.25s ease;
}
.state-fade-enter-from,
.state-fade-leave-to {
  opacity: 0;
}

/* Animación de entrada para el botón de cambiar categoría */
.bounds-error-enter-active {
  transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}
.bounds-error-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
