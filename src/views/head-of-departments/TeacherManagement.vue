<template>
  <div
    class="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-6 sm:py-8 space-y-4">
    <!-- Top bar (Admin-style) -->
    <div class="flex flex-col gap-4">
      <div
        class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <!-- Title -->
        <PageHeader
          :title="t('teachers_management') || 'Teacher Management'"
          :subtitle="`Department: ${departmentName || '-'}`" />

        <!-- Actions (HOD version) -->
        <div class="flex flex-col gap-3 w-full lg:w-auto lg:items-end">
          <!-- Selected indicator (optional) -->
          <div
            v-if="showSelection && selectedIds.length > 0"
            class="text-sm text-gray-600 font-medium">
            {{ selectedIds.length }} {{ t("teacher") || "teacher" }}
            <span v-if="selectedIds.length > 1">s</span>
            {{ t("selected") || "selected" }}
          </div>

          <!-- Buttons -->
          <div
            class="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
            <!-- Export (optional if you already use ExcelForm) -->
            <ExcelForm :filtered-rows="filteredRows" class="w-full sm:w-auto" />
          </div>
        </div>
      </div>

      <!-- Row: Search (Admin-style) -->

      <div class="relative mb-3 w-full max-w-lg">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />

        <input
          v-model="search"
          type="text"
          placeholder="Search by name, ID, or email..."
          :disabled="loading"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#235AA6] shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base" />

        <button
          v-if="search && search.trim().length"
          type="button"
          :disabled="loading"
          @click="search = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          aria-label="Clear search">
          ✕
        </button>
      </div>
    </div>

    <!-- Table (Admin-style wrapper) -->
    <div class="overflow-x-auto">
      <TeacherTable
        :teachers="pagedRows"
        :selected-ids="selectedIds"
        :sort-field="currentSortField"
        :sort-direction="currentSortDirection"
        :columns="tableColumns"
        :loading="loading"
        :show-selection="showSelection"
        :show-actions="true"
        :show-view-action="true"
        :show-edit-action="false"
        :show-delete-action="false"
        @view="view"
        @select="handleRowSelect"
        @selectAll="handleSelectAll"
        @sort="handleSort" />
    </div>

    <!-- Pagination (Admin-style) -->
    <div>
      <Pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total-items="filteredRows.length"
        :page-size-options="[5, 10, 25, 50, 100]"
        :item-label="t('teachers') || 'teachers'" />
    </div>

    <!-- View Teacher Modal (optional - if you have it) -->
    <ViewTeacherModal v-model="showViewModal" :teacher="viewTeacher" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { Search } from "lucide-vue-next";

import PageHeader from "@/components/features/PageHeader.vue";
import Pagination from "@/components/features/Pagination.vue";
import ExcelForm from "@/components/features/ExcelForm.vue";

import TeacherTable from "@/components/admins/TeacherManagement/TeacherTable.vue";
import ViewTeacherModal from "@/components/admins/TeacherManagement/ViewTeacherModal.vue";

import { getHODProfile } from "@/stores/HeadOfDepartment/HODProfile";
import api from "@/stores/apis/axios";

const { t } = useI18n();

/** UI toggles */
const showSelection = ref(true);

/** State */
const loading = ref(false);
const rows = ref([]);
const departmentId = ref(null);
const departmentName = ref("");

/** Search */
const search = ref("");

/** Selection */
const selectedIds = ref([]);

function getRowId(payload) {
  if (!payload) return null;
  return typeof payload === "object"
    ? (payload.id ?? payload.user_id ?? null)
    : payload;
}

function handleRowSelect(payload) {
  const id = getRowId(payload);
  if (!id) return;

  const set = new Set(selectedIds.value);
  set.has(id) ? set.delete(id) : set.add(id);
  selectedIds.value = [...set];
}

function handleSelectAll(idsOrRows) {
  if (!Array.isArray(idsOrRows)) {
    selectedIds.value = [];
    return;
  }
  selectedIds.value = idsOrRows.map(getRowId).filter(Boolean);
}

