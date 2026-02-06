<template>
  <div class="relative w-full sm:max-w-md">
    <!-- Search icon -->
    <Search
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

    <!-- Input -->
    <input
      :value="searchValue"
      @input="onSearchInput"
      type="text"
      placeholder="Search names…"
      class="h-10 w-full rounded-xl border px-10 pr-10 outline-none focus:ring-2 focus:ring-[#235AA6]" />

    <!-- Clear button -->
    <button
      v-if="searchValue"
      type="button"
      @click="clearSearch"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      aria-label="Clear search">
      ✕
    </button>
  </div>

  <div class="bg-white border rounded-2xl p-4 sm:p-5 shadow-sm">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div class="min-w-0">
        <h3 class="text-base font-semibold text-gray-800">
          Import Score Filters
        </h3>
        <p class="text-sm text-gray-500">
          Select academic year, program, and year to view/import scores
        </p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Clear Filters -->
        <button
          type="button"
          @click="clearFilters"
          :class="[
            'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold active:scale-[0.99]',
            hasFilters
              ? 'border-red-200 text-red-600 hover:bg-red-50'
              : 'border-gray-200 text-gray-400 hover:bg-gray-50',
          ]">
          Clear Filters
        </button>

        <!-- Reset -->
        <button
          type="button"
          @click="reset"
          class="shrink-0 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99]">
          <RotateCcw class="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <!-- Academic Year -->
      <BaseSelect
        v-model="local.academicYear"
        label="Academic Year"
        placeholder="Select Academic Year"
        allLabel="All Academic Year"
        :options="academicYearOptions"
        @change="onAcademicYearChange"
        hint="Filter groups by academic year." />

      <!-- Program -->
      <BaseSelect
        v-model="local.programId"
        label="Program"
        placeholder="Select Program"
        allLabel="All Program"
        :options="programOptions"
        :disabled="!local.academicYear"
        @change="onProgramChange"
        hint="Programs are filtered by selected academic year." />

      <!-- Year -->
      <BaseSelect
        v-model="local.yearId"
        label="Year / Generation"
        placeholder="Select Year / Generation"
        allLabel="All Year / Generation"
        :options="yearOptions"
        :disabled="!local.programId"
        @change="onYearChange"
        hint="Years are filtered by selected program." />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { RotateCcw, Search } from "lucide-vue-next";
import BaseSelect from "@/components/features/BaseSelect.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  academicYears: { type: Array, default: () => [] },
  programs: { type: Array, default: () => [] },
  years: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue"]);

const local = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const searchValue = computed(() => local.value.search || "");

let searchTimer = null;
function onSearchInput(e) {
  const value = e.target.value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    local.value = { ...local.value, search: value };
  }, 250);
}

function clearSearch() {
  local.value = { ...local.value, search: "" };
}

const academicYearOptions = computed(() =>
  (props.academicYears || []).map((y) => ({ label: y, value: y }))
);

const programOptions = computed(() =>
  (props.programs || []).map((p) => ({
    label: p.program_name,
    value: String(p.id),
  }))
);

const yearOptions = computed(() =>
  (props.years || []).map((y) => ({
    label: `Year ${y.year}`,
    value: String(y.id),
  }))
);

function onAcademicYearChange(value) {
  local.value = {
    ...local.value,
    academicYear: value || "",
    programId: "",
    yearId: "",
  };
}

function onProgramChange(value) {
  local.value = {
    ...local.value,
    programId: value || "",
    yearId: "",
  };
}

function onYearChange(value) {
  local.value = { ...local.value, yearId: value || "" };
}

function reset() {
  local.value = { search: "", academicYear: "", programId: "", yearId: "" };
}

const hasFilters = computed(() => {
  const { search, academicYear, programId, yearId } = local.value;
  return !!(search || academicYear || programId || yearId);
});

function clearFilters() {
  local.value = { ...local.value, academicYear: "", programId: "", yearId: "" };
}
</script>
