<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
    <!-- Modal -->
    <div
      class="relative w-full max-w-[760px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
      <!-- Sticky Header -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between border-b bg-white/90 px-6 py-4 backdrop-blur">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            Leave Request
          </h2>
          <p class="text-sm text-gray-500">
            Fill out the form to submit your leave request.
          </p>
        </div>

        <button
          @click="$emit('close')"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 active:scale-95"
          aria-label="Close">
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="max-h-[80vh] overflow-y-auto px-6 py-6">
        <form @submit.prevent="submitLeaveRequest" class="space-y-6">
          <!-- Section: Identity -->
          <div class="rounded-lg border bg-wghite p-4">
            <h3 class="mb-3 text-sm font-semibold text-gray-900">
              Personal Info
            </h3>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  ID <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.id"
                  type="text"
                  disabled
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 shadow-sm cursor-not-allowed" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  Full name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.fullName"
                  type="text"
                  disabled
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 shadow-sm cursor-not-allowed" />
              </div>
            </div>
          </div>

          <!-- Leave Type -->
          <div>
            <label class="block text-sm font-semibold text-gray-800">
              Leave Type <span class="text-red-500">*</span>
            </label>

            <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button
                type="button"
                v-for="type in leaveTypes"
                :key="type"
                @click="selectLeaveType(type)"
                :disabled="isAnnualAndStudent(type)"
                :class="[
                  'rounded-lg border px-3 py-2 text-sm font-semibold transition active:scale-[0.98]',
                  form.leaveType === type
                    ? 'border-[#235AA6] bg-[#235AA6] text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                  isAnnualAndStudent(type) ? 'opacity-60' : '',
                ]">
                {{ type }}
              </button>
            </div>

            <p class="mt-2 text-xs text-gray-500">
              Choose the leave category that matches your request.
            </p>
          </div>

          <!-- Dates -->
          <div class="rounded-lg border bg-white p-4">
            <h3 class="mb-3 text-sm font-semibold text-gray-900">
              Leave Dates
            </h3>

            <div class="grid gap-4 sm:grid-cols-3">
              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  Start Day <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.startDate"
                  type="date"
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-sm outline-none focus:border-[#235AA6] focus:ring-4 focus:ring-[#235AA6]/15"
                  @change="updateTotalDays"
                  required />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  End Day <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.endDate"
                  type="date"
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-sm outline-none focus:border-[#235AA6] focus:ring-4 focus:ring-[#235AA6]/15"
                  @change="updateTotalDays"
                  required />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800">
                  Total Day
                </label>
                <input
                  v-model="form.totalDays"
                  type="text"
                  readonly
                  class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm" />
              </div>
            </div>
          </div>

          <!-- Reason -->
          <div>
            <label class="block text-sm font-semibold text-gray-800">
              Reason for Leave <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.reason"
              placeholder="Please provide detail about your leave request ..."
              class="mt-2 min-h-[110px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-sm outline-none focus:border-[#235AA6] focus:ring-4 focus:ring-[#235AA6]/15 resize-none"
              required></textarea>
          </div>

          <!-- Handover -->
          <div>
            <label class="block text-sm font-semibold text-gray-800">
              Handover Details
            </label>
            <textarea
              v-model="form.handover"
              placeholder="Describe work handover arrangements or coverage plans ..."
              class="mt-2 min-h-[90px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-sm outline-none focus:border-[#235AA6] focus:ring-4 focus:ring-[#235AA6]/15 resize-none"></textarea>
          </div>

          <!-- Emergency -->
          <div>
            <label class="block text-sm font-semibold text-gray-800">
              Emergency Contact <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.emergencyContact"
              type="text"
              placeholder="Phone number of alternative contact"
              class="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-sm outline-none focus:border-[#235AA6] focus:ring-4 focus:ring-[#235AA6]/15"
              required
              @input="allowOnlyDigits" />
            <p v-if="errorEmergency" class="mt-2 text-sm text-red-600">
              {{ errorEmergency }}
            </p>
          </div>

          <!-- File Upload -->
          <div>
            <label class="block text-sm font-semibold text-gray-800">
              Supporting Documents
            </label>

            <div
              class="mt-2 rounded-lg border-2 border-dashed border-gray-200 bg-white p-4 text-center transition hover:border-[#235AA6] cursor-pointer"
              @click="$refs.fileInput.click()">
              <p class="text-sm font-semibold text-gray-700">
                Drag & Drop your file here
              </p>
              <p class="mt-1 text-xs text-gray-500">
                or click to browse (PDF, JPG, PNG, DOCX)
              </p>

              <input
                ref="fileInput"
                type="file"
                class="hidden"
                @change="handleFileUpload" />
            </div>

            <div
              v-if="form.fileName"
              class="mt-3 flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3 text-sm">
              <div class="truncate text-gray-700">
                <span class="font-semibold">Selected:</span>
                {{ form.fileName }}
              </div>

              <button
                type="button"
                class="ml-4 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#235AA6] hover:bg-white border border-transparent hover:border-gray-200"
                @click="
                  form.file = null;
                  form.fileName = '';
                  $refs.fileInput.value = null;
                ">
                Remove
              </button>
            </div>
          </div>
          <div
            class="sticky bottom-0 border-t border-black/10 bg-white/90 backdrop-blur">
            <!-- Submit -->
            <div class="pt-2">
              <button
                type="submit"
                class="w-full rounded-lg bg-[#235AA6] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1f4f93] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#235AA6]/20">
                Submit Leave Request
              </button>

              <p class="mt-2 text-center text-xs text-gray-500">
                Please double-check your details before submitting.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, onUnmounted, ref } from "vue";
import { useAuthStore } from "@/stores/Authentication/authStore";
import {
  submitLeaveRequestService,
  submitTeacherLeaveRequestService,
} from "@/stores/Teacher/LeaveRequestFrom";
import { getStudentProfile } from "@/stores/Student/StudentProfile";
import { showNotification } from "@/lib/notifications";

const emit = defineEmits(["close", "submit"]);
const authStore = useAuthStore();

const leaveTypes = [
  "Annual Leave",
  "Sick Leave",
  "Personal Leave",
  "Emergency",
  "Maternity",
  "Other",
];
const today = computed(() => new Date().toISOString().split("T")[0]);

const form = reactive({
  id: "",
  fullName: "",
  leaveType: "",
  startDate: "",
  endDate: "",
  totalDays: "",
  reason: "",
  handover: "",
  emergencyContact: "",
  file: null,
  fileName: "",
});

const errorEmergency = ref("");

onMounted(async () => {
  try {
    const data = await getStudentProfile();
    form.id = data.user.user_detail?.id_card || "";
    form.fullName = data.user?.name || "";
    if (!authStore.userRole) authStore.userRole = data.user?.role || "unknown";
  } catch (error) {
    console.error("Failed to load profile:", error);
  }
});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.file = file;
    form.fileName = file.name;
  }
};

