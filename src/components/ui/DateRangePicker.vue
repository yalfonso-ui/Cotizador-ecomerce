<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  minDate: {
    type: Date,
    default: () => new Date()
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// ── Explicit state machine ──
//   idle         → nothing selected
//   picking-start → user just clicked the first day (Salida set, Regreso null)
//   picking-end  → user is hovering, preview range is visible
//   committed    → both days set, awaiting Confirmar
//   resetting    → TRANSITIONAL: old range fading out before the new start
const STATE = Object.freeze({
  IDLE: 'idle',
  PICKING_START: 'picking-start',
  PICKING_END: 'picking-end',
  COMMITTED: 'committed',
  RESETTING: 'resetting'
})

const isOpen = ref(false)
const containerRef = ref(null)
const startDate = ref(null)
const endDate = ref(null)
const hoveredDate = ref(null)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const phase = ref(STATE.IDLE)
const lastAnnouncement = ref('')
const pulseStartKey = ref(0) // increments to retrigger the pulse animation on the new start

const RESET_MS = 220
let resetTimer = null

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

function normalizeDate(d) {
  if (!d) return null
  const date = d instanceof Date ? new Date(d) : new Date(d)
  date.setHours(0, 0, 0, 0)
  return date
}

function sameDay(a, b) {
  if (!a || !b) return false
  if (typeof a.getDate !== 'function' || typeof b.getDate !== 'function') return false
  return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate()
}

function isBefore(a, b) {
  if (!a || !b) return false
  return a.getTime() < b.getTime()
}

function isBetween(d, start, end) {
  if (!start || !end) return false
  const t = d.getTime()
  return t > start.getTime() && t < end.getTime()
}

function isInRangeOrHovered(d) {
  const start = startDate.value
  const end = endDate.value || hoveredDate.value
  if (!start || !end) return false
  const a = isBefore(start, end) ? start : end
  const b = isBefore(start, end) ? end : start
  return isBetween(d, a, b)
}

function isRangeStart(d) {
  if (!startDate.value) return false
  const end = endDate.value || hoveredDate.value
  if (!end) return false
  const a = isBefore(startDate.value, end) ? startDate.value : end
  return sameDay(d, a)
}

function isRangeEnd(d) {
  if (!startDate.value) return false
  const end = endDate.value || hoveredDate.value
  if (!end) return false
  const b = isBefore(startDate.value, end) ? end : startDate.value
  return sameDay(d, b)
}

function buildCalendar(month, year) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const days = []

  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startWeekday - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false
    })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    })
  }

  return days
}

const firstMonthDays = computed(() => buildCalendar(currentMonth.value, currentYear.value))
const secondMonthDays = computed(() => {
  const nextMonth = currentMonth.value === 11 ? 0 : currentMonth.value + 1
  const nextYear = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value
  return buildCalendar(nextMonth, nextYear)
})

const secondMonthLabel = computed(() => {
  const nextMonth = currentMonth.value === 11 ? 0 : currentMonth.value + 1
  const nextYear = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value
  return `${MONTHS_ES[nextMonth]} ${nextYear}`
})

const firstMonthLabel = computed(() => `${MONTHS_ES[currentMonth.value]} ${currentYear.value}`)

const isMobile = ref(false)
let mql = null

function updateMobile(e) {
  isMobile.value = e.matches
}

function prevMonths() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

function nextMonths() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

function isDisabled(date) {
  const min = normalizeDate(props.minDate)
  return isBefore(date, min)
}

function onDayClick(date) {
  if (isDisabled(date)) return
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  handleDateClick(day, month, year)
}

// ── Derived state machine ──
const currentState = computed(() => {
  if (phase.value === STATE.RESETTING) return STATE.RESETTING
  if (!startDate.value) return STATE.IDLE
  if (endDate.value) return STATE.COMMITTED
  if (hoveredDate.value) return STATE.PICKING_END
  return STATE.PICKING_START
})

