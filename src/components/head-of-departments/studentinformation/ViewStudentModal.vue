<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="close"></div>

      <!-- Dialog -->
      <div
        class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6"
        @click.stop>
        <div
          role="dialog"
          aria-modal="true"
          class="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl rounded-xl sm:rounded-2xl bg-white shadow-xl overflow-hidden max-h-[80vh] sm:max-h-[85vh] flex flex-col">
          <!-- Header -->
          <div
            class="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gray-50 flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <h2
                :class="[
                  'font-bold text-base sm:text-lg md:text-xl text-gray-900 truncate',
                  locale === 'kh' ? 'khmer-text' : '',
                ]">
                {{ t("student_profile") }}
              </h2>

              <span
                class="inline-flex items-center rounded-full border border-[#235AA6] px-3 py-1 text-xs sm:text-sm font-semibold text-[#235AA6] bg-white">
                {{ studentSafe.id_card || "—" }}
              </span>
            </div>

            <button
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              @click="close"
              aria-label="Close">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div
            class="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 min-h-0">
            <div
              class="rounded-xl sm:rounded-2xl bg-gray-100 p-3 sm:p-4 md:p-5">
              <div
                class="grid grid-cols-1 lg:grid-cols-[140px_1fr_1fr] xl:grid-cols-[160px_1fr_1fr] gap-4 sm:gap-5 md:gap-6 items-start">
                <!-- Photo -->
                <div
                  class="flex lg:block items-center justify-center lg:justify-start">
                  <button
                    type="button"
                    class="w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-50 grid place-items-center focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    @click="openImagePreview"
                    :disabled="!imageSrc">
                    <img
                      v-if="imageSrc"
                      :src="imageSrc"
                      class="w-full h-full object-cover"
                      alt="Student photo" />

                    <div
                      v-else
                      class="px-3 text-gray-500 text-xs sm:text-sm text-center">
                      <div
                        class="w-10 h-10 mx-auto mb-2 rounded-full bg-white shadow grid place-items-center">
                        <User class="w-5 h-5 text-gray-400" />
                      </div>
                      <div class="font-medium">No photo</div>
                      <div class="text-[11px] text-gray-400 mt-1">
                        No preview
                      </div>
                    </div>
                  </button>
                </div>

                <!-- Personal Information -->
                <div
                  class="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                  <div
                    class="flex items-center gap-2 text-sm font-semibold mb-3">
                    <User2 class="w-4 h-4" />
                    <span :class="[locale === 'kh' ? 'khmer-text' : '']">
                      {{ t("personal_information") }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <!-- Latin Name -->
                    <div>
                      <div :class="labelClass">{{ t("latin_name") }}</div>
                      <div class="fieldBox">
                        {{ studentSafe.latin_name || "—" }}
                      </div>
                    </div>

                    <!-- Khmer Name -->
                    <div>
                      <div :class="labelClass">{{ t("khmer_name") }}</div>
                      <div class="fieldBox khmer-text">
                        {{ studentSafe.khmer_name || "—" }}
                      </div>
                    </div>

                    <!-- DOB -->
                    <div>
                      <div :class="labelClass">{{ t("date_of_birth") }}</div>
                      <div class="fieldBox">
                        {{ fmtDate(studentSafe.date_of_birth) || "—" }}
                      </div>
                    </div>

                    <!-- Gender -->
                    <div>
                      <div :class="labelClass">{{ t("gender") }}</div>
                      <div class="fieldBox">
                        {{ studentSafe.gender || "—" }}
                      </div>
                    </div>

                    <!-- Email -->
                    <div>
                      <div :class="labelClass">{{ t("email_address") }}</div>
                      <div class="fieldBox word-break-words">
                        {{ studentSafe.email || "—" }}
                      </div>
                    </div>

                    <!-- Phone -->
                    <div class="md:col-span-2">
                      <div :class="labelClass">{{ t("phone_number") }}</div>
                      <div class="fieldBox">
                        {{ studentSafe.phone_number || "—" }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Academic Information -->
                <div
                  class="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                  <div
                    class="flex items-center gap-2 text-sm font-semibold mb-3">
                    <GraduationCap class="w-4 h-4" />
                    <span :class="[locale === 'kh' ? 'khmer-text' : '']">
                      {{ t("academic_information") }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div :class="labelClass">{{ t("id_card") }}</div>
                      <div class="fieldBox">
                        {{ studentSafe.id_card || "—" }}
                      </div>
                    </div>

                    <div>
                      <div :class="labelClass">{{ t("department") }}</div>
                      <div class="fieldBox">
                        {{ studentSafe.department_name || "N/A" }}
                      </div>
                    </div>

                    <div>
                      <div :class="labelClass">{{ t("program") }}</div>
                      <div class="fieldBox">
                        {{ studentSafe.program_name || "N/A" }}
                      </div>
                    </div>

                    <div>
                      <div :class="labelClass">{{ t("section") }}</div>
                      <div class="fieldBox">
                        {{ studentSafe.section_name || "N/A" }}
                      </div>
                    </div>

                    <div>
                      <div :class="labelClass">{{ t("promotion") }}</div>
                      <div class="fieldBox">
                        {{ studentSafe.promotion || "—" }}
                      </div>
                    </div>

                    <div>
                      <div :class="labelClass">{{ t("grade") }}</div>
                      <div class="fieldBox">{{ studentSafe.grade || "—" }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Academic History -->
            <div class="rounded-xl sm:rounded-2xl bg-gray-100 overflow-hidden">
              <button
                type="button"
                class="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-200/60 transition"
                @click="showHistory = !showHistory">
                <div class="flex items-center gap-2 text-sm font-semibold">
                  <Clock class="w-4 h-4" />
                  <span :class="[locale === 'kh' ? 'khmer-text' : '']">
                    {{ t("academic_history") }}
                  </span>
                </div>

                <ChevronLeft
                  class="w-4 h-4 text-gray-500 transition-transform"
                  :class="showHistory ? '-rotate-90' : 'rotate-0'" />
              </button>

              <div v-if="showHistory" class="p-3 sm:p-4 md:p-5">
                <div
                  v-if="!activeYear"
                  class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  <button
                    v-for="y in years"
                    :key="y"
                    class="text-left rounded-lg sm:rounded-xl bg-white shadow-sm px-3 sm:px-4 py-2 sm:py-3 border hover:shadow-md transition"
                    @click="openYear(y)">
                    <div
                      :class="[
                        'text-sm font-semibold',
                        locale === 'kh' ? 'khmer-text' : '',
                      ]">
                      {{ y }}
                    </div>

                    <div class="text-xs text-gray-500 mt-1">
                      {{ t("year_gpa") }}:
                      <span class="font-medium text-gray-700">
                        {{ (history[y]?.gpaYear || 0).toFixed(2) }}
                      </span>
                    </div>
                  </button>
                </div>

                <div v-else>
                  <div class="flex items-center justify-between mb-3">
                    <button
                      class="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                      @click="activeYear = ''">
                      <ChevronLeft class="w-4 h-4" />
                      Back
                    </button>
                    <div class="text-base font-semibold">{{ activeYear }}</div>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <!-- Semester 1 -->
                    <div
                      class="bg-white rounded-lg sm:rounded-xl shadow-sm border overflow-hidden">
                      <div class="px-3 sm:px-4 py-2 bg-gray-50 border-b">
                        <span
                          class="inline-block rounded-md bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1">
                          Semester 1
                        </span>
                      </div>

                      <div class="overflow-x-auto">
                        <table class="min-w-full text-xs sm:text-sm">
                          <thead>
                            <tr
                              class="text-gray-500 text-xs uppercase bg-white">
                              <th class="px-3 sm:px-4 py-2 text-left">
                                {{ t("subject") }}
                              </th>
                              <th class="px-3 sm:px-4 py-2 text-left">
                                {{ t("credit") }}
                              </th>
                              <th class="px-3 sm:px-4 py-2 text-left">
                                {{ t("absence") }}
                              </th>
                              <th class="px-3 sm:px-4 py-2 text-left">
                                {{ t("score") }}
                              </th>
                            </tr>
                          </thead>

                          <tbody class="divide-y">
                            <tr
                              v-for="(r, i) in yearData?.sem1 || []"
                              :key="'s1-' + i"
                              class="hover:bg-gray-50">
                              <td class="px-3 sm:px-4 py-2">{{ r.subject }}</td>
                              <td class="px-3 sm:px-4 py-2">{{ r.credit }}</td>
                              <td class="px-3 sm:px-4 py-2">{{ r.absence }}</td>
                              <td class="px-3 sm:px-4 py-2">{{ r.score }}</td>
                            </tr>

                            <tr
                              v-if="!(yearData?.sem1 && yearData.sem1.length)">
                              <td
                                class="px-3 sm:px-4 py-4 sm:py-6 text-center text-gray-500"
                                colspan="4">
                                {{ t("no_subjects") }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- Semester 2 -->
                    <div
                      class="bg-white rounded-lg sm:rounded-xl shadow-sm border overflow-hidden">
                      <div class="px-3 sm:px-4 py-2 bg-gray-50 border-b">
                        <span
                          class="inline-block rounded-md bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1">
                          Semester 2
                        </span>
                      </div>

                      <div class="overflow-x-auto">
                        <table class="min-w-full text-xs sm:text-sm">
                          <thead>
                            <tr
                              class="text-gray-500 text-xs uppercase bg-white">
                              <th class="px-3 sm:px-4 py-2 text-left">
                                {{ t("subject") }}
                              </th>
                              <th class="px-3 sm:px-4 py-2 text-left">
                                {{ t("credit") }}
                              </th>
                              <th class="px-3 sm:px-4 py-2 text-left">
                                {{ t("absence") }}
                              </th>
                              <th class="px-3 sm:px-4 py-2 text-left">
                                {{ t("score") }}
                              </th>
                            </tr>
                          </thead>

                          <tbody class="divide-y">
                            <tr
                              v-for="(r, i) in yearData?.sem2 || []"
                              :key="'s2-' + i"
                              class="hover:bg-gray-50">
                              <td class="px-3 sm:px-4 py-2">{{ r.subject }}</td>
                              <td class="px-3 sm:px-4 py-2">{{ r.credit }}</td>
                              <td class="px-3 sm:px-4 py-2">{{ r.absence }}</td>
                              <td class="px-3 sm:px-4 py-2">{{ r.score }}</td>
                            </tr>

                            <tr
                              v-if="!(yearData?.sem2 && yearData.sem2.length)">
                              <td
                                class="px-3 sm:px-4 py-4 sm:py-6 text-center text-gray-500"
                                colspan="4">
                                {{ t("no_subjects") }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50 flex justify-end shrink-0">
            <button
              :class="[
                'px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold',
                locale === 'kh' ? 'khmer-text' : '',
              ]"
              @click="close">
              {{ t("close") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- Image Preview -->
  <transition name="fade">
    <div
      v-if="showImagePreview"
      class="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
      @click.self="closeImagePreview">
      <div class="relative max-w-[90vw] max-h-[90vh]" @click.stop>
        <button
          class="absolute -top-10 right-0 text-white hover:text-gray-300"
          @click="closeImagePreview"
          aria-label="Close image preview">
          <X class="w-6 h-6" />
        </button>

        <img
          :src="imageSrc"
          :alt="studentSafe.latin_name || 'Student photo'"
          class="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  X,
  ChevronLeft,
  Clock,
  User2,
  GraduationCap,
  User,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  student: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:modelValue"]);

const modelValue = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
const close = () => (modelValue.value = false);

/** ✅ normalize data (prefer mapped fields from StudentManagement) */
const studentSafe = computed(() => {
  const s = props.student || {};
  const d = s.user_detail || s.userDetail || {};

  return {
    ...d,
    ...s,
    id_card: s.id_card || d.id_card || s.student_id || "N/A",
    khmer_name: s.khmer_name || d.khmer_name || "-",
    latin_name: s.latin_name || d.latin_name || s.name || "-",
    date_of_birth: s.date_of_birth || d.date_of_birth || "-",
    gender: s.gender || d.gender || "N/A",
    phone_number: s.phone_number || d.phone_number || "N/A",
    email: s.email || d.email || "N/A",

    department_name: s.department_name || d.department_name || "N/A",
    program_name: s.program_name || d.program_name || "N/A",
    section_name:
      s.section_name || s.sub_department_name || d.section_name || "N/A",
  };
});

/** label class */
const labelClass = computed(() => [
  "text-[11px] tracking-wide text-gray-500 mb-1",
  locale.value === "kh" ? "khmer-text" : "",
]);

/** consistent field box */
const fieldBox =
  "w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800";

const FILE_ORIGIN = import.meta.env.VITE_FILE_ORIGIN;

/** Image */
const showImagePreview = ref(false);
const imageSrc = computed(() => {
  const s = studentSafe.value || {};
  const profile = s.profile_picture || s?.user_detail?.profile_picture || "";
  
  if (!profile) return s.photo_url || "";
  
  // If it's already a full URL, return as is
  if (profile.startsWith("http")) return profile;
  
  // Otherwise, construct the full URL using FILE_ORIGIN
  return `${FILE_ORIGIN}/storage/${profile}`;
});
const openImagePreview = () =>
  imageSrc.value && (showImagePreview.value = true);
const closeImagePreview = () => (showImagePreview.value = false);

/** Academic history */
const showHistory = ref(false);
const history = computed(() => studentSafe.value.academic_history || {});
const years = computed(() =>
  Object.keys(history.value).sort((a, b) => a.localeCompare(b)),
);
const activeYear = ref("");
const yearData = computed(() =>
  activeYear.value ? history.value[activeYear.value] : null,
);
const openYear = (y) => (activeYear.value = y);

watch(
  () => props.student,
  () => {
    activeYear.value = "";
    showHistory.value = false;
  },
);

/** Utilities */
const fmtDate = (d) => {
  if (!d) return "";
  try {
    let dateValue = d;

    // DD-MM-YYYY
    if (typeof dateValue === "string" && dateValue.includes("-")) {
      const parts = dateValue.split("-");
      if (parts.length === 3 && parts[2]?.length === 4) {
        const [day, month, year] = parts;
        dateValue = `${month}/${day}/${year}`;
      }
    }

    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    return d;
  } catch {
    return d;
  }
};
</script>

<style scoped>
.fieldBox {
  width: 100%;
  border-radius: 0.375rem;
  background: rgb(243 244 246);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: rgb(31 41 55);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
