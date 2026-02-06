<template>
  <div
    class="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-6 sm:py-8 space-y-4">
    <PageHeader
      :title="t('cv_management')"
      subtitle="Track and manage your CV applications ">
      <div class="flex gap-2">
        <button
          v-if="activeTab === 'management'"
          @click="showTemplateBuilder = true"
          class="inline-flex items-center px-4 py-2 bg-[#235AA6] text-white rounded-lg hover:bg-[#1E4A78] focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base">
          <Settings class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Manage Templates
        </button>
      </div>
    </PageHeader>

    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'management'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'management'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]">
          <div class="flex items-center gap-2">
            <Users class="w-4 h-4" />
            Manage Submissions
            <span
              class="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {{ statusCounts.total }}
            </span>
          </div>
        </button>

        <button
          @click="activeTab = 'submission'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'submission'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]">
          <div class="flex items-center gap-2">
            <UserPlus class="w-4 h-4" />
            Test CV Submission
            <span
              v-if="mySubmissionsCount > 0"
              class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {{ mySubmissionsCount }}
            </span>
          </div>
        </button>
      </nav>
    </div>

    <!-- CV Management Tab -->
    <div v-if="activeTab === 'management'" class="space-y-4">
      <CVStatus
        :total="statusCounts.total"
        :pending="statusCounts.pending"
        :approved="statusCounts.approved"
        :rejected="statusCounts.rejected" />

      <!-- Search and Filters -->
      <CVFilter
        v-model:search="search"
        v-model:filters="filters"
        :loading="loading"
        @change="onFilterOrSearchChanged"
        @reset="onResetFilters" />

      <!-- Bulk Actions -->
      <CVBulkActions
        :selectedCount="selectedCVs.length"
        @approve="handleBulkApprove"
        @reject="handleBulkReject"
        @export="handleBulkExport" />

      <ConfirmDialog
        :open="confirmState.open"
        :title="confirmState.title"
        :message="confirmState.message"
        :type="confirmState.type"
        :confirmText="confirmState.confirmText"
        :cancelText="confirmState.cancelText"
        :loading="confirmState.loading"
        :icon="confirmState.icon"
        @close="closeBulkConfirm"
        @confirm="onBulkConfirm" />

      <!-- Submission Table -->
      <CVSubmissionTable
        :cvs="filteredCVs"
        :loading="loading"
        :allSelected="allSelected"
        :selectedIds="selectedIds"
        @toggle-select-all="toggleSelectAll"
        @toggle-select="toggleSelect"
        @view="handleView"
        @edit="handleEdit"
        @approve="handleApproveCV"
        @reject="handleRejectCV"
        @export="handleExportCV"
        @create-test="activeTab = 'submission'" />

      <Pagination
        :current-page="page"
        :total-items="totalFilteredItems"
        :page-size="pageSize"
        :page-size-options="[5, 10, 25, 50]"
        item-label="submissions"
        @update:currentPage="(val) => (page = val)"
        @update:pageSize="
          (val) => {
            pageSize = val;
            page = 1;
          }
        " />

      <!-- CV Details Modal -->
      <CVDetails
        v-if="showViewModal"
        :cv="selectedCV"
        :canModerate="true"
        @close="closeViewModal"
        @approve="handleApproveCV"
        @reject="handleRejectCV" />

      <CVEdit
        :open="showEditModal"
        :cv="editCV"
        @close="closeEditModal"
        @save="handleSaveEdit" />

      <!-- Template Builder Modal -->
      <CVTemplateBuilder
        v-if="showTemplateBuilder"
        :show="showTemplateBuilder"
        @close="showTemplateBuilder = false"
        @template-saved="handleTemplateSaved" />
    </div>

    <!-- CV Submission Tab -->
    <div v-else-if="activeTab === 'submission'" class="">
      <AdminCVSubmission
        @submission-created="refreshData"
        @submission-deleted="refreshData" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from "vue";
import { Settings, Users, UserPlus } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import ConfirmDialog from "@/components/features/ConfirmDialog.vue";
import { Check, X, Download, AlertTriangle } from "lucide-vue-next";
import Pagination from "@/components/features/Pagination.vue";
import PageHeader from "@/components/features/PageHeader.vue";
import CVStatus from "@/components/admins/CVManagement/CVStatus.vue";
import CVFilter from "@/components/admins/CVManagement/CVFilter.vue";
import CVTemplateBuilder from "@/components/admins/CVManagement/CVTemplateBuilder.vue";
import AdminCVSubmission from "@/components/admins/CVManagement/AdminCVSubmission.vue";
import CVDetails from "@/components/admins/CVManagement/CVDetails.vue";
import CVEdit from "@/components/admins/CVManagement/CVEdit.vue";
import CVBulkActions from "@/components/admins/CVManagement/CVBulkActions.vue";
import CVSubmissionTable from "@/components/admins/CVManagement/CVSubmissionTable.vue";

