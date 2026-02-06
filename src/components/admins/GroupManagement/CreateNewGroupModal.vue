<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      @click.self="closeModal">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <!-- Dialog -->
      <div
        class="relative w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <!-- Header (sticky) -->
        <div
          class="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200">
          <div class="flex items-start justify-between gap-4 p-4 sm:p-6">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3
                  id="promote-title"
                  class="text-base sm:text-lg font-bold text-gray-900">
                  CREATE NEW GROUPS
                </h3>

                <!-- Badge -->
                <div
                  class="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-[#235AA6] bg-blue-50 border border-[#235AA6] ring-1 ring-gray-200"
                  :class="[locale === 'kh' ? 'khmer-text' : '']">
                  {{ t("add_group") }}
                </div>
              </div>
              <p class="mt-1 text-xs sm:text-sm text-gray-500">
                Create an empty group now and add students later.
              </p>
            </div>

            <button
              type="button"
              @click="closeModal"
              class="shrink-0 inline-flex items-center justify-center rounded-xl p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30"
              aria-label="Close">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="max-h-[75vh] sm:max-h-[70vh] overflow-y-auto p-4 sm:p-6">
          <div class="space-y-5 sm:space-y-6">
            <!-- Grid: Basic -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Group name -->
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Group Name <span class="text-red-500">*</span>
                </label>

                <input
                  v-model="groupForm.name"
                  type="text"
                  placeholder="e.g., Medicine A - Morning"
                  class="mt-2 h-11 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-[#235AA6]/25 focus:border-[#235AA6] disabled:bg-gray-50 disabled:text-gray-400"
                  :class="
                    errors.name
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200'
                  " />

                <p v-if="errors.name" class="mt-1.5 text-xs text-red-600">
                  {{ errors.name }}
                </p>
                <p v-else class="mt-1.5 text-xs text-gray-500">
                  Use a clear name that helps identify this class group.
                </p>
              </div>

              <!-- Department -->
              <BaseSelect
                v-model="groupForm.department_id"
                label="Group Department"
                placeholder="Select Department"
                allLabel="All Departments"
                :options="departmentSelectOptions"
                :disabled="departmentsLoading"
                hint="Department controls available programs and sections." />
              <p
                v-if="errors.department_id"
                class="mt-1.5 text-xs text-red-600">
                {{ errors.department_id }}
              </p>
            </div>

            <!-- Grid: Program + Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Program -->
              <BaseSelect
                v-model="groupForm.program_id"
                label="Group Program"
                placeholder="Select Program"
                allLabel="All Programs"
                :options="programSelectOptions"
                :disabled="programsLoading || !groupForm.department_id"
                :hint="
                  !groupForm.department_id
                    ? 'Choose a department to unlock program options.'
                    : 'Program is used to load available semesters.'
                " />
              <p v-if="errors.program_id" class="mt-1.5 text-xs text-red-600">
                {{ errors.program_id }}
              </p>
              <!-- Section -->
              <BaseSelect
                v-model="groupForm.section_id"
                label="Group Section"
                placeholder="Select Section"
                allLabel="All Sections"
                :options="sectionSelectOptions"
                :disabled="sectionsLoading || !groupForm.department_id"
                :hint="
                  !groupForm.department_id
                    ? 'Choose a department to unlock section options.'
                    : 'Section helps organize groups within the same program.'
                " />
              <p v-if="errors.section_id" class="mt-1.5 text-xs text-red-600">
                {{ errors.section_id }}
              </p>
            </div>

            <!-- Semester -->
            <BaseSelect
              v-model="groupForm.semester_id"
              label="Group Semester"
              placeholder="Select Semester"
              allLabel="All Semesters"
              :options="semesterSelectOptions"
              :disabled="loadingSemesters || !semesters.length"
              :hint="
                semesters.length
                  ? 'Semesters load automatically after you select a program.'
                  : ''
              " />
            <p v-if="semestersError" class="mt-1.5 text-xs text-red-600">
              {{ semestersError }}
            </p>
            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Group Description
              </label>

              <textarea
                v-model="groupForm.description"
                rows="3"
                placeholder="Optional notes about this group..."
                class="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-[#235AA6]/25 focus:border-[#235AA6] resize-none" />
              <p class="mt-1.5 text-xs text-gray-500">
                This is for admins only (not shown to students).
              </p>
            </div>

            <!-- Info Note -->
            <div class="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div class="flex items-start gap-3">
                <div class="mt-0.5 text-blue-700">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-blue-900">
                    Creating an empty group
                  </h3>
                  <p class="mt-1 text-xs sm:text-sm text-blue-800">
                    The group will be created without students. You can add
                    students later from Student Management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer (sticky) -->
        <div
          class="sticky bottom-0 border-t border-gray-200 bg-white/95 backdrop-blur">
          <div class="flex items-center justify-end gap-3 p-4 sm:p-6">
            <button
              type="button"
              @click="closeModal"
              class="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30">
              Cancel
            </button>

            <button
              type="button"
              @click="createGroup"
              :disabled="!isFormValid || isCreating"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#235AA6] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30">
              <span v-if="isCreating" class="inline-flex items-center gap-2">
                <span
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"></span>
                Creating...
              </span>
              <span v-else>Create Group</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { X } from "lucide-vue-next";
