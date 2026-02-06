<template>
  <!-- Add Temp Student Modal -->
  <transition name="fade">
    <div v-if="showAdd" class="fixed inset-0 z-50">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="closeAdd"></div>

      <!-- dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          class="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[80vh] sm:max-h-[85vh] rounded-xl sm:rounded-2xl bg-white shadow-xl flex flex-col"
        >
          <!-- header - fixed -->
          <div class="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b shrink-0">
            <h3 class="text-base sm:text-lg md:text-xl font-semibold">{{$t('add_temp_student')}}</h3>
            <button class="p-2 rounded-md hover:bg-gray-100 transition-colors" @click="closeAdd">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- body - scrollable -->
          <div class="flex-1 overflow-y-auto px-4 sm:px-5 md:px-6 py-4 sm:py-5">
            <div class="flex flex-col items-center gap-4 sm:gap-5">
              <!-- photo -->
              <div class="flex flex-col items-center shrink-0">
                <label
                  class="relative w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 border-2 border-gray-300 rounded-sm overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onPhotoChange"
                  />
                  <div
                    v-if="!newTempStudent.profile_picture"
                    class="absolute inset-0 flex flex-col items-center justify-center text-gray-500"
                  >
                    <Plus class="w-6 sm:w-7 md:w-8 mb-1 sm:mb-2" />
                    <span class="text-xs sm:text-sm text-center px-1">
                      {{$t('click_to_upload_photo')}}
                    </span>
                  </div>
                  <img
                    v-if="newTempStudent.profile_picture"
                    :src="newTempStudent.profile_picture"
                    alt="Preview"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-if="newTempStudent.profile_picture"
                    class="absolute inset-0 bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center"
                  >
                    <span
                      class="text-white opacity-0 hover:opacity-100 text-sm font-medium"
                    >
                      {{$t('change_photo')}}
                    </span>
                  </div>
                </label>
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
                    <!-- Academic Year (Disabled but shows current) -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('academic_year')}}
                      </label>
                      <input
                        :value="newTempStudent.academic_year || getCurrentAcademicYear()"
                        type="text"
                        disabled
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                        :placeholder="getCurrentAcademicYear()"
                      />
                      <p class="text-xs text-gray-500 mt-1">
                        Auto-set to current academic year
                      </p>
                    </div>

                    <!-- Temp User ID (Auto-generated) -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('temp_user_id')}}
                      </label>
                      <input
                        :value="newTempStudent.temp_user_id || 'Auto-generated'"
                        type="text"
                        disabled
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                        placeholder="Auto-generated on save"
                      />
                      <p class="text-xs text-gray-500 mt-1">
                        ID will be auto-generated when saving
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('name_khmer')}} <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="newTempStudent.khmer_name"
                        type="text"
                        class="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.khmer_name }"
                        :placeholder="$t('enter_name_khmer')"
                      />
                      <p v-if="errors.khmer_name" class="text-red-500 text-xs mt-1">{{ errors.khmer_name }}</p>
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('name_latin')}} <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="newTempStudent.latin_name"
                        type="text"
                        class="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.latin_name }"
                        :placeholder="$t('enter_name_latin')"
                      />
                      <p v-if="errors.latin_name" class="text-red-500 text-xs mt-1">{{ errors.latin_name }}</p>
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('gender')}} <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <select
                          v-model="newTempStudent.gender"
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.gender }"
                        >
                          <option value="" disabled>{{$t('select_gender')}}</option>
                          <option
                            v-for="g in genderOptions"
                            :key="g"
                            :value="g"
                          >
                            {{ g }}
                          </option>
                        </select>
                        <ChevronDown
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                      <p v-if="errors.gender" class="text-red-500 text-xs mt-1">{{ errors.gender }}</p>
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('date_of_birth')}} <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="newTempStudent.date_of_birth"
                        type="date"
                        class="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.date_of_birth }"
                        :placeholder="$t('select_date_of_birth')"
                      />
                      <p v-if="errors.date_of_birth" class="text-red-500 text-xs mt-1">{{ errors.date_of_birth }}</p>
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('phone_number')}} <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="newTempStudent.phone_number"
                        type="tel"
                        class="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.phone_number }"
                        :placeholder="$t('enter_phone_number')"
                        @keypress="onlyNumbers"
                      />
                      <p v-if="errors.phone_number" class="text-red-500 text-xs mt-1">{{ errors.phone_number }}</p>
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('origin')}} <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <select
                          v-model="newTempStudent.origin"
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.origin }"
                        >
                          <option value="" disabled>{{$t('select_origin')}}</option>
                          <option
                            v-for="province in provinceOptions"
                            :key="province.id"
                            :value="province.name"
                          >
                            {{ province.name }}
                          </option>
                        </select>
                        <ChevronDown
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                      <p v-if="errors.origin" class="text-red-500 text-xs mt-1">{{ errors.origin }}</p>
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
                        {{$t('department')}} <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <select
                          v-model="newTempStudent.department_id"
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.department_id }"
                          :disabled="departmentsLoading"
                        >
                          <option :value="null">
                            {{ departmentsLoading ? 'Loading departments...' : $t('select_department') }}
                          </option>
                          <option v-for="d in departmentOptions" :key="d.id" :value="d.id">
                            {{ d.name }}
                          </option>
                        </select>
                        <ChevronDown
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                      <p v-if="errors.department_id" class="text-red-500 text-xs mt-1">{{ errors.department_id }}</p>
                    </div>

                    <!-- Program -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('program')}} <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <select
                          v-model.number="newTempStudent.program_id"
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.program_id }"
                          :disabled="programsLoading || !newTempStudent.department_id"
                        >
                          <option :value="null" :selected="newTempStudent.program_id == null">
                            {{
                              !newTempStudent.department_id
                                ? 'Please select a department first'
                                : programsLoading
                                  ? 'Loading programs...'
                                  : $t('select_program')
                            }}
                          </option>

                          <option v-for="p in filteredPrograms" :key="p.id" :value="p.id">
                            {{ p.program_name }} 
                          </option>
                        </select>

                        <ChevronDown
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                      <p v-if="errors.program_id" class="text-red-500 text-xs mt-1">
                        {{ errors.program_id }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- footer - fixed -->
          <div class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t flex flex-col gap-2 shrink-0 rounded-b-2xl bg-white">
            <!-- Error message -->
            <div v-if="errors.global" class="text-red-500 text-sm text-center">
              {{ errors.global }}
            </div>
            
            <!-- Action buttons -->
            <div class="flex justify-end gap-3">
              <button
                class="px-4 py-2 text-sm rounded-lg bg-[#FF4040] text-white border hover:bg-[#ff3030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="closeAdd"
                :disabled="tempStudentStore.loading"
              >
                {{$t('cancel')}}
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg bg-[#235AA6] text-white hover:bg-[#1e4a91] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                @click="saveTempStudent"
                :disabled="tempStudentStore.loading"
              >
                <span v-if="tempStudentStore.loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ tempStudentStore.loading ? 'Saving...' : $t('save') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ChevronDown, Info, Plus, X } from "lucide-vue-next";
import { onMounted, onBeforeUnmount, computed, ref, reactive, watch } from "vue";
import { useFilteredByDepartment, useProgramsFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";
import { useTempStudentStore } from "@/stores/Admin/external_exam/CRUD_temp_student.js";
import provincesData from "@/db/CambodiaAdministrationArea/provinces.json";
import { showNotification } from "@/lib/notifications.js";

// Props
const props = defineProps({
  showAdd: { type: Boolean, required: true },
  existingTempStudents: { type: Array, default: () => [] },
});

// Emits
const emit = defineEmits(["close", "save"]);

// Store
const tempStudentStore = useTempStudentStore();

// Temp student state
const newTempStudent = reactive({
  academic_year: "",
  temp_user_id: null,
  profile_picture: null,
  khmer_name: "",
  latin_name: "",
  gender: "",
  date_of_birth: "",
  phone_number: "",
  origin: "",
  department_id: null,
  program_id: null,
  file: null,
});

// Errors state
const errors = reactive({
  khmer_name: "",
  latin_name: "",
  gender: "",
  date_of_birth: "",
  phone_number: "",
  origin: "",
  department_id: "",
  program_id: "",
  global: "",
});

// Get current academic year
function getCurrentAcademicYear() {
  const y = new Date().getFullYear();
  return `${y-1}-${y}`;
}

// Gender options
const genderOptions = ["Male", "Female"];

// Province options from JSON
const provinceOptions = computed(() => {
  return provincesData.sort((a, b) => a.name.localeCompare(b.name));
});

// 🎯 Use FilterByDepartment composables
const { 
  departments, 
  departmentOptions,
  loading: departmentsLoading 
} = useFilteredByDepartment({ immediate: true });

const { 
  selectedDepartmentId: selectedDepartmentIdForPrograms,
  filtered: programsFiltered, 
  rawList: allPrograms,
  loading: programsLoading,
  setDepartment: setProgramsDepartment
} = useProgramsFilteredByDepartment({ immediate: true });

// Computed properties for filtered options
const filteredPrograms = computed(() => {
  return newTempStudent.department_id ? programsFiltered.value : allPrograms.value;
});

// Watch for department changes to reset program
watch(() => newTempStudent.department_id, (newDeptId, oldDeptId) => {
  if (newDeptId !== oldDeptId) {
    newTempStudent.program_id = null;
    if (newDeptId) { 
      setProgramsDepartment(newDeptId); 
    } else { 
      setProgramsDepartment(''); 
    }
  }
});

// Generate next temp_user_id
const generateTempUserId = () => {
  if (!props.existingTempStudents || props.existingTempStudents.length === 0) {
    return 1;
  }
  
  const maxId = Math.max(...props.existingTempStudents.map(s => s.temp_user_id || 0));
  return maxId + 1;
};

// Clear all errors
const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = "";
  });
};

