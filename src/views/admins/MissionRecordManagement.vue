<template>
  <div
    class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <PageHeader
      :title="t('mission_record_management')"
      subtitle="Track and manage your mission applications">
      <button
        @click="showCreateForm = true"
        class="inline-flex items-center px-4 py-2 bg-[#235AA6] text-white rounded-lg hover:bg-[#1E4A78] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base">
        <Plus class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        Assign New Mission
      </button>
    </PageHeader>

    <!-- Status Summary -->
    <MissionStatusSummary :stats="statusStats" />

    <!-- Search and Filters -->
    <MissionFilters
      v-model:search="search"
      v-model:filters="filters"
      :loading="loading"
      @change="onFilterOrSearchChanged"
      @reset="onResetFromChild" />

    <!-- Mission Records Table -->
    <MissionTable
      :missions="paginatedMissions"
      :total="pagination.total"
      :loading="loading"
      :formatDate="formatDate"
      :formatStatus="formatStatus"
      :getStatusClass="getStatusClass"
      :getTypeClass="getTypeClass"
      :canEditMission="canEditMission"
      :canCancelMission="canCancelMission"
      :canCompleteMission="canCompleteMission"
      :emptyText="
        search || Object.values(filters).some((v) => v !== 'all' && v)
          ? 'No missions match your search criteria.'
          : 'No missions have been assigned to teachers yet.'
      "
      @view="handleView"
      @edit="handleEdit"
      @cancel="handleCancel"
      @complete="handleComplete"
      @download="handleDownloadReport" />

    <ConfirmDialog
      :open="dialog.open"
      :title="dialog.title"
      :message="dialog.message"
      :type="dialog.type"
      :confirmText="dialog.confirmText"
      :cancelText="dialog.cancelText"
      :loading="dialog.loading"
      :icon="dialog.icon"
      @close="closeDialog"
      @confirm="onDialogConfirm" />

    <!-- Pagination -->
    <div>
      <Pagination
        :current-page="Number(pagination.current_page || 1)"
        :total-items="Number(pagination.total || 0)"
        :page-size="Number(pagination.per_page || 10)"
        :last-page="Number(pagination.last_page || 1)"
        :page-size-options="[5, 10, 25, 50]"
        item-label="missions"
        @update:currentPage="handlePageChange"
        @update:pageSize="handlePageSizeChange" />
    </div>

    <!-- Create Mission Form Modal -->
    <CreateMissionForm
      v-if="showCreateForm"
      @close="showCreateForm = false"
      @saved="handleMissionSaved" />

    <!-- Edit Mission Form Modal -->
    <EditMissionForm
      v-if="showEditForm && selectedMission"
      :key="selectedMission?.id"
      :mission="selectedMission"
      @close="showEditForm = false"
      @saved="handleMissionSaved" />

    <!-- Mission Details Modal -->
    <MissionDetails
      v-if="showDetailsModal"
      :mission="selectedMission"
      @close="showDetailsModal = false"
      @cancelled="handleMissionCancelled"
      @completed="handleMissionCompleted" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { Plus, AlertTriangle, CheckCircle2, Download } from "lucide-vue-next";
import { showNotification } from "@/lib/notifications.js";
import { useI18n } from "vue-i18n";

import ConfirmDialog from "@/components/features/ConfirmDialog.vue";
import Pagination from "@/components/features/Pagination.vue";
import CreateMissionForm from "@/components/admins/Mission/MissionForm.vue";
import EditMissionForm from "@/components/admins/Mission/EditMissionForm.vue";
import MissionDetails from "@/components/admins/Mission/MissionDetails.vue";
import MissionStatusSummary from "@/components/admins/Mission/MissionStatusSummary.vue";
import MissionFilters from "@/components/admins/Mission/MissionFilters.vue";
import MissionTable from "@/components/admins/Mission/MissionTable.vue";
import PageHeader from "@/components/features/PageHeader.vue";
import missionApi from "@/stores/apis/missionApi.js";

const { t } = useI18n();

// ===================== STATE =====================
const missions = ref([]);
const loading = ref(false);

const search = ref("");
const filters = ref({
  status: "all",
  type: "all",
  startDate: "",
  endDate: "",
});

const pagination = ref({
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
});

const statusCounts = ref({
  pending: 0,
  in_progress: 0,
  overdue: 0,
  completed: 0,
  cancelled: 0,
});

const statusStats = computed(() => ({
  total: Number(pagination.value.total || 0),
  ...statusCounts.value,
}));

// ===================== MODALS =====================
const showCreateForm = ref(false);
const showEditForm = ref(false);
const showDetailsModal = ref(false);
const selectedMission = ref(null);

