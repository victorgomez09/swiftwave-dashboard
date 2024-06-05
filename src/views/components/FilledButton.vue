<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: {
    default: false
  },
  disabled: {
    default: false
  },
  click: {
    type: Function,
    default: () => {}
  },
  type: {
    type: String,
    default: 'primary',
    validator(value) {
      return ['primary', 'success', 'warning', 'danger', 'secondary', 'info', 'ghost'].includes(value)
    }
  },
  slim: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  }
})

const isDisabled = computed(() => {
  return props.disabled || props.loading
})
</script>

<template>
  <button
    :class="{
      'btn-primary': type === 'primary',
      'btn-secondary': type === 'secondary',
      'btn-success': type === 'success',
      'btn-warning': type === 'warning',
      'btn-danger': type === 'danger',
      'btn-info': type === 'info',
      'btn-ghost': type === 'ghost',
      'rounded-full': rounded,
      'rounded-md': !rounded
    }"
    :disabled="isDisabled"
    class="btn"
    type="button"
    @click.stop="click">
    <!--    spinner -->
    <svg
      v-if="loading"
      :class="{
        'h-5 w-5': !slim,
        'h-3 w-3': slim,
        'text-white': type !== 'ghost'
      }"
      class="-ml-1 mr-3 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"></path>
    </svg>
    <!-- linear wave spinner -->

    <!-- text -->
    <slot></slot>
  </button>
</template>

<style scoped></style>
