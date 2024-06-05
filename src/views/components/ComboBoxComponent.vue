<script setup>
import { computed, ref, watch } from 'vue'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  onChange: {
    type: Function,
    required: false,
    default: () => {}
  }
})

const selectedOption = ref(props.value)
const query = ref('')
const optionsIncludingQuery = computed(() => {
  if (query.value === '') return props.options
  if (props.options.includes(query.value)) return props.options
  return [query.value, ...props.options]
})

const filteredOptions = computed(() =>
  query.value === ''
    ? optionsIncludingQuery.value
    : optionsIncludingQuery.value.filter((op) => {
        return op.toLowerCase().includes(query.value.toLowerCase())
      })
)

watch(selectedOption, (newValue) => {
  props.onChange(newValue)
})
</script>

<template>
  <Combobox v-model="selectedOption">
    <div
      class="hover:border-primary focus:border-primary focus:ring-primary relative w-full overflow-hidden rounded-md border border-gray-400 shadow transition-all delay-75 hover:border-2 sm:text-sm">
      <ComboboxInput
        @change="query = $event.target.value"
        placeholder="Start typing to filter..."
        class="w-full border-none focus:ring-0" />
      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
        <font-awesome-icon icon="fa-solid fa-caret-down" class="h-5 w-5 text-gray-400" aria-hidden="true" />
      </ComboboxButton>
    </div>

    <ComboboxOptions
      class="scrollbox border-secondary mt-1 max-h-40 overflow-y-auto overflow-x-hidden rounded-md border-2 shadow">
      <ComboboxOption
        v-for="op in filteredOptions"
        :key="op"
        :value="op"
        class="hover:bg-primary flex items-center justify-between px-3 py-2 text-sm font-medium hover:text-white">
        <span>{{ op }}</span>
        <font-awesome-icon icon="fa-solid fa-check" v-show="op === selectedOption" />
      </ComboboxOption>
    </ComboboxOptions>
  </Combobox>
</template>
