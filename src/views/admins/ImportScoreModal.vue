<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50">

      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="close"></div>

      <!-- Dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-xl shadow-lg">

          <!-- Header -->
          <div class="flex justify-between items-center px-6 py-4 border-b">
            <h2 class="text-lg font-semibold">Import Moodle Scores</h2>
            <button @click="close" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4">

            <!-- Semester -->
            <div>
              <label class="block text-sm font-medium mb-1">Semester *</label>
              <select v-model="semesterId" @change="onSemesterChange"
                      class="w-full border rounded-lg px-3 py-2">
                <option value="">-- Select Semester --</option>
                <option v-for="s in semesters" :key="s.id" :value="s.id">
                  Semester {{ s.semester_number }}
                </option>
              </select>
            </div>

            <!-- Subject -->
            <div>
              <label class="block text-sm font-medium mb-1">Subject *</label>
              <select v-model="subjectId"
                      :disabled="!semesterId"
                      class="w-full border rounded-lg px-3 py-2">
                <option value="">-- Select Subject --</option>
                <option v-for="s in subjects" :key="s.id" :value="s.id">
                  {{ s.subject_name }}
                </option>
              </select>
            </div>

            <!-- CSV File -->
            <div>
                <label class="block text-sm font-medium mb-1">
                    Moodle CSV <span class="text-red-500">*</span>
                </label>
                <input
                    type="file"
                    accept=".csv"
                    @change="onFileChange"
                    class="block w-full text-sm border rounded-lg p-2
                        file:border-0
                        file:bg-blue-50
                        file:text-blue-700
                        file:px-4
                        file:py-2
                        file:rounded-lg
                        hover:file:bg-blue-100
                        cursor-pointer"
                />
                <p class="text-xs text-gray-500 mt-1">
                    CSV must contain <b>ID number</b> and <b>Final total</b> columns
                </p>
            </div>


          </div>

          <!-- Footer -->
          <div class="flex justify-between items-center px-6 py-4 border-t">
            <span v-if="importedCount !== null" class="text-green-600 text-sm">
              Imported {{ importedCount }} scores
            </span>

            <div class="flex gap-3">
              <button @click="close" class="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button @click="submit" :disabled="loading"
                      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                <span v-if="loading" class="animate-spin mr-2">⏳</span>
                Import
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import ScoreAPI from '@/stores/apis/ScoreAPI';
import { showNotification } from '@/lib/notifications';

const props = defineProps({
  modelValue: Boolean,
  defaultAcademicYear: String,
  defaultProgramId: [String, Number]
});
const emit = defineEmits(['update:modelValue', 'imported']);

const semesterId = ref('');
const subjectId = ref('');
const semesters = ref([]);
const subjects = ref([]);
const file = ref(null);
const loading = ref(false);
const importedCount = ref(null);

// Load semesters automatically based on defaultProgramId
onMounted(async () => {
  if (props.defaultProgramId) {
    await loadSemesters();
  }
});

watch(() => props.defaultProgramId, async () => {
  semesterId.value = '';
  subjectId.value = '';
  subjects.value = [];
  if (props.defaultProgramId) {
    await loadSemesters();
  }
});

async function loadSemesters() {
  try {
    const res = await ScoreAPI.getAllSemesters();
    // Filter semesters by program
    semesters.value = res.semesters.data.filter(s => s.program_id == props.defaultProgramId);
  } catch (err) {
    console.error(err);
    showNotification('Failed to load semesters', 'error');
  }
}

async function onSemesterChange() {
  subjectId.value = '';
  try {
    const res = await ScoreAPI.getSubjectsBySemester(semesterId.value);
    subjects.value = res.subjects || [];
  } catch (err) {
    console.error(err);
    showNotification('Failed to load subjects', 'error');
  }
}

function onFileChange(e) {
  file.value = e.target.files[0];
}

function close() {
  emit('update:modelValue', false);
}

async function submit() {
  if (!semesterId.value || !subjectId.value || !file.value) {
    showNotification('Please complete all fields', 'error');
    return;
  }

  const form = new FormData();
  form.append('subject_id', subjectId.value);
  form.append('file', file.value);
  
  // **Add programId from parent**
  form.append('program_id', props.defaultProgramId);
  // optionally academic year
  if (props.defaultAcademicYear) {
    form.append('academic_year', props.defaultAcademicYear);
  }

  loading.value = true;

  try {
    const { data } = await ScoreAPI.importMoodleScores(form);
    importedCount.value = data.imported;
    emit('imported', data.imported);
    showNotification('Scores imported successfully', 'success');
    setTimeout(close, 800);
  } catch (err) {
    console.error(err);
    showNotification('Import failed', 'error');
  } finally {
    loading.value = false;
  }
}

</script>
