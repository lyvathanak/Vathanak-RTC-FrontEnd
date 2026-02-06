<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center"
      @click.self="closeModal">
      <div
        class="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true">
        <!-- Header (sticky) -->
        <div
          class="sticky top-0 z-10 bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-3 border-b border-gray-200">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 min-w-0">
              <h3
                :class="[
                  'text-xl font-bold text-gray-800 truncate',
                  locale === 'kh' ? 'khmer-text' : '',
                ]">
                {{ t("hod_profile") }}
              </h3>
              <div
                class="hidden sm:inline-flex items-center rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-[#235AA6] ring-1 ring-gray-200​ border border-[#235AA6]"
                :class="[locale === 'kh' ? 'khmer-text' : '']">
                {{ t("view_details") }}
              </div>
            </div>

            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-700 transition"
              aria-label="Close"
              type="button">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div v-if="subject" class="max-h-[80vh] overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-2">
            <!-- Left -->
            <div
              class="p-5 md:p-6 border-b md:border-b-0 md:border-r border-gray-200">
              <!-- Profile -->
              <div class="text-center mb-6">
                <div
                  class="w-30 h-38 mx-auto mb-3 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-gray-50 grid place-items-center">
                  <img
                    v-if="hodPhotoSrc"
                    :src="hodPhotoSrc"
                    :alt="hodFullName"
                    class="w-full h-full object-cover cursor-zoom-in"
                    @click="openImagePreview"
                    @error="onImgError"
                    loading="lazy" />
                  <div v-else class="p-3 text-gray-500 text-sm text-center">
                    <div
                      class="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 grid place-items-center">
                      <User class="w-5 h-5 text-gray-400" />
                    </div>
                    No photo
                  </div>
                </div>

                <h1 class="text-lg font-bold text-gray-900 mb-1">
                  {{ displayLatinName }}
                </h1>
                <p class="text-gray-600 text-sm">
                  {{ displayDepartment }} • {{ displayPosition }}
                </p>
              </div>

              <!-- Personal Information -->
              <SectionTitle
                :locale="locale"
                :t="t"
                title-key="personal_information" />

              <div class="space-y-3">
                <InfoRow :label="t('khmer_name')" :locale="locale">
                  <span class="khmer-text">{{ displayKhmerName }}</span>
                </InfoRow>

                <InfoRow :label="t('latin_name')" :locale="locale">
                  {{ displayLatinName }}
                </InfoRow>

                <InfoRow :label="t('employee_id')" :locale="locale">
                  {{ subject.employee_id ?? subject.id_card ?? "N/A" }}
                </InfoRow>

                <InfoRow :label="t('date_of_birth')" :locale="locale">
                  {{ formatDate(subject.date_of_birth) }}
                </InfoRow>

                <InfoRow :label="t('gender')" :locale="locale">
                  {{ subject.gender || "N/A" }}
                </InfoRow>

                <InfoRow :label="t('email_address')" :locale="locale">
                  {{ subject.email || "N/A" }}
                </InfoRow>

                <InfoRow :label="t('phone_number')" :locale="locale">
                  {{ subject.phone || subject.phone_number || "N/A" }}
                </InfoRow>

                <InfoRow :label="t('origin')" :locale="locale">
                  {{ subject.origin || "N/A" }}
                </InfoRow>
              </div>
            </div>

            <!-- Right -->
            <div class="p-5 md:p-6">
              <SectionTitle
                :locale="locale"
                :t="t"
                title-key="professional_information" />

              <!-- Professional details -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <InfoRow :label="t('department')" :locale="locale">
                  {{ displayDepartment }}
                </InfoRow>

                <InfoRow :label="t('position')" :locale="locale">
                  {{ displayPosition }}
                </InfoRow>

                <InfoRow :label="t('experience')" :locale="locale">
                  {{ subject.experience_years ?? 0 }} {{ t("years") }}
                </InfoRow>

                <InfoRow :label="t('status')" :locale="locale">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="getStatusBadgeClass(subject.status)">
                    {{ subject.status || "Active" }}
                  </span>
                </InfoRow>
              </div>

              <!-- Courses / Teaching Areas -->
              <div>
                <h3
                  :class="[
                    'text-md font-semibold text-gray-900 mb-3',
                    locale === 'kh' ? 'khmer-text' : '',
                  ]">
                  {{ hasCourses ? t("courses_taught") : t("teaching_areas") }}
                </h3>

                <div
                  class="flex mb-3 pb-2 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <div
                    class="w-2/3"
                    :class="locale === 'kh' ? 'khmer-text' : ''">
                    {{ hasCourses ? t("subject") : t("department") }}
                  </div>
                  <div
                    class="w-1/3 text-right"
                    :class="locale === 'kh' ? 'khmer-text' : ''">
                    {{ t("experience") }}
                  </div>
                </div>

                <div class="space-y-2">
                  <div
                    v-for="(row, i) in teachingRows"
                    :key="i"
                    class="flex items-center py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div class="w-2/3">
                      <span class="text-sm font-medium text-gray-800">
                        {{ row.left }}
                      </span>
                    </div>
                    <div class="w-1/3 text-right">
                      <span class="text-sm text-gray-600">
                        {{ row.right }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No data -->
        <div v-else class="py-14 px-6 text-center text-gray-500">
          <User class="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p
            :class="[
              'text-lg font-medium',
              locale === 'kh' ? 'khmer-text' : '',
            ]">
            {{ t("no_hod_data") }}
          </p>
          <p
            :class="[
              'text-sm text-gray-400 mt-1',
              locale === 'kh' ? 'khmer-text' : '',
            ]">
            {{ t("try_again_contact_support") }}
          </p>
        </div>

        <!-- Footer (sticky) -->
        <div
          v-if="subject"
          class="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between gap-3">
            <div
              :class="[
                'text-xs text-gray-500',
                locale === 'kh' ? 'khmer-text' : '',
              ]">
              {{ t("last_updated") }}: {{ new Date().toLocaleDateString() }}
            </div>
            <button
              @click="closeModal"
              :class="[
                'px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium',
                locale === 'kh' ? 'khmer-text' : '',
              ]"
              type="button">
              {{ t("close") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
  <!-- Image Preview Modal -->
  <transition name="fade">
    <div
      v-if="showImagePreview"
      class="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
      @click="closeImagePreview">
      <div class="relative max-w-[90vw] max-h-[90vh]" @click.stop>
        <img
          :src="hodPhotoSrc"
          :alt="hodFullName || 'HOD Photo'"
          class="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />

        <!-- Close button -->
        <button
          class="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow hover:bg-gray-100"
          @click="closeImagePreview"
          aria-label="Close image preview">
          <X class="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, defineComponent, h, ref } from "vue";
import { X, User } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  hod: { type: Object, default: () => null },
});

