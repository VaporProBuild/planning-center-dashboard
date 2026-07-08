<script setup lang="ts">
import AsideMenuLayer from '@/components/AsideMenuLayer.vue'
import OverlayLayer from '@/components/OverlayLayer.vue'
import type { MenuAsideItem } from '@/menuAside'

defineProps<{
  menu: MenuAsideItem[]
  menuBottom?: MenuAsideItem[]
  isAsideMobileExpanded?: boolean
  isAsideLgActive?: boolean
}>()

const emit = defineEmits<{
  'menu-click': [event: MouseEvent, item: MenuAsideItem]
  'aside-lg-close-click': [event: MouseEvent]
}>()

function menuClick(event: MouseEvent, item: MenuAsideItem) {
  emit('menu-click', event, item)
}

function asideLgCloseClick(event: MouseEvent) {
  emit('aside-lg-close-click', event)
}
</script>

<template>
  <AsideMenuLayer
    :menu="menu"
    :menu-bottom="menuBottom"
    :class="[
      isAsideMobileExpanded ? 'left-0' : '-left-60 lg:left-0',
      { 'lg:hidden xl:flex': !isAsideLgActive },
    ]"
    @menu-click="menuClick"
    @aside-lg-close-click="asideLgCloseClick"
  />
  <OverlayLayer v-if="isAsideLgActive" z-index="z-30" @overlay-click="asideLgCloseClick" />
</template>
