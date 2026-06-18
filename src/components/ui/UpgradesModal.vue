<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useModalFocus } from '@/composables/useModalFocus.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  travelerId: { type: [String, Number], default: null },
  travelerLabel: { type: String, default: 'Viajero' },
  selectedUpgrades: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'close', 'update'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const localSelected = ref([...props.selectedUpgrades])

watch(() => props.selectedUpgrades, (val) => {
  localSelected.value = [...val]
}, { deep: true })

const upgrades = [
  {
    id: 'preexistencias',
    icon: '🏥',
    iconBg: 'bg-rose-100',
    title: 'Preexistencias médicas',
    description: 'Cobertura para condiciones médicas preexistentes declaradas.',
    coverage: 'USD 5.000',
    price: 18.20
  },
  {
    id: 'deportes',
    icon: '⛷️',
    iconBg: 'bg-sky-100',
    title: 'Práctica deportiva',
    description: 'Asistencia para actividades deportivas recreativas y aventura.',
    coverage: 'USD 10.000',
    price: 14.50
  },
  {
    id: 'futura-mama',
    icon: '🤰',
    iconBg: 'bg-pink-100',
    title: 'Futura mamá',
    description: 'Coberturas especiales para embarazadas hasta la semana 32.',
    coverage: 'USD 8.000',
    price: 22.00
  }
]

function isSelected(upgradeId) {
  return localSelected.value.includes(upgradeId)
}

const ALLOWED_UPGRADE_IDS = ['preexistencias', 'deportes', 'futura-mama']

const visibleUpgrades = computed(() =>
  upgrades.filter(u => ALLOWED_UPGRADE_IDS.includes(u.id))
)

const totalPrice = computed(() => {
  return localSelected.value.reduce((sum, id) => {
    const upgrade = upgrades.find(u => u.id === id)
    return sum + (upgrade?.price || 0)
  }, 0)
})

const recentlyToggled = ref(null)
let toggleTimeout = null

function toggleUpgrade(upgrade) {
  const idx = localSelected.value.indexOf(upgrade.id)
  if (idx > -1) {
    localSelected.value.splice(idx, 1)
  } else {
    localSelected.value.push(upgrade.id)
  }
  recentlyToggled.value = upgrade.id
  if (toggleTimeout) clearTimeout(toggleTimeout)
  toggleTimeout = setTimeout(() => {
    recentlyToggled.value = null
  }, 600)
  emit('update', { travelerId: props.travelerId, upgrades: [...localSelected.value] })
}

function close() {
  isOpen.value = false
  emit('close')
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    close()
  }
}

const { handleKeydown } = useModalFocus(isOpen, close)

