<template>
  <div
    class="p-4 space-y-4 px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen">
    <!-- ================= HEADER ================= -->
    <PageHeader
      :title="t('student_scores')"
      subtitle="Select academic year, program, and year to view students">
      <!-- Import Score Button -->
      <button
        @click="showImportModal = true"
        :disabled="!academicYear || !programId || !yearId"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
        Import Scores
      </button>
    </PageHeader>

    <!-- ================= FILTERS ================= -->
    <div
      class="bg-white border rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Academic Year -->
      <div>
        <label class="text-sm font-medium block mb-1">Academic Year</label>
        <select
          v-model="academicYear"
          @change="onAcademicYearChange"
          class="w-full border rounded-lg px-3 py-2">
          <option value="">Select Academic Year</option>
          <option v-for="y in academicYears" :key="y" :value="y">
            {{ y }}
          </option>
        </select>
      </div>

      <!-- Program -->
      <div>
        <label class="text-sm font-medium block mb-1">Program</label>
        <select
          v-model="programId"
          @change="onProgramChange"
          :disabled="!academicYear"
          class="w-full border rounded-lg px-3 py-2">
          <option value="">Select Program</option>
          <option v-for="p in programs" :key="p.id" :value="p.id">
            {{ p.program_name }}
          </option>
        </select>
      </div>

      <!-- Year / Generation -->
      <div>
        <label class="text-sm font-medium block mb-1">Year / Generation</label>
        <select
          v-model="yearId"
          @change="onYearChange"
          :disabled="!programId"
          class="w-full border rounded-lg px-3 py-2">
          <option value="">Select Year</option>
          <option v-for="y in years" :key="y.id" :value="y.id">
            Year {{ y.year_number ?? y.number_gen }}
          </option>
        </select>
      </div>
    </div>

    <!-- ================= STUDENT LIST ================= -->
    <div v-if="students.length" class="mt-4">
      <div class="bg-white border rounded-xl overflow-x-auto">
        <div class="flex justify-between items-center px-4 py-3 border-b">
          <h2 class="font-semibold">Students</h2>
        </div>

        <table class="w-full text-sm table-auto">
          <thead class="bg-blue-600 text-white">
            <tr>
              <th class="px-4 py-2 text-left font-semibold">Student</th>
              <th class="px-4 py-2 text-left font-semibold">Email</th>
              <th
                v-for="sub in subjectColumns"
                :key="sub"
                class="px-4 py-2 text-left font-semibold">
                {{ sub }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in students"
              :key="s.user_program_id"
              class="border-t hover:bg-gray-50">
              <td class="px-4 py-2">{{ s.student_name }}</td>
              <td class="px-4 py-2">{{ s.email }}</td>
              <td
                v-for="sub in subjectColumns"
                :key="sub"
                class="px-4 py-2 text-center">
                {{
                  s.subjects.find((x) => x.subject_name === sub)?.score ?? "N/A"
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= EMPTY STATE ================= -->
    <div v-else class="text-gray-500 text-sm mt-4">
      Please select academic year, program, and year to view students.
    </div>

    <!-- ================= IMPORT SCORE MODAL ================= -->
    <ImportScoreModal
      v-model="showImportModal"
      :defaultAcademicYear="academicYear"
      :defaultProgramId="programId"
      :defaultYearId="yearId"
      @imported="onScoresImported" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { UserProgramCRUD } from "@/stores/apis/UserProgramCRUD";
import ScoreAPI from "@/stores/apis/ScoreAPI";
import { showNotification } from "@/lib/notifications";
import { useI18n } from "vue-i18n";
import ImportScoreModal from "./ImportScoreModal.vue";
import PageHeader from "@/components/features/PageHeader.vue";

const { t, locale } = useI18n();
const academicYear = ref("");
const programId = ref("");
const yearId = ref("");

const allUserPrograms = ref([]);
const programs = ref([]);
const years = ref([]);
const students = ref([]);
const subjectColumns = ref([]);

const showImportModal = ref(false);

/* -------------------- COMPUTED -------------------- */
const academicYears = computed(() => {
  return [
    ...new Set(allUserPrograms.value.map((p) => p.program.academic_year)),
  ];
});

/* -------------------- LOAD DATA -------------------- */
onMounted(async () => {
  try {
    const { data } = await UserProgramCRUD.getAllUserPrograms();
    allUserPrograms.value = data;

    // Auto select if only one option
    if (academicYears.value.length === 1) {
      academicYear.value = academicYears.value[0];
      onAcademicYearChange();
    }
  } catch (err) {
    console.error(err);
    showNotification("Failed to load user programs", "error");
  }
});

/* -------------------- FILTERS -------------------- */
function onAcademicYearChange() {
  programId.value = "";
  yearId.value = "";
  students.value = [];
  subjectColumns.value = [];

  programs.value = allUserPrograms.value
    .filter((p) => p.program.academic_year === academicYear.value)
    .map((p) => p.program);

  if (programs.value.length === 1) {
    programId.value = programs.value[0].id;
    onProgramChange();
  }
}

function onProgramChange() {
  yearId.value = "";
  students.value = [];
  subjectColumns.value = [];

  const filtered = allUserPrograms.value.filter(
    (p) => p.program_id == programId.value
  );

  // Use generation from API
  years.value = [
    ...new Map(filtered.map((p) => [p.generation.id, p.generation])).values(),
  ];

  // Auto-select if only one year
  if (years.value.length === 1) {
    yearId.value = years.value[0].id;
    onYearChange();
  }
}

async function onYearChange() {
  if (!yearId.value) {
    students.value = [];
    subjectColumns.value = [];
    return;
  }

  const filtered = allUserPrograms.value.filter(
    (p) => p.program_id == programId.value && p.generation.id == yearId.value
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
    })
  );

  const allSubjects = students.value.flatMap((s) =>
    s.subjects.map((sub) => sub.subject_name)
  );
  subjectColumns.value = [...new Set(allSubjects)];

  if (!students.value.length) showNotification("No students found", "warning");
}

/* -------------------- AFTER IMPORT -------------------- */
function onScoresImported(count) {
  showNotification(`Imported ${count} scores`, "success");
  onYearChange(); // refresh table with new scores
}
</script>

<style scoped>
/* Optional: custom scrollbar for student table if needed */
table::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
table::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
thead th {
  /* Optional: add shadow and padding */
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
</style>
