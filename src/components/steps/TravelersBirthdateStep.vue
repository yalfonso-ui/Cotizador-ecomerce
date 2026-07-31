<script setup>
import { ref, computed, watch } from 'vue'
import { calculateAge } from '@/composables/useTravelerInfo.js'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['next', 'prev', 'update:modelValue'])

const travelersCount = ref(props.modelValue?.travelersCount || 1)
const birthdates = ref([])
const ages = ref([])
const birthdateTouched = ref([])

function initTravelers(count) {
  travelersCount.value = count
  const existing = props.modelValue?.birthdates || []
  const next = []
  const agesNext = []
  const touchedNext = []
  for (let i = 0; i < count; i++) {
    if (i < birthdates.value.length) {
      next.push(birthdates.value[i])
      agesNext.push(ages.value[i])
      touchedNext.push(birthdateTouched.value[i] || false)
    } else {
      next.push(existing[i] || { day: '', month: '', year: '' })
      agesNext.push(calculateAge(next[next.length - 1].day, next[next.length - 1].month, next[next.length - 1].year))
      touchedNext.push(false)
    }
  }
  birthdates.value = next
  ages.value = agesNext
  birthdateTouched.value = touchedNext
}

function isBirthdateValid(index) {
  const a = ages.value[index]
  return a !== null && a !== undefined && a >= 0 && a <= 120
}

function isBirthdateTouched(index) {
  return !!birthdateTouched.value[index]
}

function markBirthdateTouched(index) {
  if (!birthdateTouched.value[index]) {
    const next = [...birthdateTouched.value]
    next[index] = true
    birthdateTouched.value = next
  }
  updateAge(index)
}

function formatBirthdateFromDigits(digits) {
  const d = digits.slice(0, 2)
  const m = digits.slice(2, 4)
  const y = digits.slice(4, 8)
  let out = d
  if (digits.length > 2) out += '/' + m
  if (digits.length > 4) out += '/' + y
  return out
}

