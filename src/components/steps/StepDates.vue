<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'
import { CATEGORY_DATE_BOUNDS } from '@/composables/useWizardSteps.js'
import { useWizardStore } from '@/stores/useWizardStore.js'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'

const emit = defineEmits(['next', 'go-to-step'])

const wizardStore = useWizardStore()
const { formData } = storeToRefs(wizardStore)

const dateRange = ref([])
const calendarRef = ref(null)
const isConfirming = ref(false)
const isValid = computed(() => Array.isArray(dateRange.value) && !!dateRange.value[0] && !!dateRange.value[1])
const justCompleted = ref(false) // Para animación de confirmación

// Datos de la categoría seleccionada
const categoryData = computed(() => {
  const cat = formData.value.travelCategory
  const catInfo = {
    short_trips: { name: 'VIAJES CORTOS', coverage: '3 y 120 días' },
    long_stays: { name: 'LARGAS ESTADÍAS', coverage: '60 y 365 días' },
    students: { name: 'ESTUDIANTES', coverage: '15 y 365 días' },
    annual_multitrip: { name: 'ANUALES MULTIVIAJES', coverage: '30, 60 y 90 días' }
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
  <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-28">
    <!-- Header -->
    <div class="text-center mb-5">
      <span class="ds-eyebrow">Marca las</span>
      <h1 class="ds-heading-1">Fechas de tu<span style="color: #43D3FF;"> viaje</span></h1>
    </div>

    <!-- Barra de categoría compacta -->
    <div v-if="categoryData" class="flex justify-center mb-5">
      <div class="inline-flex items-center max-w-lg w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 gap-3">
        <!-- Icono -->
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background-color: #00184C;">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <!-- Texto centrado -->
        <div class="flex-1 min-w-0 text-center">
          <p class="text-xs font-bold uppercase tracking-wider" style="color: #00184C;">{{ categoryData.name }}</p>
          <p class="text-[11px] text-slate-500">Cobertura {{ categoryData.coverage }}</p>
        </div>

        <!-- Botón CAMBIAR -->
        <button
          type="button"
          @click="goToCategory"
          class="shrink-0 px-3 py-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:text-slate-700 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
        >
          CAMBIAR
        </button>
      </div>
    </div>

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
          v-if="boundsHint"
          class="flex items-center justify-center gap-1.5 mt-2"
        >
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-[11px] text-slate-400">
          Recordatorio: para <span class="font-medium text-slate-500">{{ categoryData?.name }}</span> necesitas <span class="font-medium text-slate-600">{{ boundsHint }}</span>
        </span>
        </div>
      </div>
    </div>

    <!-- Barra de resumen unificada inferior (clickeable para ir al calendario) -->
    <div class="flex justify-center">
      <div
        class="w-full max-w-3xl flex items-center justify-between gap-3 bg-white border rounded-2xl px-4 py-3 transition-all duration-300 cursor-pointer hover:shadow-md"
        :class="[
          isValid
            ? (isWithinBounds ? 'border-emerald-200 shadow-sm' : 'border-red-300')
            : 'border-slate-200',
          justCompleted ? 'ring-2 ring-[#43D3FF] shadow-md' : '',
          !isValid ? 'opacity-60' : ''
        ]"
        @click="scrollToCalendar"
      >
      <!-- Validando -->
      <div v-if="isConfirming" class="flex items-center gap-2">
        <AppSpinner size="sm" class="text-cyan-700" />
        <span class="text-sm text-slate-600">Validando…</span>
      </div>

      <!-- Contenido principal (cuando hay fechas) -->
      <template v-else-if="isValid">
        <!-- Fechas seleccionadas -->
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
        </div>

        <!-- Pastilla de días + validación -->
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
            v-if="boundsError"
            class="text-xs font-medium text-red-500"
          >
            {{ boundsError }}
          </span>
          <span
            v-else
            class="text-xs font-medium text-emerald-600 hidden sm:inline"
          >
            ✓ Válido
          </span>
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

      <!-- Botón Continuar -->
      <button
        type="button"
        @click="handleContinue"
        :disabled="!isValid || !isWithinBounds || isConfirming"
        class="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
        :class="isValid && isWithinBounds && !isConfirming
          ? 'hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]'
          : 'opacity-40 cursor-not-allowed'"
        style="background-color: #F9D35A; color: #00184C;"
      >
        <span>Continuar</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
      </div>
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
</style>
