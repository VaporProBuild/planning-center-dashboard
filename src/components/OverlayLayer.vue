<script setup lang="ts">
withDefaults(
  defineProps<{
    zIndex?: string
  }>(),
  {
    zIndex: 'z-50',
  },
)

const emit = defineEmits<{
  'overlay-click': [event: MouseEvent]
}>()

function overlayClick(event: MouseEvent) {
  emit('overlay-click', event)
}
</script>

<template>
  <div :class="zIndex" class="fixed inset-0 flex flex-col items-center justify-center">
    <div
      class="absolute inset-0 bg-linear-to-tr from-gray-700 via-gray-900 to-gray-700 opacity-90"
      @click="overlayClick"
    />
    <slot />
  </div>
</template>
