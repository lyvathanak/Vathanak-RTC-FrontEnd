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
import { ref, computed, onMounted } from "vue";
import { getAttendanceOverview } from "@/stores/Student/Overview";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import { getStudentProfile } from "@/stores/Student/StudentProfile";
import { CalendarDaysIcon, Circle, Sun, SunMoon } from "lucide-vue-next";
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
const rawStats = ref({
  onTime: 0,
  late: 0,
  absence: 0,
});

// const stats = computed(() => ({
//   present: rawStats.value.onTime + rawStats.value.late + rawStats.value.absence,
//   onTime: rawStats.value.onTime,
//   late: rawStats.value.late,
//   absence: rawStats.value.absence,
// }));

onMounted(async () => {
  try {
    const data = await getAttendanceOverview();
    rawStats.value = data;
  } catch (err) {
    console.error("Failed to fetch attendance stats:", err);
  }
});

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

const stats = computed(() => ({
  department_teachers: 12,
  department_courses: 18,
  department_students: 285,
  pending_requests: 7,

  // charts
  line_series: [70, 72, 71, 74, 73, 75, 76],
  bar_labels: ["Leave", "Attendance", "Other"],
  bar_values: [4, 9, 2],
  donut_labels: ["Light", "Medium", "Heavy"],
  donut_values: [30, 50, 20],
}));

function onChatSend(payload) {
  console.log("HOD send:", payload);
}
</script>
