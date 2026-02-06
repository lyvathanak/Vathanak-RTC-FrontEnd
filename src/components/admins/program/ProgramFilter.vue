<template>
  <section
    class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <!-- Top -->
    <div class="px-4 sm:px-5 py-4 border-b bg-white">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <h3 v-if="title" class="text-sm sm:text-base font-bold text-gray-900">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-xs sm:text-sm text-gray-500 mt-0.5">
            {{ subtitle }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Clear Filters -->
          <button
            type="button"
            @click="clearFilters"
            :class="[
              'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:text-sm font-semibold active:scale-[0.99] transition',
              disableClear
                ? 'border-gray-200 text-gray-400 bg-white hover:bg-gray-50 cursor-not-allowed opacity-60'
                : 'border-red-200 text-red-600 bg-white hover:bg-red-50',
            ]">
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="p-4 sm:p-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <!-- Department -->
        <BaseSelect
          v-model="currentFilters.department"
          label="Department"
          allLabel="All Departments"
          placeholder="Select department..."
          :options="departmentOptionsNormalized"
          @change="(v) => onChange('department', v)" />

        <!-- Academic Year -->
        <BaseSelect
          v-model="currentFilters.academic_year"
          label="Academic Year"
          allLabel="All Academic Years"
          placeholder="Select academic year..."
          :options="academicYearOptionsNormalized"
          @change="(v) => onChange('academic_year', v)" />

        <!-- Degree Level -->
        <BaseSelect
          v-model="currentFilters.degree_level"
          label="Degree Level"
          allLabel="All Degree Levels"
          placeholder="Select degree level..."
          :options="degreeLevelOptionsNormalized"
          @change="(v) => onChange('degree_level', v)" />
      </div>
    </div>
  </section>
</template>
<script setup>
import { reactive, computed, watch, onMounted } from "vue";
import BaseSelect from "@/components/features/BaseSelect.vue";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },

  departmentOptions: { type: Array, default: () => [] },
  academicYearOptions: { type: Array, default: () => [] },
  degreeLevelOptions: { type: Array, default: () => [] },

  initialFilters: { type: Object, default: () => ({}) },

  clearButtonText: { type: String, default: "Clear Filters" },
  autoEmit: { type: Boolean, default: true },
});

const emit = defineEmits(["update:filters", "clear-filters", "filter-change"]);

function normalizeOptions(raw, allLabel = "All") {
  if (!Array.isArray(raw)) return [];
  if (raw.length && typeof raw[0] === "object") {
    return raw.map((o) => ({
      label: String(o.label ?? o.value ?? ""),
      value: o.value ?? o.label ?? "",
    }));
  }
  return raw.map((x) => ({
    label: String(x),
    value: String(x) === allLabel ? "" : String(x),
  }));
}

// IMPORTANT: remove trailing spaces. Use "All"
const departmentOptionsNormalized = computed(() =>
  normalizeOptions(props.departmentOptions, "All"),
);
const academicYearOptionsNormalized = computed(() =>
  normalizeOptions(props.academicYearOptions, "All"),
);
const degreeLevelOptionsNormalized = computed(() =>
  normalizeOptions(props.degreeLevelOptions, "All"),
);

function pickInitial(key) {
  const v = props.initialFilters?.[key];
  if (v === undefined || v === null) return "";
  return String(v) === "All" ? "" : v;
}

// IMPORTANT: use snake_case keys to match ProgramIndex.vue
const currentFilters = reactive({
  department: pickInitial("department"),
  academic_year: pickInitial("academic_year"),
  degree_level: pickInitial("degree_level"),
});

const disableClear = computed(() => {
  return (
    currentFilters.department === "" &&
    currentFilters.academic_year === "" &&
    currentFilters.degree_level === ""
  );
});

function emitAll() {
  emit("update:filters", {
    department:
      currentFilters.department === "" ? "All" : currentFilters.department,
    academic_year:
      currentFilters.academic_year === ""
        ? "All"
        : currentFilters.academic_year,
    degree_level:
      currentFilters.degree_level === "" ? "All" : currentFilters.degree_level,
  });
}

function onChange(key, value) {
  emit("filter-change", { key, value, allFilters: { ...currentFilters } });
  if (props.autoEmit) emitAll();
}

function clearFilters() {
  currentFilters.department = "";
  currentFilters.academic_year = "";
  currentFilters.degree_level = "";
  emit("clear-filters");
  emitAll();
}

watch(
  () => props.initialFilters,
  () => {
    currentFilters.department = pickInitial("department");
    currentFilters.academic_year = pickInitial("academic_year");
    currentFilters.degree_level = pickInitial("degree_level");
    emitAll();
  },
  { deep: true },
);

onMounted(() => emitAll());
</script>
