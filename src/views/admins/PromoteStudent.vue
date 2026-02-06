<template>
  <div
    class="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-6 sm:py-8 space-y-4">
    <PageHeader
      :title="t('promote_students')"
      subtitle="Track and manage your promote student applications" />

    <!-- Filters -->
    <PromoteStudentSelect
      v-model="filters"
      :program-options="programs"
      :department-options="departments"
      :year-options="yearOptions"
      :generation-options="generationOptions"
      :academic-year-options="academicYearOptions"
      :program-dept-map="programDeptMap"
      :group-options="['A', 'B', 'C']"
      @reset="onResetFilters" />

    <!-- Action Bar -->
    <div class="flex flex-col lg:flex-row lg:items-center gap-4 mb-2">
      <button
        type="button"
        @click="openPromoteModal"
        :disabled="selectedRowIds.length === 0"
        class="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#235AA6] text-white px-4 py-2.5 transition disabled:bg-gray-300 disabled:cursor-not-allowed">
        <Plus class="w-4 h-4" />
        {{ t("promote_students") }}
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <UserProgramsTable
        :data="pagedRows"
        :loading="loading"
        :selected-row-indexes="selectedRowIds"
        :start-index="(page - 1) * pageSize"
        @select="handleRowSelect"
        @selectAll="handleSelectAll" />
    </div>

    <!-- Pagination -->
    <Pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total-items="filteredRows.length"
      :page-size-options="[5, 10, 25, 50, 100]"
      :item-label="t('students')" />

    <!-- Promote Modal -->
    <PromoteStudentForm
      v-model="showPromoteModal"
      :students="selectedStudentsForPromotion"
      @promote="handlePromoteStudents" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Plus, Search } from "lucide-vue-next";

import PageHeader from "@/components/features/PageHeader.vue";
import Pagination from "@/components/features/Pagination.vue";
import UserProgramsTable from "@/components/admins/StudentManagement/UserProgramsTable.vue";
import PromoteStudentForm from "@/components/admins/StudentManagement/PromoteStudentForm.vue";
import PromoteStudentSelect from "@/components/admins/StudentManagement/PromoteStudentSelect.vue";

import { UserProgramCRUD } from "@/stores/apis/UserProgramCRUD.js";
import { showNotification } from "@/lib/notifications.js";

const { t } = useI18n();

/* -------------------- STATE -------------------- */
const rows = ref([]);
const loading = ref(false);

const programs = ref([]);
const departments = ref([]);

const page = ref(1);
const pageSize = ref(10);

const selectedRowIds = ref([]);
const selectedStudentsForPromotion = ref([]);
const showPromoteModal = ref(false);

const filters = ref({
  userName: "",
  program: "",
  academicYear: "",
  generation: "",
  year: "",
  department: "",
  group: "",
});

/* -------------------- HELPERS -------------------- */
const norm = (v) =>
  String(v ?? "")
    .toLowerCase()
    .trim();

const pickId = (v) =>
  typeof v === "object" && v !== null
    ? String(v.id ?? v.value ?? "")
    : String(v ?? "");

const getRowProgramId = (r) =>
  pickId(
    r?.program_id ?? // ✅ most common
      r?.program?.id ?? // ✅ sometimes here
      r?.program?.program_id ?? // ✅ sometimes here
      r?.program?.value, // ✅ fallback
  );
const getRowDepartmentId = (r) =>
  pickId(
    r?.department_id ?? // ✅ top-level
      r?.program?.department?.id ?? // ✅ nested
      r?.program?.department_id ?? // ✅ sometimes here
      r?.department?.id, // ✅ fallback
  );
const getRowYear = (r) =>
  pickId(r.year ?? r.program_year ?? r.program?.year_of_study);
const getRowGenerationId = (r) => pickId(r.generation?.id ?? r.generation_id);

const getRowAcademicYear = (r) =>
  String(r?.program?.academic_year ?? r?.academic_year ?? "");

/* -------------------- OPTIONS -------------------- */


const generationOptions = computed(() => {
  const map = new Map();
  rows.value.forEach((r) => {
    if (r.generation?.id) map.set(r.generation.id, r.generation);
  });
  return [...map.values()];
});

const yearOptions = computed(() => {
  const years = rows.value.map(getRowYear).filter(Boolean);
  return [...new Set(years)].sort((a, b) => Number(a) - Number(b));
});

