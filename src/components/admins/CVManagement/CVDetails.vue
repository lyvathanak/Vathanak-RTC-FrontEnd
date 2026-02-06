<template>
  <!-- Main Modal -->
  <div
    v-if="cv"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click.self="emit('close')">
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col ring-1 ring-black/10"
      role="dialog"
      aria-modal="true"
      @click.stop>
      <!-- Header (sticky) -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div class="min-w-0">
          <h3
            class="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <span
              class="h-9 w-9 rounded-2xl bg-blue-50 ring-1 ring-blue-200 flex items-center justify-center">
              <FileText class="w-5 h-5 text-blue-700" />
            </span>
            CV Submission Details
          </h3>

          <p class="text-sm text-gray-600 mt-1 truncate">
            {{ cv?.template_name || "—" }}
          </p>
        </div>

        <button
          @click="emit('close')"
          class="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          aria-label="Close"
          type="button">
          <X class="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
        <!-- Summary Cards -->
        <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-semibold text-gray-500">Submitted By</p>
            <p class="mt-1 font-semibold text-gray-900 truncate">
              {{ cv?.user_name || "—" }}
            </p>
            <p class="text-xs text-gray-500 mt-0.5 truncate">
              {{ cv?.role || "—" }}
            </p>
          </div>

          <div
            class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-semibold text-gray-500">Template</p>
            <p class="mt-1 font-semibold text-gray-900 truncate">
              {{ cv?.template_name || "—" }}
            </p>
            <p class="text-xs text-gray-500 mt-0.5 truncate">
              {{ cv?.template_description || "—" }}
            </p>
          </div>

          <div
            class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-semibold text-gray-500">Submitted Date</p>
            <p class="mt-1 font-semibold text-gray-900">
              {{ formatSubmittedDate(cv?.submitted_date) }}
            </p>
          </div>

          <div
            class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-semibold text-gray-500">Status</p>
            <span
              :class="[
                'mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold',
                statusPillClass(cv?.status),
              ]">
              <component :is="statusIcon(cv?.status)" class="w-4 h-4" />
              {{ statusLabel(cv?.status) }}
            </span>
          </div>
        </div>

        <!-- CV Content (ALWAYS SHOW UI) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left: Section Nav -->
          <aside class="lg:col-span-4">
            <div class="sticky top-23">
              <div
                class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <!-- Nav header -->
                <div class="px-4 pt-4 pb-3 border-b border-gray-100">
                  <p
                    class="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Sections
                  </p>

                  <!-- Search -->
                  <div class="mt-3 relative">
                    <input
                      v-model="sectionQuery"
                      type="text"
                      placeholder="Search section..."
                      class="w-full h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 pl-9 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      :disabled="!hasFormData" />
                    <Search
                      class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <p
                    v-if="!hasFormData"
                    class="mt-2 text-xs font-semibold text-gray-400">
                    No form data submitted (UI preview mode)
                  </p>
                </div>

                <!-- Nav items -->
                <div class="p-2 space-y-1">
                  <button
                    v-for="(section, sectionName) in filteredGroupedFields"
                    :key="sectionName"
                    @click="activeSection = sectionName"
                    class="w-full group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition"
                    :class="
                      activeSection === sectionName
                        ? 'bg-blue-50 text-blue-950 ring-1 ring-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    "
                    type="button"
                    :disabled="!hasFormData">
                    <span
                      class="absolute left-0 top-2 bottom-2 w-1 rounded-full transition"
                      :class="
                        activeSection === sectionName
                          ? 'bg-blue-600'
                          : 'bg-transparent'
                      " />

                    <span class="flex items-center gap-2 min-w-0">
                      <span
                        class="h-2.5 w-2.5 rounded-full"
                        :class="
                          activeSection === sectionName
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                        " />
                      <span class="truncate">{{ sectionName }}</span>
                    </span>

                    <span
                      class="text-[11px] font-extrabold px-2 py-1 rounded-full"
                      :class="
                        activeSection === sectionName
                          ? 'bg-white text-blue-700 ring-1 ring-blue-200'
                          : 'bg-gray-100 text-gray-600'
                      ">
                      {{ section.length }}
                    </span>
                  </button>

                  <div
                    v-if="Object.keys(filteredGroupedFields || {}).length === 0"
                    class="px-3 py-6 text-center text-sm text-gray-500">
                    No matching sections
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <!-- Right: Fields -->
          <section class="lg:col-span-8">
            <div
              class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <!-- Section Header -->
              <div
                class="px-5 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <h4 class="text-lg font-extrabold text-gray-900 truncate">
                      {{ activeSection || "Details" }}
                    </h4>
                    <p class="text-xs font-semibold text-gray-500 mt-0.5">
                      {{ (groupedFields?.[activeSection] || []).length }} fields
                    </p>
                  </div>

                  <span
                    class="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-gray-600">
                    <span class="h-2 w-2 rounded-full bg-blue-600"></span>
                    Viewing details
                  </span>
                </div>
              </div>

              <!-- Body -->
              <div class="p-5">
                <!-- Empty (but keep UI) -->
                <div
                  v-if="!hasFormData"
                  class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                  <div
                    class="mx-auto h-12 w-12 rounded-2xl bg-white ring-1 ring-gray-200 flex items-center justify-center">
                    <FileText class="w-6 h-6 text-gray-400" />
                  </div>
                  <h5 class="mt-4 text-base font-extrabold text-gray-900">
                    No form data submitted
                  </h5>
                  <p class="mt-1 text-sm font-semibold text-gray-500">
                    This view is ready — it will auto-fill once the user submits
                    CV fields.
                  </p>

                  <!-- Skeleton preview cards (UI-only) -->
                  <div
                    class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div
                      class="rounded-2xl border border-gray-200 bg-white p-4">
                      <div class="h-3 w-24 bg-gray-100 rounded"></div>
                      <div class="mt-3 h-4 w-40 bg-gray-100 rounded"></div>
                    </div>
                    <div
                      class="rounded-2xl border border-gray-200 bg-white p-4">
                      <div class="h-3 w-28 bg-gray-100 rounded"></div>
                      <div class="mt-3 h-4 w-36 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>

                <!-- Normal fields -->
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="field in groupedFields?.[activeSection] || []"
                    :key="field.key"
                    class="group rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md hover:border-gray-300 transition">
                    <div class="flex items-start justify-between gap-3">
                      <label
                        class="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                        {{ field.label }}
                      </label>

                      <button
                        v-if="
                          !isFileField(cv.form_data[field.key]) &&
                          cv.form_data[field.key]
                        "
                        @click="copyValue(cv.form_data[field.key])"
                        class="opacity-0 group-hover:opacity-100 transition text-xs font-bold px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
                        type="button">
                        Copy
                      </button>
                    </div>

                    <div
                      v-if="isFileField(cv.form_data[field.key])"
                      class="mt-3">
                      <button
                        class="w-full text-left rounded-2xl border border-gray-200 p-3 hover:bg-gray-50 transition"
                        @click="previewFile(field.key)"
                        type="button">
                        <div class="flex items-center gap-3">
                          <div
                            class="h-11 w-11 rounded-2xl bg-gray-50 flex items-center justify-center ring-1 ring-gray-200">
                            <FileText
                              v-if="!isImageFile(cv.form_data[field.key])"
                              class="w-5 h-5 text-blue-600" />
                            <Image v-else class="w-5 h-5 text-green-600" />
                          </div>

                          <div class="min-w-0 flex-1">
                            <p
                              class="text-sm font-extrabold text-gray-900 truncate">
                              {{ getFileName(field.key) }}
                            </p>
                            <p class="text-xs font-semibold text-gray-500">
                              {{ getFileSize(field.key) }}
                            </p>
                          </div>

                          <Eye class="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                      <p class="text-[11px] font-semibold text-gray-500 mt-2">
                        Click to preview / download
                      </p>
                    </div>

                    <div
                      v-else-if="isLongText(cv.form_data[field.key])"
                      class="mt-3">
                      <div
                        class="rounded-2xl bg-gray-50 border border-gray-200 p-3 max-h-44 overflow-y-auto">
                        <p
                          class="text-sm font-semibold text-gray-900 whitespace-pre-line leading-relaxed">
                          {{ cv.form_data[field.key] }}
                        </p>
                      </div>
                    </div>

                    <p
                      v-else
                      class="mt-2 text-sm font-extrabold text-gray-900 truncate">
                      {{ cv.form_data[field.key] || "—" }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Footer (sticky) -->
      <div
        class="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white/90 backdrop-blur">
        <button
          v-if="canModerate && isPending(cv.status)"
          @click="openConfirm('approve', cv.id)"
          class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
          type="button">
          <CheckCircle class="w-4 h-4" />
          Approve
        </button>

        <button
          v-if="canModerate && isPending(cv.status)"
          @click="openConfirm('reject', cv.id)"
          class="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition"
          type="button">
          <X class="w-4 h-4" />
          Reject
        </button>

        <button
          @click="emit('close')"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          type="button">
          Close
        </button>
      </div>
    </div>
  </div>

  <!-- File Preview Modal -->
  <div
    v-if="showFilePreview"
    class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50"
    @click.self="showFilePreview = false">
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden ring-1 ring-black/10"
      role="dialog"
      aria-modal="true"
      @click.stop>
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200 bg-white/90 backdrop-blur">
        <h3 class="text-xl font-extrabold text-gray-900 truncate">
          File Preview: {{ previewFileData?.name || "—" }}
        </h3>
        <button
          @click="showFilePreview = false"
          class="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          type="button">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-auto max-h-[calc(90vh-170px)]">
        <div v-if="previewFileData?.isImage" class="text-center">
          <img
            :src="previewFileData.url"
            :alt="previewFileData.name"
            class="max-w-full max-h-[60vh] mx-auto rounded-2xl shadow-lg ring-1 ring-black/5" />
          <div class="mt-4">
            <p class="text-gray-900 font-extrabold">
              {{ previewFileData.name }}
            </p>
            <p class="text-sm text-gray-500 font-semibold">
              {{ previewFileData.size }}
            </p>
          </div>
        </div>

        <div v-else class="text-center">
          <div
            class="w-28 h-28 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center ring-1 ring-gray-200">
            <FileText class="w-12 h-12 text-gray-400" />
          </div>
          <h4 class="text-lg font-extrabold text-gray-900">
            {{ previewFileData?.name || "—" }}
          </h4>
          <p class="text-gray-600 mt-2 font-semibold">
            {{ previewFileData?.size || "—" }}
          </p>
          <p class="text-sm text-gray-500 mt-1 font-semibold">
            {{ previewFileData?.type || "Document" }}
          </p>

          <div class="mt-5">
            <button
              v-if="previewFileData?.url && isPDF(previewFileData.url)"
              @click="openPDF(previewFileData.url)"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
              type="button">
              <Eye class="w-4 h-4" />
              Open PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Sticky Actions -->
      <div
        class="sticky bottom-0 border-t border-gray-100 bg-white/90 backdrop-blur p-4 flex justify-end gap-3">
        <a
          v-if="previewFileData?.url"
          :href="previewFileData.url"
          download
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">
          <Download class="w-4 h-4" />
          Download
        </a>

        <button
          @click="showFilePreview = false"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50"
          type="button">
          Close
        </button>
      </div>
    </div>
  </div>
  <!-- Confirm Dialog (MUST be outside showFilePreview) -->
  <ConfirmDialog
    :open="confirm.open"
    :title="confirm.title"
    :message="confirm.message"
    :type="confirm.type"
    :confirmText="confirm.confirmText"
    :cancelText="confirm.cancelText"
    :icon="confirm.icon"
    @close="closeConfirm"
    @confirm="confirmYes" />
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import {
  X,
  FileText,
  Eye,
  Image,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  CheckCircle2,
} from "lucide-vue-next";
import ConfirmDialog from "@/components/features/ConfirmDialog.vue";

const props = defineProps({
  cv: { type: Object, default: null },
  template: { type: Object, default: null },
  canModerate: { type: Boolean, default: true },
});

const emit = defineEmits(["close", "approve", "reject"]);

const showFilePreview = ref(false);
const previewFileData = ref(null);

const hasFormData = computed(() => {
  const data = props.cv?.form_data;
  return !!data && Object.keys(data).length > 0;
});

/* Status helpers */
const normalizeStatus = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const isPending = (s) => normalizeStatus(s) === "pending";

const statusLabel = (s) => {
  const map = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    under_review: "Under Review",
  };
  return map[normalizeStatus(s)] || "Unknown";
};

