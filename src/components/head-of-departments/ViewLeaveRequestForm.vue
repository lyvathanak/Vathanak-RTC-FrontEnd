<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
    <!-- Modal -->
    <div
      class="relative w-full max-w-190 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
      <!-- Header (sticky) -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between border-b bg-white/90 px-6 py-4 backdrop-blur">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            View Leave Request
          </h2>
          <p class="text-sm text-gray-500">
            Submit your leave application for approval!
          </p>
        </div>

        <button
          @click="$emit('close')"
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 active:scale-95"
          aria-label="Close">
          ✕
        </button>
      </div>

      <!-- Body (scrollable) -->
      <div class="max-h-[75vh] overflow-y-auto px-6 py-6">
        <div class="space-y-6">
          <!-- Card: Personal Info -->
          <section
            class="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-semibold text-gray-900">
              Personal Info
            </h3>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  ID <span class="text-red-500">*</span>
                </label>
                <input
                  :value="leaveRequest.id_card"
                  type="text"
                  readonly
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  Full name <span class="text-red-500">*</span>
                </label>
                <input
                  :value="leaveRequest.latin_name"
                  type="text"
                  readonly
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm" />
              </div>
            </div>
          </section>

          <!-- Card: Leave Type -->
          <section
            class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <label class="block text-sm font-semibold text-gray-800">
              Leave Type <span class="text-red-500">*</span>
            </label>

            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div
                v-for="t in leaveTypes"
                :key="t.value"
                :class="[
                  'rounded-lg border px-3 py-2 text-center text-sm font-semibold transition',
                  normalizedType === t.value
                    ? 'border-[#235AA6] bg-[#235AA6] text-white shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600',
                ]">
                {{ t.label }}
              </div>
            </div>
          </section>

          <!-- Card: Dates -->
          <section
            class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-semibold text-gray-900">
              Leave Dates
            </h3>

            <div class="grid gap-4 sm:grid-cols-3">
              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  Start Date <span class="text-red-500">*</span>
                </label>
                <input
                  :value="leaveRequest.originalData?.start_date"
                  type="text"
                  readonly
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  End Date <span class="text-red-500">*</span>
                </label>
                <input
                  :value="leaveRequest.originalData?.end_date"
                  type="text"
                  readonly
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800"
                  >Total Days</label
                >
                <input
                  :value="leaveRequest.originalData?.total_days + ' days'"
                  type="text"
                  readonly
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm" />
              </div>
            </div>
          </section>

          <!-- Card: Reason -->
          <section
            class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-semibold text-gray-900">Details</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  Reason for Leave <span class="text-red-500">*</span>
                </label>
                <textarea
                  :value="leaveRequest.originalData?.reason"
                  readonly
                  class="mt-2 min-h-27.5 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm"></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800"
                  >Handover Details</label
                >
                <textarea
                  :value="
                    leaveRequest.originalData?.handover_detail ||
                    'No handover details provided'
                  "
                  readonly
                  class="mt-2 min-h-22.5 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm"></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  Emergency Contact Information
                  <span class="text-red-500">*</span>
                </label>
                <input
                  :value="leaveRequest.originalData?.emergency_contact"
                  type="text"
                  readonly
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm" />
              </div>
            </div>
          </section>

          <!-- Card: Document -->
          <section
            class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-semibold text-gray-900">
              Supporting Documents
            </h3>

            <div
              v-if="docPath"
              class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div
                class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#235AA6]/10">
                    <svg
                      class="h-5 w-5 text-[#235AA6]"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clip-rule="evenodd"></path>
                    </svg>
                  </div>

                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-gray-800">
                      {{ fileName }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Click preview to view the file.
                    </p>
                  </div>
                </div>

                <button
                  class="inline-flex items-center justify-center rounded-lg bg-[#235AA6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f4f93] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  @click="previewDocument"
                  :disabled="previewLoading">
                  {{ previewLoading ? "Loading…" : "Preview" }}
                </button>
              </div>

              <!-- Preview -->
              <div
                v-if="showPreview"
                class="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div
                  class="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                  <p class="text-sm font-semibold text-gray-800">Preview</p>
                  <button
                    class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                    @click="closePreview">
                    Close
                  </button>
                </div>

                <div class="p-4">
                  <UniversalFilePreview
                    v-if="publicDocUrl"
                    :src="publicDocUrl"
                    :filename="fileDisplayName"
                    :mime="''"
                    officeViewer="google"
                    height="70vh" />

                  <div v-else class="text-sm text-gray-600">
                    No inline preview available for {{ fileName }}.
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
              No supporting documents provided
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  approveLeaveRequest,
  rejectLeaveRequest,
} from "@/stores/apis/LeaveRequestManagement.js";
import { showNotification } from "@/lib/notifications.js";
import UniversalFilePreview from "@/components/features/UniversalFilePreview.vue";

