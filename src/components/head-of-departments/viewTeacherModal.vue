<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center"
      @click.self="close">
      <div class="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        <div class="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-3 border-b border-gray-200 shrink-0">
          <div class="flex items-center justify-between gap-4">
            <h3 :class="['text-xl font-bold text-gray-800', locale === 'kh' ? 'khmer-text' : '']">
              {{ t("teacher_profile") }}
            </h3>
            <button @click="close" class="text-gray-400 hover:text-gray-700">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="p-6 overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div class="space-y-6">
                <div class="text-center">
                   <div class="w-32 h-40 mx-auto mb-4 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-gray-50">
                      <img v-if="imageSrc" :src="imageSrc" class="w-full h-full object-cover" />
                      <div v-else class="h-full flex items-center justify-center text-gray-400 bg-gray-100">No Photo</div>
                   </div>
                   <h2 class="text-lg font-bold">{{ teacher.latin_name }}</h2>
                   <p class="text-gray-500">{{ teacher.position || 'Teacher' }}</p>
                </div>

                <div class="space-y-3">
                   <h3 class="font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                   <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span class="block text-gray-500 text-xs uppercase">ID</span>
                        <span>{{ teacher.id_card || "N/A" }}</span>
                      </div>
                      <div>
                        <span class="block text-gray-500 text-xs uppercase">Full Name (KH)</span>
                        <span class="khmer-text">{{ teacher.khmer_name || "N/A" }}</span>
                      </div>
                      <div>
                        <span class="block text-gray-500 text-xs uppercase">Gender</span>
                        <span>{{ teacher.gender || "N/A" }}</span>
                      </div>
                      <div>
                        <span class="block text-gray-500 text-xs uppercase">Phone</span>
                        <span>{{ teacher.phone || teacher.phone_number || "N/A" }}</span>
                      </div>
                      <div class="col-span-2">
                        <span class="block text-gray-500 text-xs uppercase">Email</span>
                        <span>{{ teacher.email || "N/A" }}</span>
                      </div>
                   </div>
                </div>
             </div>

             <div class="space-y-6">
                <div class="space-y-3">
                   <h3 class="font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
                   <div class="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <span class="block text-gray-500 text-xs uppercase">Department</span>
                        <span>{{ getDepartmentName() }}</span>
                      </div>
                      <div>
                        <span class="block text-gray-500 text-xs uppercase">Status</span>
                        <span :class="teacher.is_active ? 'text-green-600' : 'text-red-600'">
                          {{ teacher.is_active ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end shrink-0">
           <button @click="close" class="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
             {{ t("close") }}
           </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from "vue";
import { X } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const props = defineProps({
  modelValue: Boolean,
  teacher: { type: Object, default: () => ({}) }
});
const emit = defineEmits(["update:modelValue"]);

const close = () => emit("update:modelValue", false);

const FILE_ORIGIN = import.meta.env.VITE_FILE_ORIGIN;

const imageSrc = computed(() => {
  const t = props.teacher;
  const imageFile = t.profile_picture || t.photo_url || t.user_detail?.profile_picture;
  
  if (!imageFile) return null;
  
  // If it's already a full URL, return as is
  if (imageFile.startsWith("http")) return imageFile;
  
  // Otherwise, construct the full URL using FILE_ORIGIN
  return `${FILE_ORIGIN}/storage/${imageFile}`;
});

const getDepartmentName = () => {
   const t = props.teacher;
   return t.department_name || t.user_detail?.department?.department_name || "N/A";
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>