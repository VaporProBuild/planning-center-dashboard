<script setup lang="ts">
import { ref } from 'vue'
import { mdiClose, mdiDotsVertical } from '@mdi/js'
import { containerMaxW } from '@/config'
import BaseIcon from '@/components/BaseIcon.vue'
import NavBarMenuList from '@/components/NavBarMenuList.vue'
import NavBarItemPlain from '@/components/NavBarItemPlain.vue'
import type { MenuNavBarItem } from '@/menuNavBar'

defineProps<{
  menu: MenuNavBarItem[]
  pageTitle?: string
}>()

const emit = defineEmits<{
  'menu-click': [event: MouseEvent, item: MenuNavBarItem]
}>()

function menuClick(event: MouseEvent, item: MenuNavBarItem) {
  emit('menu-click', event, item)
}

const isMenuNavBarActive = ref(false)
</script>

<template>
  <nav class="fixed inset-x-0 top-0 z-30 h-14 w-screen bg-gray-50 lg:w-auto dark:bg-slate-800">
    <div class="flex lg:items-stretch" :class="containerMaxW">
      <div class="flex h-14 flex-1 items-stretch">
        <slot />
        <NavBarItemPlain v-if="pageTitle" use-margin class="hidden cursor-default sm:flex">
          <span class="font-semibold text-gray-700 dark:text-slate-200">{{ pageTitle }}</span>
        </NavBarItemPlain>
      </div>
      <div class="flex h-14 flex-none items-stretch lg:hidden">
        <NavBarItemPlain @click.prevent="isMenuNavBarActive = !isMenuNavBarActive">
          <BaseIcon :path="isMenuNavBarActive ? mdiClose : mdiDotsVertical" size="24" />
        </NavBarItemPlain>
      </div>
      <div
        class="absolute top-14 left-0 max-h-[calc(100dvh-56px)] w-screen overflow-y-auto bg-gray-50 shadow-lg lg:static lg:flex lg:w-auto lg:overflow-visible lg:shadow-none dark:bg-slate-800"
        :class="[isMenuNavBarActive ? 'block' : 'hidden']"
      >
        <NavBarMenuList :menu="menu" @menu-click="menuClick" />
      </div>
    </div>
  </nav>
</template>
