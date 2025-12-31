<template>
  <div
    :class="['flex flex-col gap-4 py-5', locale === 'kh' ? 'khmer-text' : '']">
    <!-- Top bar -->
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 sm:px-5 gap-4">
      <!-- Search -->
      <div class="relative w-full max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('search')"
          class="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search />
        </span>
      </div>

      <!-- Button Section -->
      <div
        class="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
        <!-- Selected count indicator -->
        <div
          v-if="selectedIds.length > 0"
          class="text-sm text-gray-600 font-medium order-first">
          {{ selectedIds.length }} {{ t("student")
          }}<span v-if="selectedIds.length > 1">s</span> {{ t("selected") }}
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <!-- Primary Actions -->
          <div class="flex flex-col xs:flex-row gap-2 sm:gap-3">
            <!-- Add student -->
            <button
              @click="openAdd"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#235AA6] text-white px-3 sm:px-4 py-2.5 text-sm sm:text-base transition whitespace-nowrap">
              <Plus class="w-4 h-4 sm:w-5 sm:h-5" />
              <span class="hidden sm:inline">{{ t("add_student") }}</span>
              <span class="sm:hidden">Add Student</span>
            </button>

            <!-- Export -->
            <ExcelForm :filtered-rows="filteredRows" class="w-full sm:w-auto" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="filterComponent">
      <StudentFilterRole
        ref="filterComponent"
        @update:filters="handleFiltersUpdate"
        @clear-filters="handleClearFilters" />
    </div>

    <!-- Student Table -->
    <div class="overflow-x-auto px-3 sm:px-5">
      <StudentTable
        :students="pagedRows"
        :selected-ids="selectedIds"
        :sort-field="currentSortField"
        :sort-direction="currentSortDirection"
        :columns="tableColumns"
        :loading="loading"
        :show-selection="true"
        @view="openView"
        @edit="openEdit"
        @delete="remove"
        @select="handleRowSelect"
        @select-all="handleSelectAll"
        @sort="handleSort" />
    </div>

    <!-- Pagination -->
    <div class="px-3 sm:px-5">
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-items="filteredRows.length"
        :page-size-options="[5, 10, 25, 50, 100]"
        :item-label="t('students')"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange" />
    </div>

    <!-- Add Student Modal -->
    <AddStudentModal
      v-if="showAddModal"
      :show-add="showAddModal"
      :rows="rows"
      @close="closeAddModal"
      @save="handleAddSave" />

    <!-- Edit Student Modal -->
    <EditStudentModal
      v-if="showEditModal"
      v-model="showEditModal"
      :student="selectedStudent"
      :academic-years="academicYears"
      :promotion-options="promotionOptions"
      :degree-options="degreeOptions"
      :departments="departments"
      :branches="branches"
      @save="handleEditSave"
      @promote="handlePromoteStudent" />

    <!-- View Student Modal -->
    <ViewStudentModal
      v-if="showViewModal"
      v-model="showViewModal"
      :student="viewStudent" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { Plus, Search } from "lucide-vue-next";
import AddStudentModal from "@/components/admins/StudentManagement/AddStudentModal.vue";
import EditStudentModal from "@/components/admins/StudentManagement/EditStudentModal.vue";
import ViewStudentModal from "@/components/admins/StudentManagement/ViewStudentModal.vue";
import StudentFilterRole from "@/components/admins/StudentManagement/StudentFilterRole.vue";
import StudentTable from "@/components/admins/StudentManagement/StudentTable.vue";
import Pagination from "@/components/features/Pagination.vue";
import ExcelForm from "@/components/features/ExcelForm.vue";
import { getStudentsByTeacherDepartment } from "@/stores/Teacher/studerntinformation";
import { showNotification } from "@/lib/notifications.js";
import { useDepartment } from "@/stores/global/useDepartment.js";
import { useProgram } from "@/stores/global/useProgram.js";
import { useSection } from "@/stores/global/useSection.js";

const { t, locale } = useI18n();

// Composables for dynamic name resolution
const { getDepartmentById, getDepartmentByName } = useDepartment();
const { getProgramById, getProgramByName } = useProgram();
const { getSectionById, getSectionByName } = useSection();

