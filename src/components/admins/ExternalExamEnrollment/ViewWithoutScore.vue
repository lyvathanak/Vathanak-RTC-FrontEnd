<template>
  <div class="space-y-4">
    <ListTable
      :data="students"
      :loading="loading"
      :show-selection="props.showSelection"
      :selected-ids="selectedIds"
      :columns="columns"
      :sort-field="sortField"
      :sort-direction="sortDirection"
      :show-actions="showActions"
      :show-view-action="showViewAction"
      :show-edit-action="showEditAction"
      :show-delete-action="showDeleteAction"
      :view-action-title="viewActionTitle"
      :edit-action-title="editActionTitle"
      :delete-action-title="deleteActionTitle"
      :empty-state-title="emptyStateTitle"
      :empty-state-message="emptyStateMessage"
      :loading-message="loadingMessage"
      row-key="id"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
      @select="handleSelect"
      @selectAll="handleSelectAll"
      @sort="handleSort"
    >
      <!-- ID Column Slot - Display as sequential index -->
      <template #column-id="{ index }">
        <span class="font-medium text-gray-700">{{ index + 1 }}</span>
      </template>

      <!-- Khmer name Column Slot -->
      <template #column-name_khmer="{ value }">
        <span class="font-medium text-gray-700 khmer-text">{{ value }}</span>
      </template>

      <!-- Latin name Column Slot -->
      <template #column-name_latin="{ value }">
        <span class="font-medium text-gray-700">{{ value }}</span>
      </template>

      <!-- Gender Column Slot -->
      <template #column-gender="{ value }">
        <span
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          :class="getGenderBadgeClass(value)"
        >
          {{ getGenderLabel(value) }}
        </span>
      </template>

      <!-- Department Column Slot -->
      <template #column-department_id="{ value }">
        <span
          class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
        >
          {{ getDepartmentName(value) }}
        </span>
      </template>

      <!-- Program Column Slot -->
      <template #column-program_id="{ value }">
        <span
          class="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium"
        >
          {{ getSectionName(value) }}
        </span>
      </template>

      <!-- Phone Column Slot -->
      <template #column-phone_number="{ value }">
        <span class="font-mono">{{ value || 'N/A' }}</span>
      </template>

      <!-- Origin Column Slot -->
      <template #column-origin="{ value }">
        <span class="font-mono">{{ value || 'N/A' }}</span>
      </template>
      

    </ListTable>

    <!-- Pagination -->
    <Pagination
      v-if="totalItems > 0"
      :current-page="currentPage"
      :total-items="totalItems"
      :page-size="pageSize"
      :page-size-options="[10, 25, 50, 100]"
      item-label="students"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />

    <!-- View Temp Student Modal -->
    <ViewTempStudentModal
      :showView="showViewModal"
      :studentId="selectedStudentId"
      @close="showViewModal = false"
    />

    <!-- Edit Temp Student Modal -->
    <EditTempStudentModal
      :showEdit="showEditModal"
      :student="selectedStudent"
      @close="showEditModal = false"
      @update="handleUpdateStudent"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ListTable from '@/components/features/ListTable.vue';
import Pagination from '@/components/features/Pagination.vue';
import EditTempStudentModal from '@/components/admins/ExternalExamEnrollment/EditTempStudentModal.vue';
import ViewTempStudentModal from '@/components/admins/ExternalExamEnrollment/ViewTempStudentModal.vue';
import { useDepartment } from '@/stores/global/useDepartment';
import { useSection } from '@/stores/global/useSection';
import { useTempStudentStore } from '@/stores/Admin/external_exam/CRUD_temp_student';
import { showNotification } from '@/lib/notifications.js';

// Props
const props = defineProps({
  showSelection: {
    type: Boolean,
    default: true
  }
});

// Store
const tempStudentStore = useTempStudentStore();

const selectedIds = ref([]);
const sortField = ref('');
const sortDirection = ref('asc');

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);

// Modal state
const showViewModal = ref(false);
const showEditModal = ref(false);
const selectedStudent = ref(null);
const selectedStudentId = ref(null);

// Action flags
const showActions = ref(true);
const showViewAction = ref(true);
const showEditAction = ref(true);
const showDeleteAction = ref(true);

// Action titles
const viewActionTitle = ref('View student details');
const editActionTitle = ref('Edit student');
const deleteActionTitle = ref('Delete student');

