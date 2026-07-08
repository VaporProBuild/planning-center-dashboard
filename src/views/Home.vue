<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mdiAccountMultiple } from '@mdi/js'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'

interface Person {
  id: string
  attributes?: { name?: string }
}

const authStore = useAuthStore()
const loading = ref(true)
const error = ref<string | null>(null)
const people = ref<Person[]>([])

onMounted(async () => {
  const response = await api.getPeople()
  if (response.data) {
    const dataArray = (response.data as Record<string, unknown>).data
    people.value = Array.isArray(dataArray) ? (dataArray as Person[]) : []
  } else {
    error.value = response.error ?? 'Failed to fetch people'
  }
  loading.value = false
})
</script>

<template>
  <SectionMain>
    <SectionTitleLineWithButton
      :icon="mdiAccountMultiple"
      :title="`Welcome, ${authStore.user?.name ?? ''}`"
      main
    />

    <CardBox>
      <h2 class="mb-4 text-xl font-semibold text-gray-700 dark:text-slate-200">People</h2>

      <p v-if="loading" class="text-gray-500 dark:text-slate-400">Loading...</p>
      <p v-else-if="error" class="text-red-500">{{ error }}</p>
      <ul v-else-if="people.length > 0" class="divide-y divide-gray-100 dark:divide-slate-700">
        <li
          v-for="person in people"
          :key="person.id"
          class="py-2 text-gray-700 dark:text-slate-300"
        >
          {{ person.attributes?.name }}
        </li>
      </ul>
      <p v-else class="text-gray-500 dark:text-slate-400">No people found.</p>
    </CardBox>
  </SectionMain>
</template>
