<script setup lang="ts">
withDefaults(
  defineProps<{
    noWrap?: boolean
    type?: string
  }>(),
  {
    type: 'justify-start',
  },
)
</script>

<template>
  <div
    class="-mb-3 flex flex-wrap items-center [&>*]:mr-3 [&>*]:mb-3 [&>*]:last:mr-0"
    :class="[type, noWrap ? 'flex-nowrap' : '']"
  >
    <slot />
  </div>
</template>
