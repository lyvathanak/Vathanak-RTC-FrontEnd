<!-- /src/components/admins/program/CloneProgram.vue -->
<template>
  <Dialog :open="modelValue" @update:open="handleOpenChange">
    <DialogContent
      class="max-w-none w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] sm:max-w-4xl rounded-xl p-0 overflow-hidden shadow-2xl">
      <div class="flex flex-col bg-gradient-to-br from-gray-50 to-white">
        <!-- Header with gradient -->
        <div
          class="sticky top-0 z-10 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 rounded-t-xl px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <DialogTitle class="text-lg font-semibold text-gray-900">
                    CLONE PROGRAM
                  </DialogTitle>
                  <!-- Badge -->
                  <div
                    class="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-[#235AA6] bg-blue-50 border border-[#235AA6] ring-1 ring-gray-200"
                    :class="[locale === 'kh' ? 'khmer-text' : '']">
                    {{ t("add_program") }}
                  </div>
                </div>
                <DialogDescription class="text-sm text-gray-600 mt-1">
                  Create a duplicate of this program for a new academic year
                </DialogDescription>
              </div>
            </div>
            <button
              @click="close"
              class="p-2 rounded-full hover:bg-white/50 transition-colors duration-200"
              aria-label="Close">
              <X class="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto max-h-[70vh] p-6">
          <!-- Original Program Card -->
          <div class="mb-6">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-6 bg-green-500 rounded-full"></div>
              <h3 class="text-lg font-semibold text-gray-800">
                Original Program
              </h3>
              <span
                class="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Source
              </span>
            </div>
            <div
              class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="space-y-1">
                  <p
                    class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program Name
                  </p>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ program?.program_name }}
                  </p>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </p>
                  <p class="text-sm text-gray-800">
                    {{ getDepartmentName(program?.department_id) }}
                  </p>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Degree Level
                  </p>
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {{ program?.degree_level || "—" }}
                  </span>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </p>
                  <p class="text-sm text-gray-800">
                    {{
                      program?.duration_years
                        ? program.duration_years +
                          (program.duration_years > 1 ? " years" : " year")
                        : "—"
                    }}
                  </p>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Academic Year
                  </p>
                  <p class="text-sm font-semibold text-blue-700">
                    {{ program?.academic_year || "—" }}
                  </p>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subjects
                  </p>
                  <p class="text-sm text-gray-800">
                    <span class="font-semibold">{{ countSubjects }}</span>
                    subjects across
                    <span class="font-semibold">{{ countSemesters }}</span>
                    semesters
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Clone Configuration -->
          <div class="mb-8">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-6 bg-green-500 rounded-full"></div>
              <h3 class="text-lg font-semibold text-gray-800">
                Clone Configuration
              </h3>
              <span
                class="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                New Copy
              </span>
            </div>

            <div
              class="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
              <!-- Academic Year Input -->
              <div class="space-y-2">
                <label
                  class="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar class="w-4 h-4 text-green-600" />
                  Academic Year
                </label>
                <div class="relative">
                  <input
                    v-model="academicYear"
                    type="text"
                    placeholder="e.g., 2027-2028"
                    class="w-full h-12 pl-11 pr-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
                    :class="
                      academicYear.trim() ? 'border-green-500 bg-green-50' : ''
                    " />
                  <div
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar class="w-5 h-5" />
                  </div>
                  <div
                    v-if="academicYear.trim()"
                    class="absolute right-4 top-1/2 -translate-y-1/2">
                    <Check class="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <p class="text-sm text-gray-500 flex items-center gap-2 mt-2">
                  <Info class="w-4 h-4 text-gray-400" />
                  Leave empty to auto-generate next academic year ({{
                    getNextAcademicYear(program?.academic_year)
                  }})
                </p>
              </div>

              <!-- Clone Options -->
              <div class="space-y-4">
                <label class="block text-sm font-medium text-gray-700"
                  >What to Clone</label
                >
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    class="relative flex items-center p-3 border border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      class="mr-3 h-4 w-4 text-green-600 rounded focus:ring-green-500" />
                    <div>
                      <span class="text-sm font-medium text-gray-900"
                        >Program Structure</span
                      >
                      <p class="text-xs text-gray-500 mt-1">
                        Semesters and subjects
                      </p>
                    </div>
                    <div class="absolute right-3 text-green-600">
                      <CheckCircle class="w-5 h-5" />
                    </div>
                  </label>
                  <label
                    class="relative flex items-center p-3 border border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      checked
                      class="mr-3 h-4 w-4 text-green-600 rounded focus:ring-green-500" />
                    <div>
                      <span class="text-sm font-medium text-gray-900"
                        >Curriculum Details</span
                      >
                      <p class="text-xs text-gray-500 mt-1">
                        Credits, hours, prerequisites
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Estimated Info -->
              <div
                class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-green-100 rounded-lg">
                    <BarChart class="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      New Program Preview
                    </p>
                    <p class="text-xs text-gray-600">
                      Will create
                      <span class="font-semibold">{{ countSubjects }}</span>
                      subjects across
                      <span class="font-semibold">{{ countSemesters }}</span>
                      semesters
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Confirmation Message -->
          <div
            class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div class="flex items-start gap-3">
              <div class="mt-0.5">
                <AlertTriangle class="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Important Note</p>
                <p class="text-sm text-gray-600 mt-1">
                  This action will create a complete duplicate of the selected
                  program. All semesters, subjects, and their relationships will
                  be copied. You can modify the new program after creation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with Actions -->
        <div
          class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div
            class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-sm text-gray-500 flex items-center gap-2">
              <Shield class="w-4 h-4" />
              This operation can be undone within 30 days
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="close"
                class="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200">
                Cancel
              </button>
              <button
                @click="confirmClone"
                :disabled="loading || !program"
                class="h-12 px-8 inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg">
                <Plus v-if="!loading" class="w-5 h-5" />
                <Loader2 v-else class="w-5 h-5 animate-spin" />
                <span>{{ loading ? "Cloning..." : "Create Clone" }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Copy,
  X,
  Calendar,
  Check,
  Info,
  CheckCircle,
  BarChart,
  AlertTriangle,
  Shield,
  Plus,
  Loader2,
} from "lucide-vue-next";

