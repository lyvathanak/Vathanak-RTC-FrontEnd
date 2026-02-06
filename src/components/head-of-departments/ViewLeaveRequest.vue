<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
    @click.self="emit('close')">
    <!-- Modal -->
    <div
      class="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
      <!-- Header (sticky) -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between border-b bg-white/90 px-6 py-4 backdrop-blur">
        <div>
          <div class="flex items-center gap-3 min-w-0 flex-wrap">
            <h3
              :class="[
                'text-base sm:text-lg font-bold text-gray-900 truncate',
                locale === 'kh' ? 'khmer-text' : '',
              ]">
              {{ t("leave_requests") }}
            </h3>

            <span
              class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-[#235AA6] ring-1 ring-inset ring-blue-200"
              :class="[locale === 'kh' ? 'khmer-text' : '']">
              {{ t("view_leave_request") }}
            </span>
          </div>

          <p class="text-sm text-gray-500">
            Submit your leave application for approval!
          </p>
        </div>

        <button
          @click="emit('close')"
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 active:scale-95"
          aria-label="Close">
          ✕
        </button>
      </div>

      <!-- Body (scrollable) -->
      <div class="max-h-[75vh] overflow-y-auto px-6 py-6 sm:px-10">
        <div class="space-y-6">
          <!-- Card: Personal Info -->
          <section
            class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-semibold text-gray-900">
              Personal Info
            </h3>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  ID <span class="text-red-500">*</span>
                </label>
                <input
                  :value="displayIdCard"
                  type="text"
                  readonly
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  Full name <span class="text-red-500">*</span>
                </label>
                <input
                  :value="displayName"
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
                v-for="lt in leaveTypes"
                :key="lt.value"
                :class="[
                  'rounded-lg border px-3 py-2 text-center text-sm font-semibold transition',
                  normalizedType === lt.value
                    ? 'border-[#235AA6] bg-[#235AA6] text-white shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600',
                ]">
                {{ lt.label }}
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
                  :value="formatDMY(currentReq.start_date)"
                  type="text"
                  readonly
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  End Date <span class="text-red-500">*</span>
                </label>
                <input
                  :value="formatDMY(currentReq.end_date)"
                  type="text"
                  readonly
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800"
                  >Total Days</label
                >
                <input
                  :value="totalDaysText"
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
                  :value="currentReq.reason || ''"
                  readonly
                  class="mt-2 min-h-27.5 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm"></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800"
                  >Handover Details</label
                >
                <textarea
                  :value="
                    currentReq.handover_detail || 'No handover details provided'
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
                  :value="currentReq.emergency_contact || ''"
                  type="text"
                  readonly
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm" />
              </div>
            </div>
          </section>

          <!-- Remark input (pending only) -->
          <section
            v-if="isPending"
            class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-semibold text-gray-900">
              Head of Department Action
            </h3>

            <div>
              <label class="block text-sm font-semibold text-gray-800"
                >Remark</label
              >
              <textarea
                v-model="remark"
                placeholder="Reason for Reject..."
                class="mt-2 min-h-22.5 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-sm outline-none focus:border-[#235AA6] focus:ring-4 focus:ring-[#235AA6]/15"></textarea>
            </div>
          </section>

          <section
            v-else-if="existingRemark"
            class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-semibold text-gray-900">
              Head of Department Remark
            </h3>
            <textarea
              :value="existingRemark"
              readonly
              class="min-h-22.5 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm"></textarea>
          </section>
        </div>
      </div>

      <!-- Footer (sticky) -->
      <div
        class="sticky bottom-0 border-t border-black/10 bg-white/90 backdrop-blur">
        <div class="px-6 py-4 sm:px-10">
          <div
            v-if="isPending"
            class="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              @click="handleReject"
              :disabled="loading || !remark || !remark.trim()"
              class="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {{
                loading && actionType === "reject" ? "Rejecting..." : "Reject"
              }}
            </button>

            <button
              @click="handleApprove"
              :disabled="loading"
              class="inline-flex items-center justify-center rounded-lg bg-[#235AA6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f4f93] disabled:opacity-50 disabled:cursor-not-allowed">
              {{
                loading && actionType === "approve" ? "Approving..." : "Approve"
              }}
            </button>
          </div>

          <div v-else class="flex items-center justify-between">
            <p class="text-sm text-gray-600">
              This request has been processed.
            </p>

            <span
              :class="[
                'rounded-lg px-4 py-2 text-sm font-semibold',
                currentStatus === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]">
              {{ currentStatus === "approved" ? "Approved" : "Rejected" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useHodLeaveRequestStore } from "@/stores/HeadOfDepartment/hodLeaveRequest.js";
import { showNotification } from "@/lib/notifications.js";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const store = useHodLeaveRequestStore();

const props = defineProps({
  leaveRequest: { type: Object, required: true },
});
const emit = defineEmits(["close", "updated"]);

// local reactive copy
const req = ref({});

watch(
  () => props.leaveRequest,
  (val) => {
    const raw = val?.originalData ? val.originalData : val;
    req.value = raw ? { ...raw } : {};
  },
  { immediate: true, deep: true },
);

const currentReq = computed(() => req.value);

// --- Display helpers (fix empty ID / name) ---
const displayIdCard = computed(() => {
  const r = currentReq.value;
  return (
    r?.id_card ||
    r?.user?.userDetail?.id_card ||
    r?.user?.user_detail?.id_card ||
    r?.user_detail?.id_card ||
    r?.user?.id_card ||
    "N/A"
  );
});

const displayName = computed(() => {
  const r = currentReq.value;
  return (
    r?.latin_name ||
    r?.user?.userDetail?.latin_name ||
    r?.user?.user_detail?.latin_name ||
    r?.user_detail?.latin_name ||
    r?.user?.name ||
    "Unknown"
  );
});

// --- Leave type selection ---
const leaveTypes = [
  { value: "Annual", label: "Annual Leave" },
  { value: "Sick", label: "Sick Leave" },
  { value: "Personal", label: "Personal Leave" },
  { value: "Emergency", label: "Emergency" },
  { value: "Maternity", label: "Maternity" },
  { value: "Other", label: "Other" },
];

const normalizedType = computed(() => {
  const raw = (currentReq.value?.leave_type || currentReq.value?.type || "")
    .toString()
    .trim()
    .toLowerCase();

  if (!raw) return "";
  if (raw.includes("annual")) return "Annual";
  if (raw.includes("sick")) return "Sick";
  if (raw.includes("personal")) return "Personal";
  if (raw.includes("emergency")) return "Emergency";
  if (raw.includes("maternity")) return "Maternity";
  return "Other";
});

// --- Date + total days (fix undefined days) ---
const toISODate = (v) => {
  if (!v) return null;
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s; // YYYY-MM-DD
};

const formatDMY = (v) => {
  const d = toISODate(v);
  if (!d || d.length !== 10) return d || "";
  const [yyyy, mm, dd] = d.split("-");
  return `${dd}-${mm}-${yyyy}`;
};

const calcTotalDays = (start, end) => {
  const s = toISODate(start);
  const e = toISODate(end);
  if (!s || !e) return null;

  // UTC safe day-diff (inclusive)
  const ds = new Date(`${s}T00:00:00Z`);
  const de = new Date(`${e}T00:00:00Z`);
  if (isNaN(ds.getTime()) || isNaN(de.getTime())) return null;

  const diff = Math.floor((de - ds) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : null; // inclusive
};

const totalDays = computed(() => {
  const raw = currentReq.value?.total_days ?? currentReq.value?.total_day;
  if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return calcTotalDays(
    currentReq.value?.start_date,
    currentReq.value?.end_date,
  );
});

const totalDaysText = computed(() => {
  return totalDays.value ? `${totalDays.value} days` : "0 days";
});

// --- Status ---
const currentStatus = computed(() =>
  (currentReq.value?.status || "pending").toString().toLowerCase(),
);
const isPending = computed(() => currentStatus.value === "pending");

const existingRemark = computed(() => {
  const r = currentReq.value;
  return (
    r?.remark ||
    r?.approved_remark ||
    r?.rejected_remark ||
    r?.notes ||
    r?.approval_notes ||
    r?.admin_remark ||
    null
  );
});

// --- Actions ---
const remark = ref("");
const loading = ref(false);
const actionType = ref("");

const isAlreadyProcessedError = (err) => {
  const msg = (
    err?.response?.data?.message ||
    err?.message ||
    ""
  ).toLowerCase();
  return msg.includes("already been processed");
};

const handleApprove = async () => {
  loading.value = true;
  actionType.value = "approve";

  try {
    const requestId = currentReq.value?.id || props.leaveRequest?.id;

    // ✅ CORRECT: use store.approve() which should do axios.post(...)
    const result = await store.approve(requestId);

    showNotification(result?.message || "Approved successfully!", "success");

    if (result?.leave_request) {
      req.value = { ...result.leave_request };
    } else {
      req.value.status = "Approved";
    }

    emit("updated");
    emit("close");
  } catch (error) {
    const msg =
      error?.response?.data?.message || error?.message || "Unknown error";
    showNotification("Failed to approve: " + msg, "error");

    if (isAlreadyProcessedError(error)) {
      emit("updated");
      emit("close");
    }
  } finally {
    loading.value = false;
    actionType.value = "";
  }
};

const handleReject = async () => {
  if (!remark.value?.trim()) {
    showNotification("Please provide a reason for rejection", "error");
    return;
  }

  loading.value = true;
  actionType.value = "reject";

  try {
    const requestId = currentReq.value?.id || props.leaveRequest?.id;

    // ✅ CORRECT: use store.reject() which should do axios.post(..., {remark})
    const result = await store.reject(requestId, remark.value.trim());

    showNotification(result?.message || "Rejected successfully!", "success");

    // ✅ set local req using API returned leave_request (BEST)
    if (result?.leave_request) {
      req.value = { ...result.leave_request };
    } else {
      // fallback
      req.value.status = "Rejected";
      req.value.remark = remark.value.trim();
    }

    emit("updated");
    emit("close");
  } catch (error) {
    const msg =
      error?.response?.data?.message || error?.message || "Unknown error";
    showNotification("Failed to reject: " + msg, "error");

    if (isAlreadyProcessedError(error)) {
      emit("updated");
      emit("close");
    }
  } finally {
    loading.value = false;
    actionType.value = "";
  }
};
</script>
