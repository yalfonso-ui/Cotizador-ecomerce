<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

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

const isOpen = ref(false)
const containerRef = ref(null)
const startDate = ref(null)
const endDate = ref(null)
const hoveredDate = ref(null)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

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

  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = date
    endDate.value = null
    hoveredDate.value = null
    return
  }

  if (isBefore(date, startDate.value)) {
    startDate.value = date
    endDate.value = null
    return
  }

  if (sameDay(date, startDate.value)) {
    startDate.value = date
    endDate.value = date
    finalize()
    return
  }

  endDate.value = date
  finalize()
}

function onDayHover(date) {
  if (startDate.value && !endDate.value) {
    hoveredDate.value = date
  }
}

function onDayLeave() {
  hoveredDate.value = null
}

function finalize() {
  emit('update:modelValue', [startDate.value, endDate.value])
  emit('change', { start: startDate.value, end: endDate.value })
  setTimeout(() => { isOpen.value = false }, 250)
}

function close() {
  isOpen.value = false
}

function clearSelection(e) {
  e.stopPropagation()
  startDate.value = null
  endDate.value = null
  hoveredDate.value = null
  emit('update:modelValue', [])
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
  const diff = endDate.value.getTime() - startDate.value.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1
})

const previewDays = computed(() => {
  if (!startDate.value || !hoveredDate.value) return 0
  const diff = hoveredDate.value.getTime() - startDate.value.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1
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

  if (isStart && isEnd) {
    return 'bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700'
  }
  if (isStart) {
    return 'bg-blue-600 text-white font-semibold rounded-l-full hover:bg-blue-700'
  }
  if (isEnd) {
    return 'bg-blue-600 text-white font-semibold rounded-r-full hover:bg-blue-700'
  }
  if (inRange) {
    return 'bg-blue-100 text-blue-950 rounded-none'
  }
  return 'text-slate-700 hover:bg-slate-100 rounded-full'
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
  isOpen.value = true
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
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <Transition name="calendar-fade">
      <div v-if="isOpen" class="fixed inset-0 z-20 bg-black/5 backdrop-blur-[1px]" @click="close" aria-hidden="true"></div>
    </Transition>

    <div class="grid grid-cols-2 gap-3 w-full">
      <button
        type="button"
        data-testid="date-from-trigger"
        @click="isOpen = !isOpen"
        :aria-expanded="isOpen"
        class="flex flex-col items-start px-4 py-3 bg-white border rounded-xl text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
        :class="[
          startDate
            ? 'border-blue-600 bg-blue-50/40'
            : isOpen
              ? 'border-blue-500 ring-2 ring-blue-500/10 bg-white'
              : 'border-slate-200 hover:border-slate-300 bg-white'
        ]"
      >
        <span class="text-[10px] font-bold uppercase tracking-wider mb-1" :class="startDate ? 'text-blue-600' : 'text-slate-400'">Salida</span>
        <span
          class="text-base font-semibold"
          :class="startDate ? 'text-slate-900' : 'text-slate-400'"
        >
          {{ startDate ? formatDisplay(startDate) : '—' }}
        </span>
      </button>

      <button
        type="button"
        data-testid="date-to-trigger"
        @click="isOpen = !isOpen"
        :aria-expanded="isOpen"
        :disabled="!startDate"
        class="flex flex-col items-start px-4 py-3 bg-white border rounded-xl text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
        :class="[
          endDate
            ? 'border-blue-600 bg-blue-50/40'
            : startDate && isOpen
              ? 'border-blue-500 ring-2 ring-blue-500/10 bg-white'
              : startDate
                ? 'border-slate-300 bg-white'
                : 'border-slate-200 bg-slate-50/50'
        ]"
      >
        <span class="text-[10px] font-bold uppercase tracking-wider mb-1" :class="endDate ? 'text-blue-600' : (startDate ? 'text-slate-500' : 'text-slate-300')">Regreso</span>
        <span
          class="text-base font-semibold"
          :class="endDate ? 'text-slate-900' : 'text-slate-400'"
        >
          {{ endDate ? formatDisplay(endDate) : (startDate && isOpen && hoveredDate ? formatDisplay(hoveredDate) : '—') }}
        </span>
      </button>
    </div>

    <Transition name="calendar-fade">
      <div
           v-if="isOpen"
            class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[680px] max-w-none max-h-none bg-white border border-slate-200 rounded-2xl shadow-xl overflow-visible"
          >
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button
            type="button"
            @click="prevMonths"
            class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            aria-label="Meses anteriores"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-900">{{ firstMonthLabel }}</span>
            <span v-if="!isMobile" class="text-sm text-slate-400">—</span>
            <span v-if="!isMobile" class="text-sm font-semibold text-slate-900">{{ secondMonthLabel }}</span>
          </div>

          <button
            type="button"
            @click="nextMonths"
            class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            aria-label="Meses siguientes"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-6 p-5">
          <div class="space-y-3 min-w-0">
            <div class="grid grid-cols-7 gap-1">
              <span
                v-for="(day, idx) in WEEKDAYS"
                :key="`w1-${idx}`"
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
                v-for="(day, idx) in firstMonthDays"
                :key="`m1-${idx}`"
                type="button"
                @click="onDayClick(day.date)"
                @mouseenter="onDayHover(day.date)"
                @mouseleave="onDayLeave"
                :disabled="isDisabled(day.date) || !day.isCurrentMonth"
                class="relative h-10 w-full flex items-center justify-center text-sm transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed"
                :class="dayClass(day)"
              >
                <span class="relative z-10">{{ day.date.getDate() }}</span>
              </button>
            </div>
          </div>

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
                :key="`m2-${idx}`"
                type="button"
                @click="onDayClick(day.date)"
                @mouseenter="onDayHover(day.date)"
                @mouseleave="onDayLeave"
                :disabled="isDisabled(day.date) || !day.isCurrentMonth"
                class="relative h-10 w-full flex items-center justify-center text-sm transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed"
                :class="dayClass(day)"
              >
                <span class="relative z-10">{{ day.date.getDate() }}</span>
              </button>
            </div>
          </div>

          <div
            v-if="!isMobile"
            class="flex flex-col items-start justify-center pl-5 border-l border-slate-100 min-w-[140px]"
          >
            <div
              class="text-xs font-semibold text-slate-400 uppercase tracking-wider"
              :class="displayDays > 0 ? 'text-blue-600' : 'text-slate-400'"
            >
              Duración
            </div>
            <div class="mt-1 flex items-baseline gap-1">
              <span
                class="text-3xl font-black tabular-nums"
                :class="displayDays > 0 ? 'text-slate-900' : 'text-slate-300'"
              >
                {{ displayDays > 0 ? displayDays : '—' }}
              </span>
              <span class="text-sm font-medium text-slate-500">
                {{ displayDays === 1 ? 'día' : 'días' }}
              </span>
            </div>
            <div v-if="displayDays > 0" class="mt-2 text-[11px] text-slate-400 leading-snug">
              {{ startDate && (endDate || hoveredDate) ? 'Selecciona otro día para ajustar' : 'Toca un día para empezar' }}
            </div>
          </div>
        </div>

        <div
          v-if="startDate"
          class="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/50"
        >
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ tripDays > 0 ? 'Rango completo' : 'Selecciona el día de regreso' }}</span>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="clearSelection"
              class="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors focus:outline-none focus-visible:underline"
            >
              Limpiar
            </button>
            <button
              type="button"
              @click="close"
              class="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus-visible:underline"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.calendar-fade-enter-active,
.calendar-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.calendar-fade-enter-from,
.calendar-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>