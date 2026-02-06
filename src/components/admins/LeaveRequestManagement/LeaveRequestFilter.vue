<template>
  <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <!-- Top bar -->
    <div class="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-900">
            Filters
          </h3>

          <span
            v-if="activeCount > 0"
            class="inline-flex items-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 px-2.5 py-0.5 text-xs font-semibold">
            {{ activeCount }} active
          </span>
        </div>

        <p class="text-[12px] sm:text-sm text-gray-500">
          Narrow results by status, type, role, department, etc.
        </p>
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

    <!-- Filters body -->
    <div
      class="px-4 pb-4 sm:px-5 sm:pb-5"
      :class="[
        'transition-all',
        disabled ? 'opacity-75' : '',
        mobileOpen ? 'block' : 'hidden sm:block',
      ]">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <BaseSelect
          v-if="isEnabled('status')"
          v-model="local.status"
          label="Status"
          all-label="All Statuses"
          :disabled="disabled"
          :options="statusOptions" />

        <BaseSelect
          v-if="isEnabled('type')"
          v-model="local.type"
          label="Leave Type"
          all-label="All Types"
          :disabled="disabled"
          :options="typeOptions" />

        <BaseSelect
          v-if="isEnabled('role')"
          v-model="local.role"
          label="Role"
          all-label="All Roles"
          :disabled="disabled"
          :options="roleOptions" />

        <BaseSelect
          v-if="isEnabled('academicYear')"
          v-model="local.academicYear"
          label="Academic Year"
          all-label="All Academic Years"
          :disabled="disabled"
          :options="academicYearOptions" />

        <BaseSelect
          v-if="isEnabled('department')"
          v-model="local.department"
          label="Department"
          all-label="All Departments"
          :disabled="disabled"
          :options="departmentOptions" />

        <BaseSelect
          v-if="isEnabled('program')"
          v-model="local.program"
          label="Program"
          all-label="All Programs"
          :disabled="disabled"
          :options="programOptions" />

        <BaseSelect
          v-if="isEnabled('section')"
          v-model="local.section"
          label="Section"
          all-label="All Sections"
          :disabled="disabled"
          :options="sectionOptions" />

        <BaseSelect
          v-if="isEnabled('semester')"
          v-model="local.semester"
          label="Semester"
          all-label="All Semesters"
          :disabled="disabled"
          :options="semesterOptions" />

        <BaseSelect
          v-if="isEnabled('date')"
          v-model="local.date"
          label="Date"
          all-label="All Dates"
          :disabled="disabled"
          :options="dateOptions" />
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
import { reactive, computed, watch, ref } from "vue";
import BaseSelect from "@/components/features/BaseSelect.vue";

const emit = defineEmits(["update:filters", "clear-filters", "filter-change"]);

const props = defineProps({
  enabledFilters: {
    type: Array,
    default: () => [],
  },
  disabled: { type: Boolean, default: false },

  // empty string "" = All (matches BaseSelect)
  initial: {
    type: Object,
    default: () => ({
      status: "",
      type: "",
      role: "",
      academicYear: "",
      program: "",
      department: "",
      section: "",
      semester: "",
      date: "",
    }),
  },

  options: {
    type: Object,
    default: () => ({}),
  },
});

const mobileOpen = ref(false);

function isEnabled(key) {
  return Array.isArray(props.enabledFilters)
    ? props.enabledFilters.includes(key)
    : false;
}

const local = reactive({
  status: props.initial.status ?? "",
  type: props.initial.type ?? "",
  role: props.initial.role ?? "",
  academicYear: props.initial.academicYear ?? "",
  program: props.initial.program ?? "",
  department: props.initial.department ?? "",
  section: props.initial.section ?? "",
  semester: props.initial.semester ?? "",
  date: props.initial.date ?? "",
});

// ---- Options (NO "All" here; BaseSelect handles All via allLabel + value "")
const toSelectOptions = (arr) =>
  (arr || []).map((v) => ({ label: String(v), value: String(v) }));

const statusOptions = computed(() =>
  toSelectOptions(props.options.status ?? ["Pending", "Approved", "Rejected"]),
);

const typeOptions = computed(() =>
  toSelectOptions(
    props.options.type ?? [
      "Annual",
      "Sick Leave",
      "Personal Leave",
      "Maternity",
      "Other",
    ],
  ),
);

const roleOptions = computed(() => [
  { label: "Admin", value: "Admin" },
  { label: "Head of Department", value: "Head_Department" },
  { label: "Teacher", value: "Teacher" },
  { label: "Student", value: "Student" },
]);

const academicYearOptions = computed(() =>
  toSelectOptions(props.options.academicYear ?? ["2025", "2024", "2023"]),
);

const departmentOptions = computed(() =>
  toSelectOptions(props.options.department ?? ["CS", "Math", "Physics"]),
);

const programOptions = computed(() =>
  toSelectOptions(props.options.program ?? ["IT", "Business", "Engineering"]),
);

const sectionOptions = computed(() =>
  toSelectOptions(props.options.section ?? ["A", "B", "C"]),
);

const semesterOptions = computed(() =>
  toSelectOptions(props.options.semester ?? ["1", "2"]),
);

const dateOptions = computed(() =>
  toSelectOptions(props.options.date ?? ["Today", "This Week", "This Month"]),
);

// ---- Active chips + count ("" is NOT active)
function isActive(v) {
  return String(v ?? "") !== "";
}

const activeChips = computed(() => {
  const chips = [];

  const pushChip = (key, label, optionsRef) => {
    if (!isEnabled(key)) return;
    const value = local[key];
    if (!isActive(value)) return;

    const opts = optionsRef?.value ?? [];
    const valueLabel =
      opts.find((o) => String(o.value) === String(value))?.label ??
      String(value);

    chips.push({ key, label, valueLabel });
  };

  pushChip("status", "Status", statusOptions);
  pushChip("type", "Type", typeOptions);
  pushChip("role", "Role", roleOptions);
  pushChip("academicYear", "Year", academicYearOptions);
  pushChip("department", "Dept", departmentOptions);
  pushChip("program", "Program", programOptions);
  pushChip("section", "Section", sectionOptions);
  pushChip("semester", "Semester", semesterOptions);
  pushChip("date", "Date", dateOptions);

  return chips;
});

const activeCount = computed(() => activeChips.value.length);

// ---- Emit filters to parent
function emitFilters(changedKey = "") {
  const payload = { ...local };
  emit("update:filters", payload);

  if (changedKey) {
    emit("filter-change", { key: changedKey, value: payload[changedKey] });
  }
}

watch(
  () => ({ ...local }),
  () => emitFilters(),
  { deep: true },
);

function clearOne(key) {
  local[key] = ""; // back to All
  emitFilters(key);
}

function clearAll() {
  Object.keys(local).forEach((k) => (local[k] = ""));
  emit("clear-filters");
  emitFilters();
}
const disableClear = computed(() => activeCount.value === 0 || props.disabled);
const resetText = computed(() => "Clear Filters");

function clearFiltersOnly() {
  Object.keys(local).forEach((k) => (local[k] = "")); // "" = All
  emit("clear-filters"); // optional: parent can react
  emitFilters(); // pushes updated filters to parent
}
</script>
