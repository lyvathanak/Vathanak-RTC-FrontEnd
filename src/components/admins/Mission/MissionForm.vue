<template>
  <div class="fixed inset-0 z-50">
    <!-- Backdrop (click outside to close) -->
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      @click="handleClose" />

    <!-- Centered Modal -->
    <div class="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
      <div
        class="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        role="dialog"
        aria-modal="true"
        @click.stop>
        <!-- Header (sticky) -->
        <header
          class="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur px-5 sm:px-6 py-4">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                <Plus class="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900">
                  Assign New Mission
                </h3>
                <p class="mt-0.5 text-sm text-gray-500">
                  Create a new mission assignment for teachers.
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

        <!-- Body (scroll area) -->
        <section class="max-h-[80vh] overflow-y-auto px-5 sm:px-6 py-5 sm:py-6">
          <form class="space-y-8" @submit.prevent="handleSubmit">
            <!-- Teachers -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h4
                  class="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Users class="h-4 w-4 text-gray-500" />
                  Select Teachers
                </h4>
                <span class="text-xs font-semibold text-gray-500"
                  >Required</span
                >
              </div>

              <!-- Search -->
              <div class="relative mb-4">
                <Search
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  v-model="teacherSearch"
                  type="text"
                  placeholder="Search teachers by name or email..."
                  class="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :disabled="loadingTeachers" />
                <button
                  v-if="teacherSearch"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  @click="teacherSearch = ''"
                  aria-label="Clear search">
                  <X class="h-4 w-4" />
                </button>
              </div>

              <!-- Selected chips -->
              <div v-if="selectedTeachers.length" class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-medium text-gray-700">
                    Selected ({{ selectedTeachers.length }})
                  </p>
                  <button
                    type="button"
                    @click="selectedTeachers = []"
                    class="text-sm font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-lg">
                    Clear all
                  </button>
                </div>

                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="teacher in selectedTeachers"
                    :key="teacher.id"
                    class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2">
                    <span class="text-sm font-semibold text-blue-800">
                      {{ teacher.name }}
                    </span>
                    <button
                      type="button"
                      @click="removeTeacher(teacher.id)"
                      class="text-blue-600 hover:text-blue-800"
                      aria-label="Remove teacher">
                      <X class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Teacher list -->
              <div
                class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div v-if="loadingTeachers" class="p-8 text-center">
                  <Loader2 class="h-7 w-7 animate-spin mx-auto text-blue-600" />
                  <p class="text-gray-500 mt-2 text-sm">Loading teachers...</p>
                </div>

                <div
                  v-else-if="filteredTeachers.length === 0"
                  class="p-8 text-center">
                  <p class="text-gray-500 text-sm">No teachers found.</p>
                </div>

                <div
                  v-else
                  class="max-h-64 overflow-auto divide-y divide-gray-100">
                  <button
                    v-for="teacher in filteredTeachers"
                    :key="teacher.id"
                    type="button"
                    class="w-full text-left p-4 hover:bg-gray-50 transition flex items-center justify-between"
                    @click="toggleTeacherSelection(teacher)">
                    <div class="flex items-center gap-3 min-w-0">
                      <div
                        class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span class="text-blue-700 font-bold text-sm">
                          {{ getInitials(teacher.name) }}
                        </span>
                      </div>

                      <div class="min-w-0">
                        <p class="font-semibold text-gray-900 truncate">
                          {{ teacher.name }}
                        </p>
                        <p class="text-sm text-gray-500 truncate">
                          {{ teacher.email }}
                        </p>
                      </div>
                    </div>

                    <div
                      class="h-6 w-6 rounded-full border flex items-center justify-center shrink-0"
                      :class="
                        isTeacherSelected(teacher.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      ">
                      <Check
                        v-if="isTeacherSelected(teacher.id)"
                        class="h-4 w-4 text-white" />
                    </div>
                  </button>
                </div>
              </div>

              <div
                v-if="selectedTeachers.length === 0"
                class="mt-3 inline-flex items-center gap-2 text-sm text-red-600">
                <AlertCircle class="h-4 w-4" />
                Please select at least one teacher.
              </div>
            </div>

            <!-- Mission Details -->
            <div>
              <h4
                class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardList class="h-4 w-4 text-gray-500" />
                Mission Details
              </h4>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Type -->
                <div>
                  <BaseSelect
                    v-model="formData.mission_type"
                    label="Mission Type"
                    allLabel="Select Type"
                    required
                    placeholder="Select Type"
                    :options="missionTypeOptions" />
                </div>

                <!-- Location -->
                <div>
                  <label class="text-sm font-semibold text-gray-700"
                    >Location</label
                  >
                  <div class="relative mt-2">
                    <MapPin
                      class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      v-model="formData.location"
                      type="text"
                      class="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter location" />
                  </div>
                </div>

                <!-- Title -->
                <div class="md:col-span-2">
                  <label class="text-sm font-semibold text-gray-700">
                    Mission Title <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.mission_title"
                    type="text"
                    required
                    class="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter mission title" />
                </div>

                <!-- Description -->
                <div class="md:col-span-2">
                  <label class="text-sm font-semibold text-gray-700">
                    Description <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="formData.description"
                    rows="4"
                    required
                    class="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter mission description" />
                </div>

                <!-- Dates -->
                <div>
                  <label class="text-sm font-semibold text-gray-700">
                    Assigned Date <span class="text-red-500">*</span>
                  </label>
                  <div class="relative mt-2">
                    <CalendarDays
                      class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      v-model="formData.assigned_date"
                      type="date"
                      required
                      class="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label class="text-sm font-semibold text-gray-700">
                    Due Date <span class="text-red-500">*</span>
                  </label>
                  <div class="relative mt-2">
                    <CalendarClock
                      class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      v-model="formData.due_date"
                      type="date"
                      required
                      :min="formData.assigned_date"
                      class="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>

                <!-- Budget -->
                <div class="md:col-span-2">
                  <label class="text-sm font-semibold text-gray-700"
                    >Budget ($)</label
                  >
                  <div class="relative mt-2">
                    <DollarSign
                      class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      v-model="formData.budget"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer spacing for sticky footer -->
            <div class="h-2"></div>
          </form>
        </section>

        <!-- Footer (sticky) -->
        <footer
          class="sticky bottom-0 border-t border-gray-100 bg-white px-5 sm:px-6 py-4">
          <div class="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              @click="handleClose"
              class="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>

            <button
              type="button"
              @click="handleSubmit"
              :disabled="selectedTeachers.length === 0 || loading"
              class="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition flex items-center justify-center gap-2"
              :class="
                selectedTeachers.length === 0 || loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              ">
              <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
              <Plus v-else class="h-4 w-4" />
              {{ loading ? "Creating..." : "Assign Mission" }}
            </button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import missionApi from "@/stores/apis/missionApi.js";
import {
  X,
  Plus,
  Search,
  Users,
  Check,
  AlertCircle,
  Loader2,
  ClipboardList,
  MapPin,
  DollarSign,
  CalendarDays,
  CalendarClock,
} from "lucide-vue-next";
import BaseSelect from "@/components/features/BaseSelect.vue";

const emit = defineEmits(["close", "saved"]);

const formData = ref({
  mission_title: "",
  description: "",
  mission_type: "",
  assigned_date: new Date().toISOString().split("T")[0],
  due_date: "",
  location: "",
  budget: "",
  user_ids: [],
});

const availableTeachers = ref([]);
const loadingTeachers = ref(false);
const teacherSearch = ref("");
const selectedTeachers = ref([]);
const loading = ref(false);

const missionTypeOptions = [
  { label: "Conference", value: "Conference" },
  { label: "Training", value: "Training" },
  { label: "Meeting", value: "Meeting" },
  { label: "Field Trip", value: "Field Trip" },
  { label: "Research", value: "Research" },
  { label: "Workshop", value: "Workshop" },
  { label: "Other", value: "Other" },
];

// Prevent background scroll when modal is open
const prevOverflow = document.body.style.overflow;
document.body.style.overflow = "hidden";
onBeforeUnmount(() => {
  document.body.style.overflow = prevOverflow || "";
});

// ESC to close
const onKeydown = (e) => {
  if (e.key === "Escape") handleClose();
};
window.addEventListener("keydown", onKeydown);
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));

