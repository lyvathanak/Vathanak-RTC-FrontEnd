<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-show="modelValue"
        class="fixed inset-0 z-1000"
        role="dialog"
        aria-modal="true"
        aria-labelledby="promote-title"
        @keydown.esc.prevent.stop="close">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          @click="close" />

        <!-- Center -->
        <div
          class="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
          <!-- Panel -->
          <div
            class="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
            @click.stop>
            <!-- Header -->
            <div
              class="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
              <div
                class="flex items-start sm:items-center justify-between gap-4 px-5 sm:px-6 py-4">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3
                      id="promote-title"
                      class="text-base sm:text-lg font-bold tracking-tight text-gray-900">
                      VIEW SUBJECT
                    </h3>

                    <span
                      class="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-[#235AA6] bg-blue-50 border border-blue-200 ring-1 ring-gray-200"
                      :class="[locale === 'kh' ? 'khmer-text' : '']">
                      {{ t("view_subject") }}
                    </span>
                  </div>

                  <p class="mt-1 text-xs sm:text-sm text-gray-500">
                    View details, manage subjects, and assign teachers
                  </p>
                </div>

                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30"
                  @click="close"
                  aria-label="Close">
                  <X class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div
              class="max-h-[72vh] overflow-y-auto px-5 sm:px-6 py-5 space-y-8">
              <!-- Subject info -->
              <section
                class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <!-- Section header -->
                <div
                  class="flex items-center gap-3 border-b border-gray-200 px-4 sm:px-5 py-3.5 bg-gray-50/50">
                  <span
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200">
                    <Info class="h-4 w-4 text-gray-600" />
                  </span>
                  <div class="min-w-0">
                    <h3 class="text-sm font-semibold text-gray-900">
                      Subject Information
                    </h3>
                    <p class="text-xs text-gray-500">
                      Read-only details for this subject.
                    </p>
                  </div>
                </div>

                <div class="p-4 sm:p-5">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Code -->
                    <div class="space-y-1.5">
                      <label class="field-label">Subject Code</label>
                      <input
                        disabled
                        v-model="view.subject_code"
                        class="field-input" />
                    </div>

                    <!-- Name -->
                    <div class="space-y-1.5">
                      <label class="field-label">Subject Name</label>
                      <input
                        disabled
                        v-model="view.subject_name"
                        class="field-input" />
                    </div>

                    <!-- Credit -->
                    <div class="space-y-1.5">
                      <label class="field-label">Subject Credit</label>
                      <input
                        disabled
                        :value="formatCredit(view.credit)"
                        class="field-input" />
                    </div>

                    <!-- Department -->
                    <div class="space-y-1.5">
                      <label class="field-label">Department</label>
                      <div class="field-display">
                        <span class="truncate">{{
                          departmentLabel(view.department_id) || "-"
                        }}</span>
                        <ChevronDown class="h-4 w-4 text-gray-400 shrink-0" />
                      </div>
                    </div>

                    <!-- Program -->
                    <div class="space-y-1.5">
                      <label class="field-label">Program</label>
                      <div class="field-display">
                        <span class="truncate">{{
                          programLabel(view.program_id) || "-"
                        }}</span>
                        <ChevronDown class="h-4 w-4 text-gray-400 shrink-0" />
                      </div>
                    </div>

                    <!-- Total Time -->
                    <div class="space-y-1.5">
                      <label class="field-label">Total Time (hours)</label>
                      <input
                        disabled
                        :value="formatHour(view.total_hours)"
                        class="field-input" />
                    </div>

                    <!-- Practice Time -->
                    <div class="space-y-1.5">
                      <label class="field-label">Practice Time (hours)</label>
                      <input
                        disabled
                        :value="formatHour(view.practice_hours)"
                        class="field-input" />
                    </div>

                    <!-- Description -->
                    <div class="md:col-span-2 space-y-1.5">
                      <label class="field-label">Description</label>
                      <textarea
                        disabled
                        v-model="view.description"
                        rows="3"
                        class="field-textarea" />
                    </div>
                  </div>
                </div>
              </section>

              <!-- Teachers -->
              <section
                class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div
                  class="flex items-center justify-between gap-3 border-b border-gray-200 px-4 sm:px-5 py-3.5 bg-gray-50/50">
                  <div class="flex items-center gap-3 min-w-0">
                    <span
                      class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200">
                      <Info class="h-4 w-4 text-gray-600" />
                    </span>

                    <div class="min-w-0">
                      <h3 class="text-sm font-semibold text-gray-900">
                        Teachers
                        <span class="text-gray-500 font-medium"
                          >({{ teachers.length }})</span
                        >
                      </h3>
                      <p class="text-xs text-gray-500">
                        Assign or unassign teachers for this subject.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="p-4 sm:p-5 space-y-4">
                  <!-- Table -->
                  <div
                    class="overflow-hidden rounded-xl border border-gray-200">
                    <div class="overflow-x-auto">
                      <table class="min-w-full">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="th">Name</th>
                            <th class="th">Email</th>
                            <th class="th">Assigned</th>
                            <th class="th text-right">Action</th>
                          </tr>
                        </thead>

                        <tbody class="divide-y divide-gray-200 bg-white">
                          <tr
                            v-for="t in teachers"
                            :key="t.id"
                            class="hover:bg-gray-50/70">
                            <td class="td font-medium text-gray-900">
                              {{ t.name || "-" }}
                            </td>
                            <td class="td text-gray-700">
                              {{ t.email || "-" }}
                            </td>
                            <td class="td">
                              <span
                                class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                {{ t.created_at || "-" }}
                              </span>
                            </td>
                            <td class="td text-right">
                              <button
                                type="button"
                                class="icon-danger"
                                title="Unassign teacher"
                                :disabled="isRemoving(t.id)"
                                @click="openUnassignDialog(t)">
                                <Trash2 class="h-4 w-4" />
                              </button>
                            </td>
                          </tr>

                          <tr v-if="!teachers.length">
                            <td colspan="4" class="px-4 py-12 text-center">
                              <div class="text-sm font-semibold text-gray-800">
                                No teachers assigned
                              </div>
                              <div class="text-xs text-gray-500 mt-1">
                                Use “Assign Teacher” below to add one.
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Assign new teacher -->
                  <div
                    class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                    <div class="flex items-start justify-between gap-3 mb-3">
                      <div class="min-w-0">
                        <h4 class="text-sm font-semibold text-gray-900">
                          Assign Teacher
                        </h4>
                        <p class="text-xs text-gray-500">
                          Select a teacher and click assign.
                        </p>
                      </div>
                    </div>

                    <div
                      class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                      <div class="space-y-1.5">
                        <label class="field-label">
                          Teacher <span class="text-red-500">*</span>
                        </label>

                        <BaseSelect
                          v-model="selectedStaffId"
                          allLabel="All Teachers"
                          :options="staffSelectOptions"
                          :placeholder="
                            loadingStaffs
                              ? 'Loading teachers…'
                              : 'Select teacher to assign'
                          "
                          :disabled="loadingStaffs || assigning"
                          class="w-full" />

                        <p v-if="assignError" class="text-xs text-red-600 mt-1">
                          {{ assignError }}
                        </p>
                      </div>

                      <button
                        type="button"
                        class="h-11 inline-flex items-center justify-center rounded-xl bg-[#235AA6] px-5 text-sm font-semibold text-white hover:bg-[#1e4a94] focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30 disabled:opacity-60 disabled:cursor-not-allowed"
                        :disabled="
                          assigning || loadingStaffs || !selectedStaffId
                        "
                        @click="assignTeacher">
                        <span
                          v-if="assigning"
                          class="mr-2 inline-block h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                        Assign Teacher
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- Footer -->
            <div
              class="sticky bottom-0 z-10 border-t border-gray-200 bg-gray-50/90 backdrop-blur">
              <div
                class="flex items-center justify-end gap-2 px-5 sm:px-6 py-4">
                <button
                  type="button"
                  @click="close"
                  class="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.99]">
                  Cancel
                </button>

                <!-- <button type="button" class="btn-primary" @click="edit">
                  Edit
                </button> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>

  <!-- Unassign dialog -->
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="showUnassignDialog"
        class="fixed inset-0 z-1100 flex items-center justify-center"
        role="dialog"
        aria-modal="true">
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          @click="closeUnassignDialog" />

        <div
          class="relative w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-black/10 p-5">
          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200">
              <Trash2 class="h-5 w-5 text-red-600" />
            </div>

            <div class="min-w-0">
              <h3 class="text-sm font-semibold text-gray-900">
                Unassign Teacher
              </h3>
              <p class="mt-1 text-sm text-gray-600">
                Are you sure you want to unassign
                <span class="font-medium text-gray-900">{{
                  selectedTeacher?.name
                }}</span>
                from this subject?
              </p>
            </div>
          </div>

          <div class="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              class="btn-secondary h-9"
              @click="closeUnassignDialog">
              Cancel
            </button>

            <button
              type="button"
              class="h-9 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              @click="confirmUnassign">
              Unassign
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import api from "@/stores/apis/axios";
import { X, Info, ChevronDown, Trash2 } from "lucide-vue-next";
import { showNotification } from "@/lib/notifications";
import { useI18n } from "vue-i18n";
import BaseSelect from "@/components/features/BaseSelect.vue";

