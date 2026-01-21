<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr class="text-xs uppercase text-gray-500">
            <th class="px-3 py-3 text-left font-medium">No.</th>
            <th class="px-3 py-3 text-left font-medium">User Name</th>
            <th class="px-3 py-3 text-left font-medium">Program</th>
            <th class="px-3 py-3 text-left font-medium">Academic Year</th>
            <th class="px-3 py-3 text-left font-medium">Generation</th>
            <th class="px-3 py-3 text-left font-medium">Year</th>
            <th class="px-3 py-3 text-left font-medium">Department</th>
            <th class="px-3 py-3 text-left font-medium">Groups</th>
            <th class="px-3 py-3 text-left font-medium">
              Actions
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                :indeterminate="isIndeterminate"
              />
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100 text-sm">
          <tr
            v-for="(row, index) in data"
            :key="row.id"
            class="hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50': selectedRowIndexes.includes(row.id) }"
          >
            <td class="px-3 py-3">{{ startIndex + index + 1 }}</td>
            <td class="px-3 py-3">{{ row.user?.name || 'N/A' }}</td>
            <td class="px-3 py-3">
              <span class="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                {{ row.program?.program_name || 'N/A' }}
              </span>
            </td>
            <td class="px-3 py-3">
              <span class="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium">
                {{ row.program?.academic_year || 'N/A' }}
              </span>
            </td>
            <td class="px-3 py-3">{{ row.generation?.number_gen || 'N/A' }}</td>
            <td class="px-3 py-3">
              <span class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                {{ row.year || 'N/A' }}
              </span>
            </td>
            <td class="px-3 py-3">
              <span class="inline-flex items-center px-2 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-medium">
                {{ row.program?.department_name || 'N/A' }}
              </span>
            </td>
            <td class="px-3 py-3">
              <div v-if="row.group && row.group.length">
                <span
                  v-for="grp in row.group"
                  :key="grp.id"
                  class="inline-flex items-center px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 text-xs font-medium mr-1 mb-1"
                >
                  {{ grp.name }} - {{ grp.sub_department?.name || 'N/A' }}
                </span>
              </div>
              <span v-else class="text-gray-400 text-xs">No groups</span>
            </td>
            <td class="px-3 py-3">
              <input
                type="checkbox"
                :checked="selectedRowIndexes.includes(row.id)"
                @change="$emit('select', row.id)"
              />
            </td>
          </tr>

          <tr v-if="loading">
            <td :colspan="9" class="px-3 py-12 text-center">
              <div class="flex flex-col items-center gap-2">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div class="text-sm text-gray-500">{{ loadingMessage }}</div>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && data.length === 0">
            <td :colspan="9" class="px-3 py-12 text-center text-gray-500">
              No user programs found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from "vue";

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selectedRowIndexes: { type: Array, default: () => [] },
  loadingMessage: { type: String, default: "Loading user programs..." },
  startIndex: { type: Number, default: 0 }
});

const emit = defineEmits(["select", "selectAll"]);

const isAllSelected = computed(() =>
  props.data.length > 0 && props.selectedRowIndexes.length === props.data.length
);

const isIndeterminate = computed(() =>
  props.selectedRowIndexes.length > 0 && props.selectedRowIndexes.length < props.data.length
);

const toggleSelectAll = () => {
  const allIds = props.data.map(row => row.id);
  emit("selectAll", isAllSelected.value ? [] : allIds);
};
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
