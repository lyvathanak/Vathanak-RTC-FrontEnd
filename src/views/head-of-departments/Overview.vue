<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9xl mx-auto">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 :class="['text-3xl font-bold text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('hod_dashboard') }}
          </h1>
          <p :class="['text-gray-600 mt-2', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('welcome') }}, {{ userProfile?.name || authStore.user?.name }}!
          </p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 :class="['text-xl font-semibold mb-4', locale === 'kh' ? 'khmer-text' : '']">
          Department Head Information
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Role:</label>
            <p class="text-lg font-semibold text-purple-600 capitalize">Head of Department</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Email:</label>
            <p class="text-lg">{{ userProfile?.email || authStore.user?.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Department:</label>
            <p class="text-lg font-medium text-gray-900">
              <span v-if="loading" class="text-gray-400">Loading...</span>
              <span v-else>{{ departmentName || 'N/A' }}</span>
            </p>
          </div>
        </div>
      </div>

      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Department Teachers</p>
              <p class="text-3xl font-bold text-blue-600">{{ stats.teachers }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Department Programs</p>
              <p class="text-3xl font-bold text-green-600">{{ stats.programs }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Department Students</p>
              <p class="text-3xl font-bold text-purple-600">{{ stats.students }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Pending Requests</p>
              <p class="text-3xl font-bold text-orange-600">{{ stats.pendingRequests }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 :class="['text-xl font-semibold mb-4', locale === 'kh' ? 'khmer-text' : '']">
          Quick Actions
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button @click="router.push('/head-of-department/teacher-management')" class="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-500 text-white rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Manage Teachers</h3>
                <p class="text-sm text-gray-600">Assign and oversee department faculty</p>
              </div>
            </div>
          </button>

          <button @click="router.push('/head-of-department/student-management')" class="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
             <div class="flex items-center gap-3">
              <div class="p-2 bg-purple-500 text-white rounded-lg">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Manage Students</h3>
                <p class="text-sm text-gray-600">View and manage enrolled students</p>
              </div>
            </div>
          </button>

          <button @click="router.push('/head-of-department/leave-request')" class="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
             <div class="flex items-center gap-3">
              <div class="p-2 bg-orange-500 text-white rounded-lg">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Leave Requests</h3>
                <p class="text-sm text-gray-600">Review pending requests</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import { getHODProfile } from "@/stores/HeadOfDepartment/HODProfile";
import api from "@/stores/apis/axios";
import { listPrograms } from "@/stores/apis/TimeTableCRUD";
import { getSHODLeaveRequestsService } from "@/stores/HeadOfDepartment/LeaveRequestFrom";
import { useDepartment } from "@/stores/global/useDepartment";

const router = useRouter();
const { t, locale } = useI18n();
const authStore = useAuthStore();
const { getAllDepartments, getDepartmentById } = useDepartment();

const loading = ref(true);
const userProfile = ref(null);
const departmentName = ref("");
const departmentId = ref(null);

const stats = reactive({
  teachers: 0,
  students: 0,
  programs: 0,
  pendingRequests: 0
});

onMounted(async () => {
  try {
    loading.value = true;
    const profileData = await getHODProfile();
    userProfile.value = profileData.user;
    
    // Extract Department Info
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
      // 1. Fetch Teachers (using specific users_by_hod_department endpoint with role query param)
      try {
        const teachersRes = await api.get(`/users_by_hod_department/${departmentId.value}`, { 
          params: { role: 'staff' } 
        });
        const teachersData = teachersRes.data.users || teachersRes.data.data || [];
        stats.teachers = Array.isArray(teachersData) ? teachersData.length : 0;
      } catch (e) {
        console.warn("Failed to fetch teachers:", e);
      }

      // 2. Fetch Students (using specific users_by_hod_department endpoint with role query param)
      try {
        const studentsRes = await api.get(`/users_by_hod_department/${departmentId.value}`, { 
          params: { role: 'student' } 
        });
        const studentsData = studentsRes.data.users || studentsRes.data.data || [];
        stats.students = Array.isArray(studentsData) ? studentsData.length : 0;
      } catch (e) {
        console.warn("Failed to fetch students:", e);
      }

      // 3. Fetch Programs
      try {
        const programsRes = await listPrograms();
        if (programsRes.success && Array.isArray(programsRes.data)) {
          const deptPrograms = programsRes.data.filter(p => Number(p.department_id) === Number(departmentId.value));
          stats.programs = deptPrograms.length;
        }
      } catch (e) { console.warn('Program fetch failed', e); }
    }

    // 4. Fetch Requests
    const requestsRes = await getSHODLeaveRequestsService();
    if (requestsRes.success && Array.isArray(requestsRes.requests)) {
      stats.pendingRequests = requestsRes.requests.filter(r => r.status?.toLowerCase() === 'pending').length;
    }

  } catch (error) {
    console.error("Failed to load dashboard data", error);
  } finally {
    loading.value = false;
  }
});
</script>