<template>
  <ListTable
    :data="enhancedGroups"
    :columns="columns"
    :loading="loading"
    :show-selection="false"
    :show-actions="true"
    :show-view-action="true"
    :show-edit-action="true"
    :show-delete-action="true"
    empty-state-title="No groups found"
    empty-state-message="There are no groups to display."
    loading-message="Loading groups..."
    @view="$emit('view', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)">
    <!-- Department -->
    <template #column-department_name="{ value }">
      <div class="min-w-0">
        <span
          v-if="!resolving"
          class="block truncate text-gray-900"
          :title="value">
          {{ value }}
        </span>

        <span
          v-else
          class="inline-block h-4 w-28 rounded bg-gray-200 animate-pulse"></span>
      </div>
    </template>

    <!-- Program -->
    <template #column-program_name="{ value }">
      <div class="min-w-0">
        <span
          v-if="!resolving"
          class="block truncate text-gray-900"
          :title="value">
          {{ value }}
        </span>

        <span
          v-else
          class="inline-block h-4 w-32 rounded bg-gray-200 animate-pulse"></span>
      </div>
    </template>

    <!-- Section -->
    <template #column-section_name="{ value }">
      <div class="min-w-0">
        <span
          v-if="!resolving"
          class="block truncate text-gray-900"
          :title="value">
          {{ value }}
        </span>

        <span
          v-else
          class="inline-block h-4 w-24 rounded bg-gray-200 animate-pulse"></span>
      </div>
    </template>

    <!-- Students -->
    <template #column-students="{ row }">
      <div class="flex justify-center">
        <span
          class="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-sm font-semibold text-gray-800">
          {{ getStudentCount(row) }}
        </span>
      </div>
    </template>
  </ListTable>
</template>

<script setup>
import ListTable from "@/components/features/ListTable.vue";
import { computed, onMounted, ref } from "vue";
import { useDepartment } from "@/stores/global/useDepartment.js";
import { useProgram } from "@/stores/global/useProgram.js";
import { useSection } from "@/stores/global/useSection.js";

const props = defineProps({
  groups: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const { getDepartmentById, getAllDepartments } = useDepartment();
const { getProgramById, getAllPrograms } = useProgram();
const { getSectionById, getAllSections } = useSection();

const resolving = ref(true);

onMounted(async () => {
  try {
    resolving.value = true;
    await Promise.all([
      getAllDepartments(),
      getAllPrograms(),
      getAllSections(),
    ]);
  } finally {
    resolving.value = false;
  }
});

// Small helper: first non-empty string
const pick = (...vals) =>
  vals.find((v) => typeof v === "string" && v.trim().length) || null;

// Resolve by trying multiple possible id fields (string/number safe)
const resolveByAnyId = (getter, ...ids) => {
  for (const id of ids) {
    if (id === null || id === undefined || id === "") continue;
    const found = getter(String(id));
    if (found) return found;
    // also try raw number if stores use numeric
    const foundNum = getter(Number(id));
    if (foundNum) return foundNum;
  }
  return null;
};

const enhancedGroups = computed(() => {
  return props.groups.map((group) => {
    const department = resolveByAnyId(
      getDepartmentById,
      group.department_id,
      group.dept_id
    );
    const program = resolveByAnyId(
      getProgramById,
      group.program_id,
      group.programme_id
    );
    const section = resolveByAnyId(
      getSectionById,
      group.section_id,
      group.sub_department_id,
      group.subdepartment_id
    );

    const departmentName =
      pick(
        department?.department_name,
        group.department_name,
        group.department
      ) || "—";

    const programName =
      pick(
        program?.program_name,
        program?.programme_name,
        group.program_name,
        group.programme,
        group.program
      ) || "—";

    const sectionName =
      pick(
        section?.name,
        section?.section_name,
        section?.sub_department_name,
        group.section_name,
        group.sub_department,
        group.section
      ) || "—";

    return {
      ...group,
      department_name: departmentName,
      program_name: programName,
      section_name: sectionName,
    };
  });
});


const columns = [
  { key: "name", label: "Group Name" },
  { key: "department_name", label: "Department" },
  { key: "program_name", label: "Program" },
  { key: "section_name", label: "Section" },
  { key: "students", label: "Students" },
];

function getStudentCount(group) {
  if (Array.isArray(group.students)) return group.students.length;
  if (Array.isArray(group.student_ids)) return group.student_ids.length;
  if (typeof group.student_count === "number") return group.student_count;
  return 0;
}
</script>
