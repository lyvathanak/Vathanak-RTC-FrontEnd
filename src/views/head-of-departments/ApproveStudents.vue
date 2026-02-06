<template>
  <div
    class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <PageHeader
      :title="t('student_leave_requests')"
      subtitle="Track and manage student leave applications">
      <div class="flex flex-col items-end gap-1">
        <span
          class="inline-flex items-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 px-3 py-1 text-xs font-semibold">
          Student Only
        </span>
      </div>
    </PageHeader>

    <AdminLeaveRequestStatus
      :pending="statusCounts.pending"
      :approved="statusCounts.approved"
      :rejected="statusCounts.rejected"
      :total="statusCounts.total" />

    <!-- Search and Filter -->
    <div class="flex flex-col">
      <div class="relative mb-3 w-full max-w-lg">
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
          :disabled="loading"
          @update:filters="handleFilterUpdate" />
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
      {{ error }}
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <LeaveRequestTable
        :leave-requests="filteredLeaveRequests"
        :loading="loading"
        @view="handleView" />
    </div>

    <!-- View Modal -->
    <ViewLeaveRequest
      v-if="showViewModal"
      :leave-request="selectedLeaveRequest"
      @close="closeViewModal"
      @updated="handleLeaveRequestUpdated" />

    <!-- Pagination -->
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { Search } from "lucide-vue-next";
import { useHodLeaveRequestStore } from "@/stores/HeadOfDepartment/hodLeaveRequest.js";
import { useI18n } from "vue-i18n";

import AdminLeaveRequestStatus from "@/components/admins/LeaveRequestManagement/AdminLeaveRequestStatus.vue";
import LeaveRequestFilter from "@/components/admins/LeaveRequestManagement/LeaveRequestFilter.vue";
import LeaveRequestTable from "@/components/admins/LeaveRequestManagement/LeaveRequestTable.vue";
import ViewLeaveRequest from "@/components/head-of-departments/ViewLeaveRequest.vue";
import Pagination from "@/components/features/Pagination.vue";
import PageHeader from "@/components/features/PageHeader.vue";

const hodStore = useHodLeaveRequestStore();
const { t } = useI18n();

const ROLE = "Student";

const allLeaveRequests = ref([]);
const loading = ref(false);
const error = ref(null);

const search = ref("");
const filters = ref({
  status: "All",
  type: "All",
  start_date: null, // YYYY-MM-DD
  end_date: null, // YYYY-MM-DD
});

const page = ref(1);
const pageSize = ref(10);

const showViewModal = ref(false);
const selectedLeaveRequest = ref(null);

const safeLower = (v) => (v ?? "").toString().toLowerCase();

const normalizeStatus = (s) => {
  const v = safeLower(s);
  if (v === "approved") return "Approved";
  if (v === "rejected") return "Rejected";
  if (v === "pending") return "Pending";
  return s || "Pending";
};

const getIdCard = (r) =>
  r?.id_card ||
  r?.user?.id_card ||
  r?.user?.user_detail?.id_card ||
  r?.user?.userDetail?.id_card ||
  r?.user_detail?.id_card ||
  r?.userDetail?.id_card ||
  "N/A";

const getLatinName = (r) =>
  r?.latin_name ||
  r?.user?.latin_name ||
  r?.user?.user_detail?.latin_name ||
  r?.user?.userDetail?.latin_name ||
  r?.user_detail?.latin_name ||
  r?.userDetail?.latin_name ||
  r?.user?.name ||
  (r?.user_id ? `User ${r.user_id}` : "Unknown");

const toISO10 = (v) => {
  if (!v) return null;
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

const transformLeaveRequestData = (request) => ({
  id: request?.id,
  id_card: getIdCard(request),
  latin_name: getLatinName(request),
  leaveType: request?.leave_type || request?.type || "N/A",
  submitDate: request?.requested_at || request?.created_at || "N/A",
  status: normalizeStatus(request?.status),
  originalData: request,
});

const inDateRange = (row) => {
  const fs = filters.value.start_date ? String(filters.value.start_date) : null;
  const fe = filters.value.end_date ? String(filters.value.end_date) : null;

  if (!fs && !fe) return true;

  const rs = toISO10(row?.originalData?.start_date);
  const re = toISO10(row?.originalData?.end_date);

  // If request missing dates, don't block it
  if (!rs || !re) return true;

  if (fs && re < fs) return false; // request ends before filter start
  if (fe && rs > fe) return false; // request starts after filter end
  return true;
};

const applyClientSideFilters = (requests) => {
  let filtered = [...requests];

  if (search.value.trim()) {
    const term = safeLower(search.value.trim());
    filtered = filtered.filter(
      (r) =>
        safeLower(r.id_card).includes(term) ||
        safeLower(r.latin_name).includes(term) ||
        safeLower(r.leaveType).includes(term),
    );
  }

  if (filters.value.status && filters.value.status !== "All") {
    const s = safeLower(filters.value.status);
    filtered = filtered.filter((r) => safeLower(r.status) === s);
  }

  if (filters.value.type && filters.value.type !== "All") {
    const tp = safeLower(filters.value.type);
    filtered = filtered.filter((r) => safeLower(r.leaveType) === tp);
  }

  filtered = filtered.filter(inDateRange);

  return filtered;
};

const filteredLeaveRequests = computed(() => {
  const filtered = applyClientSideFilters(allLeaveRequests.value);
  const start = (page.value - 1) * pageSize.value;
  return filtered.slice(start, start + pageSize.value);
});

const totalFilteredItems = computed(
  () => applyClientSideFilters(allLeaveRequests.value).length,
);

const statusCounts = computed(() => {
  const list = applyClientSideFilters(allLeaveRequests.value);
  return {
    pending: list.filter((r) => safeLower(r.status) === "pending").length,
    approved: list.filter((r) => safeLower(r.status) === "approved").length,
    rejected: list.filter((r) => safeLower(r.status) === "rejected").length,
    total: list.length,
  };
});

const fetchStudentLeaveRequests = async () => {
  loading.value = true;
  error.value = null;

  try {
    await hodStore.fetchLeaveRequests({
      per_page: 1000,
      page: 1,
      role: ROLE,
    });

    allLeaveRequests.value = (hodStore.leaveRequests || []).map(
      transformLeaveRequestData,
    );

    page.value = 1;
  } catch (err) {
    error.value = hodStore.error || "Failed to fetch student leave requests";
    allLeaveRequests.value = [];
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleView = (row) => {
  selectedLeaveRequest.value = row?.originalData || row; // ✅ raw request
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedLeaveRequest.value = null;
};

const handleLeaveRequestUpdated = async () => {
  await fetchStudentLeaveRequests();
  closeViewModal();
};

const handleFilterUpdate = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters };
  page.value = 1;
};

watch(search, () => (page.value = 1));
watch(filters, () => (page.value = 1), { deep: true });

onMounted(fetchStudentLeaveRequests);
</script>
