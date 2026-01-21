<template>
  <div
    class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <!-- Header -->
    <PageHeader
      :title="t('academic_information')"
      subtitle="Track and manage your Academic Applications">
      <!-- Right: Academic Year Selector -->
      <div class="relative w-40 mt-4 sm:mt-0">
        <button
          @click="toggleDropdown"
          class="w-full border border-[#235AA6] p-2 rounded-[10px] flex justify-between items-center bg-[#235AA6] text-white hover:bg-[#1f4f93] transition-colors">
          <span>{{ selectedYear || "Academic Year" }}</span>
          <ChevronDownIcon class="w-5 h-5 text-white" />
        </button>

        <ul
          v-show="isOpen"
          class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <li
            v-for="year in years"
            :key="year"
            @click="selectYear(year)"
            class="px-3 py-2 hover:bg-blue-100 cursor-pointer">
            {{ year }}
          </li>
        </ul>
      </div>
    </PageHeader>

    <!-- Semester Tables -->
    <div v-for="sem in [1, 2]" :key="sem" class="mt-10">
      <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <Circle
          :color="sem === 1 ? '#00C746' : '#FACC15'"
          width="10"
          height="11" />
        Semester {{ sem }}
      </h3>

      <div
        v-if="academicData[selectedYear]?.[`semester${sem}`]?.length"
        class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-4 font-medium text-gray-600">Subject</th>
                <th class="p-4 font-medium text-gray-600">Credit</th>
                <th class="p-4 font-medium text-gray-600">Absence</th>
                <th class="p-4 font-medium text-gray-600">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in academicData[selectedYear]?.[
                  `semester${sem}`
                ]"
                :key="index"
                class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-4">{{ item.subject }}</td>
                <td class="p-4">{{ item.credit }}</td>
                <td class="p-4">{{ item.absence }}</td>
                <td class="p-4">{{ item.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p
        v-else
        class="text-gray-400 text-center py-4 italic bg-white rounded-xl shadow-md">
        No data for Semester {{ sem }}.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ChevronDownIcon, Circle } from "lucide-vue-next";
import { getAcademicInfo } from "@/stores/Student/AcademicInfo";
import PageHeader from "@/components/features/PageHeader.vue";

// I18n
const { t, locale } = useI18n();

// State
const years = ref([]);
const selectedYear = ref("");
const academicData = ref({});
const isOpen = ref(false);

// Dropdown
function toggleDropdown() {
  isOpen.value = !isOpen.value;
}
function selectYear(year) {
  selectedYear.value = year;
  isOpen.value = false;
}

// Fake Data
function getFakeData() {
  return {
    Year1: {
      semester1: [
        { subject: "Mathematics I", credit: 3, absence: 1, score: 88 },
        { subject: "Physics I", credit: 3, absence: 0, score: 92 },
        { subject: "Computer Basics", credit: 2, absence: 0, score: 95 },
      ],
      semester2: [
        { subject: "Mathematics II", credit: 3, absence: 0, score: 85 },
        { subject: "Physics II", credit: 3, absence: 1, score: 90 },
        { subject: "Programming I", credit: 3, absence: 0, score: 93 },
      ],
    },
    Year2: {
      semester1: [
        { subject: "Algebra", credit: 3, absence: 0, score: 87 },
        { subject: "Chemistry I", credit: 3, absence: 2, score: 80 },
      ],
      semester2: [
        { subject: "Calculus", credit: 3, absence: 1, score: 88 },
        { subject: "Chemistry II", credit: 3, absence: 0, score: 92 },
      ],
    },
    Year3: {
      semester1: [
        { subject: "Data Structures", credit: 3, absence: 0, score: 91 },
        { subject: "Electronics", credit: 2, absence: 1, score: 85 },
      ],
      semester2: [
        { subject: "Algorithms", credit: 3, absence: 0, score: 89 },
        { subject: "Operating Systems", credit: 3, absence: 0, score: 94 },
      ],
    },
  };
}

// Fetch Data
onMounted(async () => {
  try {
    const response = await getAcademicInfo();
    0;
    const semesters = response.semesters || [];
    if (!semesters.length) throw new Error("No data");

    const academicYears = [
      ...new Set(semesters.map((s) => s.academic_year?.year_number)),
    ];
    years.value = academicYears.map((num) => `Year${num}`);
    selectedYear.value = years.value[0] || "";

    const mappedData = {};
    years.value.forEach((year) => {
      mappedData[year] = { semester1: [], semester2: [] };
    });

    semesters.forEach((sem) => {
      const yearKey = `Year${sem.academic_year?.year_number || 1}`;
      const semesterMapped = sem.subjects.map((subj) => ({
        subject: subj.subject_name,
        credit: subj.credit,
        absence: subj.attendance_count?.absent || 0,
        score: subj.scores ?? "-",
      }));
      if (sem.semester_number === 1)
        mappedData[yearKey].semester1 = semesterMapped;
      if (sem.semester_number === 2)
        mappedData[yearKey].semester2 = semesterMapped;
    });

    academicData.value = mappedData;
  } catch (error) {
    console.warn("API failed, using fake data:", error);
    const fake = getFakeData();
    academicData.value = fake;
    years.value = Object.keys(fake);
    selectedYear.value = years.value[0];
  }
});
</script>
