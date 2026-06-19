<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '@/services/api'

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
    selectedGroupTypeId.value = groupTypes.value[0].id
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
  <div class="page">
    <h1>Life Group Engagement</h1>

    <p v-if="loading" class="status">Loading&hellip;</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else>
      <div class="controls">
        <label for="group-type">Group type</label>
        <select id="group-type" v-model="selectedGroupTypeId">
          <option v-for="type in groupTypes" :key="type.id" :value="type.id">
            {{ type.attributes.name }}
          </option>
        </select>
      </div>

      <div v-if="loadingGroups" class="status">Loading groups&hellip;</div>

      <div v-else class="stat-card">
        <div class="donut" :style="dashStyle">
          <div class="donut-hole">
            <span class="pct">{{ percentage }}%</span>
          </div>
        </div>

        <div class="details">
          <p class="label">of your church family is in a {{ selectedGroupTypeName }}</p>
          <p class="count">
            <strong>{{ totalInGroups.toLocaleString() }}</strong> memberships across
            <strong>{{ groups.length }}</strong> group{{ groups.length !== 1 ? 's' : '' }}
          </p>
          <p class="count">
            out of <strong>{{ totalPeople.toLocaleString() }}</strong> total people
          </p>
          <p v-if="totalInGroups > totalPeople" class="note">
            * Count exceeds total people because members in multiple groups are counted once per
            group.
          </p>
        </div>
      </div>

      <div v-if="!loadingGroups && groups.length > 0" class="group-list">
        <h2>Groups breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Members</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="group in groups" :key="group.id">
              <td>{{ group.attributes.name }}</td>
              <td>
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
      </div>

      <p v-else-if="!loadingGroups && groups.length === 0" class="status">
        No groups found for this type.
      </p>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 1.5rem;
}

h2 {
  margin: 2rem 0 0.75rem;
}

.status {
  color: #666;
}

.error {
  color: #c33;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

label {
  font-weight: 600;
}

select {
  padding: 0.4rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

/* --- Stat card --- */
.stat-card {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
}

/* --- Donut chart (CSS only) --- */
.donut {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-hole {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pct {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

/* --- Detail text --- */
.details {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.label {
  font-size: 1.1rem;
  color: #374151;
}

.count {
  color: #4b5563;
}

.note {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

/* --- Table --- */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

th,
td {
  padding: 0.55rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
}

td:last-child,
th:last-child {
  text-align: right;
}

@media (max-width: 520px) {
  .stat-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
