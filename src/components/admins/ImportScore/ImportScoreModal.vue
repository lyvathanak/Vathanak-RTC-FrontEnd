<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        @keydown.esc.prevent.stop="close">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
          @click="close" />

        <!-- Center -->
        <div
          class="absolute inset-0 flex items-center justify-center p-3 sm:p-5">
          <!-- Panel -->
          <div
            class="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            @click.stop>
            <!-- Header -->
            <div class="border-b bg-white/90 backdrop-blur">
              <div class="flex items-center justify-between gap-3 px-5 py-4">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3
                      id="promote-title"
                      class="text-base sm:text-lg font-bold text-gray-900">
                      IMPORT MOODLE SCORE
                    </h3>

                    <!-- Badge -->
                    <div
                      class="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-[#235AA6] bg-blue-50 border border-[#235AA6] ring-1 ring-gray-200"
                      :class="[locale === 'kh' ? 'khmer-text' : '']">
                      {{ t("import_score") }}
                    </div>
                  </div>

                  <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Select semester & subject, then upload a Moodle CSV.
                  </p>
                </div>

                <button
                  type="button"
                  @click="close"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600"
                  aria-label="Close">
                  ✕
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="px-5 py-5 space-y-4">
              <!-- Info banner -->
              <div
                class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                CSV must contain <b>ID number</b> and
                <b>Final total</b> columns.
              </div>

              <!-- Semester -->
              <div>
                <BaseSelect
                  v-model="semesterId"
                  :label="`Semester `"
                  :required="true"
                  placeholder="-- Select Semester --"
                  allLabel="All Semesters"
                  :options="semesterOptions"
                  :disabled="semestersLoading || !props.defaultProgramId"
                  teleport-to="body"
                  hint="Select a semester to import scores."
                  @change="onSemesterChange" />

                <p
                  v-if="!props.defaultProgramId"
                  class="text-xs text-amber-600 mt-1">
                  Please select Program first.
                </p>
              </div>

              <!-- Subject -->
              <div>
                <BaseSelect
                  v-model="subjectId"
                  :label="`Subject `"
                  :required="true"
                  placeholder="-- Select Subject --"
                  allLabel="All Subjects"
                  :options="subjectOptions"
                  :disabled="!semesterId || subjectsLoading"
                  teleport-to="body"
                  hint="Select a subject to import scores." />
              </div>

              <!-- File -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Moodle CSV <span class="text-red-500">*</span>
                </label>

                <div class="flex flex-col gap-3">
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".csv"
                    @change="onFileChange"
                    class="block w-full text-sm rounded-xl border border-gray-300 p-2.5 file:border-0 file:bg-blue-50 file:text-blue-700 file:px-4 file:py-2 file:rounded-lg hover:file:bg-blue-100 cursor-pointer" />

                  <!-- File preview -->
                  <div
                    v-if="file"
                    class="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-gray-800 truncate">
                        {{ file.name }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ formatBytes(file.size) }}
                      </p>
                    </div>

                    <button
                      type="button"
                      class="shrink-0 text-sm rounded-lg border px-3 py-1.5 hover:bg-white"
                      @click="clearFile">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t bg-white">
              <div
                class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4">
                <div class="min-h-5">
                  <p
                    v-if="importedCount !== null"
                    class="text-sm text-green-700">
                    ✅ Imported {{ importedCount }} scores
                  </p>
                  <p v-else class="text-xs text-gray-500">
                    Tip: Make sure Moodle export uses “ID number”.
                  </p>
                </div>

                <div class="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    @click="close"
                    class="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50"
                    :disabled="loading">
                    Cancel
                  </button>

                  <button
                    type="button"
                    @click="submit"
                    class="h-10 px-4 rounded-xl text-sm font-medium text-white bg-[#235AA6] hover:bg-[#235AA6] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center"
                    :disabled="loading || !canSubmit">
                    <span v-if="loading" class="animate-spin mr-2">⏳</span>
                    Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import ScoreAPI from "@/stores/apis/ScoreAPI";
