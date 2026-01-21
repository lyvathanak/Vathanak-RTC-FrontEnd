<template>
  <div class="space-y-4">
    <ListTable
      :data="props.students"
      :loading="props.loading"
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
      <!-- ID Column Slot -->
      <template #column-temp_user_id="{ value }">
        <span class="font-medium text-gray-700">{{ value }}</span>
      </template>

      <!-- Profile Picture Column Slot -->
      <template #column-profile_picture="{ value }">
        <img :src="value" alt="Profile Picture" class="w-10 h-10 rounded-full object-cover" />
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ListTable from '@/components/features/ListTable.vue';
import { useDepartment } from '@/stores/global/useDepartment';
import { useSection } from '@/stores/global/useSection';
import avatar from '@/assets/default-avatar.png';

// Props
const props = defineProps({
  students: {
    type: Array,
    default: () => [
      {
        id: 1,
        temp_user_id: 'TEMP2024001',
        profile_picture: avatar,
        name_khmer: 'សុខ សំណាង',
        name_latin: 'Sok Somnang',
        gender: 'Male',
        phone_number: '012 345 678',
        department_id: 1,
        program_id: 1
      }
    ]
  },
  loading: {
    type: Boolean,
    default: false
  },
  showSelection: {
    type: Boolean,
    default: true
  }
});

const selectedIds = ref([]);
const sortField = ref('');
const sortDirection = ref('asc');

// Action flags
const showActions = ref(true);
const showViewAction = ref(true);
const showEditAction = ref(false);
const showDeleteAction = ref(false);

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
  { key: 'temp_user_id', label: 'Temp ID', visible: true, sortable: true },
  { key: 'profile_picture', label: 'Photo', visible: true, sortable: false },
  { key: 'name_khmer', label: 'Khmer Name', visible: true, sortable: true },
  { key: 'name_latin', label: 'Latin Name', visible: true, sortable: true },
  { key: 'gender', label: 'Gender', visible: true, sortable: true },
  { key: 'phone_number', label: 'Phone', visible: true, sortable: false },
  { key: 'origin', label: 'Origin', visible: true, sortable: false },
  { key: 'department_id', label: 'Department', visible: true, sortable: true },
  { key: 'program_id', label: 'Program', visible: true, sortable: true },
]);

// Use composables
const { departments, getAllDepartments, getDepartmentById } = useDepartment();
const { sections, getAllSections, getSectionById } = useSection();

// Fetch data on mount
onMounted(async () => {
  try {
    await Promise.all([
      getAllDepartments(),
      getAllSections()
    ]);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});

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
  
  // TODO: Implement sorting logic or call API with sort parameters
  students.value.sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal > bVal ? 1 : -1;
    return direction === 'asc' ? comparison : -comparison;
  });
};
</script>Note: Sorting should be handled by parent component since students is a prop
  console.log('Sort requested:', { field, direction