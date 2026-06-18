<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import { logout } from '@/services/oauth'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  authStore.logout()
  await logout()
  router.push('/login')
}
</script>

<template>
  <div id="app">
    <header v-if="authStore.isAuthenticated">
      <span>{{ authStore.user?.name }}</span>
      <button @click="handleLogout">Sign out</button>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  font-family: sans-serif;
  max-width: 700px;
  margin: 0 auto;
  padding: 1rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1.5rem;
}

button {
  background: none;
  border: 1px solid #999;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
