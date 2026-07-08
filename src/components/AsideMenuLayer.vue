<script setup lang="ts">
import { mdiClose } from '@mdi/js'
import AsideMenuList from '@/components/AsideMenuList.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import type { MenuAsideItem } from '@/menuAside'

defineProps<{
  menu: MenuAsideItem[]
  menuBottom?: MenuAsideItem[]
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
  <aside id="aside" class="fixed top-0 z-40 flex h-screen w-60 overflow-hidden lg:py-2 lg:pl-2">
    <div class="aside flex flex-1 flex-col overflow-hidden lg:rounded-2xl">
      <div class="aside-brand flex h-14 flex-row items-center justify-between">
        <div class="flex-1 text-center lg:pl-6 lg:text-left xl:pl-0 xl:text-center">
          <b class="font-black">PCO Dashboard</b>
        </div>
        <button class="hidden p-3 lg:inline-block xl:hidden" @click.prevent="asideLgCloseClick">
          <BaseIcon :path="mdiClose" />
        </button>
      </div>
      <div class="flex-1 overflow-x-hidden overflow-y-auto">
        <AsideMenuList :menu="menu" @menu-click="menuClick" />
      </div>

      <AsideMenuList v-if="menuBottom" :menu="menuBottom" @menu-click="menuClick" />
    </div>
  </aside>
</template>