function handleBirthdateInput(index, event) {
  const raw = event.target.value
  const prev = formatBirthdateField(birthdates.value[index])

  const prevDigits = prev.replace(/\D/g, '')
  let rawDigits = raw.replace(/\D/g, '')

  if (rawDigits.length > 8) rawDigits = rawDigits.slice(0, 8)

  const slashCountPrev = (prev.match(/\//g) || []).length
  const slashCountRaw = (raw.match(/\//g) || []).length
  const lostSlashes = Math.max(0, slashCountPrev - slashCountRaw)

  if (lostSlashes > 0) {
    rawDigits = rawDigits.slice(0, Math.max(0, rawDigits.length - lostSlashes))
  }

  birthdates.value[index].day = rawDigits.slice(0, 2)
  birthdates.value[index].month = rawDigits.slice(2, 4)
  birthdates.value[index].year = rawDigits.slice(4, 8)

  const formatted = formatBirthdateFromDigits(rawDigits)

  event.target.value = formatted

  requestAnimationFrame(() => {
    if (event.target && document.activeElement === event.target) {
      const len = formatted.length
      event.target.setSelectionRange(len, len)
    }
  })

  updateAge(index)
}

function updateAge(index) {
  const b = birthdates.value[index]
  ages.value[index] = calculateAge(b.day, b.month, b.year)
}

function formatBirthdateField(b) {
  if (!b) return ''
  let out = ''
  if (b.day) out += b.day
  if (b.day && b.day.length === 2) out += '/'
  if (b.month) out += b.month
  if (b.month && b.month.length === 2) out += '/'
  if (b.year) out += b.year
  return out
}

const allValid = computed(() => {
  if (birthdates.value.length === 0) return false
  return birthdates.value.every((b, i) => ages.value[i] !== null && ages.value[i] >= 0 && ages.value[i] <= 120)
})

const hasMinorsWithAdults = computed(() => {
  const valid = ages.value.filter(a => a !== null)
  if (valid.length < 2) return false
  const adults = valid.filter(a => a >= 18).length
  const minors = valid.filter(a => a < 18).length
  return adults >= 1 && minors >= 1
})

function addTraveler() {
  if (birthdates.value.length < 10) {
    birthdates.value.push({ day: '', month: '', year: '' })
    ages.value.push(null)
    birthdateTouched.value.push(false)
    travelersCount.value = birthdates.value.length
  }
}

function removeTraveler(index) {
  if (birthdates.value.length > 1) {
    birthdates.value.splice(index, 1)
    ages.value.splice(index, 1)
    birthdateTouched.value.splice(index, 1)
    travelersCount.value = birthdates.value.length
  }
}

function handleContinue() {
  if (allValid.value) {
    emit('next', {
      travelersCount: travelersCount.value,
      birthdates: birthdates.value,
      ages: ages.value
    })
  }
}

initTravelers(travelersCount.value)

// ── Sincronización en tiempo real con el sidebar ──
// El requisito es que el contador de viajeros del resumen lateral
// se actualice en cuanto el usuario defina la cantidad o edite
// una fecha de nacimiento, sin esperar al "Continuar".
// Para eso emitimos update:modelValue en cada cambio relevante
// (cantidad, fechas) en lugar de solo al final.
function syncModelValue() {
  emit('update:modelValue', {
    ...props.modelValue,
    travelersCount: travelersCount.value,
    birthdates: birthdates.value,
    ages: ages.value
  })
}

watch(travelersCount, () => syncModelValue())

// Re-emitir también cuando cambian los birthdates, en tiempo real.
watch(birthdates, () => syncModelValue(), { deep: true })
</script>

<template>
  <div class="ds-focus-column space-y-8 pt-6 md:pt-10">
    <div class="space-y-2">
      <span class="ds-eyebrow">Tu equipo de viajeros</span>
      <h1 class="ds-heading-1">¿Cuántos<span style="color: #43D3FF;"> viajan</span>? </h1>
    </div>

    <div
      v-if="hasMinorsWithAdults"
      class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-left"
      role="note"
    >
      <p class="text-xs text-slate-700 flex items-start gap-2">
        <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span><span class="font-bold">Buena noticia:</span> con 2 adultos, hasta 2 menores de edad quedan cubiertos sin costo adicional.</span>
      </p>
    </div>

    <div class="w-full space-y-3 text-left">
      <div
        v-for="(b, index) in birthdates"
        :key="index"
        class="w-full bg-white border border-slate-200 rounded-xl p-4 space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style="background-color: #00184C;">
              <span class="text-sm font-bold text-white">{{ index + 1 }}</span>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Viajero</p>
              <p class="font-semibold text-slate-800 text-sm">
                {{ index === 0 ? 'Titular' : `Acompañante ${index}` }}
              </p>
            </div>
          </div>
          <div v-if="ages[index] !== null" class="text-right">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Edad</p>
            <p class="text-lg font-black text-slate-900">{{ ages[index] }} años</p>
          </div>
          <div v-else class="text-right">
            <p class="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Edad</p>
            <p class="text-sm font-medium text-slate-300">—</p>
          </div>
        </div>

        <div>
          <label :for="`birthdate-${index}`" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Fecha de nacimiento
          </label>
          <div class="relative">
            <input
              :id="`birthdate-${index}`"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              maxlength="10"
              placeholder="DD/MM/AAAA"
              :value="formatBirthdateField(b)"
              @input="handleBirthdateInput(index, $event)"
              @blur="markBirthdateTouched(index)"
              :aria-invalid="isBirthdateTouched(index) && !isBirthdateValid(index)"
              :aria-label="`Fecha de nacimiento del viajero ${index + 1} en formato DD/MM/AAAA`"
              class="w-full h-12 pl-3.5 pr-11 bg-white border-2 rounded-xl text-slate-900 text-base placeholder:text-slate-300 transition-all focus:outline-none font-semibold tracking-wider"
              :class="isBirthdateTouched(index) && isBirthdateValid(index)
                ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40 focus:ring-emerald-400/30 focus:border-emerald-500'
                : 'border-slate-200 focus:border-[color:var(--ds-focus)] focus:ring-2 focus:ring-[color:var(--ds-focus-ring)]'"
            />
            <svg
              v-if="isBirthdateTouched(index) && isBirthdateValid(index)"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <svg
              v-else
              class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <button type="button"
          v-if="index > 0"
          @click="removeTraveler(index)"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
          </svg>
          Quitar viajero
        </button>
      </div>

      <button type="button"
        v-if="travelersCount < 10"
        @click="addTraveler"
        class="w-full inline-flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Sumar otro viajero
      </button>
    </div>

<button type="button"
      @click="handleContinue"
      :disabled="!allValid"
        class="bg-[#F9D35A] text-[#00184C] font-bold text-base flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full transition-all hover:brightness-95 shadow-sm w-full max-w-md mx-auto disabled:bg-slate-200 disabled:text-slate-400"
    >
      <span v-if="allValid">
        <span class="hidden md:inline">Elige tu plan</span>
        <span class="md:hidden">Ver coberturas</span>
      </span>
      <span v-else>
        <span class="hidden md:inline">Completa las fechas de nacimiento</span>
        <span class="md:hidden">Completa las fechas</span>
      </span>
      <svg v-if="allValid" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-current transform rotate-45">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
      </svg>
    </button>
  </div>
</template>
