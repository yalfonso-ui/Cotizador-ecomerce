<script setup>
import { ref, computed } from 'vue'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'


const emit = defineEmits(['next', 'prev'])

const dateRange = ref([])
const isConfirming = ref(false)
const isValid = computed(() => Array.isArray(dateRange.value) && !!dateRange.value[0] && !!dateRange.value[1])

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

function onDateChange(value) {
  dateRange.value = value || []
}

// El DateRangePicker emite 'change' cuando el usuario completa un rango
// (al elegir la fecha de regreso). En lugar de avanzar automáticamente,
// dejamos que el usuario revise su selección y confirme con el botón
// "Continuar". Esto evita transiciones accidentales si la persona
// todavía quiere ajustar las fechas.
function onRangeCommitted() {
  // No auto-advance. Solo dejamos isValid en true y el botón aparece.
}

function formatDisplayDate(date) {
  return fmtDate(date)
}

function handleContinue() {
  if (!isValid.value || isConfirming.value) return
  isConfirming.value = true
  const [start, end] = dateRange.value
  const payload = {
    dates: {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    },
    tripDuration: tripDays.value
  }
  // Delay corto para que el usuario perciba la transición ("validando…")
  // y no sienta que el cambio fue instantáneo / accidental.
  setTimeout(() => {
    isConfirming.value = false
    emit('next', payload)
  }, 300)
}
</script>

<template>
  <div class="ds-focus-column space-y-8 pt-6 md:pt-10">
    <!-- StepHeader eliminado -->
    <div class="space-y-2">
      <span class="ds-eyebrow">Marca las</span>
      <h1 class="ds-heading-1">Fechas de tu<span style="color: #43D3FF;"> viaje</span></h1>
    </div>

    <DateRangePicker
      :modelValue="dateRange"
      @update:modelValue="onDateChange"
      @change="onRangeCommitted"
    />

    <!-- Banner de estado: muestra duración O estado de validación -->
    <Transition name="state-fade" mode="out-in">
      <div
        v-if="isConfirming"
        key="validating"
        class="flex items-center justify-center gap-2.5 py-3 px-4 bg-cyan-50/60 border border-cyan-100 rounded-xl"
        role="status"
        aria-live="polite"
      >
        <AppSpinner size="sm" class="text-cyan-700" />
        <span class="text-sm font-semibold text-cyan-900">Validando disponibilidad…</span>
      </div>
      <div
        v-else-if="isValid"
        key="days"
        class="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl"
      >
        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tendrás cobertura para</span>
        <span class="text-base font-black text-slate-900">{{ tripDays }} días</span>
      </div>
      <p v-else key="help" class="ds-helper text-center">
        Elige tu salida y regreso para continuar.
      </p>
    </Transition>

    <!-- Botón explícito de confirmación. Aparece cuando hay un rango
         válido. El usuario decide cuándo continuar, por si quiere
         revisar o ajustar las fechas antes de pasar al siguiente step. -->
    <Transition name="state-fade">
      <div v-if="isValid && !isConfirming" class="flex justify-center pt-2">
        <button
          type="button"
          @click="handleContinue"
          class="bg-[#FFCC00] hover:bg-[#E6B800] text-slate-900 font-semibold text-base flex items-center justify-center gap-2 px-8 py-4 rounded-full transition-all duration-200 ease-out shadow-sm hover:-translate-y-px hover:shadow-md active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] focus-visible:ring-offset-2"
        >
          <span>Continuar con estas fechas</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>
