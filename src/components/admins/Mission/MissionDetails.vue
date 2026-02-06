<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] p-3 sm:p-6"
    @click.self="handleClose">
    <!-- Modal -->
    <div
      class="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[90vh] flex flex-col"
      role="dialog"
      aria-modal="true">
      <!-- Header (sticky) -->
      <header
        class="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur px-5 sm:px-6 py-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
              <ClipboardList class="h-5 w-5 text-indigo-600" />
            </div>

            <div>
              <h3 class="text-lg sm:text-xl font-semibold text-gray-900">
                Mission Details
              </h3>
              <p class="mt-0.5 text-sm text-gray-500">
                View mission metadata, assigned teachers, and actions.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="handleClose"
            class="rounded-xl p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close">
            <X class="h-6 w-6" />
          </button>
        </div>
      </header>

      <!-- Body -->
      <section class="px-5 sm:px-6 py-5 sm:py-6 flex-1 overflow-y-auto">
        <!-- Top summary strip -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
          <div class="flex items-center gap-3">
            <div class="text-sm text-gray-500">Mission</div>
            <div class="text-base font-semibold text-gray-900">
              #{{ mission?.id ?? "—" }}
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span
              :class="[
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1',
                statusPillClass(mission?.status),
              ]">
              <span
                :class="[
                  'h-2 w-2 rounded-full',
                  statusDotClass(mission?.status),
                ]" />
              {{ formatStatus(mission?.status) }}
            </span>

            <span
              v-if="isOverdue(mission)"
              class="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 ring-1 ring-red-100"
              title="This mission is past due date.">
              <AlertTriangle class="h-4 w-4" />
              Overdue
            </span>
          </div>
        </div>

        <!-- Content grid -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Mission Title -->
          <div class="rounded-2xl border border-gray-100 bg-white p-4">
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
                <FileText class="h-4 w-4 text-gray-600" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-500 mb-1">
                  Mission Title
                </p>
                <p
                  class="text-base font-semibold text-gray-900 leading-snug wrap-break-words">
                  {{ mission?.mission_title || "—" }}
                </p>
              </div>
            </div>
          </div>

          <!-- Type -->
          <div class="rounded-2xl border border-gray-100 bg-white p-4">
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
                <Tag class="h-4 w-4 text-gray-600" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-500 mb-1">Type</p>
                <p class="text-sm font-semibold text-gray-900">
                  {{ mission?.mission_type || "—" }}
                </p>
              </div>
            </div>
          </div>

          <!-- Assigned Date -->
          <div class="rounded-2xl border border-gray-100 bg-white p-4">
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
                <CalendarDays class="h-4 w-4 text-gray-600" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-500 mb-1">
                  Assigned Date
                </p>
                <p class="text-sm font-semibold text-gray-900">
                  {{ formatDate(mission?.assigned_date) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Due Date -->
          <div class="rounded-2xl border border-gray-100 bg-white p-4">
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
                <CalendarClock class="h-4 w-4 text-gray-600" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-500 mb-1">Due Date</p>
                <p class="text-sm font-semibold text-gray-900">
                  {{ formatDate(mission?.due_date) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="rounded-2xl border border-gray-100 bg-white p-4">
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
                <MapPin class="h-4 w-4 text-gray-600" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-500 mb-1">Location</p>
                <p class="text-sm font-semibold text-gray-900 wrap-break-words">
                  {{ mission?.location || "Not specified" }}
                </p>
              </div>
            </div>
          </div>

          <!-- Budget -->
          <div class="rounded-2xl border border-gray-100 bg-white p-4">
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
                <DollarSign class="h-4 w-4 text-gray-600" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-500 mb-1">Budget</p>
                <p class="text-sm font-semibold text-gray-900">
                  {{ mission?.budget ? "$" + mission.budget : "Not specified" }}
                </p>
              </div>
            </div>
          </div>

          <!-- Teachers -->
          <div class="md:col-span-2">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <Users class="h-4 w-4 text-gray-400" />
                <p class="text-sm font-medium text-gray-500">
                  Assigned Teachers
                </p>
              </div>
              <span class="text-xs font-semibold text-gray-500">
                {{ mission?.users?.length || 0 }} total
              </span>
            </div>

            <div class="mt-2 rounded-2xl border border-gray-100 bg-white p-3">
              <div
                v-if="mission?.users?.length"
                class="max-h-48 overflow-auto pr-1">
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="user in mission.users"
                    :key="user.id"
                    class="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 hover:bg-gray-100 transition">
                    <div
                      class="flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 text-xs font-bold text-gray-700"
                      title="Teacher">
                      {{ initials(user.name) }}
                    </div>
                    <div class="leading-tight">
                      <p class="text-sm font-semibold text-gray-900">
                        {{ user.name }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ user.email }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p v-else class="text-gray-500 italic text-sm py-3">
                No teachers assigned
              </p>
            </div>
          </div>

          <!-- Description -->
          <div class="md:col-span-2">
            <div class="flex items-center gap-2">
              <AlignLeft class="h-4 w-4 text-gray-400" />
              <p class="text-sm font-medium text-gray-500">Description</p>
            </div>

            <div
              class="mt-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 pr-2 max-h-45 overflow-y-auto">
              <p
                class="whitespace-pre-line text-sm text-gray-900 leading-relaxed">
                {{ mission?.description || "No description provided" }}
              </p>
            </div>
          </div>

          <!-- Audit -->
          <div v-if="mission?.created_at" class="md:col-span-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="rounded-2xl border border-gray-100 bg-white p-4">
                <div class="flex items-center gap-2 mb-1">
                  <Clock class="h-4 w-4 text-gray-400" />
                  <p class="text-sm font-medium text-gray-500">Created At</p>
                </div>
                <p class="text-sm font-semibold text-gray-900">
                  {{ formatDateTime(mission.created_at) }}
                </p>
              </div>

              <div
                v-if="mission?.updated_at"
                class="rounded-2xl border border-gray-100 bg-white p-4">
                <div class="flex items-center gap-2 mb-1">
                  <Clock3 class="h-4 w-4 text-gray-400" />
                  <p class="text-sm font-medium text-gray-500">Last Updated</p>
                </div>
                <p class="text-sm font-semibold text-gray-900">
                  {{ formatDateTime(mission.updated_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="border-t border-gray-100 bg-white px-5 sm:px-6 py-4">
        <div class="flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            @click="handleClose"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            :disabled="loading">
            <X class="h-4 w-4" />
            Close
          </button>

          <button
            v-if="mission?.status === 'pending'"
            type="button"
            @click="handleCancel"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60"
            :disabled="loading">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            <Ban v-else class="h-4 w-4" />
            Cancel Mission
          </button>

          <button
            v-if="
              mission?.status === 'in_progress' || mission?.status === 'overdue'
            "
            type="button"
            @click="handleComplete"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
            :disabled="loading">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            <CheckCircle2 v-else class="h-4 w-4" />
            Mark as Complete
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import missionApi from "@/stores/apis/missionApi.js";
import {
  AlignLeft,
  AlertTriangle,
  Ban,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Clock3,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  Tag,
  Users,
  X,
} from "lucide-vue-next";

const props = defineProps({
  mission: { type: Object, required: true },
});
const emit = defineEmits(["close", "cancelled", "completed"]);

const loading = ref(false);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

const isOverdue = (mission) => {
  if (!mission?.due_date) return false;
  if (mission.status !== "pending" && mission.status !== "in_progress")
    return false;
  const deadline = new Date(mission.due_date);
  if (Number.isNaN(deadline.getTime())) return false;
  return deadline < new Date();
};

const formatStatus = (status) => {
  if (!status) return "—";
  const statusMap = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    overdue: "Overdue",
  };
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

const statusPillClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-800 ring-yellow-100";
    case "in_progress":
      return "bg-blue-50 text-blue-800 ring-blue-100";
    case "completed":
      return "bg-emerald-50 text-emerald-800 ring-emerald-100";
    case "cancelled":
      return "bg-red-50 text-red-800 ring-red-100";
    case "overdue":
      return "bg-orange-50 text-orange-800 ring-orange-100";
    default:
      return "bg-gray-50 text-gray-800 ring-gray-100";
  }
};

const statusDotClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "in_progress":
      return "bg-blue-500";
    case "completed":
      return "bg-emerald-500";
    case "cancelled":
      return "bg-red-500";
    case "overdue":
      return "bg-orange-500";
    default:
      return "bg-gray-400";
  }
};

const initials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase() || "T";
};

const handleCancel = async () => {
  if (loading.value) return;
  if (!confirm("Are you sure you want to cancel this mission?")) return;

  loading.value = true;
  try {
    const response = await missionApi.cancelMission(props.mission.id);
    if (response.status === "success") {
      emit("cancelled", props.mission.id);
      handleClose();
    } else {
      alert(response.message || "Failed to cancel mission");
    }
  } catch (error) {
    console.error("Error cancelling mission:", error);
    alert("Failed to cancel mission. Please try again.");
  } finally {
    loading.value = false;
  }
};

const handleComplete = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const response = await missionApi.completeMission(props.mission.id);
    if (response.status === "success") {
      emit("completed", props.mission.id);
      handleClose();
    } else {
      alert(response.message || "Failed to complete mission");
    }
  } catch (error) {
    console.error("Error completing mission:", error);
    alert("Failed to complete mission. Please try again.");
  } finally {
    loading.value = false;
  }
};

const handleClose = () => emit("close");

// ESC to close
const onEsc = (e) => {
  if (e.key === "Escape") handleClose();
};

onMounted(() => window.addEventListener("keydown", onEsc));
onBeforeUnmount(() => window.removeEventListener("keydown", onEsc));
</script>