// Empty state
const emptyStateTitle = ref('No students without score found');
const emptyStateMessage = ref('All students have been scored or there are no students enrolled.');
const loadingMessage = ref('Loading students...');

// Column configuration
const columns = ref([
  { key: 'id', label: 'No.', visible: true, sortable: false },
  { key: 'khmer_name', label: 'Khmer Name', visible: true, sortable: true },
  { key: 'latin_name', label: 'Latin Name', visible: true, sortable: true },
  { key: 'gender', label: 'Gender', visible: true, sortable: true },
  { key: 'phone_number', label: 'Phone', visible: true, sortable: false },
  { key: 'origin', label: 'Origin', visible: true, sortable: false },
  { key: 'department_id', label: 'Department', visible: true, sortable: true },
  { key: 'program_id', label: 'Program', visible: true, sortable: true },
]);

// Use composables
const { departments, getAllDepartments, getDepartmentById } = useDepartment();
const { sections, getAllSections, getSectionById } = useSection();

// Computed properties for data from store
const allStudents = computed(() => tempStudentStore.allTempStudents);
const loading = computed(() => tempStudentStore.loading);

// Pagination computed properties
const totalItems = computed(() => allStudents.value.length);

const students = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return allStudents.value.slice(start, end);
});

// Fetch data on mount
onMounted(async () => {
  try {
    await Promise.all([
      getAllDepartments(),
      getAllSections(),
      tempStudentStore.fetchTempStudents()
    ]);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});

// Expose refresh method for parent component
const refresh = async () => {
  try {
    await tempStudentStore.refresh();
  } catch (error) {
    console.error('Failed to refresh temp students:', error);
  }
};

defineExpose({ refresh });

// Helper methods
const getDepartmentName = (id) => {
  const dept = getDepartmentById(id);
  return dept ? dept.department_name : 'N/A';
};

const getSectionName = (id) => {
  const section = getSectionById(id);
  return section ? section.name : 'N/A';
};

const getGenderLabel = (gender) => {
  const labels = {
    Male: 'Male',
    Female: 'Female',
    male: 'Male',
    female: 'Female',
  };
  return labels[gender] || gender || 'N/A';
};

const getGenderBadgeClass = (gender) => {
  const classes = {
    Male: 'bg-blue-100 text-blue-800',
    Female: 'bg-pink-100 text-pink-800',
    male: 'bg-blue-100 text-blue-800',
    female: 'bg-pink-100 text-pink-800',
  };
  return classes[gender] || 'bg-gray-100 text-gray-800';
};

// Event handlers
const handleView = (student) => {
  console.log('View student:', student);
  selectedStudentId.value = student.id;
  showViewModal.value = true;
};

const handleEdit = (student) => {
  console.log('Edit student:', student);
  selectedStudent.value = student;
  showEditModal.value = true;
};

const handleDelete = async (student) => {
  console.log('Delete student:', student);
  
  try {
    // Call delete API (it will auto-remove from local list)
    await tempStudentStore.deleteTempStudent(student.id);
    
    // Refresh the list
    await refresh();
    
    // Show success notification
    showNotification(tempStudentStore.successMessage || 'Student deleted successfully!', 'success');
    console.log('✅ Student deleted and list refreshed');
  } catch (error) {
    // Show error notification
    showNotification(tempStudentStore.error || 'Failed to delete student. Please try again.', 'error');
    console.error('❌ Failed to delete student:', error);
  }
};

const handleSelect = (id) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
};

const handleSelectAll = (ids) => {
  selectedIds.value = ids;
};

const handleSort = ({ field, direction }) => {
  sortField.value = field;
  sortDirection.value = direction;
  
  console.log('Sort requested:', { field, direction });
  // TODO: Implement sorting logic or call API with sort parameters
};

// Handle student update from modal
const handleUpdateStudent = async (updatedStudent) => {
  console.log('Student updated:', updatedStudent);
  
  // Update the student in the store (already done by editTempStudent action)
  // Just refresh the list to ensure consistency
  await refresh();
  
  // Show success message
  console.log('✅ Student list refreshed');
};

// Pagination handlers
const handlePageChange = ({ page }) => {
  currentPage.value = page;
};

const handlePageSizeChange = ({ pageSize: newSize, currentPage: newPage }) => {
  pageSize.value = newSize;
  currentPage.value = newPage;
};
</script>