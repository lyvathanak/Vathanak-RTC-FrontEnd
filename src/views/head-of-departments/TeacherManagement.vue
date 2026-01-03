<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9xl mx-auto">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 :class="['text-3xl font-bold text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            Teacher Management
          </h1>
          <p class="text-gray-600 mt-2">
             Department: <span class="font-semibold text-blue-600">{{ departmentName }}</span>
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
            <p class="text-sm font-medium text-gray-500">Total Faculty</p>
            <p class="text-3xl font-bold text-blue-600">{{ totalTeachers }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
             <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
           <div>
            <p class="text-sm font-medium text-gray-500">Active</p>
            <p class="text-3xl font-bold text-indigo-600">{{ activeTeachers }}</p>
          </div>
          <div class="p-3 bg-indigo-100 rounded-full">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
         <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
           <div>
            <p class="text-sm font-medium text-gray-500">Inactive</p>
            <p class="text-3xl font-bold text-orange-600">{{ inactiveTeachers }}</p>
          </div>
          <div class="p-3 bg-orange-100 rounded-full">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 :class="['text-xl font-semibold', locale === 'kh' ? 'khmer-text' : '']">Faculty List</h2>
           <div class="flex gap-2">
            <input v-model="searchQuery" type="text" placeholder="Search Teacher..." class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-gray-500 border-b">
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Name</th>
                <th class="py-3 px-4">Position</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody class="text-gray-700">
               <tr v-if="loading" class="border-b">
                <td colspan="5" class="py-8 text-center text-gray-500">Loading teachers...</td>
              </tr>
              <tr v-else-if="filteredTeachers.length === 0" class="border-b">
                <td colspan="5" class="py-8 text-center text-gray-500">No teachers found in this department.</td>
              </tr>
              <tr v-for="teacher in filteredTeachers" :key="teacher.id" class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">{{ teacher.id_card || 'N/A' }}</td>
                <td class="py-3 px-4 font-medium">
                  <div>{{ teacher.latin_name }}</div>
                  <div class="text-xs text-gray-500">{{ teacher.khmer_name }}</div>
                </td>
                <td class="py-3 px-4">{{ teacher.position || 'Lecturer' }}</td>
                <td class="py-3 px-4">
                   <span :class="[
                    'text-xs font-medium px-2.5 py-0.5 rounded',
                    teacher.is_active ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'
                  ]">
                    {{ teacher.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button class="text-blue-600 hover:text-blue-800 mr-2" @click="console.log('View profile', teacher.id)">Profile</button>
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
const teachers = ref([]);
const searchQuery = ref("");
const departmentName = ref("");
const departmentId = ref(null);

const totalTeachers = computed(() => teachers.value.length);
const activeTeachers = computed(() => teachers.value.filter(t => t.is_active).length);
const inactiveTeachers = computed(() => teachers.value.length - activeTeachers.value);

const filteredTeachers = computed(() => {
  if (!searchQuery.value) return teachers.value;
  const q = searchQuery.value.toLowerCase();
  return teachers.value.filter(t => 
    (t.latin_name || '').toLowerCase().includes(q) ||
    (t.khmer_name || '').toLowerCase().includes(q) ||
    (t.id_card || '').toLowerCase().includes(q)
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
        params: { role: 'staff' } 
      });
      const data = res.data.users || res.data.data || [];
      if (Array.isArray(data)) {
        teachers.value = data;
      }
    }
  } catch (err) {
    console.error("Error fetching teachers:", err);
  } finally {
    loading.value = false;
  }
});
</script>