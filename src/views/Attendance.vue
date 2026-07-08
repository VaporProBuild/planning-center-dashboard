<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { mdiChartLine } from '@mdi/js'
import { api } from '@/services/api'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import FormControl from '@/components/FormControl.vue'
import BarChart from '@/components/Charts/BarChart.vue'

type Granularity = 'day' | 'week' | 'month'
type PresetKey = '7d' | '30d' | '90d' | '12m'
type DataSource = 'check_ins' | 'headcounts'

interface Bucket {
  label: string
  start: Date
  end: Date
}

interface ToggleOption {
  key: string
  label: string
  enabled: boolean
}

const presets: { key: PresetKey; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: '12m', label: 'Last 12 months' },
]

const selectedPreset = ref<PresetKey | 'custom'>('30d')

const dataSource = ref<DataSource>('check_ins')

// Planning Center Check-Ins classifies every individual check-in as one of these three kinds.
const kindOptions = ref<ToggleOption[]>([
  { key: 'Regular', label: 'Regular', enabled: true },
  { key: 'Guest', label: 'Guest', enabled: true },
  { key: 'Volunteer', label: 'Volunteer', enabled: true },
])
const selectedKinds = computed(() => kindOptions.value.filter((kind) => kind.enabled))

// Headcount categories (standard Regular/Guest/Volunteer plus any custom ones)
// are per-organization, so they're fetched from the API rather than hardcoded.
const attendanceTypeOptions = ref<ToggleOption[]>([])
const attendanceTypesLoading = ref(false)
const attendanceTypesError = ref<string | null>(null)
const selectedAttendanceTypes = computed(() =>
  attendanceTypeOptions.value.filter((type) => type.enabled),
)

async function ensureAttendanceTypesLoaded() {
  if (attendanceTypeOptions.value.length > 0 || attendanceTypesLoading.value) return

  attendanceTypesLoading.value = true
  attendanceTypesError.value = null

  const resp = await api.getAttendanceTypes()
  if (resp.error) {
    attendanceTypesError.value = `Could not load headcount categories: ${resp.error}`
    attendanceTypesLoading.value = false
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (resp.data as any)?.data
  const list = Array.isArray(data) ? data : []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attendanceTypeOptions.value = list.map((item: any) => ({
    key: String(item.id),
    label: item.attributes?.name ?? `Type ${item.id}`,
    enabled: true,
  }))
  attendanceTypesLoading.value = false
}

function toggleOption(options: ToggleOption[], key: string) {
  const option = options.find((item) => item.key === key)
  if (option) option.enabled = !option.enabled
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = new Date()
const customStart = ref(
  toDateInputValue(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())),
)
const customEnd = ref(toDateInputValue(today))

const loading = ref(true)
const error = ref<string | null>(null)
const buckets = ref<{ label: string; count: number }[]>([])

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function buildBuckets(rangeStart: Date, rangeEnd: Date, granularity: Granularity): Bucket[] {
  const result: Bucket[] = []
  const end = startOfDay(rangeEnd)

  if (granularity === 'month') {
    const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1)
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1)
    while (cursor <= lastMonth) {
      const bucketStart = new Date(cursor)
      const bucketEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
      result.push({
        label: bucketStart.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
        start: bucketStart,
        end: bucketEnd,
      })
      cursor.setMonth(cursor.getMonth() + 1)
    }
    return result
  }

  const stepDays = granularity === 'week' ? 7 : 1
  const cursor = startOfDay(rangeStart)
  while (cursor <= end) {
    const bucketStart = new Date(cursor)
    const bucketEnd = new Date(cursor)
    bucketEnd.setDate(bucketEnd.getDate() + stepDays)
    result.push({
      label: bucketStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      start: bucketStart,
      end: bucketEnd,
    })
    cursor.setDate(cursor.getDate() + stepDays)
  }
  return result
}

