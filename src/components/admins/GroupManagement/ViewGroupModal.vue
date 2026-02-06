<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
      @click.self="closeModal">
      <!-- Backdrop -->
      <div class="absolute inset-0 backdrop-blur-[2px]" />

      <!-- Modal container -->
      <div class="relative inset-0 flex items-center justify-center p-3 sm:p-6">
        <div
          class="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <!-- Header (sticky) -->
          <div
            class="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gray-200 bg-white/90 px-5 py-4 backdrop-blur">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h2
                  class="truncate text-lg sm:text-xl font-semibold text-gray-900">
                  GROUP
                  <span class="text-[#235AA6]">
                    {{ resolvedGroupData?.name || "{name}" }}
                  </span>
                </h2>
                <div
                  class="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-[#235AA6] bg-blue-50 border border-[#235AA6] ring-1 ring-gray-200"
                  :class="[locale === 'kh' ? 'khmer-text' : '']">
                  {{ t("view_group") }}
                </div>
              </div>
              <p class="mt-0.5 text-xs sm:text-sm text-gray-500">
                View group details and manage students
              </p>
            </div>

            <button
              type="button"
              @click="closeModal"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 active:scale-[0.98]"
              aria-label="Close">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Content -->
          <div class="max-h-[90vh] overflow-hidden">
            <!-- Group summary -->
            <div
              v-if="resolvedGroupData"
              class="border-b border-gray-200 bg-gray-50/60 px-5 py-4">
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <!-- Department -->
                <div class="rounded-xl border border-gray-200 bg-white p-4">
                  <p class="text-xs font-medium text-gray-500">Department</p>
                  <p class="mt-1 truncate text-sm font-semibold text-gray-900">
                    <span v-if="resolvedGroupData.department_name !== 'N/A'">
                      {{ resolvedGroupData.department_name }}
                    </span>
                    <span v-else class="font-medium text-gray-400 italic"
                      >No department</span
                    >
                  </p>
                </div>

                <!-- Program -->
                <div class="rounded-xl border border-gray-200 bg-white p-4">
                  <p class="text-xs font-medium text-gray-500">Program</p>
                  <p class="mt-1 truncate text-sm font-semibold text-gray-900">
                    <span v-if="resolvedGroupData.program_name !== 'N/A'">
                      {{ resolvedGroupData.program_name }}
                    </span>
                    <span v-else class="font-medium text-gray-400 italic"
                      >No program</span
                    >
                  </p>
                </div>

                <!-- Section -->
                <div class="rounded-xl border border-gray-200 bg-white p-4">
                  <p class="text-xs font-medium text-gray-500">Section</p>
                  <p class="mt-1 truncate text-sm font-semibold text-gray-900">
                    <span v-if="resolvedGroupData.section_name !== 'N/A'">
                      {{ resolvedGroupData.section_name }}
                    </span>
                    <span v-else class="font-medium text-gray-400 italic"
                      >No section</span
                    >
                  </p>
                </div>

                <!-- Semester -->
                <div class="rounded-xl border border-gray-200 bg-white p-4">
                  <p class="text-xs font-medium text-gray-500">Semester</p>
                  <div class="mt-1 flex items-baseline gap-2">
                    <span class="text-sm font-semibold text-gray-900">
                      {{ semesterLabel }}
                    </span>
                    <span
                      v-if="semesterDates"
                      class="truncate text-xs text-gray-500">
                      {{ semesterDates }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- meta row -->
              <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div
                  v-if="resolvedGroupData.academic_year"
                  class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
                  <span class="font-medium text-gray-600">Academic Year:</span>
                  <span class="ml-2 font-semibold text-gray-900">
                    {{ resolvedGroupData.academic_year }}
                  </span>
                </div>

                <div
                  v-if="resolvedGroupData.shift"
                  class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
                  <span class="font-medium text-gray-600">Shift:</span>
                  <span class="ml-2 font-semibold text-gray-900">
                    {{ resolvedGroupData.shift }}
                  </span>
                </div>
              </div>

              <div v-if="resolvedGroupData.description" class="mt-3">
                <p class="text-xs font-medium text-gray-500">Description</p>
                <div
                  class="mt-1 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-800">
                  {{ resolvedGroupData.description }}
                </div>
              </div>
            </div>

            <!-- Body -->
            <div class="px-5 py-4">
              <!-- Loading -->
              <div
                v-if="loading"
                class="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12">
                <div class="flex items-center gap-3 text-gray-600">
                  <div
                    class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#235AA6]" />
                  <span class="text-sm font-medium">Loading students…</span>
                </div>
              </div>

              <!-- Empty -->
              <div
                v-else-if="studentsList.length === 0"
                class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                <p class="text-base font-semibold text-gray-800">
                  No students found
                </p>
                <p class="mt-1 text-sm text-gray-500">
                  This group doesn’t have any student records available.
                </p>
              </div>

              <!-- Table -->
              <div
                v-else
                class="overflow-hidden rounded-2xl border border-gray-200">
                <div class="max-h-[52vh] overflow-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="sticky top-0 z-10 bg-gray-50">
                      <tr>
                        <th
                          class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          ID
                        </th>
                        <th
                          class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          Khmer Name
                        </th>
                        <th
                          class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          Latin Name
                        </th>
                        <th
                          class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          Date of Birth
                        </th>
                        <th
                          class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          Gender
                        </th>
                        <th
                          class="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr
                        v-for="student in studentsList"
                        :key="`student-${student.id}-${student.user_id}`"
                        class="hover:bg-gray-50">
                        <td
                          class="px-5 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {{ student.id_card }}
                        </td>

                        <td
                          class="px-5 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {{ student.khmer_name || "N/A" }}
                        </td>

                        <td
                          class="px-5 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {{ student.latin_name || "N/A" }}
                        </td>

                        <td
                          class="px-5 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {{ student.date_of_birth || "N/A" }}
                        </td>

                        <td class="px-5 py-3 text-sm whitespace-nowrap">
                          <span
                            class="inline-flex items-center justify-center min-w-14 rounded-full border px-3 py-1 text-xs font-semibold"
                            :class="{
                              'bg-blue-50 border-blue-200 text-blue-700':
                                normalizeGender(student.gender) === 'M',
                              'bg-pink-50 border-pink-200 text-pink-700':
                                normalizeGender(student.gender) === 'F',
                              'bg-gray-100 border-gray-200 text-gray-600':
                                !normalizeGender(student.gender),
                            }">
                            {{ genderLabel(student.gender) }}
                          </span>
                        </td>

                        <td class="px-5 py-3 text-right">
                          <AlertDialog>
                            <AlertDialogTrigger as-child>
                              <button
                                :disabled="
                                  isRemoving ||
                                  removingStudents.includes(student.id)
                                "
                                class="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                :title="
                                  isRemoving
                                    ? 'Processing...'
                                    : 'Remove from group'
                                ">
                                <div
                                  v-if="removingStudents.includes(student.id)"
                                  class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                                <Trash2 v-else class="h-4 w-4" />
                                Remove
                              </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{{
                                  $t("remove_student")
                                }}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{{
                                    student.khmer_name ||
                                    student.latin_name ||
                                    `Student #${student.id_card}`
                                  }}" from this group? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>{{
                                  $t("cancel")
                                }}</AlertDialogCancel>
                                <AlertDialogAction
                                  class="bg-red-600 hover:bg-red-700 text-white"
                                  @click="removeStudentFromGroup(student)">
                                  {{ $t("remove") }}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Footer (sticky) -->
            <div
              class="sticky bottom-0 z-20 border-t border-gray-200 bg-white/90 px-5 py-4 backdrop-blur">
              <div
                class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-3 text-sm text-gray-600">
                  <span
                    class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                    Total students:
                    <strong class="text-gray-900">{{ studentCount }}</strong>
                  </span>

                  <span
                    v-if="loading"
                    class="inline-flex items-center gap-2 text-gray-500">
                    <span
                      class="h-3 w-3 animate-spin rounded-full border-2 border-gray-200 border-t-[#235AA6]" />
                    Loading…
                  </span>
                </div>

                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    @click="closeModal"
                    class="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.99]">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- /Content -->
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { X, Trash2 } from "lucide-vue-next";
import { GroupCRUD } from "@/stores/apis/GroupCRUD.js";
import { showNotification } from "@/lib/notifications.js";
import { useDepartment } from "@/stores/global/useDepartment.js";
import { useProgram } from "@/stores/global/useProgram.js";
import { useSection } from "@/stores/global/useSection.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getSemestersByProgram } from "@/stores/global/SemesterByProgram";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  group: {
    type: Object,
    default: null,
  },
});

