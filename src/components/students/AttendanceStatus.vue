<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    <div
      v-for="item in orderedAttendance"
      :key="item.label"
      class="flex items-center justify-between bg-white rounded-xl px-6 py-5 shadow-sm border border-gray-100">
      <!-- Left -->
      <div class="flex flex-col gap-1">
        <span :class="['text-2xl font-bold', colorMap[item.color].text]">
          {{ item.value }}
        </span>

        <span class="text-sm text-gray-500">
          {{ item.label }}
        </span>
      </div>

      <!-- Right icon -->
      <div
        :class="[
          'w-10 h-10 rounded-full flex items-center justify-center',
          colorMap[item.color].bg,
        ]">
        <component
          :is="item.icon"
          class="w-5 h-5"
          :class="colorMap[item.color].icon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Users, CheckCircle, Clock, UserX } from "lucide-vue-next";

/* -------------------- Props -------------------- */
const props = defineProps<{
  stats: {
    present: number;
    onTime: number;
    late: number;
    absence: number;
  };
}>();

/* -------------------- Types -------------------- */
type Color = "blue" | "green" | "yellow" | "red";

type AttendanceItem = {
  label: string;
  value: number;
  color: Color;
  icon: any;
};

/* -------------------- Color Map -------------------- */
const colorMap: Record<Color, { text: string; bg: string; icon: string }> = {
  blue: {
    text: "text-blue-500",
    bg: "bg-blue-100",
    icon: "text-blue-500",
  },
  green: {
    text: "text-green-500",
    bg: "bg-green-100",
    icon: "text-green-500",
  },
  yellow: {
    text: "text-yellow-500",
    bg: "bg-yellow-100",
    icon: "text-yellow-500",
  },
  red: {
    text: "text-red-500",
    bg: "bg-red-100",
    icon: "text-red-500",
  },
};

/* -------------------- Ordered Attendance -------------------- */
const orderedAttendance = computed<AttendanceItem[]>(() => [
  {
    label: "On Time",
    value: props.stats.onTime,
    color: "green",
    icon: CheckCircle,
  },
  {
    label: "Late",
    value: props.stats.late,
    color: "yellow",
    icon: Clock,
  },
  {
    label: "Absence",
    value: props.stats.absence,
    color: "red",
    icon: UserX,
  },
  {
    label: "Total Present",
    value: props.stats.present,
    color: "blue",
    icon: Users,
  },
]);
</script>