const activeRange = computed<{ start: Date; end: Date; granularity: Granularity }>(() => {
  const now = new Date()

  if (selectedPreset.value === '7d') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
    return { start, end: now, granularity: 'day' }
  }
  if (selectedPreset.value === '30d') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
    return { start, end: now, granularity: 'day' }
  }
  if (selectedPreset.value === '90d') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89)
    return { start, end: now, granularity: 'week' }
  }
  if (selectedPreset.value === '12m') {
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    return { start, end: now, granularity: 'month' }
  }

  // Custom range
  const start = new Date(`${customStart.value}T00:00:00`)
  const end = new Date(`${customEnd.value}T00:00:00`)
  const spanDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000))
  const granularity: Granularity = spanDays <= 31 ? 'day' : spanDays <= 180 ? 'week' : 'month'
  return { start, end, granularity }
})

const totalCount = computed(() => buckets.value.reduce((sum, bucket) => sum + bucket.count, 0))

const chartData = computed(() => ({
  labels: buckets.value.map((bucket) => bucket.label),
  datasets: [
    {
      label: dataSource.value === 'headcounts' ? 'Headcount' : 'Check-ins',
      backgroundColor: '#3b82f6',
      borderRadius: 4,
      data: buckets.value.map((bucket) => bucket.count),
    },
  ],
}))

// Planning Center allows 100 requests per 20 seconds; capping how many of our
// own requests are ever in flight at once keeps us well under that even when
// a custom range needs dozens of buckets times several check-in kinds.
const MAX_CONCURRENT_REQUESTS = 6

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await fn(items[index] as T)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

interface CheckInFetchTask {
  bucketIndex: number
  gte: string
  lte: string
  kind?: string
}

async function fetchCheckInsAttendance(ranges: Bucket[], generation: number) {
  if (selectedKinds.value.length === 0) {
    if (generation === fetchGeneration) {
      buckets.value = ranges.map((bucket) => ({ label: bucket.label, count: 0 }))
      loading.value = false
    }
    return
  }

  // Querying with no kind filter is one request and covers every kind, so only
  // split into per-kind requests (summed) when a strict subset is selected.
  const useKindFilter = selectedKinds.value.length !== kindOptions.value.length

  const tasks: CheckInFetchTask[] = []
  ranges.forEach((bucket, bucketIndex) => {
    const gte = bucket.start.toISOString()
    const lte = new Date(bucket.end.getTime() - 1).toISOString()
    if (useKindFilter) {
      selectedKinds.value.forEach((kind) => tasks.push({ bucketIndex, gte, lte, kind: kind.key }))
    } else {
      tasks.push({ bucketIndex, gte, lte })
    }
  })

  const results = await mapWithConcurrency(tasks, MAX_CONCURRENT_REQUESTS, (task) =>
    api.getCheckInsCount({ gte: task.gte, lte: task.lte, kind: task.kind }),
  )

  if (generation !== fetchGeneration) return

  const failed = results.find((result) => result.error)
  if (failed) {
    error.value = `Could not load attendance: ${failed.error}`
    loading.value = false
    return
  }

  const totals = new Array(ranges.length).fill(0) as number[]
  tasks.forEach((task, i) => {
    totals[task.bucketIndex] = (totals[task.bucketIndex] ?? 0) + (results[i]?.data ?? 0)
  })

  buckets.value = ranges.map((bucket, index) => ({
    label: bucket.label,
    count: totals[index] ?? 0,
  }))

  loading.value = false
}

interface HeadcountEntry {
  total: number
  attendanceTypeId: string | null
}

