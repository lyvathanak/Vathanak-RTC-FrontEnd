<template>
  <div
    class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1
          :class="[
            'text-lg sm:text-xl md:text-2xl font-bold text-[#235AA6]',
            locale === 'kh' ? 'khmer-text' : '',
          ]">
          {{ t("leave_request_management") }}
        </h1>
        <p class="text-gray-500">Track and manage your leave applications</p>
      </div>

      <!-- Add Leave Button -->
      <button
        @click="showForm = true"
        class="bg-[#235AA6] text-white hover:bg-[#1f4f93] px-4 py-2 rounded-lg shadow transition">
        + Add Leave Request
      </button>
    </div>

    <!-- Status Bar -->
    <AdminLeaveRequestStatus
      :pending="statusCounts.pending"
      :approved="statusCounts.approved"
      :rejected="statusCounts.rejected"
      :total="statusCounts.total" />

    <!-- Search and Filter -->
    <div class="flex flex-col">
      <div class="relative mb-3 w-full max-w-lg">
        <input
          v-model="search"
          type="text"
          placeholder="Search by name, ID, or leave type..."
          :disabled="loading"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base" />
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
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
        <LeaveRequestStudentForm
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
import { Search } from "lucide-vue-next";
import { getStudentLeaveRequestsService } from "@/stores/Student/LeaveRequestFrom.js";
import { useI18n } from "vue-i18n";
import AdminLeaveRequestStatus from "@/components/admins/LeaveRequestManagement/AdminLeaveRequestStatus.vue";
import LeaveRequestFilter from "@/components/admins/LeaveRequestManagement/LeaveRequestFilter.vue";
import LeaveRequestTable from "@/components/admins/LeaveRequestManagement/LeaveRequestTable.vue";
import ViewLeaveRequestForm from "@/components/students/ViewLeaveRequestForm.vue";
import LeaveRequestStudentForm from "@/components/features/LeaveRequestStudentForm.vue";
import Pagination from "@/components/features/Pagination.vue";

// Reactive state
const showForm = ref(false);
const allLeaveRequests = ref([]);
const loading = ref(false);
const error = ref(null);
const search = ref("");
const filters = ref({});
const page = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const showViewModal = ref(false);
const selectedLeaveRequest = ref(null);
const statusStats = ref({ pending: 0, approved: 0, rejected: 0, total: 0 });
const { t, locale } = useI18n();

// Fetch teacher leave requests
const fetchLeaveRequests = async () => {
  loading.value = true;
  error.value = null;

  try {
    const {
      success,
      requests,
      error: apiError,
    } = await getStudentLeaveRequestsService();

    if (success) {
      allLeaveRequests.value = requests.map(transformLeaveRequestData);
      totalItems.value = requests.length;
      calculateStatusStats();
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

// Transform API data to table row
const transformLeaveRequestData = (request) => ({
  id_card: request.id_card || "N/A",
  latin_name: request.latin_name || `User ${request.user_id}` || "Unknown User",
  leaveType: request.type || "N/A",
  submitDate: request.requested_at || "N/A",
  status: capitalizeFirst(request.status) || "Pending",
  originalData: request,
});

// Capitalize first letter
const capitalizeFirst = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

// Apply search and filters
const applyClientSideFilters = (requests) => {
  let filtered = [...requests];

  if (search.value.trim()) {
    const s = search.value.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.id_card?.toLowerCase().includes(s) ||
        r.latin_name?.toLowerCase().includes(s) ||
        r.leaveType?.toLowerCase().includes(s)
    );
  }

  if (filters.value.status && filters.value.status !== "All") {
    filtered = filtered.filter(
      (r) => r.status.toLowerCase() === filters.value.status.toLowerCase()
    );
  }

  if (filters.value.type && filters.value.type !== "All") {
    filtered = filtered.filter(
      (r) => r.leaveType.toLowerCase() === filters.value.type.toLowerCase()
    );
  }

  return filtered;
};

// Compute filtered leave requests with pagination
const filteredLeaveRequests = computed(() => {
  const filtered = applyClientSideFilters(allLeaveRequests.value);
  const start = (page.value - 1) * pageSize.value;
  return filtered.slice(start, start + pageSize.value);
});

const totalFilteredItems = computed(
  () => applyClientSideFilters(allLeaveRequests.value).length
);
const statusCounts = computed(() => statusStats.value);

// Calculate status counts
const calculateStatusStats = () => {
  const filtered = applyClientSideFilters(allLeaveRequests.value);
  statusStats.value = {
    pending: filtered.filter((r) => r.status.toLowerCase() === "pending")
      .length,
    approved: filtered.filter((r) => r.status.toLowerCase() === "approved")
      .length,
    rejected: filtered.filter((r) => r.status.toLowerCase() === "rejected")
      .length,
    total: filtered.length,
  };
};

// Modal handlers
function handleView(row) {
  selectedLeaveRequest.value = row;
  showViewModal.value = true;
}
function closeViewModal() {
  showViewModal.value = false;
  selectedLeaveRequest.value = null;
}
function handleLeaveRequestUpdated() {
  fetchLeaveRequests();
  closeViewModal();
}
function handleFilterUpdate(newFilters) {
  filters.value = newFilters;
  page.value = 1;
  calculateStatusStats();
}
const handleNewLeave = async () => {
  showForm.value = false;
  await fetchLeaveRequests();
};

// Disable scrolling when modal open
watch(
  showForm,
  (val) => (document.body.style.overflow = val ? "hidden" : "auto")
);

// Debounce search
let searchTimeout;
watch(search, () => {
  page.value = 1;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(calculateStatusStats, 300);
});

// Initial fetch
onMounted(fetchLeaveRequests);
</script>
