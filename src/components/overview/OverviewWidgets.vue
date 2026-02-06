<template>
  <div :class="['space-y-6', locale === 'kh' ? 'khmer-text' : '']">
    <!-- Top KPI cards -->
    <div class="grid gap-6" :class="kpiGridClass">
      <Card
        v-for="card in kpiCards"
        :key="card.key"
        :label="card.label"
        :value="card.value"
        :icon="card.icon"
        :value-class="card.valueClass"
        :icon-bg-class="card.iconBgClass"
        :icon-class="card.iconClass" />
    </div>

    <!-- Charts + Calendar -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- LineChart (LONG) -->
      <div class="lg:col-span-8">
        <LineChartCard
          :title="chartsTitle"
          v-model:range="rangeModel"
          :line_labels="statsSafe.line_labels"
          :line_datasets="statsSafe.line_datasets" />
      </div>

      <!-- Calendar (SMALL) -->
      <div class="lg:col-span-4">
        <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Calendar</h3>
          <CalendarCard v-model="selectedDate" :marked-dates="markedDates" />
        </div>
      </div>

      <!-- Row 2 (same width split) -->
      <!-- Row 2 (only render when needed) -->
      <template v-if="showBar || showDonut">
        <div v-if="showBar" class="lg:col-span-8 h-[420px]">
          <BarChartCard
            class="h-full"
            :title="barTitle"
            :labels="statsSafe.bar_labels"
            :values="statsSafe.bar_values" />
        </div>

        <div v-if="showDonut" class="lg:col-span-4 h-[420px]">
          <DoughnutChartCard
            class="h-full"
            :title="donutTitle"
            :labels="statsSafe.donut_labels"
            :values="statsSafe.donut_values" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import {
  BookOpen,
  Layers,
  UserCheck,
  CheckCircle2,
  Clock3,
  UserX,
  FileText,
  Users,
  BookOpenCheck,
  UserCog,
  GraduationCap,
  CalendarCheck,
  Building2,
  UsersRound,
} from "lucide-vue-next";

import CalendarCard from "@/components/overview/charts/CalendarCard.vue";
import LineChartCard from "@/components/overview/charts/LineChartCard.vue";
import BarChartCard from "@/components/overview/charts/BarChartCard.vue";
import DoughnutChartCard from "@/components/overview/charts/DoughnutChartCard.vue";
import Card from "@/components/overview/charts/Card.vue";

const props = defineProps({
  role: { type: String, required: true },
  stats: { type: Object, default: () => ({}) },
  range: { type: [String, Number], default: "7" },
});

const emit = defineEmits(["update:range"]);
const { locale } = useI18n();

/** ---------------------------
 * Calendar
 * --------------------------*/
// ✅ Keep a real date selected (better UX than null)
const selectedDate = ref(new Date());

// ✅ must be an array (CalendarCard expects array)
const markedDates = ref(["2026-01-08", "2026-01-09", "2026-01-16"]);

/** v-model proxy (single source of truth) */
const rangeModel = computed({
  get: () => String(props.range ?? "7"),
  set: (v) => emit("update:range", String(v)),
});

/** ---------------------------
 * Role config
 * --------------------------*/
const ROLE_CONFIG = {
  Teacher: {
    kpis: [
      { key: "leaverequests", label: "My Leave Requests" },
      { key: "students", label: "My Students" },
      { key: "subjects", label: "My Subjects" },
    ],
    titles: {
      line: "Leave Request Trend",
      bar: "Assignments by Status",
      donut: "Student Engagement",
    },
  },

  Student: {
    kpis: [
      { key: "leaverequests", label: "My Leave Requests" },
      { key: "on_time", label: "On Time" },
      { key: "late", label: "Late" },
      { key: "absence", label: "Absence" },
      { key: "total_present", label: "Total Present" },
    ],
    titles: {
      line: "Leave Request Trend",
      bar: "Attendance Summary",
    },
  },

  "Head of Department": {
    kpis: [
      { key: "leaverequests", label: "My Leave Requests" },
      { key: "department_teachers", label: "Department Teachers" },
      { key: "department_students", label: "Department Students" },
      { key: "department_subjects", label: "Department Subjects" },
    ],
    titles: {
      line: "Leave Request Trend",
      bar: "User Roles Share",
      donut: "Teacher Workload",
    },
  },

  Admin: {
    kpis: [
      { key: "total_users", label: "Total Users" },
      { key: "teachers", label: "Teachers" },
      { key: "students", label: "Students" },
      { key: "hods", label: "Head of Departments" },
      { key: "programs", label: "Programs" },
      { key: "subjects", label: "Subjects" },
      { key: "departments", label: "Departments" },
      { key: "groups", label: "Groups" },
    ],
    titles: {
      line: "Leave Request Trend",
      bar: "User Roles Share",
      donut: "Department Share",
    },
  },
};

function normalizeRole(role) {
  const raw = String(role || "")
    .trim()
    .toLowerCase();
  const key = raw.replace(/[_\s]+/g, "_");

  if (["head_of_department", "head_department", "hod"].includes(key))
    return "Head of Department";
  if (["teacher", "staff_teacher"].includes(key)) return "Teacher";
  if (key === "student") return "Student";
  if (key === "admin") return "Admin";

  return "Admin";
}

const roleKey = computed(() => normalizeRole(props.role));
const roleConfig = computed(
  () => ROLE_CONFIG[roleKey.value] || ROLE_CONFIG.Admin,
);

