<template>
  <div
    class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-auto">
    <table class="w-full table-fixed border-collapse min-w-max">
      <thead class="sticky top-0 z-10 bg-gray-50 text-gray-900">
        <tr>
          <th
            class="sticky left-0 z-20 bg-gray-50 border-b border-r border-gray-200 w-28 py-3 px-2 text-center text-sm font-semibold"
            scope="col">
            Time
          </th>

          <th
            v-for="d in days"
            :key="d"
            class="border-b border-gray-200 py-3 px-3 text-center text-sm font-semibold"
            scope="col">
            {{ d }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="timeRange in times" :key="timeRange">
          <td
            class="sticky left-0 z-10 bg-gray-50 border-b border-r border-gray-200 w-28 py-3 px-2 text-center text-sm font-semibold text-gray-700">
            {{ timeRange }}
          </td>

          <TimetableCell
            v-for="day in days"
            :key="day + timeRange"
            :data="getSlot(day, timeRange)"
            :readOnly="readOnly"
            @edit="$emit('edit', { day, time: timeRange })" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import TimetableCell from "@/components/teachers/timetable/TimetableCell.vue";

defineProps({
  days: Array,
  times: Array,
  getSlot: Function,
  readOnly: { type: Boolean, default: false },
});

defineEmits(["edit"]);
</script>
