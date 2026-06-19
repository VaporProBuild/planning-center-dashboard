<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'

const authStore = useAuthStore()
const loading = ref(true)
const error = ref<string | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const people = ref<any[]>([])

onMounted(async () => {
  const response = await api.getPeople()
  if (response.data) {
    const dataArray = (response.data as Record<string, unknown>).data
    people.value = Array.isArray(dataArray) ? dataArray : []
  } else {
    error.value = response.error ?? 'Failed to fetch people'
  }
  loading.value = false
})
</script>

<template>
  <div>
    <h1>Welcome, {{ authStore.user?.name }}</h1>

    <nav>
      <RouterLink to="/life-groups">Life Group Engagement</RouterLink>
    </nav>

    <h2>People</h2>

    <p v-if="loading">Loading...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <ul v-else-if="people.length > 0">
      <li v-for="person in people" :key="person.id">
        {{ person.attributes?.name }}
      </li>
    </ul>
    <p v-else>No people found.</p>
  </div>
</template>

<style scoped>
h1 {
  margin-bottom: 1rem;
}

nav {
  margin-bottom: 1.5rem;
}

nav a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

nav a:hover {
  text-decoration: underline;
}

h2 {
  margin-bottom: 0.75rem;
}

.error {
  color: #c33;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.4rem 0;
  border-bottom: 1px solid #eee;
}
</style>