function announce(message) {
  lastAnnouncement.value = ''
  // Defer one frame so the live region re-announces even if the value
  // is the same as before (some screen readers skip identical text).
  requestAnimationFrame(() => {
    lastAnnouncement.value = message
  })
}

function clearResetTimer() {
  if (resetTimer) {
    clearTimeout(resetTimer)
    resetTimer = null
  }
}

onBeforeUnmount(clearResetTimer)

function startFreshAt(date) {
  if (resetTimer) clearTimeout(resetTimer)
  phase.value = STATE.RESETTING
  // During RESETTING the visual still shows the OLD range (fading out)
  // while we keep the refs unchanged. The CSS handles the fade.
  resetTimer = setTimeout(() => {
    startDate.value = date
    endDate.value = null
    hoveredDate.value = null
    phase.value = STATE.PICKING_START
    pulseStartKey.value++
    emit('update:modelValue', [date])
    announce(`Selección reiniciada. Nueva salida: ${formatDisplay(date)}. Elige el regreso.`)
    resetTimer = null
  }, RESET_MS)
}

function commitRange(start, end) {
  clearResetTimer()
  startDate.value = start
  endDate.value = end
  hoveredDate.value = null
  phase.value = STATE.COMMITTED
  pulseStartKey.value++
  // El paso de "confirmar fechas" ocurre al elegir el día de regreso.
  // Cerramos el calendario y emitimos el cambio — el consumidor decide
  // si avanzar al siguiente step.
  isOpen.value = false
  emit('update:modelValue', [start, end])
  emit('change', { start, end })
  announce(`Rango confirmado: del ${formatDisplay(start)} al ${formatDisplay(end)}, ${tripDays.value} días.`)
}

const handleDateClick = (day, month, year) => {
  const selectedDate = new Date(year, month, day, 0, 0, 0)

  // CASE 1: no range yet, or a full range is already committed
  // → this click is the new Salida
  if (!startDate.value || endDate.value) {
    // Same-day shortcut: clicking the existing start while committed → 1-day range
    if (endDate.value && startDate.value && sameDay(selectedDate, startDate.value)) {
      commitRange(selectedDate, selectedDate)
      return
    }
    // Clicking within the existing committed range → assign new start directly,
    // skip the RESETTING animation to avoid unnecessary flicker (the range
    // doesn't need to fade out since the new start is inside it).
    if (endDate.value && startDate.value && selectedDate > startDate.value && selectedDate < endDate.value) {
      clearResetTimer()
      startDate.value = selectedDate
      endDate.value = null
      hoveredDate.value = null
      phase.value = STATE.PICKING_START
      pulseStartKey.value++
      emit('update:modelValue', [selectedDate])
      announce(`Nueva salida: ${formatDisplay(selectedDate)}. Elige el regreso.`)
      return
    }
    // Clicking outside (or with no prior range) → animated reset with fade-out
    startFreshAt(selectedDate)
    return
  }

  // CASE 2: only Salida is set (Regreso not yet chosen) and user clicked a LATER day
  if (selectedDate > startDate.value) {
    commitRange(startDate.value, selectedDate)
    return
  }

  // CASE 3: clicked an EARLIER date than the current Salida
  // → discard the previous Salida, this becomes the new one (animated reset)
  if (selectedDate < startDate.value) {
    startFreshAt(selectedDate)
    return
  }

  // CASE 4: clicked the SAME day as the current Salida
  // → single-day range (auto-commit since "Salida = Regreso" is unambiguous)
  commitRange(selectedDate, selectedDate)
}

function onDayHover(date) {
  if (startDate.value && !endDate.value) {
    hoveredDate.value = date
  }
}

function onDayLeave() {
  hoveredDate.value = null
}

function confirmSelection() {
  // Mantenido por retrocompatibilidad con event listeners externos, pero
  // el flujo principal ya no usa el botón. commitRange() cierra el
  // calendario directamente.
  if (!startDate.value || !endDate.value) return
  isOpen.value = false
}

function close() {
  isOpen.value = false
}