// ------------------------
// State
// ------------------------
const rows = ref([]);
const loading = ref(false);
const searchQuery = ref("");
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

// Modal states
const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedStudent = ref(null);
const showViewModal = ref(false);
const viewStudent = ref(null);

// Sorting
const currentSortField = ref("");
const currentSortDirection = ref("asc");

// Static options for modals
const academicYears = ref(["2022-2023", "2023-2024", "2024-2025"]);
const promotionOptions = ref(["Promoted", "Repeat"]);
const degreeOptions = ref(["Bachelor", "Associate", "Master"]);
const departments = ref(["ITC", "Business", "Arts"]);
const branches = ref(["Battambang", "Phnom Penh"]);

// ------------------------
// Computed Properties
// ------------------------
const selectedStudents = computed(() =>
  rows.value.filter((s) => selectedIds.value.includes(s.id))
);

// Map IDs to names for display
const rowsWithDisplayNames = computed(() => {
  return rows.value.map((student) => {
    const department = getDepartmentById(student.department_id);
    const section = getSectionById(student.sub_department_id);
    const program = getProgramById(student.program_id);

    return {
      ...student,
      department_name:
        department?.department_name || student.department_id || "N/A",
      section_name:
        section?.sub_department_name || student.sub_department_id || "N/A",
      program_name: program?.program_name || student.program_id || "N/A",
      full_name: `${student.first_name || ""} ${
        student.last_name || ""
      }`.trim(),
    };
  });
});

const filteredRows = computed(() => {
  let list = rowsWithDisplayNames.value;

  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        r.id_card?.toString().toLowerCase().includes(q) ||
        r.khmer_name?.toLowerCase().includes(q) ||
        r.first_name?.toLowerCase().includes(q) ||
        r.last_name?.toLowerCase().includes(q) ||
        r.latin_name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.department_name?.toLowerCase().includes(q) ||
        r.section_name?.toLowerCase().includes(q)
    );
  }

  // Apply filters
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value !== "All" && value) {
      if (key === "department") {
        const departmentId = getDepartmentByName(value)?.id;
        if (departmentId) {
          list = list.filter((r) => r.department_id === departmentId);
        }
      } else if (key === "section") {
        const sectionId = getSectionByName(value)?.id;
        if (sectionId) {
          list = list.filter((r) => r.sub_department_id === sectionId);
        }
      } else if (key === "program") {
        const programId = getProgramByName(value)?.id;
        if (programId) {
          list = list.filter((r) => r.program_id === programId);
        }
      } else if (key === "origin") {
        list = list.filter(
          (r) =>
            r.origin === value ||
            r.place_of_birth === value ||
            (r.current_address && r.current_address.includes(value)) ||
            (r.permanent_address && r.permanent_address.includes(value))
        );
      } else {
        list = list.filter((r) => r[key] === value);
      }
    }
  });

  return list;
});