const { t, locale } = useI18n();

/* Props/emit */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  subject: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:modelValue", "close", "edit", "updated"]);

/* deep clone */
const clone = (v) => {
  try {
    return JSON.parse(JSON.stringify(v ?? {}));
  } catch {
    return { ...(v || {}) };
  }
};

/* normalize incoming subject */
function normalize(s) {
  const nOr0 = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    id: s.id,
    subject_code:
      s.subject_code ?? s.subjectCode ?? s.code ?? s.course_code ?? "",
    subject_name:
      s.subject_name ?? s.subjectName ?? s.name ?? s.title ?? s.subject ?? "",
    credit: nOr0(s.credit),
    department_id: s.department_id ?? s.departmentId ?? s.department?.id ?? "",
    program_id: s.program_id ?? s.programId ?? s.program?.id ?? "",
    total_hours: nOr0(
      s.total_hours ?? s.total_hour ?? s.totalTime ?? s.totalHours,
    ),
    practice_hours: nOr0(
      s.practice_hours ?? s.practice_hour ?? s.practiceTime ?? s.practiceHours,
    ),
    description: s.description ?? s.desc ?? "",
  };
}
const normalizeTeacher = (t = {}) => ({
  id: t.id,
  name: t.name ?? "-",
  email: t.email ?? "-",
  created_at: t.created_at ?? "",
  updated_at: t.updated_at ?? "",
});

