<template>
  <div
    class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-auto">
    <table class="w-full table-fixed border-collapse min-w-max">
      <!-- Header -->
      <thead class="sticky top-0 z-10 bg-gray-50 text-gray-900">
        <tr>
          <th
            class="sticky left-0 z-20 bg-gray-50 border-b border-r border-gray-200 w-36 py-4 px-2 text-center text-sm font-semibold"
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

      <!-- Body -->
      <tbody>
        <tr
          v-for="timeRange in times"
          :key="timeRange"
          class="group transition-colors">
          <!-- Time Column -->
          <td
            class="sticky left-0 z-10 px-2 py-3 text-center text-md font-semibold text-gray-700 whitespace-nowrap">
            {{ timeRange }}
          </td>

          <!-- Slots -->
          <td
            v-for="day in days"
            :key="day + timeRange"
            class="border-b border-gray-200 px-2 py-3 align-top bg-white">
            <div>
              <template v-if="resolveSlot(day, timeRange)">
                <button
                  type="button"
                  class="w-full h-32 text-left rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md hover:border-[#235AA6]/30 focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30"
                  @click="
                    emitEdit(day, timeRange, resolveSlot(day, timeRange))
                  ">
                  <!-- Top right: Course -->
                  <div class="flex justify-end">
                    <span
                      class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                      {{ resolveSlot(day, timeRange).type || "Course" }}
                    </span>
                  </div>

                  <!-- Center: Subject & Teacher -->
                  <div class="mt-2 text-center">
                    <div
                      class="text-sm font-extrabold text-gray-900 leading-tight">
                      {{ resolveSlot(day, timeRange).subject || "—" }}
                    </div>

                    <div class="mt-1 text-sm text-gray-600">
                      {{ resolveSlot(day, timeRange).teacher || "—" }}
                    </div>
                  </div>

                  <!-- Bottom right: Room -->
                  <div class="mt-2 flex justify-end">
                    <span
                      v-if="resolveSlot(day, timeRange).room"
                      class="inline-flex items-center bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 rounded">
                      {{ resolveSlot(day, timeRange).room }}
                    </span>
                  </div>
                </button>
              </template>

              <!-- Empty slot -->
              <button
                v-else
                type="button"
                class="w-full h-32 rounded-lg border border-dashed border-gray-200 text-gray-400 flex items-center justify-center text-sm hover:border-[#235AA6]/40 hover:text-[#235AA6] transition"></button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty state -->
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
  // accept both
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
