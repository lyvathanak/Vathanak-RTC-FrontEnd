<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      @click.self="closeModal">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <!-- Center -->
      <div class="relative inset-0 flex items-center justify-center p-3 sm:p-6">
        <div
          class="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <!-- Header (sticky) -->
          <div
            class="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gray-200 bg-white/90 px-5 py-4 backdrop-blur">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3
                  id="promote-title"
                  class="text-base sm:text-lg font-bold text-gray-900">
                  UPDATE GROUPS
                </h3>

                <!-- Badge -->
                <div
                  class="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-[#235AA6] bg-blue-50 border border-[#235AA6] ring-1 ring-gray-200"
                  :class="[locale === 'kh' ? 'khmer-text' : '']">
                  {{ t("edit_group") }}
                </div>
              </div>
              <p class="mt-0.5 text-xs sm:text-sm text-gray-500">
                Edit group information and save changes.
              </p>
            </div>

            <button
              type="button"
              @click="closeModal"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 active:scale-[0.98]"
              aria-label="Close">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="max-h-[90vh] overflow-hidden">
            <div class="max-h-[calc(90vh-140px)] overflow-y-auto px-5 py-5">
              <div class="space-y-5">
                <!-- Section: Basic info -->
                <div
                  class="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5">
                  <div class="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 class="text-sm font-semibold text-gray-900">
                        Basic Information
                      </h3>
                      <p class="text-xs text-gray-500">
                        Fields marked with
                        <span class="text-red-500">*</span> are required.
                      </p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <!-- Group Name -->
                    <div class="space-y-1.5">
                      <label class="text-sm font-medium text-gray-700">
                        Group Name <span class="text-red-500">*</span>
                      </label>

                      <input
                        v-model="groupForm.name"
                        type="text"
                        placeholder="Enter group name"
                        class="h-11 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#235AA6] focus:ring-2 focus:ring-[#235AA6]/20 disabled:bg-gray-50 disabled:text-gray-400"
                        :class="
                          errors.name
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-200'
                        " />

                      <p v-if="errors.name" class="text-xs text-red-600">
                        {{ errors.name }}
                      </p>
                    </div>

                    <!-- Department -->
                    <div class="space-y-1.5">
                      <BaseSelect
                        v-model="groupForm.department_id"
                        label="Group Department"
                        :required="true"
                        allLabel="All Departments"
                        :options="departmentSelectOptions"
                        placeholder="Select Department"
                        :disabled="departmentsLoading" />

                      <p
                        v-if="errors.department_id"
                        class="text-xs text-red-600">
                        {{ errors.department_id }}
                      </p>
                    </div>
                  </div>

                  <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <!-- Program -->
                    <div class="space-y-1.5">
                      <BaseSelect
                        v-model="groupForm.program_id"
                        label="Select Program"
                        :required="true"
                        allLabel="All Programs"
                        :options="programSelectOptions"
                        :placeholder="
                          groupForm.department_id
                            ? 'Select Program'
                            : 'Select department first'
                        "
                        :disabled="
                          programsLoading || !groupForm.department_id
                        " />

                      <p v-if="errors.program_id" class="text-xs text-red-600">
                        {{ errors.program_id }}
                      </p>

                      <p
                        v-if="!groupForm.department_id"
                        class="text-xs text-gray-500">
                        Please select a department to unlock program options.
                      </p>
                    </div>

                    <!-- Section -->
                    <div class="space-y-1.5">
                      <BaseSelect
                        v-model="groupForm.section_id"
                        label="Select Section"
                        :required="true"
                        allLabel="All Sections"
                        :options="sectionSelectOptions"
                        :placeholder="
                          groupForm.department_id
                            ? 'Select Section'
                            : 'Select department first'
                        "
                        :disabled="
                          sectionsLoading || !groupForm.department_id
                        " />

                      <p v-if="errors.section_id" class="text-xs text-red-600">
                        {{ errors.section_id }}
                      </p>

                      <p
                        v-if="!groupForm.department_id"
                        class="text-xs text-gray-500">
                        Please select a department to unlock section options.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Section: Semester -->
                <div
                  class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                  <div class="mb-4">
                    <h3 class="text-sm font-semibold text-gray-900">
                      Semester
                    </h3>
                    <p class="text-xs text-gray-500">
                      Semester list loads after selecting a program.
                    </p>
                  </div>

                  <!-- Semester -->
                  <div class="space-y-1.5">
                    <BaseSelect
                      v-model="groupForm.semester_id"
                      label="Select Semester"
                      :required="true"
                      :options="semesterSelectOptions"
                      :placeholder="
                        loadingSemesters
                          ? 'Loading semesters...'
                          : semesters.length
                            ? 'Select Semester'
                            : 'No semesters available'
                      "
                      allLabel="All Semesters"
                      :disabled="
                        loadingSemesters ||
                        !semesters.length ||
                        !groupForm.program_id
                      "
                      hint="Semester list loads after selecting a program." />

                    <p v-if="errors.semester_id" class="text-xs text-red-600">
                      {{ errors.semester_id }}
                    </p>

                    <p
                      v-if="!groupForm.program_id"
                      class="text-xs text-gray-500">
                      Please select a program to load semesters.
                    </p>
                  </div>
                </div>

                <!-- Section: Description -->
                <div
                  class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                  <div class="mb-4">
                    <h3 class="text-sm font-semibold text-gray-900">
                      Description
                    </h3>
                    <p class="text-xs text-gray-500">
                      Optional notes about this group.
                    </p>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-sm font-medium text-gray-700"
                      >Group Description</label
                    >
                    <textarea
                      v-model="groupForm.description"
                      rows="3"
                      placeholder="Enter group description (optional)"
                      class="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#235AA6] focus:ring-2 focus:ring-[#235AA6]/20" />
                    <p class="text-xs text-gray-500">
                      Keep it short (e.g., purpose, schedule, notes).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer (sticky) -->
            <div
              class="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-gray-200 bg-white/90 px-5 py-4 backdrop-blur">
              <button
                type="button"
                @click="closeModal"
                class="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99]">
                Cancel
              </button>

              <button
                type="button"
                @click="updateGroup"
                :disabled="
                  !isFormValid ||
                  departmentsLoading ||
                  programsLoading ||
                  sectionsLoading
                "
                class="inline-flex items-center justify-center rounded-xl bg-[#235AA6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e4f93] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]">
                <span
                  v-if="
                    departmentsLoading || programsLoading || sectionsLoading
                  "
                  class="inline-flex items-center gap-2">
                  <span
                    class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                  Loading...
                </span>
                <span v-else>Update Group</span>
              </button>
            </div>
          </div>
          <!-- /Body wrapper -->
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { X, ChevronDown } from "lucide-vue-next";
import { getSemestersByProgram } from "@/stores/global/SemesterByProgram";
import { showNotification } from "@/lib/notifications.js";
import BaseSelect from "@/components/features/BaseSelect.vue";
const semesters = ref([]);
const loadingSemesters = ref(false);
const semestersError = ref("");

