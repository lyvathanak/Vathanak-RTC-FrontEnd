<template>
  <div>
    <!-- Modal Overlay -->
    <div
      v-if="props.show"
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto"
      @click.self="closeModal"
    >
      <!-- Modal Content -->
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-purple-100 rounded-lg">
              <Upload class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Import Scores</h2>
              <p class="text-sm text-gray-500">Upload Excel file with student scores</p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <!-- Loading State -->
          <div v-if="isFetchingFile" class="flex flex-col items-center justify-center py-12 space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#235AA6]"></div>
            <p class="text-sm text-gray-600">Checking for existing file...</p>
          </div>

          <!-- Existing File Info (if file exists) -->
          <div v-else-if="fileExists && !uploadedFile" class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-sm font-semibold">
                  ✓
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Using Existing File</h3>
              </div>
              <button
                @click="fileExists = false"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Upload Different File
              </button>
            </div>
            
            <div class="border-2 border-green-500 bg-green-50 rounded-lg p-6 sm:p-8">
              <div class="flex items-center justify-center flex-col space-y-2">
                <CheckCircle class="w-12 h-12 text-green-600" />
                <p class="text-sm sm:text-base font-medium text-gray-700">
                  {{ existingFileName }}
                </p>
                <p class="text-xs sm:text-sm text-gray-600">
                  {{ parsedData.length }} students loaded
                </p>
              </div>
            </div>
          </div>

          <!-- Step 1: File Upload (show if no existing file OR user wants to replace) -->
          <div v-else-if="!isFetchingFile && (!fileExists || uploadedFile)" class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="flex items-center justify-center w-6 h-6 rounded-full bg-[#235AA6] text-white text-sm font-semibold">
                1
              </div>
              <h3 class="text-lg font-semibold text-gray-800">Upload Excel File</h3>
            </div>
            
            <div
              @click="triggerFileInput"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              :class="[
                'border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all',
                isDragging
                  ? 'border-[#235AA6] bg-blue-50'
                  : uploadedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-[#235AA6] hover:bg-gray-50'
              ]"
            >
              <input
                ref="fileInput"
                type="file"
                accept=".xlsx,.xls,.csv"
                class="hidden"
                @change="handleFileSelect"
              />
              
              <div v-if="!uploadedFile" class="space-y-2">
                <FileSpreadsheet class="w-12 h-12 mx-auto text-gray-400" />
                <p class="text-sm sm:text-base font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p class="text-xs sm:text-sm text-gray-500">
                  Excel files (.xlsx, .xls) or CSV (.csv)
                </p>
              </div>

              <div v-else class="space-y-2">
                <CheckCircle class="w-12 h-12 mx-auto text-green-500" />
                <p class="text-sm sm:text-base font-medium text-gray-700">
                  {{ uploadedFile.name }}
                </p>
                <p class="text-xs sm:text-sm text-gray-500">
                  {{ formatFileSize(uploadedFile.size) }}
                </p>
                <button
                  @click.stop="removeFile"
                  class="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove file
                </button>
              </div>
            </div>

            <div v-if="uploadError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{{ uploadError }}</p>
            </div>

            <!-- Save File Button -->
            <div v-if="uploadedFile && !fileExists" class="flex justify-end">
              <button
                @click="handleSaveFile"
                :disabled="isSavingFile"
                :class="[
                  'px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2',
                  isSavingFile
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                ]"
              >
                <CheckCircle class="w-4 h-4" />
                <span v-if="isSavingFile">Saving...</span>
                <span v-else>Save File</span>
              </button>
            </div>
          </div>

          <!-- Step 2: Range Selection -->
          <div v-if="parsedData.length > 0" class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="flex items-center justify-center w-6 h-6 rounded-full bg-[#235AA6] text-white text-sm font-semibold">
                2
              </div>
              <h3 class="text-lg font-semibold text-gray-800">Select Student Range</h3>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start gap-2 mb-3">
                <Info class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p class="text-sm text-blue-700">
                  Total students in file: <span class="font-semibold">{{ parsedData.length }}</span>
                  (sorted by score - highest to lowest)
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    From (Start Position)
                  </label>
                  <input
                    v-model.number="rangeFrom"
                    type="number"
                    min="1"
                    :max="parsedData.length"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-transparent"
                    placeholder="e.g., 1"
                  />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    To (End Position)
                  </label>
                  <input
                    v-model.number="rangeTo"
                    type="number"
                    :min="rangeFrom || 1"
                    :max="parsedData.length"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-transparent"
                    placeholder="e.g., 100"
                  />
                </div>
              </div>

              <p class="text-sm text-gray-600 mt-3">
                Will import: <span class="font-semibold text-[#235AA6]">{{ selectedCount }}</span> student(s)
              </p>
            </div>
          </div>

          <!-- Step 3: Preview -->
          <div v-if="filteredData.length > 0" class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="flex items-center justify-center w-6 h-6 rounded-full bg-[#235AA6] text-white text-sm font-semibold">
                3
              </div>
              <h3 class="text-lg font-semibold text-gray-800">Preview (First 5 Records)</h3>
            </div>

            <div class="overflow-x-auto border border-gray-200 rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">No.</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Khmer Name</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Latin Name</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Origin</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(student, index) in previewData" :key="index" class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-sm text-gray-700">{{ (rangeFrom || 1) + index }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700">{{ student.id }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900">{{ student.khmer_name }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900">{{ student.latin_name }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700">{{ student.gender }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700">{{ student.phone_number }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700">{{ student.origin }}</td>
                    <td class="px-3 py-2 text-sm font-semibold text-gray-700">{{ student.score }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p v-if="filteredData.length > 5" class="text-sm text-gray-500 text-center">
              ...and {{ filteredData.length - 5 }} more students
            </p>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <div class="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleImport"
              :disabled="filteredData.length === 0 || isImporting || isUploading || isSavingFile || uploadedFile !== null"
              :class="[
                'px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2',
                filteredData.length === 0 || isImporting || isUploading || isSavingFile || uploadedFile !== null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#235AA6] text-white hover:bg-[#1e4a91]'
              ]"
            >
              <Upload class="w-4 h-4" />
              <span v-if="isUploading">Uploading {{ uploadProgress }}%...</span>
              <span v-else-if="isSavingFile">Saving...</span>
              <span v-else-if="isImporting">Processing...</span>
              <span v-else-if="uploadedFile !== null">Save File First</span>
              <span v-else>Import</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Upload, X, FileSpreadsheet, CheckCircle, Info } from 'lucide-vue-next';
import * as XLSX from 'xlsx';
import { useUploadFileScoreStore } from '@/stores/Admin/external_exam/upload_file_score';
import api from '@/stores/apis/axios';
import { finalizeExam } from '@/stores/Admin/external_exam/import_selected_student';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  academicYear: {
    type: Number,
    default: () => new Date().getFullYear()
  }
});

