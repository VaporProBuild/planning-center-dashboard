<script setup lang="ts">
import { computed, useSlots } from 'vue'
import CardBoxComponentBody from '@/components/CardBoxComponentBody.vue'
import CardBoxComponentFooter from '@/components/CardBoxComponentFooter.vue'

const props = withDefaults(
  defineProps<{
    rounded?: string
    hasTable?: boolean
    isHoverable?: boolean
  }>(),
  {
    rounded: 'rounded-2xl',
  },
)

const slots = useSlots()

const hasFooterSlot = computed(() => !!slots.footer?.())

const componentClass = computed(() => {
  const base = [props.rounded, 'flex-col', 'dark:bg-slate-900/70']

  if (props.isHoverable) {
    base.push('hover:shadow-lg transition-shadow duration-500')
  }

  return base
})
</script>

<template>
  <div :class="componentClass" class="flex bg-white">
    <CardBoxComponentBody :no-padding="hasTable">
      <slot />
    </CardBoxComponentBody>
    <CardBoxComponentFooter v-if="hasFooterSlot">
      <slot name="footer" />
    </CardBoxComponentFooter>
  </div>
</template>
