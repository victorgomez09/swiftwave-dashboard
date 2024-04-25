<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    required: true
  }
})

const percentage = computed(() => Math.min(props.percentage, 100))
const noOfGreenLines = computed(() => Math.floor(percentage.value / 10))
const noOfRedLines = computed(() => 10 - noOfGreenLines.value)
</script>

<template>
  <div class="group relative w-max">
    <div class="flex flex-col items-center">
      <div class="flex flex-row gap-1">
        <div v-for="i in noOfGreenLines" :key="i" class="h-6 w-1.5 rounded-lg bg-green-500"></div>
        <div v-for="i in noOfRedLines" :key="i" class="h-6 w-1.5 rounded-lg bg-red-400"></div>
      </div>
      <p class="mt-0.5 text-sm text-secondary-600">{{ label }}</p>
    </div>
    <span class="pointer-events-none absolute left-28 top-0 w-max opacity-0 transition-opacity group-hover:opacity-100">
      {{ percentage }}%
    </span>
  </div>
</template>

<style scoped></style>