const emit = defineEmits(["update:modelValue"]);

const closeModal = () => emit("update:modelValue", false);

const showImagePreview = ref(false);

const openImagePreview = () => {
  if (!hodPhotoSrc.value) return;
  showImagePreview.value = true;
};

const closeImagePreview = () => {
  showImagePreview.value = false;
};

// --- safer image fallback (no DNS dependency) ---
const FALLBACK_DATA_URI =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="380">
      <rect width="100%" height="100%" fill="#F3F4F6"/>
      <circle cx="150" cy="150" r="48" fill="#E5E7EB"/>
      <rect x="80" y="230" width="140" height="18" rx="9" fill="#E5E7EB"/>
      <text x="150" y="320" text-anchor="middle" fill="#9CA3AF" font-family="Arial" font-size="16">
        No Photo
      </text>
    </svg>
  `);

const onImgError = (e) => {
  e.target.onerror = null;
  e.target.src = FALLBACK_DATA_URI;
};

// ---- URL helpers ----
const FILE_ORIGIN = import.meta.env.VITE_FILE_ORIGIN;

const pickFirst = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && v !== "");
const isAbsoluteUrl = (u) => /^https?:\/\//i.test(u);
const toStorageUrl = (path) =>
  isAbsoluteUrl(path) ? path : `${FILE_ORIGIN}/storage/${String(path).replace(/^\/+/, "")}`;

// Always resolve from the prop you declared
const subject = computed(() => props.hod ?? null);

const hodPhotoSrc = computed(() => {
  const u = subject.value;
  if (!u) return null;

  // Check for profile_picture first, then fallback to user_detail
  const imageFile = u.profile_picture || u.user_detail?.profile_picture;
  
  if (imageFile) {
    // If it's already a full URL, return as is
    if (isAbsoluteUrl(imageFile)) {
      return imageFile;
    }
    // Otherwise, construct the full URL using FILE_ORIGIN
    return `${FILE_ORIGIN}/storage/${imageFile}`;
  }

  return null;
});

const hodFullName = computed(() => {
  const u = subject.value || {};
  return (
    u.full_name ||
    u.latin_name ||
    [u.first_name, u.last_name].filter(Boolean).join(" ") ||
    "HOD"
  );
});

// Display fields (defensive)
const displayKhmerName = computed(() => {
  const u = subject.value || {};
  return u.khmer_name || u.full_name || "N/A";
});
const displayLatinName = computed(
  () => subject.value?.latin_name || hodFullName.value
);
const displayDepartment = computed(
  () => subject.value?.department || subject.value?.department_name || "N/A"
);
const displayPosition = computed(
  () => subject.value?.position || subject.value?.role_name || "N/A"
);

// Date parsing that supports "dd-mm-yyyy" and ISO
const parseDate = (s) => {
  if (!s) return null;
  if (s instanceof Date) return isNaN(s) ? null : s;

  const str = String(s).trim();

  // dd-mm-yyyy or dd/mm/yyyy
  const m = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d) ? null : d;
  }

  const d = new Date(str);
  return isNaN(d) ? null : d;
};

const formatDate = (dateString) => {
  const d = parseDate(dateString);
  if (!d) return "N/A";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusBadgeClass = (status) => {
  const classes = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-red-100 text-red-800",
    On_Leave: "bg-orange-100 text-orange-800",
    Suspended: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

// Courses / Teaching rows
const hasCourses = computed(() => !!subject.value?.courses_taught?.length);
const teachingRows = computed(() => {
  const u = subject.value || {};
  const years = `${u.experience_years ?? 0} ${t("years")}`;

  if (u.courses_taught?.length) {
    return u.courses_taught.map((c) => ({ left: c, right: years }));
  }

  return [
    {
      left: `${displayDepartment.value} ${t("department_leadership")}`,
      right: `${u.management_experience ?? u.experience_years ?? 0} ${t(
        "years"
      )}`,
    },
  ];
});

// --- small inline components to reduce repetition ---
const SectionTitle = defineComponent({
  props: { titleKey: String, locale: String, t: Function },
  setup(p) {
    return () =>
      h(
        "h2",
        {
          class: [
            "text-md font-semibold text-gray-900 mb-3",
            p.locale === "kh" ? "khmer-text" : "",
          ],
        },
        p.t(p.titleKey)
      );
  },
});

const InfoRow = defineComponent({
  props: { label: String, locale: String },
  setup(p, { slots }) {
    return () =>
      h("div", [
        h(
          "label",
          {
            class: [
              "text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1",
              p.locale === "kh" ? "khmer-text" : "",
            ],
          },
          p.label
        ),
        h(
          "div",
          {
            class: "bg-gray-100 p-2 rounded text-sm text-gray-800 break-words",
          },
          slots.default ? slots.default() : ""
        ),
      ]);
  },
});

const onEsc = (ev) => {
  if (ev.key === "Escape") {
    if (showImagePreview.value) closeImagePreview();
    else closeModal();
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
