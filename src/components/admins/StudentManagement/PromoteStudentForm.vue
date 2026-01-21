<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="close"></div>

      <!-- Dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6" @click.stop>
        <div role="dialog" aria-modal="true" class="w-full max-w-xs sm:max-w-lg md:max-w-2xl rounded-xl bg-white shadow-xl overflow-hidden flex flex-col">
          
          <!-- Header -->
          <div class="px-4 sm:px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
            <span class="font-bold text-lg">{{ t('promote_student') }}</span>
            <button class="p-2 rounded-md hover:bg-gray-100 transition-colors" @click="close" aria-label="Close">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-4 sm:p-5 flex-1 overflow-y-auto">
            <div class="rounded-xl bg-gray-100 p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <!-- Single Student Info -->
                <template v-if="isSingleStudent">
                  <div>
                    <label class="text-sm font-semibold block mb-1">{{ t('student') }}</label>
                    <div class="bg-white rounded-md px-3 py-2 text-gray-800">
                      {{ students[0].user_detail?.latin_name || students[0].user_detail?.khmer_name || '—' }}
                    </div>
                  </div>

                  <div>
                    <label class="text-sm font-semibold block mb-1">{{ t('current_program') }}</label>
                    <div class="bg-white rounded-md px-3 py-2 text-gray-800">
                      {{ students[0].program?.program_name || '—' }}
                    </div>
                  </div>

                  <div>
                    <label class="text-sm font-semibold block mb-1">{{ t('current_level') }}</label>
                    <div class="bg-white rounded-md px-3 py-2 text-gray-800">
                      {{ students[0].year || '—' }}
                    </div>
                  </div>
                </template>

                <!-- Multiple Students Info -->
                <template v-else>
                  <div class="col-span-1 md:col-span-2">
                    <p>{{ students.length }} {{ t('students_selected') }}</p>
                    <div class="mt-2 max-h-32 overflow-y-auto bg-white rounded-md p-2 border border-gray-200">
                      <div v-for="s in students" :key="s.id" class="text-sm mb-1">
                        {{ s.user_detail?.latin_name || s.user_detail?.khmer_name || '—' }} 
                        — {{ s.program?.program_name || '—' }} ({{ s.year || '—' }})
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Select New Program -->
                <div class="col-span-1 md:col-span-2">
                  <label class="text-sm font-semibold block mb-1">{{ t('new_program') }}</label>
                  <select v-model="newProgramId" class="w-full rounded-md border px-3 py-2">
                    <option value="" disabled>{{ t('select_program') }}</option>
                    <option v-for="p in filteredPrograms" :key="p.id" :value="p.id">
                      {{ p.program_name }} {{ p.academic_year ? `(${p.academic_year})` : '' }}
                    </option>
                  </select>
                </div>

              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
            <button class="px-4 py-2 rounded-lg border bg-red-600 hover:bg-red-500 text-white" @click="close">{{ t('cancel') }}</button>
            <button
              class="px-4 py-2 rounded-lg border bg-green-600 hover:bg-green-500 text-white"
              :disabled="!newProgramId"
              @click="promote"
            >
              {{ t('promote') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { X } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useProgram } from "@/stores/global/useProgram.js";
import { showNotification } from "@/lib/notifications.js";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  students: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue', 'promote']);

const { t } = useI18n();
const modelValue = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
});
const close = () => (modelValue.value = false);

const { programs, getAllPrograms } = useProgram();
onMounted(() => getAllPrograms());

const newProgramId = ref('');

const isSingleStudent = computed(() => props.students.length === 1);

// Filter programs same logic as before
const filteredPrograms = computed(() => {
  if (!props.students.length) return [];
  const firstStudent = props.students[0];
  const currentProgramName = firstStudent.program?.program_name;
  const currentAcademicYear = firstStudent.program?.academic_year;
  return programs.value.filter(p => 
    p.program_name === currentProgramName &&
    p.academic_year > currentAcademicYear
  );
});

const promote = async () => {
  if (!newProgramId.value || !props.students.length) return;

  const userIds = props.students.map(s => s.user_detail?.user_id).filter(Boolean);
  if (!userIds.length) return;

  try {
    await emit('promote', { newProgramId: newProgramId.value });

    
  } catch (error) {
    
  } finally {
    newProgramId.value = '';
    close();
  }
};

// Reset newProgramId when students change
watch(() => props.students, () => {
  newProgramId.value = '';
}, { immediate: true });

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>