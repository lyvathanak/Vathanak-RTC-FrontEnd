<template>
  <div class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ t('timetable_management') }}</h1>
          <p class="text-sm text-gray-500">Filter to view department schedules</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div class="space-y-1">
          <label class="text-xs font-semibold text-gray-700">Sub-Department</label>
          <select v-model="filters.sub_department_id" class="w-full rounded-lg border-gray-300 text-sm focus:ring-[#235AA6] focus:border-[#235AA6]">
            <option :value="null">All Sub-Departments</option>
            <option v-for="sd in subDepartments" :key="sd.id" :value="sd.id">{{ sd.name || sd.sub_department_name }}</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-semibold text-gray-700">Program <span class="text-red-500">*</span></label>
          <select 
            v-model="filters.program_id" 
            @change="onProgramChange"
            class="w-full rounded-lg border-gray-300 text-sm focus:ring-[#235AA6] focus:border-[#235AA6]"
          >
            <option :value="null" disabled>Select Program</option>
            <option v-for="p in programs" :key="p.id" :value="p.id">{{ p.name || p.program_name }}</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-semibold text-gray-700">Academic Year <span class="text-red-500">*</span></label>
          <select 
            v-model="filters.academic_year" 
            @change="onAcademicYearChange"
            :disabled="!filters.program_id"
            class="w-full rounded-lg border-gray-300 text-sm focus:ring-[#235AA6] focus:border-[#235AA6] disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option :value="null" disabled>Select Year</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">
              {{ year.year_label }}
            </option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-semibold text-gray-700">Semester <span class="text-red-500">*</span></label>
          <select 
            v-model="filters.semester_id" 
            @change="onSemesterChange"
            :disabled="!filters.academic_year"
            class="w-full rounded-lg border-gray-300 text-sm focus:ring-[#235AA6] focus:border-[#235AA6] disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option :value="null" disabled>Select Semester</option>
            <option v-for="s in filteredSemesters" :key="s.id" :value="s.id">
              Semester {{ s.semester_number || s.semester }} ({{ s.start_date }} - {{ s.end_date }})
            </option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-semibold text-gray-700">Group <span class="text-red-500">*</span></label>
          <select 
            v-model="filters.group_id" 
            :disabled="!filters.semester_id"
            class="w-full rounded-lg border-gray-300 text-sm focus:ring-[#235AA6] focus:border-[#235AA6] disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option :value="null" disabled>Select Group</option>
            <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name || g.group_code }}</option>
          </select>
        </div>
      </div>

      <div class="flex justify-end">
        <button 
          @click="fetchTimetable"
          :disabled="!isFormValid || loading"
          class="px-6 py-2 bg-[#235AA6] text-white text-sm font-bold rounded-lg shadow hover:bg-[#1e4c8c] disabled:opacity-50 flex items-center gap-2"
        >
          <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          {{ loading ? 'Loading...' : 'View Timetable' }}
        </button>
      </div>
    </div>

    <div v-if="hasSearched">
        <div v-if="weeks.length === 0" class="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
            <p class="text-gray-500">No schedule found for the selected filters.</p>
        </div>

        <div v-else class="space-y-8">
            <div class="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
               <WeekSelector v-model="selectedWeek" :weeks="weeks" />
            </div>

            <TimetableSection title="Morning" subtitle="7:00–11:00" period="morning"
              :days="days" :times="timesMorning" :getSlot="getSlot" :readOnly="true" />

            <TimetableSection title="Afternoon" subtitle="13:00–17:00" period="afternoon"
              :days="days" :times="timesAfternoon" :getSlot="getSlot" :readOnly="true" />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/Authentication/authStore";
import TimeTableAPI from "@/stores/apis/TimeTableAPI";
import { getHODProfile } from "@/stores/HeadOfDepartment/HODProfile";

import WeekSelector from "@/components/teachers/timetable/WeekSelector.vue";
import TimetableSection from "@/components/teachers/timetable/TimetableSection.vue";

const { t } = useI18n();
const authStore = useAuthStore();

const loading = ref(false);
const hasSearched = ref(false);

const filters = reactive({
    department_id: null,
    sub_department_id: null,
    program_id: null,
    academic_year: null, // Stores string e.g. "2025-2026"
    semester_id: null,
    group_id: null
});

// Dropdown Data
const subDepartments = ref([]);
const programs = ref([]);
const academicYears = ref([]); 
const allSemesters = ref([]); 
const filteredSemesters = ref([]);
const groups = ref([]); 
const allGroupsInProgram = ref([]); // Cache for client-side filtering

const schedule = ref({});
const selectedWeek = ref("");

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timesMorning = ["7:00-8:00", "8:00-9:00", "9:00-10:00", "10:00-11:00"];
const timesAfternoon = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"];

onMounted(async () => {
    // 1. Get Department ID
    let deptId = authStore.user?.head_department?.id || 
                 authStore.user?.head_department?.department_id || 
                 authStore.user?.department_id;

    if (!deptId) {
        try {
            const profile = await getHODProfile();
            const userObj = profile.user || profile;
            deptId = userObj.head_department?.id || userObj.user_detail?.department_id;
            
            if (deptId && authStore.user) authStore.user.department_id = deptId;
        } catch (e) { console.error(e); }
    }

    if (deptId) {
        filters.department_id = deptId;
        await loadInitialData(deptId);
    }
});