function clearSelection(e) {
  if (e && e.stopPropagation) e.stopPropagation()
  clearResetTimer()
  startDate.value = null
  endDate.value = null
  hoveredDate.value = null
  phase.value = STATE.IDLE
  emit('update:modelValue', [])
  announce('Selección limpiada.')
}

function formatDisplay(date) {
  if (!date) return props.placeholder || 'Seleccionar'
  const d = String(date.getDate()).padStart(2, '0')
  const m = MONTHS_ES[date.getMonth()].slice(0, 3).toLowerCase()
  const y = date.getFullYear()
  return `${d} ${m} ${y}`
}

const tripDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  const dateSalida = normalizeDate(startDate.value)
  const dateRegreso = normalizeDate(endDate.value)
  if (!dateSalida || !dateRegreso) return 0
  const diffTime = Math.abs(dateRegreso.getTime() - dateSalida.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const previewDays = computed(() => {
  if (!startDate.value || !hoveredDate.value) return 0
  const dateSalida = normalizeDate(startDate.value)
  const dateHover = normalizeDate(hoveredDate.value)
  if (!dateSalida || !dateHover) return 0
  const diffTime = Math.abs(dateHover.getTime() - dateSalida.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const hasActiveRange = computed(() => {
  if (endDate.value) return true
  if (startDate.value && hoveredDate.value) return true
  return false
})

const displayDays = computed(() => {
  if (tripDays.value > 0) return tripDays.value
  return previewDays.value
})

function dayClass(day) {
  if (!day.isCurrentMonth) {
    return 'text-slate-300 rounded-full'
  }

  if (isDisabled(day.date)) {
    return 'text-slate-300 cursor-not-allowed rounded-full'
  }

  const isStart = isRangeStart(day.date)
  const isEnd = isRangeEnd(day.date)
  const inRange = isInRangeOrHovered(day.date) && !isStart && !isEnd
  const fading = phase.value === STATE.RESETTING

  if (isStart && isEnd) {
    return `bg-[#00184C] text-white font-semibold rounded-full hover:bg-[#43D3FF] hover:text-[#00184C] ${fading ? 'ds-day-fade-out' : ''}`
  }
  if (isStart) {
    return `bg-[#00184C] text-white font-semibold rounded-l-full hover:bg-[#43D3FF] hover:text-[#00184C] ${fading ? 'ds-day-fade-out' : ''}`
  }
  if (isEnd) {
    return `bg-[#00184C] text-white font-semibold rounded-r-full hover:bg-[#43D3FF] hover:text-[#00184C] ${fading ? 'ds-day-fade-out' : ''}`
  }
  if (inRange) {
    return `bg-[#EDF4F9] text-[#00184C] rounded-none hover:bg-[#43D3FF]/30 ${fading ? 'ds-day-fade-out' : ''}`
  }
  return 'text-slate-700 hover:bg-slate-100 rounded-full'
}

// ── Stable key for day buttons ──
// Only the start day gets the pulse key (so Vue remounts JUST that button and
// its CSS animation re-fires). All other buttons keep a stable identity —
// changing pulseStartKey no longer causes 84 unmounts/remounts per click.
function dayKey(month, idx, day) {
  const isPulsingStart = pulseStartKey.value > 0
    && startDate.value
    && sameDay(day.date, startDate.value)
  return isPulsingStart
    ? `${month}-${idx}-${pulseStartKey.value}`
    : `${month}-${idx}`
}

function onContainerClick(e) {
  if (!containerRef.value?.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    mql = window.matchMedia('(max-width: 767px)')
    isMobile.value = mql.matches
    if (mql.addEventListener) mql.addEventListener('change', updateMobile)
    else mql.addListener(updateMobile)
  }
  document.addEventListener('mousedown', onContainerClick)
})

onBeforeUnmount(() => {
  if (mql) {
    if (mql.removeEventListener) mql.removeEventListener('change', updateMobile)
    else mql.removeListener(updateMobile)
  }
  document.removeEventListener('mousedown', onContainerClick)
})

function initFromModel() {
  if (Array.isArray(props.modelValue) && props.modelValue.length === 2) {
    const [s, e] = props.modelValue
    if (s) {
      startDate.value = normalizeDate(s)
      const sDate = startDate.value
      currentMonth.value = sDate.getMonth()
      currentYear.value = sDate.getFullYear()
    }
    if (e) endDate.value = normalizeDate(e)
  }
}

initFromModel()

watch(() => props.modelValue, (newVal) => {
  // Ignore echo from our own update:modelValue emit during internal transitions.
  if (phase.value === STATE.RESETTING) return
  const arr = Array.isArray(newVal) ? newVal : []
  if (arr.length === 2 && arr[0] && arr[1]) {
    startDate.value = normalizeDate(arr[0])
    endDate.value = normalizeDate(arr[1])
    hoveredDate.value = null
    phase.value = STATE.COMMITTED
  } else if (arr.length === 1 && arr[0]) {
    startDate.value = normalizeDate(arr[0])
    endDate.value = null
    hoveredDate.value = null
    phase.value = STATE.PICKING_START
  } else {
    startDate.value = null
    endDate.value = null
    hoveredDate.value = null
    phase.value = STATE.IDLE
  }
}, { deep: true })
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <!-- Live region: screen readers announce state transitions -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >{{ lastAnnouncement }}</div>

    <!-- Backdrop: own transition so it can fade independently of the panel -->
    <Transition name="backdrop-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-20 bg-black/5 backdrop-blur-[1px]"
        @click="close"
        aria-hidden="true"
      ></div>
    </Transition>

    <!-- Salida / Regreso inputs -->
    <div class="grid grid-cols-2 gap-3 w-full">
      <div
        class="flex flex-col items-start px-4 py-3 bg-white border-2 rounded-xl transition-all duration-200 ease-out cursor-text"
        :class="[
          startDate
            ? 'border-[#43D3FF] bg-[#43D3FF]/5'
            : isOpen
              ? 'border-[#00184C] ring-2 ring-[#00184C]/10 bg-white'
              : 'border-slate-200 hover:border-slate-300 bg-white'
        ]"
        @click="isOpen = !isOpen"
      >
        <label
          class="text-[10px] font-bold uppercase tracking-wider mb-1 transition-colors duration-200"
          :class="startDate ? 'text-[#00184C]' : 'text-slate-400'"
          for="date-input-salida"
        >Salida</label>
        <input
          id="date-input-salida"
          type="text"
          readonly
          data-testid="date-from-trigger"
          :value="startDate ? formatDisplay(startDate) : ''"
          :placeholder="'—'"
          @focus="isOpen = true"
          @keydown.backspace.prevent="clearSelection($event)"
          class="w-full bg-transparent text-base font-semibold outline-none border-none p-0 m-0 cursor-pointer transition-colors duration-200"
          :class="startDate ? 'text-slate-900' : 'text-slate-400'"
        />
      </div>

      <div
        class="flex flex-col items-start px-4 py-3 bg-white border-2 rounded-xl transition-all duration-200 ease-out cursor-text"
        :class="[
          endDate
            ? 'border-[#43D3FF] bg-[#43D3FF]/5'
            : startDate && isOpen
              ? 'border-[#00184C] ring-2 ring-[#00184C]/10 bg-white'
              : startDate
                ? 'border-slate-300 bg-white'
                : 'border-slate-200 bg-slate-50/50'
        ]"
        @click="startDate ? (isOpen = !isOpen) : null"
      >
        <label
          class="text-[10px] font-bold uppercase tracking-wider mb-1 transition-colors duration-200"
          :class="endDate ? 'text-[#00184C]' : (startDate ? 'text-slate-500' : 'text-slate-300')"
          for="date-input-regreso"
        >Regreso</label>
        <input
          id="date-input-regreso"
          type="text"
          readonly
          data-testid="date-to-trigger"
          :value="endDate ? formatDisplay(endDate) : (startDate && isOpen && hoveredDate ? formatDisplay(hoveredDate) : '')"
          :placeholder="'—'"
          :disabled="!startDate"
          @focus="startDate ? (isOpen = true) : null"
          @keydown.backspace.prevent="clearSelection($event)"
          class="w-full bg-transparent text-base font-semibold outline-none border-none p-0 m-0 cursor-pointer transition-colors duration-200"
          :class="endDate ? 'text-slate-900' : 'text-slate-400'"
        />
      </div>
    </div>

    <!-- Calendar panel: different transition per platform -->
    <Transition :name="isMobile ? 'sheet-slide' : 'calendar-fade'">
      <div
        v-if="isOpen"
        class="fixed inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-30 w-full md:w-[680px] md:max-w-none md:max-h-none bg-white md:bg-white md:border md:border-slate-200 rounded-t-3xl md:rounded-2xl shadow-xl md:overflow-visible overflow-hidden calendar-panel"
      >
        <!-- Header with month nav -->
        <div class="flex items-center justify-between px-4 md:px-5 py-4 border-b border-slate-100 bg-white md:bg-transparent rounded-t-3xl md:rounded-none">
          <button
            type="button"
            @click="prevMonths"
            class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#00184C] active:scale-95 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C]/20"
            aria-label="Meses anteriores"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-900 tabular-nums">{{ firstMonthLabel }}</span>
            <span v-if="!isMobile" class="text-sm text-slate-400">—</span>
            <span v-if="!isMobile" class="text-sm font-semibold text-slate-900 tabular-nums">{{ secondMonthLabel }}</span>
          </div>

          <button
            type="button"
            @click="nextMonths"
            class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#00184C] active:scale-95 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C]/20"
            aria-label="Meses siguientes"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Months grid: keyed by month so prev/next animates smoothly between months -->
        <Transition name="month-fade" mode="out-in">
          <div
            :key="`${currentYear}-${currentMonth}`"
            class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-5 calendar-months"
          >
            <!-- First month -->
            <div class="space-y-3 min-w-0">
              <div class="grid grid-cols-7 gap-x-1 gap-y-2">
                <span
                  v-for="(day, idx) in WEEKDAYS"
                  :key="`w1-${idx}`"
                  class="text-[10px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center py-1"
                >
                  {{ day }}
                </span>
              </div>

              <div
                class="grid grid-cols-7 gap-x-1 gap-y-2"
                :class="hasActiveRange ? 'md:gap-0' : 'md:gap-1'"
              >
                <button
                  v-for="(day, idx) in firstMonthDays"
                  :key="dayKey('m1', idx, day)"
                  type="button"
                  @click="onDayClick(day.date)"
                  @mouseenter="onDayHover(day.date)"
                  @mouseleave="onDayLeave"
                  :disabled="isDisabled(day.date) || !day.isCurrentMonth"
                  class="relative h-11 w-full md:h-10 flex items-center justify-center text-sm font-medium transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C]/30 disabled:cursor-not-allowed"
                  :class="[
                    dayClass(day),
                    currentState === 'resetting' && startDate && sameDay(day.date, startDate) ? 'ds-day-resetting' : '',
                    pulseStartKey > 0 && startDate && sameDay(day.date, startDate) ? 'ds-day-pulse' : ''
                  ]"
                >
                  <span class="relative z-10">{{ day.date.getDate() }}</span>
                </button>
              </div>
            </div>

            <!-- Second month -->
            <div v-if="!isMobile" class="space-y-3 min-w-0">
              <div class="grid grid-cols-7 gap-1">
                <span
                  v-for="(day, idx) in WEEKDAYS"
                  :key="`w2-${idx}`"
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center py-1"
                >
                  {{ day }}
                </span>
              </div>

              <div
                class="grid grid-cols-7"
                :class="hasActiveRange ? 'gap-0' : 'gap-1'"
              >
                <button
                  v-for="(day, idx) in secondMonthDays"
                  :key="dayKey('m2', idx, day)"
                  type="button"
                  @click="onDayClick(day.date)"
                  @mouseenter="onDayHover(day.date)"
                  @mouseleave="onDayLeave"
                  :disabled="isDisabled(day.date) || !day.isCurrentMonth"
                  class="relative h-10 w-full flex items-center justify-center text-sm transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C]/30 disabled:cursor-not-allowed"
                  :class="[
                    dayClass(day),
                    currentState === 'resetting' && startDate && sameDay(day.date, startDate) ? 'ds-day-resetting' : '',
                    pulseStartKey > 0 && startDate && sameDay(day.date, startDate) ? 'ds-day-pulse' : ''
                  ]"
                >
                  <span class="relative z-10">{{ day.date.getDate() }}</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Footer: muestra el rango y la cantidad de días seleccionados.
             Visible desde que se elige la salida (preview) hasta después de confirmar. -->
        <div
          v-if="hasActiveRange"
          class="flex items-center justify-between gap-3 px-4 md:px-5 py-3 border-t border-slate-100 bg-slate-50/60"
          aria-live="polite"
        >
          <div class="flex items-center gap-2 text-base min-w-0">
            <span class="font-semibold text-slate-900 tabular-nums truncate">
              {{ startDate ? formatDisplay(startDate) : '—' }}
            </span>
            <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span class="font-semibold text-slate-900 tabular-nums truncate">
              {{ endDate ? formatDisplay(endDate) : (hoveredDate ? formatDisplay(hoveredDate) : '—') }}
            </span>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <div
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tabular-nums transition-colors duration-200"
              :class="endDate ? 'bg-[#00184C] text-white' : 'bg-[#43D3FF]/20 text-[#00184C]'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ displayDays }}</span>
              <span>{{ displayDays === 1 ? 'día' : 'días' }}</span>
            </div>

            <button
              type="button"
              @click="clearSelection($event)"
              class="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-500 hover:text-[#00184C] hover:bg-white border border-transparent hover:border-slate-200 rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C]/20"
              aria-label="Limpiar selección"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span class="hidden sm:inline">Limpiar</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ── GPU hints for smoother animations on the heavy elements ── */
