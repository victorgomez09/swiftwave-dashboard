<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="absolute z-50 flex h-[100vh] w-[100vw] flex-col items-center justify-center bg-white" v-show="show">
    <span class="loading loading-spinner loading-lg"></span>
    <!-- <img alt="swiftwave brand logo" :src="logo" class="h-20" />
    <div class="spinner-box">
      <div class="pulse-container">
        <div class="pulse-bubble pulse-bubble-1"></div>
        <div class="pulse-bubble pulse-bubble-2"></div>
        <div class="pulse-bubble pulse-bubble-3"></div>
      </div>
    </div> -->
  </div>
</template>

<!-- <style scoped>
.loading-page {
  @apply;
}

@keyframes pulse {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0.25;
    transform: scale(0.75);
  }
}

.spinner-box {
  width: 300px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
}

.pulse-container {
  width: 120px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pulse-bubble {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #6b46c1;
}

.pulse-bubble-1 {
  animation: pulse 0.4s ease 0s infinite alternate;
}

.pulse-bubble-2 {
  animation: pulse 0.4s ease 0.2s infinite alternate;
}

.pulse-bubble-3 {
  animation: pulse 0.4s ease 0.4s infinite alternate;
}
</style> -->
