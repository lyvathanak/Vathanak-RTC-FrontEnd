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
      :show-view-action="false"
      :show-edit-action="false"
      :show-delete-action="false"
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
      <!-- Rank Column Slot -->
      <template #column-rank="{ value }">
        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold text-sm">
          {{ value || '-' }}
        </span>
      </template>

      <!-- Temp ID Column Slot -->
      <template #column-temp_student.id="{ value }">
        <span class="font-medium text-gray-700">{{ value }}</span>
      </template>

      <!-- Khmer name Column Slot -->
      <template #column-temp_student.khmer_name="{ value }">
        <span class="font-medium text-gray-700 khmer-text">{{ value }}</span>
      </template>

      <!-- Latin name Column Slot -->
      <template #column-temp_student.latin_name="{ value }">
        <span class="font-medium text-gray-700">{{ value }}</span>
      </template>

      <!-- Gender Column Slot -->
      <template #column-temp_student.gender="{ value }">
        <span
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          :class="getGenderBadgeClass(value)"
        >
          {{ getGenderLabel(value) }}
        </span>
      </template>

      <!-- Department Column Slot -->
      <template #column-temp_student.department_id="{ value }">
        <span
          class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
        >
          {{ getDepartmentName(value) }}
        </span>
      </template>

      <!-- Program Column Slot -->
      <template #column-temp_student.program_id="{ value }">
        <span
          class="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium"
        >
          {{ getSectionName(value) }}
        </span>
      </template>

      <!-- Phone Column Slot -->
      <template #column-temp_student.phone_number="{ value }">
        <span class="font-mono">{{ value || 'N/A' }}</span>
      </template>

      <!-- Origin Column Slot -->
      <template #column-temp_student.origin="{ value }">
        <span class="font-mono">{{ value || 'N/A' }}</span>
      </template>

      <!-- Score Column Slot -->
      <template #column-score="{ value }">
        <span
          class="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold"
          :class="getScoreBadgeClass(value)"
        >
          {{ value !== null && value !== undefined ? value : 'N/A' }}
        </span>
      </template>

      <!-- Status Column Slot -->
      <template #column-enrollment_decision="{ value }">
        <span
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
          :class="getStatusBadgeClass(value)"
        >
          {{ value || 'N/A' }}
        </span>
      </template>

      <!-- Actions Column Slot - Custom Enroll Button -->
      <template #actions="{ row }">
        <EnrollBtn
          :student="row"
          :enrollment-status="row.enrollment_decision"
          @enrolled="updateStudentStatus"
        />
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ListTable from '@/components/features/ListTable.vue';
import Pagination from '@/components/features/Pagination.vue';
import EnrollBtn from '@/components/features/Enroll_btn.vue';
import { useDepartment } from '@/stores/global/useDepartment';
import { useSection } from '@/stores/global/useSection';
import { useTempStudentListStore } from '@/stores/Admin/external_exam/get_temp_student_list';
import avatar from '@/assets/default-avatar.png';

// Props
const props = defineProps({
  academicYear: {
    type: Number,
    required: true
  },
  showSelection: {
    type: Boolean,
    default: true
  }
});

// Store
const tempStudentListStore = useTempStudentListStore();

const selectedIds = ref([]);
const sortField = ref('');
const sortDirection = ref('asc');

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);

// Computed properties from store
const allStudents = computed(() => tempStudentListStore.studentsByRank);
const loading = computed(() => tempStudentListStore.loading);

// Pagination computed properties
const totalItems = computed(() => allStudents.value.length);

const students = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return allStudents.value.slice(start, end);
});

// Action flags
const showActions = ref(true);
const showViewAction = ref(false);
const showEditAction = ref(false);
const showDeleteAction = ref(false);
const showCustomAction = ref(true);

// Action titles
const viewActionTitle = ref('View student score details');
const editActionTitle = ref('Edit student score');
const deleteActionTitle = ref('Delete student score');
const customActionTitle = ref('Enroll Student');

// Empty state
const emptyStateTitle = ref('No students with scores found');
const emptyStateMessage = ref('No students have been scored yet.');
const loadingMessage = ref('Loading students with scores...');

// Column configuration
const columns = ref([
  { key: 'rank', label: 'Rank', visible: true, sortable: true },
  { key: 'temp_student.id', label: 'Temp ID', visible: true, sortable: true },
  { key: 'temp_student.khmer_name', label: 'Khmer Name', visible: true, sortable: true },
  { key: 'temp_student.latin_name', label: 'Latin Name', visible: true, sortable: true },
  { key: 'temp_student.gender', label: 'Gender', visible: true, sortable: true },
  { key: 'temp_student.phone_number', label: 'Phone', visible: true, sortable: false },
  { key: 'temp_student.origin', label: 'Origin', visible: true, sortable: false },
  { key: 'temp_student.department_id', label: 'Department', visible: true, sortable: true },
  { key: 'temp_student.program_id', label: 'Program', visible: true, sortable: true },
  { key: 'score', label: 'Score', visible: true, sortable: true },
  { key: 'enrollment_decision', label: 'Status', visible: true, sortable: true },
]);

// Use composables
const { departments, getAllDepartments, getDepartmentById } = useDepartment();
const { sections, getAllSections, getSectionById } = useSection();

// Fetch data on mount
onMounted(async () => {
  try {
    await Promise.all([
      getAllDepartments(),
      getAllSections(),
      tempStudentListStore.fetchTempStudentList(props.academicYear)
    ]);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});

// Update single student status locally without full refresh
const updateStudentStatus = (student) => {
  const studentId = student.id;
  tempStudentListStore.updateStudentInList(studentId, {
    enrollment_decision: 'enrolled'
  });
  console.log(`✅ Updated student ${studentId} status to enrolled locally`);
};

// Expose refresh method for parent component (full refresh when needed)
const refresh = async () => {
  try {
    await tempStudentListStore.fetchTempStudentList(props.academicYear);
  } catch (error) {
    console.error('Failed to refresh temp student list:', error);
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

const getScoreBadgeClass = (score) => {
  if (score === null || score === undefined) return 'bg-gray-100 text-gray-800';
  if (score >= 90) return 'bg-green-100 text-green-800';
  if (score >= 80) return 'bg-blue-100 text-blue-800';
  if (score >= 70) return 'bg-yellow-100 text-yellow-800';
  if (score >= 60) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getGradeBadgeClass = (grade) => {
  const classes = {
    'A': 'bg-green-100 text-green-800',
    'B': 'bg-blue-100 text-blue-800',
    'C': 'bg-yellow-100 text-yellow-800',
    'D': 'bg-orange-100 text-orange-800',
    'F': 'bg-red-100 text-red-800',
  };
  return classes[grade] || 'bg-gray-100 text-gray-800';
};

const getStatusBadgeClass = (status) => {
  const classes = {
    'selected': 'bg-blue-100 text-blue-800',
    'enrolled': 'bg-green-100 text-green-800',
    'Enrolled': 'bg-green-100 text-green-800',
    'Failed': 'bg-red-100 text-red-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

// Event handlers
const handleView = (student) => {
  console.log('View student:', student);
  // TODO: Implement view logic
};

const handleEdit = (student) => {
  console.log('Edit student:', student);
  // TODO: Implement edit logic
};

const handleDelete = (student) => {
  console.log('Delete student:', student);
  // TODO: Implement delete logic
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
  
  // Note: Sorting should be handled by parent component since students is a prop
  console.log('Sort requested:', { field, direction });
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