async function loadInitialData(deptId) {
    try {
        const [progRes, subRes] = await Promise.all([
            TimeTableAPI.fetchHODPrograms(deptId),
            TimeTableAPI.fetchHODSubDepartments(deptId)
        ]);
        programs.value = progRes;
        subDepartments.value = subRes;

        // ✅ Extract Academic Years from Programs
        const years = Array.from(
            new Set(progRes.map(p => p.academic_year).filter(y => y && y !== "—"))
        ).sort();

        academicYears.value = years.map(year => ({ id: year, year_label: year }));
    } catch (e) { console.error("Init Data Error", e); }
}

async function onProgramChange() {
    filters.academic_year = null;
    filters.semester_id = null;
    filters.group_id = null;
    allSemesters.value = [];
    filteredSemesters.value = [];
    groups.value = [];
    allGroupsInProgram.value = [];

    if (!filters.program_id) return;

    loading.value = true;
    try {
        // 1. Fetch Semesters (HOD Method)
        const semRes = await TimeTableAPI.fetchHODSemesters(filters.program_id);
        allSemesters.value = semRes;

        // 2. Fetch ALL Groups for Program (HOD Method - Safe)
        // This avoids 403 errors on specific group/semester endpoints
        const groupsRes = await TimeTableAPI.fetchHODGroups(filters.program_id);
        allGroupsInProgram.value = groupsRes;

    } catch (e) {
        console.error("Error fetching program data:", e);
    } finally { 
        loading.value = false; 
    }
}

function onAcademicYearChange() {
    filters.semester_id = null;
    filters.group_id = null;
    groups.value = [];

    if (!filters.academic_year || !filters.program_id) {
        filteredSemesters.value = [];
        return;
    }

    const selectedProgram = programs.value.find(p => p.id === filters.program_id);
    if (!selectedProgram) return;

    // Filter logic: Show semesters if the program's year matches selected year
    if (selectedProgram.academic_year === filters.academic_year) {
        filteredSemesters.value = allSemesters.value;
        filteredSemesters.value.sort((a, b) => (a.semester_number || 0) - (b.semester_number || 0));
    } else {
        filteredSemesters.value = [];
    }
}

function onSemesterChange() {
    filters.group_id = null;
    groups.value = [];

    if (!filters.semester_id) return;

    // ✅ Client-Side Filtering of Groups
    // Match groups where semester_id equals the selected semester
    const semId = filters.semester_id;
    groups.value = allGroupsInProgram.value.filter(g => g.semester_id == semId);
}

const isFormValid = computed(() => 
    filters.program_id && filters.academic_year && filters.semester_id && filters.group_id
);

async function fetchTimetable() {
    loading.value = true;
    hasSearched.value = true;
    schedule.value = {};
    
    try {
        const slots = await TimeTableAPI.fetchHODTimeSlots({
            department_id: filters.department_id,
            sub_department_id: filters.sub_department_id,
            program_id: filters.program_id,
            semester_id: filters.semester_id,
            group_id: filters.group_id
        });
        processSchedule(slots);
    } catch (e) { console.error("Timetable Fetch Error", e); }
    finally { loading.value = false; }
}

const formatTime = (t) => t ? `${parseInt(t.split(':')[0])}:${t.split(':')[1]}` : "";

function processSchedule(slots) {
    const result = {};
    slots.forEach(slot => {
        let timeData = slot.time_slot;
        if (typeof timeData === 'string') { try { timeData = JSON.parse(timeData) } catch(e){} }
        if (!timeData) return;

        const date = slot.time_slot_date || slot.date || timeData.date;
        let week = "Weekly Schedule", day = slot.day_of_week;
        if (date) {
             const d = new Date(date);
             const diff = d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1);
             week = `Week of ${new Date(d.setDate(diff)).toLocaleDateString('en-GB')}`;
             day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        }
        if (!day) return;

        const start = formatTime(timeData.start_time || slot.start_time);
        const end = formatTime(timeData.end_time || slot.end_time);
        if(!start || !end) return;
        const key = `${start}-${end}`;

        if (!result[week]) result[week] = {};
        if (!result[week][day]) result[week][day] = {};

        result[week][day][key] = {
            subject: slot.subject?.subject_name || slot.subject?.name || "N/A",
            room: slot.location?.name || "N/A",
            teacher: slot.teacher?.name || "N/A",
            group: slot.group?.name || ""
        };
    });
    schedule.value = result;
    const keys = Object.keys(result);
    if(keys.length > 0) selectedWeek.value = keys.includes("Weekly Schedule") ? "Weekly Schedule" : keys[0];
}

const weeks = computed(() => Object.keys(schedule.value));
const weekData = computed(() => schedule.value[selectedWeek.value] || {});

function getSlot(day, timeLabel) {
    const dayData = weekData.value[day];
    if (!dayData) return undefined;
    if (dayData[timeLabel]) return dayData[timeLabel];
    return Object.keys(dayData).find(k => timeLabel.startsWith(k.split('-')[0])) ? dayData[Object.keys(dayData).find(k => timeLabel.startsWith(k.split('-')[0]))] : undefined;
}
</script>