import BaseSelect from "@/components/features/BaseSelect.vue";

import {
  useFilteredByDepartment,
  useProgramsFilteredByDepartment,
  useSectionsFilteredByDepartment,
} from "@/stores/global/FilterByDepartment.js";
import { getSemestersByProgram } from "@/stores/global/SemesterByProgram.js";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
// Props
const props = defineProps({
  isOpen: { type: Boolean, default: false },
});

// Emits
const emit = defineEmits(["close", "create-group"]);

// ===================== Data sources =====================

// Departments
const {
  departments,
  departmentOptions,
  loading: departmentsLoading,
} = useFilteredByDepartment({ immediate: true });

// Programs filtered by department
const {
  filtered: programsFiltered,
  rawList: allPrograms,
  loading: programsLoading,
  setDepartment: setProgramsDepartment,
} = useProgramsFilteredByDepartment({ immediate: true });

// Sections filtered by department
const {
  filtered: sectionsFiltered,
  rawList: allSections,
  loading: sectionsLoading,
  setDepartment: setSectionsDepartment,
} = useSectionsFilteredByDepartment({ immediate: true });

// ===================== Form state =====================

const groupForm = ref({
  name: "",
  department_id: "",
  program_id: "",
  section_id: "",
  semester_id: "",
  description: "",
});

const semesters = ref([]);
const loadingSemesters = ref(false);
const semestersError = ref("");
const isCreating = ref(false);
const errors = ref({});

// ===================== BaseSelect options =====================

const departmentSelectOptions = computed(() => {
  const list = departmentOptions.value?.length
    ? departmentOptions.value
    : departments.value;

  return (list || []).map((d) => ({
    label: d.department_name || d.name,
    value: String(d.id),
  }));
});

const programSelectOptions = computed(() => {
  // show all if no dept selected, else show filtered
  const list = groupForm.value.department_id
    ? programsFiltered.value
    : allPrograms.value;

  return (list || []).map((p) => ({
    label: p.program_name,
    value: String(p.id),
  }));
});

const sectionSelectOptions = computed(() => {
  const list = groupForm.value.department_id
    ? sectionsFiltered.value
    : allSections.value;

  return (list || []).map((s) => ({
    label: s.name,
    value: String(s.id),
  }));
});

const semesterSelectOptions = computed(() => {
  return (semesters.value || []).map((s) => ({
    label: `Semester ${s.semester_number} • ${s.start_date} → ${s.end_date}`,
    value: String(s.id),
  }));
});

// ===================== Validation =====================

const isFormValid = computed(() => {
  return (
    groupForm.value.name?.trim() &&
    groupForm.value.department_id &&
    groupForm.value.program_id &&
    groupForm.value.section_id &&
    groupForm.value.semester_id
  );
});