// Emits
const emit = defineEmits(['close', 'import', 'uploaded']);

// Store
const uploadStore = useUploadFileScoreStore();

// State
const fileInput = ref(null);
const uploadedFile = ref(null);
const uploadError = ref('');
const isDragging = ref(false);
const parsedData = ref([]);
const rangeFrom = ref(1);
const rangeTo = ref(100);
const isImporting = ref(false);
const isSavingFile = ref(false);
const fileExists = ref(false);
const isFetchingFile = ref(false);
const existingFileName = ref('');
const existingFileId = ref(null);

// Computed
const filteredData = computed(() => {
  if (parsedData.value.length === 0) return [];
  
  const from = Math.max(1, rangeFrom.value || 1);
  const to = Math.min(parsedData.value.length, rangeTo.value || parsedData.value.length);
  
  return parsedData.value.slice(from - 1, to);
});

const previewData = computed(() => {
  return filteredData.value.slice(0, 5);
});

const selectedCount = computed(() => {
  return filteredData.value.length;
});

// Methods
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    processFile(file);
  }
};

const handleFileDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    processFile(file);
  }
};

const processFile = async (file) => {
  uploadError.value = '';
  
  // Validate file type
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];
  
  if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
    uploadError.value = 'Please upload a valid Excel or CSV file';
    return;
  }

  uploadedFile.value = file;

  try {
    const data = await readExcelFile(file);
    parsedData.value = data;
    
    // Auto-adjust range
    rangeTo.value = Math.min(100, data.length);
  } catch (error) {
    uploadError.value = 'Error reading file: ' + error.message;
    uploadedFile.value = null;
  }
};

