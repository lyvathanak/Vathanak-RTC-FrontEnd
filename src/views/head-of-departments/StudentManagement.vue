<template>
  <div
    class="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-6 sm:py-8 space-y-4">
    <!-- Top bar (Admin-style) -->
    <div class="flex flex-col gap-4">
      <div
        class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <!-- Title -->
        <PageHeader
          :title="t('students_management') || 'Student Management'"
          :subtitle="`Department: ${departmentName || '-'}`" />

        <!-- Actions (HOD version) -->
        <div class="flex flex-col gap-3 w-full lg:w-auto lg:items-end">
          <div
            v-if="showSelection && selectedIds.length > 0"
            class="text-sm text-gray-600 font-medium">
            {{ selectedIds.length }} {{ t("student") || "student" }}
            <span v-if="selectedIds.length > 1">s</span>
            {{ t("selected") || "selected" }}
          </div>

          <!-- Buttons (HOD: Back + Export only, no Add/Group) -->
          <div
            class="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
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
      <StudentTable
        :students="pagedRows"
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
        :item-label="t('students') || 'students'" />
    </div>

    <!-- View Student Modal (optional reuse) -->
    <ViewStudentModal v-model="showViewModal" :student="viewStudent" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Search } from "lucide-vue-next";

import PageHeader from "@/components/features/PageHeader.vue";
import Pagination from "@/components/features/Pagination.vue";
import StudentTable from "@/components/head-of-departments/studentinformation/StudentTable.vue";
import ViewStudentModal from "@/components/head-of-departments/studentinformation/ViewStudentModal.vue";
import ExcelForm from "@/components/features/ExcelForm.vue";

import { getHODProfile } from "@/stores/HeadOfDepartment/HODProfile";
import api from "@/stores/apis/axios";

const router = useRouter();
const { t, locale } = useI18n();
const isKhmer = computed(() => locale.value === "kh");

/** UI feature toggles (HOD) */
const showSelection = ref(true);
const showFilters = ref(false);
const allPrograms = ref([]);
/** Data */
const loading = ref(false);
const rows = ref([]);
const departmentName = ref("");
const departmentId = ref(null);
const allSections = ref([]); // Store sections separately

/** Search + Filters */
const search = ref("");
const selectedIds = ref([]);

/** Table Columns */
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
  { key: "program_name", label: "Program", visible: true, sortable: true },
  { key: "section_name", label: "Section", visible: true, sortable: true },
]);

/** Sorting */
const currentSortField = ref("latin_name");
const currentSortDirection = ref("asc");

