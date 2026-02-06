<template>
  <div
    class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen space-y-4">
    <!-- Header row -->
    <div
      class="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
      <PageHeader
        :title="t('timetable_management')"
        subtitle="Track and manage your timetable applications" />

      <!-- ✅ Always show (design), disable if no real data -->
      <div class="w-full lg:w-auto">
        <WeekSelector
          v-model="selectedWeek"
          :weeks="weeksForUI"
          :disabled="loading || !hasRealWeeks" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10 text-gray-500">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
      Loading timetable...
    </div>

    <!-- Always show overview (same UI) -->
    <div v-else class="relative space-y-4">
      <!-- empty state card -->
      <div
        v-if="isEmpty"
        class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div class="flex items-start gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-gray-50 ring-1 ring-gray-200 flex items-center justify-center">
            <span class="text-gray-400 text-lg">📅</span>
          </div>
          <div>
            <p class="text-base font-bold text-gray-900">
              No schedule found for this semester
            </p>
            <p class="text-sm text-gray-500 mt-1">
              Your timetable is empty right now. If this looks wrong, please
              contact admin.
            </p>
          </div>
        </div>
      </div>

      <TimetableOverview
        :weeks="weeksForUI"
        v-model:selectedWeek="selectedWeek"
        :days="days"
        :timesMorning="timesMorning"
        :timesAfternoon="timesAfternoon"
        :getSlot="getSlot" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import WeekSelector from "@/components/teachers/timetable/WeekSelector.vue";
import TimetableOverview from "@/components/students/timetable/TimetableOverview.vue";
import TimeTableAPI from "@/stores/apis/TimeTableAPI";
import PageHeader from "@/components/features/PageHeader.vue";

const { t } = useI18n();

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

const loading = ref(false);
const selectedWeek = ref("Weekly Schedule");
const groupedSchedule = ref({});

const weeks = computed(() => Object.keys(groupedSchedule.value || {}));
const hasRealWeeks = computed(() => weeks.value.length > 0);

// ✅ show demo weeks when empty (for UI/design)
const weeksForUI = computed(() => {
  if (weeks.value.length) return weeks.value;
  return ["Weekly Schedule", "Week of 01/01/2026", "Week of 08/01/2026"];
});

const isEmpty = computed(() => !hasRealWeeks.value);

// ✅ handles "07:00", "07:00:00", "7:00"
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const parts = String(timeStr).split(":");
  const hour = parseInt(parts[0], 10);
  const minute = parts[1] ?? "00";
  return `${hour}:${minute}`;
};

const getWeekLabel = (dateStr) => {
  if (!dateStr) return "Weekly Schedule";

  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Weekly Schedule";

  const day = d.getDay(); // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);

  return `Week of ${monday.toLocaleDateString("en-GB")}`;
};

const getDayName = (dateStr) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { weekday: "long" });
};

const fetchSchedule = async () => {
  loading.value = true;
  try {
    const slots = await TimeTableAPI.fetchStudentTimeSlots();
    const list = Array.isArray(slots) ? slots : [];

    const result = {};

    list.forEach((slot) => {
      let timeSlotData = slot?.time_slot;
      if (typeof timeSlotData === "string") {
        try {
          timeSlotData = JSON.parse(timeSlotData);
        } catch (e) {
          console.error("Error parsing student time_slot:", e);
          return;
        }
      }
      if (!timeSlotData) return;

      const date = slot?.time_slot_date || slot?.date || timeSlotData?.date;
      const weekLabel = date ? getWeekLabel(date) : "Weekly Schedule";
      const dayName = slot?.day_of_week || (date ? getDayName(date) : "");
      if (!dayName) return;

      const startRaw = timeSlotData?.start_time || slot?.start_time;
      const endRaw = timeSlotData?.end_time || slot?.end_time;

      const start = formatTime(startRaw);
      const end = formatTime(endRaw);
      if (!start || !end) return;

      const timeKey = `${start}-${end}`;

      if (!result[weekLabel]) result[weekLabel] = {};
      if (!result[weekLabel][dayName]) result[weekLabel][dayName] = {};

      result[weekLabel][dayName][timeKey] = {
        subject:
          slot?.subject?.subject_name ||
          slot?.subject?.name ||
          slot?.subject_name ||
          slot?.remark ||
          "N/A",
        room:
          slot?.location?.name ||
          slot?.classroom?.name ||
          slot?.room?.name ||
          "N/A",
        teacher: slot?.teacher?.name || slot?.teacher_name || "N/A",
      };
    });

    groupedSchedule.value = result;

    const keys = Object.keys(result);
    selectedWeek.value = keys.includes("Weekly Schedule")
      ? "Weekly Schedule"
      : keys[0] || "Weekly Schedule";
  } catch (error) {
    console.error("Failed to fetch timetable:", error);
    groupedSchedule.value = {};
    selectedWeek.value = "Weekly Schedule";
  } finally {
    loading.value = false;
  }
};

const getSlot = (day, time) => {
  const weekData = groupedSchedule.value?.[selectedWeek.value];
  if (!weekData || !weekData[day]) return undefined;

  if (weekData[day][time]) return weekData[day][time];

  const foundKey = Object.keys(weekData[day]).find((key) => {
    const [start] = key.split("-");
    return String(time).startsWith(start);
  });

  return foundKey ? weekData[day][foundKey] : undefined;
};

onMounted(fetchSchedule);
</script>