// ===================== HELPERS =====================
const normalizeMissionType = (v) => {
  if (!v || v === "all") return null;

  const map = {
    Conference: "conference",
    Training: "training",
    "Field Trip": "field_trip",
    Research: "research",
    Meeting: "meeting",
    Workshop: "workshop",
    Seminar: "seminar",
  };

  if (v.includes("_") || v === v.toLowerCase()) return v;
  return map[v] || v.toLowerCase().replace(/\s+/g, "_");
};

// ===================== FETCH =====================
const fetchMissions = async () => {
  loading.value = true;

  try {
    const typeParam = normalizeMissionType(filters.value.type);

    const params = {
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
      ...(typeParam && { mission_type: typeParam }),
      ...(filters.value.status !== "all" && { status: filters.value.status }),
      ...(search.value?.trim() && { search: search.value.trim() }),
      ...(filters.value.startDate && { start_date: filters.value.startDate }),
      ...(filters.value.endDate && { end_date: filters.value.endDate }),
    };

    const response = await missionApi.getAllMissions(params);

    if (response?.status === "success") {
      missions.value = response.missions || [];

      statusCounts.value = response.total_per_status || {
        pending: 0,
        in_progress: 0,
        overdue: 0,
        completed: 0,
        cancelled: 0,
      };

      const p = response.pagination || {};
      pagination.value = {
        current_page: Number(p.current_page ?? 1),
        per_page: Number(p.per_page ?? 10),
        last_page: Number(p.last_page ?? 1),
        total: Number(p.total ?? response.total ?? 0),
      };
    } else {
      missions.value = [];
      pagination.value.total = 0;
      statusCounts.value = {
        pending: 0,
        in_progress: 0,
        overdue: 0,
        completed: 0,
        cancelled: 0,
      };
    }
  } catch (e) {
    console.error("Error fetching missions:", e);
    missions.value = [];
    pagination.value.total = 0;
    statusCounts.value = {
      pending: 0,
      in_progress: 0,
      overdue: 0,
      completed: 0,
      cancelled: 0,
    };
  } finally {
    loading.value = false;
  }
};

// ===================== DEBOUNCE (single source) =====================
let timer = null;
const debouncedFetch = () => {
  clearTimeout(timer);
  timer = setTimeout(fetchMissions, 350);
};

// ===================== WATCHERS =====================
// Filters/search => reset page then fetch
watch(
  () => [
    search.value,
    filters.value.status,
    filters.value.type,
    filters.value.startDate,
    filters.value.endDate,
  ],
  () => {
    pagination.value.current_page = 1;
    debouncedFetch();
  },
);

// Pagination only => fetch (no reset)
watch(
  () => [pagination.value.current_page, pagination.value.per_page],
  () => {
    debouncedFetch();
  },
);

// Initial load (ONLY ONCE)
onMounted(fetchMissions);

// ===================== COMPUTED =====================
// If backend already filters, you can just `return missions.value`.
// Keep this if you want extra safety (client-side filter fallback).
const paginatedMissions = computed(() => {
  const typeParam = normalizeMissionType(filters.value.type);
  if (!typeParam) return missions.value;

  return missions.value.filter(
    (m) => normalizeMissionType(m.mission_type) === typeParam,
  );
});

// ===================== ACTIONS =====================
const onFilterOrSearchChanged = () => {}; // watchers handle it

const handlePageChange = (page) => {
  pagination.value.current_page = page;
};

const handlePageSizeChange = (size) => {
  pagination.value.per_page = size;
  pagination.value.current_page = 1;
};

const resetFilters = () => {
  filters.value = { status: "all", type: "all", startDate: "", endDate: "" };
  search.value = "";
  pagination.value.current_page = 1;
  fetchMissions();
};

const onResetFromChild = () => resetFilters();

// ===== status logic =====
const isStarted = (mission) => {
  if (!mission?.assigned_date) return false;
  if (mission.status !== "pending") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const assignedDate = new Date(mission.assigned_date);
  assignedDate.setHours(0, 0, 0, 0);

  return assignedDate <= today;
};

const isOverdue = (mission) => {
  if (!mission?.due_date) return false;
  if (!(mission.status === "pending" || mission.status === "in_progress"))
    return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(mission.due_date);
  deadline.setHours(0, 0, 0, 0);

  return deadline < today;
};

// permissions
const canEditMission = (mission) =>
  !!mission &&
  (mission.status === "pending" ||
    mission.status === "in_progress" ||
    isOverdue(mission) ||
    isStarted(mission));

const canCancelMission = (mission) =>
  !!mission &&
  (mission.status === "pending" ||
    mission.status === "in_progress" ||
    isStarted(mission));

