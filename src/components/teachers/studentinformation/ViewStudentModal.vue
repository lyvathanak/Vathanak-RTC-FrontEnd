<!-- ViewStudentModal.vue (Teacher version) -->
<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="close"></div>

      <div
        class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6"
        @click.stop>
        <div
          role="dialog"
          aria-modal="true"
          class="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl rounded-xl sm:rounded-2xl bg-white shadow-xl overflow-hidden max-h-[80vh] sm:max-h-[85vh] flex flex-col">
          <!-- Header -->
          <div
            class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b bg-gray-50 flex items-center justify-between">
            <div class="flex items-end text-sm text-gray-600 gap-1">
              <span
                :class="[
                  'font-bold text-base sm:text-lg md:text-xl text-gray-900',
                  locale === 'kh' ? 'khmer-text' : '',
                ]">
                {{ t("student_profile") }}
              </span>

              <div
                class="hidden sm:inline-flex items-center rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-[#235AA6] ring-1 ring-gray-200 border border-[#235AA6]"
                :class="[locale === 'kh' ? 'khmer-text' : '']">
                {{ t("view_details") }}
              </div>
            </div>

            <button
              class="p-2 rounded-md hover:bg-gray-100 transition-colors"
              @click="close"
              aria-label="Close">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div
            class="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 min-h-0">
            <!-- Profile row -->
            <div
              class="rounded-xl sm:rounded-2xl bg-gray-100 p-3 sm:p-4 md:p-5">
              <div
                class="grid grid-cols-1 lg:grid-cols-[120px_1fr_1fr] xl:grid-cols-[140px_1fr_1fr] gap-4 sm:gap-5 md:gap-6 items-start">
                <!-- Photo -->
                <div
                  class="flex lg:block items-center justify-center lg:justify-start gap-4">
                  <div
                    class="w-30 h-38 mx-auto mb-3 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-gray-50 grid place-items-center cursor-pointer"
                    @click="openImagePreview">
                    <img
                      v-if="imageSrc"
                      :src="imageSrc"
                      class="w-full h-full object-cover"
                      alt="Student photo" />
                    <div v-else class="p-3 text-gray-500 text-sm text-center">
                      <div
                        class="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 grid place-items-center">
                        <User class="w-5 h-5 text-gray-400" />
                      </div>
                      No photo
                    </div>
                  </div>
                </div>

                <!-- Personal Information -->
                <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                  <div
                    class="flex items-center gap-2 text-sm font-semibold mb-3">
                    <User2 class="w-4 h-4" />
                    <span :class="[locale === 'kh' ? 'khmer-text' : '']">
                      {{ t("personal_information") }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field :label="t('latin_name')" :value="s.latin_name" />
                    <Field
                      :label="t('khmer_name')"
                      :value="s.khmer_name"
                      khmer />
                    <Field
                      :label="t('date_of_birth')"
                      :value="fmtDate(s.date_of_birth) || '—'" />
                    <Field :label="t('gender')" :value="s.gender" />
                    <Field :label="t('address')" :value="s.address" />
                    <Field :label="t('email_address')" :value="s.email" />

                    <!-- Full width phone row (matches screenshot style) -->
                    <div class="md:col-span-2">
                      <Field
                        :label="t('phone_number')"
                        :value="s.phone_number" />
                    </div>
                  </div>
                </div>

                <!-- Academic Information -->
                <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                  <div
                    class="flex items-center gap-2 text-sm font-semibold mb-3">
                    <GraduationCap class="w-4 h-4" />
                    <span :class="[locale === 'kh' ? 'khmer-text' : '']">
                      {{ t("academic_information") }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field :label="t('id_card')" :value="s.id_card" />
                    <Field
                      :label="t('department')"
                      :value="departmentDisplay" />
                    <Field :label="t('grade')" :value="s.grade" />
                    <Field :label="t('program')" :value="programDisplay" />
                    <Field :label="t('promotion')" :value="s.promotion" />
                    <Field :label="t('section')" :value="sectionDisplay" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Academic History -->
            <div
              class="rounded-xl sm:rounded-2xl bg-gray-100 p-3 sm:p-4 md:p-5">
              <div
                class="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <div class="flex items-center gap-2 text-sm font-semibold">
                  <Clock class="w-4 h-4" />
                  <span :class="[locale === 'kh' ? 'khmer-text' : '']">
                    {{ t("academic_history") }}
                  </span>
                </div>

                <div
                  v-if="activeYear && yearData"
                  class="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-semibold"
                  :title="t('year_gpa')">
                  {{ t("year_gpa") }}: {{ (yearData.gpaYear || 0).toFixed(2) }}
                </div>
              </div>

              <!-- Year tiles -->
              <div v-if="!activeYear">
                <div
                  v-if="years.length === 0"
                  class="bg-white rounded-xl border px-4 py-6 text-center text-gray-500 text-sm">
                  No academic history available.
                </div>

                <div
                  v-else
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
              </div>

              <!-- Year detail -->
              <div v-else>
                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <button
                    class="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline self-start"
                    @click="activeYear = ''">
                    <ChevronLeft class="w-4 h-4" /> Back to Years
                  </button>
                  <div class="text-base font-semibold">{{ activeYear }}</div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <SemesterTable
                    :title="'Semester 1'"
                    :rows="yearData?.sem1 || []" />
                  <SemesterTable
                    :title="'Semester 2'"
                    :rows="yearData?.sem2 || []" />
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t bg-gray-50 flex justify-end shrink-0">
            <button
              :class="[
                'px-4 py-2 rounded-lg border bg-red-600 hover:bg-red-500 text-white',
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
          :alt="s?.latin_name || 'Student photo'"
          class="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, defineComponent, h } from "vue";
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

/* Props / Emits */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  student: { type: Object, default: () => ({}) }, // teacher row student
});
const emit = defineEmits(["update:modelValue"]);

