<template>
  <div class="calendar-wrapper">
   <div class=" flex justify-between items-center px-3 sm:px-5 pt-4">
    <p class="text-xl font-bold text-gray-800">Time Table For</p>
      <div class="flex justify-end gap-2 pt-2">

<!-- Clone Week Banner - Show when week is empty -->
<div v-if="isCalendarReady && currentWeekIsEmpty" class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 flex flex-wrap items-center gap-3">
      <span>No events this week.</span>
      <button 
        class="px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700"
        @click="cloneFromLastWeek"
      >
        Clone from last week
      </button>
      <button 
        class="px-3 py-1.5 rounded border border-amber-600 text-amber-700 hover:bg-amber-100"
        @click="showCloneModal = true"
      >
        Clone from other week
      </button>
    </div>
     <div class="flex flex-wrap items-center gap-3">
  <!-- New Slots -->
  <button
    v-if="isCalendarReady"
    type="button"
    @click="openNewSlotModal"
    class="
      inline-flex items-center justify-center
      bg-blue-600 text-white font-semibold
      rounded-xl shadow-sm
      hover:bg-blue-700 hover:shadow-md
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      transition-all duration-200

      px-3 sm:px-4
      py-2 sm:py-2.5
      w-28 sm:w-36 md:w-44
      text-xs sm:text-sm md:text-base

      whitespace-nowrap
    "
  >
    New Slots
  </button>

  <!-- New Time Table -->
  <button
    type="button"
    @click="createNewTimeTable"
    class="
      inline-flex items-center justify-center
      bg-blue-600 text-white font-semibold
      rounded-xl shadow-sm
      hover:bg-blue-700 hover:shadow-md
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      transition-all duration-200

      px-3 sm:px-4
      py-2 sm:py-2.5
      w-28 sm:w-36 md:w-44
      text-xs sm:text-sm md:text-base

      whitespace-nowrap
    "
  >
    New Time Table
  </button>

  <!-- Delete Time Table -->
  <button
    type="button"
    @click="showDeleteTimeTableModal = true"
    class="
      inline-flex items-center justify-center
      bg-red-600 text-white font-semibold
      rounded-xl shadow-sm
      hover:bg-red-700 hover:shadow-md
      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
      transition-all duration-200

      px-3 sm:px-4
      py-2 sm:py-2.5
      w-28 sm:w-36 md:w-44
      text-xs sm:text-sm md:text-base

      whitespace-nowrap
    "
  >
    Delete Time Table
  </button>