// Emits
const emit = defineEmits(["close", "student-removed"]);

// Composables for dynamic data resolution
const { getDepartmentById, getAllDepartments } = useDepartment();
const { getProgramById, getAllPrograms } = useProgram();
const { getSectionById, getAllSections } = useSection();

// State
const studentsList = ref([]);
const loading = ref(false);
const removingStudents = ref([]);
const isRemoving = ref(false); // Prevent multiple simultaneous removals

// ref for resolved semester
const resolvedSemester = ref(null);

// --- add below your existing refs ---
const semesterSource = computed(
  () => props.group?.semester || resolvedSemester.value || null,
);

const semesterLabel = computed(() => {
  const g = props.group || {};
  const s = semesterSource.value;
  return (
    s?.semester_key ||
    (s?.semester_number ? `Semester ${s.semester_number}` : null) ||
    g.semester_key ||
    (g.semester_number ? `Semester ${g.semester_number}` : null) ||
    (g.semester_id ? `Semester ${g.semester_id}` : "—")
  );
});

const semesterDates = computed(() => {
  const s = semesterSource.value;
  return s?.start_date && s?.end_date ? `${s.start_date} → ${s.end_date}` : "";
});

// Resolve semester object when we only have ids
const resolveSemesterForGroup = async () => {
  const g = props.group;
  if (!g?.program_id || !g?.semester_id) {
    resolvedSemester.value = null;
    return;
  }
  try {
    const list = await getSemestersByProgram(g.program_id);
    const arr = Array.isArray(list) ? list : list?.semesters || [];
    resolvedSemester.value =
      arr.find((s) => Number(s.id) === Number(g.semester_id)) || null;
  } catch {
    resolvedSemester.value = null;
  }
};

