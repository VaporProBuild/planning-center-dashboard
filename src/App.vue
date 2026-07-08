<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useDarkModeStore } from '@/stores/darkMode'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'

const authStore = useAuthStore()
const darkModeStore = useDarkModeStore()

onMounted(() => {
  darkModeStore.init()
})
</script>

<template>
  <LayoutAuthenticated v-if="authStore.isAuthenticated">
    <RouterView />
  </LayoutAuthenticated>
  <RouterView v-else />
</template>
