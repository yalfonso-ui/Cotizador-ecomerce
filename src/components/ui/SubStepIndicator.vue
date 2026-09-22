<script setup>
const props = defineProps({
  currentSubStep: { type: Number, required: true, default: 1 },
  steps: {
    type: Array,
    required: true,
    validator: (val) => val.length > 0
  }
})

function isCompleted(idx) {
  return props.currentSubStep > idx + 1
}

function isActive(idx) {
  return props.currentSubStep === idx + 1
}
</script>

<template>
  <ol class="flex items-center gap-3 overflow-x-auto hide-scroll-bar" role="list">
    <template v-for="(step, index) in steps" :key="index">
      <li
        class="flex items-center gap-2.5 min-w-0 transition-all duration-300"
        :aria-current="isActive(index) ? 'step' : undefined"
      >
        <span
          class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300"
          :class="isCompleted(index)
            ? ''
            : isActive(index)
              ? 'ring-2'
              : 'bg-slate-200 text-gray-400'"
          :style="isCompleted(index) ? { backgroundColor: '#00184C', color: 'white' } : isActive(index) ? { backgroundColor: '#43D3FF', color: '#00184C', ringColor: 'rgba(67, 211, 255, 0.3)' } : {}"
        >
          <svg v-if="isCompleted(index)" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
          <span v-else>{{ index + 1 }}</span>
        </span>
        <span
          class="text-sm font-semibold truncate transition-colors duration-300"
          :class="isActive(index) || isCompleted(index) ? 'text-slate-900' : 'text-gray-400'"
        >
          {{ step }}
        </span>
      </li>
      <li
        v-if="index < steps.length - 1"
        class="flex-1 h-px bg-slate-200 min-w-[20px]"
        aria-hidden="true"
      />
    </template>
  </ol>
</template>
