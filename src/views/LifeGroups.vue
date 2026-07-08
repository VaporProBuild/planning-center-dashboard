<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { mdiAccountGroup } from '@mdi/js'
import { api } from '@/services/api'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'

interface GroupType {
  id: string
  attributes: { name: string }
}

interface Group {
  id: string
  attributes: {
    name: string
    // Planning Center returns either of these depending on API version
    memberships_count?: number
    members_count?: number
  }
}

const loading = ref(true)
const loadingGroups = ref(false)
const error = ref<string | null>(null)
const totalPeople = ref(0)
const groupTypes = ref<GroupType[]>([])
const selectedGroupTypeId = ref('')
const groups = ref<Group[]>([])
const totalInGroups = ref(0)

const percentage = computed(() => {
  if (totalPeople.value === 0) return 0
  return Math.min(100, Math.round((totalInGroups.value / totalPeople.value) * 100))
})

// CSS conic-gradient stop for the donut chart
const dashStyle = computed(() => ({
  background: `conic-gradient(#3b82f6 ${percentage.value * 3.6}deg, #e5e7eb ${percentage.value * 3.6}deg)`,
}))

const selectedGroupTypeName = computed(
  () => groupTypes.value.find((t) => t.id === selectedGroupTypeId.value)?.attributes.name ?? '',
)

onMounted(async () => {
  const [peopleResp, typesResp] = await Promise.all([api.getPeopleCount(), api.getGroupTypes()])

  if (peopleResp.error) {
    error.value = `Could not load people count: ${peopleResp.error}`
    loading.value = false
    return
  }
  totalPeople.value = peopleResp.data ?? 0

  if (typesResp.error) {
    error.value = `Could not load group types: ${typesResp.error}`
    loading.value = false
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typesData = (typesResp.data as any)?.data
  groupTypes.value = Array.isArray(typesData) ? typesData : []

  // Default to the first group type
  if (groupTypes.value.length > 0) {
    selectedGroupTypeId.value = groupTypes.value[0]?.id ?? ''
  }

  loading.value = false
})

watch(selectedGroupTypeId, async (id) => {
  if (!id) return
  await fetchGroups(id)
})

async function fetchGroups(groupTypeId: string) {
  loadingGroups.value = true
  error.value = null
  groups.value = []
  totalInGroups.value = 0

  const perPage = 100
  let offset = 0
  const allGroups: Group[] = []

  while (true) {
    const resp = await api.getGroups({ groupTypeId, perPage, offset })
    if (resp.error) {
      error.value = `Could not load groups: ${resp.error}`
      break
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = resp.data as any
    const batch: Group[] = Array.isArray(body?.data) ? body.data : []
    allGroups.push(...batch)

    const totalCount: number = body?.meta?.total_count ?? 0
    if (allGroups.length >= totalCount || batch.length === 0) break
    offset += perPage
  }

  groups.value = allGroups
  totalInGroups.value = allGroups.reduce((sum, g) => {
    return sum + (g.attributes.memberships_count ?? g.attributes.members_count ?? 0)
  }, 0)

  loadingGroups.value = false
}
</script>

<template>
  <SectionMain>
    <SectionTitleLineWithButton :icon="mdiAccountGroup" title="Life Group Engagement" main />

    <p v-if="loading" class="text-gray-500 dark:text-slate-400">Loading&hellip;</p>
    <p v-else-if="error" class="text-red-500">{{ error }}</p>

    <template v-else>
      <div class="mb-6 flex items-center gap-3">
        <label for="group-type" class="font-semibold text-gray-700 dark:text-slate-200"
          >Group type</label
        >
        <FormControl
          id="group-type"
          v-model="selectedGroupTypeId"
          class="w-56"
          :options="groupTypes.map((type) => ({ id: type.id, label: type.attributes.name }))"
        />
      </div>

      <div v-if="loadingGroups" class="text-gray-500 dark:text-slate-400">
        Loading groups&hellip;
      </div>

      <CardBox v-else class="mb-6">
        <div class="flex flex-col items-center gap-10 sm:flex-row">
          <div
            class="flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
            :style="dashStyle"
          >
            <div
              class="flex h-28 w-28 items-center justify-center rounded-full bg-white dark:bg-slate-900"
            >
              <span class="text-3xl font-bold text-slate-800 dark:text-slate-100"
                >{{ percentage }}%</span
              >
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <p class="text-lg text-gray-700 dark:text-slate-200">
              of your church family is in a {{ selectedGroupTypeName }}
            </p>
            <p class="text-gray-600 dark:text-slate-400">
              <strong>{{ totalInGroups.toLocaleString() }}</strong> memberships across
              <strong>{{ groups.length }}</strong> group{{ groups.length !== 1 ? 's' : '' }}
            </p>
            <p class="text-gray-600 dark:text-slate-400">
              out of <strong>{{ totalPeople.toLocaleString() }}</strong> total people
            </p>
            <p v-if="totalInGroups > totalPeople" class="mt-2 text-sm text-gray-400">
              * Count exceeds total people because members in multiple groups are counted once per
              group.
            </p>
          </div>
        </div>
      </CardBox>

      <CardBox v-if="!loadingGroups && groups.length > 0" has-table>
        <h2 class="mb-3 px-6 pt-6 text-xl font-semibold text-gray-700 dark:text-slate-200">
          Groups breakdown
        </h2>
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th
                class="border-b border-gray-100 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Group
              </th>
              <th
                class="border-b border-gray-100 bg-gray-50 px-4 py-3 text-right font-semibold text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Members
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="group in groups" :key="group.id">
              <td
                class="border-b border-gray-100 px-4 py-3 text-gray-700 dark:border-slate-700 dark:text-slate-300"
              >
                {{ group.attributes.name }}
              </td>
              <td
                class="border-b border-gray-100 px-4 py-3 text-right text-gray-700 dark:border-slate-700 dark:text-slate-300"
              >
                {{
                  (
                    group.attributes.memberships_count ??
                    group.attributes.members_count ??
                    0
                  ).toLocaleString()
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </CardBox>

      <p
        v-else-if="!loadingGroups && groups.length === 0"
        class="text-gray-500 dark:text-slate-400"
      >
        No groups found for this type.
      </p>
    </template>
  </SectionMain>
</template>