watch(isOpen, (val) => {
  if (val) {
    localSelected.value = [...props.selectedUpgrades]
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="upgrades-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        @click="handleBackdropClick"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        <div
          class="relative w-full md:max-w-2xl md:mx-4 bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`upgrades-title-${travelerId}`"
        >
          <header class="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 flex-shrink-0">
            <div class="min-w-0 flex-1 pr-3">
              <div class="flex items-center gap-2 mb-1">
                <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold">
                  {{ travelerId }}
                </span>
                <h2 :id="`upgrades-title-${travelerId}`" class="text-lg md:text-xl font-bold text-slate-900 truncate">
                  {{ travelerLabel }}
                </h2>
              </div>
              <p class="text-sm text-slate-500">Coberturas Adicionales</p>
            </div>
            <button
              type="button"
              @click="close"
              class="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
              aria-label="Cerrar modal de coberturas adicionales"
            >
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="flex-1 overflow-y-auto p-5 md:p-6 space-y-3">
            <div
              v-for="upgrade in visibleUpgrades"
              :key="upgrade.id"
              class="relative bg-white border-2 rounded-2xl p-4 transition-all duration-200"
              :class="[
                isSelected(upgrade.id)
                  ? 'border-emerald-500 bg-emerald-50/30 shadow-md'
                  : 'border-slate-200 hover:border-cyan-300 hover:shadow-sm',
                recentlyToggled === upgrade.id ? 'animate-pulse-once' : ''
              ]"
            >
              <div
                v-if="isSelected(upgrade.id)"
                class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-md transition-transform"
                :class="recentlyToggled === upgrade.id ? 'scale-125' : 'scale-100'"
                aria-label="Beneficio agregado"
              >
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div class="flex items-start gap-3 mb-3">
                <div
                  class="flex items-center justify-center w-12 h-12 rounded-full text-2xl flex-shrink-0 transition-transform"
                  :class="[upgrade.iconBg, isSelected(upgrade.id) ? 'scale-110' : '']"
                  aria-hidden="true"
                >
                  {{ upgrade.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-slate-900 text-base leading-tight">{{ upgrade.title }}</h3>
                  <p class="text-xs text-slate-500 mt-1 leading-snug">{{ upgrade.description }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div class="flex items-center gap-4">
                  <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cobertura</p>
                    <p class="text-sm font-bold text-slate-700">{{ upgrade.coverage }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio</p>
                    <p
                      class="text-sm font-bold transition-colors"
                      :class="isSelected(upgrade.id) ? 'text-emerald-600' : 'text-cyan-600'"
                    >
                      ${{ upgrade.price.toFixed(2) }} USD
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  @click="toggleUpgrade(upgrade)"
                  class="relative overflow-hidden transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg font-bold text-sm"
                  :class="isSelected(upgrade.id)
                    ? 'px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 focus-visible:ring-red-400'
                    : 'px-4 py-2 text-slate-900 bg-yellow-400 hover:bg-yellow-500 focus-visible:ring-yellow-500 shadow-sm'"
                  :aria-pressed="isSelected(upgrade.id)"
                  :aria-label="isSelected(upgrade.id) ? `Quitar ${upgrade.title}` : `Agregar ${upgrade.title}`"
                >
                  <span class="relative z-10 flex items-center gap-1.5">
                    <svg v-if="!isSelected(upgrade.id)" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{{ isSelected(upgrade.id) ? 'Quitar' : 'Agregar' }}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <footer class="flex items-center justify-between gap-3 p-4 md:p-5 border-t border-slate-100 flex-shrink-0 bg-gradient-to-r from-slate-50 to-cyan-50/50">
            <div class="flex flex-col">
              <div class="flex items-baseline gap-1.5">
                <span
                  class="text-2xl font-black transition-colors"
                  :class="localSelected.length > 0 ? 'text-cyan-600' : 'text-slate-400'"
                >
                  ${{ totalPrice.toFixed(2) }}
                </span>
                <span class="text-xs font-semibold text-slate-500">USD</span>
              </div>
              <p class="text-[11px] text-slate-500 font-medium">
                <span v-if="localSelected.length === 0">Sin coberturas adicionales</span>
                <span v-else>{{ localSelected.length }} cobertura{{ localSelected.length === 1 ? '' : 's' }} · Total por día</span>
              </p>
            </div>
            <button
              type="button"
              @click="close"
              class="px-5 py-2.5 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
            >
              {{ localSelected.length > 0 ? `Aplicar ($${totalPrice.toFixed(2)})` : 'Cerrar' }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.upgrades-modal-enter-active,
.upgrades-modal-leave-active {
  transition: opacity 0.25s ease;
}

.upgrades-modal-enter-active > div:last-child,
.upgrades-modal-leave-active > div:last-child {
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.upgrades-modal-enter-from,
.upgrades-modal-leave-to {
  opacity: 0;
}

.upgrades-modal-enter-from > div:last-child,
.upgrades-modal-leave-to > div:last-child {
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .upgrades-modal-enter-from > div:last-child,
  .upgrades-modal-leave-to > div:last-child {
    transform: scale(0.96) translateY(20px);
  }
}

@keyframes pulse-once {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.animate-pulse-once {
  animation: pulse-once 0.4s ease-out;
}
</style>
