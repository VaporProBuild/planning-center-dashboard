<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getButtonColor } from '@/colors'
import BaseIcon from '@/components/BaseIcon.vue'

const props = withDefaults(
  defineProps<{
    label?: string | number
    icon?: string
    iconSize?: string | number
    href?: string
    target?: string
    to?: string | Record<string, unknown>
    type?: string
    color?: string
    small?: boolean
    outline?: boolean
    active?: boolean
    disabled?: boolean
    roundedFull?: boolean
  }>(),
  {
    color: 'white',
  },
)

const is = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})

const computedType = computed(() => (is.value === 'button' ? (props.type ?? 'button') : null))

const labelClass = computed(() => (props.small && props.icon ? 'px-1' : 'px-2'))

const componentClass = computed(() => {
  const base = [
    'inline-flex',
    'justify-center',
    'items-center',
    'whitespace-nowrap',
    'transition-colors',
    'focus:outline-hidden',
    'focus:ring-3',
    'border',
    props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    props.roundedFull ? 'rounded-full' : 'rounded-sm',
    getButtonColor(props.color, !!props.outline, !props.disabled, props.active),
  ]

  if (!props.label && props.icon) {
    base.push('p-1')
  } else if (props.small) {
    base.push('text-sm', props.roundedFull ? 'px-3 py-1' : 'p-1')
  } else {
    base.push('py-2', props.roundedFull ? 'px-6' : 'px-3')
  }

  if (props.disabled) {
    base.push(props.outline ? 'opacity-50' : 'opacity-70')
  }

  return base
})
</script>

<template>
  <component
    :is="is"
    :class="componentClass"
    :href="href"
    :type="computedType"
    :to="to"
    :target="target"
    :disabled="disabled"
  >
    <BaseIcon v-if="icon" :path="icon" :size="iconSize" />
    <span v-if="label" :class="labelClass">{{ label }}</span>
  </component>
</template>
