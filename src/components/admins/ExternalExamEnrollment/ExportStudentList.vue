<template>
  <button
    @click="exportToExcel"
    :disabled="loading || exporting"
    class="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
  >
    <Download v-if="!exporting" class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
    <span v-if="exporting" class="loader"></span>
    <span class="hidden sm:inline">{{ exporting ? 'Exporting...' : 'Export Student List' }}</span>
    <span class="sm:hidden">{{ exporting ? 'Exporting...' : 'Export' }}</span>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Download } from 'lucide-vue-next';
import { useTempStudentStore } from '@/stores/Admin/external_exam/CRUD_temp_student';
import * as XLSX from 'xlsx';

const store = useTempStudentStore();
const exporting = ref(false);

// Computed properties from store
const tempStudents = computed(() => store.allTempStudents);
const loading = computed(() => store.loading);
const hasTempStudents = computed(() => store.hasTempStudents);

/**
 * Export data to Excel
 */
const exportToExcel = async () => {
  exporting.value = true;

  try {
    // Fetch data if not already loaded
    if (!hasTempStudents.value) {
      await store.fetchTempStudents();
    }

    if (!hasTempStudents.value) {
      alert('No data to export');
      exporting.value = false;
      return;
    }
    // Prepare data for export
    const exportData = tempStudents.value.map((student, index) => ({
      'No.': index + 1,
      'ID': student.id || '',
      'Khmer Name': student.khmer_name || '',
      'Latin Name': student.latin_name || '',
      'Date of Birth': student.date_of_birth || '',
      'Gender': student.gender || '',
      'Phone': student.phone_number || '',
      'Origin': student.origin || '',
      'Program': student.program_id || '',
      'Department': student.department_id || '',
      'Score': student.score || '',
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Temp Students');

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.min(
        maxWidth,
        Math.max(
          key.length,
          ...exportData.map(row => String(row[key] || '').length)
        )
      )
    }));
    worksheet['!cols'] = colWidths;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `temp_students_${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, filename);

    console.log(`✅ Successfully exported ${exportData.length} students to ${filename}`);
  } catch (err) {
    console.error('❌ Error exporting to Excel:', err);
    alert('Failed to export data. Please try again.');
  } finally {
    exporting.value = false;
  }
};
</script>

<style scoped>
.loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>