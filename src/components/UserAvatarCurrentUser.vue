<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import UserAvatar from '@/components/UserAvatar.vue'

const authStore = useAuthStore()
</script>

<template>
  <UserAvatar :username="authStore.user?.name ?? 'User'" :avatar="authStore.user?.avatar">
    <slot />
  </UserAvatar>
</template>
