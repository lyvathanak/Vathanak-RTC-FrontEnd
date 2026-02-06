<template>
  <div class="overflow-x-auto">
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900">CV Submissions</h3>
        <p class="text-gray-600 text-sm mt-1">Manage all submitted CVs</p>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="$emit('toggle-select-all')"
                  class="h-4 w-4 text-[#235AA6] border-gray-300 rounded focus:ring-[#235AA6]0" />
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted By
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted Date
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="cv in cvs" :key="cv.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :checked="isSelected(cv.id)"
                  @change="$emit('toggle-select', cv)"
                  class="h-4 w-4 text-[#235AA6] border-gray-300 rounded focus:ring-[#235AA6]" />
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  #{{ cv.id }}
                </div>
              </td>

              <!-- Submitted By -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3 min-w-0">
                  <!-- avatar initials -->
                  <div
                    class="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 flex items-center justify-center font-bold text-xs shrink-0">
                    {{ getInitials(cv.user_name) }}
                  </div>

                  <div class="min-w-0">
                    <div class="font-semibold text-gray-900 truncate">
                      {{ cv.user_name || "N/A" }}
                    </div>
                    <div class="text-xs text-gray-500 mt-0.5">
                      {{ cv.role || "Submitted by" }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ cv.template_name }}
                </div>
                <div
                  v-if="cv.template_description"
                  class="text-xs text-gray-500 truncate max-w-xs">
                  {{ cv.template_description }}
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-800 shadow-sm">
                  {{ formatSubmittedDate(cv.submitted_date) }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-3 py-1.5 text-xs rounded-full font-semibold whitespace-nowrap inline-block min-w-25 text-center',
                    statusClass(cv.status),
                  ]">
                  {{ statusLabel(cv.status) }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <!-- View -->
                  <button
                    @click="$emit('view', cv)"
                    title="View"
                    class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
                    <Eye class="size-4" />
                  </button>

                  <!-- Edit -->
                  <button
                    @click="$emit('edit', cv)"
                    title="Edit"
                    class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition">
                    <Pencil class="size-4" />
                  </button>

                  <!-- Approve -->
                  <button
                    v-if="isPending(cv.status)"
                    @click="askConfirm('approve', cv)"
                    title="Approve"
                    class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition">
                    <CheckCircle class="size-4" />
                  </button>

                  <!-- Reject -->
                  <button
                    v-if="isPending(cv.status)"
                    @click="askConfirm('reject', cv)"
                    title="Reject"
                    class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition">
                    <X class="size-4" />
                  </button>

                  <!-- Export -->
                  <button
                    v-if="!isPending(cv.status)"
                    @click="askConfirm('export', cv)"
                    title="Export"
                    class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition">
                    <Download class="size-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="cvs.length === 0 && !loading">
              <td colspan="7" class="px-6 py-12 text-center">
                <FileText class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 class="text-lg font-medium text-gray-900 mb-2">
                  No CV Submissions
                </h4>
                <p class="text-gray-600 mb-4">
                  No CVs have been submitted yet.
                </p>
                <button
                  @click="$emit('create-test')"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-[#235AA6] text-white rounded-lg hover:bg-[#1f4f93]">
                  <Plus class="w-4 h-4" />
                  Create Test Submission
                </button>
              </td>
            </tr>

            <tr v-if="loading">
              <td colspan="7" class="px-6 py-12 text-center">
                <div class="flex justify-center">
                  <div
                    class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#235AA6]"></div>
                </div>
                <p class="text-gray-600 mt-2">Loading submissions...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <ConfirmDialog
    :open="confirm.open"
    :title="confirm.title"
    :message="confirm.message"
    :type="confirm.type"
    :confirmText="confirm.confirmText"
    :cancelText="confirm.cancelText"
    :icon="confirm.icon"
    :loading="confirm.loading"
    @close="closeConfirm"
    @confirm="confirmYes" />
</template>

<script setup>
import { computed, ref } from "vue";
import {
  FileText,
  User,
  Plus,
  Eye,
  CheckCircle,
  X,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  DownloadCloud,
  Pencil,
} from "lucide-vue-next";
import ConfirmDialog from "@/components/features/ConfirmDialog.vue";

const props = defineProps({
  cvs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  allSelected: { type: Boolean, default: false },

  // ✅ cleaner: pass only selected ids
  selectedIds: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "toggle-select-all",
  "toggle-select",
  "view",
  "edit",
  "approve",
  "reject",
  "export",
  "create-test",
]);

const isSelected = (id) => props.selectedIds.includes(id);

const formatSubmittedDate = (dateString) => {
  if (!dateString) return "N/A";

  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "N/A";

  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(d);

  const get = (type) => parts.find((p) => p.type === type)?.value || "";

  return `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get(
    "minute",
  )} ${get("dayPeriod")}`;
};

const normalizeStatus = (status) =>
  String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const isPending = (status) => normalizeStatus(status) === "pending";

const statusLabel = (status) => {
  const s = normalizeStatus(status);
  const labels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    under_review: "Under Review",
  };
  return labels[s] || "Unknown";
};

const statusClass = (status) => {
  const s = normalizeStatus(status);
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    under_review: "bg-blue-100 text-blue-800",
  };
  return classes[s] || "bg-gray-100 text-gray-800";
};

const getInitials = (name) => {
  const s = String(name ?? "").trim();
  if (!s) return "NA";

  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
};

const confirm = ref({
  open: false,
  action: "", // approve | reject | export
  payload: null, // store cv object
  title: "",
  message: "",
  type: "warning",
  confirmText: "Confirm",
  cancelText: "Cancel",
  icon: AlertTriangle,
  loading: false,
});

const askConfirm = (action, cv) => {
  confirm.value.open = true;
  confirm.value.action = action;
  confirm.value.payload = cv;
  confirm.value.loading = false;

  if (action === "approve") {
    confirm.value.title = "Approve this CV?";
    confirm.value.message = `Are you sure you want to approve CV #${cv.id}?`;
    confirm.value.type = "success";
    confirm.value.confirmText = "Yes, Approve";
    confirm.value.cancelText = "Cancel";
    confirm.value.icon = CheckCircle2;
  } else if (action === "reject") {
    confirm.value.title = "Reject this CV?";
    confirm.value.message = `Are you sure you want to reject CV #${cv.id}?`;
    confirm.value.type = "danger";
    confirm.value.confirmText = "Yes, Reject";
    confirm.value.cancelText = "Cancel";
    confirm.value.icon = XCircle;
  } else {
    confirm.value.title = "Export this CV?";
    confirm.value.message = `Export CV #${cv.id} now?`;
    confirm.value.type = "info";
    confirm.value.confirmText = "Yes, Export";
    confirm.value.cancelText = "Cancel";
    confirm.value.icon = DownloadCloud;
  }
};

const closeConfirm = () => {
  confirm.value.open = false;
  confirm.value.action = "";
  confirm.value.payload = null;
  confirm.value.loading = false;
};

const confirmYes = () => {
  const cv = confirm.value.payload;
  if (!cv) return;

  // If you want loading UI while parent does async, you can keep it true until parent updates
  // confirm.value.loading = true;

  if (confirm.value.action === "approve") {
    // emit approve id
    // IMPORTANT: keep same event name as before
    emit("approve", cv.id);
  } else if (confirm.value.action === "reject") {
    emit("reject", cv.id);
  } else if (confirm.value.action === "export") {
    emit("export", cv);
  }

  closeConfirm();
};
</script>