async function fetchAllHeadcounts(
  gte: string,
  lte: string,
): Promise<{ data?: HeadcountEntry[]; error?: string }> {
  const perPage = 100
  let offset = 0
  const all: HeadcountEntry[] = []

  while (true) {
    const resp = await api.getHeadcounts({ gte, lte, perPage, offset })
    if (resp.error) return { error: resp.error }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = resp.data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const batch: any[] = Array.isArray(body?.data) ? body.data : []
    for (const item of batch) {
      all.push({
        total: item.attributes?.total ?? 0,
        attendanceTypeId: item.relationships?.attendance_type?.data?.id
          ? String(item.relationships.attendance_type.data.id)
          : null,
      })
    }

    const totalCount: number = body?.meta?.total_count ?? 0
    if (all.length >= totalCount || batch.length === 0) break
    offset += perPage
  }

  return { data: all }
}

async function fetchHeadcountsAttendance(ranges: Bucket[], generation: number) {
  // If categories have loaded and the user deselected all of them, there's
  // nothing to sum. While categories are still loading, fall through and sum
  // every entry so the chart isn't stuck empty in the meantime.
  if (attendanceTypeOptions.value.length > 0 && selectedAttendanceTypes.value.length === 0) {
    if (generation === fetchGeneration) {
      buckets.value = ranges.map((bucket) => ({ label: bucket.label, count: 0 }))
      loading.value = false
    }
    return
  }

  const selectedTypeIds = new Set(selectedAttendanceTypes.value.map((type) => type.key))

  const results = await mapWithConcurrency(ranges, MAX_CONCURRENT_REQUESTS, (bucket) =>
    fetchAllHeadcounts(
      bucket.start.toISOString(),
      new Date(bucket.end.getTime() - 1).toISOString(),
    ),
  )

  if (generation !== fetchGeneration) return

  const failed = results.find((result) => result.error)
  if (failed) {
    error.value = `Could not load attendance: ${failed.error}`
    loading.value = false
    return
  }

  buckets.value = ranges.map((bucket, index) => {
    const entries = results[index]?.data ?? []
    const count = entries.reduce((sum, entry) => {
      if (
        selectedTypeIds.size > 0 &&
        entry.attendanceTypeId &&
        !selectedTypeIds.has(entry.attendanceTypeId)
      ) {
        return sum
      }
      return sum + entry.total
    }, 0)
    return { label: bucket.label, count }
  })

  loading.value = false
}

// Guards against a slower, superseded fetch (e.g. triggered by a preset click
// immediately followed by a kind toggle) overwriting a newer one's results.
let fetchGeneration = 0

async function fetchAttendance() {
  const generation = ++fetchGeneration

  loading.value = true
  error.value = null

  const { start, end, granularity } = activeRange.value
  const ranges = buildBuckets(start, end, granularity)

  if (ranges.length === 0) {
    if (generation === fetchGeneration) {
      buckets.value = []
      loading.value = false
    }
    return
  }

  if (dataSource.value === 'headcounts') {
    await fetchHeadcountsAttendance(ranges, generation)
  } else {
    await fetchCheckInsAttendance(ranges, generation)
  }
}

function selectPreset(preset: PresetKey) {
  selectedPreset.value = preset
}

watch(dataSource, (source) => {
  if (source === 'headcounts') {
    ensureAttendanceTypesLoaded()
  }
})

watch(
  [selectedPreset, customStart, customEnd, selectedKinds, dataSource, selectedAttendanceTypes],
  () => {
    fetchAttendance()
  },
)

onMounted(() => {
  fetchAttendance()
})
</script>

