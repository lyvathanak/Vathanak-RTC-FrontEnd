<template>
  <div class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <PageHeader
      :title="t('academic_information')"
      subtitle="Track and manage your Academic Applications">
      
      <div class="relative w-48 mt-4 sm:mt-0">
        <label class="block text-xs font-medium text-gray-500 mb-1 ml-1">Filter by Year</label>
        <button
          @click="toggleDropdown"
          :disabled="loading || years.length === 0"
          class="w-full border border-[#235AA6] px-4 py-2 rounded-xl flex justify-between items-center bg-[#235AA6] text-white hover:bg-[#1f4f93] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
          <span class="font-medium truncate">{{ selectedYear || "Select Year" }}</span>
          <ChevronDownIcon class="w-5 h-5 text-white/90" />
        </button>

        <ul
          v-show="isOpen && years.length > 0"
          class="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden ring-1 ring-black/5 focus:outline-none">
          <li
            v-for="year in years"
            :key="year"
            @click="selectYear(year)"
            class="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#235AA6] cursor-pointer transition-colors border-b last:border-b-0 border-gray-50 flex items-center justify-between group">
            <span>{{ year }}</span>
            <span v-if="year === selectedYear" class="w-2 h-2 rounded-full bg-[#235AA6]"></span>
          </li>
        </ul>
        
        <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 z-10 cursor-default"></div>
      </div>
    </PageHeader>

    <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-gray-400">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#235AA6] mb-3"></div>
      <div>Loading academic records...</div>
    </div>

    <div v-else-if="error" class="text-center py-20 bg-white rounded-xl shadow-sm border border-red-100 mx-1">
      <div class="text-red-500 font-medium mb-2">{{ error }}</div>
      <button @click="loadData" class="text-sm text-[#235AA6] underline hover:text-blue-800">
        Try Again
      </button>
    </div>

    <div v-else-if="years.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500 gap-2 bg-white rounded-xl shadow-sm border border-gray-200 border-dashed">
      <div class="font-medium text-lg">No academic records found.</div>
      <div class="text-sm text-gray-400">Your academic history will appear here once available.</div>
    </div>

    <div v-else class="flex flex-col gap-8 fade-in">
      <div v-for="sem in [1, 2]" :key="sem" class="flex flex-col gap-3">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2.5 ml-1">
          <Circle
            :fill="sem === 1 ? '#00C746' : '#FACC15'"
            :class="sem === 1 ? 'text-[#00C746]' : 'text-[#FACC15]'"
            class="w-3 h-3" />
          Semester {{ sem }}
        </h3>

        <div
          v-if="getCurrentSemesterData(sem).length > 0"
          class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
          <div class="overflow-x-auto">
            <table class="min-w-full text-left w-full">
              <thead class="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Subject</th>
                  <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Credit</th>
                  <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Grade</th>
                  <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Score</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="(item, index) in getCurrentSemesterData(sem)"
                  :key="index"
                  class="group hover:bg-blue-50/30 transition-colors">
                  <td class="p-4 text-sm font-medium text-gray-900 group-hover:text-[#235AA6] transition-colors">
                    {{ item.subject }}
                    <div v-if="item.code" class="text-[10px] text-gray-400 font-normal">{{ item.code }}</div>
                  </td>
                  <td class="p-4 text-sm text-gray-600 text-center font-medium">{{ item.credit }}</td>
                  <td class="p-4 text-sm text-center">
                    <span 
                      class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      :class="getGradeClass(item.grade)">
                      {{ item.grade }}
                    </span>
                  </td>
                  <td class="p-4 text-sm font-bold text-right tabular-nums">
                    <span 
                      v-if="item.score !== '-'"
                      class="px-3 py-1 rounded-lg"
                      :class="getScoreClass(item.score)">
                      {{ item.score }}
                    </span>
                    <span v-else class="text-gray-300">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div
          v-else
          class="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-200 border-dashed text-gray-400">
          <span class="text-sm italic">
            {{ sem === 1 ? 'No subjects found.' : 'No subjects recorded for Semester 2.' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ChevronDownIcon, Circle } from "lucide-vue-next";
import { getAcademicInfo } from "@/stores/Student/AcademicInfo";
import PageHeader from "@/components/features/PageHeader.vue";

const { t } = useI18n();

const years = ref([]);
const selectedYear = ref("");
const academicData = ref({});
const isOpen = ref(false);
const loading = ref(false);
const error = ref(null);

function toggleDropdown() { isOpen.value = !isOpen.value; }
function selectYear(year) { selectedYear.value = year; isOpen.value = false; }

function getCurrentSemesterData(sem) {
    if (!selectedYear.value) return [];
    return academicData.value[selectedYear.value]?.[`semester${sem}`] || [];
}

function getScoreClass(score) {
    const num = parseFloat(score);
    if (isNaN(num)) return 'text-gray-700';
    if (num >= 85) return 'bg-green-100 text-green-700';
    if (num >= 50) return 'bg-blue-50 text-blue-700';
    return 'text-gray-700';
}

function getGradeClass(grade) {
    if (!grade) return 'bg-gray-100 text-gray-500';
    if (['A', 'B+', 'B'].includes(grade)) return 'bg-green-100 text-green-700';
    if (['C+', 'C', 'D'].includes(grade)) return 'bg-blue-100 text-blue-700';
    if (['F'].includes(grade)) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
}

function mapSubject(subj) {
    return {
        subject: subj.subject_name || subj.name || "Unknown",
        code: subj.subject_code || null, // Added subject code
        credit: subj.credit || 0,
        grade: subj.grade || "-", // Added grade field
        score: subj.score ?? "-",
        remark: subj.remark || null
    };
}

async function loadData() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await getAcademicInfo();
    console.log("📚 Raw Response:", response); 

    // Handle Response Structure
    let historyList = [];
    if (response?.academic_history && Array.isArray(response.academic_history)) {
        historyList = response.academic_history;
    } else if (Array.isArray(response)) {
        historyList = response;
    }

    if (historyList.length === 0) {
        years.value = [];
        return; 
    }

    const uniqueYears = new Set();
    const mappedData = {};

    historyList.forEach((yearRecord) => {
        const yearNum = yearRecord.year;
        if (!yearNum) return;

        const yearKey = `Year ${yearNum}`;
        uniqueYears.add(yearKey);

        if (!mappedData[yearKey]) {
            mappedData[yearKey] = { semester1: [], semester2: [] };
        }

        // --- MAP SUBJECTS ---
        const rawSubjects = yearRecord.subjects || [];
        const mappedSubjects = rawSubjects.map(mapSubject);

        // --- ASSIGN TO SEMESTER ---
        // Your JSON has NO 'semester' field in 'subjects'.
        // DEFAULT: Show all subjects in 'Semester 1' if no semester is specified.
        
        rawSubjects.forEach((rawSubj, index) => {
            const mappedSubj = mappedSubjects[index];
            const semNum = rawSubj.semester || rawSubj.semester_number || 1; // Default to 1
            
            if (semNum == 1) mappedData[yearKey].semester1.push(mappedSubj);
            else if (semNum == 2) mappedData[yearKey].semester2.push(mappedSubj);
        });
    });

    // Sort Years (Newest First)
    years.value = Array.from(uniqueYears).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numB - numA;
    });

    if (years.value.length > 0) {
        selectedYear.value = years.value[0];
        academicData.value = mappedData;
    }

  } catch (err) {
    console.error("❌ Data Load Error:", err);
    error.value = "Unable to load academic history.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>