// Composables that provide lists & filter-by-department
import {
  useFilteredByDepartment,
  useProgramsFilteredByDepartment,
  useSectionsFilteredByDepartment,
} from "@/stores/global/FilterByDepartment.js";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  group: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close", "update-group"]);

/* === Data sources === */
const {
  departments, // full objects
  departmentOptions, // simplified list for dropdown
  loading: departmentsLoading,
} = useFilteredByDepartment({ immediate: false }); // Don't load immediately

const {
  filtered: programsFiltered,
  rawList: allPrograms,
  loading: programsLoading,
  setDepartment: setProgramsDepartment,
} = useProgramsFilteredByDepartment({ immediate: false }); // Don't load immediately

const {
  filtered: sectionsFiltered,
  rawList: allSections,
  loading: sectionsLoading,
  setDepartment: setSectionsDepartment,
} = useSectionsFilteredByDepartment({ immediate: false }); // Don't load immediately

/* === Form (IDs only) === */
const groupForm = ref({
  id: null,
  name: "",
  description: "",
  program_id: "",
  department_id: "",
  section_id: "",
  semester_id: "",
});

const errors = ref({});

/* === Lists depending on department === */
const filteredPrograms = computed(() =>
  groupForm.value.department_id ? programsFiltered.value : allPrograms.value,
);
const filteredSections = computed(() =>
  groupForm.value.department_id ? sectionsFiltered.value : allSections.value,
);

/* === Validity === */
const isFormValid = computed(
  () =>
    !!(
      groupForm.value.name &&
      groupForm.value.program_id &&
      groupForm.value.department_id &&
      groupForm.value.section_id &&
      groupForm.value.semester_id
    ),
);

const departmentSelectOptions = computed(() =>
  (departmentOptions.value || []).map((d) => ({
    label: d.name,
    value: String(d.id),
  })),
);

const programSelectOptions = computed(() =>
  (filteredPrograms.value || []).map((p) => ({
    label: p.program_name,
    value: String(p.id),
  })),
);

const sectionSelectOptions = computed(() =>
  (filteredSections.value || []).map((s) => ({
    label: s.name,
    value: String(s.id),
  })),
);

const semesterSelectOptions = computed(() =>
  (semesters.value || []).map((s) => ({
    label: `Semester ${s.semester_number || s.semester_key || s.id} — ${s.start_date}/${s.end_date}`,
    value: String(s.id),
  })),
);

/* === Watchers === */
const suppressDeptWatcher = ref(false);

watch(
  () => groupForm.value.department_id,
  (deptId) => {
    if (suppressDeptWatcher.value) return; // 👈 don't clear during reset

    groupForm.value.program_id = null;
    groupForm.value.section_id = null;

    if (deptId) {
      setProgramsDepartment(deptId);
      setSectionsDepartment(deptId);
    } else {
      setProgramsDepartment("");
      setSectionsDepartment("");
    }
  },
);