// Validate form
const validateForm = () => {
  clearErrors();
  let isValid = true;

  if (!newTempStudent.khmer_name || newTempStudent.khmer_name.trim() === "") {
    errors.khmer_name = "Khmer name is required";
    isValid = false;
  }

  if (!newTempStudent.latin_name || newTempStudent.latin_name.trim() === "") {
    errors.latin_name = "Latin name is required";
    isValid = false;
  }

  if (!newTempStudent.gender) {
    errors.gender = "Gender is required";
    isValid = false;
  }

  if (!newTempStudent.date_of_birth) {
    errors.date_of_birth = "Date of birth is required";
    isValid = false;
  }

  if (!newTempStudent.phone_number || newTempStudent.phone_number.trim() === "") {
    errors.phone_number = "Phone number is required";
    isValid = false;
  } else if (!/^[0-9]{8,15}$/.test(newTempStudent.phone_number)) {
    errors.phone_number = "Phone number must be 8-15 digits";
    isValid = false;
  }

  if (!newTempStudent.origin || newTempStudent.origin.trim() === "") {
    errors.origin = "Origin is required";
    isValid = false;
  }

  if (!newTempStudent.department_id) {
    errors.department_id = "Department is required";
    isValid = false;
  }

  if (!newTempStudent.program_id) {
    errors.program_id = "Program is required";
    isValid = false;
  }

  return isValid;
};

