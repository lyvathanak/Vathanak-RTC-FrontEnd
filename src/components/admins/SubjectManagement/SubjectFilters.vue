<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div class="min-w-0">
        <h3 class="text-base font-semibold text-gray-800">Subject Filters</h3>
        <p class="text-sm text-gray-500">
          Select department, program, and year to view subjects
        </p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Clear Filters -->
        <button
          type="button"
          @click="$emit('clear')"
          :class="[
            'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold active:scale-[0.99]',
            disableClear
              ? 'border-gray-200 text-gray-400 hover:bg-gray-50'
              : 'border-red-200 text-red-600 hover:bg-red-50',
          ]">
          Clear Filters
        </button>
      </div>
    </div>
    <div
      class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <!-- Left: filters -->
      <div class="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
        <!-- Department -->
        <div class="space-y-1">
          <BaseSelect
            v-model="deptModel"
            label="Department"
            :allLabel="'All departments'"
            placeholder="Select department"
            :options="departmentOptions"
            :disabled="loadingRefData"
            @change="onDeptPicked"
            hint="Choose a department to unlock program options." />
        </div>

        <!-- Program -->
        <div class="space-y-1">
          <BaseSelect
            v-model="programModel"
            label="Program"
            :allLabel="modelValue.department_id ? 'All programs' : ''"
            :placeholder="
              modelValue.department_id
                ? 'Select program'
                : 'Select department first'
            "
            :options="programOptions"
            :disabled="!modelValue.department_id || loadingRefData"
            @change="onProgramPicked"
            hint="Programs are filtered by selected department." />
        </div>

        <!-- Academic -->
        <div class="space-y-1">
          <BaseSelect
            v-model="academicModel"
            label="Academic"
            :allLabel="modelValue.program_id ? 'All academic years' : ''"
            :placeholder="
              modelValue.program_id
                ? 'Select academic year'
                : 'Select program first'
            "
            :options="academicOptions"
            :disabled="!modelValue.program_id || loadingRefData"
            @change="onAcademicPicked"
            hint="Academic options are filtered by selected program." />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import BaseSelect from "@/components/features/BaseSelect.vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ department_id: "", program_id: "", academic_year: "" }),
  },
  loadingRefData: { type: Boolean, default: false },
  departmentsWithPrograms: { type: Array, default: () => [] },
  filteredProgramOptions: { type: Array, default: () => [] },
  filteredAcademicOptions: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "update:modelValue",
  "dept-change",
  "program-change",
  "clear",
]);

const disableClear = computed(() => {
  const d = props.modelValue?.department_id;
  const p = props.modelValue?.program_id;
  const a = props.modelValue?.academic_year;
  return !d && !p && !a;
});

function update(patch) {
  emit("update:modelValue", { ...(props.modelValue || {}), ...patch });
}

/** v-model adapters (BaseSelect emits raw value, we keep them as string) */
const deptModel = computed({
  get: () => props.modelValue.department_id || "",
  set: (v) => update({ department_id: String(v ?? "") }),
});

const programModel = computed({
  get: () => props.modelValue.program_id || "",
  set: (v) => update({ program_id: String(v ?? "") }),
});

const academicModel = computed({
  get: () => props.modelValue.academic_year || "",
  set: (v) => update({ academic_year: String(v ?? "") }),
});

/** Map data into BaseSelect format: [{label, value}] */
const departmentOptions = computed(() =>
  (props.departmentsWithPrograms || []).map((d) => ({
    label: d.name,
    value: String(d.id),
  }))
);

const programOptions = computed(() =>
  (props.filteredProgramOptions || []).map((p) => ({
    label: p.name,
    value: String(p.id),
  }))
);

const academicOptions = computed(() =>
  (props.filteredAcademicOptions || []).map((y) => ({
    label: String(y),
    value: String(y),
  }))
);

/** Change handlers (keep your reset logic + emits) */
function onDeptPicked(v) {
  const department_id = String(v ?? "");
  update({ department_id, program_id: "", academic_year: "" });
  emit("dept-change", department_id);
}

function onProgramPicked(v) {
  const program_id = String(v ?? "");
  update({ program_id, academic_year: "" });
  emit("program-change", program_id);
}

function onAcademicPicked(v) {
  update({ academic_year: String(v ?? "") });
}
</script>