import { showNotification } from "@/lib/notifications";
import { useI18n } from "vue-i18n";
import BaseSelect from "@/components/features/BaseSelect.vue";
const { t, locale } = useI18n();
const props = defineProps({
  modelValue: { type: Boolean, default: false },

  defaultAcademicYear: { type: [String, Number], default: "" },
  defaultProgramId: { type: [String, Number], default: "" },
  defaultYearId: { type: [String, Number], default: "" },
});

const emit = defineEmits(["update:modelValue", "imported"]);

const semesterId = ref("");
const subjectId = ref("");
const semesters = ref([]);
const subjects = ref([]);
const file = ref(null);

const loading = ref(false);
const semestersLoading = ref(false);
const subjectsLoading = ref(false);
const importedCount = ref(null);

const fileInput = ref(null);

const semesterOptions = computed(() =>
  (semesters.value || []).map((s) => ({
    label: `Semester ${s.semester_number}`,
    value: s.id,
  })),
);

const subjectOptions = computed(() =>
  (subjects.value || []).map((s) => ({
    label: s.subject_name,
    value: s.id,
  })),
);

const canSubmit = computed(() => {
  return Boolean(
    props.defaultProgramId && semesterId.value && subjectId.value && file.value,
  );
});

const form = ref({
  academicYear: "",
  programId: "",
  yearId: "",
});

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    // ✅ when modal opens, set defaults
    form.value.academicYear = props.defaultAcademicYear ?? "";
    form.value.programId = props.defaultProgramId ?? "";
    form.value.yearId = props.defaultYearId ?? "";
  },
  { immediate: true },
);

// Watch programId + academicYear to reload semesters
watch(
  [() => props.defaultProgramId, () => props.defaultAcademicYear],
  async () => {
    semesterId.value = "";
    subjectId.value = "";
    subjects.value = [];
    importedCount.value = null;
    clearFile();
    await loadSemesters();
  },
);

// Initial load
onMounted(async () => {
  await loadSemesters();
});

async function loadSemesters() {
  if (!props.defaultProgramId) {
    semesters.value = [];
    return;
  }

  semestersLoading.value = true;
  try {
    const res = await ScoreAPI.getSemestersByProgram(props.defaultProgramId);
    semesters.value = res.semesters || [];
  } catch (err) {
    console.error("Failed to load semesters:", err);
    showNotification("Failed to load semesters", "error");
  } finally {
    semestersLoading.value = false;
  }
}

async function onSemesterChange() {
  subjectId.value = "";
  subjects.value = [];
  importedCount.value = null;

  if (!semesterId.value) return;

  subjectsLoading.value = true;
  try {
    const res = await ScoreAPI.getSubjectsBySemester(semesterId.value);
    subjects.value = res.subjects || [];
  } catch (err) {
    console.error("Failed to load subjects:", err);
    showNotification("Failed to load subjects", "error");
  } finally {
    subjectsLoading.value = false;
  }
}

function onFileChange(e) {
  const f = e.target.files?.[0];
  if (!f) return;

  // Optional: basic validation
  if (!f.name.toLowerCase().endsWith(".csv")) {
    showNotification("Please upload a .csv file", "error");
    clearFile();
    return;
  }
  file.value = f;
}

function clearFile() {
  file.value = null;
  if (fileInput.value) fileInput.value.value = "";
}

function close() {
  if (loading.value) return;
  emit("update:modelValue", false);
}

async function submit() {
  if (!canSubmit.value) {
    showNotification("Please complete all fields", "error");
    return;
  }

  const form = new FormData();
  form.append("program_id", props.defaultProgramId);
  if (props.defaultAcademicYear)
    form.append("academic_year", props.defaultAcademicYear);
  form.append("semester_id", semesterId.value);
  form.append("subject_id", subjectId.value);
  form.append("file", file.value);

  loading.value = true;
  try {
    const { data } = await ScoreAPI.importMoodleScores(form);
    importedCount.value = data.imported;
    emit("imported", data.imported);
    showNotification("Scores imported successfully", "success");
    setTimeout(close, 600);
  } catch (err) {
    console.error("Import failed:", err);
    showNotification("Import failed", "error");
  } finally {
    loading.value = false;
  }
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v = v / 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