const { t } = useI18n();

// Tabs / UI state
const activeTab = ref("management");
const showViewModal = ref(false);
const showTemplateBuilder = ref(false);
const selectedCV = ref(null);

// Data
const allCVs = ref([]);
const loading = ref(false);

const search = ref("");
const filters = ref({
  status: "",
  type: "",
  startDate: "",
  endDate: "",
});

// Selection + paging
const selectedCVs = ref([]);
const page = ref(1);
const pageSize = ref(10);

const selectedIds = computed(() => selectedCVs.value.map((x) => x.id));

// Status statistics
const statusStats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0,
});

const statusCounts = computed(() => statusStats.value);

// My submissions count
const mySubmissionsCount = ref(0);

// --------------------
// Filtering + stats
// --------------------
const applyFilters = () => {
  let filtered = [...allCVs.value];

  // Search
  if (search.value && search.value.trim()) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(
      (cv) =>
        cv.user_name?.toLowerCase().includes(searchLower) ||
        cv.template_name?.toLowerCase().includes(searchLower) ||
        cv.template_description?.toLowerCase().includes(searchLower) ||
        (cv.form_data &&
          Object.values(cv.form_data).some((value) =>
            String(value).toLowerCase().includes(searchLower),
          )),
    );
  }

  // Status
  if (filters.value.status) {
    const wanted = normalizeStatus(filters.value.status);
    filtered = filtered.filter((cv) => normalizeStatus(cv.status) === wanted);
  }

  // Type (optional field)
  if (filters.value.type) {
    const wantedType = String(filters.value.type).toLowerCase();
    filtered = filtered.filter(
      (cv) => String(cv.type || "").toLowerCase() === wantedType,
    );
  }

  // Date range
  if (filters.value.startDate) {
    const startDate = new Date(filters.value.startDate);
    filtered = filtered.filter(
      (cv) => new Date(cv.submitted_date) >= startDate,
    );
  }

  if (filters.value.endDate) {
    const endDate = new Date(filters.value.endDate);
    endDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter((cv) => new Date(cv.submitted_date) <= endDate);
  }

  return filtered;
};

// --------------------
// Table paging
// --------------------
const filteredCVs = computed(() => {
  const filtered = applyFilters();
  const start = (page.value - 1) * pageSize.value;
  return filtered.slice(start, start + pageSize.value);
});

const totalFilteredItems = computed(() => applyFilters().length);

const allSelected = computed(() => {
  return (
    filteredCVs.value.length > 0 &&
    filteredCVs.value.every((cv) => isSelected(cv.id))
  );
});

// --------------------
// Selection helpers
// --------------------
const isSelected = (id) => selectedCVs.value.some((cv) => cv.id === id);

const toggleSelect = (cv) => {
  if (isSelected(cv.id)) {
    selectedCVs.value = selectedCVs.value.filter((x) => x.id !== cv.id);
  } else {
    selectedCVs.value.push(cv);
  }
};

const toggleSelectAll = () => {
  selectedCVs.value = allSelected.value ? [] : [...filteredCVs.value];
};

// --------------------
// Load / update data (with 2 fake seed submissions)
// --------------------
const STORAGE_KEY = "admin-cv-submissions";

