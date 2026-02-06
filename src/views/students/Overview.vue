<template>
  <div class="p-6">
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

    <div>
      <UserInfoCard
        :role="authStore.userRole"
        :user="detailUser"
        :locale="locale" />
    </div>

    <div class="mt-6">
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import { getStudentProfile } from "@/stores/Student/StudentProfile";
import { getStudentLeaveRequestsService } from "@/stores/Student/LeaveRequestFrom";

import OverviewWidgets from "@/components/overview/OverviewWidgets.vue";
import RolePermissions from "@/components/overview/RolePermissions.vue";
import RoleQuickActions from "@/components/overview/RoleQuickActions.vue";
import UserInfoCard from "@/components/overview/UserInfoCard.vue";

const { t, locale } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const detailUser = ref(null);

onMounted(async () => {
  const data = await getStudentProfile();
  detailUser.value = data?.user ?? data;
});

/**
 * Line chart Logic
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
    const v = String(s || "").trim().toLowerCase();
    if (v.includes("approve")) return "approved";
    if (v.includes("reject") || v.includes("deny") || v.includes("decline")) return "rejected";
    return "pending";
  };

  const toISOFromDDMMYYYY = (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (/^\d{2}-\d{2}-\d{4}/.test(s)) {
      const [dd, mm, yyyy] = s.slice(0, 10).split("-");
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    return null;
  };

  const getKey = (r) =>
    toISOFromDDMMYYYY(r?.start_date) ||
    toISOFromDDMMYYYY(r?.end_date) ||
    toISOFromDDMMYYYY(r?.submit_at) ||
    toISOFromDDMMYYYY(r?.created_at);

  let allDates = (requests || []).map(getKey).filter(Boolean);
  allDates = Array.from(new Set(allDates)).sort();

  const n = Number(range || 0);
  const labels = n > 0 ? allDates.slice(-n) : allDates;

  const counts = {};
  labels.forEach((d) => (counts[d] = { approved: 0, rejected: 0, pending: 0 }));

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
    leaverequests: 4,
    on_time: 11,
    late: 12,
    absence: 1,
    total_present: 20,
    line_labels: leaveLine.line_labels,
    line_datasets: leaveLine.line_datasets,
    bar_labels: ["Leave", "Attendance", "Other"],
    bar_values: [4, 9, 2],
    donut_labels: ["Light", "Medium", "Heavy"],
    donut_values: [30, 50, 20],
  };
});

function onChatSend(payload) {
  console.log("HOD send:", payload);
}
</script>