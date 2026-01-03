<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9xl mx-auto space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 :class="['text-3xl font-bold text-gray-900', isKhmer ? 'khmer-text' : '']">
            {{ $t('student_management') || 'Student Management' }}
          </h1>
          <p class="text-gray-600 mt-2">
            Department: <span class="font-semibold text-purple-600">{{ departmentName }}</span>
          </p>
        </div>
        <button 
          @click="router.back()" 
          class="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {{ $t('back') || 'Back' }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between border border-gray-100">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Students</p>
            <p class="text-3xl font-bold text-purple-600 mt-1">{{ totalStudents }}</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between border border-gray-100">
          <div>
            <p class="text-sm font-medium text-gray-500">Active Now</p>
            <p class="text-3xl font-bold text-green-600 mt-1">{{ activeStudents }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
         <div class="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between border border-gray-100">
          <div>
            <p class="text-sm font-medium text-gray-500">Females</p>
            <p class="text-3xl font-bold text-pink-600 mt-1">{{ femaleStudents }}</p>
          </div>
          <div class="p-3 bg-pink-100 rounded-full">
            <svg class="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 :class="['text-xl font-semibold text-gray-800', isKhmer ? 'khmer-text' : '']">Student List</h2>
        <div class="w-full sm:w-auto relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="$t('search_placeholder') || 'Search ID or Name...'" 
            class="w-full sm:w-80 border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
          <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <ListTable
        :data="filteredStudents"
        :loading="loading"
        :columns="columns"
        :row-key="'id'"
        :show-selection="false"
        :show-actions="true"
        :show-view-action="true"
        :show-edit-action="false"
        :show-delete-action="false"
        :sort-field="sortField"
        :sort-direction="sortDirection"
        :empty-state-title="$t('no_students_found') || 'No Students Found'"
        :empty-state-message="$t('no_students_message') || 'There are no students in this department matching your criteria.'"
        @sort="handleSort"
        @view="handleViewStudent"
      >
        <template #column-id_card="{ row }">
          <span class="font-mono text-sm font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
            {{ row.id_card || row.user_detail?.id_card || 'N/A' }}
          </span>
        </template>

        <template #column-name="{ row }">
          <div class="flex items-center gap-3">
            <div class="shrink-0">
               <img 
                v-if="row.user_detail?.profile_picture" 
                :src="row.user_detail.profile_picture.startsWith('http') ? row.user_detail.profile_picture : `https://api.rtc-bb.camai.kh/${row.user_detail.profile_picture}`" 
                :alt="row.name" 
                class="w-10 h-10 rounded-full object-cover border border-gray-200"
                @error="(e) => e.target.style.display = 'none'"
              >
              <div 
                v-else 
                class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-700 font-bold text-sm"
              >
                {{ getInitials(row.name || row.latin_name) }}
              </div>
            </div>
            <div>
              <div class="font-medium text-gray-900">{{ row.latin_name || row.name }}</div>
              <div class="text-xs text-gray-500 font-khmer">{{ row.khmer_name || row.user_detail?.khmer_name || '' }}</div>
            </div>
          </div>
        </template>

        <template #column-user_detail.gender="{ value }">
           <span :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            (value || '').toLowerCase() === 'female' || (value || '').toLowerCase() === 'f'
              ? 'bg-pink-50 text-pink-700 border border-pink-100' 
              : 'bg-blue-50 text-blue-700 border border-blue-100'
          ]">
            {{ value || '-' }}
          </span>
        </template>

        <template #column-status="{ row }">
          <span :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            isActive(row) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]">
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="isActive(row) ? 'bg-green-600' : 'bg-red-600'"></span>
            {{ isActive(row) ? 'Active' : 'Inactive' }}
          </span>
        </template>
      </ListTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { getHODProfile } from "@/stores/HeadOfDepartment/HODProfile";
import api from "@/stores/apis/axios";
import { useDepartment } from "@/stores/global/useDepartment";
import ListTable from "@/components/features/ListTable.vue";

const router = useRouter();
const { t, locale } = useI18n();
const { getAllDepartments, getDepartmentById } = useDepartment();

const isKhmer = computed(() => locale.value === "kh");

// State
const loading = ref(false);
const students = ref([]);
const searchQuery = ref("");
const departmentName = ref("");
const departmentId = ref(null);
const sortField = ref("name");
const sortDirection = ref("asc");

// Table Columns
const columns = ref([
  { key: 'id_card', label: 'ID Card', sortable: true },
  { key: 'name', label: 'Student Name', sortable: true },
  { key: 'user_detail.gender', label: 'Gender', sortable: true },
  { key: 'user_detail.academic_year', label: 'Academic Year', sortable: true },
  { key: 'program_name', label: 'Program', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]);

// Computed Stats
const totalStudents = computed(() => students.value.length);
const activeStudents = computed(() => students.value.filter(s => isActive(s)).length);
const femaleStudents = computed(() => students.value.filter(s => {
  const gender = s.gender || s.user_detail?.gender || '';
  return gender.toLowerCase() === 'female' || gender.toLowerCase() === 'f';
}).length);

const filteredStudents = computed(() => {
  let result = [...students.value];

  // Search Filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(s => 
      (s.latin_name || s.name || '').toLowerCase().includes(q) ||
      (s.khmer_name || s.user_detail?.khmer_name || '').toLowerCase().includes(q) ||
      (s.id_card || s.user_detail?.id_card || '').toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortField.value) {
    result.sort((a, b) => {
      let aVal = getNestedValue(a, sortField.value);
      let bVal = getNestedValue(b, sortField.value);
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return result;
});

// Helpers
const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc?.[part], obj);

const isActive = (row) => {
  if (row.is_active !== undefined) return row.is_active;
  if (row.user_detail?.is_active !== undefined) return row.user_detail.is_active;
  return false;
};

const getInitials = (name) => {
  if (!name) return 'ST';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Actions
const handleSort = ({ field, direction }) => {
  sortField.value = field;
  sortDirection.value = direction;
};

const handleViewStudent = (student) => {
  console.log("View student:", student.id);
  // Add navigation logic here if needed, e.g.:
  // router.push(`/head-of-departments/student/${student.id}`);
};

// Data Fetching
onMounted(async () => {
  try {
    loading.value = true;
    const profileData = await getHODProfile();
    const userDetail = profileData.user?.user_detail || {};
    const headDept = userDetail.head_department || profileData.user?.head_department;
    const directDept = userDetail.department || profileData.user?.department;
    
    departmentId.value = headDept?.id || directDept?.id || userDetail.department_id;
    departmentName.value = headDept?.department_name || directDept?.department_name || "";

    if (!departmentName.value && departmentId.value) {
      await getAllDepartments();
      const dept = getDepartmentById(departmentId.value);
      if (dept) departmentName.value = dept.department_name;
    }

    if (departmentId.value) {
      // Use the endpoint that filters users by HOD department
      const res = await api.get(`/users_by_hod_department/${departmentId.value}`, { 
        params: { role: 'student' } 
      });
      
      const rawData = res.data.users || res.data.data || [];
      
      // Normalize data for the table
      if (Array.isArray(rawData)) {
        students.value = rawData.map(s => ({
          ...s,
          // Ensure these top-level keys exist for cleaner column access if desired
          id_card: s.id_card || s.user_detail?.id_card,
          program_name: s.program_name || s.user_detail?.program_name || s.current_program?.program?.program_name || '-',
        }));
      }
    }
  } catch (err) {
    console.error("Error fetching students:", err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.font-khmer {
  font-family: 'Battambang', 'Noto Sans Khmer', sans-serif;
}
</style>