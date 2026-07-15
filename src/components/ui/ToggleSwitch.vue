<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md'].includes(v)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOn = computed(() => props.modelValue)

const sizes = {
  sm: { track: 'w-8 h-5', thumb: 'w-3.5 h-3.5', translate: 'translate-x-3.5' },
  md: { track: 'w-10 h-6', thumb: 'w-4.5 h-4.5', translate: 'translate-x-4' }
}

const s = computed(() => sizes[props.size])

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !isOn.value)
  emit('change', !isOn.value)
}
</script>

<template>
  <label
    class="flex items-center gap-3 select-none"
    :class="disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
  >
    <span
      v-if="label"
      class="flex-1 min-w-0"
    >
      <span class="block text-sm font-medium text-slate-900 leading-tight">{{ label }}</span>
      <span v-if="description" class="block text-xs text-slate-500 mt-0.5 leading-snug">{{ description }}</span>
    </span>

    <button
      type="button"
      role="switch"
      :aria-checked="isOn"
      :aria-label="label || (isOn ? 'Desactivar' : 'Activar')"
      :disabled="disabled"
      @click="toggle"
      @keydown.space.prevent="toggle"
      class="relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-primary)] focus-visible:ring-offset-2"
      :class="[
        s.track,
        isOn ? 'bg-slate-900' : 'bg-slate-200'
      ]"
    >
      <span
        class="inline-block rounded-full bg-white shadow-sm transition-transform duration-200"
        :class="[s.thumb, isOn ? s.translate : 'translate-x-0.5']"
        :style="{ width: s.thumb.split(' ')[0].replace('w-', '') * 4 + 'px', height: s.thumb.split(' ')[1].replace('h-', '') * 4 + 'px' }"
      />
    </button>
  </label>
</template>