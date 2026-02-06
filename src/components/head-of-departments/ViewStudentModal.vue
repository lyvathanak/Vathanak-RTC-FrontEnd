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
          <div
            class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b bg-gray-50 flex items-center justify-between">
            <div class="flex items-end text-sm text-gray-600 gap-1">
              <span
                :class="[
                  'font-bold text-base sm:text-lg md:text-xl text-gray-900',
                  locale === 'kh' ? 'khmer-text' : '',
                ]"
                >{{ t("student_profile") }}</span
              >
              <div
                class="hidden sm:inline-flex items-center rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-[#235AA6] ring-1 ring-gray-200​ border border-[#235AA6]"
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

          <div
            class="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 min-h-0">
            <div
              class="rounded-xl sm:rounded-2xl bg-gray-100 p-3 sm:p-4 md:p-5">
              <div
                class="grid grid-cols-1 lg:grid-cols-[120px_1fr_1fr] xl:grid-cols-[140px_1fr_1fr] gap-4 sm:gap-5 md:gap-6 items-start">
                <div
                  class="flex lg:block items-center justify-center lg:justify-start gap-4">
                  <div
                    class="w-30 h-38 mx-auto mb-3 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-gray-50 grid place-items-center"
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

                <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                  <div
                    class="flex items-center gap-2 text-sm font-semibold mb-3">
                    <User2 class="w-4 h-4" />
                    <span :class="[locale === 'kh' ? 'khmer-text' : '']">{{
                      t("personal_information")
                    }}</span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoField :label="t('latin_name')" :value="student.latin_name" />
                    <InfoField :label="t('khmer_name')" :value="student.khmer_name" is-khmer />
                    <InfoField :label="t('date_of_birth')" :value="fmtDate(student.date_of_birth)" />
                    <InfoField :label="t('gender')" :value="student.gender" />
                    <InfoField :label="t('address')" :value="student.address" />
                    <InfoField :label="t('email_address')" :value="student.email" />
                    <InfoField :label="t('phone_number')" :value="student.phone_number" />
                  </div>
                </div>

                <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                  <div
                    class="flex items-center gap-2 text-sm font-semibold mb-3">
                    <GraduationCap class="w-4 h-4" />
                    <span :class="[locale === 'kh' ? 'khmer-text' : '']">{{
                      t("academic_information")
                    }}</span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoField :label="t('id_card')" :value="student.id_card" />
                    <InfoField :label="t('department')" :value="getDepartmentName()" />
                    <InfoField :label="t('grade')" :value="student.grade" />
                    <InfoField :label="t('program')" :value="getProgramName()" />
                    <InfoField :label="t('promotion')" :value="student.promotion" />
                    <InfoField :label="t('section')" :value="getSectionName()" />
                  </div>
                </div>
              </div>
            </div>
            
            </div>

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
  
  <transition name="fade">
    <div v-if="showImagePreview" class="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4" @click.self="closeImagePreview">
       <div class="relative max-w-[90vw] max-h-[90vh]" @click.stop>
        <button class="absolute -top-10 right-0 text-white" @click="closeImagePreview"><X class="w-6 h-6" /></button>
        <img :src="imageSrc" class="w-full max-h-[85vh] object-contain rounded-xl" />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, defineComponent, h } from "vue";
import { X, User2, GraduationCap, User } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  student: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:modelValue"]);

const close = () => emit("update:modelValue", false);

// Sub-component for fields to keep template clean
const InfoField = defineComponent({
  props: ['label', 'value', 'isKhmer'],
  render() {
    return h('div', [
      h('div', { class: ['text-[11px] tracking-wide text-gray-500 mb-1', locale.value === 'kh' ? 'khmer-text' : ''] }, this.label),
      h('div', { class: ['w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800', this.isKhmer ? 'khmer-text' : ''] }, this.value || "—")
    ]);
  }
});

/* Image Logic */
const showImagePreview = ref(false);

const FILE_ORIGIN = import.meta.env.VITE_FILE_ORIGIN;

const imageSrc = computed(() => {
  const s = props.student;
  const imageFile = s.profile_picture || s.photo_url || s.user_detail?.profile_picture;
  
  if (!imageFile) return "";
  
  // If it's already a full URL, return as is
  if (imageFile.startsWith("http")) return imageFile;
  
  // Otherwise, construct the full URL using FILE_ORIGIN
  return `${FILE_ORIGIN}/storage/${imageFile}`;
});
const openImagePreview = () => { if(imageSrc.value) showImagePreview.value = true; };
const closeImagePreview = () => { showImagePreview.value = false; };

/* Data Accessors - No API Calls */
const getDepartmentName = () => {
  const s = props.student;
  // If string name passed directly
  if (s.department_id && isNaN(s.department_id)) return s.department_id;
  // If nested object exists
  return s.user_detail?.department?.department_name || s.department_name || s.department_id || "N/A";
};

const getProgramName = () => {
  const s = props.student;
  if (s.current_program?.program?.program_name) return s.current_program.program.program_name;
  return s.program_name || s.program_id || "N/A";
};

const getSectionName = () => {
  const s = props.student;
  if (s.user_detail?.sub_department?.sub_department_name) return s.user_detail.sub_department.sub_department_name;
  if (s.sub_department_id && isNaN(s.sub_department_id)) return s.sub_department_id;
  return s.section_name || s.sub_department_id || "N/A";
};

/* Date Formatter */
const fmtDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return isNaN(date) ? d : date.toLocaleDateString("en-GB");
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>