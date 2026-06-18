<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { initiateLogin } from '@/services/oauth'

const authStore = useAuthStore()
const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true
  try {
    await initiateLogin()
  } catch {
    authStore.error = 'Failed to initiate login. Please try again.'
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login">
    <h1>Planning Center Dashboard</h1>

    <p v-if="authStore.error" class="error">{{ authStore.error }}</p>

    <button :disabled="isLoading" @click="handleLogin">
      {{ isLoading ? 'Redirecting...' : 'Sign in with Planning Center' }}
    </button>
  </div>
</template>

<style scoped>
.login {
  margin-top: 4rem;
  text-align: center;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.error {
  color: #c33;
  margin-bottom: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