const tableColumns = ref([
  {
    key: "id_card",
    label: "ID",
    visible: true,
    sortable: true,
    width: "w-20 sm:w-24",
  },
  {
    key: "khmer_name",
    label: "Khmer Name",
    visible: true,
    sortable: true,
    width: "min-w-32 sm:min-w-40",
  },
  {
    key: "latin_name",
    label: "Latin Name",
    visible: true,
    sortable: true,
    width: "min-w-32 sm:min-w-40",
  },
  {
    key: "gender",
    label: "Gender",
    visible: true,
    sortable: false,
    width: "min-w-24 sm:min-w-28",
  },
  {
    key: "email",
    label: "Email",
    visible: true,
    sortable: true,
    width: "min-w-40 sm:min-w-48",
    hideOnMobile: true,
  },
  {
    key: "phone_number",
    label: "Phone",
    visible: true,
    sortable: false,
    width: "min-w-28 sm:min-w-32",
    hideOnMobile: true,
  },

  {
    key: "department",
    label: "Department",
    visible: true,
    sortable: true,
    width: "min-w-40 sm:min-w-56",
  },

  // {
  //   key: "program",
  //   label: "Program",
  //   visible: true,
  //   sortable: true,
  //   width: "min-w-40 sm:min-w-56",
  //   hideOnMobile: true, // optional
  // },

  // {
  //   key: "section",
  //   label: "Section",
  //   visible: true,
  //   sortable: true,
  //   width: "min-w-32 sm:min-w-40",
  //   hideOnMobile: true, // optional
  // },
]);

/** Sorting */
const currentSortField = ref("latin_name");
const currentSortDirection = ref("asc");

function normSortVal(v) {
  if (v == null) return "";
  if (typeof v === "number") return v;
  return String(v).toLowerCase();
}

function handleSort({ field, direction }) {
  currentSortField.value = field;
  currentSortDirection.value = direction;

  if (!field || !direction) return;

  const dir = direction === "asc" ? 1 : -1;
  rows.value = [...rows.value].sort((a, b) => {
    const av = normSortVal(a?.[field]);
    const bv = normSortVal(b?.[field]);
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

/** Filter */
const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return rows.value;

  return rows.value.filter((r) => {
    return (
      String(r.id_card ?? "")
        .toLowerCase()
        .includes(q) ||
      String(r.khmer_name ?? "")
        .toLowerCase()
        .includes(q) ||
      String(r.latin_name ?? "")
        .toLowerCase()
        .includes(q) ||
      String(r.position ?? "")
        .toLowerCase()
        .includes(q)
    );
  });
});

/** Pagination */
const page = ref(1);
const pageSize = ref(25);

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

watch([filteredRows, pageSize], () => {
  page.value = 1;
});

/** View modal */
const showViewModal = ref(false);
const viewTeacher = ref(null);

function view(row) {
  viewTeacher.value = row;
  showViewModal.value = true;
}

/** Data normalization */
function normalizeTeacher(u, deptLabel) {
  const detail = u?.user_detail || {};
  const active = u?.is_active ?? detail?.is_active ?? true;

  // ✅ Try common shapes (edit to match your backend)
  const programName =
    detail?.program?.program_name ||
    detail?.program?.name ||
    u?.program?.program_name ||
    u?.program?.name ||
    "-";

  const sectionName =
    detail?.section?.section_name ||
    detail?.section?.name ||
    u?.section?.section_name ||
    u?.section?.name ||
    "-";

  return {
    ...u,
    id: u?.id,
    user_id: u?.user_id ?? u?.id,

    id_card: u?.id_card || detail?.id_card || "N/A",
    khmer_name: u?.khmer_name || detail?.khmer_name || "-",
    latin_name: u?.latin_name || u?.name || detail?.latin_name || "-",
    position: u?.position || detail?.position || "Lecturer",

    profile_picture: u?.profile_picture || detail?.profile_picture,
    is_active: !!active,
    status: active ? "Active" : "Inactive",

    gender: u?.gender || detail?.gender || "N/A",

    phone_number:
      u?.phone_number ||
      detail?.phone_number ||
      detail?.phone ||
      u?.phone ||
      "N/A",

    email: u?.email || detail?.email || "N/A",

    department: detail?.department?.department_name || deptLabel || "N/A",

    // ✅ NEW
    program: programName,
    section: sectionName,
  };
}

/** Fetch */
onMounted(loadHodTeachers);

async function loadHodTeachers() {
  loading.value = true;
  selectedIds.value = []; // keep selection clean when reloading
  try {
    const profileData = await getHODProfile();
    const userDetail = profileData?.user?.user_detail || {};

    const headDept =
      userDetail?.head_department || profileData?.user?.head_department;
    const directDept = userDetail?.department || profileData?.user?.department;

    departmentId.value =
      headDept?.id || directDept?.id || userDetail?.department_id || null;
    departmentName.value =
      headDept?.department_name || directDept?.department_name || "";

    if (!departmentId.value) {
      rows.value = [];
      return;
    }

    const res = await api.get(
      `/users_by_hod_department/${departmentId.value}`,
      {
        params: { role: "staff" },
      },
    );

    const raw = res?.data?.users || res?.data?.data || [];
    rows.value = Array.isArray(raw)
      ? raw.map((u) => normalizeTeacher(u, departmentName.value))
      : [];
  } catch (err) {
    console.error("Error fetching HOD teachers:", err);
    rows.value = [];
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.font-khmer {
  font-family: "Battambang", "Noto Sans Khmer", sans-serif;
}
</style>
