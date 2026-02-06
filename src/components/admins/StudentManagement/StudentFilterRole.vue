<template>
  <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <!-- Top bar -->
    <div class="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <div class="min-w-0">
        <h3 class="text-sm sm:text-base font-semibold text-gray-900">
          {{ "Filters" }}
        </h3>
        <p class="text-xs text-gray-500">
          {{ "Refine results by criteria" }}
        </p>
      </div>

      <!-- ✅ Clear (your button) -->
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

    <!-- Body -->
    <div class="px-4 pb-4 sm:px-5 sm:pb-5">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <BaseSelect
          v-model="academicYearModel"
          :label="t('academic_year')"
          :options="academicYearOptionItems"
          :all-label="'All Academic Years'"
          :disabled="loadingData"
          :placeholder="t('select') || 'Select...'" />

        <BaseSelect
          v-model="departmentModel"
          :label="t('department')"
          :options="departmentOptionItems"
          :all-label="'All Departments'"
          :disabled="loadingData"
          :placeholder="
            loadingData
              ? t('loading') || 'Loading...'
              : t('select') || 'Select...'
          "
          @change="onDepartmentChange" />

        <BaseSelect
          v-model="programModel"
          :label="t('program')"
          :options="programOptionItems"
          :all-label="'All Programs'"
          :disabled="loadingData"
          :placeholder="
            loadingData
              ? t('loading') || 'Loading...'
              : t('select') || 'Select...'
          " />

        <BaseSelect
          v-model="sectionModel"
          :label="t('section')"
          :options="sectionOptionItems"
          :all-label="'All Sections'"
          :disabled="loadingData"
          :placeholder="
            loadingData
              ? t('loading') || 'Loading...'
              : t('select') || 'Select...'
          " />

        <BaseSelect
          v-model="originModel"
          :label="t('origin')"
          :options="originOptionItems"
          :all-label="'All Origins'"
          :disabled="loadingData"
          :placeholder="t('select') || 'Select...'" />

        <BaseSelect
          v-model="genderModel"
          :label="t('gender')"
          :options="genderOptionItems"
          :all-label="'All Genders'"
          :disabled="loadingData"
          :placeholder="t('select') || 'Select...'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BaseSelect from "@/components/features/BaseSelect.vue";
import provincesData from "@/db/CambodiaAdministrationArea/provinces.json";
import {
  useFilteredByDepartment,
  useProgramsFilteredByDepartment,
  useSectionsFilteredByDepartment,
} from "@/stores/global/FilterByDepartment.js";

const { t } = useI18n();

const emit = defineEmits(["update:filters", "clear-filters", "filter-change"]);

/** ✅ Same composables you already use */
const {
  departments,
  departmentOptions,
  loading: departmentsLoading,
} = useFilteredByDepartment({ immediate: true });

const {
  filtered: programsFiltered,
  rawList: allPrograms,
  loading: programsLoading,
  setDepartment: setProgramsDepartment,
} = useProgramsFilteredByDepartment({ immediate: true });

const {
  filtered: sectionsFiltered,
  rawList: allSections,
  loading: sectionsLoading,
  setDepartment: setSectionsDepartment,
} = useSectionsFilteredByDepartment({ immediate: true });

const loadingData = computed(
  () =>
    departmentsLoading.value || programsLoading.value || sectionsLoading.value,
);

/** ✅ Keep your app filter values as "All" */
const filters = ref({
  academic_year: "All",
  department: "All",
  program: "All",
  section: "All",
  origin: "All",
  gender: "All",
  promotion: "All",
  shift: "All",
  score_range: "All",
  pass_fail: "All",
});

/**
 * 🔥 Proxy helper:
 * BaseSelect wants "" for All, but we keep "All" internally.
 */
function makeAllProxy(key) {
  return computed({
    get() {
      return filters.value[key] === "All" ? "" : filters.value[key];
    },
    set(v) {
      filters.value[key] = v === "" ? "All" : v;
      emit("update:filters", { ...filters.value });
      emit("filter-change", { key, value: filters.value[key] });
    },
  });
}

const academicYearModel = makeAllProxy("academic_year");
const departmentModel = makeAllProxy("department");
const programModel = makeAllProxy("program");
const sectionModel = makeAllProxy("section");
const originModel = makeAllProxy("origin");
const genderModel = makeAllProxy("gender");

/** ✅ Options => [{label, value}] for BaseSelect */
const academicYearOptionItems = computed(() => {
  const currentYear = new Date().getFullYear();
  const arr = [];
  for (let i = 0; i <= 5; i++) {
    const start = currentYear - i;
    arr.push({
      label: `${start}-${start + 1}`,
      value: `${start}-${start + 1}`,
    });
  }
  return arr;
});

const departmentOptionItems = computed(() => {
  const list = departmentOptions.value.map((d) => ({
    label: d.department_name || d.name || "-",
    value: d.department_name || d.name || "",
  }));
  return list;
});

const programOptionItems = computed(() => {
  const deptSelected = filters.value.department !== "All";
  const list = (deptSelected ? programsFiltered.value : allPrograms.value).map(
    (p) => ({
      label: p.program_name || p.name || "-",
      value: p.program_name || p.name || "",
    }),
  );
  return list;
});

const sectionOptionItems = computed(() => {
  const deptSelected = filters.value.department !== "All";
  const list = (deptSelected ? sectionsFiltered.value : allSections.value).map(
    (s) => ({
      label: s.sub_department_name || s.name || "-",
      value: s.sub_department_name || s.name || "",
    }),
  );
  return list;
});

const originOptionItems = computed(() =>
  provincesData
    .map((p) => p.name)
    .sort()
    .map((name) => ({ label: name, value: name })),
);

const genderOptionItems = computed(() => [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
]);

function onDepartmentChange() {
  const deptName = filters.value.department;
  const deptObj = departments.value.find(
    (d) => (d.department_name || d.name) === deptName,
  );

  if (deptObj && deptName !== "All") {
    setProgramsDepartment(deptObj.id);
    setSectionsDepartment(deptObj.id);
  } else {
    setProgramsDepartment("");
    setSectionsDepartment("");
  }

  filters.value.program = "All";
  filters.value.section = "All";
  emit("update:filters", { ...filters.value });
  emit("filter-change", { key: "department", value: deptName });
}

watch(
  () => filters.value.department,
  (newVal, oldVal) => {
    if (newVal !== oldVal) onDepartmentChange();
  },
);

const resetText = computed(() => "Clear Filters");

const disableClear = computed(() => {
  const f = filters.value;
  const allAll =
    f.academic_year === "All" &&
    f.department === "All" &&
    f.program === "All" &&
    f.section === "All" &&
    f.origin === "All" &&
    f.gender === "All" &&
    f.promotion === "All" &&
    f.shift === "All" &&
    f.score_range === "All" &&
    f.pass_fail === "All";

  return loadingData.value || allAll;
});

function clearFiltersOnly() {
  if (disableClear.value) return;

  filters.value = {
    academic_year: "All",
    department: "All",
    program: "All",
    section: "All",
    origin: "All",
    gender: "All",
    promotion: "All",
    shift: "All",
    score_range: "All",
    pass_fail: "All",
  };

  setProgramsDepartment("");
  setSectionsDepartment("");

  emit("update:filters", { ...filters.value });
  emit("clear-filters");
}
defineExpose({
  departments,
  programs: allPrograms,
  sections: allSections,
  loadingData,
});
</script>