import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  program: {
    type: Object,
    default: null,
  },
  departments: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "success", "cancel"]);

const academicYear = ref("");
const loading = ref(false);

// Computed properties
const countSubjects = computed(() => {
  return "All";
});

const countSemesters = computed(() => {
  if (!props.program?.duration_years) return "All";
  return props.program.duration_years * 2;
});

// Methods
function getDepartmentName(id) {
  if (!id) return "—";
  const found = props.departments.find((d) => d.id == id);
  return found?.department_name || found?.name || "—";
}

function getNextAcademicYear(currentYear) {
  if (!currentYear) return "";
  try {
    const years = currentYear.split("-");
    if (years.length === 2) {
      const start = parseInt(years[0]);
      const end = parseInt(years[1]);
      return `${start + 1}-${end + 1}`;
    }
  } catch (e) {
    console.error("Error parsing academic year:", e);
  }
  return "";
}

function handleOpenChange(value) {
  emit("update:modelValue", value);
  if (!value) {
    close();
  }
}

function close() {
  academicYear.value = "";
  loading.value = false;
  emit("cancel");
}

async function confirmClone() {
  if (!props.program?.id || loading.value) return;

  loading.value = true;
  try {
    const payload = {
      program_id: props.program.id,
      academic_year: academicYear.value.trim() || null,
    };

    // Emit success event with payload
    emit("success", payload);
  } catch (error) {
    console.error("Clone error:", error);
    emit("cancel");
  } finally {
    loading.value = false;
  }
}
</script>