// ---------- PUBLIC FILE URL BUILDER ----------
const FILE_ORIGIN = import.meta.env.VITE_FILE_ORIGIN;

const toPublicUrl = (docPath) => {
  if (!docPath) return null;
  if (/^https?:\/\//i.test(docPath)) return docPath; // already absolute
  const cleanPath = docPath.startsWith("/") ? docPath.substring(1) : docPath;
  return `${FILE_ORIGIN}/storage/${cleanPath}`;
};

// ---------- PROPS / EMITS ----------
const props = defineProps({
  leaveRequest: { type: Object, required: true },
});
const emit = defineEmits(["close", "updated"]);

// ---------- UI DATA ----------
const leaveTypes = [
  { value: "Annual", label: "Annual Leave" },
  { value: "Sick", label: "Sick Leave" },
  { value: "Personal", label: "Personal Leave" },
  { value: "Emergency", label: "Emergency" },
  { value: "Maternity", label: "Maternity" },
  { value: "Other", label: "Other" },
];

const normalizedType = computed(() => {
  const raw = (currentReq.value?.type || "").toString().trim().toLowerCase();
  if (!raw) return "";
  if (raw.includes("annual")) return "Annual";
  if (raw.includes("sick")) return "Sick";
  if (raw.includes("personal")) return "Personal";
  if (raw.includes("emergency")) return "Emergency";
  if (raw.includes("maternity")) return "Maternity";
  return "Other";
});

const remark = ref("");
const loading = ref(false);
const actionType = ref("");

// ---------- FILE / PREVIEW ----------
const currentReq = computed(
  () => props.leaveRequest?.originalData || props.leaveRequest
);
const docPath = computed(() => currentReq.value?.document || null);
const publicDocUrl = computed(() =>
  docPath.value ? toPublicUrl(docPath.value) : null
);
// console.log('📄 Document path:', publicDocUrl.value)
const fileDisplayName = computed(() =>
  docPath.value ? docPath.value.split("/").pop() : "Document"
);

const fileName = computed(() => fileDisplayName.value);

// ---------- STATUS CHECK ----------
const currentStatus = computed(() => {
  const status =
    currentReq.value?.status || props.leaveRequest?.status || "pending";
  return status.toLowerCase();
});

const isPending = computed(() => currentStatus.value === "pending");

const existingRemark = computed(() => {
  return (
    currentReq.value?.remark ||
    currentReq.value?.approval_notes ||
    currentReq.value?.admin_remark ||
    null
  );
});

const showPreview = ref(false);
const previewLoading = ref(false);

const previewDocument = () => {
  if (!docPath.value) {
    showNotification("This request has no uploaded document.", "error");
    return;
  }
  // We’re not fetching; UniversalFilePreview will render the public URL (Google viewer for Office/PDF)
  previewLoading.value = true;
  showPreview.value = true;
  previewLoading.value = false;
};

const closePreview = () => {
  showPreview.value = false;
};
</script>