const seedFakeSubmissionsIfEmpty = () => {
  const now = new Date();

  const fake = [
    {
      id: 201,
      user_id: 10,
      user_name: "POM MOUYLANG",
      role: "Teacher",
      template_id: 1,
      template_name: "Professional CV Template",
      template_description: "Standard CV template with common sections",
      form_data: {
        name: "POM MOUYLANG",
        position: "Backend Engineer",
        address: "Phnom Penh",
      },
      submitted_date: now.toISOString(),
      status: "pending",
    },
    {
      id: 202,
      user_id: 11,
      user_name: "DIN PICH",
      role: "Student",
      template_id: 2,
      template_name: "Modern CV Template",
      template_description: "Clean modern layout",
      form_data: {
        name: "DIN PICH",
        position: "Frontend Developer",
        address: "Seoul",
      },
      submitted_date: new Date(now.getTime() - 86400000).toISOString(),
      status: "approved",
    },
    {
      id: 203,
      user_id: 12,
      user_name: "SREY LEN",
      role: "Teacher",
      template_id: 3,
      template_name: "Creative CV Template",
      template_description: "Creative layout",
      form_data: {
        name: "SREY LEN",
        position: "UI Designer",
        address: "Hong Kong",
      },
      submitted_date: new Date(now.getTime() - 2 * 86400000).toISOString(),
      status: "rejected",
    },
    {
      id: 204,
      user_id: 13,
      user_name: "OU SA",
      role: "Student",
      template_id: 1,
      template_name: "Professional CV Template",
      template_description: "Standard CV template",
      form_data: {
        name: "OU SA",
        position: "QA Engineer",
        address: "Busan",
      },
      submitted_date: new Date(now.getTime() - 3 * 86400000).toISOString(),
      status: "pending",
    },
    {
      id: 205,
      user_id: 14,
      user_name: "ALEX TAN",
      role: "Teacher",
      template_id: 2,
      template_name: "Modern CV Template",
      template_description: "Clean modern layout",
      form_data: {
        name: "ALEX TAN",
        position: "System Analyst",
        address: "Singapore",
      },
      submitted_date: new Date(now.getTime() - 4 * 86400000).toISOString(),
      status: "approved",
    },
  ];

  // 🔥 ALWAYS overwrite
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fake));
};

const normalizeStatus = (status) =>
  String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const calculateStatusStats = () => {
  const filtered = applyFilters();

  statusStats.value = {
    pending: filtered.filter((cv) => normalizeStatus(cv.status) === "pending")
      .length,
    approved: filtered.filter((cv) => normalizeStatus(cv.status) === "approved")
      .length,
    rejected: filtered.filter((cv) => normalizeStatus(cv.status) === "rejected")
      .length,
    total: filtered.length,
  };
};

const fetchSubmissions = async () => {
  loading.value = true;
  try {
    // ✅ seed 2 fake data only once (when empty)
    seedFakeSubmissionsIfEmpty();

    // (optional) simulate fetch delay
    await new Promise((r) => setTimeout(r, 250));

    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    allCVs.value = submissions.map((sub) => ({
      id: Number(sub.id),
      user_id: Number(sub.user_id),
      user_name: sub.user_name || "Admin User",
      role: sub.role || "Admin",
      template_id: sub.template_id,
      template_name: sub.template_name,
      template_description: sub.template_description || "",
      form_data: sub.form_data || {},
      submitted_date: sub.submitted_date,
      status: normalizeStatus(sub.status || "pending"),

      is_mock: !!sub.is_mock,
    }));

    calculateStatusStats();

    const adminId = 1; // test admin id
    mySubmissionsCount.value = submissions.filter(
      (s) => Number(s.user_id) === adminId,
    ).length;
  } catch (error) {
    console.error("Error loading submissions:", error);
  } finally {
    loading.value = false;
  }
};

function updateCVStatus(cvId, status, { refresh = true } = {}) {
  try {
    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const id = Number(cvId);

    const index = submissions.findIndex((sub) => Number(sub.id) === id);
    if (index !== -1) {
      submissions[index].status = normalizeStatus(status);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
      if (refresh) fetchSubmissions();
    }
  } catch (error) {
    console.error("Error updating CV status:", error);
  }
}

const refreshData = () => fetchSubmissions();

// --------------------
// Actions
// --------------------
function handleView(cv) {
  selectedCV.value = cv;
  showViewModal.value = true;
}

function closeViewModal() {
  showViewModal.value = false;
  selectedCV.value = null;
}

const showEditModal = ref(false);
const editCV = ref(null);

function handleEdit(cv) {
  editCV.value = cv;
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  editCV.value = null;
}

