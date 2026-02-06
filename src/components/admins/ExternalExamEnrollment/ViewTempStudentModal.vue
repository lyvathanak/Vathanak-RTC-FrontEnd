<template>
  <!-- View Temp Student Modal -->
  <transition name="fade">
    <div v-if="showView" class="fixed inset-0 z-50">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="closeView"></div>

      <!-- dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          class="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[80vh] sm:max-h-[85vh] rounded-xl sm:rounded-2xl bg-white shadow-xl flex flex-col"
        >
          <!-- header - fixed -->
          <div class="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b shrink-0">
            <h3 class="text-base sm:text-lg md:text-xl font-semibold">{{$t('view_temp_student')}}</h3>
            <button class="p-2 rounded-md hover:bg-gray-100 transition-colors" @click="closeView">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- body - scrollable -->
          <div class="flex-1 overflow-y-auto px-4 sm:px-5 md:px-6 py-4 sm:py-5">
            <!-- Loading state -->
            <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-12">
              <div class="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-sm text-gray-600">Loading student information...</p>
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="flex flex-col items-center justify-center gap-3 py-12">
              <div class="text-red-500 text-center">
                <p class="font-semibold">Failed to load student</p>
                <p class="text-sm mt-1">{{ error }}</p>
              </div>
            </div>

            <!-- Content -->
            <div v-else class="flex flex-col items-center gap-4 sm:gap-5">
              <!-- photo -->
              <div class="flex flex-col items-center shrink-0">
                <div
                  class="relative w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 border-2 border-gray-300 rounded-sm overflow-hidden bg-gray-50"
                >
                  <div
                    v-if="!profilePictureUrl"
                    class="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
                  >
                    <User class="w-12 sm:w-14 md:w-16 mb-1 sm:mb-2" />
                    <span class="text-xs sm:text-sm text-center px-1">
                      {{$t('no_photo')}}
                    </span>
                  </div>
                  <img
                    v-if="profilePictureUrl"
                    :src="profilePictureUrl"
                    alt="Student Photo"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>

              <!-- form sections -->
              <div class="flex flex-col gap-4 sm:gap-5 w-full">
                <!-- Personal Information -->
                <div>
                  <div class="flex items-center font-semibold mb-3">
                    <Info class="w-4 text-gray-500 mr-2 shrink-0" />
                    <h1 class="text-sm sm:text-base">{{$t('personal_information')}}</h1>
                  </div>
                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-5 gap-y-3"
                  >
                    <!-- Academic Year -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('academic_year')}}
                      </label>
                      <input
                        :value="studentData.academic_year || '-'"
                        type="text"
                        disabled
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                    </div>

                    <!-- Temp User ID -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('id')}}
                      </label>
                      <input
                        :value="studentData.id || '-'"
                        type="text"
                        disabled
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                    </div>

                    <!-- Name Khmer -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('khmer_name')}}
                      </label>
                      <input
                        :value="studentData.khmer_name || '-'"
                        type="text"
                        disabled
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                    </div>

                    <!-- Name Latin -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('latin_name')}}
                      </label>
                      <input
                        :value="studentData.latin_name || '-'"
                        type="text"
                        disabled
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                    </div>

                    <!-- Gender -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('gender')}}
                      </label>
                      <div class="relative">
                        <input
                          :value="studentData.gender || '-'"
                          type="text"
                          disabled
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <!-- Date of Birth -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('date_of_birth')}}
                      </label>
                      <input
                        :value="studentData.date_of_birth || '-'"
                        type="text"
                        disabled
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                    </div>

                    <!-- Phone Number -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('phone_number')}}
                      </label>
                      <input
                        :value="studentData.phone_number || '-'"
                        type="text"
                        disabled
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                    </div>

                    <!-- Origin -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('origin')}}
                      </label>
                      <div class="relative">
                        <input
                          :value="studentData.origin || '-'"
                          type="text"
                          disabled
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Academic Information -->
                <div>
                  <div class="flex items-center font-semibold mb-3">
                    <Info class="w-4 text-gray-500 mr-2 shrink-0" />
                    <h1 class="text-sm sm:text-base">{{$t('academic_information')}}</h1>
                  </div>
                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-5 gap-y-3"
                  >
                    <!-- Department -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('department')}}
                      </label>
                      <div class="relative">
                        <input
                          :value="departmentName || '-'"
                          type="text"
                          disabled
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <!-- Program -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('program')}}
                      </label>
                      <div class="relative">
                        <input
                          :value="programName || '-'"
                          type="text"
                          disabled
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- footer - fixed -->
          <div class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t flex justify-end gap-3 shrink-0 rounded-b-2xl bg-white">
            <button
              class="px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-bold transition-colors"
              @click="closeView"
              :disabled="loading"
            >
              {{$t('close')}}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ChevronDown, Info, User, X } from "lucide-vue-next";
