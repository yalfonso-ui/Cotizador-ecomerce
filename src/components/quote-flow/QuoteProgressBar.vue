<script setup>
defineProps({
  progress: {
    type: Number,
    default: 0
  },
  currentStep: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="relative">
    <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
      <div
        class="h-full bg-[#00184C] rounded-full transition-all duration-500 ease-out"
        :style="{ width: progress + '%' }"
      />
    </div>
  </div>
</template>