const chartsTitle = computed(() => roleConfig.value.titles?.line || "Trend");
const barTitle = computed(() => roleConfig.value.titles?.bar || "Bar");
const donutTitle = computed(() => roleConfig.value.titles?.donut || "Doughnut");

/** Charts visibility */
const showBar = computed(() => roleKey.value === "Admin");
const showDonut = computed(() => roleKey.value === "Admin");

/** ---------------------------
 * Safe stats (prevents undefined errors)
 * --------------------------*/
const statsSafe = computed(() => ({
  line_labels: props.stats?.line_labels ?? [],
  line_datasets: props.stats?.line_datasets ?? [],
  bar_labels: props.stats?.bar_labels ?? [],
  bar_values: props.stats?.bar_values ?? [],
  donut_labels: props.stats?.donut_labels ?? [],
  donut_values: props.stats?.donut_values ?? [],
}));

/** ---------------------------
 * KPI cards meta
 * --------------------------*/
const DEFAULT_META = {
  icon: FileText,
  valueClass: "text-gray-900",
  iconBgClass: "bg-gray-100",
  iconClass: "text-gray-600",
};

const KPI_META = {
  Teacher: {
    leaverequests: {
      icon: CalendarCheck,
      valueClass: "text-purple-600",
      iconBgClass: "bg-purple-100",
      iconClass: "text-purple-600",
    },
    students: {
      icon: Users,
      valueClass: "text-green-600",
      iconBgClass: "bg-green-100",
      iconClass: "text-green-600",
    },
    subjects: {
      icon: BookOpen,
      valueClass: "text-blue-600",
      iconBgClass: "bg-blue-100",
      iconClass: "text-blue-600",
    },
  },

  Student: {
    leaverequests: {
      icon: CalendarCheck,
      valueClass: "text-purple-600",
      iconBgClass: "bg-purple-100",
      iconClass: "text-purple-600",
    },
    on_time: {
      icon: CheckCircle2,
      valueClass: "text-green-600",
      iconBgClass: "bg-green-100",
      iconClass: "text-green-600",
    },
    late: {
      icon: Clock3,
      valueClass: "text-yellow-600",
      iconBgClass: "bg-yellow-100",
      iconClass: "text-yellow-600",
    },
    absence: {
      icon: UserX,
      valueClass: "text-red-600",
      iconBgClass: "bg-red-100",
      iconClass: "text-red-600",
    },
    total_present: {
      icon: UserCheck,
      valueClass: "text-blue-600",
      iconBgClass: "bg-blue-100",
      iconClass: "text-blue-600",
    },
  },

  "Head of Department": {
    leaverequests: {
      icon: CalendarCheck,
      valueClass: "text-purple-600",
      iconBgClass: "bg-purple-100",
      iconClass: "text-purple-600",
    },
    department_teachers: {
      icon: Users,
      valueClass: "text-blue-600",
      iconBgClass: "bg-blue-100",
      iconClass: "text-blue-600",
    },
    department_students: {
      icon: GraduationCap,
      valueClass: "text-emerald-600",
      iconBgClass: "bg-emerald-100",
      iconClass: "text-emerald-600",
    },
    department_subjects: {
      icon: BookOpenCheck,
      valueClass: "text-amber-600",
      iconBgClass: "bg-amber-100",
      iconClass: "text-amber-600",
    },
  },

  Admin: {
    total_users: {
      icon: Users,
      valueClass: "text-blue-600",
      iconBgClass: "bg-blue-100",
      iconClass: "text-blue-600",
    },
    teachers: {
      icon: UserCog,
      valueClass: "text-green-600",
      iconBgClass: "bg-green-100",
      iconClass: "text-green-600",
    },
    students: {
      icon: GraduationCap,
      valueClass: "text-purple-600",
      iconBgClass: "bg-purple-100",
      iconClass: "text-purple-600",
    },
    hods: {
      icon: UserCheck,
      valueClass: "text-indigo-600",
      iconBgClass: "bg-indigo-100",
      iconClass: "text-indigo-600",
    },
    programs: {
      icon: BookOpenCheck,
      valueClass: "text-amber-600",
      iconBgClass: "bg-amber-100",
      iconClass: "text-amber-600",
    },
    subjects: {
      icon: Layers,
      valueClass: "text-pink-600",
      iconBgClass: "bg-pink-100",
      iconClass: "text-pink-600",
    },
    departments: {
      icon: Building2,
      valueClass: "text-teal-600",
      iconBgClass: "bg-teal-100",
      iconClass: "text-teal-600",
    },
    groups: {
      icon: UsersRound,
      valueClass: "text-cyan-600",
      iconBgClass: "bg-cyan-100",
      iconClass: "text-cyan-600",
    },
  },
};

const kpiCards = computed(() => {
  const kpis = roleConfig.value.kpis || [];
  const metaByRole = KPI_META[roleKey.value] || {};

  return kpis.map((k) => ({
    key: k.key,
    label: k.label,
    value: props.stats?.[k.key] ?? 0,
    ...(metaByRole[k.key] || DEFAULT_META),
  }));
});

/** KPI grid class (responsive based on number of KPIs) */
const kpiGridClass = computed(() => {
  const n = kpiCards.value.length;

  // 1-2 cards
  if (n <= 2) return "grid-cols-1 sm:grid-cols-2";

  // 3 cards
  if (n === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  // 4 cards
  if (n === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  // 5+ cards
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
});
</script>
