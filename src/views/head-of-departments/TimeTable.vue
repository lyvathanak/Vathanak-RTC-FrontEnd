<template>
  <div class="w-full min-h-screen bg-gray-50">
    <!-- Full-width container (no max width) -->
    <div class="w-full px-3 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6">
      <!-- Filter Card -->
      <section
        class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="px-5 sm:px-6 py-5 border-b border-gray-100">
          <div
            class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {{ t("timetable_management") }}
              </h1>
              <p class="text-sm text-gray-500 mt-1">
                Filter to view department schedules
              </p>
            </div>

            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 px-3 py-1 text-xs font-semibold">
                Read-only
              </span>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="px-5 sm:px-6 py-5 space-y-5">
          <!-- Row 1 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <!-- Sub-Department -->
            <BaseSelect
              v-model="filters.sub_department_id"
              label="Sub-Department"
              :options="subDepartmentOptions"
              allLabel="All Sub-Departments" />

            <!-- Program -->
            <BaseSelect
              v-model="filters.program_id"
              label="Program"
              required
              allLabel="All Programs"
              :options="programOptions"
              :disabled="loading"
              @change="onProgramChange" />

            <!-- Semester -->
            <BaseSelect
              v-model="filters.semester_id"
              label="Semester"
              required
              allLabel="All Semesters"
              :options="semesterOptions"
              :disabled="!filters.program_id"
              @change="onSemesterChange" />

            <!-- Group -->
            <BaseSelect
              v-model="filters.group_id"
              label="Group"
              required
              allLabel="All Groups"
              :options="groupOptions"
              :disabled="!filters.semester_id" />

            <!-- Week -->
            <BaseSelect
              v-model="selectedWeek"
              label="Week"
              required
              allLabel="All Weeks"
              :options="weekOptions"
              :disabled="!filters.semester_id || weeksList.length === 0" />
          </div>

          <!-- Row 2 -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
            <!-- Academic Year -->
            <BaseSelect
              v-model="filters.academic_year"
              label="Academic Year"
              placeholder="Select Academic Year"
              allLabel="All Years"
              :options="academicYearOptions"
              :disabled="!filters.program_id"
              @change="onAcademicYearChange" />

            <!-- Actions -->
            <div class="lg:col-span-3 flex items-end justify-end gap-3">
              <button
                type="button"
                @click="fetchTimetable"
                :disabled="!isFormValid || loading"
                class="ui-button">
                <span
                  v-if="loading"
                  class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                {{ loading ? "Loading..." : "View Timetable" }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Results -->
      <section v-if="hasSearched" class="space-y-4">
        <!-- Results Header -->
        <div
          class="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-gray-900">
              Timetable
            </h3>
            <p class="text-sm text-gray-500">
              {{ selectedWeekLabel }}
            </p>
          </div>

          <div class="text-xs text-gray-500">
            <span class="font-semibold text-gray-700">Program:</span>
            {{
              programs.find((p) => p.id === filters.program_id)?.name ||
              programs.find((p) => p.id === filters.program_id)?.program_name ||
              "—"
            }}
            <span class="mx-2">•</span>
            <span class="font-semibold text-gray-700">Group:</span>
            {{
              groups.find((g) => g.id === filters.group_id)?.name ||
              groups.find((g) => g.id === filters.group_id)?.group_code ||
              "—"
            }}
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="!currentWeekData || Object.keys(currentWeekData).length === 0"
          class="bg-white rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center">
          <div class="mx-auto max-w-md space-y-2">
            <p class="text-gray-800 font-semibold">No schedule found</p>
            <p class="text-sm text-gray-500">
              Try another week or check if time slots exist for the selected
              filters.
            </p>
          </div>
        </div>

        <!-- Timetable -->
        <div v-else class="space-y-8">
          <TimetableSection
            title="Morning"
            subtitle="7:00–11:00"
            period="morning"
            :days="days"
            :times="timesMorning"
            :getSlot="getSlot"
            :readOnly="true" />

          <TimetableSection
            title="Afternoon"
            subtitle="13:00–17:00"
            period="afternoon"
            :days="days"
            :times="timesAfternoon"
            :getSlot="getSlot"
            :readOnly="true" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/Authentication/authStore";
import TimeTableAPI from "@/stores/apis/TimeTableAPI";
import { getHODProfile } from "@/stores/HeadOfDepartment/HODProfile";
import TimetableSection from "@/components/teachers/timetable/TimetableSection.vue";
import BaseSelect from "@/components/features/BaseSelect.vue";

const { t } = useI18n();
const authStore = useAuthStore();

const loading = ref(false);
const hasSearched = ref(false);

const filters = reactive({
  department_id: null,
  sub_department_id: null,
  program_id: null,
  academic_year: null,
  semester_id: null,
  group_id: null,
});

const payload = {
  department_id: filters.department_id,
  sub_department_id: filters.sub_department_id || null,
  program_id: filters.program_id,
  semester_id: filters.semester_id,
  group_id: filters.group_id,
};

// Dropdown Data
const subDepartments = ref([]);
const programs = ref([]);
const academicYears = ref([]);
const allSemesters = ref([]);
const filteredSemesters = ref([]);
const groups = ref([]);
const allGroupsInProgram = ref([]);
const weeksList = ref([]); // Stores weeks generated from semester dates

const schedule = ref({});
const selectedWeek = ref(""); // The selected value from dropdown

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const timesMorning = ["7:00-8:00", "8:00-9:00", "9:00-10:00", "10:00-11:00"];
const timesAfternoon = [
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

onMounted(async () => {
  let deptId =
    authStore.user?.head_department?.id ||
    authStore.user?.head_department?.department_id ||
    authStore.user?.department_id;

  if (!deptId) {
    try {
      const profile = await getHODProfile();
      const userObj = profile.user || profile;
      deptId =
        userObj.head_department?.id || userObj.user_detail?.department_id;

      if (deptId && authStore.user) authStore.user.department_id = deptId;
    } catch (e) {
      console.error(e);
    }
  }

  if (deptId) {
    filters.department_id = deptId;
    await loadInitialData(deptId);
  }
});

const subDepartmentOptions = computed(() =>
  subDepartments.value.map((sd) => ({
    label: sd.name || sd.sub_department_name,
    value: sd.id,
  })),
);

const programOptions = computed(() =>
  programs.value.map((p) => ({
    label: p.name || p.program_name,
    value: p.id,
  })),
);

const semesterOptions = computed(() =>
  filteredSemesters.value.map((s) => ({
    label: `Semester ${s.semester_number || s.semester}`,
    value: s.id,
  })),
);

const groupOptions = computed(() =>
  groups.value.map((g) => ({
    label: g.name || g.group_code,
    value: g.id,
  })),
);

const weekOptions = computed(() =>
  weeksList.value.map((w) => ({
    label: w.label,
    value: w.value,
  })),
);

const academicYearOptions = computed(() =>
  academicYears.value.map((y) => ({
    label: String(y),
    value: y,
  })),
);

async function loadInitialData(deptId) {
  try {
    const [progRes, subRes] = await Promise.all([
      TimeTableAPI.fetchHODPrograms(deptId),
      TimeTableAPI.fetchHODSubDepartments(deptId),
    ]);
    programs.value = progRes;
    subDepartments.value = subRes;

    // Auto-select first sub-dept if available
    if (subRes && subRes.length > 0) {
      filters.sub_department_id = subRes[0].id;
    }
  } catch (e) {
    console.error("Init Data Error", e);
  }
}

async function onProgramChange() {
  // Reset downstream filters
  filters.academic_year = null;
  filters.semester_id = null;
  filters.group_id = null;
  selectedWeek.value = "";
  weeksList.value = [];

  // Clear lists
  allSemesters.value = [];
  filteredSemesters.value = [];
  academicYears.value = [];
  groups.value = [];

  if (!filters.program_id) return;

  loading.value = true;
  try {
    const [semRes, groupsRes] = await Promise.all([
      TimeTableAPI.fetchHODSemesters(filters.program_id),
      TimeTableAPI.fetchHODGroups(filters.program_id),
    ]);

    // Prepare Semesters with a unified academic_year string
    allSemesters.value = semRes.map((s) => ({
      ...s,
      academic_year_str: s.academic_year?.year_label || s.academic_year || "",
    }));

    // Extract Unique Academic Years from the fetched semesters
    const uniqueYears = new Set(
      allSemesters.value.map((s) => s.academic_year_str).filter((y) => y),
    );
    academicYears.value = Array.from(uniqueYears).sort().reverse();

    // Initially show all semesters
    filteredSemesters.value = [...allSemesters.value].sort(
      (a, b) => (a.semester_number || 0) - (b.semester_number || 0),
    );

    // Store groups for client-side filtering
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
  selectedWeek.value = "";
  weeksList.value = [];

  if (!filters.academic_year) {
    // "All Years" -> Show everything
    filteredSemesters.value = [...allSemesters.value];
  } else {
    // Filter by selected string
    filteredSemesters.value = allSemesters.value.filter(
      (s) => s.academic_year_str === filters.academic_year,
    );
  }
  filteredSemesters.value.sort(
    (a, b) => (a.semester_number || 0) - (b.semester_number || 0),
  );
}

function onSemesterChange() {
  filters.group_id = null;
  groups.value = [];
  selectedWeek.value = "";
  weeksList.value = [];

  if (!filters.semester_id) return;

  // 1. Filter Groups
  const semId = filters.semester_id;
  groups.value = allGroupsInProgram.value.filter((g) => g.semester_id == semId);

  // 2. Generate Weeks based on Semester Start/End
  const semester = filteredSemesters.value.find((s) => s.id === semId);
  if (semester && semester.start_date && semester.end_date) {
    generateWeeks(semester.start_date, semester.end_date);
  }
}

// Generate weeks between two dates
function generateWeeks(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const weeks = [];
  let currentStart = new Date(start);

  // Align currentStart to the nearest Monday
  const day = currentStart.getDay();
  const diff = currentStart.getDate() - day + (day === 0 ? -6 : 1);
  currentStart.setDate(diff);

  let weekCount = 1;
  // Iterate week by week until we pass the end date
  while (currentStart <= end) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentStart.getDate() + 6);

    const label = `Week ${weekCount} (${formatDate(currentStart)} - ${formatDate(currentEnd)})`;
    // Value matches the "Week of DD/MM/YYYY" format used in processSchedule
    const value = `Week of ${formatDate(currentStart)}`;

    weeks.push({ label, value });

    currentStart.setDate(currentStart.getDate() + 7);
    weekCount++;
  }
  weeksList.value = weeks;

  // Auto-select the first week if available
  if (weeks.length > 0) selectedWeek.value = weeks[0].value;
}

const formatDate = (date) => {
  // Format: DD/MM/YYYY
  return date.toLocaleDateString("en-GB");
};

// Form is valid if required fields + week are selected
const isFormValid = computed(
  () =>
    filters.program_id &&
    filters.semester_id &&
    filters.group_id &&
    selectedWeek.value,
);

async function fetchTimetable() {
  loading.value = true;
  hasSearched.value = true;
  schedule.value = {}; // Clear previous data

  try {
    const payload = {
      department_id: filters.department_id,
      sub_department_id: filters.sub_department_id,
      program_id: filters.program_id,
      semester_id: filters.semester_id,
      group_id: filters.group_id,
    };

    let slots = await TimeTableAPI.fetchHODTimeSlots(payload);

    // 🔍 DEBUG: Log the raw data to confirm structure
    console.log("🔥 Raw API Data:", slots);

    // ✅ FIX: Unwrap the nested structure
    // 1. If it's an array containing a 'department' object with 'groups'
    if (Array.isArray(slots) && slots.length > 0 && slots[0].groups) {
      console.log("🔥 Unwrapping Department/Groups structure...");
      // Flatten all groups found in the response
      const allGroups = slots.flatMap((item) => item.groups || []);

      // 2. Check if 'groups' contains the slots directly OR if it's another layer of nesting
      // (Some APIs return Group Objects which contain a 'time_slots' array)
      if (
        allGroups.length > 0 &&
        (allGroups[0].time_slots || allGroups[0].slots)
      ) {
        console.log("🔥 Unwrapping Group -> TimeSlots...");
        slots = allGroups.flatMap((g) => g.time_slots || g.slots || []);
      } else {
        // Assume 'groups' is actually just the list of slots
        slots = allGroups;
      }
    }

    console.log("🔥 Final Slots passed to process:", slots);
    processSchedule(slots);
  } catch (e) {
    console.error("Timetable Fetch Error", e);
  } finally {
    loading.value = false;
  }
}

const formatTime = (t) =>
  t ? `${parseInt(t.split(":")[0])}:${t.split(":")[1]}` : "";

function processSchedule(slots) {
  const result = {};
  if (!Array.isArray(slots)) return;

  slots.forEach((slot) => {
    // ✅ FIX 1: Check for 'slot' OR 'time_slot'
    let timeData = slot.time_slot || slot.slot;

    // Parse if it's a JSON string (API returns stringified JSON)
    if (typeof timeData === "string") {
      try {
        timeData = JSON.parse(timeData);
      } catch (e) {
        console.error("JSON Parse Error", e);
      }
    }

    // Skip if no timing data found
    if (!timeData) return;

    // ✅ FIX 2: Get Date safely
    // The logs show 'time_slot_date', so we prioritize that
    const rawDate = slot.time_slot_date || slot.date || timeData.date;
    if (!rawDate) return;

    // Create Date object safely (avoid timezone shifts)
    // Append T00:00:00 so "2026-01-05" stays "Jan 5th" locally
    const dateStr = rawDate.includes("T") ? rawDate : `${rawDate}T00:00:00`;
    const d = new Date(dateStr);

    // Calculate Monday of that week to match your Filter Dropdown
    const dayOfWeek = d.getDay();
    const diffToMonday = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const mondayDate = new Date(d);
    mondayDate.setDate(diffToMonday);

    // Generate Keys
    const weekKey = `Week of ${formatDate(mondayDate)}`;
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });

    const start = formatTime(timeData.start_time || slot.start_time);
    const end = formatTime(timeData.end_time || slot.end_time);

    if (!start || !end) return;

    // Initialize Data Structure
    if (!result[weekKey]) result[weekKey] = {};
    if (!result[weekKey][dayName]) result[weekKey][dayName] = {};

    // Store Data
    const key = `${start}-${end}`;

    result[weekKey][dayName][key] = {
      subject:
        slot.subject?.subject_name ||
        slot.subject?.name ||
        slot.remark ||
        "N/A",
      room: slot.location?.name || "N/A",
      teacher: slot.teacher?.name || "N/A",
      group: slot.group?.name || "",
    };
  });

  schedule.value = result;

  // ✅ FIX 3: Auto-switch to the week that actually has data
  const availableWeeks = Object.keys(result);
  if (
    availableWeeks.length > 0 &&
    !availableWeeks.includes(selectedWeek.value)
  ) {
    selectedWeek.value = availableWeeks[0];
  }
}

