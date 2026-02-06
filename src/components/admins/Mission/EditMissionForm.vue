<template>
  <div class="fixed inset-0 z-50">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      @click.self="handleClose"></div>

    <!-- Modal -->
    <div class="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
      <div
        class="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <!-- Header -->
        <div
          class="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur px-5 sm:px-6 py-4">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
                <Pencil class="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900">
                  Edit Mission
                </h3>
                <p class="mt-0.5 text-sm text-gray-500">
                  Update mission details and assigned teachers.
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="handleClose"
              class="rounded-lg p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              aria-label="Close">
              <X class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- Body (scroll area) -->
        <div class="max-h-[80vh] overflow-y-auto px-5 sm:px-6 py-5 sm:py-6">
          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Teachers -->
            <section>
              <div class="flex items-center justify-between">
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
              <div class="mt-3">
                <div class="relative">
                  <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    v-model="teacherSearch"
                    type="text"
                    placeholder="Search teachers by name or email..."
                    class="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-transparent"
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
              </div>

              <!-- Selected Chips -->
              <div v-if="selectedTeachers.length" class="mt-4">
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
                    v-for="t in selectedTeachers"
                    :key="t.id"
                    class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2">
                    <span class="text-sm font-semibold text-blue-800">{{
                      t.name
                    }}</span>
                    <button
                      type="button"
                      @click="removeTeacher(t.id)"
                      class="text-blue-600 hover:text-blue-800">
                      <X class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- List -->
              <div
                class="mt-4 rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div v-if="loadingTeachers" class="p-8 text-center">
                  <Loader2
                    class="h-7 w-7 animate-spin mx-auto text-[#235AA6]" />
                  <p class="text-gray-500 mt-2 text-sm">Loading teachers...</p>
                </div>

                <div
                  v-else-if="filteredTeachers.length === 0"
                  class="p-8 text-center">
                  <p class="text-gray-500 text-sm">No teachers found</p>
                </div>

                <div
                  v-else
                  class="max-h-64 overflow-auto divide-y divide-gray-100">
                  <button
                    v-for="teacher in filteredTeachers"
                    :key="teacher.id"
                    type="button"
                    @click="toggleTeacherSelection(teacher)"
                    class="w-full text-left p-4 hover:bg-gray-50 transition flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div
                        class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
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
                      class="h-6 w-6 rounded-full border flex items-center justify-center"
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
            </section>

            <!-- Mission Details -->
            <section>
              <h4 class="text-base font-semibold text-gray-900 mb-4">
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
                      class="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-transparent"
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
                    class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-transparent"
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
                    class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-transparent"
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
                      class="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label class="text-sm font-semibold text-gray-700">
                    Due Date <span class="text-red-500">*</span>
                  </label>
                  <div class="relative mt-2">
                    <CalendarDays
                      class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      v-model="formData.due_date"
                      type="date"
                      required
                      :min="formData.assigned_date"
                      class="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-transparent" />
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
                      class="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-transparent"
                      placeholder="0.00" />
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        <!-- Footer -->
        <div
          class="sticky bottom-0 border-t border-gray-100 bg-white px-5 sm:px-6 py-4">
          <div class="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              @click="handleClose"
              class="rounded-lg border border-gray-200 bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition">
              Cancel
            </button>

            <button
              type="button"
              @click="handleSubmit"
              :disabled="selectedTeachers.length === 0 || loading"
              class="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition flex items-center justify-center gap-2"
              :class="
                selectedTeachers.length === 0 || loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#235AA6] hover:bg-[#1E4A78]'
              ">
              <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
              <Save v-else class="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import {
  X,
  Pencil,
  Search,
  Users,
  Check,
  AlertCircle,
  Loader2,
  MapPin,
  DollarSign,
  CalendarDays,
  Save,
} from "lucide-vue-next";
import missionApi from "@/stores/apis/missionApi.js";
import BaseSelect from "@/components/features/BaseSelect.vue";

const props = defineProps({ mission: { type: Object, required: true } });
const emit = defineEmits(["close", "saved"]);

const formData = ref({
  mission_title: "",
  description: "",
  mission_type: "",
  assigned_date: "",
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
  { label: "Field Trip", value: "Field Trip" },
  { label: "Research", value: "Research" },
  { label: "Meeting", value: "Meeting" },
  { label: "Workshop", value: "Workshop" },
  { label: "Seminar", value: "Seminar" },
];

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

const loadMissionData = () => {
  formData.value = {
    mission_title: props.mission.mission_title || "",
    description: props.mission.description || "",
    mission_type: props.mission.mission_type || "",
    assigned_date: props.mission.assigned_date
      ? props.mission.assigned_date.split("T")[0]
      : new Date().toISOString().split("T")[0],
    due_date: props.mission.due_date
      ? props.mission.due_date.split("T")[0]
      : "",
    location: props.mission.location || "",
    budget: props.mission.budget ?? "",
    user_ids: [],
  };

  if (Array.isArray(props.mission.users)) {
    selectedTeachers.value = props.mission.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    }));
    formData.value.user_ids = props.mission.users.map((u) => u.id);
  }
};

const fetchTeachers = async (q) => {
  loadingTeachers.value = true;
  try {
    const response = await missionApi.getAvailableTeachers(q);
    if (response?.success) availableTeachers.value = response.data || [];
    else availableTeachers.value = [];
  } catch (e) {
    console.error(e);
    availableTeachers.value = [];
  } finally {
    loadingTeachers.value = false;
  }
};

watch(teacherSearch, (val) => {
  const v = val.trim();
  if (v.length >= 2) fetchTeachers(v);
  if (v.length === 0) fetchTeachers();
});

const filteredTeachers = computed(() => {
  const q = teacherSearch.value.trim().toLowerCase();
  if (!q) return availableTeachers.value;
  return availableTeachers.value.filter(
    (t) =>
      t?.name?.toLowerCase().includes(q) || t?.email?.toLowerCase().includes(q),
  );
});

const isTeacherSelected = (id) =>
  selectedTeachers.value.some((t) => t.id === id);

const toggleTeacherSelection = (teacher) => {
  const i = selectedTeachers.value.findIndex((t) => t.id === teacher.id);
  if (i === -1) selectedTeachers.value.push(teacher);
  else selectedTeachers.value.splice(i, 1);
};

const removeTeacher = (id) => {
  const i = selectedTeachers.value.findIndex((t) => t.id === id);
  if (i !== -1) selectedTeachers.value.splice(i, 1);
};

const handleSubmit = async () => {
  if (!selectedTeachers.value.length) return;

  loading.value = true;
  try {
    const payload = {
      ...formData.value,
      user_ids: selectedTeachers.value.map((t) => t.id),
      budget: formData.value.budget ? Number(formData.value.budget) : 0,
    };

    const res = await missionApi.updateMission(props.mission.id, payload);
    if (res?.status === "success") {
      emit("saved", res);
      handleClose();
    } else {
      alert(res?.message || "Failed to update mission");
    }
  } catch (e) {
    console.error(e);
    alert("Failed to update mission. Please try again.");
  } finally {
    loading.value = false;
  }
};

const handleClose = () => emit("close");

const onEsc = (e) => {
  if (e.key === "Escape" && !loading.value) {
    handleClose();
  }
};

onMounted(() => {
  loadMissionData();
  fetchTeachers();
  window.addEventListener("keydown", onEsc);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onEsc);
});
</script>
