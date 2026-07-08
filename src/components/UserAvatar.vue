<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  username: string
  avatar?: string
}>()

// Renders initials locally instead of calling a third-party avatar API with
// the user's real name, so no name data ever leaves the app.
const initials = computed(() => {
  const parts = props.username.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts
  return (
    letters
      .map((part) => part?.[0] ?? '')
      .join('')
      .toUpperCase() || '?'
  )
})

const backgroundColor = computed(() => {
  let hash = 0
  for (const char of props.username) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 55%, 45%)`
})
</script>

<template>
  <div>
    <img
      v-if="avatar"
      :src="avatar"
      :alt="username"
      class="block h-auto w-full max-w-full rounded-full bg-gray-100 dark:bg-slate-800"
    />
    <div
      v-else
      class="flex aspect-square w-full items-center justify-center rounded-full text-sm font-semibold text-white"
      :style="{ backgroundColor }"
    >
      {{ initials }}
    </div>
    <slot />
  </div>
</template>
