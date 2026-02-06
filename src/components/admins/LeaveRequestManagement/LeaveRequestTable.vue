<template>
  <ListTable
    :data="leaveRequests"
    :columns="columns"
    :loading="loading"
    :row-class="rowClass"
    row-key="row_id"
    :show-selection="false"
    :show-actions="false"
    :show-view-action="false"
    :show-edit-action="false"
    :show-delete-action="false"
    empty-state-title="No leave requests found"
    empty-state-message="There are no leave requests to display."
    loading-message="Loading leave requests..."
    @view="handleView">
    <!-- ID (chip like teacher table) -->
    <template #column-id_card="{ value }">
      <span class="font-semibold text-gray-900 tracking-wide">
        {{ value || "N/A" }}
      </span>
    </template>
    <!-- Name (avatar + 2 lines + urgent pill) -->
    <template #column-latin_name="{ row, value }">
      <div class="flex items-center gap-3 min-w-55">
        <!-- Avatar -->
        <div
          class="h-9 w-9 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 flex items-center justify-center text-xs font-extrabold shrink-0"
          :title="value">
          {{ initials(value) }}
        </div>

        <!-- Text -->
        <div class="min-w-0">
          <div class="flex items-center gap-2 min-w-0">
            <span class="truncate font-bold text-gray-900">
              {{ value || "-" }}
            </span>

            <!-- Urgent (no icon, clean pill) -->
            <span
              v-if="isUrgent(row)"
              class="inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 ring-1 ring-red-200 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
              title="This leave request needs attention!">
              <span
                class="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
              Urgent
            </span>
          </div>

          <!-- small sub text (like teacher table) -->
          <div class="truncate text-xs text-gray-500">Leave request</div>
        </div>
      </div>
    </template>

    <!-- Leave Type (soft text) -->
    <template #column-leaveType="{ value }">
      <span class="text-sm font-semibold text-gray-700">
        {{ value || "-" }}
      </span>
    </template>

    <!-- Submit date (DD Mon YYYY, HH:mm) -->
    <template #column-submitDate="{ value }">
      <span
        class="inline-flex items-center rounded-full bg-gray-50 text-gray-700 ring-1 ring-gray-200 px-3 py-1 text-xs font-semibold whitespace-nowrap">
        {{ formatDateTime(value) }}
      </span>
    </template>

    <!-- Status pill (rounded-full like teacher UI) -->
    <template #column-status="{ value }">
      <span
        :class="[
          'px-3 py-1.5 text-xs rounded-full font-semibold whitespace-nowrap inline-block min-w-25 text-center',
          statusBadgeClass(value),
        ]">
        {{ value || "Unknown" }}
      </span>
    </template>

    <!-- Action button (same style as teacher table) -->
    <template #column-action="{ row }">
      <button
        type="button"
        @click="$emit('view', row)"
        class="inline-flex items-center justify-center rounded-lg bg-[#235AA6] px-3 py-1.5 text-sm font-semibold text-white whitespace-nowrap hover:bg-[#1f4f93] active:bg-[#1a427b] focus:outline-none focus:ring-2 focus:ring-[#235AA6]/40 focus:ring-offset-2 transition">
        View
      </button>
    </template>
  </ListTable>
</template>

<script setup>
import ListTable from "@/components/features/ListTable.vue";

const props = defineProps({
  leaveRequests: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  isUrgent: { type: Function, default: () => false },
});

const emit = defineEmits(["view"]);

const columns = [
  { key: "id_card", label: "ID" },
  { key: "latin_name", label: "Name" },
  { key: "leaveType", label: "Leave Type" },
  { key: "submitDate", label: "Submit At" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action" },
];

function handleView(row) {
  emit("view", row);
}

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "NA";
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

function statusBadgeClass(status) {
  const base =
    "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold ring-1 whitespace-nowrap";

  switch (status) {
    case "Pending":
      return `${base} bg-orange-50 text-orange-700 ring-orange-200`;
    case "Approved":
      return `${base} bg-green-50 text-green-700 ring-green-200`;
    case "Rejected":
      return `${base} bg-red-50 text-red-700 ring-red-200`;
    default:
      return `${base} bg-gray-50 text-gray-700 ring-gray-200`;
  }
}

/** Teacher-style urgent highlight: subtle left border, not full red row */
function rowClass(row) {
  if (props.isUrgent(row)) {
    return "bg-red-50/40 hover:bg-red-50 border-l-4 border-red-400";
  }
  return "hover:bg-gray-50";
}

function formatDateTime(input) {
  const d = parseAnyDate(input);
  if (!d) return "-";

  const datePart = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timePart = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 👈 AM / PM
  });

  return `${datePart}, ${timePart}`;
}

/**
 * Supports ISO / timestamps / "dd-mm-yyyy HH:mm:ss" / "dd/mm/yyyy" etc.
 */
function parseAnyDate(input) {
  if (!input) return null;

  if (input instanceof Date && !isNaN(input.getTime())) return input;

  const s = String(input).trim();
  if (!s) return null;

  // timestamp (seconds or ms)
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    const ms = s.length <= 10 ? n * 1000 : n;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  // dd-mm-yyyy or dd-mm-yyyy HH:mm:ss  (Laravel common)
  const m1 = s.match(
    /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (m1) {
    const dd = Number(m1[1]);
    const mm = Number(m1[2]) - 1;
    const yyyy = Number(m1[3]);
    const hh = Number(m1[4] ?? 0);
    const mi = Number(m1[5] ?? 0);
    const ss = Number(m1[6] ?? 0);

    const d = new Date(yyyy, mm, dd, hh, mi, ss);
    return isNaN(d.getTime()) ? null : d;
  }

  // ISO or "01 Dec 2026"
  const d2 = new Date(s);
  if (!isNaN(d2.getTime())) return d2;

  return null;
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
