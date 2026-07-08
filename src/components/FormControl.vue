<script setup lang="ts">
import { computed } from 'vue'
import FormControlIcon from '@/components/FormControlIcon.vue'

interface SelectOption {
  id: string
  label: string
}

const props = withDefaults(
  defineProps<{
    name?: string
    id?: string
    icon?: string
    type?: string
    modelValue?: string | number
    min?: string
    max?: string
    options?: SelectOption[]
    borderless?: boolean
    transparent?: boolean
  }>(),
  {
    type: 'text',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const computedValue = computed({
  get: () => props.modelValue ?? '',
  set: (value) => emit('update:modelValue', value),
})

const computedType = computed(() => (props.options ? 'select' : props.type))

const inputElClass = computed(() => {
  const base = [
    'px-3 py-2 max-w-full focus:ring-3 focus:outline-hidden border-gray-300 rounded-sm w-full h-12',
    'dark:placeholder-gray-400',
    props.borderless ? 'border-0' : 'border',
    props.transparent ? 'bg-transparent' : 'bg-white dark:bg-slate-800',
  ]

  if (props.icon) {
    base.push('pl-10')
  }

  return base
})
</script>

<template>
  <div class="relative">
    <select
      v-if="computedType === 'select'"
      :id="id"
      v-model="computedValue"
      :name="name"
      :class="inputElClass"
    >
      <option v-for="option in options" :key="option.id" :value="option.id">
        {{ option.label }}
      </option>
    </select>
    <input
      v-else
      :id="id"
      v-model="computedValue"
      :name="name"
      :type="computedType"
      :min="min"
      :max="max"
      :class="inputElClass"
    />
    <FormControlIcon v-if="icon" :icon="icon" />
  </div>
</template>