const sortedRows = computed(() => {
  const list = [...filteredRows.value];

  if (!currentSortField.value) return list;

  return list.sort((a, b) => {
    let aVal = a[currentSortField.value];
    let bVal = b[currentSortField.value];

    // Handle null/undefined values
    if (aVal == null) aVal = "";
    if (bVal == null) bVal = "";

    // Convert to string for case-insensitive comparison
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (currentSortDirection.value === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
});

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedRows.value.slice(start, start + pageSize.value);
});

// ------------------------
// Watchers
// ------------------------
watch([searchQuery, filters], () => {
  currentPage.value = 1;
});

watch(pageSize, () => {
  currentPage.value = 1;
});

// ------------------------
// Methods
// ------------------------
const loadStudents = async () => {
  loading.value = true;
  try {
    const result = await getStudentsByTeacherDepartment({
      page: 1,
      per_page: 1000,
    });
    if (result.success) {
      rows.value = result.data || [];
      console.log("Loaded students:", rows.value);
    } else {
      showNotification(result.message || "Failed to load students", "error");
    }
  } catch (err) {
    showNotification("Error loading students", "error");
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Selection handlers
const handleRowSelect = (id) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
};

const handleSelectAll = (isSelected) => {
  if (isSelected) {
    selectedIds.value = pagedRows.value.map((student) => student.id);
  } else {
    selectedIds.value = [];
  }
};

// Sorting
const handleSort = ({ field, direction }) => {
  currentSortField.value = field;
  currentSortDirection.value = direction;
};

// Filter handlers
const handleFiltersUpdate = (newFilters) => {
  filters.value = { ...newFilters };
};

const handleClearFilters = () => {
  filters.value = {
    academic_year: "All",
    department: "All",
    section: "All",
    program: "All",
    origin: "All",
    gender: "All",
    promotion: "All",
  };

  if (filterComponent.value) {
    filterComponent.value.resetFilters();
  }
};

// Modal handlers
const openAdd = () => {
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const openEdit = (student) => {
  selectedStudent.value = { ...student };
  showEditModal.value = true;
};

const openView = (student) => {
  viewStudent.value = { ...student };
  showViewModal.value = true;
};

const closeEditModal = () => {
  selectedStudent.value = null;
  showEditModal.value = false;
};

const closeViewModal = () => {
  viewStudent.value = null;
  showViewModal.value = false;
};

const handleAddSave = async () => {
  await loadStudents();
  closeAddModal();
  showNotification("Student added successfully!", "success");
};

const handleEditSave = async (updatedStudent) => {
  try {
    // TODO: Implement actual update API call
    // For now, simulate update by reloading data
    await loadStudents();
    closeEditModal();
    showNotification("Student updated successfully!", "success");
  } catch (err) {
    showNotification("Error updating student", "error");
    console.error(err);
  }
};

const remove = async (student) => {
  if (
    !confirm(
      `Are you sure you want to delete ${student.first_name} ${student.last_name}?`
    )
  ) {
    return;
  }

  try {
    // TODO: Implement actual delete API call
    // For now, simulate deletion by reloading data
    await loadStudents();
    showNotification("Student deleted successfully!", "success");
  } catch (err) {
    showNotification("Error deleting student", "error");
    console.error(err);
  }
};

// Pagination handlers
const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  // Scroll to top when page changes
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handlePageSizeChange = (newSize) => {
  pageSize.value = newSize;
};

// Promote student handler
const handlePromoteStudent = async (student) => {
  try {
    // TODO: Implement promote student API call
    showNotification(
      `${student.first_name} ${student.last_name} promoted successfully!`,
      "success"
    );
  } catch (err) {
    showNotification("Error promoting student", "error");
    console.error(err);
  }
};

// Table configuration
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
  }, // Use this
  { key: "section_name", label: "Section", visible: true, sortable: true },
]);

// Load students initially
onMounted(() => {
  loadStudents();
  nextTick(() => {
    // Ensure filter component is properly initialized
    if (filterComponent.value) {
      filterComponent.value.loadFilterOptions();
    }
  });
});
</script>

<style scoped>
/* Enhanced responsive styles */
@media (max-width: 480px) {
  /* Extra small screens - phones */
  table {
    font-size: 11px;
  }

  .khmer-text {
    font-size: 13px;
  }
}

@media (max-width: 640px) {
  /* Small screens - larger phones */
  table {
    font-size: 12px;
  }

  .khmer-text {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  /* Medium screens - tablets */
  table {
    font-size: 13px;
  }

  .khmer-text {
    font-size: 15px;
  }
}

/* Custom breakpoint for xs screens */
@media (min-width: 475px) {
  .xs\:flex-row {
    flex-direction: row;
  }
}

/* Ensure buttons don't get too small on mobile */
button {
  min-height: 40px;
}

/* Better spacing for mobile */
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

/* Responsive container adjustments */
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

/* Better button text visibility on small screens */
@media (max-width: 640px) {
  .sm\:hidden {
    display: inline;
  }

  .hidden.sm\:inline {
    display: none;
  }
}

/* Table responsiveness */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}

/* Better touch targets for mobile */
@media (max-width: 768px) {
  button {
    min-height: 44px;
    touch-action: manipulation;
  }

  input {
    min-height: 44px;
  }
}

/* Ensure smooth transitions */
button,
input {
  transition: all 0.2s ease;
}

/* Loading state */
.loading {
  opacity: 0.7;
  pointer-events: none;
}
</style>
