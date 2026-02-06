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
            {{ t("teacher_dashboard") }}
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

      <!-- Teacher Info Card -->
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

      <!-- Permissions Teacher -->
      <div class="mt-6">
        <RolePermissions
          :role="authStore.userRole"
          :permissions="authStore.userPermissions"
          :locale="locale" />
      </div>

      <!-- Quick Actions -->
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
import { getTeacherProfile } from "@/stores/Teacher/TeacherProfile";
import { getAllLeaveRequestsByTeacher } from "@/stores/Teacher/LeaveRequestFrom.js";
import { getStudentLearnWithTeacher } from "@/stores/Teacher/studerntinformation";
import ChangeLanguage from "@/components/language/ChangLanguage.vue";
import OverviewWidgets from "@/components/overview/OverviewWidgets.vue";
import RolePermissions from "@/components/overview/RolePermissions.vue";
import RoleQuickActions from "@/components/overview/RoleQuickActions.vue";
import UserInfoCard from "@/components/overview/UserInfoCard.vue";

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const authStore = useAuthStore();

const detailUser = ref(null);

/**
 * Logout
 */
const handleLogout = () => {
  authStore.logout();
  const currentLang = route.params.lang || "en";
  router.push(`/${currentLang}/login`);
};

/**
 * Helpers
 */
function toYMD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Line chart builder
 */
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

  // 1) collect all dates
  let allDates = (requests || []).map(getKey).filter(Boolean);

  // unique + sort (YYYY-MM-DD sorts correctly)
  allDates = Array.from(new Set(allDates)).sort();

  // 2) optional: keep only last N dates (not last N days)
  const n = Number(range || 0);
  const labels = n > 0 ? allDates.slice(-n) : allDates;

  // 3) init counts for labels
  const counts = {};
  labels.forEach((d) => (counts[d] = { approved: 0, rejected: 0, pending: 0 }));

  // 4) count requests that fall into labels
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

/**
 * API fetchers
 */
const lineRange = ref("7");
const leaveRequests = ref([]);

async function fetchTeacherProfile() {
  const data = await getTeacherProfile();
  detailUser.value = data?.user ?? data;
}

async function fetchLeaveRequests(days) {
  const n = Number(days || 7);
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (n - 1));

  const res = await getAllLeaveRequestsByTeacher({
    start_date: toYMD(start),
    end_date: toYMD(end),
  });

  leaveRequests.value = res?.requests || [];
}

/**
 * ✅ Single onMounted (clean)
 */
onMounted(async () => {
  await Promise.all([
    fetchTeacherProfile(),
    fetchLeaveRequests(lineRange.value),
    fetchMyStudents(),
  ]);
});

/**
 * Watchers
 */
watch(lineRange, (v) => fetchLeaveRequests(v));

const myStudents = ref([]);
const myStudentsTotal = ref(0);

async function fetchMyStudents() {
  const res = await getStudentLearnWithTeacher({ page: 1, per_page: 1 });

  myStudentsTotal.value =
    res?.meta?.total ??
    res?.total ??
    (Array.isArray(res?.data) ? res.data.length : 0);

  myStudents.value = Array.isArray(res?.data) ? res.data : [];
}

/**
 * Computed stats for widgets/charts
 */
const stats = computed(() => {
  const leaveLine = buildLeaveLineChart(leaveRequests.value, lineRange.value);

  return {
    leaverequests: leaveRequests.value.length,
    students: myStudentsTotal.value || myStudents.value.length,
    subjects: 8,

    line_labels: leaveLine.line_labels,
    line_datasets: leaveLine.line_datasets,

    bar_labels: ["Graded", "Pending", "Late"],
    bar_values: [10, 4, 1],

    donut_labels: ["Active", "Neutral", "Inactive"],
    donut_values: [60, 25, 15],
  };
});

function onChatSend(payload) {
  console.log("Teacher send:", payload);
}
</script>
