<script setup lang="ts">
import NavBarItem from '@/components/NavBarItem.vue'
import type { MenuNavBarItem } from '@/menuNavBar'

withDefaults(
  defineProps<{
    menu?: MenuNavBarItem[]
  }>(),
  {
    menu: () => [],
  },
)

const emit = defineEmits<{
  'menu-click': [event: MouseEvent, item: MenuNavBarItem]
}>()

function menuClick(event: MouseEvent, item: MenuNavBarItem) {
  emit('menu-click', event, item)
}
</script>

<template>
  <NavBarItem v-for="(item, index) in menu" :key="index" :item="item" @menu-click="menuClick" />
</template>