const statusIcon = (s) => {
  const map = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    under_review: Eye,
  };
  return map[normalizeStatus(s)] || Clock;
};

const statusPillClass = (s) => {
  const map = {
    pending: "bg-yellow-50 text-yellow-900 ring-1 ring-yellow-200",
    approved: "bg-green-50 text-green-900 ring-1 ring-green-200",
    rejected: "bg-red-50 text-red-900 ring-1 ring-red-200",
    under_review: "bg-blue-50 text-blue-900 ring-1 ring-blue-200",
  };
  return (
    map[normalizeStatus(s)] || "bg-gray-50 text-gray-800 ring-1 ring-gray-200"
  );
};

/* Date */
const formatSubmittedDate = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";

  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(d);

  const get = (type) => parts.find((p) => p.type === type)?.value || "";
  return `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")} ${get("dayPeriod")}`;
};

/* File helpers */
const isFileField = (value) => {
  if (!value) return false;
  if (typeof value === "object" && value.dataUrl) return true;
  if (typeof value === "string" && value.startsWith("data:")) return true;
  return false;
};

const isImageFile = (value) => {
  if (!value) return false;
  if (typeof value === "object" && value.isImage) return value.isImage;
  if (typeof value === "string" && value.startsWith("data:"))
    return value.includes("image/");
  return false;
};

