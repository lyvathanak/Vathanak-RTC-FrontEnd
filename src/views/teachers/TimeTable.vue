<template>
  <div class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <PageHeader
      :title="t('timetable_management') || 'My Timetable'"
      subtitle="View your weekly class schedule">
      <WeekSelector v-model="selectedWeek" :weeks="weeks" />
    </PageHeader>

    <div v-if="loading" class="text-center py-10 text-gray-500">
      Loading timetable...
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
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import WeekSelector from "@/components/teachers/timetable/WeekSelector.vue";
import TimetableSection from "@/components/teachers/timetable/TimetableSection.vue";
import PageHeader from "@/components/features/PageHeader.vue";
import TimeTableAPI from "@/stores/apis/TimeTableAPI"; 

const { t } = useI18n();

const loading = ref(false);
const slots = ref([]);
const selectedWeek = ref("Week 1");
const weeks = ref(["Week 1"]); // kept for UI consistency, can be expanded for date filtering

/** fixed labels */
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timesMorning = ["7:00-8:00", "8:00-9:00", "9:00-10:00", "10:00-11:00"];
const timesAfternoon = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"];

const fetchSlots = async () => {
  loading.value = true;
  try {
    slots.value = await TimeTableAPI.fetchTeacherTimeSlots();
  } catch (error) {
    console.error("Failed to load timetable", error);
  } finally {
    loading.value = false;
  }
};

/** * resolve slot from fetched API data 
 * Matches Day and Time string (e.g. "07:00-08:00" includes "07:00")
 */
function getSlot(day, timeLabel) {
  if (!slots.value.length) return undefined;

  return slots.value.find(slot => {
    if (slot.day_of_week !== day) return false;
    
    // Check if the time label contains the start time from API (e.g., "07:00")
    const apiStart = slot.time_slot?.start_time?.substring(0, 5); 
    if (timeLabel && apiStart) {
       return timeLabel.includes(apiStart);
    }
    return false;
  });
}

onMounted(() => {
  fetchSlots();
});
</script>