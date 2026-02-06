<template>
  <div class="w-full">
    <!-- Morning -->
    <section class="mt-6">
      <div
        class="mb-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 ring-1 ring-yellow-100">
            <Sun class="h-5 w-5 text-yellow-600" />
          </div>

          <div class="flex flex-col">
            <h3 class="text-lg font-extrabold text-gray-900">Morning Shift</h3>
            <p class="text-sm text-gray-500">7:00–11:00</p>
          </div>
        </div>

        <span
          class="hidden sm:inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 ring-1 ring-yellow-100">
          AM
        </span>
      </div>

      <TimeTable :days="days" :times="timesMorning" :getSlot="getSlot" />
    </section>

    <!-- Afternoon -->
    <section class="mt-8">
      <div
        class="mb-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
            <SunMoon class="h-5 w-5 text-blue-700" />
          </div>

          <div class="flex flex-col">
            <h3 class="text-lg font-extrabold text-gray-900">
              Afternoon Shift
            </h3>
            <p class="text-sm text-gray-500">13:00–17:00</p>
          </div>
        </div>

        <span
          class="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
          PM
        </span>
      </div>

      <TimeTable :days="days" :times="timesAfternoon" :getSlot="getSlot" />
    </section>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { Sun, SunMoon } from "lucide-vue-next";
import TimeTable from "@/components/students/timetable/TimeTable.vue";


const { t } = useI18n();

defineProps({
  weeks: { type: Array, default: () => [] },
  selectedWeek: { type: String, default: "" },
  days: { type: Array, default: () => [] },
  timesMorning: { type: Array, default: () => [] },
  timesAfternoon: { type: Array, default: () => [] },
  getSlot: { type: Function, required: true },
});

defineEmits(["update:selectedWeek"]);
</script>
