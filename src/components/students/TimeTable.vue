<template>
  <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-auto">
    <table class="w-full table-fixed border-collapse min-w-max">
      <thead class="sticky top-0 z-10 bg-gray-50 text-gray-900">
        <tr>
          <th class="sticky left-0 z-20 bg-gray-50 border-b border-r border-gray-200 w-36 py-4 px-2 text-center text-sm font-semibold" scope="col">
            Time
          </th>
          <th v-for="d in days" :key="d" class="border-b border-gray-200 py-3 px-3 text-center text-sm font-semibold" scope="col">
            {{ d }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="timeRange in times" :key="timeRange" class="group transition-colors">
          <td class="sticky left-0 z-10 px-2 py-3 text-center text-md font-semibold text-gray-700 whitespace-nowrap">
            {{ timeRange }}
          </td>

          <td v-for="day in days" :key="day + timeRange" class="border-b border-gray-200 px-2 py-3 align-top bg-white">
            <div>
              <template v-if="resolveSlot(day, timeRange)">
                <button
                  type="button"
                  class="w-full h-32 text-left rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md hover:border-[#235AA6]/30 focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30"
                  @click="emitEdit(day, timeRange, resolveSlot(day, timeRange))">
                  
                  <div class="flex justify-end">
                    <span class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                      {{ resolveSlot(day, timeRange).type || "Course" }}
                    </span>
                  </div>

                  <div class="mt-2 text-center">
                    <div class="text-sm font-extrabold text-gray-900 leading-tight">
                      {{ resolveSlot(day, timeRange).subject?.subject_name || resolveSlot(day, timeRange).subject || "—" }}
                    </div>
                    <div class="mt-1 text-sm text-gray-600">
                      {{ resolveSlot(day, timeRange).teacher?.name || resolveSlot(day, timeRange).teacher || "—" }}
                    </div>
                  </div>

                  <div class="mt-2 flex justify-end">
                    <span v-if="resolveSlot(day, timeRange).location || resolveSlot(day, timeRange).room" class="inline-flex items-center bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 rounded">
                      {{ resolveSlot(day, timeRange).location?.name || resolveSlot(day, timeRange).room }}
                    </span>
                  </div>
                </button>
              </template>

              <button
                v-else
                type="button"
                class="w-full h-32 rounded-lg border border-dashed border-gray-200 text-gray-400 flex items-center justify-center text-sm hover:border-[#235AA6]/40 hover:text-[#235AA6] transition">
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="loading" class="p-8 text-center text-gray-500">
        Loading timetable...
    </div>
    <div v-else-if="times.length === 0 || days.length === 0" class="p-8 text-center">
      <div class="text-gray-900 font-semibold">No timetable available</div>
      <div class="text-gray-500 text-sm mt-1">
        Please select a week or make sure days/times are provided.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TimeTableAPI from "@/stores/apis/TimeTableAPI"; // Adjust path as needed

const props = defineProps({
  days: { type: Array, required: true },
  times: { type: Array, required: true },
  slot: { type: Function, required: false },
  getSlot: { type: Function, required: false },
});

const emit = defineEmits(["edit"]);
const slots = ref([]);
const loading = ref(false);

const fetchSlots = async () => {
    loading.value = true;
    try {
        // Call the specific Student API endpoint
        slots.value = await TimeTableAPI.fetchStudentTimeSlots();
    } catch (e) {
        console.error("Failed to load student timetable", e);
    } finally {
        loading.value = false;
    }
}

const resolveSlot = (day, timeRange) => {
  // 1. Try finding in API data first
  if (slots.value.length > 0) {
      const match = slots.value.find(s => {
          // Check Day
          if (s.day_of_week !== day) return false;
          
          // Check Time (Loose matching: does the range string contain the start time?)
          const apiStart = s.time_slot?.start_time?.substring(0, 5); // "07:00"
          return apiStart && timeRange.includes(apiStart);
      });
      if (match) return match;
  }

  // 2. Fallback to props if no API match or no data
  const fn = props.getSlot || props.slot;
  return typeof fn === "function" ? fn(day, timeRange) : undefined;
};

const emitEdit = (day, time, data) => {
  emit("edit", { day, time, data });
};

onMounted(() => {
    fetchSlots();
});
</script>