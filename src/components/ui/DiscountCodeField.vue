<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'apply', 'remove'])

const code = ref('')
const isValidating = ref(false)
const touched = ref(false)

const codeValid = computed(() => {
  const c = code.value.trim().toUpperCase()
  return c.length >= 4 && c.length <= 20 && /^[A-Z0-9-]+$/.test(c)
})

const codeTouched = computed(() => touched.value)

const formatCode = (val) => {
  return val.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20)
}

function onInput(event) {
  code.value = formatCode(event.target.value)
  touched.value = false
}

function onBlur() {
  if (code.value.trim()) {
    touched.value = true
  }
}

async function handleApply() {
  touched.value = true
  if (!codeValid.value) return
  isValidating.value = true
  await new Promise(r => setTimeout(r, 800))
  isValidating.value = false

  const normalized = code.value.trim().toUpperCase()
  const mockCodes = {
    'WELCOME10': { code: 'WELCOME10', discountPercent: 10, label: '10% de descuento' },
    'PROMO20': { code: 'PROMO20', discountPercent: 20, label: '20% de descuento' },
    'TRAVEL15': { code: 'TRAVEL15', discountPercent: 15, label: '15% de descuento' }
  }
  const found = mockCodes[normalized]
  if (found) {
    emit('apply', found)
  } else {
    emit('apply', { code: normalized, error: 'Código no válido o expirado' })
  }
}

function handleRemove() {
  code.value = ''
  touched.value = false
  emit('remove')
}
</script>

<template>
  <div v-if="!modelValue" class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
    <div class="flex items-center gap-2.5 mb-3">
      <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <div class="min-w-0">
        <p class="text-sm font-bold text-slate-700">¿Tienes un código de descuento?</p>
        <p class="text-[11px] text-slate-500">Aplica un cupón para ahorrar en tu compra</p>
      </div>
    </div>

    <div class="flex items-stretch gap-2">
      <div class="relative flex-1">
        <input
          v-model="code"
          type="text"
          placeholder="Ej: WELCOME10"
          @input="onInput"
          @blur="onBlur"
          @keyup.enter="handleApply"
          :aria-invalid="codeTouched && !codeValid"
          :aria-describedby="codeTouched && !codeValid ? 'discount-error' : undefined"
          class="w-full h-11 px-3 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 uppercase font-mono text-sm tracking-wider transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none"
          :class="codeTouched && !codeValid ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'"
          maxlength="20"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <button
        type="button"
        @click="handleApply"
        :disabled="!codeValid || isValidating"
        class="px-4 h-11 bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 min-w-[100px] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
      >
        <svg v-if="isValidating" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-if="!isValidating">Aplicar</span>
        <span v-else class="sr-only">Validando código</span>
      </button>
    </div>

    <p v-if="codeTouched && !codeValid && code.length > 0" id="discount-error" class="text-red-500 text-xs mt-2 flex items-center gap-1" role="alert">
      <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      Mínimo 4 caracteres alfanuméricos
    </p>

    <div class="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Prueba con: <code class="font-mono text-amber-600 font-bold">WELCOME10</code>, <code class="font-mono text-amber-600 font-bold">PROMO20</code> o <code class="font-mono text-amber-600 font-bold">TRAVEL15</code></span>
    </div>
  </div>

  <div v-else class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl p-4 shadow-sm">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Código aplicado</p>
          <p class="font-bold text-emerald-900 font-mono tracking-wider text-base">{{ modelValue.code }}</p>
          <p class="text-xs text-emerald-700 font-medium">{{ modelValue.label }}</p>
        </div>
      </div>
      <button
        type="button"
        @click="handleRemove"
        class="px-3 py-1.5 text-xs font-bold text-emerald-700 hover:text-white hover:bg-emerald-500 active:scale-95 border border-emerald-300 hover:border-emerald-500 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        aria-label="Quitar código de descuento"
      >
        Quitar
      </button>
    </div>
  </div>
</template>
