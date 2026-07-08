<script setup lang="ts">
withDefaults(
  defineProps<{
    display?: string
    useMargin?: boolean
  }>(),
  {
    display: 'flex',
  },
)
</script>

<template>
  <div
    :class="[display, useMargin ? 'mx-3 my-2' : 'px-3 py-2']"
    class="navbar-item-label cursor-pointer items-center dark:text-white dark:hover:text-slate-400"
  >
    <slot />
  </div>
</template>
