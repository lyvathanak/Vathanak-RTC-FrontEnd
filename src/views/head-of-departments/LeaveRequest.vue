<template>
  <div
    class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <!-- Header -->
    <PageHeader
      :title="t('teacher_leave_requests')"
      subtitle="Track and manage your leave applications"
      >`

      <!-- Add Leave Button -->
      <div class="flex flex-col items-end gap-1">
        <button
          v-if="!reachedLeaveLimit"
          @click="showForm = true"
          class="inline-flex items-center gap-2 bg-[#235AA6] text-white hover:bg-[#1f4f93] px-4 py-2 rounded-lg shadow transition">
          <Plus class="w-4 h-4" />
          {{ t("add_leave_request") }}
        </button>

        <!-- Disabled when limit reached -->
        <button
          v-else
          disabled
          class="inline-flex items-center gap-2 bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed">
          <Lock class="w-4 h-4" />
          {{ t("leave_limit_reached") }}
        </button>

        <!-- 🔥 Remaining requests -->
        <p v-if="!reachedLeaveLimit" class="text-xs text-gray-500">
          Remaining approved leaves for {{ new Date().getFullYear() }}:
          <span class="font-semibold text-[#235AA6]">
            {{ remainingRequests }}
          </span>
          / {{ MAX_LEAVE_REQUESTS }} ({{ currentYearLeaveCount }} approved this
          year)
        </p>

        <!-- Limit reached message -->
        <p v-else class="text-xs text-red-500">
          You have reached the maximum of {{ MAX_LEAVE_REQUESTS }} approved
          leave requests for {{ new Date().getFullYear() }}.
        </p>
      </div>
    </PageHeader>

    <!-- Status Bar -->
    <AdminLeaveRequestStatus
      :pending="statusCounts.pending"
      :approved="statusCounts.approved"
      :rejected="statusCounts.rejected"
      :total="statusCounts.total" />

    <!-- Search and Filter -->
    <div class="flex flex-col">
      <div class="relative mb-3 w-full max-w-lg">
        <!-- Search icon -->
        <Search
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />

        <input
          v-model="search"
          type="text"
          placeholder="Search by name, ID, or leave type..."
          :disabled="loading"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#235AA6] shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base" />

        <button
          v-if="search && search.trim().length"
          type="button"
          :disabled="loading"
          @click="search = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          aria-label="Clear search">
          ✕
        </button>
      </div>
      <div class="w-full mt-3">
        <LeaveRequestFilter
          :enabled-filters="['status', 'type', 'date']"
          @update:filters="handleFilterUpdate"
          :disabled="loading" />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <LeaveRequestTable
        :leave-requests="filteredLeaveRequests"
        :loading="loading"
        @view="handleView" />
    </div>

    <!-- View Leave Request Modal -->
    <ViewLeaveRequestForm
      v-if="showViewModal"
      :leave-request="selectedLeaveRequest"
      @close="closeViewModal"
      @updated="handleLeaveRequestUpdated" />

    <!-- Add Leave Request Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        class="relative w-full max-w-3xl bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        <LeaveRequestHODForm
          @close="showForm = false"
          @submit="handleNewLeave" />
      </div>
    </div>

    <!-- Pagination -->
    <div>
      <Pagination
        :current-page="page"
        :total-items="totalFilteredItems"
        :page-size="pageSize"
        :page-size-options="[5, 10, 25, 50]"
        item-label="requests"
        @update:currentPage="(val) => (page = val)"
        @update:pageSize="
          (val) => {
            pageSize = val;
            page = 1;
          }
        " />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { Search, Plus, Lock, ClipboardList } from "lucide-vue-next";
import { getSHODLeaveRequestsService } from "@/stores/HeadOfDepartment/LeaveRequestFrom.js";
import { useI18n } from "vue-i18n";

import AdminLeaveRequestStatus from "@/components/admins/LeaveRequestManagement/AdminLeaveRequestStatus.vue";
import LeaveRequestFilter from "@/components/admins/LeaveRequestManagement/LeaveRequestFilter.vue";
import LeaveRequestTable from "@/components/admins/LeaveRequestManagement/LeaveRequestTable.vue";
import ViewLeaveRequestForm from "@/components/head-of-departments/ViewLeaveRequestForm.vue";
import LeaveRequestHODForm from "@/components/features/LeaveRequestHODForm.vue";
import Pagination from "@/components/features/Pagination.vue";
import PageHeader from "@/components/features/PageHeader.vue";

// Constants
const MAX_LEAVE_REQUESTS = 18;
const currentYear = new Date().getFullYear();

// Reactive state
const showForm = ref(false);
const allLeaveRequests = ref([]);
const loading = ref(false);
const error = ref(null);
const search = ref("");
const filters = ref({});
const page = ref(1);
const pageSize = ref(10);
const showViewModal = ref(false);
const selectedLeaveRequest = ref(null);

const { t, locale } = useI18n();

// For yearly limit counting - only approved requests
const currentYearApprovedRequests = computed(() => {
  return allLeaveRequests.value.filter((request) => {
    const status = request.originalData?.originalStatus?.toLowerCase();
    const requestedAt = request.originalData?.requested_at;

    if (!requestedAt) return false;

    // Extract year from date string
    const yearMatch = requestedAt.match(/\b(\d{4})\b/);
    if (!yearMatch) return false;

    const requestYear = parseInt(yearMatch[1]);
    const isCurrentYear = requestYear === currentYear;
    const isApproved = status === "approved";

    return isCurrentYear && isApproved;
  });
});

// For status counts - all current year requests regardless of status
const currentYearAllRequests = computed(() => {
  return allLeaveRequests.value.filter((request) => {
    const requestedAt = request.originalData?.requested_at;

    if (!requestedAt) return false;

    const yearMatch = requestedAt.match(/\b(\d{4})\b/);
    if (!yearMatch) return false;

    const requestYear = parseInt(yearMatch[1]);
    return requestYear === currentYear;
  });
});

const currentYearLeaveCount = computed(
  () => currentYearApprovedRequests.value.length,
);

const remainingRequests = computed(() =>
  Math.max(0, MAX_LEAVE_REQUESTS - currentYearLeaveCount.value),
);

const reachedLeaveLimit = computed(
  () => currentYearLeaveCount.value >= MAX_LEAVE_REQUESTS,
);

const filteredLeaveRequests = computed(() => {
  const filtered = applyClientSideFilters(allLeaveRequests.value);
  const start = (page.value - 1) * pageSize.value;
  return filtered.slice(start, start + pageSize.value);
});

const totalFilteredItems = computed(
  () => applyClientSideFilters(allLeaveRequests.value).length,
);

const statusCounts = computed(() => {
  const allCurrentYear = currentYearAllRequests.value;

  return {
    pending: allCurrentYear.filter((r) => r.status.toLowerCase() === "pending")
      .length,
    approved: allCurrentYear.filter(
      (r) => r.status.toLowerCase() === "approved",
    ).length,
    rejected: allCurrentYear.filter(
      (r) => r.status.toLowerCase() === "rejected",
    ).length,
    total: allCurrentYear.length,
  };
});

// Functions
const isRequestFromCurrentYear = (request) => {
  const dateStr = request.originalData?.requested_at;
  if (!dateStr) return false;

  try {
    let year;

    // Try different date formats
    if (dateStr.includes("-")) {
      const [datePart] = dateStr.split(" ");
      const [, , yearPart] = datePart.split("-");
      year = parseInt(yearPart);
    } else if (dateStr.includes("/")) {
      const [, , yearPart] = dateStr.split("/");
      year = parseInt(yearPart);
    } else {
      const date = new Date(dateStr);
      year = date.getFullYear();
    }

    return year === currentYear;
  } catch (e) {
    console.error("Date parsing error:", e, "for date string:", dateStr);
    return false;
  }
};

const transformLeaveRequestData = (request) => {
  const status = request.status?.toLowerCase() || "pending";

  return {
    id_card: request.id_card || "N/A",
    latin_name:
      request.latin_name || `User ${request.user_id}` || "Unknown User",
    leaveType: request.type || "N/A",
    submitDate: request.requested_at || "N/A",
    status: capitalizeFirst(request.status) || "Pending",
    originalData: {
      ...request,
      originalStatus: status,
    },
  };
};

const capitalizeFirst = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const applyClientSideFilters = (requests) => {
  let filtered = [...requests];

  if (search.value.trim()) {
    const searchTerm = search.value.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.id_card?.toLowerCase().includes(searchTerm) ||
        r.latin_name?.toLowerCase().includes(searchTerm) ||
        r.leaveType?.toLowerCase().includes(searchTerm),
    );
  }

  if (filters.value.status && filters.value.status !== "All") {
    filtered = filtered.filter(
      (r) => r.status.toLowerCase() === filters.value.status.toLowerCase(),
    );
  }

  if (filters.value.type && filters.value.type !== "All") {
    filtered = filtered.filter(
      (r) => r.leaveType.toLowerCase() === filters.value.type.toLowerCase(),
    );
  }

  return filtered;
};

const fetchLeaveRequests = async () => {
  loading.value = true;
  error.value = null;

  try {
    const {
      success,
      requests,
      error: apiError,
    } = await getSHODLeaveRequestsService();

    if (success) {
      allLeaveRequests.value = requests.map(transformLeaveRequestData);
    } else {
      error.value = apiError || "Failed to fetch leave requests";
      allLeaveRequests.value = [];
    }
  } catch (err) {
    error.value = "Failed to fetch leave requests";
    console.error("Error fetching leave requests:", err);
    allLeaveRequests.value = [];
  } finally {
    loading.value = false;
  }
};

// Event handlers
const handleView = (row) => {
  selectedLeaveRequest.value = row;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedLeaveRequest.value = null;
};

const handleLeaveRequestUpdated = () => {
  fetchLeaveRequests();
  closeViewModal();
};

const handleFilterUpdate = (newFilters) => {
  filters.value = newFilters;
  page.value = 1;
};

const handleNewLeave = async () => {
  showForm.value = false;
  await fetchLeaveRequests();
};

// Watchers
watch(showForm, (val) => {
  document.body.style.overflow = val ? "hidden" : "auto";
});

let searchTimeout;
watch(search, () => {
  page.value = 1;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // Trigger any necessary recalculations
  }, 300);
});

// Lifecycle
onMounted(async () => {
  await fetchLeaveRequests();
});
</script>
