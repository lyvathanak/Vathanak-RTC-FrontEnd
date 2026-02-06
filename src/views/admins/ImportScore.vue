<template>
  <div
    class="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-6 sm:py-8 space-y-4">
    <PageHeader
      :title="t('import_score')"
      subtitle="Track and manage your import score applications">
      <button
        @click="showImportModal = true"
        :disabled="
          !filters.academicYear || !filters.programId || !filters.yearId
        "
        class="bg-[#235AA6] text-white px-4 py-2 rounded-lg hover:bg-[#235AA6] disabled:opacity-60">
        Import Scores
      </button>
    </PageHeader>

    <!-- Filters -->
    <ImportScoreFilters
      v-model="filters"
      :academicYears="academicYears"
      :programs="programs"
      :years="years"
      @update:modelValue="onFiltersChange" />

    <!-- Table -->
    <ImportScoreTable
      :students="filteredStudents"
      :subjectColumns="subjectColumns" />

    <!-- Modal -->
    <ImportScoreModal
      v-model="showImportModal"
      :defaultAcademicYear="filters.academicYear"
      :defaultProgramId="filters.programId"
      :defaultYearId="filters.yearId"
      @imported="onScoresImported" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { UserProgramCRUD } from "@/stores/apis/UserProgramCRUD";
import ScoreAPI from "@/stores/apis/ScoreAPI";
import { showNotification } from "@/lib/notifications";

import PageHeader from "@/components/features/PageHeader.vue";
import ImportScoreModal from "../../components/admins/ImportScore/ImportScoreModal.vue";
import ImportScoreFilters from "@/components/admins/ImportScore/ImportScoreFilters.vue";
import ImportScoreTable from "@/components/admins/ImportScore/ImportScoreTable.vue";

const { t } = useI18n();

const filters = ref({
  search: "",
  academicYear: "",
  programId: "",
  yearId: "",
});

const allUserPrograms = ref([]);
const programs = ref([]);
const years = ref([]);
const students = ref([]);
const subjectColumns = ref([]);
const showImportModal = ref(false);

const academicYears = computed(() => {
  return [
    ...new Set(allUserPrograms.value.map((p) => p.program.academic_year)),
  ];
});

// ✅ search actually works here
const filteredStudents = computed(() => {
  const q = (filters.value.search || "").toLowerCase().trim();
  if (!q) return students.value;

  return students.value.filter((s) =>
    String(s.student_name || "")
      .toLowerCase()
      .includes(q),
  );
});

onMounted(async () => {
  try {
    const { data } = await UserProgramCRUD.getAllUserPrograms();
    allUserPrograms.value = data;

    if (academicYears.value.length === 1) {
      filters.value.academicYear = academicYears.value[0];
      onAcademicYearChange();
    }
  } catch (err) {
    console.error(err);
    showNotification("Failed to load user programs", "error");
  }
});

function onFiltersChange(newValue) {
  const prev = { ...filters.value }; // clone snapshot BEFORE overwrite
  filters.value = newValue;

  if (newValue.academicYear !== prev.academicYear) onAcademicYearChange();
  else if (newValue.programId !== prev.programId) onProgramChange();
  else if (newValue.yearId !== prev.yearId) onYearChange();
}

function onAcademicYearChange() {
  filters.value.programId = "";
  filters.value.yearId = "";
  years.value = [];
  students.value = [];
  subjectColumns.value = [];

  const filteredByYear = allUserPrograms.value.filter(
    (p) => p.program.academic_year === filters.value.academicYear,
  );

  const map = new Map();
  filteredByYear.forEach((p) => {
    if (!map.has(p.program.id)) map.set(p.program.id, p.program);
  });
  programs.value = Array.from(map.values());

  if (programs.value.length === 1) {
    filters.value.programId = String(programs.value[0].id);
    onProgramChange();
  }
}

function onProgramChange() {
  filters.value.yearId = "";
  students.value = [];
  subjectColumns.value = [];

  const filtered = allUserPrograms.value.filter(
    (p) =>
      String(p.program.id) === String(filters.value.programId) &&
      p.program.academic_year === filters.value.academicYear,
  );

  years.value = [...new Set(filtered.map((p) => p.year))].map((y) => ({
    id: y,
    year: y,
  }));

  if (years.value.length === 1) {
    filters.value.yearId = String(years.value[0].id);
    onYearChange();
  }
}

async function onYearChange() {
  if (!filters.value.yearId) {
    students.value = [];
    subjectColumns.value = [];
    return;
  }

  const filtered = allUserPrograms.value.filter(
    (p) =>
      String(p.program.id) === String(filters.value.programId) &&
      String(p.year) === String(filters.value.yearId),
  );

  students.value = await Promise.all(
    filtered.map(async (p) => {
      try {
        const data = await ScoreAPI.getAllSubjectScoresByUserProgram(p.id);
        const subjects = Array.isArray(data) ? data : data?.subjects || [];
        return {
          user_program_id: p.id,
          student_name: p.user_detail?.latin_name ?? p.user.name,
          email: p.user.email,
          subjects,
        };
      } catch {
        return {
          user_program_id: p.id,
          student_name: p.user_detail?.latin_name ?? p.user.name,
          email: p.user.email,
          subjects: [],
        };
      }
    }),
  );

  const allSubjects = students.value.flatMap((s) =>
    (s.subjects || []).map((sub) => sub.subject_name),
  );
  subjectColumns.value = [...new Set(allSubjects)];

  if (!students.value.length) showNotification("No students found", "warning");
}

function onScoresImported(count) {
  showNotification(`Imported ${count} scores`, "success");
  onYearChange();
}

watch(
  () => filters.value.academicYear,
  (n, o) => {
    if (n !== o) onAcademicYearChange();
  },
);

watch(
  () => filters.value.programId,
  (n, o) => {
    if (n !== o) onProgramChange();
  },
);

watch(
  () => filters.value.yearId,
  (n, o) => {
    if (n !== o) onYearChange();
  },
);
</script>