<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const emit = defineEmits(['update', 'next'])

const travelerType = ref('')
const showForm = ref(false)

const options = [
  { id: 'solo', label: 'Solo', sublabel: '1 persona', icon: '🧑', count: 1 },
  { id: 'pareja', label: 'Pareja', sublabel: '2 personas', icon: '👫', count: 2 },
  { id: 'familia', label: 'Familia', sublabel: '3-5 personas', icon: '👨‍👩‍👧‍👦', count: 4 },
  { id: 'grupo', label: 'Grupo', sublabel: '6+ personas', icon: '👥', count: 6 }
]

function selectType(id) {
  travelerType.value = id
  if (id === 'solo') {
    emit('next', { travelers: 'solo' })
  } else {
    showForm.value = true
  }
}

const companionCount = computed(() => {
  const opt = options.find(o => o.id === travelerType.value)
  return opt ? Math.max(0, opt.count - 1) : 0
})

const companionNames = ref([])

watch(travelerType, (type) => {
  const opt = options.find(o => o.id === type)
  const count = opt?.count || 1
  companionNames.value = Array(Math.max(0, count - 1)).fill('')
})

function handleContinue() {
  if (travelerType.value && companionNames.value.every(n => !n || (n || '').trim().length >= 3)) {
    emit('next', {
      travelers: travelerType.value,
      companionNames: [...companionNames.value]
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="!showForm" class="grid grid-cols-2 gap-4">
      <button
        v-for="option in options"
        :key="option.id"
        @click="selectType(option.id)"
        class="relative p-6 rounded-2xl border-2 bg-white transition-all duration-200 text-center hover:border-cyan-500 hover:ring-4 hover:ring-cyan-500/20"
        :class="travelerType === option.id
          ? 'border-cyan-500 ring-4 ring-cyan-500 bg-cyan-50 shadow-lg'
          : 'border-gray-100'"
      >
        <span class="text-5xl mb-3 block">{{ option.icon }}</span>
        <h3 class="font-semibold text-lg mb-1" :class="travelerType === option.id ? 'text-cyan-700' : 'text-slate-900'">
          {{ option.label }}
        </h3>
        <p class="text-sm" :class="travelerType === option.id ? 'text-cyan-600' : 'text-gray-500'">
          {{ option.sublabel }}
        </p>
      </button>
    </div>

    <div v-else class="space-y-5">
      <div class="flex items-center justify-between">
        <button @click="showForm = false; travelerType = ''" class="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Cambiar tipo de viaje
        </button>
        <span class="text-sm font-medium text-cyan-600">{{ companionCount + 1 }} viajero{{ companionCount > 0 ? 's' : '' }}</span>
      </div>

      <div v-for="(_, index) in companionCount" :key="index" class="bg-slate-50 rounded-xl p-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Viajero {{ index + 2 }} — Nombre</p>
        <input
          v-model="companionNames[index]"
          type="text"
          :placeholder="'Nombre del acompañante ' + (index + 1)"
          class="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
        />
      </div>

      <button
        @click="handleContinue"
        :disabled="companionNames.some(n => !n || (n || '').trim().length < 3)"
        class="w-full h-14 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-slate-900 disabled:text-gray-400 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
      >
        <span>Continuar</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  </div>
</template>