import { onMounted, onBeforeUnmount, computed, ref, watch } from "vue";
import { useFilteredByDepartment, useProgramsFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";
import { useTempStudentStore } from "@/stores/Admin/external_exam/CRUD_temp_student.js";

// Props
const props = defineProps({
  showView: { type: Boolean, required: true },
  studentId: { 
    type: Number, 
    required: true
  },
});

// Emits
const emit = defineEmits(["close"]);

// Store
const tempStudentStore = useTempStudentStore();

// Local state
const studentData = ref({
  academic_year: "",
  id: null,
  profile_picture: null,
  khmer_name: "",
  latin_name: "",
  gender: "",
  date_of_birth: "",
  phone_number: "",
  origin: "",
  department_id: null,
  program_id: null,
});
const loading = ref(false);
const error = ref(null);

// Get department and program data for display
const { 
  departments, 
  departmentOptions
} = useFilteredByDepartment({ immediate: true });

const { 
  rawList: allPrograms
} = useProgramsFilteredByDepartment({ immediate: true });

// Computed properties to get names
const departmentName = computed(() => {
  const dept = departmentOptions.value.find(d => d.id === studentData.value.department_id);
  return dept ? dept.name : '-';
});

const programName = computed(() => {
  const prog = allPrograms.value.find(p => p.id === studentData.value.program_id);
  return prog ? prog.program_name : '-';
});

// Get auth token from storage
const getAuthToken = () => {
  const ls = localStorage.getItem('auth_token');
  const ss = sessionStorage.getItem('auth_token');
  return ls || ss;
};

// Profile picture URL - uses the URL from store's fetchTempStudentById response with token
const profilePictureUrl = computed(() => {
  const url = studentData.value?.profile_picture_url;
  if (!url) return '';
  
  const token = getAuthToken();
  if (!token) return url;
  
  // Append token as query parameter
  return `${url}${token}`;
})



// Fetch student data
const fetchStudent = async () => {
  if (!props.studentId) return;
  
  loading.value = true;
  error.value = null;

  try {
    const response = await tempStudentStore.fetchTempStudentById(props.studentId);
    studentData.value = response;
    console.log("✅ Student data loaded:", response);
  } catch (err) {
    error.value = tempStudentStore.error || "Failed to load student";
    console.error("❌ Failed to load student:", err);
  } finally {
    loading.value = false;
  }
};

// Watch for modal open and student ID changes
watch(() => props.showView, (newVal) => {
  if (newVal && props.studentId) {
    fetchStudent();
  }
});

// Close modal
const closeView = () => {
  emit("close");
  // Reset data
  studentData.value = {
    academic_year: "",
    id: null,
    profile_picture: null,
    khmer_name: "",
    latin_name: "",
    gender: "",
    date_of_birth: "",
    phone_number: "",
    origin: "",
    department_id: null,
    program_id: null,
  };
  error.value = null;
};

// ESC to close
const onEsc = (e) => { 
  if (e.key === "Escape") closeView(); 
};

onMounted(() => {
  window.addEventListener("keydown", onEsc);
  console.log("View Temp Student Modal mounted");
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onEsc);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Y-axis responsiveness improvements */
@media (max-height: 700px) {
  .max-h-\[80vh\] {
    max-height: 85vh;
  }
}

@media (max-height: 600px) {
  .max-h-\[80vh\] {
    max-height: 90vh;
  }
  
  .gap-3 {
    gap: 0.5rem;
  }
  
  .gap-4 {
    gap: 0.75rem;
  }
}

@media (max-height: 500px) {
  .py-3 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  .py-4 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .gap-y-2 {
    row-gap: 0.375rem;
  }
}
</style>
