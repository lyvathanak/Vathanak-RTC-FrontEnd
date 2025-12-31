<template>
  <ListTable
    :data="leaveRequests"
    :columns="columns"
    :loading="loading"
    :row-class="rowClass"
    :show-selection="false"
    :show-actions="false"
    :show-view-action="false"
    :show-edit-action="false"
    :show-delete-action="false"
    empty-state-title="No leave requests found"
    empty-state-message="There are no leave requests to display."
    loading-message="Loading leave requests..."
    @view="handleView">
    <!-- Name column slot with urgent alert -->
    <template #column-latin_name="{ row, value }">
      <div class="flex items-center gap-1">
        <span>{{ value }}</span>
        <AlertTriangle
          v-if="isUrgent(row)"
          class="w-5 h-5 text-red-500 urgent-alert"
          title="This leave request needs attention!" />
      </div>
    </template>

    <!-- Status badge slot -->
    <template #column-status="{ value }">
      <span :class="statusBadgeClass(value)">{{ value }}</span>
    </template>
    <!-- Action button slot -->
    <template #column-action="{ row }">
      <button
        @click="$emit('view', row)"
        class="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold bg-[#235AA6] text-white rounded-md hover:bg-[#1f4f93] focus:outline-none focus:ring-2 focus:ring-[#235AA6]/50 transition">
        View
      </button>
    </template>
  </ListTable>
</template>

<script setup>
import { ref } from "vue";
import { AlertTriangle } from "lucide-vue-next";
import ListTable from "@/components/features/ListTable.vue";

const props = defineProps({
  leaveRequests: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isUrgent: {
    type: Function,
    default: () => false,
  },
});

const emit = defineEmits(["view"]);

const columns = [
  { key: "id_card", label: "ID" },
  { key: "latin_name", label: "Name" },
  { key: "leaveType", label: "Leave Type" },
  { key: "submitDate", label: "Submit At" },
  {
    key: "status",
    label: "Status",
    type: "badge",
    badgeConfig: {
      classes: {
        Pending: "bg-orange-100 text-[#FF7700] border border-[#FF7700]",
        Approved: "bg-green-100 text-[#10B981] border border-[#10B981]",
        Rejected: "bg-red-100 text-[#FF4040] border border-[#FF4040]",
      },
    },
  },
  { key: "action", label: "Action" },
];

function handleView(row) {
  emit("view", row);
}

function statusBadgeClass(status) {
  switch (status) {
    case "Pending":
      return "inline-block px-4 py-1 rounded font-semibold bg-orange-100 text-[#FF7700] border border-orange-400";
    case "Approved":
      return "inline-block px-4 py-1 rounded font-semibold bg-green-100 text-[#10B981] border border-[#10B981]";
    case "Rejected":
      return "inline-block px-4 py-1 rounded font-semibold bg-red-100 text-[#FF4040] border border-[#FF4040]";
    default:
      return "inline-block px-4 py-1 rounded font-semibold bg-gray-100 text-gray-600 border border-gray-300";
  }
}

// Row class to highlight urgent requests
function rowClass(row) {
  if (isUrgent(row)) {
    return "bg-red-50 hover:bg-red-100"; // light red background for urgent
  }
  return "";
}
</script>
<style scoped>
@keyframes blink {
  0%,
  50%,
  100% {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0;
  }
}
.urgent-alert {
  animation: blink 1s infinite;
}
</style>