// Computed property to retrieve data specifically for the selected week
const currentWeekData = computed(
  () => schedule.value[selectedWeek.value] || {},
);
const selectedWeekLabel = computed(() => {
  const w = weeksList.value.find((w) => w.value === selectedWeek.value);
  return w ? w.label : selectedWeek.value;
});

function getSlot(day, timeLabel) {
  const dayData = currentWeekData.value[day];
  if (!dayData) return undefined;
  if (dayData[timeLabel]) return dayData[timeLabel];
  // Find slot covering the time
  return Object.keys(dayData).find((k) => timeLabel.startsWith(k.split("-")[0]))
    ? dayData[
        Object.keys(dayData).find((k) => timeLabel.startsWith(k.split("-")[0]))
      ]
    : undefined;
}
</script>

<style scoped>
.ui-select {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgb(209 213 219); /* gray-300 */
  padding: 0 12px;
  font-size: 0.875rem;
  background: white;
  outline: none;
}
.ui-select:focus {
  border-color: #235aa6;
  box-shadow: 0 0 0 3px rgba(35, 90, 166, 0.15);
}
.ui-select:disabled {
  background: rgb(243 244 246); /* gray-100 */
  color: rgb(156 163 175); /* gray-400 */
}

.ui-button {
  height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  background: #235aa6;
  color: white;
  font-size: 0.875rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 6px 18px rgba(35, 90, 166, 0.18);
  transition:
    transform 0.08s ease,
    opacity 0.2s ease;
}
.ui-button:hover {
  background: #1e4c8c;
}
.ui-button:active {
  transform: translateY(1px);
}
.ui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
