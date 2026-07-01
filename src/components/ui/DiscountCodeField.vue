<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'apply', 'remove'])

const code = ref('')
const isValidating = ref(false)
const touched = ref(false)
const errorMessage = ref('')

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
  errorMessage.value = ''
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
    errorMessage.value = ''
    emit('apply', found)
  } else {
    errorMessage.value = 'Código no válido o expirado'
  }
}

function handleRemove() {
  code.value = ''
  touched.value = false
  errorMessage.value = ''
  emit('remove')
}
</script>

<template>
  <div v-if="!modelValue" class="space-y-1">
    <div
      class="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 pl-3 pr-1.5 py-1 focus-within:border-[#00184C] focus-within:bg-white transition-all"
      :class="codeTouched && !codeValid ? 'border-red-300' : ''"
    >
      <input
        v-model="code"
        type="text"
        placeholder="Código de descuento"
        title="Ingresa un código de descuento"
        @input="onInput"
        @blur="onBlur"
        @keyup.enter="handleApply"
        :aria-invalid="codeTouched && !codeValid"
        :aria-describedby="codeTouched && !codeValid ? 'discount-error' : undefined"
        class="border-none bg-transparent focus:ring-0 text-base w-full p-1 placeholder-slate-400 uppercase outline-none"
        maxlength="20"
        autocomplete="off"
        spellcheck="false"
      />
      <button
        type="button"
        @click="handleApply"
        :disabled="!codeValid || isValidating"
        class="bg-[#00184C] text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
      >
        <svg v-if="isValidating" class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-if="!isValidating">Aplicar</span>
        <span v-else class="sr-only">Validando…</span>
      </button>
    </div>
    <p
      v-if="errorMessage"
      class="text-red-500 text-xs flex items-center gap-1"
      role="alert"
    >
      <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      {{ errorMessage }}
    </p>
    <p
      v-if="codeTouched && !codeValid && code.length > 0 && !errorMessage"
      id="discount-error"
      class="text-red-500 text-xs flex items-center gap-1"
      role="alert"
    >
      <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      Mínimo 4 caracteres
    </p>
  </div>

  <div
    v-else
    class="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 pl-3 pr-1.5 py-1.5"
  >
    <svg class="w-4 h-4 text-[#00184C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
    </svg>
    <span class="text-xs font-bold tracking-wider ml-2" style="color: #00184C;">{{ modelValue.code }}</span>
    <span class="text-xs text-slate-500 ml-2">-{{ modelValue.discountPercent }}%</span>
    <div class="flex-1"></div>
    <button
      type="button"
      @click="handleRemove"
      class="text-xs font-medium text-slate-500 hover:text-[#00184C] transition-colors px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
      aria-label="Quitar cupón"
    >
      Quitar
    </button>
  </div>
</template>
