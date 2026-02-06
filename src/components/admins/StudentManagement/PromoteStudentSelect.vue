<template>
  <div :class="[locale === 'kh' ? 'khmer-text' : '']">
    <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <!-- Header -->
      <div class="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 class="text-base font-semibold text-gray-800">{{ title }}</h2>
          <p class="text-sm text-gray-500">{{ subtitle }}</p>
        </div>
        <!-- Actions -->
        <div class="">
          <button
            type="button"
            @click="clearFiltersOnly"
            :class="[
              'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold active:scale-[0.99] transition',
              disableClear
                ? 'border-gray-200 text-gray-400 hover:bg-gray-50'
                : 'border-red-200 text-red-600 hover:bg-red-50',
            ]">
            {{ resetText }}
          </button>
        </div>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <!-- Name -->
        <div class="relative">
          <label class="filter-label">{{ placeholders.userName }}</label>
          <div class="relative">
            <Search class="select-icon w-4 h-4 text-gray-400" />
            <input
              :value="modelValue.userName"
              @input="update('userName', $event.target.value)"
              type="text"
              :placeholder="placeholders.userName"
              class="filter-input pl-9" />
          </div>
        </div>

        <!-- Department -->
        <BaseSelect
          v-model="departmentModel"
          :label="placeholders.department"
          :placeholder="placeholders.department"
          :all-label="`All ${placeholders.department}`"
          :options="departmentsForSelectOptions"
          hint="Choose a department to unlock program options." />

        <!-- Academic Year -->
        <BaseSelect
          v-model="academicYearModel"
          :label="placeholders.academicYear"
          :placeholder="placeholders.academicYear"
          :all-label="`All ${placeholders.academicYear}`"
          :options="academicYearsForSelectOptions"
          hint="You can filter by academic year even without choosing a program." />

        <!-- Program -->
        <BaseSelect
          v-model="programModel"
          :label="placeholders.program"
          :placeholder="placeholders.program"
          :all-label="`All ${placeholders.program}`"
          :options="programsForSelectOptions"
          hint="Program will auto-fill Academic Year." />
        <!-- Year -->
        <BaseSelect
          v-model="yearModel"
          :label="placeholders.year"
          :placeholder="placeholders.year"
          :all-label="`All ${placeholders.year}`"
          :options="yearsForSelectOptions"
          hint="Selecting a year may reset Program, Academic Year, and Generation." />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Search } from "lucide-vue-next";
import BaseSelect from "@/components/features/BaseSelect.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  locale: { type: String, default: "en" },

  title: { type: String, default: "Student Filters" },
  subtitle: {
    type: String,
    default: "Filter students by name, program, year, and more",
  },
  resetText: { type: String, default: "Clear Filters" },

  placeholders: {
    type: Object,
    default: () => ({
      userName: "Student name",
      program: "Program",
      academicYear: "Academic year",
      department: "Department",
      year: "Year",
      generation: "Generation",
      group: "Group",
    }),
  },

  programOptions: { type: Array, default: () => [] },
  departmentOptions: { type: Array, default: () => [] },
  yearOptions: { type: Array, default: () => [] },
  generationOptions: { type: Array, default: () => [] },
  academicYearOptions: { type: Array, default: () => [] },
  groupOptions: { type: Array, default: () => [] },

  programDeptMap: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:modelValue", "reset", "clear"]);

/** ✅ IMPORTANT
 * Use patch() so multiple updates won't overwrite each other.
 */
const patch = (obj) => {
  emit("update:modelValue", { ...props.modelValue, ...obj });
};

const update = (key, value) => {
  patch({ [key]: value });
};

/* ---------- helpers ---------- */
const idOf = (v) => {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  return String(v?.id ?? v?.value ?? "");
};

const normalizeProgram = (p) => {
  const obj = p?.program ?? p;
  return {
    id: idOf(obj?.id ?? obj?.program_id ?? obj?.value),
    label: obj?.label ?? obj?.program_name ?? obj?.name ?? "—",
    academic_year: String(obj?.academic_year ?? obj?.academicYear ?? ""),
  };
};

const normalizeDept = (d) => ({
  id: idOf(d),
  label: d?.department_name ?? d?.name ?? String(d ?? "—"),
});

const normalizeGeneration = (g) => ({
  id: idOf(g),
  label: g?.label ?? g?.number_gen ?? g?.name ?? String(g ?? "—"),
});

/* ---------- options -> BaseSelect format ---------- */
const departmentsForSelectOptions = computed(() =>
  (props.departmentOptions || [])
    .map(normalizeDept)
    .filter((x) => x.id)
    .map((d) => ({ label: d.label, value: String(d.id) })),
);