const getFileName = (fieldKey) => {
  const value = props.cv?.form_data?.[fieldKey];
  if (!value) return "—";
  if (typeof value === "object" && value.fileName) return value.fileName;
  if (typeof value === "string" && value.startsWith("data:"))
    return "Uploaded file";
  return "File";
};

const getFileSize = (fieldKey) => {
  const value = props.cv?.form_data?.[fieldKey];
  if (!value) return "—";
  if (typeof value === "object" && value.fileSize) return value.fileSize;
  return "Unknown size";
};

const getFileUrl = (fieldKey) => {
  const value = props.cv?.form_data?.[fieldKey];
  if (!value) return "";
  if (typeof value === "object" && value.dataUrl) return value.dataUrl;
  if (typeof value === "string" && value.startsWith("data:")) return value;
  return "";
};

const isLongText = (value) =>
  value && typeof value === "string" && value.length > 100;

const isPDF = (url) =>
  url && (url.includes("application/pdf") || url.includes(".pdf"));

const openPDF = (url) => window.open(url, "_blank");

const previewFile = (fieldKey) => {
  const value = props.cv?.form_data?.[fieldKey];
  if (!value) return;

  previewFileData.value = {
    name: getFileName(fieldKey),
    size: getFileSize(fieldKey),
    url: getFileUrl(fieldKey),
    isImage: isImageFile(value),
    type: isImageFile(value) ? "Image" : "Document",
  };
  showFilePreview.value = true;
};

