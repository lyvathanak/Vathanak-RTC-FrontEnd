<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9xl mx-auto space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 :class="['text-3xl font-bold text-gray-900', isKhmer ? 'khmer-text' : '']">
            {{ $t('teacher_management') || 'Teacher Management' }}
          </h1>
          <p class="text-gray-600 mt-2">
             Department: <span class="font-semibold text-blue-600">{{ departmentName }}</span>
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
            <p class="text-sm font-medium text-gray-500">Total Faculty</p>
            <p class="text-3xl font-bold text-blue-600 mt-1">{{ totalTeachers }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
             <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between border border-gray-100">
           <div>
            <p class="text-sm font-medium text-gray-500">Active</p>
            <p class="text-3xl font-bold text-indigo-600 mt-1">{{ activeTeachers }}</p>
          </div>
          <div class="p-3 bg-indigo-100 rounded-full">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
         <div class="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between border border-gray-100">
           <div>
            <p class="text-sm font-medium text-gray-500">Inactive</p>
            <p class="text-3xl font-bold text-orange-600 mt-1">{{ inactiveTeachers }}</p>
          </div>
          <div class="p-3 bg-orange-100 rounded-full">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 :class="['text-xl font-semibold text-gray-800', isKhmer ? 'khmer-text' : '']">Faculty List</h2>
         <div class="w-full sm:w-auto relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="$t('search_teacher_placeholder') || 'Search Teacher...'" 
            class="w-full sm:w-80 border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <ListTable
        :data="filteredTeachers"
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
        :empty-state-title="$t('no_teachers_found') || 'No Teachers Found'"
        :empty-state-message="$t('no_teachers_message') || 'There are no teachers in this department matching your criteria.'"
        @sort="handleSort"
        @view="handleViewTeacher"
      >
        <template #column-id_card="{ row }">
          <span class="font-mono text-sm font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
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
                class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm"
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

        <template #column-status="{ row }">
          <span :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            isActive(row) ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'
          ]">
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="isActive(row) ? 'bg-indigo-600' : 'bg-orange-600'"></span>
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
const teachers = ref([]);
const searchQuery = ref("");
const departmentName = ref("");
const departmentId = ref(null);
const sortField = ref("name");
const sortDirection = ref("asc");

// Table Columns
const columns = ref([
  { key: 'id_card', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'user_detail.position', label: 'Position', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]);

// Computed Stats
const totalTeachers = computed(() => teachers.value.length);
const activeTeachers = computed(() => teachers.value.filter(t => isActive(t)).length);
const inactiveTeachers = computed(() => teachers.value.length - activeTeachers.value);

const filteredTeachers = computed(() => {
  let result = [...teachers.value];

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(t => 
      (t.latin_name || t.name || '').toLowerCase().includes(q) ||
      (t.khmer_name || t.user_detail?.khmer_name || '').toLowerCase().includes(q) ||
      (t.id_card || t.user_detail?.id_card || '').toLowerCase().includes(q)
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
  if (!name) return 'TC';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Actions
const handleSort = ({ field, direction }) => {
  sortField.value = field;
  sortDirection.value = direction;
};

const handleViewTeacher = (teacher) => {
  console.log('View profile', teacher.id);
  // router.push(`/head-of-departments/teacher/${teacher.id}`);
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
        params: { role: 'staff' } 
      });
      const data = res.data.users || res.data.data || [];
      if (Array.isArray(data)) {
        teachers.value = data.map(t => ({
          ...t,
          id_card: t.id_card || t.user_detail?.id_card,
          position: t.position || t.user_detail?.position || 'Lecturer'
        }));
      }
    }
  } catch (err) {
    console.error("Error fetching teachers:", err);
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