const yearsForSelectOptions = computed(() =>
  (props.yearOptions || [])
    .map((y) => String(y))
    .filter(Boolean)
    .sort((a, b) => Number(a) - Number(b))
    .map((y) => ({ label: y, value: y })),
);

const generationsForSelectOptions = computed(() =>
  (props.generationOptions || [])
    .map(normalizeGeneration)
    .filter((x) => x.id)
    .map((g) => ({ label: String(g.label), value: String(g.id) })),
);

const programsForSelect = computed(() =>
  (props.programOptions || []).map(normalizeProgram).filter((p) => p.id),
);

const programsForSelectOptions = computed(() => {
  const selectedAY = String(props.modelValue?.academicYear ?? "");

  // If no academic year selected => show all programs
  if (!selectedAY) {
    return programsForSelect.value.map((p) => ({
      label: p.label,
      value: String(p.id),
    }));
  }

  // If academic year selected => show only matching programs
  return programsForSelect.value
    .filter((p) => String(p.academic_year) === selectedAY)
    .map((p) => ({ label: p.label, value: String(p.id) }));
});

const academicYearsForSelectOptions = computed(() => {
  const ays = (props.academicYearOptions || []).map(String).filter(Boolean);
  const fromPrograms = programsForSelect.value
    .map((p) => p.academic_year)
    .filter(Boolean);
  const uniq = [...new Set([...ays, ...fromPrograms])];
  return uniq.map((ay) => ({ label: ay, value: ay }));
});

const groupOptionsForSelectOptions = computed(() =>
  (props.groupOptions || [])
    .map(String)
    .filter(Boolean)
    .map((g) => ({ label: g, value: g })),
);

/* ---------- v-model computed (MATCH PARENT KEYS) ---------- */
const departmentModel = computed({
  get: () => idOf(props.modelValue?.department),
  set: (v) => update("department", String(v ?? "")),
});

const yearModel = computed({
  get: () => String(props.modelValue?.year ?? ""),
  set: (v) => update("year", String(v ?? "")),
});

const generationModel = computed({
  get: () => idOf(props.modelValue?.generation),
  set: (v) => update("generation", String(v ?? "")),
});

const academicYearModel = computed({
  get: () => String(props.modelValue?.academicYear ?? ""),
  set: (v) => update("academicYear", String(v ?? "")),
});

const groupModel = computed({
  get: () => String(props.modelValue?.group ?? ""),
  set: (v) => update("group", String(v ?? "")),
});

const selectedProgramCache = ref(null);

const programModel = computed({
  get: () => idOf(props.modelValue?.program),
  set: (v) => onProgramChange(String(v ?? "")),
});

function onProgramChange(programId) {
  const pid = String(programId || "");

  if (!pid) {
    patch({ program: "" });
    selectedProgramCache.value = null;
    return;
  }

  const found = programsForSelect.value.find((p) => String(p.id) === pid);

  patch({
    program: pid,
    // If program has academic year, always sync it
    academicYear: found?.academic_year || props.modelValue?.academicYear || "",
  });

  selectedProgramCache.value = found || null;
}

const onReset = () => {
  patch({
    userName: "",
    program: "",
    academicYear: "",
    generation: "",
    year: "",
    department: "",
    group: "",
  });
  selectedProgramCache.value = null;
  emit("reset");
};

/* ---------- disable clear (MATCH KEYS) ---------- */
const disableClear = computed(() => {
  const m = props.modelValue || {};
  return (
    !m.userName &&
    !m.department &&
    !m.program &&
    !m.academicYear &&
    !m.year &&
    !m.generation &&
    !m.group
  );
});

function clearFiltersOnly() {
  if (disableClear.value) return;

  patch({
    userName: "",
    department: "",
    program: "",
    academicYear: "",
    year: "",
    generation: "",
    group: "",
  });

  selectedProgramCache.value = null;
  emit("clear");
}

watch(
  () => props.modelValue.academicYear,
  (newAY, oldAY) => {
    if (String(newAY ?? "") === String(oldAY ?? "")) return;

    const pid = String(props.modelValue?.program ?? "");
    if (!pid) return;

    const found = programsForSelect.value.find((p) => String(p.id) === pid);

    // If selected program doesn't belong to selected academic year => clear program
    if (found && String(found.academic_year) !== String(newAY ?? "")) {
      patch({ program: "" });
      selectedProgramCache.value = null;
    }
  },
);
</script>

<style scoped>
.khmer-text {
  font-size: 14px;
}
.filter-input {
  width: 100%;
  min-height: 40px;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
  background: white;
}
.filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}
.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
  pointer-events: none;
}
.filter-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}
</style>
