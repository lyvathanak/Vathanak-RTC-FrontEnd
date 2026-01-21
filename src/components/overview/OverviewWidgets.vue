<template>
  <div :class="['space-y-6', locale === 'kh' ? 'khmer-text' : '']">
    <!-- Top KPI cards -->
    <div
      class="grid grid-cols-1 gap-6"
      :class="kpiCards.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'">
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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Charts -->
      <div class="lg:col-span-2 space-y-6">
        <LineChartCard
          :title="chartsTitle"
          v-model:range="rangeModel"
          :line_labels="stats?.line_labels"
          :line_datasets="stats?.line_datasets" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BarChartCard
            v-if="showBar"
            :title="barTitle"
            :labels="stats?.bar_labels"
            :values="stats?.bar_values"
            :height="300" />

          <DoughnutChartCard
            v-if="showDonut"
            :title="donutTitle"
            :labels="stats?.donut_labels"
            :values="stats?.donut_values" />
        </div>
      </div>

      <!-- Calendar -->
      <div
        class="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col lg:sticky lg:top-6 min-h-[420px] sm:min-h-[480px]">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Calendar</h3>
        </div>

        <CalendarCard
          v-model="selectedDate"
          class="flex-1 min-h-0"
          :marked-dates="markedDates" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  BookOpen,
  ClipboardList,
  AlertCircle,
  Layers,
  UserCheck,
  CheckCircle2,
  Clock3,
  UserX,
  Presentation,
  FileText,
  Users,
  BookOpenCheck,
  UserCog,
  GraduationCap,
  CalendarCheck,
} from "lucide-vue-next";

import CalendarCard from "@/components/overview/charts/CalendarCard.vue";
import LineChartCard from "@/components/overview/charts/LineChartCard.vue";
import BarChartCard from "@/components/overview/charts/BarChartCard.vue";
import DoughnutChartCard from "@/components/overview/charts/DoughnutChartCard.vue";
import Card from "@/components/overview/charts/Card.vue";

const props = defineProps({
  role: { type: String, required: true },
  stats: { type: Object, default: () => ({}) },
  range: { type: [String, Number], default: "7" }, // v-model:range from parent
});

const emit = defineEmits(["update:range"]);
const { locale } = useI18n();

/** Calendar */
const selectedDate = ref(null);
const markedDates = ["2026-01-08", "2026-01-09", "2026-01-16"];

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
      { key: "programs", label: "Programs" },
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
  () => ROLE_CONFIG[roleKey.value] || ROLE_CONFIG.Admin
);

const chartsTitle = computed(() => roleConfig.value.titles?.line || "Trend");
const barTitle = computed(() => roleConfig.value.titles?.bar || "Bar");
const donutTitle = computed(() => roleConfig.value.titles?.donut || "Doughnut");

/** Charts visibility (keep same behavior you had: only Admin shows bar/donut) */
const showBar = computed(
  () => roleKey.value === "Admin" || roleKey.value === "Head of Department"
);
const showDonut = computed(() => roleKey.value === "Admin");

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
      icon: Users, // Faculty members
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

    programs: {
      icon: BookOpenCheck,
      valueClass: "text-indigo-600",
      iconBgClass: "bg-indigo-100",
      iconClass: "text-indigo-600",
    },

    teachers: {
      icon: UserCog,
      valueClass: "text-purple-600",
      iconBgClass: "bg-purple-100",
      iconClass: "text-purple-600",
    },

    students: {
      icon: GraduationCap,
      valueClass: "text-orange-600",
      iconBgClass: "bg-orange-100",
      iconClass: "text-orange-600",
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
</script>
