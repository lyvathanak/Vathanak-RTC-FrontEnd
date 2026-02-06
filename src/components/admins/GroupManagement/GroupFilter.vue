<template>
  <div class="relative w-full sm:max-w-md">
    <!-- Search icon -->
    <Search
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

    <!-- Input -->
    <input
      v-model="searchValue"
      type="text"
      placeholder="Search groups…"
      class="h-10 w-full rounded-xl border px-10 pr-10 outline-none focus:ring-2 focus:ring-[#235AA6]" />

    <!-- Clear button -->
    <button
      v-if="searchValue"
      type="button"
      @click="searchValue = ''"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      aria-label="Clear search">
      ✕
    </button>
  </div>

  <div class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
    <!-- Top row: search + clear -->
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h3 class="text-base font-semibold text-gray-800">Group Filters</h3>
        <p class="text-sm text-gray-500">
          Select a department to unlock program & section options.
        </p>
      </div>

      <!-- Clear -->
      <div>
        <button
          type="button"
          @click="clearFiltersOnly"
          :disabled="disableClear"
          :class="[
            'h-10 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold active:scale-[0.99] transition',
            disableClear
              ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
              : 'border-red-200 text-red-600 hover:bg-red-50',
          ]">
          {{ resetText }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- Academic Year -->
      <BaseSelect
        v-model="selectedAcademicYear"
        label="Academic Year"
        placeholder="Select academic year"
        allLabel="All Years"
        :options="academicYearOptions"
        hint="Filter groups by academic year." />

      <!-- Department -->
      <BaseSelect
        v-model="selectedDepartment"
        label="Department"
        placeholder="Select department"
        allLabel="All Departments"
        :options="departmentOptions"
        :disabled="props.loading"
        hint="Choose a department to narrow program & section." />

      <!-- Program -->
      <BaseSelect
        v-model="selectedProgram"
        label="Program"
        placeholder="Select program"
        allLabel="All Programs"
        :options="programOptions"
        :disabled="props.loading || !selectedDepartment"
        :hint="
          selectedDepartment
            ? ''
            : 'Select a department to unlock program options.'
        " />

      <!-- Section -->
      <BaseSelect
        v-model="selectedSection"
        label="Section"
        placeholder="Select section"
        allLabel="All Sections"
        :options="sectionOptions"
        :disabled="props.loading || !selectedDepartment"
        :hint="
          selectedDepartment
            ? ''
            : 'Select a department to unlock section options.'
        " />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Search } from "lucide-vue-next";

import BaseSelect from "@/components/features/BaseSelect.vue";

import { useDepartment } from "@/stores/global/useDepartment.js";
import { useSection } from "@/stores/global/useSection.js";
import { useProgram } from "@/stores/global/useProgram.js";

// Props
const props = defineProps({
  loading: { type: Boolean, default: false },
  modelValue: {
    type: Object,
    default: () => ({
      search: "",
      academicYear: "",
      department: "",
      program: "",
      section: "",
      shift: "",
    }),
  },
  groups: { type: Array, default: () => [] },
});

// Emits
const emit = defineEmits(["update:modelValue", "refresh"]);

// Stores
const departmentStore = useDepartment();
const programStore = useProgram();
const sectionStore = useSection();

onMounted(async () => {
  await Promise.all([
    departmentStore.getAllDepartments(),
    programStore.getAllPrograms(),
    sectionStore.getAllSections(),
  ]);
});

// Local state
const searchValue = ref(props.modelValue.search || "");
const selectedAcademicYear = ref(props.modelValue.academicYear || "");
const selectedDepartment = ref(props.modelValue.department || "");
const selectedProgram = ref(props.modelValue.program || "");
const selectedSection = ref(props.modelValue.section || "");
const selectedShift = ref(props.modelValue.shift || "");

/** Options (BaseSelect expects [{label, value}]) */
const departmentOptions = computed(() =>
  (departmentStore.departmentNames.value || []).map((name) => ({
    label: name,
    value: name,
  })),
);

const academicYearOptions = computed(() => {
  const years = [
    ...new Set(
      (props.groups || []).map((g) => g.academic_year).filter(Boolean),
    ),
  ];
  return years
    .sort()
    .reverse()
    .map((y) => ({ label: String(y), value: String(y) }));
});

// Programs filtered by department
const programOptions = computed(() => {
  const dept = selectedDepartment.value;

  if (!dept) {
    const all = programStore.programNames?.value || [];
    return all.map((p) => ({ label: p, value: p }));
  }

  const list = programStore.getProgramsByDepartmentName
    ? programStore.getProgramsByDepartmentName(dept)
    : [];

  return (list || []).map((p) => ({
    label: p.program_name,
    value: p.program_name,
  }));
});

// Sections filtered by department
const sectionOptions = computed(() => {
  const dept = selectedDepartment.value;

  if (!dept) {
    const all = sectionStore.sectionNames?.value || [];
    return all.map((s) => ({ label: s, value: s }));
  }

  const list = sectionStore.getSectionsByDepartmentName
    ? sectionStore.getSectionsByDepartmentName(dept)
    : [];

  return (list || []).map((s) => ({
    label: s.name,
    value: s.name,
  }));
});

/** Reset dependent filters when department changes */
watch(selectedDepartment, (newDept, oldDept) => {
  if (newDept !== oldDept) {
    selectedProgram.value = "";
    selectedSection.value = "";
  }
});

/** Emit filters to parent */
watch(
  () => ({
    search: searchValue.value,
    academicYear: selectedAcademicYear.value,
    department: selectedDepartment.value,
    program: selectedProgram.value,
    section: selectedSection.value,
    shift: selectedShift.value,
  }),
  (newFilters) => emit("update:modelValue", newFilters),
  { deep: true },
);

/** Keep local in sync if parent changes modelValue */
watch(
  () => props.modelValue,
  (v) => {
    searchValue.value = v?.search || "";
    selectedAcademicYear.value = v?.academicYear || "";
    selectedDepartment.value = v?.department || "";
    selectedProgram.value = v?.program || "";
    selectedSection.value = v?.section || "";
    selectedShift.value = v?.shift || "";
  },
  { deep: true },
);

const disableClear = computed(() => {
  return !(
    searchValue.value ||
    selectedAcademicYear.value ||
    selectedDepartment.value ||
    selectedProgram.value ||
    selectedSection.value ||
    selectedShift.value
  );
});

const resetText = computed(() =>
  disableClear.value ? "Clear Filters" : "Clear Filters",
);

function clearFiltersOnly() {
  if (disableClear.value) return;

  searchValue.value = "";
  selectedAcademicYear.value = "";
  selectedDepartment.value = "";
  selectedProgram.value = "";
  selectedSection.value = "";
  selectedShift.value = "";
}
</script>
