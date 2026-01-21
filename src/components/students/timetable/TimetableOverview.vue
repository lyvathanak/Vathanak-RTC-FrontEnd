<template>
  <div>
    <!-- Header + Week Selector -->
    <div
      class="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
      <!-- Title -->
      <div class="flex items-center gap-2">
        <CalendarDaysIcon class="w-6 h-6 sm:w-7 sm:h-7 text-[#235AA6]" />
        <h1
          :class="[
            'text-lg sm:text-xl md:text-2xl font-bold text-[#235AA6]',
            locale === 'kh' ? 'khmer-text' : '',
          ]">
          {{ t("timetable_management") }}
        </h1>
      </div>

      <!-- Week Selector -->
      <div class="relative w-full sm:w-auto">
        <span class="text-sm font-semibold text-gray-600 mr-2.5">Week</span>
        <select
          :value="selectedWeek"
          @change="$emit('update:selectedWeek', $event.target.value)"
          class="w-full sm:w-auto appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-9 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          aria-label="Select Week">
          <option v-for="w in weeks" :key="w" :value="w">{{ w }}</option>
        </select>

        <span
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black">
          ▾
        </span>
      </div>
    </div>

    <!-- Morning -->
    <div
      class="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
        <Sun class="h-4 w-4 text-yellow-500" />
      </div>
      <h3 class="text-lg font-extrabold text-gray-900">Morning Shift</h3>
    </div>

    <TimeTable
      :days="days"
      :times="timesMorning"
      :getSlot="getSlot"
      class="mb-10" />

    <!-- Afternoon -->
    <div
      class="mb-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
        <SunMoon class="h-4 w-4 text-blue-600" />
      </div>
      <h3 class="text-lg font-extrabold text-gray-900">Afternoon Shift</h3>
    </div>

    <TimeTable :days="days" :times="timesAfternoon" :getSlot="getSlot" />
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { CalendarDaysIcon, Sun, SunMoon } from "lucide-vue-next";
import TimeTable from "@/components/students/timetable/TimeTable.vue";

const { t, locale } = useI18n();

defineProps({
  weeks: { type: Array, default: () => [] },
  selectedWeek: { type: String, default: "" },

  days: { type: Array, default: () => [] },
  timesMorning: { type: Array, default: () => [] },
  timesAfternoon: { type: Array, default: () => [] },

  getSlot: { type: Function, required: true }, // slot(day, time)
});

defineEmits(["update:selectedWeek"]);
</script>
