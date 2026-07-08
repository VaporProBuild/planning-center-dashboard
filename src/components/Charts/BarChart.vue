<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Chart,
  BarElement,
  BarController,
  LinearScale,
  CategoryScale,
  Tooltip,
  type ChartData,
} from 'chart.js'

const props = defineProps<{
  data: ChartData<'bar'>
}>()

const root = ref<HTMLCanvasElement | null>(null)

let chart: Chart<'bar'> | undefined

Chart.register(BarElement, BarController, LinearScale, CategoryScale, Tooltip)

onMounted(() => {
  if (!root.value) return
  chart = new Chart<'bar'>(root.value, {
    type: 'bar',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
        x: {
          display: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  })
})

onBeforeUnmount(() => {
  chart?.destroy()
})

const chartData = computed(() => props.data)

watch(chartData, (data) => {
  if (chart) {
    chart.data = data
    chart.update()
  }
})
</script>

<template>
  <div style="position: relative">
    <canvas ref="root" />
  </div>
</template>