const canCompleteMission = (mission) =>
  !!mission &&
  (mission.status === "in_progress" ||
    mission.status === "overdue" ||
    isOverdue(mission) ||
    isStarted(mission));

// view/edit
const handleView = (mission) => {
  selectedMission.value = mission;
  showDetailsModal.value = true;
};

const handleEdit = (mission) => {
  selectedMission.value = mission;
  showEditForm.value = true;
};

// ===== dialog =====
const dialog = ref({
  open: false,
  type: "warning",
  title: "",
  message: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  loading: false,
  icon: AlertTriangle,
  payload: null,
  action: null,
});

const openCancelDialog = (missionId) => {
  dialog.value = {
    open: true,
    type: "danger",
    title: "Cancel this mission?",
    message: "This action will mark the mission as cancelled.",
    confirmText: "Yes, Cancel",
    cancelText: "No",
    loading: false,
    icon: AlertTriangle,
    payload: missionId,
    action: "cancel",
  };
};

const openCompleteDialog = (missionId) => {
  dialog.value = {
    open: true,
    type: "success",
    title: "Mark mission as complete?",
    message: "This will set the mission status to completed.",
    confirmText: "Yes, Complete",
    cancelText: "Not yet",
    loading: false,
    icon: CheckCircle2,
    payload: missionId,
    action: "complete",
  };
};

const openDownloadDialog = (mission) => {
  dialog.value = {
    open: true,
    type: "info",
    title: "Download mission report?",
    message: `Download report for: ${mission?.mission_title || "this mission"}?`,
    confirmText: "Download",
    cancelText: "Cancel",
    loading: false,
    icon: Download,
    payload: mission,
    action: "download",
  };
};

const closeDialog = () => {
  dialog.value.open = false;
  dialog.value.loading = false;
  dialog.value.payload = null;
  dialog.value.action = null;
};

const handleCancel = (mission) => openCancelDialog(mission.id);
const handleComplete = (mission) => openCompleteDialog(mission.id);
const handleDownloadReport = (mission) => openDownloadDialog(mission);

const onDialogConfirm = async () => {
  dialog.value.loading = true;

  try {
    if (dialog.value.action === "cancel") {
      const res = await missionApi.cancelMission(dialog.value.payload);
      if (res?.status === "success") fetchMissions();
    }

    if (dialog.value.action === "complete") {
      const res = await missionApi.completeMission(dialog.value.payload);
      if (res?.status === "success") fetchMissions();
      else
        showNotification(res?.message || "Failed to complete mission", "error");
    }

    if (dialog.value.action === "download") {
      const mission = dialog.value.payload;
      showNotification(
        `Downloading report for: ${mission.mission_title}`,
        "info",
      );
    }

    closeDialog();
  } catch (e) {
    console.error(e);
    showNotification("Something went wrong. Please try again.", "error");
    dialog.value.loading = false;
  }
};

// ===== after save/cancel/complete from modals =====
const handleMissionSaved = async () => {
  await fetchMissions();
  showNotification("Mission saved successfully!", "success");
  showCreateForm.value = false;
  showEditForm.value = false;
  showDetailsModal.value = false;
};

const handleMissionCancelled = () => {
  fetchMissions();
  showNotification("Mission cancelled successfully!", "success");
};

const handleMissionCompleted = () => {
  fetchMissions();
  showNotification("Mission completed successfully!", "success");
};

// ===== formatting =====
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [dd, mm, yyyy] = dateString.split("-");
    const date = new Date(`${yyyy}-${mm}-${dd}`);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (/^\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(dateString)) {
    const [d, t] = dateString.split(" ");
    const [dd, mm, yyyy] = d.split("-");
    const date = new Date(`${yyyy}-${mm}-${dd}T${t}`);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (mission) => {
  if (!mission?.status) return "";

  if (isOverdue(mission)) return "Overdue";
  if (isStarted(mission)) return "In Progress";

  const statusMap = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return statusMap[mission.status] || mission.status;
};

const getStatusClass = (mission) => {
  if (!mission?.status) return "bg-gray-100 text-gray-800";
  if (isOverdue(mission)) return "bg-orange-100 text-orange-800";
  if (isStarted(mission)) return "bg-blue-100 text-blue-800";

  switch (mission.status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeClass = (type) => {
  const tt = (type || "").toLowerCase();
  if (tt.includes("conference")) return "bg-purple-100 text-purple-800";
  if (tt.includes("training")) return "bg-indigo-100 text-indigo-800";
  if (tt.includes("field")) return "bg-green-100 text-green-800";
  if (tt.includes("research")) return "bg-blue-100 text-blue-800";
  if (tt.includes("meeting")) return "bg-teal-100 text-teal-800";
  return "bg-gray-100 text-gray-800";
};
</script>
