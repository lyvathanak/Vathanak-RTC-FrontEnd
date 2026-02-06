<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="text-lg font-semibold text-gray-800">Create New Time Slot</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <!-- Group Info -->
      <div class="time-table-info">
        <div class="info-label">Group:</div>
        <div class="info-value">{{ groupName }}</div>
      </div>

      <form @submit.prevent="handleCreate" class="modal-body">
        <!-- Date Selection -->
        <div class="form-group">
          <label>Date <span class="required">*</span></label>
          <input 
            v-model="slot.time_slot_date" 
            @change="onDateOrTimeChange"
            type="date" 
            required
            :min="semesterStartFormatted"
            :max="semesterEndFormatted"
            class="form-input"
          />
        </div>

        <!-- Time Selection -->
        <div class="form-row">
          <div class="form-group">
            <label>Start Time <span class="required">*</span></label>
            <input 
              v-model="slot.start_time" 
              @change="onDateOrTimeChange"
              type="time" 
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>End Time <span class="required">*</span></label>
            <input 
              v-model="slot.end_time" 
              @change="onDateOrTimeChange"
              type="time" 
              required
              class="form-input"
            />
          </div>
        </div>

        <!-- Teacher Selection -->
        <div class="form-group">
          <label>Teacher</label>
          <select v-model="slot.teacher_id" @change="onTeacherChange" class="form-input" :disabled="isLoadingTeachers">
            <option :value="null">{{ isLoadingTeachers ? 'Loading teachers...' : 'Select Teacher' }}</option>
            <option 
              v-for="teacher in filteredTeachers" 
              :key="teacher.id" 
              :value="teacher.id"
            >
              {{ teacher.name }}
            </option>
          </select>
          <p v-if="slot.time_slot_date && slot.start_time && slot.end_time && filteredTeachers.length === 0 && !isLoadingTeachers" class="text-xs text-amber-600 mt-1">
            No teachers available for this time slot. All teachers are busy.
          </p>
        </div>

        <!-- Subject Selection -->
        <div class="form-group">
          <label>Subject</label>
          <select v-model="slot.subject_id" class="form-input" :disabled="isLoadingSubjects">
            <option :value="null">{{ isLoadingSubjects ? 'Loading subjects...' : 'Select Subject' }}</option>
            <option 
              v-for="subject in filteredSubjects" 
              :key="subject.id" 
              :value="subject.id"
            >
              {{ subject.subject_name }}
            </option>
          </select>
          <p v-if="slot.teacher_id && filteredSubjects.length === 0 && !isLoadingSubjects" class="text-xs text-amber-600 mt-1">
            This teacher doesn't teach any subjects
          </p>
        </div>

        <!-- Location Selection -->
        <div class="form-group">
          <label>Location</label>
          <select v-model="slot.location_id" class="form-input" :disabled="isLoadingLocations">
            <option :value="null">{{ isLoadingLocations ? 'Loading locations...' : 'Select Location' }}</option>
            <option 
              v-for="location in filteredLocations" 
              :key="location.id" 
              :value="location.id"
            >
              {{ location.name }} (Floor {{ location.floor }})
            </option>
          </select>
          <p v-if="slot.time_slot_date && slot.start_time && slot.end_time && filteredLocations.length === 0 && !isLoadingLocations" class="text-xs text-amber-600 mt-1">
            No locations available for this time slot. All rooms are booked.
          </p>
        </div>

        <!-- Remark -->
        <div class="form-group">
          <label>Remark</label>
          <textarea 
            v-model="slot.remark" 
            class="form-input"
            rows="2"
            placeholder="Optional notes..."
          ></textarea>
        </div>

        <!-- Semester Info -->
        <div class="semester-info">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Semester: {{ semesterStart }} to {{ semesterEnd }}</span>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          <p>{{ errorMessage }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <!-- Buttons -->
        <div class="button-group">
          <button type="button" @click="closeModal" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" :disabled="isLoading" class="btn-create">
            <span v-if="isLoading">Creating...</span>
            <span v-else>Create Slot</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewSlotModal',
  props: {
    timeTableId: {
      type: [Number, String],
      required: true
    },
    groupName: {
      type: String,
      default: ''
    },
    semesterStart: {
      type: String,
      required: true
    },
    semesterEnd: {
      type: String,
      required: true
    },
    selectedDate: {
      type: String,
      default: null
    },
    subjects: {
      type: Array,
      default: () => []
    },
    teachers: {
      type: Array,
      default: () => []
    },
    locations: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'created'],
  data() {
    return {
      slot: {
        time_slot_date: '',
        start_time: '07:00',
        end_time: '09:00',
        subject_id: null,
        teacher_id: null,
        location_id: null,
        remark: ''
      },
      allSubjects: [], // Store original full list of subjects
      teacherSubjects: [], // Store subjects filtered by teacher
      availableLocations: [], // Store available locations based on time
      availableTeachers: [], // Store available teachers based on time
      isLoading: false,
      isLoadingSubjects: false,
      isLoadingLocations: false,
      isLoadingTeachers: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  computed: {
    semesterStartFormatted() {
      return this.convertToInputFormat(this.semesterStart);
    },
    semesterEndFormatted() {
      return this.convertToInputFormat(this.semesterEnd);
    },
    filteredSubjects() {
      // If a teacher is selected and we have teacher-specific subjects, use those
      if (this.slot.teacher_id && this.teacherSubjects.length > 0) {
        return this.teacherSubjects;
      }
      // If a teacher is selected but no subjects found, return empty
      if (this.slot.teacher_id && this.teacherSubjects.length === 0 && !this.isLoadingSubjects) {
        return [];
      }
      // Otherwise, show all subjects from props
      return this.subjects;
    },
    filteredLocations() {
      // If date and time are selected, show filtered available locations
      if (this.slot.time_slot_date && this.slot.start_time && this.slot.end_time) {
        // If we've fetched locations or are loading, use availableLocations
        if (this.isLoadingLocations || this.availableLocations.length > 0 || this.availableLocations.length === 0) {
          return this.availableLocations;
        }
      }
      // Otherwise, show all locations from props
      return this.locations;
    },
    filteredTeachers() {
      // If date and time are selected, show filtered available teachers
      if (this.slot.time_slot_date && this.slot.start_time && this.slot.end_time) {
        // If we've fetched teachers or are loading, use availableTeachers
        if (this.isLoadingTeachers || this.availableTeachers.length > 0 || this.availableTeachers.length === 0) {
          return this.availableTeachers;
        }
      }
      // Otherwise, show all teachers from props
      return this.teachers;
    }
  },
  mounted() {
    // Pre-fill with selected date if provided
    if (this.selectedDate) {
      this.slot.time_slot_date = this.selectedDate;
    }
    // Store the original subjects list
    this.allSubjects = [...this.subjects];
    // Initialize with all locations
    this.availableLocations = [...this.locations];
    // Initialize with all teachers
    this.availableTeachers = [...this.teachers];
    
    // Fetch available locations and teachers if we have default date and time
    this.$nextTick(() => {
      if (this.slot.time_slot_date && this.slot.start_time && this.slot.end_time) {
        this.fetchAvailableLocations();
        this.fetchAvailableTeachers();
      }
    });
  },
  methods: {
    convertToInputFormat(dateStr) {
      // Convert from DD-MM-YYYY to YYYY-MM-DD
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    },
    closeModal() {
      this.$emit('close');
    },
    async onTeacherChange() {
      // Reset subject selection when teacher changes
      this.slot.subject_id = null;
      this.teacherSubjects = [];
      
      if (!this.slot.teacher_id) {
        // If no teacher selected, show all subjects
        return;
      }
      
      // Fetch subjects taught by this teacher
      await this.fetchSubjectsByTeacher(this.slot.teacher_id);
    },
    async fetchSubjectsByTeacher(teacherId) {
      this.isLoadingSubjects = true;
      try {
        const TimeTableAPI = (await import('@/stores/apis/TimeTableAPI')).default;
        const subjects = await TimeTableAPI.fetchSubjectsByTeacher(teacherId);
        this.teacherSubjects = subjects || [];
      } catch (error) {
        console.error('Error fetching subjects by teacher:', error);
        this.teacherSubjects = [];
      } finally {
        this.isLoadingSubjects = false;
      }
    },
    async onDateOrTimeChange() {
      // Reset location selection when date/time changes
      const currentLocation = this.slot.location_id;
      const currentTeacher = this.slot.teacher_id;
      
      if (!this.slot.time_slot_date || !this.slot.start_time || !this.slot.end_time) {
        // If any field is missing, show all locations and teachers
        this.availableLocations = [...this.locations];
        this.availableTeachers = [...this.teachers];
        return;
      }
      
      // Fetch available locations and teachers for this date and time
      await Promise.all([
        this.fetchAvailableLocations(),
        this.fetchAvailableTeachers()
      ]);
      
      // If current location is not available anymore, reset it
      if (currentLocation && !this.availableLocations.find(l => l.id === currentLocation)) {
        this.slot.location_id = null;
      }
      
      // If current teacher is not available anymore, reset it and subjects
      if (currentTeacher && !this.availableTeachers.find(t => t.id === currentTeacher)) {
        this.slot.teacher_id = null;
        this.slot.subject_id = null;
        this.teacherSubjects = [];
      }
    },
    async fetchAvailableLocations() {
      this.isLoadingLocations = true;
      try {
        const TimeTableAPI = (await import('@/stores/apis/TimeTableAPI')).default;
        
        // Add ':00' to times if needed for backend format (HH:mm:ss)
        const startTime = this.slot.start_time.includes(':') && this.slot.start_time.split(':').length === 2 
          ? this.slot.start_time + ':00' 
          : this.slot.start_time;
        const endTime = this.slot.end_time.includes(':') && this.slot.end_time.split(':').length === 2 
          ? this.slot.end_time + ':00' 
          : this.slot.end_time;
        
        const locations = await TimeTableAPI.fetchAvailableLocations(
          this.slot.time_slot_date,
          startTime,
          endTime
        );
        this.availableLocations = locations || [];
      } catch (error) {
        console.error('Error fetching available locations:', error);
        this.availableLocations = [...this.locations]; // Fallback to all locations
      } finally {
        this.isLoadingLocations = false;
      }
    },
    async fetchAvailableTeachers() {
      this.isLoadingTeachers = true;
      try {
        const TimeTableAPI = (await import('@/stores/apis/TimeTableAPI')).default;
        
        // Add ':00' to times if needed for backend format (HH:mm:ss)
        const startTime = this.slot.start_time.includes(':') && this.slot.start_time.split(':').length === 2 
          ? this.slot.start_time + ':00' 
          : this.slot.start_time;
        const endTime = this.slot.end_time.includes(':') && this.slot.end_time.split(':').length === 2 
          ? this.slot.end_time + ':00' 
          : this.slot.end_time;
        
        const teachers = await TimeTableAPI.fetchAvailableTeachers(
          this.slot.time_slot_date,
          startTime,
          endTime
        );
        this.availableTeachers = teachers || [];
      } catch (error) {
        console.error('Error fetching available teachers:', error);
        this.availableTeachers = [...this.teachers]; // Fallback to all teachers
      } finally {
        this.isLoadingTeachers = false;
      }
    },
    async handleCreate() {
      this.errorMessage = '';
      this.successMessage = '';
      
      // Validation
      if (!this.slot.time_slot_date || !this.slot.start_time || !this.slot.end_time) {
        this.errorMessage = 'Please fill in date and time fields';
        return;
      }

      if (this.slot.end_time <= this.slot.start_time) {
        this.errorMessage = 'End time must be after start time';
        return;
      }

      this.isLoading = true;

      try {
        const TimeTableAPI = (await import('@/stores/apis/TimeTableAPI')).default;
        
        const payload = {
          slots: [
            {
              time_slot: {
                start_time: this.slot.start_time + ':00',
                end_time: this.slot.end_time + ':00'
              },
              teacher_id: this.slot.teacher_id,
              subject_id: this.slot.subject_id,
              location_id: this.slot.location_id,
              remark: this.slot.remark || null,
              time_slot_date: this.slot.time_slot_date
            }
          ]
        };

        const result = await TimeTableAPI.createTimeSlots(this.timeTableId, payload);

        this.successMessage = 'Time slot created successfully!';
        
        // Emit success event after a short delay
        setTimeout(() => {
          this.$emit('created', result);
        }, 1000);

      } catch (error) {
        console.error('Create slot error:', error);
        this.errorMessage = error.message || 'Failed to create time slot. Please try again.';
      } finally {
        this.isLoading = false;
      }
    }
  },
  watch: {
    selectedDate(newVal) {
      if (newVal && newVal !== this.slot.time_slot_date) {
        this.slot.time_slot_date = newVal;
        // Trigger location and teacher fetch if time is already set
        if (this.slot.start_time && this.slot.end_time) {
          this.onDateOrTimeChange();
        }
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 480px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 20px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group {
  margin-bottom: 16px;
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #dc2626;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 60px;
}

.semester-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 13px;
  color: #1e40af;
  margin-bottom: 16px;
}

.error-message {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 16px;
}

.success-message {
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  color: #16a34a;
  font-size: 13px;
  margin-bottom: 16px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-create {
  padding: 10px 20px;
  background: #235AA6;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create:hover:not(:disabled) {
  background: #1e4d8c;
}

.btn-create:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.time-table-info {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 16px 24px 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}

.info-value {
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
}
</style>
