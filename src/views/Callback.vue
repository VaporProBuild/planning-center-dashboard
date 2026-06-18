<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { handleCallback } from '@/services/oauth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const user = await handleCallback()
    await authStore.initializeWithUser(user)
    router.push('/')
  } catch {
    authStore.error = 'Authentication failed. Please try again.'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }
})
</script>

<template>
  <p>Authenticating...</p>
</template>