/* Copy */
const copyValue = async (val) => {
  try {
    await navigator.clipboard.writeText(String(val));
  } catch {}
};

/* Group fields (if no data, return empty groups so UI still shows sections list structure) */
const groupedFields = computed(() => {
  if (!props.cv?.form_data) return {};

  const groups = {
    "Personal Information": [],
    "Contact Information": [],
    Education: [],
    "Work Experience": [],
    "Skills & Certifications": [],
    "Other Information": [],
  };

  Object.keys(props.cv.form_data).forEach((key) => {
    const field = { key, label: key };
    const lowerKey = key.toLowerCase();

    if (
      lowerKey.includes("name") ||
      lowerKey.includes("date of birth") ||
      lowerKey.includes("gender")
    ) {
      groups["Personal Information"].push(field);
    } else if (
      lowerKey.includes("email") ||
      lowerKey.includes("phone") ||
      lowerKey.includes("address") ||
      lowerKey.includes("linkedin")
    ) {
      groups["Contact Information"].push(field);
    } else if (
      lowerKey.includes("education") ||
      lowerKey.includes("degree") ||
      lowerKey.includes("university") ||
      lowerKey.includes("graduation")
    ) {
      groups["Education"].push(field);
    } else if (
      lowerKey.includes("experience") ||
      lowerKey.includes("work") ||
      lowerKey.includes("job") ||
      lowerKey.includes("company")
    ) {
      groups["Work Experience"].push(field);
    } else if (
      lowerKey.includes("skill") ||
      lowerKey.includes("language") ||
      lowerKey.includes("certification")
    ) {
      groups["Skills & Certifications"].push(field);
    } else {
      groups["Other Information"].push(field);
    }
  });

  Object.keys(groups).forEach((k) => {
    if (groups[k].length === 0) delete groups[k];
  });

  return groups;
});