function handleSaveEdit(updatedCv) {
  try {
    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const id = Number(updatedCv.id);

    const index = submissions.findIndex((s) => Number(s.id) === id);
    if (index !== -1) {
      submissions[index] = {
        ...submissions[index],
        ...updatedCv,
        form_data: updatedCv.form_data || submissions[index].form_data || {},
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    }

    closeEditModal();
    fetchSubmissions();
  } catch (e) {
    console.error("Failed to save CV edit:", e);
  }
}

function handleApproveCV(cvId) {
  if (confirm("Approve this CV submission?")) {
    updateCVStatus(cvId, "approved");
    closeViewModal();
  }
}

function handleRejectCV(cvId) {
  if (confirm("Reject this CV submission?")) {
    updateCVStatus(cvId, "rejected");
    closeViewModal();
  }
}

function handleExportCV(cv) {
  console.log("Exporting CV:", cv);
  alert(`Exporting CV for ${cv.user_name} as PDF`);
}

function handleBulkApprove() {
  openBulkConfirm("bulk-approve");
}

function handleBulkReject() {
  openBulkConfirm("bulk-reject");
}

function handleBulkExport() {
  openBulkConfirm("bulk-export");
}

function handleTemplateSaved(templateData) {
  console.log("📋 Template saved:", templateData);
  showTemplateBuilder.value = false;
}

function onFilterOrSearchChanged() {
  page.value = 1;
  calculateStatusStats();
}

function onResetFilters() {
  search.value = "";
  filters.value = { status: "", type: "", startDate: "", endDate: "" };
  page.value = 1;
  calculateStatusStats();
}

const confirmState = reactive({
  open: false,
  action: null, // "bulk-approve" | "bulk-reject" | "bulk-export"
  title: "Confirm Action",
  message: "Are you sure?",
  type: "warning", // warning | success | info | danger
  confirmText: "Confirm",
  cancelText: "Cancel",
  loading: false,
  icon: AlertTriangle,
});

function openBulkConfirm(action) {
  if (!selectedCVs.value.length) return;

  confirmState.open = true;
  confirmState.loading = false;
  confirmState.action = action;

  const count = selectedCVs.value.length;

  if (action === "bulk-approve") {
    confirmState.title = `Approve ${count} selected CVs?`;
    confirmState.message =
      "This will mark all selected submissions as approved.";
    confirmState.type = "success";
    confirmState.confirmText = "Yes, Approve";
    confirmState.icon = Check;
  } else if (action === "bulk-reject") {
    confirmState.title = `Reject ${count} selected CVs?`;
    confirmState.message =
      "This will mark all selected submissions as rejected. This action may be irreversible.";
    confirmState.type = "danger";
    confirmState.confirmText = "Yes, Reject";
    confirmState.icon = X;
  } else if (action === "bulk-export") {
    confirmState.title = `Export ${count} selected CVs?`;
    confirmState.message = "This will export all selected submissions.";
    confirmState.type = "info";
    confirmState.confirmText = "Yes, Export";
    confirmState.icon = Download;
  } else {
    confirmState.title = "Confirm Action";
    confirmState.message = "Are you sure you want to continue?";
    confirmState.type = "warning";
    confirmState.confirmText = "Confirm";
    confirmState.icon = AlertTriangle;
  }
}

function closeBulkConfirm() {
  if (confirmState.loading) return;
  confirmState.open = false;
  confirmState.action = null;
}

async function onBulkConfirm() {
  confirmState.loading = true;
  try {
    if (confirmState.action === "bulk-approve") {
      selectedCVs.value.forEach((cv) =>
        updateCVStatus(cv.id, "approved", { refresh: false }),
      );
      selectedCVs.value = [];
      fetchSubmissions();
    }

    if (confirmState.action === "bulk-reject") {
      selectedCVs.value.forEach((cv) => updateCVStatus(cv.id, "rejected"));
      selectedCVs.value = [];
    }

    if (confirmState.action === "bulk-export") {
      alert(`Exporting ${selectedCVs.value.length} CVs as PDF`);
      selectedCVs.value = [];
    }

    closeBulkConfirm();
  } finally {
    confirmState.loading = false;
  }
}

// --------------------
// Lifecycle + watchers
// --------------------
onMounted(fetchSubmissions);

watch(
  filters,
  () => {
    page.value = 1;
    calculateStatusStats();
  },
  { deep: true },
);

watch([page, pageSize], () => {
  selectedCVs.value = [];
});

let searchTimeout;
watch(search, () => {
  page.value = 1;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(calculateStatusStats, 300);
});
</script>

<style scoped>
/* Tab styles */
.tab-active {
  color: #3b82f6;
  border-color: #3b82f6;
}

.tab-inactive {
  color: #6b7280;
  border-color: transparent;
}

.tab-inactive:hover {
  color: #374151;
  border-color: #d1d5db;
}

/* Loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Table row hover effect */
tr:hover {
  background-color: #f9fafb;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .text-sm {
    font-size: 0.75rem;
  }

  .px-6 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .py-4 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}
</style>