/* -------------------- FILTERING -------------------- */
const filteredRows = computed(() =>
  rows.value.filter((r) => {
    const fullName = `${r.user_detail?.latin_name ?? ""} ${
      r.user_detail?.khmer_name ?? ""
    }`;

    return (
      norm(fullName).includes(norm(filters.value.userName)) &&
      (!filters.value.program ||
        getRowProgramId(r) === String(filters.value.program)) &&
      (!filters.value.department ||
        getRowDepartmentId(r) === String(filters.value.department)) &&
      (!filters.value.academicYear ||
        getRowAcademicYear(r) === String(filters.value.academicYear)) &&
      (!filters.value.year || getRowYear(r) === String(filters.value.year)) &&
      (!filters.value.generation ||
        getRowGenerationId(r) === String(filters.value.generation)) &&
      (!filters.value.group ||
        (r.group || []).some((g) =>
          norm(g?.name).includes(norm(filters.value.group)),
        ))
    );
  }),
);

const normalizeRow = (r) => {
  const deptName =
    r?.program?.department?.department_name ||
    r?.program?.department_name ||
    r?.department?.department_name ||
    r?.department_name ||
    "N/A";

  const programId =
    r?.program?.id ?? r?.program_id ?? r?.program?.program_id ?? "";

  return {
    ...r,
    user_detail: r.user_detail || {},
    program_id: programId, // ✅ keep top-level consistent too
    program: {
      ...(r.program || {}),
      id: programId, // ✅ IMPORTANT: ensure program.id always exists
      department_name: deptName,
      academic_year: r.program?.academic_year || r.academic_year || "—",
      program_name: r.program?.program_name || r.program_name || "—",
    },
    generation: r.generation || {},
    group: Array.isArray(r.group) ? r.group : [],
  };
};

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

/* -------------------- LOAD DATA -------------------- */
const loadUserPrograms = async () => {
  loading.value = true;
  try {
    const res = await UserProgramCRUD.getAllUserPrograms();
    rows.value = (res?.data || []).map(normalizeRow);
  } finally {
    loading.value = false;
  }
};

const programDeptMap = computed(() => {
  const map = new Map();

  rows.value.forEach((r) => {
    const programId = String(r?.program?.id || r?.program_id || "");
    const deptId = String(r?.program?.department?.id || r?.department_id || "");

    if (programId && deptId && !map.has(programId)) {
      map.set(programId, deptId);
    }
  });

  // convert to plain object for props
  return Object.fromEntries(map.entries());
});

const loadPrograms = async () => {
  const res = await UserProgramCRUD.getAllPrograms();
  programs.value = res?.data ?? [];
};

const loadDepartments = async () => {
  const res = await UserProgramCRUD.getAllDepartments();
  departments.value = res?.data ?? [];
};

onMounted(async () => {
  await Promise.all([loadUserPrograms(), loadPrograms(), loadDepartments()]);
});

/* -------------------- SELECTION -------------------- */
const handleRowSelect = (id) => {
  selectedRowIds.value = selectedRowIds.value.includes(id)
    ? selectedRowIds.value.filter((i) => i !== id)
    : [...selectedRowIds.value, id];
};

const handleSelectAll = (ids) => {
  selectedRowIds.value = Array.isArray(ids) ? ids : [];
};

/* -------------------- ACTIONS -------------------- */
const onResetFilters = () => {
  filters.value = {
    userName: "",
    program: "",
    academicYear: "",
    generation: "",
    year: "",
    department: "",
    group: "",
  };
  page.value = 1;
  selectedRowIds.value = [];
};

const openPromoteModal = () => {
  const selected = rows.value.filter((r) =>
    selectedRowIds.value.includes(r.id),
  );

  if (!selected.length) {
    showNotification("Please select at least one student", "warning");
    return;
  }

  if (new Set(selected.map((s) => s.program?.id)).size > 1) {
    showNotification("All students must be in the same program", "error");
    return;
  }

  if (new Set(selected.map((s) => s.program?.academic_year)).size > 1) {
    showNotification("All students must be in the same academic year", "error");
    return;
  }

  selectedStudentsForPromotion.value = selected;
  showPromoteModal.value = true;
};

const handlePromoteStudents = async ({ newProgramId }) => {
  if (!newProgramId) {
    showNotification("Please select a program", "warning");
    return;
  }

  const userIds = selectedStudentsForPromotion.value
    .map((s) => s.user_detail?.user_id)
    .filter(Boolean);

  await UserProgramCRUD.promoteMultipleStudents({
    user_ids: userIds,
    program_id: newProgramId,
  });

  showNotification("Students promoted successfully", "success");
  selectedRowIds.value = [];
  showPromoteModal.value = false;
  await loadUserPrograms();
};
watch(
  () => filters.value.year,
  (newYear, oldYear) => {
    // only clear when user actually selected a year
    if (String(newYear || "") && newYear !== oldYear) {
      filters.value.program = "";
      filters.value.academicYear = "";
      filters.value.generation = "";
    }
  },
);
</script>

<style scoped>
.khmer-text {
  font-size: 14px;
}
</style>