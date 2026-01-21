<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1
          :class="[
            'text-3xl font-bold text-gray-900',
            locale === 'kh' ? 'khmer-text' : '',
          ]">
          {{ t("student_dashboard") }}
        </h1>

        <p :class="['text-gray-600 mt-2', locale === 'kh' ? 'khmer-text' : '']">
          {{ t("welcome") }}, {{ authStore.userRole }}!
        </p>
      </div>
    </div>

    <!-- Student Info Card -->
    <div>
      <UserInfoCard
        :role="authStore.userRole"
        :user="detailUser"
        :locale="locale" />
    </div>

    <!-- <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2
        :class="[
          'text-xl font-semibold mb-4',
          locale === 'kh' ? 'khmer-text' : '',
        ]">
        {{ t("student_information") }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-600">
            {{ t("role") }}:
          </label>
          <p class="text-lg font-semibold text-[#235AA6] capitalize">
            {{ (authStore.userRole || "").replace("_", " ") }}
          </p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-600">
            {{ t("email") }}
          </label>
          <p class="text-lg text-[#235AA6]">
            {{ authStore.user?.email || "—" }}
          </p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-600">
            {{ t("department") }}:
          </label>
          <p class="text-lg text-[#235AA6]">
            {{ authStore.user?.profile?.department || "—" }}
          </p>
        </div>
      </div>
    </div> -->

    <!-- Attendance from backend -->
    <!-- <AttendanceStatus :stats="stats" /> -->

    <!-- Widgets -->
    <div>
      <OverviewWidgets
        :role="authStore.userRole"
        :stats="stats"
        v-model:range="lineRange"
        @send="onChatSend" />
    </div>

    <!-- Timetable -->
    <TimetableOverview
      :weeks="weeks"
      v-model:selectedWeek="selectedWeek"
      :days="days"
      :timesMorning="timesMorning"
      :timesAfternoon="timesAfternoon"
      :getSlot="slot" />

    <!-- Permissions Student -->
    <div class="mt-6">
      <RolePermissions
        :role="authStore.userRole"
        :permissions="authStore.userPermissions"
        :locale="locale" />
    </div>

    <!-- Student Actions -->
    <div class="mt-6">
      <RoleQuickActions
        :role="authStore.userRole"
        :lang="route.params.lang || 'en'"
        :locale="locale" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { getAttendanceOverview } from "@/stores/Student/Overview";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import { getStudentProfile } from "@/stores/Student/StudentProfile";
import { CalendarDaysIcon, Circle, Sun, SunMoon } from "lucide-vue-next";
import { getStudentLeaveRequestsService } from "@/stores/Student/LeaveRequestFrom";

import OverviewWidgets from "@/components/overview/OverviewWidgets.vue";
import TimetableOverview from "@/components/students/timetable/TimetableOverview.vue";
import AttendanceStatus from "@/components/students/AttendanceStatus.vue";
import RolePermissions from "@/components/overview/RolePermissions.vue";
import RoleQuickActions from "@/components/overview/RoleQuickActions.vue";
import UserInfoCard from "@/components/overview/UserInfoCard.vue";

const { t, locale } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const handleLogout = () => {
  authStore.logout();
  const currentLang = route.params.lang || "en";
  router.push(`/${currentLang}/login`);
};

const detailUser = ref(null);

onMounted(async () => {
  const data = await getStudentProfile();
  detailUser.value = data?.user ?? data;
});

// ---------------- Attendance ---------------- //
// const rawStats = ref({
//   onTime: 0,
//   late: 0,
//   absence: 0,
// });

// const stats = computed(() => ({
//   present: rawStats.value.onTime + rawStats.value.late + rawStats.value.absence,
//   onTime: rawStats.value.onTime,
//   late: rawStats.value.late,
//   absence: rawStats.value.absence,
// }));

// onMounted(async () => {
//   try {
//     const data = await getAttendanceOverview();
//     rawStats.value = data;
//   } catch (err) {
//     console.error("Failed to fetch attendance stats:", err);
//   }
// });

// ---------------- Timetable ---------------- //
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const timesMorning = ["7:00-8:00", "8:00-9:00", "9:00-10:00", "10:00-11:00"];

const timesAfternoon = [
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

// ✅ schedule (pure JS)
const schedule = ref({
  "Week 1": {
    Monday: {
      "7:00-8:00": { subject: "Maths", room: "A201", teacher: "Mr. Kim" },
      "8:00-9:00": { subject: "English", room: "D305", teacher: "Ms. Anna" },
      "9:00-10:00": undefined,
      "10:00-11:00": { subject: "Physics", room: "B105", teacher: "Mr. Lee" },
      "13:00-14:00": { subject: "Biology", room: "Lab 1", teacher: "Mr. Chan" },
      "14:00-15:00": undefined,
      "15:00-16:00": { subject: "History", room: "A115", teacher: "Mr. Hok" },
      "16:00-17:00": { subject: "PE", room: "Gym", teacher: "Coach Dara" },
    },
    Tuesday: {
      "7:00-8:00": { subject: "Chemistry", room: "C210", teacher: "Ms. Dara" },
      "8:00-9:00": { subject: "Khmer", room: "B205", teacher: "Ms. Srey" },
      "9:00-10:00": { subject: "Art", room: "Studio 1", teacher: "Mr. Phirun" },
      "10:00-11:00": undefined,
      "13:00-14:00": { subject: "ICT", room: "Lab 3", teacher: "Mr. Sok" },
      "14:00-15:00": { subject: "Music", room: "Hall", teacher: "Ms. Chenda" },
      "15:00-16:00": undefined,
      "16:00-17:00": {
        subject: "Geography",
        room: "C120",
        teacher: "Ms. Lina",
      },
    },
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
  },

  "Week 2": {
    Monday: {
      "7:00-8:00": { subject: "History", room: "A115", teacher: "Mr. Hok" },
      "8:00-9:00": { subject: "English", room: "D305", teacher: "Ms. Anna" },
      "9:00-10:00": undefined,
      "10:00-11:00": { subject: "Biology", room: "Lab 2", teacher: "Mr. Chan" },
      "13:00-14:00": {
        subject: "Chemistry",
        room: "C210",
        teacher: "Ms. Dara",
      },
      "14:00-15:00": { subject: "Physics", room: "B105", teacher: "Mr. Lee" },
      "15:00-16:00": undefined,
      "16:00-17:00": { subject: "Maths", room: "A201", teacher: "Mr. Kim" },
    },
  },
});

const weeks = computed(() => Object.keys(schedule.value || {}));
const selectedWeek = ref(weeks.value[0] || "Week 1");

const weekData = computed(() => schedule.value?.[selectedWeek.value] || {});

// ✅ slot(day, time) for TimeTable
const slot = (day, time) => {
  return weekData.value?.[day]?.[time];
};

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

  const res = await getStudentLeaveRequestsService({
    start_date: toYMD(start),
    end_date: toYMD(end),
  });

  leaveRequests.value = res?.requests || [];
}

onMounted(() => fetchLeaveRequests(lineRange.value));
watch(lineRange, (v) => fetchLeaveRequests(v));

const stats = computed(() => {
  const leaveLine = buildLeaveLineChart(leaveRequests.value, lineRange.value);

  return {
    // ✅ Student KPI cards (map to OverviewWidgets Student kpis keys)
    leaverequests: 4,
    on_time: 11,
    late: 12,
    absence: 1,
    total_present: 20,

    // ✅ Line chart from API
    line_labels: leaveLine.line_labels,
    line_datasets: leaveLine.line_datasets,

    // ✅ bar chart (use API totals)
    bar_labels: ["Leave", "Attendance", "Other"],
    bar_values: [4, 9, 2],

    // ✅ donut chart
    donut_labels: ["Light", "Medium", "Heavy"],
    donut_values: [30, 50, 20],
  };
});

function onChatSend(payload) {
  console.log("HOD send:", payload);
}
</script>