const validateForm = () => {
  errors.value = {};

  if (!groupForm.value.name?.trim())
    errors.value.name = "Group name is required";
  if (!groupForm.value.department_id)
    errors.value.department_id = "Department is required";
  if (!groupForm.value.program_id)
    errors.value.program_id = "Program is required";
  if (!groupForm.value.section_id)
    errors.value.section_id = "Section is required";
  if (!groupForm.value.semester_id)
    errors.value.semester_id = "Semester is required";

  return Object.keys(errors.value).length === 0;
};

// ===================== Watchers (ID-based) =====================

// Department changes => filter programs/sections + reset dependents
watch(
  () => groupForm.value.department_id,
  (deptId) => {
    // reset dependents
    groupForm.value.program_id = "";
    groupForm.value.section_id = "";
    groupForm.value.semester_id = "";
    semesters.value = [];
    semestersError.value = "";

    // ✅ If empty => "All Departments" selected => show ALL programs/sections (no filtering)
    if (!deptId) {
      // OPTIONAL: if your composable supports it, clear the filter
      // setProgramsDepartment(null);
      // setSectionsDepartment(null);
      return;
    }

    setProgramsDepartment(Number(deptId));
    setSectionsDepartment(Number(deptId));
  }
);

// Program changes => load semesters
watch(
  () => groupForm.value.program_id,
  async (programId) => {
    groupForm.value.semester_id = "";
    semesters.value = [];
    semestersError.value = "";

    // ✅ If empty => "All Programs" => don't load semesters
    if (!programId) return;

    loadingSemesters.value = true;
    try {
      const list = await getSemestersByProgram(Number(programId));
      semesters.value = Array.isArray(list) ? list : list?.semesters || [];
    } catch (e) {
      semestersError.value = e?.message || "Failed to load semesters";
    } finally {
      loadingSemesters.value = false;
    }
  }
);

// Close modal => reset
watch(
  () => props.isOpen,
  (open) => {
    if (!open) resetForm();
  }
);

// ===================== Actions =====================

const closeModal = () => {
  emit("close");
  resetForm();
};

const resetForm = () => {
  groupForm.value = {
    name: "",
    department_id: "",
    program_id: "",
    section_id: "",
    semester_id: "",
    description: "",
  };

  semesters.value = [];
  semestersError.value = "";
  errors.value = {};
  isCreating.value = false;
};

const createGroup = async () => {
  if (!validateForm()) return;

  isCreating.value = true;
  try {
    const selectedDepartment = departments.value?.find(
      (d) => String(d.id) === String(groupForm.value.department_id)
    );

    const selectedProgram = allPrograms.value?.find(
      (p) => String(p.id) === String(groupForm.value.program_id)
    );

    const selectedSection = allSections.value?.find(
      (s) => String(s.id) === String(groupForm.value.section_id)
    );

    const selectedSemesterObj = semesters.value?.find(
      (s) => String(s.id) === String(groupForm.value.semester_id)
    );

    const newGroup = {
      name: groupForm.value.name,
      description: groupForm.value.description,

      department_id: groupForm.value.department_id
        ? Number(groupForm.value.department_id)
        : null,
      program_id: groupForm.value.program_id
        ? Number(groupForm.value.program_id)
        : null,
      section_id: groupForm.value.section_id
        ? Number(groupForm.value.section_id)
        : null,
      semester_id: groupForm.value.semester_id
        ? Number(groupForm.value.semester_id)
        : null,

      // optional readable fields
      department:
        selectedDepartment?.department_name || selectedDepartment?.name,
      program: selectedProgram?.program_name,
      section: selectedSection?.name,

      academic_year:
        selectedSemesterObj?.academic_year_label ||
        `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      academic_year_id: selectedSemesterObj?.academic_year_id,

      semester_key: selectedSemesterObj?.semester_key,
      semester_number: selectedSemesterObj?.semester_number,

      created_at: new Date().toISOString(),
      status: "Active",
    };

    emit("create-group", newGroup);
    closeModal();
  } catch (error) {
    console.error("Error creating group:", error);
  } finally {
    isCreating.value = false;
  }
};
</script>
