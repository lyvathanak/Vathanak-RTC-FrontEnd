<template>
  <div class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <PageHeader
      :title="t('timetable_management') || 'My Timetable'"
      subtitle="View your weekly class schedule">
      <WeekSelector v-if="weeks.length > 0" v-model="selectedWeek" :weeks="weeks" />
    </PageHeader>

    <div v-if="loading" class="text-center py-10 text-gray-500">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
      Loading timetable...
    </div>

    <div v-else-if="weeks.length === 0" class="text-center py-10 text-gray-500">
      No schedule found.
    </div>

    <div v-else>
      <TimetableSection
        title="Morning"
        subtitle="7:00–11:00"
        period="morning"
        :days="days"
        :times="timesMorning"
        :getSlot="getSlot"
        :readOnly="true" />

      <TimetableSection
        className="mt-8"
        title="Afternoon"
        subtitle="13:00–17:00"
        period="afternoon"
        :days="days"
        :times="timesAfternoon"
        :getSlot="getSlot"
        :readOnly="true" />
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
const selectedWeek = ref("Weekly Schedule");
const groupedSchedule = ref({});

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timesMorning = ["7:00-8:00", "8:00-9:00", "9:00-10:00", "10:00-11:00"];
const timesAfternoon = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"];

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":");
  return `${parseInt(hour)}:${minute}`;
};

const getWeekLabel = (dateStr) => {
  if (!dateStr) return "Weekly Schedule"; 
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
  const monday = new Date(date.setDate(diff));
  return `Week of ${monday.toLocaleDateString('en-GB')}`; 
};

const getDayName = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const fetchSlots = async () => {
  loading.value = true;
  try {
    rawSlots.value = await TimeTableAPI.fetchTeacherTimeSlots();
    processSchedule(rawSlots.value);
  } catch (error) {
    console.error("Failed to load timetable", error);
  } finally {
    loading.value = false;
  }
};

const processSchedule = (slots) => {
  const result = {};

  slots.forEach(slot => {
    // 1. Parse time_slot if it's a string
    let timeSlotData = slot.time_slot;
    if (typeof timeSlotData === 'string') {
      try {
        timeSlotData = JSON.parse(timeSlotData);
      } catch (e) {
        console.error("Error parsing time_slot JSON:", e);
        return; // Skip invalid data
      }
    }

    if (!timeSlotData) return;

    // 2. Identify Week & Day
    const date = slot.time_slot_date || slot.date || timeSlotData.date;
    let weekLabel = "Weekly Schedule";
    let dayName = slot.day_of_week; 

    if (date) {
        weekLabel = getWeekLabel(date);
        dayName = getDayName(date);
    } 
    
    if (!dayName) return;

    // 3. Identify Time
    const startRaw = timeSlotData.start_time || slot.start_time;
    const endRaw = timeSlotData.end_time || slot.end_time;
    
    const start = formatTime(startRaw); 
    const end = formatTime(endRaw);
    
    if (!start || !end) return;

    const timeKey = `${start}-${end}`;

    // 4. Initialize structure
    if (!result[weekLabel]) result[weekLabel] = {};
    if (!result[weekLabel][dayName]) result[weekLabel][dayName] = {};

    // 5. Map Data
    result[weekLabel][dayName][timeKey] = {
        ...slot, 
        // Try subject.subject_name first based on your logs
        subject: slot.subject?.subject_name || slot.subject?.name || slot.subject_name || slot.remark || "N/A",
        // Try location.name first
        room: slot.location?.name || slot.classroom?.name || slot.room?.name || "N/A",
        teacher: slot.teacher?.name || slot.teacher_name || "N/A",
        group: slot.group?.name || slot.group_name || ""
    };
  });

  groupedSchedule.value = result;
  
  const keys = Object.keys(result);
  if (keys.length > 0) {
    selectedWeek.value = keys.includes("Weekly Schedule") ? "Weekly Schedule" : keys[0];
  }
};

const weeks = computed(() => Object.keys(groupedSchedule.value));

function getSlot(day, timeLabel) {
  const weekData = groupedSchedule.value[selectedWeek.value];
  if (!weekData || !weekData[day]) return undefined;

  // Fuzzy match: if "7:00-8:00" starts with "7:00"
  const foundKey = Object.keys(weekData[day]).find(key => {
      const [start] = key.split("-"); 
      return timeLabel.startsWith(start);
  });

  return foundKey ? weekData[day][foundKey] : undefined;
}

onMounted(() => {
  fetchSlots();
});
</script>