// Computed properties for dynamic data resolution
const resolvedGroupData = computed(() => {
  if (!props.group) return null;

  try {
    // Get resolved names from IDs with fallbacks
    const department =
      getDepartmentById(props.group.department_id) ||
      getDepartmentById(props.group.dept_id);
    const program =
      getProgramById(props.group.program_id) ||
      getProgramById(props.group.programme_id);
    const section =
      getSectionById(props.group.section_id) ||
      getSectionById(props.group.sub_department_id);

    return {
      ...props.group,
      department_name:
        department?.department_name ||
        props.group.department ||
        props.group.department_name ||
        "N/A",
      program_name:
        program?.program_name ||
        props.group.program ||
        props.group.program_name ||
        "N/A",
      section_name:
        section?.name ||
        section?.section_name ||
        props.group.section ||
        props.group.section_name ||
        "N/A",
    };
  } catch (error) {
    console.warn("Error resolving group data in modal:", error);
    return {
      ...props.group,
      department_name: props.group.department || "N/A",
      program_name: props.group.program || "N/A",
      section_name: props.group.section || "N/A",
    };
  }
});

const totalStudents = ref(0);

const studentCount = computed(
  () => totalStudents.value || studentsList.value.length,
);

// Methods
const closeModal = () => {
  emit("close");
  resetData();
};

