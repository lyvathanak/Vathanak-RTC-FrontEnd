<template>
  <!-- Edit Temp Student Modal -->
  <transition name="fade">
    <div v-if="showEdit" class="fixed inset-0 z-50">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="closeEdit"></div>

      <!-- dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          class="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[80vh] sm:max-h-[85vh] rounded-xl sm:rounded-2xl bg-white shadow-xl flex flex-col"
        >
          <!-- header - fixed -->
          <div class="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b shrink-0">
            <h3 class="text-base sm:text-lg md:text-xl font-semibold">{{$t('edit_temp_student')}}</h3>
            <button class="p-2 rounded-md hover:bg-gray-100 transition-colors" @click="closeEdit">
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
                    v-if="!profilePictureUrl"
                    class="absolute inset-0 flex flex-col items-center justify-center text-gray-500"
                  >
                    <Plus class="w-6 sm:w-7 md:w-8 mb-1 sm:mb-2" />
                    <span class="text-xs sm:text-sm text-center px-1">
                      {{$t('click_to_upload_photo')}}
                    </span>
                  </div>
                  <img
                    v-if="profilePictureUrl"
                    :src="profilePictureUrl"
                    alt="Preview"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-if="profilePictureUrl"
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
                        :value="editTempStudent.academic_year"
                        type="text"
                        disabled
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                      <p class="text-xs text-gray-500 mt-1">
                        Academic year cannot be changed
                      </p>
                    </div>

                    <!-- Temp User ID (Read-only) -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('temp_user_id')}}
                      </label>
                      <input
                        :value="editTempStudent.id"
                        type="text"
                        disabled
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                      <p class="text-xs text-gray-500 mt-1">
                        ID is read-only
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('khmer_name')}} <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="editTempStudent.khmer_name"
                        type="text"
                        class="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.khmer_name }"
                        :placeholder="$t('enter_khmer_name')"
                      />
                      <p v-if="errors.khmer_name" class="text-red-500 text-xs mt-1">{{ errors.khmer_name }}</p>
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('latin_name')}} <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="editTempStudent.latin_name"
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
                          v-model="editTempStudent.gender"
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.gender }"
                        >
                          <option value="" disabled>{{$t('select_gender')}}</option>
                          <option v-for="gender in genderOptions" :key="gender" :value="gender">
                            {{ gender }}
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
                        v-model="editTempStudent.date_of_birth"
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
                        v-model="editTempStudent.phone_number"
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
                          v-model="editTempStudent.origin"
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.origin }"
                        >
                          <option value="" disabled>{{$t('select_province')}}</option>
                          <option v-for="province in provinces" :key="province.id" :value="province.name">
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
                          v-model="editTempStudent.department_id"
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
                          v-model.number="editTempStudent.program_id"
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.program_id }"
                          :disabled="programsLoading || !editTempStudent.department_id"
                        >
                          <option :value="null" :selected="editTempStudent.program_id == null">
                            {{
                              !editTempStudent.department_id
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
                @click="closeEdit"
                :disabled="tempStudentStore.loading"
              >
                {{$t('cancel')}}
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg bg-[#235AA6] text-white hover:bg-[#1e4a91] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                @click="updateTempStudent"
                :disabled="tempStudentStore.loading"
              >
                <span v-if="tempStudentStore.loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ tempStudentStore.loading ? 'Updating...' : $t('update') }}</span>
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
import provinces from "@/db/CambodiaAdministrationArea/provinces.json";
import { showNotification } from "@/lib/notifications.js";

// Props
const props = defineProps({
  showEdit: { type: Boolean, required: true },
  student: { type: Object, default: null },
});

// Emits
const emit = defineEmits(["close", "update"]);

// Store
const tempStudentStore = useTempStudentStore();

// Temp student state
const editTempStudent = reactive({
  id: null,
  academic_year: "",
  temp_user_id: null,
  profile_picture: null,
  profile_picture_url: null,
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

// Gender options
const genderOptions = ["Male", "Female"];

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
  return editTempStudent.department_id ? programsFiltered.value : allPrograms.value;
});

// Get auth token from storage
const getAuthToken = () => {
  const ls = localStorage.getItem('auth_token');
  const ss = sessionStorage.getItem('auth_token');
  return ls || ss;
};

// Profile picture URL with auth token
const profilePictureUrl = computed(() => {
  // If user uploaded a new image (file preview), show that
  if (editTempStudent.profile_picture && editTempStudent.profile_picture.startsWith('data:')) {
    return editTempStudent.profile_picture;
  }
  
  // Get the profile picture URL from student data
  const url = editTempStudent.profile_picture_url;
  if (!url) return '';
  
  const token = getAuthToken();
  if (!token) return url;
  
  // Append token as query parameter
  return `${url}${token}`;
});

// Watch for department changes to reset program
watch(() => editTempStudent.department_id, (newDeptId, oldDeptId) => {
  if (newDeptId !== oldDeptId) {
    // Don't reset program_id when initially loading the student data
    if (oldDeptId !== null) {
      editTempStudent.program_id = null;
    }
    
    if (newDeptId) { 
      setProgramsDepartment(newDeptId); 
    } else { 
      setProgramsDepartment(''); 
    }
  }
});

// Watch for student prop changes to populate form
watch(() => props.student, async (newStudent) => {
  if (newStudent) {
    // If student has ID but no profile_picture_url, fetch full data from API
    if (newStudent.id && !newStudent.profile_picture_url) {
      console.log('📥 Fetching full student data with profile picture...');
      try {
        const fullStudentData = await tempStudentStore.fetchTempStudentById(newStudent.id);
        populateForm(fullStudentData);
      } catch (error) {
        console.error('❌ Failed to fetch student data:', error);
        populateForm(newStudent);
      }
    } else {
      populateForm(newStudent);
    }
  }
}, { immediate: true });

// Watch for modal open to refetch if needed
watch(() => props.showEdit, async (isOpen) => {
  if (isOpen && props.student?.id) {
    console.log('🔄 Edit modal opened for student ID:', props.student.id);
    console.log('📋 Current student data:', props.student);
    
    // Refetch to ensure we have the latest data with profile_picture_url
    try {
      const fullStudentData = await tempStudentStore.fetchTempStudentById(props.student.id);
      console.log('✅ Fetched student data with profile_picture_url:', fullStudentData.profile_picture_url);
      populateForm(fullStudentData);
    } catch (error) {
      console.error('❌ Failed to fetch student data:', error);
      populateForm(props.student);
    }
  }
});

// Populate form with student data
const populateForm = (student) => {
  if (!student) return;

  console.log('📝 Populating form with student data:', student);
  console.log('🖼️ Profile picture URL:', student.profile_picture_url);

  editTempStudent.id = student.id;
  editTempStudent.academic_year = student.academic_year || "";
  editTempStudent.temp_user_id = student.temp_user_id || null;
  // Store the profile_picture_url from student data
  editTempStudent.profile_picture = null;
  editTempStudent.profile_picture_url = student.profile_picture_url || null;
  editTempStudent.khmer_name = student.khmer_name || "";
  editTempStudent.latin_name = student.latin_name || "";
  editTempStudent.gender = student.gender || "";
  editTempStudent.date_of_birth = student.date_of_birth || "";
  editTempStudent.phone_number = student.phone_number || "";
  editTempStudent.origin = student.origin || "";
  editTempStudent.department_id = student.department_id || null;
  editTempStudent.program_id = student.program_id || null;
  editTempStudent.file = null;

  // Set department for program filtering
  if (editTempStudent.department_id) {
    setProgramsDepartment(editTempStudent.department_id);
  }

  console.log("✅ Form populated. Profile URL in state:", editTempStudent.profile_picture_url);
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

  if (!editTempStudent.khmer_name || editTempStudent.khmer_name.trim() === "") {
    errors.khmer_name = "Khmer name is required";
    isValid = false;
  }

  if (!editTempStudent.latin_name || editTempStudent.latin_name.trim() === "") {
    errors.latin_name = "Latin name is required";
    isValid = false;
  }

  if (!editTempStudent.gender) {
    errors.gender = "Gender is required";
    isValid = false;
  }

  if (!editTempStudent.date_of_birth) {
    errors.date_of_birth = "Date of birth is required";
    isValid = false;
  }

  if (!editTempStudent.phone_number || editTempStudent.phone_number.trim() === "") {
    errors.phone_number = "Phone number is required";
    isValid = false;
  } else if (!/^[0-9]{8,15}$/.test(editTempStudent.phone_number)) {
    errors.phone_number = "Phone number must be 8-15 digits";
    isValid = false;
  }

  if (!editTempStudent.origin || editTempStudent.origin.trim() === "") {
    errors.origin = "Origin is required";
    isValid = false;
  }

  if (!editTempStudent.department_id) {
    errors.department_id = "Department is required";
    isValid = false;
  }

  if (!editTempStudent.program_id) {
    errors.program_id = "Program is required";
    isValid = false;
  }

  return isValid;
};

// Reset form
const resetForm = () => {
  editTempStudent.id = null;
  editTempStudent.academic_year = "";
  editTempStudent.temp_user_id = null;
  editTempStudent.profile_picture = null;
  editTempStudent.profile_picture_url = null;
  editTempStudent.khmer_name = "";
  editTempStudent.latin_name = "";
  editTempStudent.gender = "";
  editTempStudent.date_of_birth = "";
  editTempStudent.phone_number = "";
  editTempStudent.origin = "";
  editTempStudent.department_id = null;
  editTempStudent.program_id = null;
  editTempStudent.file = null;

  clearErrors();

  // Reset file inputs
  document.querySelectorAll('input[type="file"]').forEach(i => (i.value = ""));
};

// Close modal
const closeEdit = () => {
  emit("close");
  resetForm();
};

// Update temp student
const updateTempStudent = async () => {
  if (!validateForm()) {
    console.log("❌ Validation failed:", errors);
    return;
  }

  if (!editTempStudent.id) {
    errors.global = "Student ID is missing";
    return;
  }

  // Create updated student data
  const updatedData = {
    khmer_name: editTempStudent.khmer_name,
    latin_name: editTempStudent.latin_name,
    gender: editTempStudent.gender,
    date_of_birth: editTempStudent.date_of_birth,
    phone_number: editTempStudent.phone_number,
    origin: editTempStudent.origin,
    department_id: editTempStudent.department_id,
    program_id: editTempStudent.program_id,
  };

  // Include file if changed
  if (editTempStudent.file) {
    updatedData.file = editTempStudent.file;
  }

  console.log("📤 Updating temp student:", updatedData);

  try {
    // Call API to update temp student
    const result = await tempStudentStore.editTempStudent(editTempStudent.id, updatedData);
    
    console.log("✅ Temp student updated successfully:", result);
    
    // Show success notification
    showNotification("Temporary student updated successfully!", "success");
    
    // Emit update event with the result from API
    emit("update", result);
    closeEdit();
  } catch (error) {
    // Display API error to user
    errors.global = tempStudentStore.error || "Failed to update temporary student";
    console.error("❌ Failed to update temp student:", error);
    
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
  editTempStudent.file = f;

  // Create preview URL
  const reader = new FileReader();
  reader.onload = (e) => {
    editTempStudent.profile_picture = e.target.result;
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
  if (e.key === "Escape") closeEdit(); 
};

onMounted(() => {
  window.addEventListener("keydown", onEsc);
  console.log("Edit Temp Student Modal mounted");
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
