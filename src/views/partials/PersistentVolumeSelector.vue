<script setup>
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { computed, ref, watch } from 'vue'
import CreatePersistentVolumeModal from '@/views/partials/CreatePersistentVolumeModal.vue'

const props = defineProps({
  selector: {
    type: String,
    required: false,
    default: 'id',
    validator: (value) => ['id', 'name'].includes(value)
  },
  onSelect: {
    type: Function,
    required: false,
    default: () => {}
  },
  showCreateLink: {
    type: Boolean,
    required: false,
    default: false
  },
  fullWidth: {
    type: Boolean,
    required: false,
    default: false
  }
})

const selectedPersistentVolume = ref('')
const { result: persistentVolumesResult, refetch: refetchPersistentVolumes } = useQuery(
  gql`
    query {
      persistentVolumes {
        id
        name
      }
    }
  `,
  null,
  {
    pollInterval: 10000,
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache'
  }
)

const persistentVolumes = computed(() => persistentVolumesResult.value?.persistentVolumes ?? [])
const getValue = (pv) => pv[props.selector]
defineExpose({
  refetch: refetchPersistentVolumes
})

watch(selectedPersistentVolume, (newVal) => {
  if (!newVal) return
  props.onSelect(newVal)
})

const createPersistentVolumeModalRef = ref(null)
const createPersistentVolume = () => {
  if (createPersistentVolumeModalRef.value) {
    createPersistentVolumeModalRef.value.openModal()
  }
}

const callbackOnCreate = (e) => {
  refetchPersistentVolumes()
  if (props.selector === 'id') {
    selectedPersistentVolume.value = e.id
  } else if (props.selector === 'name') {
    selectedPersistentVolume.value = e.name
  }
}
</script>

<template>
  <div
    :class="{
      'w-full': props.fullWidth
    }">
    <select
      class="focus:border-primary focus:ring-primary block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
      v-model="selectedPersistentVolume">
      <option value="" disabled selected>Select Persistent Volume</option>
      <option v-for="pv in persistentVolumes" :key="pv.id" :value="getValue(pv)">
        {{ pv.name }}
      </option>
    </select>
    <p class="ml-1 mt-2 flex items-center text-sm" v-if="showCreateLink">
      Need to create Volume ?
      <a class="text-primary ml-1.5 cursor-pointer font-bold" @click="createPersistentVolume">Click here</a>
    </p>
    <CreatePersistentVolumeModal ref="createPersistentVolumeModalRef" :callback-on-create="callbackOnCreate" />
  </div>
</template>

<style scoped></style>
