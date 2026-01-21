<template>
  <div class="rounded-lg border border-gray-300 overflow-auto">
    <table class="w-full table-fixed border-collapse min-w-max">
      <thead class="bg-gray-50 text-black">
        <tr>
          <th
            class="border border-gray-300 w-28 py-3 px-2 text-center font-semibold"
            scope="col">
            Time
          </th>
          <th
            v-for="d in days"
            :key="d"
            class="border border-gray-300 py-3 px-2 text-center font-semibold"
            scope="col">
            {{ d }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="timeRange in times"
          :key="timeRange"
          class="hover:bg-gray-50 transition-colors duration-200">
          <!-- Time Column -->
          <td
            class="border border-gray-300 px-2 py-3 text-center font-medium bg-gray-50 whitespace-nowrap">
            {{ timeRange }}
          </td>

          <!-- Slots for each day -->
          <td
            v-for="day in days"
            :key="day + timeRange"
            class="border border-gray-300 px-2 py-3 align-top bg-white">
            <template v-if="getSlot(day, timeRange)">
              <div class="flex flex-col items-center gap-1 text-center">
                <div class="relative left-0">
                  <span class="text-xs text-gray-700">
                    {{ getSlot(day, timeRange)!.type || "Course" }}
                  </span>
                </div>
                <span class="text-md font-bold text-black">
                  {{ getSlot(day, timeRange)!.subject }}
                </span>
                <span class="text-sm text-gray-800">
                  {{ getSlot(day, timeRange)!.teacher }}
                </span>
                <span class="text-xs text-red-500">
                  {{ getSlot(day, timeRange)!.room }}
                </span>
              </div>
            </template>

            <div v-else class="h-20"></div>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="times.length === 0 || days.length === 0"
      class="p-4 text-center text-gray-500">
      Pas d'emploi du temps disponible
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  days: string[];
  times: string[];
  slot: (
    day: string,
    time: string
  ) =>
    | {
        type?: string;
        subject: string;
        teacher?: string;
        room?: string;
      }
    | undefined;
}>();

const getSlot = (day: string, time: string) => props.slot(day, time);
</script>
