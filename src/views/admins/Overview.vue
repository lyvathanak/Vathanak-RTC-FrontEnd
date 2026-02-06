<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1
            :class="[
              'text-3xl font-bold text-gray-900',
              locale === 'kh' ? 'khmer-text' : '',
            ]">
            {{ t("admin_dashboard") }}
          </h1>
          <p
            :class="[
              'text-gray-600 mt-2',
              locale === 'kh' ? 'khmer-text' : '',
            ]">
            <!-- {{ t('welcome') }}, {{ authStore.user?.name }}! -->
            {{ t("welcome") }}, {{ authStore.userRole }}!
          </p>
        </div>
      </div>

      <!-- User Info Card -->
      <div class="mb-6">
        <UserInfoCard
          :role="authStore.userRole"
          :user="detailUser"
          :locale="locale" />
      </div>

      <!-- Widgets -->
      <div>
        <OverviewWidgets
          :role="authStore.userRole"
          :stats="stats"
          v-model:range="lineRange"
          @send="onChatSend" />
      </div>

      <!-- Permissions Admin -->
      <div class="mt-6">
        <RolePermissions
          :role="authStore.userRole"
          :permissions="authStore.userPermissions"
          :locale="locale" />
      </div>

      <!-- Admin Actions -->
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
import { getAdminProfile } from "@/stores/Admin/AdminProfile";
import { getAllLeaveRequests } from "@/stores/apis/LeaveRequestManagement.js";
import ChangeLanguage from "@/components/language/ChangLanguage.vue";
import { getAllStudents } from "@/stores/apis/StudentCRUD.js";
import { getAllTeachers } from "@/stores/apis/TeacherCRUD.js";
import { getAllHODs } from "@/stores/apis/HeadOfDepartmentCRUD.js";
import { useDepartment } from "@/stores/global/useDepartment.js";
import { useProgram } from "@/stores/global/useProgram.js";
import { useSubject } from "@/stores/global/useSubject.js";
import { getAllGroups } from "@/stores/apis/GroupCRUD.js";
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

onMounted(async () => {
  // Profile
  const data = await getAdminProfile();
  detailUser.value = data?.user ?? data;

  // Departments (donut)
  await getAllDepartments();
  totals.value.departments = departments.value?.length ?? 0;

  // Leave requests (line)
  await fetchLeaveRequests(lineRange.value);

  // User totals (bar + total users)
  await fetchUserRoleTotals();

  // Programs KPI
  await getAllPrograms();
  totals.value.programs = programs.value?.length ?? 0;

  await fetchSubjects(1);
  totals.value.subjects = subjectMeta.value?.total ?? 0;

  await fetchGroupsTotal();
});

/**
 * Doughnut chart
 */
const donutDeptLabels = computed(() =>
  (departments.value || []).map((d) => d.department_name).filter(Boolean),
);

const donutDeptValues = computed(() => donutDeptLabels.value.map(() => 1));

/**
 * Line chart
 */
const lineRange = ref("7");
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

  const res = await getAllLeaveRequests({
    start_date: toYMD(start),
    end_date: toYMD(end),
    limit: 1000, // optional: get enough records for chart
  });

  leaveRequests.value = res?.requests || [];
}

const { getAllDepartments, departments } = useDepartment();
const { getAllPrograms, programs } = useProgram();
const { fetchSubjects, meta: subjectMeta } = useSubject();

watch(lineRange, (v) => fetchLeaveRequests(v));

/**
 * Bar chart and cards
 */
const totals = ref({
  students: 0,
  teachers: 0,
  hods: 0,
  programs: 0,
  subjects: 0,
  departments: 0,
  groups: 0,
});

async function fetchSubjectsTotal() {
  const params = { page: 1, per_page: 1 };

  const subRes = await getAllSubjects(params);

  totals.value.subjects =
    subRes?.pagination?.total ?? subRes?.total ?? subRes?.data?.length ?? 0;
}

async function fetchGroupsTotal() {
  const params = { page: 1, per_page: 1 }; // fast total only
  const res = await getAllGroups(params);

  totals.value.groups =
    res?.total ?? res?.pagination?.total ?? res?.data?.length ?? 0;
}

async function fetchUserRoleTotals() {
  const params = { page: 1, per_page: 9999 };

  const [stuRes, teaRes, hodRes] = await Promise.all([
    getAllStudents(params),
    getAllTeachers(params),
    getAllHODs(params),
  ]);

  totals.value.students = stuRes?.data?.length ?? 0;
  totals.value.teachers = teaRes?.data?.length ?? 0;
  totals.value.hods = hodRes?.data?.length ?? 0;
}

const barLabels = computed(() => ["Students", "Teachers", "HOD"]);
const barValues = computed(() => [
  totals.value.students,
  totals.value.teachers,
  totals.value.hods,
]);

const stats = computed(() => {
  const leaveLine = buildLeaveLineChart(leaveRequests.value, lineRange.value);

  const students = Number(totals.value.students) || 0;
  const teachers = Number(totals.value.teachers) || 0;
  const hods = Number(totals.value.hods) || 0;

  return {
    total_users: students + teachers + hods,
    teachers,
    students,
    hods,

    programs: Number(totals.value.programs) || 0,
    subjects: Number(totals.value.subjects) || 0,
    departments: departments.value?.length ?? 0,
    groups: Number(totals.value.groups) || 0,

    line_labels: leaveLine.line_labels,
    line_datasets: leaveLine.line_datasets,

    bar_labels: ["Students", "Teachers", "HOD"],
    bar_values: [students, teachers, hods],

    donut_labels: donutDeptLabels.value,
    donut_values: donutDeptValues.value,
  };
});

function onChatSend(payload) {
  console.log("Teacher send:", payload);
}
</script>