const resetData = () => {
  studentsList.value = [];
  removingStudents.value = [];
  isRemoving.value = false;
};

// Load composable data on mount
onMounted(async () => {
  await Promise.all([getAllDepartments(), getAllPrograms(), getAllSections()]);
});

const loadGroupStudents = async () => {
  if (!props.group?.id) {
    studentsList.value = [];
    return;
  }

  loading.value = true;
  try {
    // Fetch group with students directly from the API
    const result = await GroupCRUD.getGroupStudents(props.group.id);
    if (result.success) {
      // Use the students data directly from the group
      studentsList.value = result.data.map((student, index) => ({
        id: student.id || student.user_id || `temp-${index}`, // Ensure we always have an ID
        user_id: student.user_id || student.id,
        id_card: student.id_card || student.id,
        khmer_name: student.khmer_name || student.name,
        latin_name: student.latin_name || student.name,
        full_name:
          student.full_name || student.khmer_name || student.latin_name,
        email: student.email,
        date_of_birth: student.date_of_birth || student.birth_date || "N/A",
        gender: student.gender,
        pivot: student.pivot,
      }));

      console.log("Students loaded:", studentsList.value.length);
    } else {
      console.error("Failed to load group students:", result.error);
      showNotification("Failed to load group students", "error");
    }
  } catch (error) {
    console.error("Error loading group students:", error);
    showNotification("Error loading group students", "error");
  } finally {
    loading.value = false;
  }
};

const formatDate = (v) => {
  if (!v || v === "N/A") return "N/A";
  const d = new Date(v);
  return isNaN(d) ? v : d.toISOString().slice(0, 10);
};

// Separate async function for the actual removal
const performRemoval = async (studentId, userId, studentName) => {
  try {
    const result = await GroupCRUD.removeStudentsFromGroup(props.group.id, [
      userId,
    ]);

    if (result.success) {
      // Update local state
      studentsList.value = studentsList.value.filter((s) => s.id !== studentId);

      // Emit to parent
      emit("student-removed", {
        groupId: props.group.id,
        studentId: studentId,
        studentName,
        remainingCount: studentsList.value.length,
      });

      showNotification(`${studentName} removed`, "success");
    } else {
      showNotification("Failed to remove student", "error");
    }
  } catch (error) {
    showNotification("Error removing student", "error");
  } finally {
    // Cleanup
    isRemoving.value = false;
    removingStudents.value = removingStudents.value.filter(
      (id) => id !== studentId,
    );
  }
};

const removeStudentFromGroup = (student) => {
  // Immediate validation and return
  if (isRemoving.value || !student?.id || !props.group?.id) return;

  const studentName =
    student.khmer_name || student.latin_name || `Student #${student.id_card}`;
  const studentId = student.id;
  const userId = student.user_id || student.id;

  // Immediate UI state update (no confirmation needed as AlertDialog handles it)
  isRemoving.value = true;
  if (!removingStudents.value) removingStudents.value = [];
  removingStudents.value.push(studentId);

  // Schedule async work for next tick
  setTimeout(() => performRemoval(studentId, userId, studentName), 0);
};

// Watch for modal open/close and group changes
watch(
  () => [props.isOpen, props.group],
  async ([isOpen, group]) => {
    if (isOpen && group) {
      await Promise.all([loadGroupStudents(), resolveSemesterForGroup()]);
    } else if (!isOpen) {
      resetData();
      resolvedSemester.value = null;
    }
  },
  { immediate: true },
);

const normalizeGender = (g) => {
  const v = String(g ?? "")
    .trim()
    .toLowerCase();

  if (["m", "male", "man", "1", "ប្រុស"].includes(v)) return "M";
  if (["f", "female", "woman", "2", "ស្រី"].includes(v)) return "F";

  return null;
};

const genderLabel = (g) => {
  const n = normalizeGender(g);
  if (n === "M") return "Male";
  if (n === "F") return "Female";
  return "N/A";
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