/* Section search */
const sectionQuery = ref("");

const filteredGroupedFields = computed(() => {
  const base = groupedFields.value || {};
  if (!hasFormData.value) {
    // UI fallback: show a default section list even if empty (your screenshot style)
    return {
      "Personal Information": [],
      "Contact Information": [],
      "Other Information": [],
    };
  }

  const q = sectionQuery.value.trim().toLowerCase();
  if (!q) return base;

  const out = {};
  for (const [name, fields] of Object.entries(base)) {
    if (name.toLowerCase().includes(q)) out[name] = fields;
  }
  return out;
});

const confirm = ref({
  open: false,
  action: null, // "approve" | "reject"
  cvId: null,
  title: "",
  message: "",
  type: "warning",
  confirmText: "Confirm",
  cancelText: "Cancel",
  icon: null,
});

const openConfirm = (action, cvId) => {
  confirm.value.open = true;
  confirm.value.action = action;
  confirm.value.cvId = cvId;

  if (action === "approve") {
    confirm.value.title = "Approve this CV?";
    confirm.value.message = "Are you sure you want to approve this submission?";
    confirm.value.type = "success";
    confirm.value.confirmText = "Yes, Approve";
    confirm.value.cancelText = "Cancel";
    confirm.value.icon = CheckCircle; // or CheckCircle2
  } else {
    confirm.value.title = "Reject this CV?";
    confirm.value.message = "Are you sure you want to reject this submission?";
    confirm.value.type = "danger";
    confirm.value.confirmText = "Yes, Reject";
    confirm.value.cancelText = "Cancel";
    confirm.value.icon = XCircle;
  }
};

const closeConfirm = () => {
  confirm.value.open = false;
  confirm.value.action = null;
  confirm.value.cvId = null;
};

const confirmYes = () => {
  if (!confirm.value.cvId) return;

  if (confirm.value.action === "approve") {
    emit("approve", confirm.value.cvId);
  } else if (confirm.value.action === "reject") {
    emit("reject", confirm.value.cvId);
  }

  closeConfirm();
};

/* Active section default */
const activeSection = ref("");

watch(
  () => props.cv,
  () => {
    const keys = Object.keys(filteredGroupedFields.value || {});
    activeSection.value = keys[0] || "Personal Information";
  },
  { immediate: true },
);

watch(
  () => filteredGroupedFields.value,
  (v) => {
    const keys = Object.keys(v || {});
    if (keys.length && !keys.includes(activeSection.value))
      activeSection.value = keys[0];
  },
  { immediate: true },
);

/* ESC + body scroll lock */
const onKeydown = (e) => {
  if (e.key !== "Escape") return;

  if (confirm.value.open) closeConfirm();
  else if (showFilePreview.value) showFilePreview.value = false;
  else if (props.cv) emit("close");
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

watch(
  () => !!props.cv || showFilePreview.value || confirm.value.open,
  (open) => {
    document.body.style.overflow = open ? "hidden" : "";
  },
  { immediate: true },
);
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