const isAnnualAndStudent = (type) =>
  type === "Annual" && authStore.userRole?.toLowerCase() === "student";

const selectLeaveType = (type) => {
  if (!isAnnualAndStudent(type)) form.leaveType = type;
};

const updateTotalDays = () => {
  if (!form.startDate || !form.endDate) return;
  const start = new Date(form.startDate);
  const end = new Date(form.endDate);
  if (end < start) {
    showNotification("End date cannot be before start date.");
    form.endDate = "";
    return;
  }
  form.totalDays = ((end - start) / (1000 * 60 * 60 * 24) + 1).toFixed(0);
};

const allowOnlyDigits = () => {
  form.emergencyContact = form.emergencyContact.replace(/\D/g, "");
};

const validateEmergencyContact = () => {
  const regex = /^0\d{8,}$/;
  if (!regex.test(form.emergencyContact)) {
    errorEmergency.value =
      "Emergency contact must start with 0 and be at least 9 digits.";
    return false;
  }
  errorEmergency.value = "";
  return true;
};

const submitLeaveRequest = async () => {
  try {
    if (!validateEmergencyContact()) return;
    if (form.startDate < today.value) {
      showNotification("Start date must be today or later.");
      return;
    }
    if (form.endDate < form.startDate) {
      showNotification("End date cannot be before start date.");
      return;
    }
    if (
      form.leaveType === "Annual" &&
      authStore.userRole?.toLowerCase() === "student"
    ) {
      showNotification("Annual leave is not available for students.");
      return;
    }

    const formData = new FormData();
    formData.append("type", form.leaveType);
    formData.append("start_date", form.startDate);
    formData.append("end_date", form.endDate);
    formData.append("reason", form.reason || "");
    formData.append("handover_detail", form.handover || "");
    formData.append("emergency_contact", form.emergencyContact || "");
    if (form.file) formData.append("document", form.file);

    // Use different service based on role
    let response;
    if (authStore.userRole?.toLowerCase() === "staff") {
      response = await submitTeacherLeaveRequestService(formData); // Teacher endpoint
    } else {
      response = await submitLeaveRequestService(formData); // Student/general endpoint
    }

    emit("submit", {
      id: response.leave_request.id,
      type: response.leave_request.type,
      start: response.leave_request.start_date,
      end: response.leave_request.end_date,
      totalDays: form.totalDays,
      submit: response.leave_request.requested_at,
      status: response.leave_request.status || "Pending",
      reason: response.leave_request.reason,
      handover_detail: response.leave_request.handover_detail,
      emergency_contact: response.leave_request.emergency_contact,
      document: response.document_path || null,
    });

    emit("close");

    // Reset form
    Object.assign(form, {
      leaveType: "",
      startDate: "",
      endDate: "",
      totalDays: "",
      reason: "",
      handover: "",
      emergencyContact: "",
      file: null,
      fileName: "",
    });
    errorEmergency.value = "";

    showNotification("Leave request submitted successfully!");
  } catch (error) {
    console.error("❌ API error:", error);
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join("\n")
        : "Failed to submit leave request.");
    showNotification(message);
  }
};

onMounted(() => (document.body.style.overflow = "hidden"));
onUnmounted(() => (document.body.style.overflow = "auto"));
</script>

<style scoped>
button:disabled {
  background-color: #f3f4f6 !important;
  border-color: #e5e7eb !important;
  color: #9ca3af !important;
  cursor: not-allowed !important;
}
</style>