// Reset form
const resetForm = () => {
  newTempStudent.academic_year = getCurrentAcademicYear();
  newTempStudent.temp_user_id = null;
  newTempStudent.profile_picture = null;
  newTempStudent.khmer_name = "";
  newTempStudent.latin_name = "";
  newTempStudent.gender = "";
  newTempStudent.date_of_birth = "";
  newTempStudent.phone_number = "";
  newTempStudent.origin = "";
  newTempStudent.department_id = null;
  newTempStudent.program_id = null;
  newTempStudent.file = null;

  clearErrors();

  // Reset file inputs
  document.querySelectorAll('input[type="file"]').forEach(i => (i.value = ""));
};

// Close modal
const closeAdd = () => {
  emit("close");
  resetForm();
};

// Save temp student
const saveTempStudent = async () => {
  if (!validateForm()) {
    console.log("❌ Validation failed:", errors);
    return;
  }

  // Ensure academic_year is set
  if (!newTempStudent.academic_year) {
    newTempStudent.academic_year = getCurrentAcademicYear();
  }

  // Generate temp_user_id (for local tracking)
  newTempStudent.temp_user_id = generateTempUserId();

  // Create temp student object
  const tempStudentData = {
    academic_year: newTempStudent.academic_year,
    temp_user_id: newTempStudent.temp_user_id,
    profile_picture: newTempStudent.profile_picture,
    khmer_name: newTempStudent.khmer_name,
    latin_name: newTempStudent.latin_name,
    gender: newTempStudent.gender,
    date_of_birth: newTempStudent.date_of_birth,
    phone_number: newTempStudent.phone_number,
    origin: newTempStudent.origin,
    department_id: newTempStudent.department_id,
    program_id: newTempStudent.program_id,
    file: newTempStudent.file, // Include file for upload
  };

  console.log("📤 Saving temp student:", tempStudentData);

  try {
    // Call API to add temp student
    const result = await tempStudentStore.addTempStudent(tempStudentData);
    
    console.log("✅ Temp student saved successfully:", result);
    
    // Show success notification
    showNotification("Temporary student added successfully!", "success");
    
    // Emit save event with the result from API
    emit("save", result);
    closeAdd();
  } catch (error) {
    // Display API error to user
    errors.global = tempStudentStore.error || "Failed to save temporary student";
    console.error("❌ Failed to save temp student:", error);
    
    // Show error notification
    showNotification(errors.global, "error");
  }
};

// Photo change handler
const onPhotoChange = (e) => {
  const f = e.target.files?.[0];
  e.target.value = "";
  if (!f) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(f.type)) {
    errors.global = "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
    return;
  }
  if (f.size > 2 * 1024 * 1024) {
    errors.global = "Image size should be less than 2MB";
    return;
  }

  // Store file for potential upload
  newTempStudent.file = f;

  // Create preview URL
  const reader = new FileReader();
  reader.onload = (e) => {
    newTempStudent.profile_picture = e.target.result;
  };
  reader.readAsDataURL(f);

  console.log("📸 Photo selected:", { name: f.name, size: f.size, type: f.type });
};

// Only allow numbers in phone input
const onlyNumbers = (event) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};

// ESC to close
const onEsc = (e) => { 
  if (e.key === "Escape") closeAdd(); 
};

onMounted(() => {
  window.addEventListener("keydown", onEsc);
  newTempStudent.academic_year = getCurrentAcademicYear();
  console.log("Temp Student Modal mounted");
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
