<template>
    <div class="p-4 sm:p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">External Exam Enrollment</h1>
            <div class="flex items-center gap-3">
                
                <button 
                    @click="showAddModal = true"
                    class="px-4 py-2 bg-[#235AA6] text-white rounded-lg hover:bg-[#1e4a91] transition-colors flex items-center gap-2"
                >
                    <Plus class="w-5 h-5" />
                    Add Temp Student
                </button>
                <button 
                    @click="handleExportWithoutScore"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    :disabled="tempStudents.length === 0"
                    :class="{ 'opacity-50 cursor-not-allowed': tempStudents.length === 0 }"
                >
                    <Download class="w-5 h-5" />
                    Export Without Score
                </button>
                <button 
                    @click="showImportScoreModal = true"
                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                    <Upload class="w-5 h-5" />
                    Import With Score
                </button>
            </div>
        </div>

        <!-- Temp Students List -->
        <div class="bg-white rounded-lg shadow">
            <!-- Tab Navigation -->
            <div class="border-b border-gray-200">
                <nav class="flex -mb-px">
                    <button
                        @click="activeTab = 'without-score'"
                        :class="[
                            'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                            activeTab === 'without-score'
                                ? 'border-[#235AA6] text-[#235AA6]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        ]"
                    >
                        Without Score ({{ tempStudents.length > 0 ? tempStudents.length : '0' }})
                    </button>
                    <button
                        @click="activeTab = 'with-score'"
                        :class="[
                            'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                            activeTab === 'with-score'
                                ? 'border-[#235AA6] text-[#235AA6]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        ]"
                    >
                        With Score ({{ studentsWithScore.length > 0 ? studentsWithScore.length : '0' }})
                    </button>
                </nav>
            </div>

            <!-- Tab Content -->
            <div class="p-4">
                <ViewWithoutScore 
                    v-if="activeTab === 'without-score'"
                    :students="tempStudents.length > 0 ? tempStudents : undefined" 
                    :loading="false" 
                    :showSelection="false"
                />

                <div v-if="activeTab === 'with-score'" class="space-y-4">
                    <FilterToDepartment 
                        :total-students="studentsWithScore.length"
                        @filter-change="handleFilterChange"
                    />
                    
                    <ViewWithScore 
                        :students="filteredStudents.length > 0 ? filteredStudents : undefined" 
                        :loading="false" 
                        :showSelection="false"
                    />
                </div>
            </div>

            <!-- Add Temp Student Modal -->
            <AddTempStudentModal
                :showAdd="showAddModal"
                :existingTempStudents="tempStudents"
                @close="showAddModal = false"
                @save="handleSaveTempStudent"
            />

        </div>

        <!-- Import Score Modal -->
        <ImportScore
            :show="showImportScoreModal"
            @close="showImportScoreModal = false"
            @import="handleImportScores"
        />
        
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Plus, Download, Upload } from 'lucide-vue-next';
import AddTempStudentModal from '@/components/admins/ExternalExamEnrollment/AddTempStudentModal.vue';
import ViewWithoutScore from '@/components/admins/ExternalExamEnrollment/ViewWithoutScore.vue';
import ViewWithScore from '@/components/admins/ExternalExamEnrollment/ViewWithScore.vue';
import FilterToDepartment from '@/components/admins/ExternalExamEnrollment/FilterToDepartment.vue';
import ImportScore from '@/components/admins/ExternalExamEnrollment/ImportScore.vue';

// Tab state
const activeTab = ref('without-score');

// Modal state
const showAddModal = ref(false);
const showImportScoreModal = ref(false);

// Temp students list (without score)
const tempStudents = ref([]);

// Students with score
const studentsWithScore = ref([]);

// Filter state
const currentFilters = ref({
    quantityMin: null,
    quantityMax: null,
    departmentId: null,
    programId: null
});

// Filtered students based on current filters
const filteredStudents = computed(() => {
    let filtered = [...studentsWithScore.value];

    // Filter by department
    if (currentFilters.value.departmentId) {
        filtered = filtered.filter(
            student => student.department_id === currentFilters.value.departmentId
        );
    }

    // Filter by program
    if (currentFilters.value.programId) {
        filtered = filtered.filter(
            student => student.program_id === currentFilters.value.programId
        );
    }

    // Filter by quantity range
    const total = filtered.length;
    const min = currentFilters.value.quantityMin;
    const max = currentFilters.value.quantityMax;
    
    if (min !== null && max !== null) {
        // If total students is not within range, return empty array
        if (total < min || total > max) {
            return [];
        }
    } else if (min !== null) {
        if (total < min) {
            return [];
        }
    } else if (max !== null) {
        if (total > max) {
            return [];
        }
    }

    return filtered;
});

// Handle filter change
const handleFilterChange = (filters) => {
    currentFilters.value = filters;
    console.log('🔍 Filters applied:', filters);
    console.log('📊 Filtered students count:', filteredStudents.value.length);
};

// Handle saving temp student
const handleSaveTempStudent = (studentData) => {
    tempStudents.value.push(studentData);
    console.log('✅ Temp student added:', studentData);
    console.log('📋 Total temp students:', tempStudents.value.length);
};

// Handle export students without score
const handleExportWithoutScore = () => {
    if (tempStudents.value.length === 0) {
        alert('No students to export');
        return;
    }

    // Prepare data for export (CSV format)
    const headers = ['Temp ID', 'Name (Khmer)', 'Name (Latin)', 'Gender', 'Phone', 'Origin', 'Department ID', 'Program ID'];
    const csvContent = [
        headers.join(','),
        ...tempStudents.value.map(student => [
            student.temp_user_id,
            `"${student.name_khmer}"`,
            `"${student.name_latin}"`,
            student.gender,
            student.phone_number || '',
            student.origin || '',
            student.department_id,
            student.program_id
        ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_without_score_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Exported students without score');
};

// Handle import students with score from modal
const handleImportScores = (importedStudents) => {
    studentsWithScore.value.push(...importedStudents);
    activeTab.value = 'with-score'; // Switch to with-score tab
    
    console.log('✅ Imported students with score:', importedStudents.length);
    alert(`Successfully imported ${importedStudents.length} students with scores`);
};
</script>