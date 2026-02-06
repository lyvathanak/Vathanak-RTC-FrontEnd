<template>
  <div
    :class="[
      'min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-6 sm:py-8 space-y-4',
      locale === 'kh' ? 'khmer-text' : '',
    ]">
    <!-- Top bar -->
    <div class="flex flex-col gap-4">
      <!-- Row: Title + Actions -->
      <div
        class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <PageHeader
          :title="t('students_management')"
          subtitle="Track and manage your Student applications" />

        <div class="flex flex-col gap-3 w-full lg:w-auto lg:items-end">
          <!-- Selected indicator -->
          <div to load sections: Unauthorized

            v-if="(selectedIds?.length || 0) > 0"
            class="text-sm text-gray-600 font-medium">
            {{ selectedIds?.length || 0 }} {{ t("student") }}
            <span v-if="(selectedIds?.length || 0) > 1">s</span>
            {{ t("selected") }}
          </div>

          <!-- Buttons -->
          <div
            class="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
            <ExcelForm :filtered-rows="filteredRows" class="w-full sm:w-auto" />
          </div>
        </div>
      </div>

            <!-- Row: Search -->
      <div class="relative mb-3 w-full max-w-lg">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
        />

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, ID, or email..."
          :disabled="loading"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 pr-10
                focus:outline-none focus:ring-2 focus:ring-[#235AA6]
                shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed
                text-sm sm:text-base"
        />

        <button
          v-if="searchQuery && searchQuery.trim().length"
          type="button"
          :disabled="loading"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2
                text-gray-400 hover:text-gray-600 disabled:opacity-50"
          aria-label="Clear search"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Student Table -->
    <div class="overflow-x-auto">
      <StudentTable
        :students="pagedRows"
        :selected-ids="selectedIds"
        :sort-field="sortField"
        :sort-direction="sortDirection"
        :columns="tableColumns"
        :loading="loading"
        :show-selection="true"
        :show-actions="true"
        :show-view-action="true"
        :show-edit-action="false"
        :show-delete-action="false"
        @view="openView"
        @select="handleRowSelect"
        @select-all="handleSelectAll"
        @sort="handleSort" />
    </div>

    <!-- Pagination -->
    <Pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total-items="filteredRows.length"
      :page-size-options="[5, 10, 25, 50, 100]"
      :item-label="t('students')"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange" />

    <ViewStudentModal
      v-if="showViewModal"
      v-model="showViewModal"
      :student="viewStudent" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { Search } from "lucide-vue-next";

import PageHeader from "@/components/features/PageHeader.vue";
import StudentTable from "@/components/teachers/studentinformation/StudentTable.vue";
import Pagination from "@/components/features/Pagination.vue";
import ExcelForm from "@/components/features/ExcelForm.vue";
import ViewStudentModal from "@/components/teachers/studentinformation/ViewStudentModal.vue";

import { getStudentLearnWithTeacher } from "@/stores/Teacher/studerntinformation";
import { useDepartment } from "@/stores/global/useDepartment.js";
import { useProgram } from "@/stores/global/useProgram.js";
import { useSection } from "@/stores/global/useSection.js";

const { t, locale } = useI18n();

// name resolution composables
const { getDepartmentById, getDepartmentByName } = useDepartment();
const { getProgramById, getProgramByName } = useProgram();
const { getSectionById, getSectionByName } = useSection();

// ------------------------
// State
// ------------------------
const rows = ref([]);
const loading = ref(false);

const searchQuery = ref("");
const q = searchQuery.value.trim().toLowerCase();

const filters = ref({
  academic_year: "All",
  department: "All",
  section: "All",
  program: "All",
  origin: "All",
  gender: "All",
  promotion: "All",
});

const currentPage = ref(1);
const pageSize = ref(25);

const selectedIds = ref([]);
const filterComponent = ref(null);

// View modal
const showViewModal = ref(false);
const viewStudent = ref(null);

// Sorting
const sortField = ref("");
const sortDirection = ref("asc");

// ------------------------
// Load
// ------------------------
async function loadStudents() {
  loading.value = true;
  try {
    const result = await getStudentLearnWithTeacher({
      page: 1,
      per_page: 1000,
    });

    if (result?.success && Array.isArray(result.data)) {
      rows.value = result.data;
    } else {
      rows.value = [];
    }
  } catch (e) {
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

// ------------------------
// Helpers
// ------------------------
function normalizeForSort(v) {
  if (v == null) return "";

  // number
  if (typeof v === "number") return v;

  // date-like (yyyy-mm-dd)
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) {
    const time = Date.parse(v);
    return Number.isFinite(time) ? time : v.toLowerCase();
  }

  // default: string compare
  return String(v).toLowerCase();
}

// ------------------------
// Computed
// ------------------------
const rowsWithDisplayNames = computed(() =>
  rows.value.map((student) => {
    const depId =
      student.department_id != null ? Number(student.department_id) : null;
    const secId =
      student.sub_department_id != null
        ? Number(student.sub_department_id)
        : null;
    const progId =
      student.program_id != null ? Number(student.program_id) : null;

    const department = depId != null ? getDepartmentById(depId) : null;
    const section = secId != null ? getSectionById(secId) : null;
    const program = progId != null ? getProgramById(progId) : null;

    return {
      ...student,

      // ✅ keep API name first, fallback to store
      department_name:
        student.department_name ||
        department?.department_name ||
        department?.name ||
        "",

      program_name:
        student.program_name || program?.program_name || program?.name || "",

      section_name:
        student.section_name ||
        section?.sub_department_name ||
        section?.name ||
        "",
    };
  }),
);

const filteredRows = computed(() => {
  let list = rowsWithDisplayNames.value;

  // Search
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((r) => {
      const hay = [
        r.id_card,
        r.khmer_name,
        r.first_name,
        r.last_name,
        r.latin_name,
        r.email,
        r.department_name,
        r.section_name,
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" ");

      return hay.includes(q);
    });
  }

  // Filters
  for (const [key, value] of Object.entries(filters.value)) {
    if (!value || value === "All") continue;

    if (key === "department") {
      const id = getDepartmentByName(value)?.id;
      if (id) list = list.filter((r) => r.department_id === id);
      continue;
    }

    if (key === "section") {
      const id = getSectionByName(value)?.id;
      if (id) list = list.filter((r) => r.sub_department_id === id);
      continue;
    }

    if (key === "program") {
      const id = getProgramByName(value)?.id;
      if (id) list = list.filter((r) => r.program_id === id);
      continue;
    }

    if (key === "origin") {
      list = list.filter(
        (r) =>
          r.origin === value ||
          r.place_of_birth === value ||
          (r.current_address && String(r.current_address).includes(value)) ||
          (r.permanent_address && String(r.permanent_address).includes(value)),
      );
      continue;
    }

    list = list.filter((r) => r[key] === value);
  }

  return list;
});

const sortedRows = computed(() => {
  const list = [...filteredRows.value];
  if (!sortField.value) return list;

  const field = sortField.value;
  const dir = sortDirection.value;

  return list.sort((a, b) => {
    const av = normalizeForSort(a[field]);
    const bv = normalizeForSort(b[field]);

    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
});

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedRows.value.slice(start, start + pageSize.value);
});

// ------------------------
// Watchers
// ------------------------
watch(searchQuery, () => (currentPage.value = 1));
watch(filters, () => (currentPage.value = 1), { deep: true });
watch(pageSize, () => (currentPage.value = 1));

// Keep selection only for current page (same behavior)
watch(pagedRows, () => {
  const pageSet = new Set(pagedRows.value.map((s) => Number(s.id)));
  selectedIds.value = selectedIds.value.filter((id) => pageSet.has(Number(id)));
});

// ------------------------
// Selection
// ------------------------
function handleRowSelect(studentId) {
  if (selectedIds.value.includes(studentId)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== studentId);
  } else {
    selectedIds.value.push(studentId);
  }
}