watch(
  () => groupForm.value.program_id,
  async (pid, old) => {
    if (pid === old) return;
    groupForm.value.semester_id = null;
    await fetchSemesters(pid);
  },
);

const fetchSemesters = async (programId) => {
  semesters.value = [];
  semestersError.value = "";
  if (!programId) return;

  loadingSemesters.value = true;
  try {
    const list = await getSemestersByProgram(programId);
    semesters.value = Array.isArray(list) ? list : list?.semesters || [];
  } catch (e) {
    semestersError.value = e?.message || "Failed to load semesters";
  } finally {
    loadingSemesters.value = false;
  }
};

/* === Init/reset === */
const resetForm = async () => {
  const g = props.group ?? {};
  suppressDeptWatcher.value = true; // 👈 prevent watcher from nuking fields

  // Always load data when modal opens to ensure fresh data
  if (props.isOpen) {
    try {
      // Load all data in parallel and wait for completion
      await Promise.all(
        [
          // Always reload departments to ensure fresh data
          departmentOptions.load?.(),
          // Always reload programs to ensure fresh data
          programsFiltered.load?.(),
          // Always reload sections to ensure fresh data
          sectionsFiltered.load?.(),
        ].filter(Boolean),
      );
    } catch (error) {
      console.error("Failed to load data:", error);
      showNotification("Failed to load form data", "error");
    }
  }

  // Wait a tick to ensure reactive data is updated
  await new Promise((resolve) => setTimeout(resolve, 0));

  // set department first so filters are ready
  groupForm.value.department_id = g.department_id ?? g.department?.id ?? null;

  if (groupForm.value.department_id) {
    setProgramsDepartment(groupForm.value.department_id);
    setSectionsDepartment(groupForm.value.department_id);

    // Wait for filters to update
    await new Promise((resolve) => setTimeout(resolve, 0));
  } else {
    setProgramsDepartment("");
    setSectionsDepartment("");
  }

  // now safely set the rest
  groupForm.value = {
    id: g.id ?? null,
    name: g.name ?? g.group_name ?? "",
    description: g.description ?? "",
    department_id:
      (g.department_id ?? g.department?.id)
        ? String(g.department_id ?? g.department?.id)
        : "",
    program_id:
      (g.program_id ?? g.program?.id)
        ? String(g.program_id ?? g.program?.id)
        : "",
    section_id:
      (g.sub_department_id ?? g.section_id ?? g.sub_department?.id)
        ? String(g.sub_department_id ?? g.section_id ?? g.sub_department?.id)
        : "",
    semester_id:
      (g.semester_id ?? g.semester?.id)
        ? String(g.semester_id ?? g.semester?.id)
        : "",
  };

  // Load semesters if program is selected
  if (groupForm.value.program_id) {
    await fetchSemesters(groupForm.value.program_id);
  }

  suppressDeptWatcher.value = false;
  errors.value = {};
};

/* === Validation + Submit === */
const validateForm = () => {
  const e = {};
  if (!groupForm.value.name) e.name = "Group name is required";
  if (!groupForm.value.program_id) e.program_id = "Program is required";
  if (!groupForm.value.department_id)
    e.department_id = "Department is required";
  if (!groupForm.value.section_id) e.section_id = "Section is required";
  if (!groupForm.value.semester_id) e.semester_id = "Semester is required";
  errors.value = e;
  return Object.keys(e).length === 0;
};

const updateGroup = () => {
  if (!validateForm()) return;
  const payload = {
    id: groupForm.value.id ?? props.group?.id ?? null,
    name: groupForm.value.name,
    group_name: groupForm.value.name,
    description: groupForm.value.description ?? "",
    program_id: Number(groupForm.value.program_id) || null,
    department_id: Number(groupForm.value.department_id) || null,
    sub_department_id: Number(groupForm.value.section_id) || null,
    semester_id: Number(groupForm.value.semester_id) || null,
  };

  console.log("Updating group with data:", payload);
  emit("update-group", payload);
  closeModal();
};

const closeModal = () => {
  emit("close");
  resetForm();
};

/* === Open/reset on prop changes === */
watch(
  () => [props.isOpen, props.group],
  ([isOpen]) => {
    if (isOpen) resetForm();
  },
  { immediate: true, deep: true },
);
watch(
  () => groupForm.value.program_id,
  async (pid, old) => {
    if (pid === old) return;
    groupForm.value.semester_id = "";
    await fetchSemesters(pid);
  },
);

watch(
  () => groupForm.value.department_id,
  (deptId) => {
    if (suppressDeptWatcher.value) return;

    groupForm.value.program_id = "";
    groupForm.value.section_id = "";
    groupForm.value.semester_id = "";

    if (deptId) {
      setProgramsDepartment(deptId);
      setSectionsDepartment(deptId);
    } else {
      setProgramsDepartment("");
      setSectionsDepartment("");
    }
  },
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
