<script setup>
import { ref, computed, watch } from 'vue'
import { calculateAge } from '@/composables/useTravelerInfo.js'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['next', 'prev'])

const travelersCount = ref(props.modelValue?.travelersCount || 1)
const birthdates = ref([])
const ages = ref([])

function initTravelers(count) {
  travelersCount.value = count
  const existing = props.modelValue?.birthdates || []
  const next = []
  const agesNext = []
  for (let i = 0; i < count; i++) {
    if (i < birthdates.value.length) {
      next.push(birthdates.value[i])
      agesNext.push(ages.value[i])
    } else {
      next.push(existing[i] || { day: '', month: '', year: '' })
      agesNext.push(calculateAge(next[next.length - 1].day, next[next.length - 1].month, next[next.length - 1].year))
    }
  }
  birthdates.value = next
  ages.value = agesNext
}

function handleBirthdateInput(index, event) {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 8)
  const d = digits.slice(0, 2)
  const m = digits.slice(2, 4)
  const y = digits.slice(4, 8)
  birthdates.value[index].day = d
  birthdates.value[index].month = m
  birthdates.value[index].year = y
  let formatted = ''
  if (d) formatted += d
  if (d.length === 2) formatted += '/'
  if (m) formatted += m
  if (m.length === 2) formatted += '/'
  if (y) formatted += y
  event.target.value = formatted
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
    travelersCount.value = birthdates.value.length
  }
}

function removeTraveler(index) {
  if (birthdates.value.length > 1) {
    birthdates.value.splice(index, 1)
    ages.value.splice(index, 1)
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
</script>

<template>
  <div class="ds-focus-column space-y-8">
    <div class="space-y-2">
      <span class="ds-eyebrow">Datos de los viajeros</span>
      <h1 class="ds-heading-1">¿Quiénes viajan?</h1>
      <p class="ds-helper">Ingresa la fecha de nacimiento de cada viajero.</p>
    </div>

    <div
      v-if="hasMinorsWithAdults"
      class="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-left"
      role="note"
    >
      <p class="text-xs text-slate-700 flex items-start gap-2">
        <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span><span class="font-bold">Plan Familiar:</span> con 2 adultos, hasta 2 menores de edad quedan cubiertos sin costo adicional.</span>
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
            <div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
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
          <input
            :id="`birthdate-${index}`"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            maxlength="10"
            placeholder="DD/MM/AAAA"
            :value="formatBirthdateField(b)"
            @input="handleBirthdateInput(index, $event)"
            @blur="updateAge(index)"
            :aria-label="`Fecha de nacimiento del viajero ${index + 1} en formato DD/MM/AAAA`"
            class="w-full h-12 px-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 transition-all focus:border-[color:var(--ds-focus)] focus:ring-2 focus:ring-[color:var(--ds-focus-ring)] focus:outline-none text-sm font-semibold tracking-wider"
          />
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
        class="w-full inline-flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 border border-dashed border-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Agregar otro viajero
      </button>
    </div>

    <button type="button"
      @click="handleContinue"
      :disabled="!allValid"
      class="ds-cta"
    >
      <span v-if="allValid">Continuar con {{ travelersCount }} viajero{{ travelersCount > 1 ? 's' : '' }}</span>
      <span v-else>Completa las fechas de nacimiento</span>
      <svg v-if="allValid" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  </div>
</template>
