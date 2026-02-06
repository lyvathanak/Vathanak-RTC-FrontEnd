<template>
  <div
    class="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-6 sm:py-8 space-y-4">
    <PageHeader
      :title="t('external_exam_enrollment')"
      subtitle="Track and manage your external exam applications for temp students">
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          @click="showAddModal = true"
          class="px-3 py-2 sm:px-4 sm:py-2 bg-[#235AA6] text-white rounded-lg hover:bg-[#1e4a91] transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <Plus class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span class="hidden sm:inline">Add Temp Student</span>
          <span class="sm:hidden">Add</span>
        </button>
        <ExportStudentList />
        <button
          @click="showImportScoreModal = true"
          class="px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <Upload class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span class="hidden sm:inline">Import Student Score</span>
          <span class="sm:hidden">Import</span>
        </button>
      </div>
    </PageHeader>

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
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]">
            Without Score ({{
              tempStudents.length > 0 ? tempStudents.length : "0"
            }})
          </button>
          <button
            @click="activeTab = 'with-score'"
            :class="[
              'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'with-score'
                ? 'border-[#235AA6] text-[#235AA6]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]">
            With Score ({{ studentsWithScoreCount }})
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-4">
        <ViewWithoutScore
          v-if="activeTab === 'without-score'"
          :students="tempStudents.length > 0 ? tempStudents : undefined"
          :loading="false"
          :showSelection="false" />

        <div v-if="activeTab === 'with-score'" class="space-y-4">
          <!-- Show loading state -->
          <div v-if="loadingScores" class="text-center py-8">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#235AA6]"></div>
            <p class="mt-2 text-gray-600">Loading scores...</p>
          </div>

          <!-- Show content when not loading -->
          <template v-else>
            <FilterToDepartment
              :total-students="studentsWithScoreCount"
              @filter-change="handleFilterChange" />

            <ViewWithScore
              :academic-year="academicYear"
              :showSelection="false" />
          </template>
        </div>
      </div>

      <!-- Add Temp Student Modal -->
      <AddTempStudentModal
        :showAdd="showAddModal"
        :existingTempStudents="tempStudents"
        @close="showAddModal = false"
        @save="handleSaveTempStudent" />
    </div>

    <!-- Import Score Modal -->
    <ImportScore
      :show="showImportScoreModal"
      @close="showImportScoreModal = false"
      @uploaded="handleImportScores" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Plus, Download, Upload } from "lucide-vue-next";
import { useUploadFileScoreStore } from "@/stores/Admin/external_exam/upload_file_score";
import { useTempStudentStore } from "@/stores/Admin/external_exam/CRUD_temp_student";
import { useTempStudentListStore } from "@/stores/Admin/external_exam/get_temp_student_list";
import { useI18n } from "vue-i18n";
import AddTempStudentModal from "@/components/admins/ExternalExamEnrollment/AddTempStudentModal.vue";
import ViewWithoutScore from "@/components/admins/ExternalExamEnrollment/ViewWithoutScore.vue";
import ViewWithScore from "@/components/admins/ExternalExamEnrollment/ViewWithScore.vue";
import FilterToDepartment from "@/components/admins/ExternalExamEnrollment/FilterToDepartment.vue";
import ImportScore from "@/components/admins/ExternalExamEnrollment/ImportScore.vue";
import ExportStudentList from "@/components/admins/ExternalExamEnrollment/ExportStudentList.vue";
import PageHeader from "@/components/features/PageHeader.vue";

const { t, locale } = useI18n();

// Stores
const uploadStore = useUploadFileScoreStore();
const tempStudentStore = useTempStudentStore();
const tempStudentListStore = useTempStudentListStore();

// Academic year (could be dynamic based on user selection)
const academicYear = ref(2026);

// Tab state
const activeTab = ref("without-score");

// Modal state
const showAddModal = ref(false);
const showImportScoreModal = ref(false);

// Temp students from store (without score)
const tempStudents = computed(() => tempStudentStore.allTempStudents);

// Students with score count from store
const studentsWithScoreCount = computed(
  () => tempStudentListStore.totalStudents,
);

// Loading state
const loadingScores = ref(false);

// Fetch uploaded scores on mount
onMounted(async () => {
  await fetchTempStudents();
  await fetchUploadedScores();
});

// Fetch temp students without score
const fetchTempStudents = async () => {
  try {
    console.log("📥 Fetching temp students...");
    await tempStudentStore.fetchTempStudents(1);
    console.log("✅ Temp students fetched:", tempStudents.value.length);
  } catch (error) {
    console.error("❌ Error fetching temp students:", error);
  }
};

// Fetch uploaded score files and their data
const fetchUploadedScores = async () => {
  try {
    loadingScores.value = true;
    console.log("📥 Fetching students with scores...");

    // Fetch the temp student list with scores
    await tempStudentListStore.fetchTempStudentList(academicYear.value);

    console.log(
      "✅ Students with scores fetched:",
      tempStudentListStore.totalStudents,
    );
  } catch (error) {
    console.error("❌ Error fetching students with scores:", error);
  } finally {
    loadingScores.value = false;
  }
};

// Filter state
const currentFilters = ref({
  quantityMin: null,
  quantityMax: null,
  departmentId: null,
  programId: null,
});

// Handle filter change
const handleFilterChange = (filters) => {
  currentFilters.value = filters;
  console.log("🔍 Filters applied:", filters);
  // TODO: Apply filters to the ViewWithScore component if needed
};

// Handle saving temp student
const handleSaveTempStudent = (studentData) => {
  tempStudentStore.addTempStudentToList(studentData);
  console.log("✅ Temp student added:", studentData);
  console.log("📋 Total temp students:", tempStudents.value.length);
};

// Handle export students without score
const handleExportWithoutScore = () => {
  if (tempStudents.value.length === 0) {
    alert("No students to export");
    return;
  }

  // Prepare data for export (CSV format)
  const headers = [
    "Temp ID",
    "Name (Khmer)",
    "Name (Latin)",
    "Gender",
    "Phone",
    "Origin",
    "Department ID",
    "Program ID",
  ];
  const csvContent = [
    headers.join(","),
    ...tempStudents.value.map((student) =>
      [
        student.temp_user_id,
        `"${student.name_khmer}"`,
        `"${student.name_latin}"`,
        student.gender,
        student.phone_number || "",
        student.origin || "",
        student.department_id,
        student.program_id,
      ].join(","),
    ),
  ].join("\n");

  // Create and download file
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `students_without_score_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log("✅ Exported students without score");
};

// Handle import students with score from modal
const handleImportScores = async (data) => {
  const { file, students } = data;

  // Switch to with-score tab
  activeTab.value = "with-score";

  console.log("✅ File uploaded:", file);
  console.log("✅ Imported students with score:", students.length);

  // Refresh the students with scores
  await fetchUploadedScores();

  // Show success message
  alert(`Successfully imported ${students.length} students with scores`);
};
</script>
