<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9xl mx-auto">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 :class="['text-3xl font-bold text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            Student Management
          </h1>
          <p class="text-gray-600 mt-2">
            Department: <span class="font-semibold text-purple-600">{{ departmentName }}</span>
          </p>
        </div>
        <button @click="router.back()" class="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white rounded-lg shadow hover:bg-gray-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {{ t('back') || 'Back' }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Students</p>
            <p class="text-3xl font-bold text-purple-600">{{ totalStudents }}</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Active Now</p>
            <p class="text-3xl font-bold text-green-600">{{ activeStudents }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
         <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Females</p>
            <p class="text-3xl font-bold text-pink-600">{{ femaleStudents }}</p>
          </div>
          <div class="p-3 bg-pink-100 rounded-full">
            <svg class="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 :class="['text-xl font-semibold', locale === 'kh' ? 'khmer-text' : '']">Student List</h2>
          <div class="flex gap-2">
            <input v-model="searchQuery" type="text" placeholder="Search ID or Name..." class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-gray-500 border-b">
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Name</th>
                <th class="py-3 px-4">Gender</th>
                <th class="py-3 px-4">Year/Class</th>
                <th class="py-3 px-4">Program</th>
                <th class="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="text-gray-700">
              <tr v-if="loading" class="border-b">
                <td colspan="6" class="py-8 text-center text-gray-500">Loading students...</td>
              </tr>
              <tr v-else-if="filteredStudents.length === 0" class="border-b">
                <td colspan="6" class="py-8 text-center text-gray-500">No students found.</td>
              </tr>
              <tr v-for="student in filteredStudents" :key="student.id" class="border-b hover:bg-gray-50">
                <td class="py-3 px-4 font-mono text-sm">{{ student.id_card || 'N/A' }}</td>
                <td class="py-3 px-4 font-medium">
                  <div>{{ student.latin_name }}</div>
                  <div class="text-xs text-gray-500">{{ student.khmer_name }}</div>
                </td>
                <td class="py-3 px-4">{{ student.gender || '-' }}</td>
                <td class="py-3 px-4">{{ student.academic_year || '-' }}</td>
                <td class="py-3 px-4">{{ student.program_name || student.degree || '-' }}</td>
                <td class="py-3 px-4">
                  <span :class="[
                    'text-xs font-medium px-2.5 py-0.5 rounded',
                    student.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ student.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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

const router = useRouter();
const { t, locale } = useI18n();
const { getAllDepartments, getDepartmentById } = useDepartment();

const loading = ref(false);
const students = ref([]);
const searchQuery = ref("");
const departmentName = ref("");
const departmentId = ref(null);

const totalStudents = computed(() => students.value.length);
const activeStudents = computed(() => students.value.filter(s => s.is_active).length);
const femaleStudents = computed(() => students.value.filter(s => (s.gender || '').toLowerCase().startsWith('f') || (s.gender || '').toLowerCase() === 'female').length);

const filteredStudents = computed(() => {
  if (!searchQuery.value) return students.value;
  const q = searchQuery.value.toLowerCase();
  return students.value.filter(s => 
    (s.latin_name || '').toLowerCase().includes(q) ||
    (s.khmer_name || '').toLowerCase().includes(q) ||
    (s.id_card || '').toLowerCase().includes(q)
  );
});

onMounted(async () => {
  try {
    loading.value = true;
    const profileData = await getHODProfile();
    const userDetail = profileData.user.user_detail || {};
    const headDept = userDetail.head_department || profileData.user.head_department;
    const directDept = userDetail.department || profileData.user.department;
    
    departmentId.value = headDept?.id || directDept?.id || userDetail.department_id;
    departmentName.value = headDept?.department_name || directDept?.department_name || "";

    if (!departmentName.value && departmentId.value) {
      await getAllDepartments();
      const dept = getDepartmentById(departmentId.value);
      if (dept) departmentName.value = dept.department_name;
    }

    if (departmentId.value) {
      // Corrected API call with role query parameter
      const res = await api.get(`/users_by_hod_department/${departmentId.value}`, { 
        params: { role: 'student' } 
      });
      const data = res.data.users || res.data.data || [];
      if (Array.isArray(data)) {
        students.value = data;
      }
    }
  } catch (err) {
    console.error("Error fetching students:", err);
  } finally {
    loading.value = false;
  }
});
</script>