const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Transform and sort data
        const transformedData = jsonData.map((row, index) => ({
          id: row['ID'] || row['id'] || Date.now() + index,
          khmer_name: row['Khmer Name'] || row['khmer_name'] || '',
          latin_name: row['Latin Name'] || row['latin_name'] || '',
          date_of_birth: row['Date of Birth'] || row['date_of_birth'] || '',
          gender: row['Gender'] || row['gender'] || '',
          phone_number: row['Phone'] || row['phone_number'] || '',
          origin: row['Origin'] || row['origin'] || '',
          department_id: parseInt(row['Department'] || row['department_id']) || null,
          program_id: parseInt(row['Program'] || row['program_id']) || null,
          score: parseFloat(row['Score'] || row['score']) || 0,
          grade: row['Grade'] || row['grade'] || '',
          status: row['Status'] || row['status'] || '',
          profile_picture: '/src/assets/default-avatar.png'
        }));

        // Sort by score (highest to lowest)
        transformedData.sort((a, b) => b.score - a.score);

        resolve(transformedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

const removeFile = () => {
  uploadedFile.value = null;
  parsedData.value = [];
  uploadError.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

const fetchExistingFile = async () => {
  isFetchingFile.value = true;
  uploadError.value = '';
  
  try {
    // Try to get existing file from store
    const existingFile = await uploadStore.getExistingScoreFile();
    
    console.log('🔍 Fetch result:', existingFile);
    
    if (existingFile && existingFile.filename) {
      console.log(`✅ Found existing file: ${existingFile.filename}`);
      
      // Construct the full URL to the file using the download endpoint
      const fileUrl = `/external_exam/scores/${existingFile.id}/download`;
      console.log(`📥 Downloading file from: ${fileUrl}`);
      
      try {
        // Fetch the Excel file from backend storage with authentication
        const response = await api.get(fileUrl, {
          responseType: 'blob'
        });
        
        const blob = response.data;
        console.log(`✅ File downloaded: ${blob.size} bytes`);
        
        // Create a File object from the blob
        const file = new File([blob], existingFile.filename, {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        // Parse the Excel file
        const studentData = await readExcelFile(file);
        console.log(`✅ Parsed ${studentData.length} students from file`);
        
        if (studentData.length > 0) {
          // ⚠️ Try to fetch student IDs from backend if available
          try {
            const studentIdsResponse = await api.get(`/external_exam/scores/${existingFile.id}/students`);
            if (studentIdsResponse.data && Array.isArray(studentIdsResponse.data)) {
              // Map temp_student_id from backend to parsed data
              studentData.forEach((student, index) => {
                if (studentIdsResponse.data[index]?.temp_student_id) {
                  student.temp_student_id = studentIdsResponse.data[index].temp_student_id;
                }
              });
              console.log('✅ Mapped student IDs from backend');
            }
          } catch (err) {
            console.warn('⚠️ Could not fetch student IDs from backend:', err.message);
          }
          
          // Set file exists flag
          fileExists.value = true;
          existingFileName.value = existingFile.filename;
          existingFileId.value = existingFile.id;
          parsedData.value = studentData;
          
          // Auto-adjust range
          rangeTo.value = Math.min(100, parsedData.value.length);
          
          console.log(`✅ Range set: ${rangeFrom.value} to ${rangeTo.value}`);
        } else {
          console.log('⚠️ File is empty');
          fileExists.value = false;
        }
      } catch (fetchError) {
        console.error('❌ Failed to download or parse file:', fetchError);
        uploadError.value = 'Failed to load existing file. Please upload a new one.';
        fileExists.value = false;
      }
    } else {
      console.log('ℹ️ No existing file found');
      fileExists.value = false;
    }
  } catch (error) {
    console.log('ℹ️ No existing file available:', error.message);
    fileExists.value = false;
  } finally {
    isFetchingFile.value = false;
  }
};

const getGradeBadgeClass = (grade) => {
  const classes = {
    'A': 'bg-green-100 text-green-800',
    'B': 'bg-blue-100 text-blue-800',
    'C': 'bg-yellow-100 text-yellow-800',
    'D': 'bg-orange-100 text-orange-800',
    'F': 'bg-red-100 text-red-800',
  };
  return classes[grade] || 'bg-gray-100 text-gray-800';
};

const getStatusBadgeClass = (status) => {
  const classes = {
    'Passed': 'bg-green-100 text-green-800',
    'Failed': 'bg-red-100 text-red-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const handleSaveFile = async () => {
  if (!uploadedFile.value) return;
  
  isSavingFile.value = true;
  uploadError.value = '';

  try {
    console.log('📤 Saving file to backend...');
    const result = await uploadStore.uploadScoreFile(uploadedFile.value, props.academicYear);
    console.log('✅ File saved successfully:', result);
    
    // Get the file ID (handle cases where backend might not return it directly)
    let fileId = result.id || result.data?.id;
    
    // If no ID returned, try to fetch it from the backend
    if (!fileId) {
      console.warn('⚠️ Backend did not return file ID. Attempting to fetch...');
      try {
        const existingFile = await uploadStore.getExistingScoreFile();
        if (existingFile && existingFile.id) {
          fileId = existingFile.id;
          console.log('✅ Retrieved file ID:', fileId);
        }
      } catch (fetchError) {
        console.error('❌ Could not fetch file ID:', fetchError);
      }
    }
    
    // Check if backend returned students with temp_student_id
    if (result.students && Array.isArray(result.students) && result.students.length > 0) {
      console.log('📋 Backend returned student data with database IDs');
      parsedData.value = result.students.sort((a, b) => b.score - a.score);
      console.log(`✅ Saved ${parsedData.value.length} students with database IDs`);
    } else {
      console.warn('⚠️ Backend did not return students. Using frontend-parsed data.');
      console.warn('⚠️ Students will be created during import finalization.');
    }
    
    // Mark as existing file
    fileExists.value = true;
    existingFileName.value = uploadedFile.value.name;
    existingFileId.value = fileId;
    
    console.log(`✅ File saved with ID: ${fileId}`);
    
    // Clear the uploaded file to show "using existing file" state
    uploadedFile.value = null;
    
  } catch (error) {
    console.error('❌ Save file failed:', error);
    uploadError.value = error.response?.data?.message || uploadStore.error || error.message || 'Failed to save file. Please try again.';
  } finally {
    isSavingFile.value = false;
  }
};

const handleImport = async () => {
  if (parsedData.value.length === 0) return;
  
  isImporting.value = true;
  uploadError.value = '';

  try {
    let fileId;
    
    // Check if we're using a saved file
    if (existingFileId.value) {
      console.log('📋 Using saved file with ID:', existingFileId.value);
      fileId = existingFileId.value;
    } else if (uploadedFile.value) {
      throw new Error('Please save the file first before importing.');
    } else {
      throw new Error('No file available for import');
    }
    
    // ⚠️ Note: Backend will create temp_students during finalization if they don't exist
    const missingIds = parsedData.value.filter(s => !s.temp_student_id && !s.id);
    if (missingIds.length > 0) {
      console.warn(`⚠️ ${missingIds.length} students don't have database IDs yet. Backend will create them during finalization.`);
    }
    
    // Finalize exam enrollment with ALL students
    // Backend will determine selected vs non-selected based on rank range
    console.log('📋 Finalizing exam enrollment...');
    console.log(`📊 Sending ALL ${parsedData.value.length} students with rank range ${rangeFrom.value}-${rangeTo.value}`);
    const finalizeResult = await finalizeExam({
      academicYear: props.academicYear,
      importScoreId: fileId,
      fromRank: rangeFrom.value || 1,
      toRank: rangeTo.value || parsedData.value.length,
      students: parsedData.value // ✅ Send ALL students, not filtered subset
    });
    
    console.log('✅ Exam finalized successfully:', finalizeResult);
    
    // Emit the uploaded data and result
    emit('uploaded', {
      file: { id: fileId, filename: existingFileName.value || uploadedFile.value?.name },
      students: parsedData.value, // All students
      selectedRange: { from: rangeFrom.value, to: rangeTo.value },
      finalizeResult
    });
    
    emit('import', filteredData.value);
    
    // Close modal and reset
    closeModal();
    resetModal();
  } catch (error) {
    console.error('❌ Import failed:', error);
    uploadError.value = error.response?.data?.message || uploadStore.error || 'Failed to import students. Please try again.';
  } finally {
    isImporting.value = false;
  }
};

const closeModal = () => {
  emit('close');
};

const resetModal = () => {
  uploadedFile.value = null;
  parsedData.value = [];
  uploadError.value = '';
  rangeFrom.value = 1;
  rangeTo.value = 100;
  fileExists.value = false;
  isFetchingFile.value = false;
  existingFileName.value = '';
  existingFileId.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  uploadStore.resetUploadState();
};

// Watch for modal open/close
watch(() => props.show, async (newVal) => {
  if (newVal) {
    // Modal opened - try to fetch existing file
    await fetchExistingFile();
  } else {
    // Modal closed - reset
    resetModal();
  }
});

// Watch upload progress
const uploadProgress = computed(() => uploadStore.progressPercentage);
const isUploading = computed(() => uploadStore.isUploading);
</script>