/* state */
const view = ref(normalize(props.subject));
const teachers = ref(
  Array.isArray(props.subject?.teachers)
    ? props.subject.teachers.map(normalizeTeacher)
    : [],
);

const staffSelectOptions = computed(() =>
  availableStaffOptions.value.map((u) => ({
    label: `${u.name} — ${u.email}`,
    value: u.id,
  })),
);

/* merge incoming to avoid wiping local additions */
watch(
  () => props.subject,
  (v) => {
    view.value = normalize(v || {});
    const incoming = Array.isArray(v?.teachers)
      ? v.teachers.map(normalizeTeacher)
      : null;
    if (incoming) {
      const map = new Map(teachers.value.map((t) => [String(t.id), t]));
      for (const t of incoming) map.set(String(t.id), t);
      teachers.value = Array.from(map.values());
    }
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      selectedStaffId.value = "";
      assignError.value = "";
    } else {
      fetchStaffs();
      fetchDepartments();
      fetchPrograms();
    }
  },
);

/* departments/programs */
const departments = ref([]); // {id,name}
const programs = ref([]); // {id,name}
const deptMap = ref(new Map());
const programMap = ref(new Map());

async function fetchDepartments() {
  try {
    const { data } = await api.get("/managements/get_all_department");
    const list = Array.isArray(data?.all_department) ? data.all_department : [];
    departments.value = list.map((d) => ({
      id: d.id,
      name: d.department_name,
    }));
    deptMap.value = new Map(departments.value.map((d) => [String(d.id), d]));
  } catch (e) {
    console.error("Failed to load departments", e);
    departments.value = [];
    deptMap.value = new Map();
    showNotification("Failed to load departments", "error");
  }
}
async function fetchPrograms() {
  try {
    const { data } = await api.get("/managements/get_all_program");
    const list = Array.isArray(data?.programs) ? data.programs : [];
    programs.value = list.map((p) => ({ id: p.id, name: p.program_name }));
    programMap.value = new Map(programs.value.map((p) => [String(p.id), p]));
  } catch (e) {
    console.error("Failed to load programs", e);
    programs.value = [];
    programMap.value = new Map();
    showNotification("Failed to load programs", "error");
  }
}
function departmentLabel(deptId) {
  if (!deptId) return "";
  return deptMap.value.get(String(deptId))?.name ?? `#${deptId}`;
}
function programLabel(progId) {
  if (!progId) return "";
  return programMap.value.get(String(progId))?.name ?? `#${progId}`;
}

/* staff list for assigning — from /users/get_all_users */
const staffs = ref([]);
const loadingStaffs = ref(false);
async function fetchStaffs() {
  loadingStaffs.value = true;
  try {
    const { data } = await api.get("/users/get_all_users", {
      params: { per_page: 1000, role: "staff", gender: "" },
    });
    const list = Array.isArray(data?.users?.data) ? data.users.data : [];
    staffs.value = list.map((u) => ({
      id: u.id,
      name: u.name ?? u.latin_name ?? u.khmer_name ?? "-",
      email: u.email ?? "-",
      roles: u.roles || [],
    }));
  } catch (e) {
    console.error("Failed to load teachers", e);
    staffs.value = [];
    showNotification("Failed to load teachers", "error");
  } finally {
    loadingStaffs.value = false;
  }
}
const assignedIds = computed(
  () => new Set(teachers.value.map((t) => String(t.id))),
);
const availableStaffOptions = computed(() =>
  staffs.value.filter((u) => !assignedIds.value.has(String(u.id))),
);