function handleSelectAll(ids) {
  selectedIds.value = ids;
}

// ------------------------
// Sorting
// ------------------------
function handleSort({ field, direction }) {
  sortField.value = field;
  sortDirection.value = direction;
}

// ------------------------
// Pagination
// ------------------------
function handlePageChange(payload) {
  const next = typeof payload === "number" ? payload : payload?.currentPage;
  if (Number.isFinite(next)) currentPage.value = next;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handlePageSizeChange(payload) {
  const next = typeof payload === "number" ? payload : payload?.pageSize;
  if (Number.isFinite(next)) pageSize.value = next;

  currentPage.value = 1;
}

// ------------------------
// View Modal
// ------------------------
function openView(student) {
  const full =
    rowsWithDisplayNames.value.find(
      (r) => Number(r.id) === Number(student?.id),
    ) || student;

  viewStudent.value = { ...full };
  showViewModal.value = true;
}

// ------------------------
// Table Columns
// ------------------------
const tableColumns = ref([
  { key: "id_card", label: "ID", visible: true, sortable: true },
  { key: "khmer_name", label: "Khmer Fullname", visible: true, sortable: true },
  { key: "latin_name", label: "Latin Fullname", visible: true, sortable: true },
  {
    key: "date_of_birth",
    label: "Date of Birth",
    visible: true,
    sortable: true,
  },
  { key: "gender", label: "Gender", visible: true, sortable: false },
  {
    key: "department_name",
    label: "Department",
    visible: true,
    sortable: true,
  },
  { key: "section_name", label: "Section", visible: true, sortable: true },
  { key: "program_name", label: "Program", visible: true, sortable: true },
]);

// ------------------------
// Mounted
// ------------------------
onMounted(() => {
  loadStudents();

  nextTick(() => {
    if (filterComponent.value?.loadFilterOptions) {
      filterComponent.value.loadFilterOptions();
    }
  });
});

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      useDepartment().fetchDepartments?.(),
      useSection().fetchSections?.(),
      useProgram().fetchPrograms?.(),
    ]);

    await loadStudents();

    await nextTick();
    filterComponent.value?.loadFilterOptions?.();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@media (max-width: 480px) {
  table {
    font-size: 11px;
  }
  .khmer-text {
    font-size: 13px;
  }
}

@media (max-width: 640px) {
  table {
    font-size: 12px;
  }
  .khmer-text {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  table {
    font-size: 13px;
  }
  .khmer-text {
    font-size: 15px;
  }
}

@media (min-width: 475px) {
  .xs\:flex-row {
    flex-direction: row;
  }
}

button {
  min-height: 40px;
}

@media (max-width: 640px) {
  .gap-4 {
    gap: 0.75rem;
  }
  .gap-3 {
    gap: 0.5rem;
  }
  .gap-2 {
    gap: 0.375rem;
  }
}

@media (max-width: 1024px) {
  .lg\:flex-row {
    flex-direction: column;
  }
  .lg\:justify-between {
    justify-content: flex-start;
  }
  .lg\:w-auto {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .sm\:hidden {
    display: inline;
  }
  .hidden.sm\:inline {
    display: none;
  }
}

.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  button {
    min-height: 44px;
    touch-action: manipulation;
  }
  input {
    min-height: 44px;
  }
}

button,
input {
  transition: all 0.2s ease;
}

.loading {
  opacity: 0.7;
  pointer-events: none;
}
</style>