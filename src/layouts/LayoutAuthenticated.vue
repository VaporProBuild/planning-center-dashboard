<script setup lang="ts">
import { mdiForwardburger, mdiBackburger, mdiMenu } from '@mdi/js'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { menuAsideMain } from '@/menuAside'
import menuNavBar from '@/menuNavBar'
import type { MenuNavBarItem } from '@/menuNavBar'
import { useDarkModeStore } from '@/stores/darkMode'
import { useAuthStore } from '@/stores/auth'
import { logout } from '@/services/oauth'
import BaseIcon from '@/components/BaseIcon.vue'
import NavBar from '@/components/NavBar.vue'
import NavBarItemPlain from '@/components/NavBarItemPlain.vue'
import AsideMenu from '@/components/AsideMenu.vue'

const layoutAsidePadding = 'xl:pl-60'

const darkModeStore = useDarkModeStore()
const authStore = useAuthStore()

const router = useRouter()
const route = useRoute()

const pageTitle = computed(() => (route.meta.title as string | undefined) ?? '')

const isAsideMobileExpanded = ref(false)
const isAsideLgActive = ref(false)

router.beforeEach(() => {
  isAsideMobileExpanded.value = false
  isAsideLgActive.value = false
})

async function menuClick(_event: MouseEvent, item: MenuNavBarItem) {
  if (item.isToggleLightDark) {
    darkModeStore.set(null, true)
  }

  if (item.isLogout) {
    authStore.logout()
    await logout()
    router.push('/login')
  }
}
</script>

<template>
  <div
    :class="{
      'overflow-hidden lg:overflow-visible': isAsideMobileExpanded,
    }"
  >
    <div
      :class="[layoutAsidePadding, { 'ml-60 lg:ml-0': isAsideMobileExpanded }]"
      class="min-h-screen w-screen bg-gray-50 pt-14 lg:w-auto dark:bg-slate-800 dark:text-slate-100"
    >
      <NavBar
        :menu="menuNavBar"
        :page-title="pageTitle"
        :class="[layoutAsidePadding, { 'ml-60 lg:ml-0': isAsideMobileExpanded }]"
        @menu-click="menuClick"
      >
        <NavBarItemPlain
          display="flex lg:hidden"
          @click.prevent="isAsideMobileExpanded = !isAsideMobileExpanded"
        >
          <BaseIcon :path="isAsideMobileExpanded ? mdiBackburger : mdiForwardburger" size="24" />
        </NavBarItemPlain>
        <NavBarItemPlain display="hidden lg:flex xl:hidden" @click.prevent="isAsideLgActive = true">
          <BaseIcon :path="mdiMenu" size="24" />
        </NavBarItemPlain>
      </NavBar>
      <AsideMenu
        :is-aside-mobile-expanded="isAsideMobileExpanded"
        :is-aside-lg-active="isAsideLgActive"
        :menu="menuAsideMain"
        @menu-click="menuClick"
        @aside-lg-close-click="isAsideLgActive = false"
      />
      <slot />
    </div>
  </div>
</template>
