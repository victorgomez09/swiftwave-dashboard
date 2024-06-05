<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/store/auth.js'
import router from '@/router/index.js'
import FilledButton from '@/views/components/FilledButton.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const username = ref('')
const password = ref('')
const authenticationStatus = reactive({
  visible: false,
  success: false,
  message: ''
})
const authStore = useAuthStore()

const login = async () => {
  let res = await authStore.Login(username.value, password.value)
  authenticationStatus.success = res.success
  authenticationStatus.message = res.message
  authenticationStatus.visible = true
  if (res.success) {
    // check if `redirect` is in the query
    if (router.currentRoute.value.query.redirect) {
      await router.push(router.currentRoute.value.query.redirect)
      return
    }
    window.open(router.resolve({ name: 'Applications' }).href, '_self')
  }
}
</script>

<template>
  <div class="flex h-full w-full flex-row">
    <!--  Content  -->
    <div class="relative flex h-full min-w-[60vw] select-none flex-col items-center bg-base-200 pt-52">
      <!--   Logo with title/subtitle   -->
      <div class="flex w-fit flex-row items-center justify-center gap-2">
        <!-- <img src="@/assets/images/logo.png" class="w-14" alt="swiftwave logo" /> -->
        <div class="flex flex-col items-start justify-between">
          <p class="text-3xl">Vira deploy</p>
          <p class="text-base">open source paas</p>
        </div>
      </div>
      <!--    Heading  -->
      <p class="mt-32 font-comfortaa text-5xl"><span class="text-primary">Simple Lightweight</span>&nbsp;PaaS</p>
      <p class="mt-6 font-comfortaa text-5xl">for Vira ecosystem</p>
    </div>

    <!--   Login form -->
    <div class="flex h-full w-full flex-col items-center justify-center px-6 py-12 lg:px-8">
      <p class="text-primary w-fit text-5xl">
        <font-awesome-icon icon="fa-solid fa-fingerprint" />
      </p>
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <!-- Alert  -->
        <div
          v-if="authenticationStatus.visible"
          :class="{
            'alert-error': !authenticationStatus.success,
            'alert-success': authenticationStatus.success
          }"
          class="alert mb-5 rounded border-s-4 p-4"
          role="alert">
          <strong class="block font-medium">{{ authenticationStatus.message }}</strong>
        </div>

        <!--   Login Form   -->
        <form class="space-y-4" @keydown.enter.prevent="login">
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text !font-semibold">Username</span>
            </div>
            <input
              id="username"
              v-model="username"
              autocomplete="username"
              class="input input-bordered w-full"
              name="username"
              placeholder="Enter username"
              required
              type="text" />
          </label>
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text !font-semibold">Password</span>
            </div>
            <input
              id="password"
              v-model="password"
              autocomplete="current-password"
              class="input input-bordered w-full"
              placeholder="Enter password"
              required
              type="password" />
          </label>

          <div class="py-2">
            <FilledButton :click="login" class="w-full"> Sign in</FilledButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: 'Comfortaa';
  src: url('@/assets/fonts/Comfortaa-Regular.ttf');
}

@font-face {
  font-family: 'Prompt';
  src: url('@/assets/fonts/Prompt-Regular.ttf');
}

.action-btn {
  @apply border-secondary hover:bg-secondary cursor-pointer rounded-lg border bg-white px-4  py-1 text-base no-underline shadow-sm focus:outline-none;

  .icon {
    @apply mr-1 text-sm;
  }
}
</style>
