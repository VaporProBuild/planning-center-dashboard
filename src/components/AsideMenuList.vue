<script setup lang="ts">
import AsideMenuItem from '@/components/AsideMenuItem.vue'
import type { MenuAsideItem } from '@/menuAside'

defineProps<{
  isDropdownList?: boolean
  menu: MenuAsideItem[]
}>()

const emit = defineEmits<{
  'menu-click': [event: MouseEvent, item: MenuAsideItem]
}>()

function menuClick(event: MouseEvent, item: MenuAsideItem) {
  emit('menu-click', event, item)
}
</script>

<template>
  <ul>
    <AsideMenuItem
      v-for="(item, index) in menu"
      :key="index"
      :item="item"
      :is-dropdown-list="isDropdownList"
      @menu-click="menuClick"
    />
  </ul>
</template>