watch(teacherSearch, async (newSearch) => {
  const q = newSearch.trim();
  if (q.length >= 2) {
    loadingTeachers.value = true;
    try {
      const response = await missionApi.getAvailableTeachers(q);
      if (response?.success) availableTeachers.value = response.data || [];
    } catch (err) {
      console.error("Error searching teachers:", err);
    } finally {
      loadingTeachers.value = false;
    }
  } else if (q.length === 0) {
    fetchTeachers();
  }
});

const fetchTeachers = async () => {
  loadingTeachers.value = true;
  try {
    const response = await missionApi.getAvailableTeachers();
    if (response?.success) availableTeachers.value = response.data || [];
    else availableTeachers.value = [];
  } catch (error) {
    console.error("Error fetching teachers:", error);
    availableTeachers.value = [];
  } finally {
    loadingTeachers.value = false;
  }
};

const filteredTeachers = computed(() => {
  const q = teacherSearch.value.trim().toLowerCase();
  if (!q) return availableTeachers.value;
  return availableTeachers.value.filter(
    (t) =>
      t?.name?.toLowerCase().includes(q) || t?.email?.toLowerCase().includes(q),
  );
});

const getInitials = (name) => {
  if (!name) return "??";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const toggleTeacherSelection = (teacher) => {
  const idx = selectedTeachers.value.findIndex((t) => t.id === teacher.id);
  if (idx === -1) selectedTeachers.value.push(teacher);
  else selectedTeachers.value.splice(idx, 1);
};

const removeTeacher = (id) => {
  const idx = selectedTeachers.value.findIndex((t) => t.id === id);
  if (idx !== -1) selectedTeachers.value.splice(idx, 1);
};

const isTeacherSelected = (id) =>
  selectedTeachers.value.some((t) => t.id === id);

const handleSubmit = async () => {
  if (!selectedTeachers.value.length) return;

  loading.value = true;

  try {
    const missionType =
      typeof formData.value.mission_type === "string"
        ? formData.value.mission_type
        : formData.value.mission_type?.value || "";

    const payload = {
      mission_title: formData.value.mission_title?.trim(),
      description: formData.value.description?.trim(),
      mission_type: missionType,
      assigned_date: formData.value.assigned_date,
      due_date: formData.value.due_date,
      location: formData.value.location?.trim(),
      budget:
        formData.value.budget === "" || formData.value.budget == null
          ? null
          : Number(formData.value.budget),
      user_ids: selectedTeachers.value.map((t) => Number(t.id)),
    };

    console.log("Create mission payload =>", payload);

    const response = await missionApi.createMission(payload);

    if (response?.status === "success" || response?.success) {
      emit("saved", response);
      handleClose();
    } else {
      alert(response?.message || "Failed to create mission");
    }
  } catch (err) {
    const data = err?.response?.data;
    console.error("Create mission failed:", data || err);

    const msg =
      data?.message ||
      (data?.errors ? JSON.stringify(data.errors, null, 2) : null) ||
      "Failed to create mission. Please try again.";

    alert(msg);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => emit("close");

onMounted(() => {
  fetchTeachers();
});
</script>