/* assign teacher (PUT) */
const selectedStaffId = ref("");
const assigning = ref(false);
const assignError = ref("");
async function assignTeacher() {
  if (!selectedStaffId.value || !view.value.id) return;
  if (assignedIds.value.has(String(selectedStaffId.value))) {
    assignError.value = "This staff is already assigned.";
    return;
  }
  assignError.value = "";
  assigning.value = true;
  try {
    const { data } = await api.put(
      `/managements/assign_teacher_subject/${view.value.id}`,
      {
        user_id: Number(selectedStaffId.value),
      },
    );

    const newTeacher = data?.assigned_user
      ? normalizeTeacher(data.assigned_user)
      : null;
    if (newTeacher) {
      teachers.value = [...teachers.value, newTeacher];
    } else {
      const picked = staffs.value.find(
        (s) => String(s.id) === String(selectedStaffId.value),
      );
      if (picked)
        teachers.value = [...teachers.value, normalizeTeacher(picked)];
    }

    if (data?.subject) {
      const merged = normalize({ ...view.value, ...data.subject });
      view.value = merged;
      emit("updated", {
        ...merged,
        teachers: teachers.value.map((t) => ({ ...t })),
      });
    } else {
      emit("updated", {
        ...view.value,
        teachers: teachers.value.map((t) => ({ ...t })),
      });
    }

    selectedStaffId.value = "";
    showNotification("Teacher assigned successfully", "success");
  } catch (e) {
    console.error("Assign failed", e);
    assignError.value =
      e?.response?.data?.message || "Failed to assign teacher.";
    showNotification(assignError.value, "error");
  } finally {
    assigning.value = false;
  }
}

/* unassign teacher — no dialog, snackbar only */
const removingIds = ref(new Set());
function isRemoving(id) {
  return removingIds.value.has(String(id));
}

function handleUnassign(t) {
  unassignTeacher(t.id);
}

async function unassignTeacher(userId) {
  if (!userId || !view.value?.id) return;
  try {
    removingIds.value.add(String(userId));

    const { data } = await api.delete("/managements/unassign_teacher_subject", {
      data: { user_id: Number(userId), subject_id: Number(view.value.id) },
    });

    teachers.value = teachers.value.filter(
      (t) => String(t.id) !== String(userId),
    );

    if (data?.subject) {
      const merged = normalize({ ...view.value, ...data.subject });
      view.value = merged;
      emit("updated", {
        ...merged,
        teachers: teachers.value.map((t) => ({ ...t })),
      });
    } else {
      emit("updated", {
        ...view.value,
        teachers: teachers.value.map((t) => ({ ...t })),
      });
    }

    showNotification("Teacher unassigned successfully", "success");
  } catch (e) {
    console.error("Unassign failed", e);
    const msg = e?.response?.data?.message || "Failed to unassign teacher";
    showNotification(msg, "error");
  } finally {
    removingIds.value.delete(String(userId));
  }
}

/* display helpers */
const formatCredit = (n) => {
  const num = Number(n ?? 0);
  if (!Number.isFinite(num)) return "0.00";
  return Number.isInteger(num)
    ? num.toFixed(2)
    : num.toFixed(2).replace(/\.?0+$/, "");
};
const formatHour = (h) => {
  const n = Number(h ?? 0);
  if (!Number.isFinite(n)) return "0";
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
};

/* controls */
function close() {
  emit("update:modelValue", false);
  emit("close");
}
function edit() {
  emit("edit", clone(view.value));
}

const showUnassignDialog = ref(false);
const selectedTeacher = ref(null);

function openUnassignDialog(teacher) {
  selectedTeacher.value = teacher;
  showUnassignDialog.value = true;
}

function closeUnassignDialog() {
  showUnassignDialog.value = false;
  selectedTeacher.value = null;
}

function confirmUnassign() {
  if (!selectedTeacher.value) return;
  handleUnassign(selectedTeacher.value);
  closeUnassignDialog();
}

/* initial prefetch */
onMounted(() => {
  fetchDepartments();
  fetchPrograms();
  fetchStaffs();
});
</script>

<style scoped lang="postcss">
@reference "tailwindcss";

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* reuse styles */
.field-label {
  @apply text-xs font-semibold text-gray-700;
}

.field-input {
  @apply h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none ring-0;
}

.field-display {
  @apply h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 flex items-center justify-between gap-3;
}

.field-textarea {
  @apply w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none resize-y;
}

.th {
  @apply text-left text-xs font-semibold text-gray-600 px-4 py-3;
}
.td {
  @apply px-4 py-3 text-sm text-gray-700;
}

.btn-secondary {
  @apply h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200;
}
.btn-primary {
  @apply h-11 rounded-xl bg-[#235AA6] px-5 text-sm font-semibold text-white hover:bg-[#1e4a94] focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30;
}

.icon-danger {
  @apply inline-flex items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 px-2.5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50;
}
</style>
