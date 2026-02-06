<template>
  <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <!-- Top bar -->
    <div class="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <div class="min-w-0">
        <h3 class="text-sm sm:text-base font-semibold text-gray-900">
          Filters
        </h3>
        <span
          v-if="activeCount > 0"
          class="inline-flex items-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 px-2.5 py-0.5 text-xs font-semibold">
          {{ activeCount }} active
        </span>
        <p class="text-xs text-gray-500">Refine results by criteria</p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
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

        <!-- Mobile collapse -->

        <button
          type="button"
          class="sm:hidden h-10 px-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="disabled"
          @click="mobileOpen = !mobileOpen">
          {{ mobileOpen ? "Hide" : "Show" }}
        </button>
      </div>
    </div>

    <!-- Body -->
    <div
      class="px-4 pb-4 sm:px-5 sm:pb-5"
      :class="[
        'transition-all',
        disabled ? 'opacity-75' : '',
        mobileOpen ? 'block' : 'hidden sm:block',
      ]">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <BaseSelect
          v-model="academicYearModel"
          label="Academic Year"
          :options="academicYearItems"
          all-label="All Academic Years"
          :disabled="loadingData" />

        <BaseSelect
          v-model="departmentModel"
          label="Department"
          :options="departmentItems"
          all-label="All Departments"
          :disabled="loadingData"
          @change="onDepartmentChange" />

        <BaseSelect
          v-model="programModel"
          label="Program "
          :options="programItems"
          all-label="All Programs"
          :disabled="loadingData" />

        <BaseSelect
          v-model="originModel"
          label="Origin"
          :options="originItems"
          all-label="All Origins"
          :disabled="loadingData" />

        <BaseSelect
          v-model="genderModel"
          label="Gender"
          :options="genderItems"
          all-label="All Genders"
          :disabled="loadingData" />
      </div>
      <!-- Active chips (nice on desktop; optional) -->
      <div v-if="activeCount > 0" class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="chip in activeChips"
          :key="chip.key"
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-gray-50 text-gray-800 ring-1 ring-gray-200 px-3 py-1 text-xs font-semibold hover:bg-gray-100"
          :disabled="disabled"
          @click="clearOne(chip.key)">
          <span class="text-gray-500">{{ chip.label }}:</span>
          <span class="truncate max-w-40">{{ chip.valueLabel }}</span>
          <span class="text-gray-400">×</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import BaseSelect from "@/components/features/BaseSelect.vue";
import provincesData from "@/db/CambodiaAdministrationArea/provinces.json";
import {
  useFilteredByDepartment,
  useProgramsFilteredByDepartment,
} from "@/stores/global/FilterByDepartment.js";

/** Emits */
const emit = defineEmits(["update:filters", "clear-filters", "filter-change"]);

/** Data from composables */
const { departmentOptions, loading: departmentsLoading } =
  useFilteredByDepartment({ immediate: true });

const {
  filtered: programsFiltered,
  rawList: allPrograms,
  loading: programsLoading,
  setDepartment: setProgramsDepartment,
} = useProgramsFilteredByDepartment({ immediate: true });

const loadingData = computed(
  () => departmentsLoading.value || programsLoading.value,
);

/**
 * We keep internal values as strings with "All"
 * BaseSelect uses "" for All, so we proxy.
 */
const filters = ref({
  academic_year: "All",
  department: "All",
  program: "All",
  origin: "All",
  gender: "All",
});

function makeAllProxy(key) {
  return computed({
    get() {
      return filters.value[key] === "All" ? "" : filters.value[key];
    },
    set(v) {
      filters.value[key] = v === "" ? "All" : v;
      emitClean();
      emit("filter-change", { key, value: filters.value[key] });
    },
  });
}

const academicYearModel = computed({
  get: () =>
    filters.value.academic_year === "All" ? "" : filters.value.academic_year,
  set: (v) => {
    filters.value.academic_year = v === "" ? "All" : v;
    emitClean();
    emit("filter-change", {
      key: "academic_year",
      value: filters.value.academic_year,
    });
  },
});

const departmentModel = makeAllProxy("department");
const programModel = makeAllProxy("program");
const originModel = makeAllProxy("origin");
const genderModel = makeAllProxy("gender");

/** Options for BaseSelect [{label,value}] */
const academicYearItems = computed(() => [
  { label: "2022-2023", value: "2022-2023" },
  { label: "2023-2024", value: "2023-2024" },
  { label: "2024-2025", value: "2024-2025" },
]);

const departmentItems = computed(() =>
  departmentOptions.value.map((d) => ({
    label: d.department_name || d.name || "-",
    value: d.department_name || d.name || "",
  })),
);

const programItems = computed(() => {
  const list =
    filters.value.department !== "All"
      ? programsFiltered.value
      : allPrograms.value;

  return list.map((p) => ({
    label: p.program_name || p.name || "-",
    value: p.program_name || p.name || "",
  }));
});

const originItems = computed(() =>
  provincesData
    .map((p) => p.name)
    .sort()
    .map((name) => ({ label: name, value: name })),
);

const genderItems = computed(() => [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
]);

/** Helpers: convert names -> IDs for clean emit */
function getDeptIdByName(name) {
  const d = departmentOptions.value.find(
    (x) => (x.department_name || x.name) === name,
  );
  return d?.id ?? null;
}

function getProgramIdByName(name) {
  const p =
    programsFiltered.value.find((x) => x.program_name === name) ??
    allPrograms.value.find((x) => x.program_name === name);
  return p?.id ?? null;
}

/** Emit clean object expected by parent */
function emitClean() {
  const f = filters.value;
  const clean = {};

  if (f.academic_year && f.academic_year !== "All")
    clean.academic_year = f.academic_year;

  if (f.department && f.department !== "All") {
    const id = getDeptIdByName(f.department);
    if (id != null) clean.department_id = Number(id);
  }

  if (f.program && f.program !== "All") {
    const id = getProgramIdByName(f.program);
    if (id != null) clean.program_id = Number(id);
  }

  if (f.origin && f.origin !== "All") clean.origin = f.origin;
  if (f.gender && f.gender !== "All") clean.gender = f.gender;

  emit("update:filters", clean);
}

/** Department change: filter programs + reset program */
function onDepartmentChange() {
  const deptName = filters.value.department;

  if (deptName && deptName !== "All") {
    const id = getDeptIdByName(deptName);
    setProgramsDepartment(id ?? "");
  } else {
    setProgramsDepartment("");
  }

  // reset dependent filter
  filters.value.program = "All";
  emitClean();
}

/** Safety watch */
watch(
  () => filters.value.department,
  (n, o) => {
    if (n !== o) onDepartmentChange();
  },
);

/** Clear button logic */
const resetText = computed(() => "Clear Filters");

const disableClear = computed(() => {
  const f = filters.value;
  const nothingToClear =
    f.academic_year === "All" &&
    f.department === "All" &&
    f.program === "All" &&
    f.origin === "All" &&
    f.gender === "All";

  return loadingData.value || nothingToClear;
});

function clearFiltersOnly() {
  if (disableClear.value) return;

  filters.value = {
    academic_year: "All",
    department: "All",
    program: "All",
    origin: "All",
    gender: "All",
  };

  setProgramsDepartment("");
  emit("update:filters", {}); // parent merges defaults
  emit("clear-filters");
}
</script>
