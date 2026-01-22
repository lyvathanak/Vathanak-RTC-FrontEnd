<template>
  <div class="p-6">
    <div class="mb-8 flex justify-between items-center">
      <h1 :class="['text-3xl font-bold text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
        {{ t("time_table") || "Time Table" }}
      </h1>
      
      <div v-if="loading" class="text-gray-500 flex items-center gap-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        Loading...
      </div>
    </div>

    <div v-if="!loading && weeks.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-lg shadow p-8">
      <p class="text-lg">No schedule found for this semester.</p>
    </div>

    <TimetableOverview
      v-else
      :weeks="weeks"
      v-model:selectedWeek="selectedWeek"
      :days="days"
      :timesMorning="timesMorning"
      :timesAfternoon="timesAfternoon"
      :getSlot="getSlot" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import TimetableOverview from "@/components/students/timetable/TimetableOverview.vue";
import TimeTableAPI from "@/stores/apis/TimeTableAPI";

const { t, locale } = useI18n();

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timesMorning = ["7:00-8:00", "8:00-9:00", "9:00-10:00", "10:00-11:00"];
const timesAfternoon = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"];

const loading = ref(false);
const selectedWeek = ref("");
const groupedSchedule = ref({});

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

const fetchSchedule = async () => {
  loading.value = true;
  try {
    const slots = await TimeTableAPI.fetchStudentTimeSlots();
    
    const result = {};

    slots.forEach(slot => {
      // 1. Parse JSON string for time_slot
      let timeSlotData = slot.time_slot;
      if (typeof timeSlotData === 'string') {
        try {
          timeSlotData = JSON.parse(timeSlotData);
        } catch (e) {
          console.error("Error parsing student time_slot:", e);
          return;
        }
      }
      
      if (!timeSlotData) return;

      // 2. Date & Week
      const date = slot.time_slot_date || slot.date || timeSlotData.date; 
      let weekLabel = "Weekly Schedule";
      let dayName = slot.day_of_week;

      if (date) {
        weekLabel = getWeekLabel(date);
        dayName = getDayName(date);
      }
      if (!dayName) return;

      // 3. Time
      const startRaw = timeSlotData.start_time || slot.start_time;
      const endRaw = timeSlotData.end_time || slot.end_time;
      
      const start = formatTime(startRaw);
      const end = formatTime(endRaw);
      
      if (!start || !end) return;
      const timeKey = `${start}-${end}`;

      // 4. Init structure
      if (!result[weekLabel]) result[weekLabel] = {};
      if (!result[weekLabel][dayName]) result[weekLabel][dayName] = {};

      // 5. Map
      result[weekLabel][dayName][timeKey] = {
        subject: slot.subject?.subject_name || slot.subject?.name || slot.subject_name || slot.remark || "N/A",
        room: slot.location?.name || slot.classroom?.name || slot.room?.name || "N/A",
        teacher: slot.teacher?.name || slot.teacher_name || "N/A",
      };
    });

    groupedSchedule.value = result;
    
    const keys = Object.keys(result);
    if (keys.length > 0) {
      selectedWeek.value = keys.includes("Weekly Schedule") ? "Weekly Schedule" : keys[0];
    }

  } catch (error) {
    console.error("Failed to fetch timetable:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSchedule();
});

const weeks = computed(() => Object.keys(groupedSchedule.value));

const getSlot = (day, time) => {
  const weekData = groupedSchedule.value[selectedWeek.value];
  if (!weekData || !weekData[day]) return undefined;

  const foundKey = Object.keys(weekData[day]).find(key => {
      const [start] = key.split("-"); 
      return time.startsWith(start);
  });
  
  return foundKey ? weekData[day][foundKey] : undefined;
};
</script>