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
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  handleDateClick(day, month, year)
}

const handleDateClick = (day, month, year) => {
  const selectedDate = new Date(year, month, day, 0, 0, 0)

  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = selectedDate
    endDate.value = null
    hoveredDate.value = null
  } else if (startDate.value && !endDate.value && selectedDate > startDate.value) {
    endDate.value = selectedDate
    hoveredDate.value = null
    emit('update:modelValue', [startDate.value, endDate.value])
    emit('change', { start: startDate.value, end: endDate.value })
  } else if (selectedDate < startDate.value) {
    startDate.value = selectedDate
    endDate.value = null
    hoveredDate.value = null
  } else if (sameDay(selectedDate, startDate.value)) {
    startDate.value = selectedDate
    endDate.value = selectedDate
    hoveredDate.value = null
    emit('update:modelValue', [startDate.value, endDate.value])
    emit('change', { start: startDate.value, end: endDate.value })
  }
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
  if (!startDate.value || !endDate.value) return
  emit('update:modelValue', [startDate.value, endDate.value])
  emit('change', { start: startDate.value, end: endDate.value })
  isOpen.value = false
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

  if (isStart && isEnd) {
    return 'bg-[#00184C] text-white font-semibold rounded-full hover:bg-[#43D3FF] hover:text-[#00184C]'
  }
  if (isStart) {
    return 'bg-[#00184C] text-white font-semibold rounded-l-full hover:bg-[#43D3FF] hover:text-[#00184C]'
  }
  if (isEnd) {
    return 'bg-[#00184C] text-white font-semibold rounded-r-full hover:bg-[#43D3FF] hover:text-[#00184C]'
  }
  if (inRange) {
    return 'bg-[#EDF4F9] text-[#00184C] rounded-none hover:bg-[#43D3FF]/30'
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
      <div
        class="flex flex-col items-start px-4 py-3 bg-white border-2 rounded-xl transition-all duration-200 cursor-text"
        :class="[
          startDate
            ? 'border-[#43D3FF] bg-[#43D3FF]/5'
            : isOpen
              ? 'border-[#00184C] ring-2 ring-[#00184C]/10 bg-white'
              : 'border-slate-200 hover:border-slate-300 bg-white'
        ]"
        @click="isOpen = !isOpen"
      >
        <label class="text-[10px] font-bold uppercase tracking-wider mb-1" :class="startDate ? 'text-[#00184C]' : 'text-slate-400'" for="date-input-salida">Salida</label>
        <input
          id="date-input-salida"
          type="text"
          readonly
          data-testid="date-from-trigger"
          :value="startDate ? formatDisplay(startDate) : ''"
          :placeholder="'—'"
          @focus="isOpen = true"
          @keydown.backspace.prevent="clearSelection($event)"
          class="w-full bg-transparent text-base font-semibold outline-none border-none p-0 m-0 cursor-pointer"
          :class="startDate ? 'text-slate-900' : 'text-slate-400'"
        />
      </div>

      <div
        class="flex flex-col items-start px-4 py-3 bg-white border-2 rounded-xl transition-all duration-200 cursor-text"
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
        <label class="text-[10px] font-bold uppercase tracking-wider mb-1" :class="endDate ? 'text-[#00184C]' : (startDate ? 'text-slate-500' : 'text-slate-300')" for="date-input-regreso">Regreso</label>
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
          class="w-full bg-transparent text-base font-semibold outline-none border-none p-0 m-0 cursor-pointer"
          :class="endDate ? 'text-slate-900' : 'text-slate-400'"
        />
      </div>
    </div>

    <Transition name="calendar-fade">
      <div
           v-if="isOpen"
            class="fixed inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-30 w-full md:w-[680px] md:max-w-none md:max-h-none bg-white md:bg-white md:border md:border-slate-200 rounded-t-3xl md:rounded-2xl shadow-xl md:overflow-visible overflow-hidden"
          >
        <div class="flex items-center justify-between px-4 md:px-5 py-4 border-b border-slate-100 bg-white md:bg-transparent rounded-t-3xl md:rounded-none">
          <button
            type="button"
            @click="prevMonths"
            class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#00184C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C]/20"
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
            class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#00184C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C]/20"
            aria-label="Meses siguientes"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 md:gap-6 p-4 md:p-5">
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
                :key="`m1-${idx}`"
                type="button"
                @click="onDayClick(day.date)"
                @mouseenter="onDayHover(day.date)"
                @mouseleave="onDayLeave"
                :disabled="isDisabled(day.date) || !day.isCurrentMonth"
                class="relative h-11 w-full md:h-10 flex items-center justify-center text-sm font-medium transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C]/30 disabled:cursor-not-allowed"
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
                class="relative h-10 w-full flex items-center justify-center text-sm transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C]/30 disabled:cursor-not-allowed"
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
              :class="displayDays > 0 ? 'text-[#00184C]' : 'text-slate-400'"
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
          class="sticky bottom-0 md:static flex items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 border-t border-slate-100 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.04)] md:shadow-none"
        >
          <div class="flex items-center gap-2 min-w-0">
            <button
              type="button"
              @click="clearSelection"
              class="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors focus:outline-none focus-visible:underline whitespace-nowrap"
              aria-label="Limpiar selección"
            >
              Limpiar
            </button>
            <span v-if="displayDays > 0" class="text-sm font-semibold tabular-nums truncate" style="color: #00184C;">
              <span class="hidden sm:inline">{{ displayDays }} {{ displayDays === 1 ? 'día seleccionado' : 'días seleccionados' }}</span>
              <span class="sm:hidden">{{ displayDays }} {{ displayDays === 1 ? 'día' : 'días' }}</span>
            </span>
            <span v-else class="text-sm font-medium text-slate-400 truncate">
              <span class="hidden sm:inline">Selecciona el regreso</span>
              <span class="sm:hidden">Elige regreso</span>
            </span>
          </div>
          <button
            type="button"
            @click="confirmSelection"
            :disabled="!startDate || !endDate"
            class="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C]/30"
            :class="startDate && endDate
              ? 'shadow-sm hover:brightness-95'
              : 'opacity-50 cursor-not-allowed'"
            :style="startDate && endDate
              ? { backgroundColor: '#F9D35A', color: '#00184C' }
              : { backgroundColor: '#E2E8F0', color: '#94A3B8' }"
          >
            <span class="hidden sm:inline">Confirmar fechas</span>
            <span class="sm:hidden">Listo</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-white transform rotate-45" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </button>
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