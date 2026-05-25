<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const show = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    show.value = true
  } else {
    setTimeout(() => {
      show.value = false
    }, 300)
  }
}, { immediate: true })
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div v-if="show && message" class="flex items-start gap-3 px-1 py-2">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div class="relative bg-slate-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs shadow-sm">
        <div class="absolute -left-2 top-0 w-4 h-4 bg-slate-100 rounded-br-lg transform -skew-x-6"></div>
        <p class="text-gray-700 text-sm leading-relaxed">{{ message }}</p>
        <div class="absolute -bottom-1 right-4 w-3 h-3 bg-slate-100 transform rotate-45"></div>
      </div>
    </div>
  </Transition>
</template>