const modelValue = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
const close = () => (modelValue.value = false);

/* ---------- Normalize teacher row to match UI ---------- */
const s = computed(() => {
  const raw = props.student || {};
  const ud = raw.user_detail || raw.userDetail || {};
  const program = raw.program || {};
  const dept = raw.department || program.department || {};
  const section =
    raw.section || (Array.isArray(raw.groups) ? raw.groups[0] : {}) || {};

  return {
    latin_name: raw.latin_name ?? raw.latinName ?? raw.latin ?? raw.name ?? "—",
    khmer_name: raw.khmer_name ?? raw.khmerName ?? raw.khmer ?? "—",
    date_of_birth: raw.date_of_birth ?? raw.dob ?? ud.date_of_birth ?? "",
    gender: raw.gender ?? ud.gender ?? "—",
    address: raw.address ?? ud.address ?? "—",
    email: raw.email ?? ud.email ?? "—",
    phone_number: raw.phone_number ?? ud.phone_number ?? ud.phone ?? "—",

    id_card:
      raw.id_card ??
      ud.id_card ??
      ud.student_id_card ??
      raw.student_code ??
      "—",
    grade: raw.grade ?? ud.grade ?? "—",
    promotion: raw.promotion ?? ud.promotion ?? "—",

    department_name:
      raw.department_name ?? dept.name ?? dept.department_name ?? "N/A",
    program_name:
      raw.program_name ?? program.name ?? program.program_name ?? "N/A",
    section_name: raw.section_name ?? section.name ?? raw.group_name ?? "N/A",

    profile_picture:
      raw.profile_picture ?? ud.profile_picture ?? raw.photo_url ?? "",
    academic_history: raw.academic_history ?? ud.academic_history ?? null,
  };
});

/* ---------- Image preview ---------- */
const showImagePreview = ref(false);

const FILE_ORIGIN = import.meta.env.VITE_FILE_ORIGIN;

const imageSrc = computed(() => {
  const path = s.value.profile_picture || "";
  if (!path) return "";

  if (
    typeof path === "string" &&
    (path.startsWith("http://") || path.startsWith("https://"))
  ) {
    return path;
  }

  return `${FILE_ORIGIN}/storage/${path}`;
});

const openImagePreview = () => {
  if (imageSrc.value) showImagePreview.value = true;
};
const closeImagePreview = () => (showImagePreview.value = false);

/* ---------- Display values ---------- */
const departmentDisplay = computed(() => s.value.department_name || "N/A");
const programDisplay = computed(() => s.value.program_name || "N/A");
const sectionDisplay = computed(() => s.value.section_name || "N/A");

