<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ $t('dashboard') || 'Dashboard' }}
          </h1>
          <p class="text-gray-500 mt-1">
            {{ $t('welcome_back') || 'Welcome back' }}, 
            <span class="font-semibold text-purple-600">{{ detailUser?.name || 'HOD' }}</span>
          </p>
        </div>
        <RoleQuickActions role="Head_Department" />
      </div>

      <OverviewWidgets 
        :stats="stats" 
        :loading="loading" 
        role="Head_Department"
      />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
           <BarChartCard /> 
        </div>
        <div>
           <DonutChartCard />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserInfoCard :user="detailUser" role="Head_Department" />
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getHODProfile } from "@/stores/HeadOfDepartment/HODProfile";
import api from "@/stores/apis/axios";
// FIX 1: Import the HOD-specific service
import { getSHODLeaveRequestsService } from "@/stores/HeadOfDepartment/LeaveRequestFrom"; 

// Components
import OverviewWidgets from "@/components/overview/OverviewWidgets.vue";
import RoleQuickActions from "@/components/overview/RoleQuickActions.vue";
import UserInfoCard from "@/components/overview/UserInfoCard.vue";
import BarChartCard from "@/components/overview/charts/BarChartCard.vue";
import DonutChartCard from "@/components/overview/charts/DoughnutChartCard.vue";

const { t } = useI18n();
const detailUser = ref(null);
const loading = ref(true);

const dashboardCounts = ref({
  teachers: 0,
  programs: 0,
  students: 0,
  requests: 0
});

onMounted(async () => {
  try {
    loading.value = true;

    // 1. Get Profile
    const profileData = await getHODProfile();
    const userDetail = profileData.user?.user_detail || profileData.user_detail || {};
    const baseUser = profileData.user || profileData;
    detailUser.value = baseUser;

    // Resolve Department ID
    const headDept = userDetail.head_department || baseUser.head_department;
    const directDept = userDetail.department || baseUser.department;
    const departmentId = headDept?.id || directDept?.id || userDetail.department_id;

    if (departmentId) {
      
      // 2. Fetch Department Data (Teachers & Students)
      const fetchDeptData = async () => {
        try {
          const [teachersRes, studentsRes] = await Promise.all([
             api.get(`/users_by_hod_department/${departmentId}`, { params: { role: 'staff' } }),
             api.get(`/users_by_hod_department/${departmentId}`, { params: { role: 'student' } })
          ]);
          
          const tData = teachersRes.data.users || teachersRes.data.data || [];
          dashboardCounts.value.teachers = Array.isArray(tData) ? tData.length : 0;

          const sData = studentsRes.data.users || studentsRes.data.data || [];
          dashboardCounts.value.students = Array.isArray(sData) ? sData.length : 0;
        } catch (e) {
          console.warn("Error fetching department users:", e);
        }
      };

      // 3. Fetch Programs (With 403 Handler)
      const fetchPrograms = async () => {
        try {
          const res = await api.get(`/managements/get_program_by`, { params: { department_id: departmentId } });
          const data = res.data.programs || [];
          dashboardCounts.value.programs = Array.isArray(data) ? data.length : 0;
        } catch (e) {
          // Silent fail for 403 to prevent console spam if desired, or keep warn
          // console.warn("Programs API access denied (403). Displaying 0.");
          dashboardCounts.value.programs = 0;
        }
      };

      // 4. Fetch Personal Leave Requests (FIXED)
      const fetchPersonalRequests = async () => {
        try {
           // Calls /request/get_leave_request_hod (No ID needed, uses Token)
           const res = await getSHODLeaveRequestsService();
           const myRequests = res.requests || [];
           
           // Filter for pending
           const pending = myRequests.filter(r => (r.status || '').toLowerCase() === 'pending');
           dashboardCounts.value.requests = pending.length;
        } catch (e) {
           console.error("Error fetching personal leave requests:", e);
        }
      };

      await Promise.allSettled([fetchDeptData(), fetchPrograms(), fetchPersonalRequests()]);
    }
  } catch (error) {
    console.error("Dashboard Error:", error);
  } finally {
    loading.value = false;
  }
});

const stats = computed(() => ({
  department_teachers: dashboardCounts.value.teachers,
  department_courses: dashboardCounts.value.programs,
  department_students: dashboardCounts.value.students,
  pending_requests: dashboardCounts.value.requests,
  
  line_series: [10, 41, 35, 51, 49, 62, 69], 
  bar_labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  bar_values: [12, 19, 3, 5, 2],
  donut_labels: ["Present", "Absent", "Leave"],
  donut_values: [85, 10, 5],
}));
</script>