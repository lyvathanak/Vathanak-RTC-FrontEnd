<template>
  <div
    class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <PageHeader
      :title="t('timetable_management') || 'My Timetable'"
      subtitle="View your weekly class schedule">
      <!-- ✅ Always show for design -->
      <WeekSelector
        v-model="selectedWeek"
        :weeks="weeksForUI"
        :disabled="loading || !hasRealWeeks" />
    </PageHeader>

    <!-- Loading stays separate -->
    <div v-if="loading" class="text-center py-10 text-gray-500">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
      Loading timetable...
    </div>

    <!-- Always render timetable area (same UI) -->
    <div v-else class="relative">
      <!-- Empty state overlay (same place as table) -->
      <div
        v-if="isEmpty"
        class="mb-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="flex items-start gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-gray-50 ring-1 ring-gray-200 flex items-center justify-center">
            <span class="text-gray-400 text-lg">📅</span>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">No schedule found</h3>
            <p class="text-sm text-gray-500 mt-1">
              Your timetable is empty for this week. If this looks wrong, try
              another week.
            </p>
          </div>
        </div>
      </div>

      <TimetableSection
        title="Morning"
        subtitle="7:00–11:00"
        period="morning"
        :days="days"
        :times="timesMorning"
        :getSlot="getSlot"
        :readOnly="true" />

      <div class="mt-8">
        <TimetableSection
          title="Afternoon"
          subtitle="13:00–17:00"
          period="afternoon"
          :days="days"
          :times="timesAfternoon"
          :getSlot="getSlot"
          :readOnly="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";

import WeekSelector from "@/components/teachers/timetable/WeekSelector.vue";
import TimetableSection from "@/components/teachers/timetable/TimetableSection.vue";
import PageHeader from "@/components/features/PageHeader.vue";
import TimeTableAPI from "@/stores/apis/TimeTableAPI";

const { t } = useI18n();

const loading = ref(false);
const rawSlots = ref([]);
const groupedSchedule = ref({});

// ✅ default so WeekSelector has something selected for UI/design
const selectedWeek = ref("Weekly Schedule");

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

const weeks = computed(() => Object.keys(groupedSchedule.value || {}));
const hasRealWeeks = computed(() => weeks.value.length > 0);

// ✅ show demo weeks when empty (for UI/design)
const weeksForUI = computed(() => {
  if (weeks.value.length) return weeks.value;
  return ["Weekly Schedule", "Week of 01/01/2026", "Week of 08/01/2026"];
});

const isEmpty = computed(() => !hasRealWeeks.value);

const fetchSlots = async () => {
  loading.value = true;
  try {
    const data = await TimeTableAPI.fetchTeacherTimeSlots();
    rawSlots.value = Array.isArray(data) ? data : [];
    processSchedule(rawSlots.value);
  } catch (error) {
    console.error("Failed to load timetable", error);
    groupedSchedule.value = {};
    selectedWeek.value = "Weekly Schedule";
  } finally {
    loading.value = false;
  }
};

const processSchedule = (slots) => {
  const result = {};

  slots.forEach((slot) => {
    let timeSlotData = slot?.time_slot;
    if (typeof timeSlotData === "string") {
      try {
        timeSlotData = JSON.parse(timeSlotData);
      } catch (e) {
        console.error("Error parsing time_slot JSON:", e);
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
      ...slot,
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
      group: slot?.group?.name || slot?.group_name || "",
    };
  });

  groupedSchedule.value = result;

  // ✅ set selectedWeek safely
  const keys = Object.keys(result);
  selectedWeek.value = keys.includes("Weekly Schedule")
    ? "Weekly Schedule"
    : keys[0] || "Weekly Schedule";
};

function getSlot(day, timeLabel) {
  // ✅ protect when no data
  const weekData = groupedSchedule.value?.[selectedWeek.value];
  if (!weekData || !weekData[day]) return undefined;

  if (weekData[day][timeLabel]) return weekData[day][timeLabel];

  const foundKey = Object.keys(weekData[day]).find((key) => {
    const [start] = key.split("-");
    return String(timeLabel).startsWith(start);
  });

  return foundKey ? weekData[day][foundKey] : undefined;
}

onMounted(fetchSlots);
</script>