/* ---------- Academic history ---------- */
const history = computed(() => {
  const h = s.value.academic_history;
  if (!h) return {};
  if (typeof h === "string") {
    try {
      return JSON.parse(h);
    } catch {
      return {};
    }
  }
  return h;
});

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
  },
);

/* ---------- Utilities ---------- */
const fmtDate = (d) => {
  if (!d) return "";
  try {
    let dateValue = d;

    // "DD-MM-YYYY" -> "MM/DD/YYYY"
    if (
      typeof dateValue === "string" &&
      /^\d{2}-\d{2}-\d{4}$/.test(dateValue)
    ) {
      const [dd, mm, yyyy] = dateValue.split("-");
      dateValue = `${mm}/${dd}/${yyyy}`;
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

/* ---------- Small internal components ---------- */
const Field = defineComponent({
  name: "Field",
  props: {
    label: { type: String, default: "" },
    value: { type: [String, Number], default: "" },
    khmer: { type: Boolean, default: false },
  },
  setup(p) {
    return () =>
      h("div", {}, [
        h(
          "div",
          {
            class: [
              "text-[11px] tracking-wide text-gray-500 mb-1",
              locale.value === "kh" ? "khmer-text" : "",
            ],
          },
          p.label,
        ),
        h(
          "div",
          {
            class: [
              "w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800",
              p.khmer ? "khmer-text" : "",
            ],
          },
          (p.value && String(p.value).trim()) || "—",
        ),
      ]);
  },
});

const SemesterTable = defineComponent({
  name: "SemesterTable",
  props: {
    title: { type: String, default: "" },
    rows: { type: Array, default: () => [] },
  },
  setup(p) {
    return () =>
      h(
        "div",
        {
          class:
            "bg-white rounded-lg sm:rounded-xl shadow-sm border overflow-hidden",
        },
        [
          h("div", { class: "px-3 sm:px-4 py-2 bg-gray-50 border-b" }, [
            h(
              "span",
              {
                class:
                  "inline-block rounded-md bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1",
              },
              p.title,
            ),
          ]),
          h("div", { class: "overflow-x-auto" }, [
            h("table", { class: "min-w-full text-xs sm:text-sm" }, [
              h("thead", {}, [
                h("tr", { class: "text-gray-500 text-xs uppercase bg-white" }, [
                  h(
                    "th",
                    { class: "px-3 sm:px-4 py-2 text-left" },
                    t("subject"),
                  ),
                  h(
                    "th",
                    { class: "px-3 sm:px-4 py-2 text-left" },
                    t("credit"),
                  ),
                  h(
                    "th",
                    { class: "px-3 sm:px-4 py-2 text-left" },
                    t("absence"),
                  ),
                  h("th", { class: "px-3 sm:px-4 py-2 text-left" }, t("score")),
                ]),
              ]),
              h(
                "tbody",
                { class: "divide-y" },
                (p.rows?.length ? p.rows : [])
                  .map((r, i) =>
                    h(
                      "tr",
                      { key: `${p.title}-${i}`, class: "hover:bg-gray-50" },
                      [
                        h(
                          "td",
                          { class: "px-3 sm:px-4 py-2" },
                          r?.subject ?? "—",
                        ),
                        h(
                          "td",
                          { class: "px-3 sm:px-4 py-2" },
                          r?.credit ?? "—",
                        ),
                        h(
                          "td",
                          { class: "px-3 sm:px-4 py-2" },
                          r?.absence ?? "—",
                        ),
                        h(
                          "td",
                          { class: "px-3 sm:px-4 py-2" },
                          r?.score ?? "—",
                        ),
                      ],
                    ),
                  )
                  .concat(
                    !p.rows?.length
                      ? [
                          h("tr", { key: `${p.title}-empty` }, [
                            h(
                              "td",
                              {
                                class:
                                  "px-3 sm:px-4 py-4 sm:py-6 text-center text-gray-500",
                                colspan: 4,
                              },
                              t("no_subjects"),
                            ),
                          ]),
                        ]
                      : [],
                  ),
              ),
            ]),
          ]),
        ],
      );
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