</div>


    </div>
   </div>
  <div class = " flex justify-start items-start gap-2 pt-2 pl-3 pr-3">
        <!-- Department Select -->
    <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div class="relative">
          <label class="text-gray-600 font-medium sm:font-bold text-xs sm:text-sm mb-1 block">Department</label>
          <select
            v-model="selectedDepartmentId"
            class="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-gray-50 text-xs sm:text-sm min-w-0 w-40 sm:w-44"
          >
            <option class="text-xs sm:text-sm" disabled selected>
              Select Department
            </option>
            <option
              v-for="department in departments"
              :key="department.id"
              :value="department.id"
              class="text-xs sm:text-sm"
            >
              {{ department.department_name }}
            </option>
          </select>
        </div>
      </div>
    </div>
  <!-- Sub-Department  -->
    <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div class="relative">
          <label class="text-gray-600 font-medium sm:font-bold text-xs sm:text-sm mb-1 block">Sub Department</label>
          <select
            v-model="selected_SubdepartmentId"
            class="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-gray-50 text-xs sm:text-sm min-w-0 w-40 sm:w-44"
          >
            <option class="text-xs sm:text-sm" disabled selected>
              Select Sub Department
            </option>
            <option
                v-for="sub_department in sub_departments"
          :key="sub_department.id"
          :value="sub_department.id"
              class="text-xs sm:text-sm"
            >
              {{ sub_department.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
   
  <!-- Program Select -->
    <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div class="relative">
          <label class="text-gray-600 font-medium sm:font-bold text-xs sm:text-sm mb-1 block">Program</label>
          <select
            v-model="selectedProgramId"
            class="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1.5 sm:py-2 cursor-pointer hover:bg-gray-50 text-xs sm:text-sm min-w-0 w-40 sm:w-44"
          >
            <option :value="null" disabled class="text-xs sm:text-sm">
              Select Program
            </option>
            <option
                 v-for="program in programs"
          :key="program.id"
          :value="program.id"
              class="text-xs sm:text-sm"
            >
              {{ program.program_name }} ({{ program.degree_level }})
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>

    <!-- Academic Year, Semester, and Group Section -->
    <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 px-3 sm:px-5 mt-4">
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <!-- Academic Year -->
        <div class="relative">
          <label class="text-gray-600 font-medium sm:font-bold text-xs sm:text-sm mb-1 block">Academic Year</label>
          <select
            v-model="selectedAcademicYearId"
            name="AcademicYears"
            id="AcademicYears"
            @change="filterSemestersByAcademicYear"
            class="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-gray-50 text-xs sm:text-sm min-w-0 w-40 sm:w-44"
          >
            <option value="all" class="text-xs sm:text-sm">
              All
            </option>
            <option
              v-for="years in availableAcademicYears"
              :key="years.id"
              :value="years.id"
              class="text-xs sm:text-sm"
            >
              {{ years.year_label }}
            </option>
          </select>
        </div>

        <!-- Semester -->
        <div class="relative">
          <label class="text-gray-600 font-medium sm:font-bold text-xs sm:text-sm mb-1 block">Semester</label>
          <select
            v-model="selectedSemesterId"
            name="Semester"
            id="semester"
            class="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-gray-50 text-xs sm:text-sm min-w-0 w-40 sm:w-44"
            :disabled="semesters.length === 0"
          >
            <option :value="null" disabled class="text-xs sm:text-sm">
              {{ semesters.length === 0 ? 'No semesters available' : 'Select Semester' }}
            </option>
            <option
              v-for="semester in semesters"
              :key="semester.id"
              :value="semester.id"
              class="text-xs sm:text-sm"
            >
              {{ semester.semester_key }} ({{ semester.start_date }} - {{ semester.end_date }})
            </option>
          </select>
        </div>

        <!-- Number of Weeks -->
        <div class="relative">
          <label class="text-gray-600 font-medium sm:font-bold text-xs sm:text-sm mb-1 block">Weeks</label>
          <div class="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm min-w-0 w-40 sm:w-44">
            {{ numberOfWeeks }}
          </div>
        </div>

        <!-- Group -->
        <div class="relative">
          <label class="text-gray-600 font-medium sm:font-bold text-xs sm:text-sm mb-1 block">Group</label>
          <select
            name="Group"
            id="Group"
            v-model="selectedGroupId"
            class="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-gray-50 text-xs sm:text-sm min-w-0 w-40 sm:w-44"
          >
            <option v-for="group in groups" :key="group.id" :value="group.id" class="text-xs sm:text-sm">
              {{ group.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="custom-toolbar">
      <button @click="goToToday" class="today-btn">Today</button>
      <button 
        v-if="isCalendarReady && minDate" 
        @click="scrollToSemesterStart" 
        class="semester-start-btn"
      >
        Go to Semester Start
      </button>
      <div class="toolbar-title">{{ currentTitle }}</div>

      <select v-model="activeView" class="view-dropdown">
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
        <option value="years">years</option>
      </select>
    </div>

    <!-- Validation Messages -->
    <div v-if="!isCalendarReady" class="flex flex-col items-center justify-center p-8 bg-blue-50 border border-blue-200 rounded-lg mx-3 sm:mx-5 my-4">
      <svg class="w-16 h-16 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">Please Complete Selection</h3>
      <div class="text-sm text-gray-600 space-y-1 text-center">
        <p v-if="!selectedDepartmentId">• Select a Department</p>
        <p v-if="!selectedProgramId">• Select a Program</p>
        <p v-if="!selectedAcademicYearId">• Select an Academic Year</p>
        <p v-if="!selectedSemesterId">• Select a Semester</p>
        <p v-if="!selectedGroupId">• Select a Group</p>
      </div>
    </div>

    <!-- Semester Info Banner -->
    <div v-if="isCalendarReady" class="mx-3 sm:mx-5 mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm font-medium text-gray-700">
          Semester Period: <span class="font-semibold text-blue-700">{{ semesterDateRange }}</span>
          <span class="mx-2 text-gray-400">|</span>
          <span class="text-gray-600">{{ numberOfWeeks }} weeks</span>
        </span>
      </div>
    </div>

    <!-- Vue Cal Calendar -->
    <vue-cal
      v-if="isCalendarReady"
      ref="vuecal"
      :time-from="7 * 60"
      :time-to="18 * 60"
      :time-step="20"
      :events="events"
      :active-view="activeView"
      :selected-date="minDate"
      :editable-events="{ title: false, drag: true, resize: true, delete: false, create: false }"
      :cell-contextual="getCellContext"
      hide-view-selector
      @ready="onCalendarReady"
      @view-change="onViewChange"
      @event-drop="onEventDrop"
      @event-dblclick="onEventDoubleClick"
      @cell-click="onCellClick"
    />
    
    <!-- Edit Event Modal -->
    <EditSaveSlots
      v-if="showEditModal"
      :eventData="selectedEvent"
      :subjects="availableSubjects"
      :teachers="availableTeachers"
      :locations="availableLocations"
      :externalErrorMessage="editModalErrorMessage"
      @close="closeEditModal"
      @update="updateEvent"
      @delete="deleteEvent"
    />

    <!-- Clone Week Modal -->
    <CloneWeekModal
      v-if="showCloneModal"
      :timeTableId="timeTableId"
      :semesterStart="selectedSemester?.start_date || ''"
      :semesterEnd="selectedSemester?.end_date || ''"
      :currentWeekStart="currentWeekStartFormatted"
      :currentWeekEnd="currentWeekEndFormatted"
      @close="showCloneModal = false"
      @cloned="onWeekCloned"
    />

    <!-- New Slot Modal -->
    <NewSlotModal
      v-if="showNewSlotModal"
      :key="selectedGroupId"
      :timeTableId="timeTableId"
      :groupName="(groups.find(g => g.id === selectedGroupId) || {}).name || 'Unknown Group'"
      :semesterStart="selectedSemester?.start_date || ''"
      :semesterEnd="selectedSemester?.end_date || ''"
      :selectedDate="newSlotSelectedDate"
      :subjects="availableSubjects"
      :teachers="availableTeachers"
      :locations="availableLocations"
      @close="closeNewSlotModal"
      @created="onSlotCreated"
    />

    <!-- Create Time Table Modal -->
    <CreateTimeTableModal
      v-if="showCreateTimeTableModal"
      :groups="allGroups"
      :preSelectedGroupId="selectedGroupId"
      @close="showCreateTimeTableModal = false"
      @created="onTimeTableCreated"
    />

    <!-- Delete Time Table Modal -->
    <DeleteTimeTableModal
      v-if="showDeleteTimeTableModal"
      @close="showDeleteTimeTableModal = false"
      @deleted="onTimeTableDeleted"
    />

    <!-- No Timetable Modal -->
    <NoTimetableModal
      v-if="showNoTimetableModal"
      :groupId="selectedGroupId"
      :groupName="(groups.find(g => g.id === selectedGroupId) || {}).name || 'Unknown Group'"
      @close="showNoTimetableModal = false"
      @created="onNoTimetableCreated"
    />

    <!-- Clone Result Modal -->
    <div v-if="showCloneResultModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div class="flex items-center mb-4">
          <div :class="cloneResultType === 'success' ? 'text-green-500' : 'text-red-500'">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path v-if="cloneResultType === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h3 class="ml-2 text-lg font-medium text-gray-900">{{ cloneResultType === 'success' ? 'Success' : 'Error' }}</h3>
        </div>
        <p class="text-sm text-gray-500 mb-4">{{ cloneResultMessage }}</p>
        <div class="flex justify-end">
          <button @click="showCloneResultModal = false" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import "vue-cal/dist/vuecal.css";
import VueCal from "vue-cal";
import "@/assets/time_table.css";
import TimeTableAPI from "@/stores/apis/TimeTableAPI";
import EditSaveSlots from "@/components/admins/slote_time_table/EditSaveSlots.vue";
import CloneWeekModal from "@/components/admins/slote_time_table/CloneWeekModal.vue";
import NewSlotModal from "@/components/admins/slote_time_table/NewSlotModal.vue";
import CreateTimeTableModal from "@/components/admins/slote_time_table/CreateTimeTableModal.vue";
import DeleteTimeTableModal from "@/components/admins/slote_time_table/DeleteTimeTableModal.vue";
import NoTimetableModal from "@/components/admins/slote_time_table/NoTimetableModal.vue";
</script>

<script>
export default {
  components: {
    VueCal,
    EditSaveSlots,
    CloneWeekModal,
    NewSlotModal,
    CreateTimeTableModal,
    DeleteTimeTableModal,
  },

  data() {
    return {
      activeView: "week",
      currentTitle: "",
      events: [],
      time_slots: [],

      time_table: null,
      current_page: 1,
      academicYears: [],
      selectedAcademicYearId: 'all', // Default to 'all' to show all semesters
      programs: [],
      selectedProgramId: null,
      semesters: [],
      selectedSemesterId: null,
      departments: [],
      selectedDepartmentId: null,
      selected_SubdepartmentId: null,
      sub_departments: [],
      selectedGroupId: null,
      groups: [],
      allAcademicYearsLookup: [], // All academic years from API for lookup
      showEditModal: false,
      selectedEvent: null,
      minDate: null,
      maxDate: null,
      allSemestersData: [],
      
      // Clone feature
      showCloneModal: false,
      
      // New slot feature
      showNewSlotModal: false,
      newSlotSelectedDate: null,
      
      // Create timetable feature
      showCreateTimeTableModal: false,
      showDeleteTimeTableModal: false,
      showNoTimetableModal: false,
      allGroups: [],
      
      // Available options for new slot
      availableSubjects: [],
      availableTeachers: [],
      availableLocations: [],
      
      // Error message for edit modal
      editModalErrorMessage: '',
      
      // Clone result modal
      showCloneResultModal: false,
      cloneResultMessage: '',
      cloneResultType: 'success',
      
      // Time table ID for the current group
      timeTableId: null,
      currentTimeTable: null,
      
      // Current view week tracking
      currentViewStart: null,
      currentViewEnd: null,
    };
  },

  computed: {
    selectedProgram() {
      return this.programs.find((p) => p.id === this.selectedProgramId) || null;
    },
    selectedGroup() {
      return this.groups.find((g) => g.id === this.selectedGroupId) || null;
    },
    numberOfWeeks() {
      if (this.minDate && this.maxDate) {
        const diffTime = Math.abs(this.maxDate - this.minDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil(diffDays / 7);
      }
      return 0;
    },
    // Check if current week has no events
    currentWeekIsEmpty() {
      if (!this.currentViewStart || !this.currentViewEnd || !this.events.length === 0) {
        return this.events.length === 0;
      }
      
      // Check if any event falls within current view week
      const weekStart = new Date(this.currentViewStart);
      const weekEnd = new Date(this.currentViewEnd);
      
      return !this.events.some(event => {
        const eventDate = new Date(event.start);
        return eventDate >= weekStart && eventDate <= weekEnd;
      });
    },
    // Format current week dates for clone modal
    currentWeekStartFormatted() {
      if (!this.currentViewStart) return '';
      const date = new Date(this.currentViewStart);
      return date.toISOString().split('T')[0];
    },
    currentWeekEndFormatted() {
      if (!this.currentViewEnd) return '';
      const date = new Date(this.currentViewEnd);
      return date.toISOString().split('T')[0];
    },
    // Show all academic years from all programs in the selected department
    // This matches ProgramManagement.vue behavior
    availableAcademicYears() {
      // Always show all academic years from the department
      return this.academicYears;
    },
    // Check if calendar is ready to display
    isCalendarReady() {
      return (
        this.selectedDepartmentId !== null &&
        this.selectedProgramId !== null &&
        this.selectedAcademicYearId !== null && // Can be 'all' or a specific year ID
        this.selectedSemesterId !== null &&
        this.selectedGroupId !== null &&
        this.minDate !== null &&
        this.maxDate !== null
      );
    },
    // Get selected semester details
    selectedSemester() {
      return this.semesters.find(s => s.id === this.selectedSemesterId) || null;
    },
    // Format semester date range for display
    semesterDateRange() {
      if (this.selectedSemester) {
        return `${this.selectedSemester.start_date} to ${this.selectedSemester.end_date}`;
      }
      return '';
    },
  },

  async mounted() {
    this.updateTitle();

    // Fetch departments first
    await this.fetchDepartments();
    
    // Fetch programs for the selected department
    if (this.selectedDepartmentId) {
      await this.fetchPrograms_by_DepartmentId(this.selectedDepartmentId);
    }

    // Fetch subdepartments for the selected department (optional, for display)
    if (this.selectedDepartmentId) {
      await this.fetchSubDepartmentByDepartmentId(this.selectedDepartmentId);
    }
    
    // Fetch available options for new slot modal
    await this.fetchAvailableOptions();
    
    // Note: Don't call fetchSemestersAndAcademicYears here
    // The program watcher will handle organizing semesters when program is selected
  },

  methods: {
    parseDate(dateStr) {
      const [day, month, year] = dateStr.split('-');
      return new Date(year, month - 1, day);
    },
    previousPeriod() {
      this.$refs.vuecal.previous();
    },
    nextPeriod() {
      this.$refs.vuecal.next();
    },
    goToToday() {
      const today = new Date();
      // Only navigate to today if it's within semester range
      if (this.minDate && this.maxDate) {
        if (today >= this.minDate && today <= this.maxDate) {
          this.$refs.vuecal.switchView("day", today);
        } else {
          // Navigate to start of semester instead
          this.$refs.vuecal.switchView("day", this.minDate);
        }
      } else {
        this.$refs.vuecal.switchView("day", today);
      }
    },
    
    onCellClick(date) {
      // Check if clicked date is outside semester range
      if (this.minDate && this.maxDate) {
        const clickedDate = new Date(date);
        clickedDate.setHours(0, 0, 0, 0);
        
        const minDateNormalized = new Date(this.minDate);
        minDateNormalized.setHours(0, 0, 0, 0);
        
        const maxDateNormalized = new Date(this.maxDate);
        maxDateNormalized.setHours(0, 0, 0, 0);
        
        if (clickedDate < minDateNormalized || clickedDate > maxDateNormalized) {
          // Cell is outside semester - don't allow creating events
          console.log('This date is outside the semester period');
          return false;
        }
      }
      
      // Open new slot modal when clicking on a cell within semester
      if (this.timeTableId && date) {
        this.openNewSlotModal(date);
      }
    },

    onViewChange(event) {
      // Update active view and title - allow navigation to any date
      // Out-of-semester dates will be visually styled differently
      this.activeView = event.view;
      this.updateTitle();
      
      // Track current view dates for clone feature
      if (event.startDate) {
        this.currentViewStart = event.startDate;
      }
      if (event.endDate) {
        this.currentViewEnd = event.endDate;
      }
    },

    updateTitle() {
      this.$nextTick(() => {
        if (this.$refs.vuecal) {
          const view = this.$refs.vuecal.view;
          this.currentTitle = view.title || "";
          
          // Also update current view dates
          if (view.startDate) {
            this.currentViewStart = view.startDate;
          }
          if (view.endDate) {
            this.currentViewEnd = view.endDate;
          }
        }
      });
    },

    // async fetchTimeTable(current_page) {
    //   try {
    //     const response = await TimeTableAPI.fetchTimeTable(current_page);
    //     this.time_table = response.time_tables.data;
    //   } catch (error) {
    //     console.error("Error fetching timetable data:", error);
    //   }
    // },
    getProgramId() {
      return this.selectedProgramId;
    },
    getDepartmentId() {
      return this.selectedDepartmentId;
    },
    async fetchPrograms_by_DepartmentId(departmentId) {
      try {
        const res = await TimeTableAPI.fetchProgramsByDepartment(departmentId);
        if (res && res.length > 0) {
          this.programs = res;
          
          // Extract unique academic years from programs (same as ProgramManagement.vue)
          const academicYears = Array.from(
            new Set(res.map(p => p.academic_year).filter(y => y && y !== "—"))
          ).sort();
          
          // Convert to objects with id and year_label
          this.academicYears = academicYears.map(year => ({
            id: year,
            year_label: year
          }));
          
          console.log("Extracted academic years from programs:", this.academicYears);
          
          // Auto-select first program
          this.selectedProgramId = this.programs[0].id;
          console.log("Programs fetched:", this.programs);
          console.log("Auto-selected program ID:", this.selectedProgramId);
        } else {
          this.programs = [];
          this.academicYears = [];
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        this.programs = [];
        this.academicYears = [];
      }
    },
    
    organizeSemestersFromProgram(program) {
      console.log("=== organizeSemestersFromProgram called ===");
      console.log("Program:", program);
      
      if (!program || !program.semesters) {
        this.allSemestersData = [];
        this.semesters = [];
        this.selectedSemesterId = null;
        return;
      }
      
      // Group semesters by academic year
      const semestersByYear = {};
      program.semesters.forEach(semester => {
        if (semester.academic_year && semester.academic_year.year_label) {
          const yearLabel = semester.academic_year.year_label;
          if (!semestersByYear[yearLabel]) {
            semestersByYear[yearLabel] = {
              year_label: yearLabel,
              semesters: []
            };
          }
          semestersByYear[yearLabel].semesters.push(semester);
        } else {
          // Handle semesters without academic year
          console.warn("Semester without academic year:", semester);
        }
      });
      
      // Convert to array format
      this.allSemestersData = Object.values(semestersByYear);
     
      // Set to 'all' by default to show all semesters
      this.selectedAcademicYearId = 'all';
      // Filter semesters immediately to show all
      this.filterSemestersByAcademicYear();
    },

    async fetchSemestersAndAcademicYears(programId) {
      try {
        console.log("=== fetchSemestersAndAcademicYears called for programId:", programId, "===");
        
        // Fetch semesters for this program
        const semesters = await TimeTableAPI.fetchSemestersByProgram(programId);
        
        console.log("Fetched semesters:", semesters);
        
        if (!semesters || semesters.length === 0) {
          console.log("No semesters found for this program");
          this.semesters = [];
          this.allSemestersData = [];
          this.selectedAcademicYearId = 'all';
          this.selectedSemesterId = null;
          return;
        }
        
        // Get the selected program's academic year
        const program = this.programs.find(p => p.id === programId);
        const programAcademicYear = program?.academic_year;
        
        console.log("Selected program academic year:", programAcademicYear);
        
        // Group semesters by the program's academic year
        const semestersByYear = {};
        
        semesters.forEach((semester) => {
          // Use program's academic_year as the year label for all its semesters
          const yearLabel = programAcademicYear || 'Unassigned';
          
          if (!semestersByYear[yearLabel]) {
            semestersByYear[yearLabel] = {
              year_label: yearLabel,
              semesters: []
            };
          }
          semestersByYear[yearLabel].semesters.push(semester);
        });
        
        // Store grouped semesters data
        this.allSemestersData = Object.values(semestersByYear);
        
        console.log("Grouped semesters by program's academic year:", this.allSemestersData);
        console.log("Academic years available (from all programs):", this.academicYears);
        
        // Default to 'all' to show all semesters
        this.selectedAcademicYearId = 'all';
        
        // Filter semesters to show all by default
        this.filterSemestersByAcademicYear();
        
      } catch (error) {
        console.error("Error fetching semesters:", error);
        this.semesters = [];
        this.allSemestersData = [];
        this.selectedAcademicYearId = 'all';
        this.selectedSemesterId = null;
      }
    },
    
    filterSemestersByAcademicYear() {
      console.log("=== filterSemestersByAcademicYear called ===");
      console.log("selectedAcademicYearId:", this.selectedAcademicYearId);
      console.log("allSemestersData:", this.allSemestersData);
      
      if (!this.allSemestersData.length) {
        console.warn("No semesters data available");
        this.semesters = [];
        this.selectedSemesterId = null;
        return;
      }
      
      // Store previous semester selection
      const previousSemesterId = this.selectedSemesterId;
      
      // If 'all' is selected, show all semesters
      if (this.selectedAcademicYearId === 'all') {
        this.semesters = this.allSemestersData.flatMap(y => y.semesters || []);
        // Sort by semester start date or semester number
        this.semesters.sort((a, b) => {
          if (a.start_date && b.start_date) {
            return new Date(a.start_date) - new Date(b.start_date);
          }
          return (a.semester_number || 0) - (b.semester_number || 0);
        });
        
        // Try to keep previous selection if it's still valid
        if (previousSemesterId && this.semesters.some(s => s.id === previousSemesterId)) {
          this.selectedSemesterId = previousSemesterId;
          // Force fetch groups since semester didn't change
          this.$nextTick(() => {
            this.fetchGroupsBySemesterId(previousSemesterId);
          });
        } else if (this.semesters.length > 0) {
          this.selectedSemesterId = this.semesters[0].id;
        }
        console.log("Showing all semesters:", this.semesters.length);
        return;
      }
      
      // Filter semesters by academic year (match by year_label string)
      // selectedAcademicYearId is actually the year string (e.g., "2024-2025")
      const yearData = this.allSemestersData.find(yearGroup => {
        return yearGroup.year_label === this.selectedAcademicYearId;
      });
      
      if (yearData && yearData.semesters) {
        this.semesters = [...yearData.semesters];
        // Sort by semester_number
        this.semesters.sort((a, b) => (a.semester_number || 0) - (b.semester_number || 0));
        
        // Try to keep previous selection if it's still valid
        if (previousSemesterId && this.semesters.some(s => s.id === previousSemesterId)) {
          this.selectedSemesterId = previousSemesterId;
          // Force fetch groups since semester didn't change but year filter did
          this.$nextTick(() => {
            this.fetchGroupsBySemesterId(previousSemesterId);
          });
        } else if (this.semesters.length > 0) {
          // Auto-select first semester and trigger its watcher
          this.$nextTick(() => {
            this.selectedSemesterId = this.semesters[0].id;
          });
        }
        console.log("Filtered semesters for year:", this.semesters.length);
      } else {
        this.semesters = [];
        this.selectedSemesterId = null;
        console.warn("No semesters found for selected academic year");
      }
    },
    async fetchGroupsBySemesterId(semesterId) {
      try {
        console.log("=== fetchGroupsBySemesterId called with semesterId:", semesterId, "===");
        
        // Try fetching groups by program first (new API)
        if (this.selectedProgramId) {
          const groupsByProgram = await TimeTableAPI.fetchGroupsByProgramId(this.selectedProgramId);
          console.log("Groups by program:", groupsByProgram);
          
          if (groupsByProgram && groupsByProgram.length > 0) {
            // Filter groups by semester_id
            const filteredGroups = groupsByProgram.filter(g => g.semester_id === semesterId);
            console.log("Filtered groups by semester_id:", filteredGroups);
            
            if (filteredGroups.length > 0) {
              this.groups = filteredGroups;
              this.selectedGroupId = this.groups[0].id;
              console.log("Auto-selected group ID:", this.selectedGroupId);
              return;
            }
          }
        }
        
        // Fallback to the old API if no groups found
        const res = await TimeTableAPI.fetchGroupsBySemesterId(semesterId);
        console.log("Groups by semester (fallback):", res);
        
        if (res && res.length > 0) {
          this.groups = res;
          this.selectedGroupId = this.groups[0].id;
          console.log("Auto-selected group ID (fallback):", this.selectedGroupId);
        } else {
          this.groups = [];
          this.selectedGroupId = null;
          console.warn("No groups found for semester");
        }
      } catch (e) {
        console.error("Error fetching groups:", e);
        this.groups = [];
        this.selectedGroupId = null;
      }
    },
    async fetchSubDepartmentByDepartmentId(departmentId) {
      try {
        const res = await TimeTableAPI.fetchAllSubDepartmentByDepartmentId(
          departmentId
        );
        if (res && res.length > 0) {
          this.sub_departments = res;
          this.selected_SubdepartmentId = this.sub_departments[0].id;
        } else {
          console.warn("No subdepartments found");
          this.sub_departments = [];
        }
      } catch (e) {
        console.error("Error fetching subdepartments:", e);
        this.sub_departments = [];
      }
    },

    async fetchPrograms_by_SubdepartmentId(subDeptId) {
      try {
        const res = await TimeTableAPI.fetchProgramsBySubDepartment(subDeptId);
        if (res && res.length > 0) {
          this.programs = res;
          this.selectedProgramId = this.programs[0].id;
        } else {
          console.warn("No programs found for subdepartment");
          this.programs = [];
          this.academicYears = [];
        }
      } catch (error) {
        console.error("Error fetching programs by subdepartment:", error);
        this.programs = [];
        this.academicYears = [];
      }
    },

    async fetchAcademicYears() {
      try {
        const res = await TimeTableAPI.fetchAcademicYears();
        if (res && res.length > 0) {
          this.academicYears = res;

          this.selectedAcademicYearId = this.academicYears[0].id;

        } else {
          this.academicYears = [];
        }
      } catch (error) {
        console.error("Error fetching academic years:", error);
        this.academicYears = [];
      }
    },
    async fetchSemesters(programId, year_label) {
      // filter by year_label
      try {
      
        const res = await TimeTableAPI.fetchSemestersByProgram(
          programId,
          year_label
        );

        if (res && res.length > 0) {
          this.semesters = res;
          this.selectedSemesterId = this.semesters[0].id;
        } else {
          console.warn("No semesters found");
          this.semesters = [];
        }
      } catch (error) {
        console.error("Error fetching semesters:", error);
        this.semesters = [];
      }
    },
    async fetchAllAcademicYears() {
      try {
        const res = await TimeTableAPI.fetchAllAcademicYears();
        if (res && res.length > 0) {
          this.academicYears = res;
          // Don't auto-select academic year on initial load
          // Let the user select or let organizeSemestersFromProgram handle it
        } else {
          this.academicYears = [];
        }
      } catch (error) {
        console.error("Error fetching all academic years:", error);
        this.academicYears = [];
      }
    },
    
    // Fetch all academic years for lookup (to get year_label by id)
    async fetchAllAcademicYearsForLookup() {
      try {
        const res = await TimeTableAPI.fetchAllAcademicYears();
        console.log("All academic years for lookup:", res);
        if (res && res.length > 0) {
          this.allAcademicYearsLookup = res;
        } else {
          this.allAcademicYearsLookup = [];
        }
      } catch (error) {
        console.error("Error fetching all academic years for lookup:", error);
        this.allAcademicYearsLookup = [];
      }
    },
    
    // Get year_label by academic_year_id from lookup
    getYearLabelById(academicYearId) {
      const year = this.allAcademicYearsLookup.find(y => y.id === academicYearId);
      return year?.year_label || `Year ${academicYearId}`;
    },
    async fetchDepartments() {
      try {
        const res = await TimeTableAPI.fetchDepartments();
        if (res && res.length > 0) {
          this.departments = res;
          this.selectedDepartmentId = res[0].id;
        } else {
          console.warn("No departments found");
          this.departments = [];
        }
      } catch (e) {
        console.error("Error fetching departments:", e);
        this.departments = [];
      }
    },
    async fetchTimeSloteBYGroupId(groupId) {
      console.log("fetchTimeSloteBYGroupId called with groupId:", groupId);
      try {
        const res = await TimeTableAPI.fetchTimeSlotsByGroupId(groupId);
        console.log("Time slots response:", res);

        if (res && res.length > 0) {
          this.time_slots = res;

          // Transform time slots to Vue Cal events format
          this.events = res.map((slot) => {
            // Parse the time_slot JSON string
            const timeSlot = typeof slot.time_slot === 'string' 
              ? JSON.parse(slot.time_slot) 
              : slot.time_slot;
            
            // Check if event date is within semester
            const eventDate = new Date(slot.time_slot_date);
            eventDate.setHours(0, 0, 0, 0);
            const minDateNormalized = new Date(this.minDate);
            minDateNormalized.setHours(0, 0, 0, 0);
            const maxDateNormalized = new Date(this.maxDate);
            maxDateNormalized.setHours(0, 0, 0, 0);
            const isWithinSemester = eventDate >= minDateNormalized && eventDate <= maxDateNormalized;
            
            // Assign a color class based on subject name
            let colorClass = "";
            const subjectName = slot.subject?.subject_name || '';
            switch (subjectName) {
              case "Introduction to Human Anatomy":
                colorClass = "event-anatomy";
                break;
              case "Mathematics":
                colorClass = "event-math";
                break;
              case "Physics":
                colorClass = "event-physics";
                break;
              default:
                colorClass = "event-default";
            }
            return {
              id: slot.id,
              start: `${slot.time_slot_date} ${timeSlot.start_time}`,
              end: `${slot.time_slot_date} ${timeSlot.end_time}`,
              title: `${slot.subject?.subject_name || 'No Subject'} - ${slot.teacher?.name || 'No Teacher'}`,
              content: `${slot.location?.name || 'No Location'} ${slot.location?.floor ? '(Floor ' + slot.location.floor + ')' : ''}`,
              class: colorClass,
              draggable: isWithinSemester,
              resizable: isWithinSemester,
              // Store original slot data for editing
              originalSlot: slot
            };
          });
          
          // Get the time_table_id and time_table object from the first slot
          console.log("First slot data:", res[0]);
          if (res[0].time_table_id) {
            this.timeTableId = res[0].time_table_id;
            console.log("TimeTable ID from time_table_id:", this.timeTableId);
          } else if (res[0].timetable_id) {
            this.timeTableId = res[0].timetable_id;
            console.log("TimeTable ID from timetable_id:", this.timeTableId);
          } else if (res[0].time_table?.id) {
            this.timeTableId = res[0].time_table.id;
            console.log("TimeTable ID from time_table.id:", this.timeTableId);
          }
          
          // Store the time table object if available
          if (res[0].time_table) {
            this.currentTimeTable = res[0].time_table;
            console.log("TimeTable object from slot:", this.currentTimeTable);
          }
          
          console.log("Final TimeTable ID:", this.timeTableId);
        } else {
          console.warn("No time slots found for group:", groupId);
          this.time_slots = [];
          this.events = [];
          // Try to fetch existing timetable
          await this.fetchTimeTableIdByGroup(groupId);
        }
      } catch (e) {
        console.error("Error fetching time slots:", e);
        this.time_slots = [];
        this.events = [];
        // Try to fetch existing timetable
        await this.fetchTimeTableIdByGroup(groupId);
      }
    },

    // Fetch existing timeTableId for a group (no auto-creation)
    async fetchTimeTableIdByGroup(groupId) {
      try {
        const res = await TimeTableAPI.getTimeTableByGroupId(groupId);
        if (res && res.id) {
          this.timeTableId = res.id;
          this.currentTimeTable = res;
          console.log('TimeTable found for group:', res);
        } else {
          console.log('No timetable exists for this group');
          this.timeTableId = null;
          this.currentTimeTable = null;
          // Show modal to create timetable
          this.showNoTimetableModal = true;
        }
      } catch (e) {
        console.log("No timetable found for group:", e);
        this.timeTableId = null;
        this.currentTimeTable = null;
        // Show modal to create timetable
        this.showNoTimetableModal = true;
      }
    },

    // Create new timetable for selected group
    async createNewTimeTable() {
      // Fetch all groups if not already loaded
      if (this.allGroups.length === 0) {
        await this.fetchAllGroups();
      }
      // Open modal
      this.showCreateTimeTableModal = true;
    },
    
    // Handle timetable created from modal
    async onTimeTableCreated(result) {
      this.showCreateTimeTableModal = false;
      
      if (result && result.id) {
        this.timeTableId = result.id;
        
        // If the created timetable is for the currently selected group, refresh
        if (result.group_id === this.selectedGroupId) {
          await this.fetchTimeSloteBYGroupId(this.selectedGroupId);
        }
      }
    },
    
    // Handle timetable deleted from modal
    async onTimeTableDeleted(result) {
      console.log('Time table deleted:', result);
      
      // If the deleted timetable was the current one, clear it
      if (this.timeTableId === result.timeTableId) {
        this.timeTableId = null;
        this.events = [];
      }
      
      // Optionally show success message
      alert(result.message || 'Time table deleted successfully!');
    },
    
    // Handle no timetable modal created
    async onNoTimetableCreated(result) {
      this.showNoTimetableModal = false;
      
      if (result && result.id) {
        this.timeTableId = result.id;
        
        // Refresh the time slots for the group
        await this.fetchTimeSloteBYGroupId(this.selectedGroupId);
      }
    },
    
    // Fetch all groups
    async fetchAllGroups() {
      try {
        const res = await TimeTableAPI.fetchAllGroups();
        this.allGroups = res || [];
      } catch (e) {
        console.error('Error fetching all groups:', e);
        this.allGroups = [];
      }
    },

    onEventDrop(event) {
      const startTime = new Date(event.event.start);
      const endTime = new Date(event.event.end);
      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

      if (startMinutes < 7 * 60 || endMinutes > 18 * 60) {
        // Out of range, show edit modal
        this.selectedEvent = event.event;
        this.showEditModal = true;
        console.log("Event dropped out of range, opening edit modal:", event);
      } else {
        // Within range, update the event via API
        console.log("Event dropped within range:", event);
        this.updateDraggedEvent(event.event);
      }
    },

    onEventDoubleClick(event) {
      console.log("Event double-clicked:", event);
      this.selectedEvent = event;
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.selectedEvent = null;
      this.editModalErrorMessage = '';
    },

    async updateEvent(updatedEvent) {
      this.editModalErrorMessage = '';
      try {
        console.log('Updating time slot:', updatedEvent);
        
        // Prepare payload in the format API expects
        const payload = {
          teacher_id: updatedEvent.teacher_id,
          subject_id: updatedEvent.subject_id,
          location_id: updatedEvent.location_id,
          remark: updatedEvent.remark,
          time_slot_date: updatedEvent.time_slot_date,
          time_slot: {
            start_time: updatedEvent.time_slot.start_time + ":00",
            end_time: updatedEvent.time_slot.end_time + ":00"
          }
        };
        
        const result = await TimeTableAPI.updateTimeSlotById(updatedEvent.id, payload);
        console.log('Update result:', result);
        
        // Refresh the events
        await this.fetchTimeSloteBYGroupId(this.selectedGroupId);
        this.closeEditModal();
      } catch (error) {
        console.error('Error updating time slot:', error);
        this.editModalErrorMessage = error.message || (error.response?.data?.message) || 'Failed to update time slot.';
      }
    },

    async deleteEvent(eventId) {
      this.editModalErrorMessage = '';
      try {
        console.log('Deleting time slot:', eventId);
        const result = await TimeTableAPI.deleteTimeSlotById(eventId);
        console.log('Delete result:', result);
        
        // Refresh the events
        await this.fetchTimeSloteBYGroupId(this.selectedGroupId);
        this.closeEditModal();
      } catch (error) {
        console.error('Error deleting time slot:', error);
        this.editModalErrorMessage = error.message || (error.response?.data?.message) || 'Failed to delete time slot.';
      }
    },    async updateDraggedEvent(draggedEvent) {
      try {
        console.log('Updating dragged time slot:', draggedEvent);
        const originalSlot = draggedEvent.originalSlot;

        // Helper to format Date to 'YYYY-MM-DD HH:mm'
        function formatDateTime(dt) {
          if (typeof dt === 'string') return dt;
          if (dt instanceof Date) {
            const pad = n => n.toString().padStart(2, '0');
            const y = dt.getFullYear();
            const m = pad(dt.getMonth() + 1);
            const d = pad(dt.getDate());
            const h = pad(dt.getHours());
            const min = pad(dt.getMinutes());
            return `${y}-${m}-${d} ${h}:${min}`;
          }
          return '';
        }

        const startStr = formatDateTime(draggedEvent.start);
        const endStr = formatDateTime(draggedEvent.end);

        const [newDate, newStartTime] = startStr.split(' ');
        const [, newEndTime] = endStr.split(' ');

        // Prepare payload in the format API expects
        const payload = {
          teacher_id: originalSlot.teacher_id,
          subject_id: originalSlot.subject_id,
          location_id: originalSlot.location_id,
          remark: originalSlot.remark,
          time_slot_date: newDate,
          time_slot: {
            start_time: newStartTime + ":00",
            end_time: newEndTime + ":00"
          }
        };

        const result = await TimeTableAPI.updateTimeSlotById(draggedEvent.id, payload);
        console.log('Drag update result:', result);

        // Refresh the events
        await this.fetchTimeSloteBYGroupId(this.selectedGroupId);
      } catch (error) {
        console.error('Error updating dragged time slot:', error);
        alert('Failed to update time slot. Please try again.');
      }
    },

    async fetchTimeSloteBYGroupIddd(){
      const res = await TimeTableAPI.fetchTimeSlotsByGroupId(this.selectedGroupId);
      console.log("Time slots by group ID:", res , "Time slote:", res.time_slot);
    },
    
    // Method to determine cell context based on whether date is within semester
    getCellContext(cell) {
      if (!this.minDate || !this.maxDate) {
        return { class: '' };
      }
      
      // Parse the cell date from vue-cal cell object
      let cellDate;
      if (cell && cell.date) {
        cellDate = new Date(cell.date);
      } else if (typeof cell === 'string') {
        cellDate = new Date(cell);
      } else if (cell instanceof Date) {
        cellDate = new Date(cell);
      } else {
        cellDate = new Date(cell);
      }
      
      cellDate.setHours(0, 0, 0, 0);
      
      const minDateNormalized = new Date(this.minDate);
      minDateNormalized.setHours(0, 0, 0, 0);
      
      const maxDateNormalized = new Date(this.maxDate);
      maxDateNormalized.setHours(0, 0, 0, 0);
      
      if (cellDate < minDateNormalized || cellDate > maxDateNormalized) {
        return { class: 'out-of-semester' };
      }
      return { class: '' };
    },
    
    // Navigate calendar to semester start date
    scrollToSemesterStart() {
      if (this.$refs.vuecal && this.minDate) {
        // Use setTimeout to ensure vue-cal is fully rendered
        setTimeout(() => {
          if (this.$refs.vuecal) {
            this.$refs.vuecal.switchView(this.activeView, this.minDate);
          }
        }, 100);
      }
    },
    
    // Called when vue-cal is ready
    onCalendarReady() {
      // Navigate to semester start when calendar is ready
      if (this.minDate) {
        this.scrollToSemesterStart();
      }
    },

    // ===============================
    // CLONE WEEK METHODS
    // ===============================
    
    // Clone from last week
    async cloneFromLastWeek() {
      if (!this.timeTableId || !this.currentViewStart) {
        this.cloneResultMessage = 'Please select a group first';
        this.cloneResultType = 'error';
        this.showCloneResultModal = true;
        return;
      }

      // Calculate last week dates
      const currentStart = new Date(this.currentViewStart);
      const lastWeekStart = new Date(currentStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);

      try {
        const result = await TimeTableAPI.cloneWeek(
          this.timeTableId,
          lastWeekStart.toISOString().split('T')[0],
          lastWeekEnd.toISOString().split('T')[0],
          this.currentWeekStartFormatted
        );
        
        this.cloneResultMessage = `Successfully cloned ${result.cloned_slots?.length || 0} time slots!`;
        this.cloneResultType = 'success';
        this.showCloneResultModal = true;
        
        // Refresh the calendar
        await this.fetchTimeSloteBYGroupId(this.selectedGroupId);
      } catch (error) {
        this.cloneResultMessage = error.message || 'Failed to clone week';
        this.cloneResultType = 'error';
        this.showCloneResultModal = true;
      }
    },

    // Handle week cloned event from modal
    async onWeekCloned(result) {
      this.showCloneModal = false;
      // Refresh the calendar
      await this.fetchTimeSloteBYGroupId(this.selectedGroupId);
    },

    // ===============================
    // NEW SLOT METHODS
    // ===============================
    
    async openNewSlotModal(date = null) {
      if (!this.timeTableId) {
        console.log('No timetable found for the selected group. Please create a timetable first.');
        return;
      }
      
      // Format date if provided
      if (date) {
        try {
          const d = new Date(date);
          // Check if date is valid
          if (!isNaN(d.getTime())) {
            this.newSlotSelectedDate = d.toISOString().split('T')[0];
          } else {
            console.warn('Invalid date provided:', date);
            this.newSlotSelectedDate = null;
          }
        } catch (e) {
          console.error('Error parsing date:', e);
          this.newSlotSelectedDate = null;
        }
      } else {
        this.newSlotSelectedDate = null;
      }
      
      this.showNewSlotModal = true;
    },

    closeNewSlotModal() {
      this.showNewSlotModal = false;
      this.newSlotSelectedDate = null;
    },

    // Handle slot created event from modal
    async onSlotCreated(result) {
      this.closeNewSlotModal();
      // Refresh the calendar
      await this.fetchTimeSloteBYGroupId(this.selectedGroupId);
    },

    // ===============================
    // FETCH AVAILABLE OPTIONS FOR NEW SLOT
    // ===============================
    
    async fetchAvailableOptions() {
      // Fetch subjects, teachers, and locations in parallel
      try {
        const [subjects, teachers, locations] = await Promise.all([
          TimeTableAPI.fetchAllSubjects(),
          TimeTableAPI.fetchTeachers(),
          TimeTableAPI.fetchLocations()
        ]);
        
        this.availableSubjects = subjects || [];
        this.availableTeachers = teachers || [];
        this.availableLocations = locations || [];
      } catch (e) {
        console.error('Error fetching available options:', e);
      }
    },
    
    async fetchAvailableSubjects() {
      try {
        const res = await TimeTableAPI.fetchAllSubjects();
        this.availableSubjects = res || [];
      } catch (e) {
        console.error('Error fetching subjects:', e);
        this.availableSubjects = [];
      }
    },
    
    async fetchAvailableTeachers() {
      try {
        const res = await TimeTableAPI.fetchTeachers();
        this.availableTeachers = res || [];
      } catch (e) {
        console.error('Error fetching teachers:', e);
        this.availableTeachers = [];
      }
    },
    
    async fetchAvailableLocations() {
      try {
        const res = await TimeTableAPI.fetchLocations();
        this.availableLocations = res || [];
      } catch (e) {
        console.error('Error fetching locations:', e);
        this.availableLocations = [];
      }
    },
    
    // Helper to format date for API (YYYY-MM-DD)
    formatDateForAPI(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    },

    // Helper to get week range from a date
    getWeekRange(date) {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
      
      const weekStart = new Date(d.setDate(diff));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      return {
        start: this.formatDateForAPI(weekStart),
        end: this.formatDateForAPI(weekEnd)
      };
    }
  },

  watch: {
    activeView(newView, oldView) {
      // Only scroll to semester start when view TYPE changes (e.g., week -> month)
      // Not when navigating within the same view type
      if (newView !== oldView) {
        this.$nextTick(() => {
          this.updateTitle();
        });
      }
    },

    selectedDepartmentId(newVal) {
      if (newVal) {
        // Reset everything when department changes
        this.programs = [];
        this.selectedProgramId = null;
        this.selectedAcademicYearId = 'all';
        this.semesters = [];
        this.groups = [];
        this.selectedSemesterId = null;
        this.selectedGroupId = null;
        this.allSemestersData = [];
        this.timeTableId = null;
        this.academicYears = [];
        
        // Fetch programs for the selected department
        this.fetchPrograms_by_DepartmentId(newVal);
        // Also fetch subdepartments for display
        this.fetchSubDepartmentByDepartmentId(newVal);
      }
    },

    selected_SubdepartmentId(newVal) {
      // Subdepartment is for display/filtering only, doesn't fetch programs
      if (newVal) {
        console.log("Subdepartment selected:", newVal);
      }
    },

    selectedProgramId(newVal) {
      console.log("=== selectedProgramId watcher triggered with:", newVal, "===");
      
      if (newVal) {
        // Reset semesters and groups when program changes
        // But keep academicYears (from all department programs)
        this.selectedAcademicYearId = 'all';
        this.semesters = [];
        this.groups = [];
        this.selectedSemesterId = null;
        this.selectedGroupId = null;
        this.allSemestersData = [];
        this.timeTableId = null;
        this.events = [];
                
        // Fetch semesters for the selected program
        this.fetchSemestersAndAcademicYears(newVal);
      }
    },
    selectedSemesterId(newVal) {
      if (newVal) {
        this.fetchGroupsBySemesterId(newVal);
        // Set min and max date for the calendar based on semester
        const semester = this.semesters.find(s => s.id === newVal);
        if (semester) {
          this.minDate = this.parseDate(semester.start_date);
          this.maxDate = this.parseDate(semester.end_date);
          
          // Auto-scroll to semester start date after calendar renders
          this.$nextTick(() => {
            // Use setTimeout to ensure vue-cal is fully mounted with new dates
            setTimeout(() => {
              this.scrollToSemesterStart();
            }, 150);
          });
        }
      }
    },
    selectedGroupId: async function(newVal) {
      if (newVal) {
        await this.fetchTimeTableIdByGroup(newVal);
        if (this.timeTableId) {
          await this.fetchTimeSloteBYGroupId(newVal);
        } else {
          this.showNoTimetableModal = true;
          this.events = [];
        }
      } else {
        this.timeTableId = null;
        this.events = [];
      }
    },

    selectedAcademicYearId(newVal) {
      console.log("=== selectedAcademicYearId watcher triggered with:", newVal, "===");
      
      if (newVal) {        
        // Reset groups when academic year changes (but keep current semester selection if valid)
        this.groups = [];
        this.selectedGroupId = null;
        this.timeTableId = null;
        this.events = [];
        
        // Only filter if we have semesters data
        if (this.allSemestersData.length > 0) {
          this.filterSemestersByAcademicYear();
          // filterSemestersByAcademicYear will auto-select the first semester
          // Don't clear selectedSemesterId here
        } else {
          this.semesters = [];
          this.selectedSemesterId = null;
        }
      } else {
        // Clear semesters if no academic year selected
        this.semesters = [];
        this.selectedSemesterId = null;
      }
    },
  },
};
</script>