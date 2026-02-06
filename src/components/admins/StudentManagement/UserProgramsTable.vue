<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Head -->
        <thead class="bg-gray-50 sticky top-0 z-10">
          <tr class="text-xs uppercase tracking-wide text-gray-500">
            <th class="px-4 py-3 text-left font-semibold">No.</th>
            <th class="px-4 py-3 text-left font-semibold">User Name</th>
            <th class="px-4 py-3 text-left font-semibold">Program</th>
            <th class="px-4 py-3 text-left font-semibold">Academic Year</th>
            <th class="px-4 py-3 text-left font-semibold">Year</th>
            <th class="px-4 py-3 text-left font-semibold">Department</th>
            <th class="px-4 py-3 text-left font-semibold">Groups</th>

            <!-- Actions -->
            <th class="px-4 py-3 text-left font-semibold">
              <div class="flex items-center justify-between gap-3">
                <span>Actions</span>

                <label
                  class="inline-flex items-center gap-2 text-[11px] normal-case text-gray-600">
                  <input
                    ref="selectAllRef"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    aria-label="Select all rows" />
                  <span>Select all</span>
                </label>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="divide-y divide-gray-100 text-sm">
          <tr
            v-for="(row, index) in data"
            :key="row.id"
            class="transition-colors hover:bg-gray-50"
            :class="isSelected(row.id) ? 'bg-blue-50/60' : ''">
            <td class="px-4 py-3 whitespace-nowrap text-gray-700">
              {{ startIndex + index + 1 }}
            </td>

            <td class="px-4 py-3 min-w-45">
              <div class="font-medium text-gray-900 truncate">
                {{ row.user?.name || "N/A" }}
              </div>
            </td>

            <td class="px-4 py-3 min-w-47.5">
              <span :class="pill('purple')">
                {{ row.program?.program_name || "N/A" }}
              </span>
            </td>

            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="pill('green')">
                {{ row.program?.academic_year || "N/A" }}
              </span>
            </td>

            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="pill('blue')"> Year {{ row.year || "N/A" }} </span>
            </td>

            <td class="px-4 py-3 min-w-47.5">
              <span :class="pill('teal')">
                {{
                  row?.program?.department?.department_name ||
                  row?.program?.department_name ||
                  row?.department?.department_name ||
                  row?.department_name ||
                  "N/A"
                }}
              </span>
            </td>

            <td class="px-4 py-3 min-w-65">
              <div v-if="row.group?.length" class="flex flex-wrap gap-2">
                <span
                  v-for="grp in row.group"
                  :key="grp.id"
                  :title="`${grp.name} - ${grp.sub_department?.name || 'N/A'}`"
                  :class="pill('yellow')">
                  {{ grp.name }} - {{ grp.sub_department?.name || "N/A" }}
                </span>
              </div>
              <span v-else class="text-xs text-gray-400">No groups</span>
            </td>

            <td class="px-4 py-3">
              <label class="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600"
                  :checked="isSelected(row.id)"
                  @change="emit('select', row.id)"
                  :aria-label="`Select row ${startIndex + index + 1}`" />
                <span class="sr-only">Select</span>
              </label>
            </td>
          </tr>

          <!-- Loading -->
          <tr v-if="loading">
            <td :colspan="9" class="px-4 py-14 text-center">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
                <div class="text-sm text-gray-500">{{ loadingMessage }}</div>
              </div>
            </td>
          </tr>

          <!-- Empty -->
          <tr v-else-if="data.length === 0">
            <td :colspan="9" class="px-4 py-14 text-center">
              <div class="text-sm font-medium text-gray-600">
                No user programs found
              </div>
              <div class="mt-1 text-xs text-gray-400">
                Try changing filters or refresh the page.
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref, watch } from "vue";

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selectedRowIndexes: { type: Array, default: () => [] }, // array of row.id
  loadingMessage: { type: String, default: "Loading user programs..." },
  startIndex: { type: Number, default: 0 },
});

const emit = defineEmits(["select", "selectAll"]);

/** -------- Selection logic (robust) -------- */
const rowIdsOnPage = computed(() =>
  props.data.map((r) => r?.id).filter(Boolean),
);

const selectedOnPageCount = computed(() => {
  const selected = new Set(props.selectedRowIndexes);
  return rowIdsOnPage.value.reduce(
    (acc, id) => acc + (selected.has(id) ? 1 : 0),
    0,
  );
});

const isAllSelected = computed(() => {
  return (
    rowIdsOnPage.value.length > 0 &&
    selectedOnPageCount.value === rowIdsOnPage.value.length
  );
});

const isIndeterminate = computed(() => {
  return (
    selectedOnPageCount.value > 0 &&
    selectedOnPageCount.value < rowIdsOnPage.value.length
  );
});

const isSelected = (id) => props.selectedRowIndexes.includes(id);

const toggleSelectAll = () => {
  emit("selectAll", isAllSelected.value ? [] : rowIdsOnPage.value);
};

/** Vue doesn't support indeterminate via attribute reliably -> set property */
const selectAllRef = ref(null);
watch(
  isIndeterminate,
  (val) => {
    if (selectAllRef.value) selectAllRef.value.indeterminate = val;
  },
  { immediate: true },
);

/** -------- UI helpers -------- */
const pill = (tone) => {
  const base =
    "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset whitespace-nowrap";

  const tones = {
    purple: "bg-purple-50 text-purple-700 ring-purple-200",
    green: "bg-green-50 text-green-700 ring-green-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    teal: "bg-teal-50 text-teal-700 ring-teal-200",
    yellow: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  };

  return `${base} ${tones[tone] || "bg-gray-50 text-gray-700 ring-gray-200"}`;
};
</script>
