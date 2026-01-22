<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9xl mx-auto">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1
            :class="[
              'text-3xl font-bold text-gray-900',
              locale === 'kh' ? 'khmer-text' : '',
            ]">
            {{ t("hod_dashboard") }}
          </h1>
          <p
            :class="[
              'text-gray-600 mt-2',
              locale === 'kh' ? 'khmer-text' : '',
            ]">
            {{ t("welcome") }},{{ authStore.userRole.replace(/_/g, " ") }}!
          </p>
        </div>
      </div>

      <div>
        <UserInfoCard
          :role="authStore.userRole"
          :user="detailUser"
          :locale="locale" />
      </div>

      <div>
        <OverviewWidgets
          :role="authStore.userRole"
          :stats="stats"
          v-model:range="lineRange"
          @send="onChatSend" />
      </div>

      <div class="mt-6">
        <RolePermissions
          :role="authStore.userRole"
          :permissions="authStore.userPermissions"
          :locale="locale" />
      </div>

      <div class="mt-6">
        <RoleQuickActions
          :role="authStore.userRole"
          :lang="route.params.lang || 'en'"
          :locale="locale" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import { getHODProfile } from "@/stores/HeadOfDepartment/HODProfile";
import { getSHODLeaveRequestsService } from "@/stores/HeadOfDepartment/LeaveRequestFrom";
import api from "@/stores/apis/axios"; // Use direct API for department-specific endpoints

import ChangeLanguage from "@/components/language/ChangLanguage.vue";
import OverviewWidgets from "@/components/overview/OverviewWidgets.vue";
import RolePermissions from "@/components/overview/RolePermissions.vue";
import RoleQuickActions from "@/components/overview/RoleQuickActions.vue";
import UserInfoCard from "@/components/overview/UserInfoCard.vue";

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  const currentLang = route.params.lang || "en";
  router.push(`/${currentLang}/login`);
};

const detailUser = ref(null);

/**
 * Line chart
 */
const lineRange = ref("7"); // for 7/14/30 selector
const leaveRequests = ref([]);

function toYMD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildLeaveLineChart(requests, range) {
  const normalizeStatus = (s) => {
    const v = String(s || "")
      .trim()
      .toLowerCase();
    if (v.includes("approve")) return "approved";
    if (v.includes("reject") || v.includes("deny") || v.includes("decline"))
      return "rejected";
    return "pending";
  };

  const toISOFromDDMMYYYY = (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();

    // "10-01-2026" -> "2026-01-10"
    if (/^\d{2}-\d{2}-\d{4}/.test(s)) {
      const [dd, mm, yyyy] = s.slice(0, 10).split("-");
      return `${yyyy}-${mm}-${dd}`;
    }

    // "2026-01-10..." -> "2026-01-10"
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

    return null;
  };

  const getKey = (r) =>
    toISOFromDDMMYYYY(r?.start_date) ||
    toISOFromDDMMYYYY(r?.end_date) ||
    toISOFromDDMMYYYY(r?.submit_at) ||
    toISOFromDDMMYYYY(r?.created_at);

  // ✅ 1) collect all dates from requests
  let allDates = (requests || []).map(getKey).filter(Boolean);

  // unique + sort
  allDates = Array.from(new Set(allDates)).sort(); // "YYYY-MM-DD" sorts correctly

  // ✅ 2) Optional: if range = 7/14/30, keep only last N dates (not last N days)
  const n = Number(range || 0);
  const labels = n > 0 ? allDates.slice(-n) : allDates;

  // ✅ 3) init counts
  const counts = {};
  labels.forEach((d) => (counts[d] = { approved: 0, rejected: 0, pending: 0 }));

  // ✅ 4) count requests
  for (const r of requests || []) {
    const key = getKey(r);
    if (!key || !counts[key]) continue;
    counts[key][normalizeStatus(r.status)] += 1;
  }

  return {
    line_labels: labels,
    line_datasets: [
      { label: "Approved", data: labels.map((d) => counts[d].approved) },
      { label: "Rejected", data: labels.map((d) => counts[d].rejected) },
      { label: "Pending", data: labels.map((d) => counts[d].pending) },
    ],
  };
}

async function fetchLeaveRequests(days) {
  const n = Number(days || 7);
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (n - 1));

  const res = await getSHODLeaveRequestsService({
    start_date: toYMD(start),
    end_date: toYMD(end),
  });

  leaveRequests.value = res?.requests || [];
}

watch(lineRange, (v) => fetchLeaveRequests(v));

/**
 * Bar chart data
 */
const totals = ref({
  students: 0,
  teachers: 0,
});

async function fetchUserRoleTotals() {
  if (!detailUser.value) return;

  const user = detailUser.value;
  const userDetail = user.user_detail || {};
  
  // Resolve department ID from profile data
  const headDept = userDetail.head_department || user.head_department;
  const directDept = userDetail.department || user.department;
  
  const departmentId = 
    headDept?.id || 
    directDept?.id || 
    userDetail.department_id || 
    user.department_id;

  if (!departmentId) {
    console.warn('Could not determine department ID for HOD totals');
    return;
  }

  try {
    // Fetch Students and Teachers strictly for this department
    // This avoids the 403 Forbidden error from "get_all_users"
    const [stuRes, teaRes] = await Promise.all([
      api.get(`/users_by_hod_department/${departmentId}`, { params: { role: 'student' } }),
      api.get(`/users_by_hod_department/${departmentId}`, { params: { role: 'staff' } })
    ]);

    const stuData = stuRes.data?.users || stuRes.data?.data || [];
    const teaData = teaRes.data?.users || teaRes.data?.data || [];

    // Calculate totals
    totals.value.students = Array.isArray(stuData) ? stuData.length : (stuData.total || 0);
    totals.value.teachers = Array.isArray(teaData) ? teaData.length : (teaData.total || 0);
    
  } catch (error) {
    console.error('Error fetching department totals:', error);
  }
}

onMounted(async () => {
  // 1. Fetch Profile First
  const data = await getHODProfile();
  detailUser.value = data?.user ?? data;

  // 2. Fetch Totals (requires profile to be loaded)
  await fetchUserRoleTotals();

  // 3. Fetch Leave Requests
  await fetchLeaveRequests(lineRange.value);
});

const stats = computed(() => {
  const leaveLine = buildLeaveLineChart(leaveRequests.value, lineRange.value);

  return {
    leaverequests: leaveRequests.value.length || 0,
    department_teachers: totals.value.teachers,
    department_students: totals.value.students,
    department_subjects: 18, // Placeholder or fetch if needed

    // ✅ Line chart from API
    line_labels: leaveLine.line_labels,
    line_datasets: leaveLine.line_datasets,

    // ✅ bar chart (use API totals)
    bar_labels: ["Students", "Teachers"],
    bar_values: [totals.value.students, totals.value.teachers],

    // ✅ donut chart
    donut_labels: ["Light", "Medium", "Heavy"],
    donut_values: [30, 50, 20],
  };
});

function onChatSend(payload) {
  console.log("HOD send:", payload);
}
</script>