.calendar-panel {
  will-change: opacity, transform;
}
.calendar-months {
  will-change: opacity, transform;
}

/* ── Backdrop: independent, fast fade ── */
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease-out;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

/* ── Calendar panel: desktop (centered modal, scale + fade) ── */
.calendar-fade-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.calendar-fade-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}
.calendar-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.96);
}
.calendar-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.98);
}

/* ── Calendar panel: mobile (bottom sheet, slide up) ── */
.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
}

/* ── Month-to-month navigation (prev/next) ── */
.month-fade-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.month-fade-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}
.month-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.month-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── State text (footer: X días / Selecciona el regreso) ── */
.state-fade-enter-active,
.state-fade-leave-active {
  transition: opacity 0.2s ease;
}
.state-fade-enter-from,
.state-fade-leave-to {
  opacity: 0;
}

/* ── Reset feedback animations ── */

/* While the user is clicking a new Salida on top of an existing range,
   the OLD range fades out so the calendar visually "clears" before the
   new one appears. Lasts 220ms, matching RESET_MS in the script. */
.ds-day-fade-out {
  animation: ds-day-fade-out 220ms ease-out forwards;
  pointer-events: none;
}
@keyframes ds-day-fade-out {
  0%   { opacity: 1; transform: scale(1); }
  100% { opacity: 0.15; transform: scale(0.92); }
}

/* When a new start is committed, the new start day gets a subtle scale
   pulse to confirm "I'm the new Salida, look at me". Triggers via the
   :key change on the start day button (only that one remounts). */
.ds-day-pulse {
  animation: ds-day-pulse 360ms cubic-bezier(0.32, 0.72, 0, 1);
}
@keyframes ds-day-pulse {
  0%   { transform: scale(0.6); }
  60%  { transform: scale(1.18); }
  100% { transform: scale(1); }
}

/* Screen-reader-only utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