const handleSort = ({ field, direction }) => {
  currentSortField.value = field;
  currentSortDirection.value = direction;

  rows.value.sort((a, b) => {
    let aVal = a[field] || "";
    let bVal = b[field] || "";

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

/** Filtering */
const filteredRows = computed(() => {
  let list = rows.value;
  const q = search.value.trim().toLowerCase();

  if (q) {
    list = list.filter((r) => {
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
        String(r.department_name ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.program_name ?? "")
          .toLowerCase()
          .includes(q) || // ✅ add
        String(r.section_name ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }

  return list;
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
const viewStudent = ref(null);

function view(row) {
  viewStudent.value = { ...row };
  showViewModal.value = true;
}

/** Selection handlers */
const handleRowSelect = (payload) => {
  const id =
    typeof payload === "object" ? payload.id || payload.user_id : payload;

  if (!id) return;

  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
};

const handleSelectAll = (payload) => {
  if (Array.isArray(payload)) {
    selectedIds.value = payload
      .map((item) =>
        typeof item === "object" ? item.id || item.user_id : item,
      )
      .filter((id) => id != null);
  }
};

/** Main function to load HOD students */
onMounted(async () => {
  await loadHodStudents();
});

async function loadHodStudents() {
  loading.value = true;

  try {
    // 1. Get HOD profile to get department
    const profileData = await getHODProfile();
    const userDetail = profileData.user?.user_detail || {};

    const headDept =
      userDetail.head_department || profileData.user?.head_department;
    const directDept = userDetail.department || profileData.user?.department;

    departmentId.value =
      headDept?.id || directDept?.id || userDetail.department_id || null;
    departmentName.value =
      headDept?.department_name || directDept?.department_name || "";

    if (!departmentId.value) {
      rows.value = [];
      loading.value = false;
      return;
    }

    // 4. Fetch students for this department
    const res = await api.get(
      `/users_by_hod_department/${departmentId.value}`,
      {
        params: { role: "student" },
      },
    );

    const rawData = res.data.users || res.data.data || [];

    if (!Array.isArray(rawData)) {
      rows.value = [];
      loading.value = false;
      return;
    }

    console.log(`Found ${rawData.length} students`);

    // 5. Process students with section lookup
    rows.value = rawData.map((student) => {
      const detail = student.user_detail || student.userDetail || {};

      // -------------------------
      // SECTION (sub_department)
      // -------------------------
      const sectionObj =
        detail.sub_department ||
        detail.section ||
        student.sub_department ||
        student.section ||
        student.subDepartment ||
        student.user_detail?.sub_department ||
        null;

      const sectionId =
        detail.sub_department_id ||
        student.sub_department_id ||
        detail.section_id ||
        student.section_id ||
        sectionObj?.id ||
        null;

      let sectionName =
        sectionObj?.sub_department_name ||
        sectionObj?.name ||
        detail.sub_department_name ||
        student.sub_department_name ||
        detail.section_name ||
        student.section_name ||
        "N/A";

      // lookup section by id from loaded sections list
      if (sectionId && (sectionName === "N/A" || !sectionName)) {
        const found = (allSections.value || []).find(
          (s) => String(s?.id) === String(sectionId),
        );
        if (found)
          sectionName = found.sub_department_name || found.name || "N/A";
      }

      // fallback: group
      if (sectionName === "N/A") {
        const groups = student.groups || detail.groups || [];
        const g = groups?.[0];
        if (g) sectionName = g.sub_department_name || g.name || "N/A";
      }

      // -------------------------
      // PROGRAM
      // -------------------------
      const programObj =
        detail.program ||
        student.program ||
        student.user_program?.program ||
        student.userProgram?.program ||
        student.user_programs?.[0]?.program ||
        student.userPrograms?.[0]?.program ||
        null;

      const programId =
        detail.program_id ||
        student.program_id ||
        programObj?.id ||
        student.user_program?.program_id ||
        student.userProgram?.program_id ||
        student.user_programs?.[0]?.program_id ||
        student.userPrograms?.[0]?.program_id ||
        null;

      let programName =
        programObj?.program_name ||
        programObj?.name ||
        detail.program_name ||
        student.program_name ||
        "N/A";

      // lookup program by id from loaded programs list
      if (programId && (programName === "N/A" || !programName)) {
        const found = (allPrograms.value || []).find(
          (p) => String(p?.id) === String(programId),
        );
        if (found) programName = found.program_name || found.name || "N/A";
      }

      // -------------------------
      // DEPARTMENT
      // -------------------------
      const depObj =
        detail.department ||
        student.department ||
        programObj?.department ||
        null;

      const departmentIdResolved =
        detail.department_id ||
        student.department_id ||
        depObj?.id ||
        departmentId.value ||
        null;

      const departmentNameResolved =
        depObj?.department_name ||
        depObj?.name ||
        detail.department_name ||
        student.department_name ||
        departmentName.value ||
        "N/A";

      return {
        ...student,

        id: student.id || student.user_id || null,
        user_id: student.user_id || student.id,

        // Department
        department_id: departmentIdResolved,
        department_name: departmentNameResolved,

        // Program ✅
        program_id: programId,
        program_name: programName,

        // Section ✅
        section_id: sectionId,
        section_name: sectionName,
        sub_department_id: sectionId,
        sub_department_name: sectionName,

        // Personal info
        id_card:
          student.id_card || detail.id_card || student.student_id || "N/A",
        khmer_name: student.khmer_name || detail.khmer_name || "-",
        latin_name:
          student.latin_name || student.name || detail.latin_name || "-",
        date_of_birth: student.date_of_birth || detail.date_of_birth || "-",
        gender: student.gender || detail.gender || "N/A",
        phone_number: student.phone_number || detail.phone_number || "N/A",
        email: student.email || detail.email || "N/A",
      };
    });

    console.log("Processed students:", rows.value);

    // Log section summary
    const sectionSummary = {};
    rows.value.forEach((student) => {
      const section = student.section_name;
      sectionSummary[section] = (sectionSummary[section] || 0) + 1;
    });
    console.log("Section summary:", sectionSummary);
  } catch (err) {
    console.error("Error fetching HOD students:", err);
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
