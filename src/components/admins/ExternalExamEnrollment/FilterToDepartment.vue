<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
      <div class="flex items-center gap-2">
        <Filter class="w-5 h-5 text-gray-600 shrink-0" />
        <h3 class="text-base sm:text-lg font-semibold text-gray-800">Filters</h3>
      </div>
      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="sm:ml-auto text-sm text-red-600 hover:text-red-700 font-medium self-start sm:self-auto"
      >
        Clear All
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <!-- Department Filter -->
      <div class="space-y-2">
        <label class="block text-xs sm:text-sm font-medium text-gray-700">
          Department
        </label>
        <select
          v-model="filters.departmentId"
          class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-transparent bg-white"
        >
          <option :value="null">All Departments</option>
          <option
            v-for="department in departments"
            :key="department.id"
            :value="department.id"
          >
            {{ department.department_name }}
          </option>
        </select>
      </div>

      <!-- Program Filter -->
      <div class="space-y-2">
        <label class="block text-xs sm:text-sm font-medium text-gray-700">
          Program
        </label>
        <select
          v-model="filters.programId"
          class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          :disabled="!filters.departmentId"
        >
          <option :value="null">All Programs</option>
          <option
            v-for="program in filteredPrograms"
            :key="program.id"
            :value="program.id"
          >
            {{ program.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Apply Filter Button -->
    <div class="mt-3 sm:mt-4 flex justify-stretch sm:justify-end gap-2">
      <button
        @click="applyFilters"
        class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#235AA6] text-white rounded-lg hover:bg-[#1e4a91] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <Search class="w-4 h-4" />
        <span>Apply Filters</span>
      </button>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
      <span class="text-xs sm:text-sm text-gray-600 font-medium w-full sm:w-auto">Active Filters:</span>
      <span
        v-if="filters.departmentId"
        class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm"
      >
        <span class="truncate max-w-30 sm:max-w-none">
          Department: {{ getDepartmentName(filters.departmentId) }}
        </span>
        <button @click="clearDepartmentFilter" class="hover:text-green-900 shrink-0">
          <X class="w-3 h-3" />
        </button>
      </span>
      <span
        v-if="filters.programId"
        class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm"
      >
        <span class="truncate max-w-30 sm:max-w-none">
          Program: {{ getProgramName(filters.programId) }}
        </span>
        <button @click="clearProgramFilter" class="hover:text-purple-900 shrink-0">
          <X class="w-3 h-3" />
        </button>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Filter, Search, X } from 'lucide-vue-next';
import { useDepartment } from '@/stores/global/useDepartment';
import { useSection } from '@/stores/global/useSection';

// Props
const props = defineProps({
  totalStudents: {
    type: Number,
    default: 0
  }
});

// Emits
const emit = defineEmits(['filter-change']);

// Use composables
const { departments, getAllDepartments, getDepartmentById } = useDepartment();
const { sections, getAllSections, getSectionById } = useSection();

// Filter state
const filters = ref({
  departmentId: null,
  programId: null
});

// Computed
const filteredPrograms = computed(() => {
  if (!filters.value.departmentId) return sections.value;
  
  return sections.value.filter(
    section => section.department_id === filters.value.departmentId
  );
});

const hasActiveFilters = computed(() => {
  return (
    filters.value.departmentId !== null ||
    filters.value.programId !== null
  );
});

// Methods
const getDepartmentName = (id) => {
  const dept = getDepartmentById(id);
  return dept ? dept.department_name : 'Unknown';
};

const getProgramName = (id) => {
  const program = getSectionById(id);
  return program ? program.name : 'Unknown';
};

const applyFilters = () => {
  emit('filter-change', { ...filters.value });
};

const clearFilters = () => {
  filters.value = {
    departmentId: null,
    programId: null
  };
  applyFilters();
};

const clearDepartmentFilter = () => {
  filters.value.departmentId = null;
  filters.value.programId = null; // Clear program when department is cleared
  applyFilters();
};

const clearProgramFilter = () => {
  filters.value.programId = null;
  applyFilters();
};

// Watch for department change to reset program
watch(() => filters.value.departmentId, (newVal, oldVal) => {
  if (newVal !== oldVal && filters.value.programId) {
    const programExists = filteredPrograms.value.find(
      p => p.id === filters.value.programId
    );
    if (!programExists) {
      filters.value.programId = null;
    }
  }
});

// Fetch data on mount
onMounted(async () => {
  try {
    await Promise.all([
      getAllDepartments(),
      getAllSections()
    ]);
  } catch (error) {
    console.error('Failed to fetch filter data:', error);
  }
});
</script>