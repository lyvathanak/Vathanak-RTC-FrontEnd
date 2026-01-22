<template>
  <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-auto">
    <table class="min-w-[900px] w-full table-fixed border-collapse">
      <thead class="sticky top-0 z-10 bg-gray-50 text-gray-900">
        <tr>
          <th
            class="sticky left-0 z-20 bg-gray-50 border-b border-r border-gray-200 w-36 py-4 px-2 text-center text-sm font-bold uppercase tracking-wider"
            scope="col">
            Time
          </th>

          <th
            v-for="d in days"
            :key="d"
            class="border-b border-gray-200 py-4 px-2 text-center text-sm font-bold uppercase tracking-wider text-gray-600"
            scope="col">
            {{ d }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="timeRange in times"
          :key="timeRange"
          class="hover:bg-gray-50/50 transition-colors">
          
          <td
            class="sticky left-0 z-10 w-36 p-4 text-center text-sm font-bold text-gray-500 border-r border-b border-gray-100 bg-gray-50/90 whitespace-nowrap">
            {{ timeRange }}
          </td>

          <td
            v-for="day in days"
            :key="day + timeRange"
            class="border-b border-r border-gray-100 p-2 align-top h-36 bg-white">
            <div class="w-full h-full">
              <template v-if="resolveSlot(day, timeRange)">
                <button
                  type="button"
                  class="w-full h-full flex flex-col justify-between text-left rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition hover:shadow-md hover:border-[#235AA6]/50 focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30 group"
                  @click="emitEdit(day, timeRange, resolveSlot(day, timeRange))">
                  
                  <div class="flex justify-end">
                    <span
                      class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                      {{ resolveSlot(day, timeRange).type || "Course" }}
                    </span>
                  </div>

                  <div class="text-center w-full">
                    <div
                      class="text-sm font-extrabold text-gray-900 leading-tight line-clamp-2"
                      :title="resolveSlot(day, timeRange).subject">
                      {{ resolveSlot(day, timeRange).subject || "—" }}
                    </div>

                    <div class="mt-1 text-xs font-medium text-gray-500 truncate">
                      {{ resolveSlot(day, timeRange).teacher || "—" }}
                    </div>
                  </div>

                  <div class="flex justify-end mt-1">
                    <span
                      v-if="resolveSlot(day, timeRange).room"
                      class="inline-flex items-center bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 rounded border border-red-100">
                      {{ resolveSlot(day, timeRange).room }}
                    </span>
                  </div>
                </button>
              </template>

              <div
                v-else
                class="w-full h-full rounded-lg border border-dashed border-gray-200 bg-gray-50/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                 <span class="text-xs text-gray-300 font-medium">Free</span>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="times.length === 0 || days.length === 0" class="p-8 text-center">
      <div class="text-gray-900 font-semibold">No timetable available</div>
      <div class="text-gray-500 text-sm mt-1">
        Please select a week or make sure days/times are provided.
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  days: { type: Array, required: true },
  times: { type: Array, required: true },
  slot: { type: Function, required: false },
  getSlot: { type: Function, required: false },
});

const emit = defineEmits(["edit"]);

const resolveSlot = (day, time) => {
  const fn = props.getSlot || props.slot;
  return typeof fn === "function" ? fn(day, time) : undefined;
};

const emitEdit = (day, time, data) => {
  emit("edit", { day, time, data });
};
</script>