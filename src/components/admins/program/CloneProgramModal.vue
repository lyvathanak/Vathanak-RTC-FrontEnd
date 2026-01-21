<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Clone Program"
    :style="{ width: '500px', borderRadius: '12px' }"
    class="p-4 bg-white shadow-lg">

    <!-- Form -->
    <div class="space-y-4">

      <!-- Source Program -->
      <div>
        <label class="block text-sm font-semibold mb-1">
          Source Program <span class="text-red-600">*</span>
        </label>
        <select
          v-model="sourceProgramId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          <option value="">Select program…</option>
          <option v-for="p in programs" :key="p.id" :value="p.id">
            {{ p.program_name }} ({{ p.degree_level }})
          </option>
        </select>
        <p v-if="error" class="text-xs text-red-600 mt-1">{{ error }}</p>
      </div>

      <!-- New Program Name -->
      <div>
        <label class="block text-sm font-semibold mb-1">New Program Name</label>
        <Input
          v-model="newProgramName"
          placeholder="Leave empty to auto-generate"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
      </div>

      <!-- Options -->
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="cloneSemesters" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
          Clone semesters
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="cloneSubjects" :disabled="!cloneSemesters" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
          Clone subjects inside semesters
        </label>
      </div>

      <!-- Status / Feedback -->
      <p v-if="statusMessage" :class="['text-sm mt-1', statusType === 'error' ? 'text-red-600' : 'text-green-600']">
        {{ statusMessage }}
      </p>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-3 mt-4">
        <Button label="Cancel" severity="secondary" @click="close" class="px-4 py-2 rounded-lg" />

        <!-- Clone button with icon -->
        <Button
          :loading="loading"
          @click="cloneProgram"
          class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
        >
          <CloneIcon class="w-4 h-4" /> Clone Program <!-- PrimeVue copy icon -->
          <span>Clone Program</span>
        </Button>
      </div>
    </template>

  </Dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Dialog } from 'primevue/dialog'
import { Button } from 'primevue/button'
import { Input } from '@/components/ui/input'
import api from '@/stores/apis/axios'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const programs = ref([])
const sourceProgramId = ref('')
const newProgramName = ref('')
const cloneSemesters = ref(true)
const cloneSubjects = ref(true)
const loading = ref(false)
const error = ref('')
const statusMessage = ref('')
const statusType = ref('') // 'success' or 'error'

watch(() => props.modelValue, v => (visible.value = v))
watch(visible, v => emit('update:modelValue', v))

function close() {
  visible.value = false
  reset()
}

function reset() {
  sourceProgramId.value = ''
  newProgramName.value = ''
  cloneSemesters.value = true
  cloneSubjects.value = true
  error.value = ''
  statusMessage.value = ''
  statusType.value = ''
}

async function fetchPrograms() {
  const { data } = await api.get('/managements/get_all_programs')
  programs.value = Array.isArray(data?.programs) ? data.programs : []
}

async function cloneProgram() {
  error.value = ''
  statusMessage.value = ''
  if (!sourceProgramId.value) {
    error.value = 'Please select a program to clone.'
    return
  }

  loading.value = true
  try {
    const payload = {
      source_program_id: Number(sourceProgramId.value),
      new_program_name: newProgramName.value || null,
      clone_semesters: cloneSemesters.value,
      clone_subjects: cloneSubjects.value
    }

    const res = await api.post('/managements/clone_program', payload)
    statusMessage.value = 'Program cloned successfully!'
    statusType.value = 'success'
    emit('success', res.data)
    setTimeout(close, 1000)
  } catch (e) {
    statusMessage.value = e?.response?.data?.message || 'Clone failed'
    statusType.value = 'error'
  } finally {
    loading.value = false
  }
}

onMounted(fetchPrograms)
</script>

<style scoped>
/* Optional smooth animation for checkboxes */
input[type="checkbox"] {
  transition: all 0.2s;
}
</style>
