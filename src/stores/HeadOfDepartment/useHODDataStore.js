import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/Authentication/authStore';
import api from '@/stores/apis/axios';
import HODDataService from '@/services/HODDataServices';

export const useHODDataStore = defineStore('hodData', () => {
  const authStore = useAuthStore();

  const students = ref([]);
  const teachers = ref([]);
  const leaveRequests = ref([]);
  const timeSlots = ref([]);

  const kpiStats = ref({
    students: 0,
    teachers: 0,
    leavePending: 0,
    leaveApproved: 0,
    leaveRejected: 0,
    leaveTotal: 0,
  });

  const isLoading = ref(false);
  const error = ref(null);

  const currentDepartment = computed(() => {
    const user = authStore.user || {};
    const detail = user.user_detail || user.profile || {};
    const headDept = user.head_department || {};

    const id = headDept.id || detail.department_id || user.department_id || null;
    const name = headDept.department_name || detail.department || user.department || null;

    return { id, name };
  });

  const ensureDepartmentId = async () => {
    if (currentDepartment.value.id) return currentDepartment.value.id;

    try {
      const res = await api.get('/auth/get_detail_user');

      if (res.data?.user) {
        authStore.user = res.data.user;
        const user = res.data.user;
        return user.head_department?.id || user.user_detail?.department_id || user.department_id;
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }

    return null;
  };

  /**
   * Load all dashboard data
   */
  const loadDashboardData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const deptId = await ensureDepartmentId();
      if (!deptId) {
        console.warn("⚠️ HOD Store: Could not identify department ID.");
        return;
      }

      // Fetch Teachers
      const teacherRes = await HODDataService.getTeachers(deptId);
      if (teacherRes.success) {
        teachers.value = teacherRes.data.
        filter(user =>
          user.roles?.some(role => role.role_key === "Staff")
        );
        kpiStats.value.teachers = teacherRes.total;
      }

      // Fetch Students (ONLY STUDENTS)
      const studentRes = await HODDataService.getStudents(deptId);
      if (studentRes.success) {
        students.value = studentRes.data.filter(user =>
          user.roles?.some(role => role.role_key === "Student")
        );
        kpiStats.value.students = students.value.length;
      }

      // Fetch Leave Requests
      const leaveRes = await HODDataService.getLeaveRequests(deptId);
      if (leaveRes.success) {
        leaveRequests.value = leaveRes.data;
        kpiStats.value.leaveTotal = leaveRes.total;
        kpiStats.value.leavePending = leaveRequests.value.filter(r => r.status?.toLowerCase() === 'pending').length;
      }

      // Fetch Time Table
      const timeRes = await HODDataService.getTimeTable(deptId);
      if (timeRes.success) {
        timeSlots.value = timeRes.data;
      }

    } catch (err) {
      console.error("Global HOD Load Error:", err);
      error.value = "Some data failed to load.";
    } finally {
      isLoading.value = false;
    }
  };

  // Individual Actions
  const fetchTeachers = async () => {
    const id = await ensureDepartmentId();
    if (id) {
      const res = await HODDataService.getTeachers(id);
      if (res.success) teachers.value = res.data.filter(user =>
          user.roles?.some(role => role.role_key === "Staff")
        );
    }
  };

  const fetchStudents = async () => {
    const id = await ensureDepartmentId();
    if (id) {
      const res = await HODDataService.getStudents(id);
      if (res.success) {
        students.value = res.data.filter(user =>
          user.roles?.some(role => role.role_key === "Student")
        );
      }
    }
  };

  const fetchLeaveRequests = async () => {
    const id = await ensureDepartmentId();
    if (id) {
      const res = await HODDataService.getLeaveRequests(id);
      if (res.success) leaveRequests.value = res.data;
    }
  };

  const fetchTimeTable = async () => {
    const id = await ensureDepartmentId();
    if (id) {
      const res = await HODDataService.getTimeTable(id);
      if (res.success) timeSlots.value = res.data;
    }
  };

  return {
    students,
    teachers,
    leaveRequests,
    timeSlots,
    kpiStats,
    isLoading,
    error,
    currentDepartment,
    loadDashboardData,
    fetchTeachers,
    fetchStudents,
    fetchLeaveRequests,
    fetchTimeTable,
  };
});
