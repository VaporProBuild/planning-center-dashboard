<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { mdiMinus, mdiPlus } from '@mdi/js'
import { getButtonColor } from '@/colors'
import BaseIcon from '@/components/BaseIcon.vue'
import AsideMenuList from '@/components/AsideMenuList.vue'
import type { MenuAsideItem } from '@/menuAside'

const props = defineProps<{
  item: MenuAsideItem
  isDropdownList?: boolean
}>()

const emit = defineEmits<{
  'menu-click': [event: MouseEvent, item: MenuAsideItem]
}>()

const hasColor = computed(() => !!props.item.color)

const asideMenuItemActiveStyle = computed(() =>
  hasColor.value ? '' : 'aside-menu-item-active font-bold',
)

const isDropdownActive = ref(false)

const componentClass = computed(() => [
  props.isDropdownList ? 'py-3 px-6 text-sm' : 'py-3',
  hasColor.value
    ? getButtonColor(props.item.color ?? '', false, true)
    : 'aside-menu-item dark:text-slate-300 dark:hover:text-white',
])

const hasDropdown = computed(() => !!props.item.menu)

function menuClick(event: MouseEvent) {
  emit('menu-click', event, props.item)

  if (hasDropdown.value) {
    isDropdownActive.value = !isDropdownActive.value
  }
}
</script>

<template>
  <li>
    <component
      :is="item.to ? RouterLink : 'a'"
      v-slot="vSlot"
      :to="item.to ?? null"
      :href="item.href ?? null"
      :target="item.target ?? null"
      class="flex cursor-pointer"
      :class="componentClass"
      @click="menuClick"
    >
      <BaseIcon
        v-if="item.icon"
        :path="item.icon"
        class="flex-none"
        :class="[vSlot && vSlot.isExactActive ? asideMenuItemActiveStyle : '']"
        w="w-16"
        :size="18"
      />
      <span
        class="line-clamp-1 grow text-ellipsis"
        :class="[
          { 'pr-6': !hasDropdown },
          vSlot && vSlot.isExactActive ? asideMenuItemActiveStyle : '',
        ]"
        >{{ item.label }}</span
      >
      <BaseIcon
        v-if="hasDropdown"
        :path="isDropdownActive ? mdiMinus : mdiPlus"
        class="flex-none"
        :class="[vSlot && vSlot.isExactActive ? asideMenuItemActiveStyle : '']"
        w="w-12"
      />
    </component>
    <AsideMenuList
      v-if="hasDropdown && item.menu"
      :menu="item.menu"
      :class="['aside-menu-dropdown', isDropdownActive ? 'block dark:bg-slate-800/50' : 'hidden']"
      is-dropdown-list
    />
  </li>
</template>