<template>
  <SectionMain>
    <SectionTitleLineWithButton :icon="mdiChartLine" title="Attendance" main />

    <CardBox class="mb-6">
      <div class="mb-4">
        <p class="mb-2 text-sm font-medium text-gray-600 dark:text-slate-300">Data source</p>
        <BaseButtons>
          <BaseButton
            label="Check-ins"
            :color="dataSource === 'check_ins' ? 'info' : 'whiteDark'"
            :active="dataSource === 'check_ins'"
            small
            @click="dataSource = 'check_ins'"
          />
          <BaseButton
            label="Headcounts"
            :color="dataSource === 'headcounts' ? 'info' : 'whiteDark'"
            :active="dataSource === 'headcounts'"
            small
            @click="dataSource = 'headcounts'"
          />
        </BaseButtons>
      </div>

      <BaseButtons class="mb-4">
        <BaseButton
          v-for="preset in presets"
          :key="preset.key"
          :label="preset.label"
          :color="selectedPreset === preset.key ? 'info' : 'whiteDark'"
          :active="selectedPreset === preset.key"
          small
          @click="selectPreset(preset.key)"
        />
        <BaseButton
          label="Custom range"
          :color="selectedPreset === 'custom' ? 'info' : 'whiteDark'"
          :active="selectedPreset === 'custom'"
          small
          @click="selectedPreset = 'custom'"
        />
      </BaseButtons>

      <div v-if="selectedPreset === 'custom'" class="mb-4 flex flex-wrap items-center gap-3">
        <label class="text-sm font-medium text-gray-600 dark:text-slate-300">
          From
          <FormControl v-model="customStart" type="date" :max="customEnd" class="mt-1 w-44" />
        </label>
        <label class="text-sm font-medium text-gray-600 dark:text-slate-300">
          To
          <FormControl v-model="customEnd" type="date" :min="customStart" class="mt-1 w-44" />
        </label>
      </div>

      <div v-if="dataSource === 'check_ins'" class="mb-4">
        <p class="mb-2 text-sm font-medium text-gray-600 dark:text-slate-300">Check-in types</p>
        <BaseButtons>
          <BaseButton
            v-for="kind in kindOptions"
            :key="kind.key"
            :label="kind.label"
            :color="kind.enabled ? 'info' : 'whiteDark'"
            :active="kind.enabled"
            small
            @click="toggleOption(kindOptions, kind.key)"
          />
        </BaseButtons>
      </div>

      <div v-else class="mb-4">
        <p class="mb-2 text-sm font-medium text-gray-600 dark:text-slate-300">
          Headcount categories
        </p>
        <p v-if="attendanceTypesLoading" class="text-sm text-gray-500 dark:text-slate-400">
          Loading categories&hellip;
        </p>
        <p v-else-if="attendanceTypesError" class="text-sm text-red-500">
          {{ attendanceTypesError }}
        </p>
        <p
          v-else-if="attendanceTypeOptions.length === 0"
          class="text-sm text-gray-500 dark:text-slate-400"
        >
          No headcount categories found for your organization.
        </p>
        <BaseButtons v-else>
          <BaseButton
            v-for="type in attendanceTypeOptions"
            :key="type.key"
            :label="type.label"
            :color="type.enabled ? 'info' : 'whiteDark'"
            :active="type.enabled"
            small
            @click="toggleOption(attendanceTypeOptions, type.key)"
          />
        </BaseButtons>
      </div>

      <p v-if="loading" class="text-gray-500 dark:text-slate-400">Loading&hellip;</p>
      <p v-else-if="error" class="text-red-500">{{ error }}</p>
      <p
        v-else-if="
          (dataSource === 'check_ins' && selectedKinds.length === 0) ||
          (dataSource === 'headcounts' &&
            attendanceTypeOptions.length > 0 &&
            selectedAttendanceTypes.length === 0)
        "
        class="text-gray-500 dark:text-slate-400"
      >
        Select at least one {{ dataSource === 'headcounts' ? 'category' : 'check-in type' }} to see
        data.
      </p>
      <template v-else>
        <p class="mb-4 text-gray-600 dark:text-slate-300">
          <strong class="text-xl text-gray-800 dark:text-slate-100">{{
            totalCount.toLocaleString()
          }}</strong>
          total {{ dataSource === 'headcounts' ? 'headcount' : 'check-ins' }} over this period
        </p>
        <BarChart :data="chartData" class="h-80" />
      </template>
    </CardBox>
  </SectionMain>
</template>
