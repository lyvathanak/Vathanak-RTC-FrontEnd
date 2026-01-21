<template>
  <div>
    <!-- Modal Overlay -->
    <div
      v-if="props.show"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
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
          <!-- Step 1: File Upload -->
          <div class="space-y-3">
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
                <Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
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
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(student, index) in previewData" :key="index" class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-sm text-gray-700">{{ (rangeFrom || 1) + index }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900">{{ student.name_latin }}</td>
                    <td class="px-3 py-2 text-sm font-semibold text-gray-700">{{ student.score }}</td>
                    <td class="px-3 py-2 text-sm">
                      <span :class="getGradeBadgeClass(student.grade)" class="px-2 py-1 rounded text-xs font-medium">
                        {{ student.grade }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-sm">
                      <span :class="getStatusBadgeClass(student.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ student.status }}
                      </span>
                    </td>
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
              :disabled="filteredData.length === 0 || isImporting"
              :class="[
                'px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2',
                filteredData.length === 0 || isImporting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#235AA6] text-white hover:bg-[#1e4a91]'
              ]"
            >
              <Upload class="w-4 h-4" />
              <span>{{ isImporting ? 'Importing...' : `Import ${selectedCount} Student(s)` }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Upload, X, FileSpreadsheet, CheckCircle, Info } from 'lucide-vue-next';
import * as XLSX from 'xlsx';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['close', 'import']);

// State
const fileInput = ref(null);
const uploadedFile = ref(null);
const uploadError = ref('');
const isDragging = ref(false);
const parsedData = ref([]);
const rangeFrom = ref(1);
const rangeTo = ref(100);
const isImporting = ref(false);

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
          id: Date.now() + index,
          temp_user_id: row['Temp ID'] || row['temp_user_id'] || '',
          name_khmer: row['Name (Khmer)'] || row['name_khmer'] || '',
          name_latin: row['Name (Latin)'] || row['name_latin'] || '',
          gender: row['Gender'] || row['gender'] || '',
          phone_number: row['Phone'] || row['phone_number'] || '',
          origin: row['Origin'] || row['origin'] || '',
          department_id: parseInt(row['Department ID'] || row['department_id']) || null,
          program_id: parseInt(row['Program ID'] || row['program_id']) || null,
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

const handleImport = () => {
  if (filteredData.value.length === 0) return;
  
  isImporting.value = true;
  
  setTimeout(() => {
    emit('import', filteredData.value);
    isImporting.value = false;
    closeModal();
    resetModal();
  }, 500);
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
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Watch for modal close to reset
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetModal();
  }
});
</script>