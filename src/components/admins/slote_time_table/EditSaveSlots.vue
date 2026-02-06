<template>
  <div class="modal-overlay" @click.self="closeModal">
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="confirm-overlay" @click.self="cancelDelete">
      <div class="confirm-card" @click.stop>
        <div class="confirm-header">
          <div class="confirm-icon">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="confirm-title">Delete Time Slot</h3>
        </div>
        <div class="confirm-body">
          <p class="confirm-message">Are you sure you want to delete this time slot? This action cannot be undone.</p>
        </div>
        <div class="confirm-footer">
          <button type="button" @click="cancelDelete" class="confirm-cancel">Cancel</button>
          <button type="button" @click="confirmDelete" :disabled="deleting" class="confirm-delete">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <div class="modal-content" @click.stop>
      <h3>Edit Time Slot</h3>
      <form @submit.prevent="saveEvent">
        <label>Teacher:<span class="required">*</span></label>
        <select v-model="formData.teacher_id" @change="onTeacherChange" :disabled="isLoadingTeachers" required>
          <option :value="null">{{ isLoadingTeachers ? 'Loading teachers...' : 'Select Teacher' }}</option>
          <option v-for="teacher in filteredTeachers" :key="teacher.id" :value="teacher.id">
            {{ teacher.name || teacher.first_name + ' ' + teacher.last_name }}
          </option>
        </select>
        <p v-if="formData.time_slot_date && formData.time_slot.start_time && formData.time_slot.end_time && filteredTeachers.length === 0 && !isLoadingTeachers" class="text-xs text-amber-600 mt-1">
          No teachers available for this time slot. All teachers are busy.
        </p>

        <label>Subject:<span class="required">*</span></label>
        <select v-model="formData.subject_id" :disabled="isLoadingSubjects" required>
          <option :value="null">{{ isLoadingSubjects ? 'Loading subjects...' : 'Select Subject' }}</option>
          <option v-for="subject in filteredSubjects" :key="subject.id" :value="subject.id">
            {{ subject.name || subject.subject_name }}
          </option>
        </select>
        <p v-if="formData.teacher_id && filteredSubjects.length === 0 && !isLoadingSubjects" class="text-xs text-amber-600 mt-1">
          This teacher doesn't teach any subjects
        </p>

        <label>Location:<span class="required">*</span></label>
        <select v-model="formData.location_id" :disabled="isLoadingLocations" required>
          <option :value="null">{{ isLoadingLocations ? 'Loading locations...' : 'Select Location' }}</option>
          <option v-for="location in filteredLocations" :key="location.id" :value="location.id">
            {{ location.name || location.location_name }}
          </option>
        </select>
        <p v-if="formData.time_slot_date && formData.time_slot.start_time && formData.time_slot.end_time && filteredLocations.length === 0 && !isLoadingLocations" class="text-xs text-amber-600 mt-1">
          No locations available for this time slot. All rooms are booked.
        </p>

        <label>Remark:</label>
        <input :value="formData.remark" @input="formData.remark = $event.target.value" type="text" placeholder="Optional remark" />

        <label>Date:<span class="required">*</span></label>
        <input :value="formData.time_slot_date" @input="formData.time_slot_date = $event.target.value" @change="onDateOrTimeChange" type="date" required />

        <label>Start Time:<span class="required">*</span></label>
        <input ref="startTimeInput" :value="formData.time_slot.start_time" @input="formData.time_slot.start_time = $event.target.value" @change="onDateOrTimeChange" type="time" required />

        <label>End Time:<span class="required">*</span></label>
        <input ref="endTimeInput" :value="formData.time_slot.end_time" @input="formData.time_slot.end_time = $event.target.value" @change="onDateOrTimeChange" type="time" required />

        <div class="buttons">
          <button type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
          <button type="button" @click="deleteEvent" :disabled="deleting">{{ deleting ? 'Deleting...' : 'Delete' }}</button>
          <button type="button" @click="closeModal" :disabled="saving || deleting">Cancel</button>
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    eventData: {
      type: Object,
      required: true
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
    },
    externalErrorMessage: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'update', 'delete'],
  data() {
    return {
      formData: {
        teacher_id: null,
        subject_id: null,
        location_id: null,
        remark: '',
        time_slot_date: '',
        time_slot: {
          start_time: '',
          end_time: ''
        }
      },
      teacherSubjects: [], // Store subjects filtered by teacher
      availableLocations: [], // Store available locations based on time
      availableTeachers: [], // Store available teachers based on time
      isLoadingSubjects: false,
      isLoadingLocations: false,
      isLoadingTeachers: false,
      saving: false,
      deleting: false,
      errorMessage: '',
      showDeleteConfirm: false
    };
  },
  computed: {
    filteredSubjects() {
      // If a teacher is selected and we have teacher-specific subjects, use those
      if (this.formData.teacher_id && this.teacherSubjects.length > 0) {
        return this.teacherSubjects;
      }
      // If a teacher is selected but no subjects found, return empty
      if (this.formData.teacher_id && this.teacherSubjects.length === 0 && !this.isLoadingSubjects) {
        return [];
      }
      // Otherwise, show all subjects from props
      return this.subjects;
    },
    filteredLocations() {
      // If date and time are selected, show filtered available locations
      if (this.formData.time_slot_date && this.formData.time_slot.start_time && this.formData.time_slot.end_time) {
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
      if (this.formData.time_slot_date && this.formData.time_slot.start_time && this.formData.time_slot.end_time) {
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
    this.initializeFormData();
    // Initialize with all locations and teachers
    this.availableLocations = [...this.locations];
    this.availableTeachers = [...this.teachers];
    // Load teacher subjects if teacher is already selected
    if (this.formData.teacher_id) {
      this.fetchSubjectsByTeacher(this.formData.teacher_id);
    }
    // Load available locations and teachers if date and time are set
    if (this.formData.time_slot_date && this.formData.time_slot.start_time && this.formData.time_slot.end_time) {
      this.fetchAvailableLocations();
      this.fetchAvailableTeachers();
    }
  },
  watch: {
    eventData: {
      handler(newVal) {
        if (newVal) {
          this.initializeFormData();
          // Load teacher subjects when event data changes
          if (this.formData.teacher_id) {
            this.fetchSubjectsByTeacher(this.formData.teacher_id);
          }
          // Fetch available locations and teachers when event data changes
          this.$nextTick(() => {
            if (this.formData.time_slot_date && this.formData.time_slot.start_time && this.formData.time_slot.end_time) {
              this.fetchAvailableLocations();
              this.fetchAvailableTeachers();
            }
          });
        }
      },
      deep: true
    },
    externalErrorMessage: {
      handler(newVal) {
        this.errorMessage = newVal;
      },
      immediate: true
    }
  },
  methods: {
    initializeFormData() {
      const event = this.eventData;
      
      // Clear any previous error messages
      this.errorMessage = '';
      
      // Guard clause: if no event data, use default values
      if (!event) {
        this.formData = {
          teacher_id: null,
          subject_id: null,
          location_id: null,
          remark: '',
          time_slot_date: '',
          time_slot: {
            start_time: '',
            end_time: ''
          }
        };
        return;
      }
      
      // Get the original slot data
      const originalSlot = event.originalSlot || event;
      
      // Parse the time_slot JSON
      let timeSlotData = {};
      if (originalSlot.time_slot) {
        try {
          timeSlotData = typeof originalSlot.time_slot === 'string' 
            ? JSON.parse(originalSlot.time_slot) 
            : originalSlot.time_slot;
        } catch (e) {
          console.error('Error parsing time_slot:', e);
          this.errorMessage = 'Error loading time slot data.';
        }
      }
      
      // Get date and times
      const timeSlotDate = originalSlot.time_slot_date || '';
      const startTime = timeSlotData.start_time || '';
      const endTime = timeSlotData.end_time || '';
      
      // Remove seconds if present (HH:MM:SS -> HH:MM)
      const formattedStartTime = startTime && startTime.split(':').length === 3 
        ? startTime.split(':').slice(0, 2).join(':') 
        : startTime;
      const formattedEndTime = endTime && endTime.split(':').length === 3 
        ? endTime.split(':').slice(0, 2).join(':') 
        : endTime;
      
      this.formData = {
        teacher_id: originalSlot.teacher_id || null,
        subject_id: originalSlot.subject_id || null,
        location_id: originalSlot.location_id || null,
        remark: originalSlot.remark || event.content || '',
        time_slot_date: timeSlotDate,
        time_slot: {
          start_time: formattedStartTime,
          end_time: formattedEndTime
        }
      };

      // Force update the input values in next tick to ensure they display correctly
      this.$nextTick(() => {
        if (this.$refs.startTimeInput) this.$refs.startTimeInput.value = this.formData.time_slot.start_time;
        if (this.$refs.endTimeInput) this.$refs.endTimeInput.value = this.formData.time_slot.end_time;
      });
    },
    
    async onTeacherChange() {
      // Reset subject selection when teacher changes
      const currentSubject = this.formData.subject_id;
      this.teacherSubjects = [];
      
      if (!this.formData.teacher_id) {
        // If no teacher selected, show all subjects
        return;
      }
      
      // Fetch subjects taught by this teacher
      await this.fetchSubjectsByTeacher(this.formData.teacher_id);
      
      // If current subject is not in the filtered list, reset it
      if (currentSubject && !this.teacherSubjects.find(s => s.id === currentSubject)) {
        this.formData.subject_id = null;
      }
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
      // Reset location and teacher selection when date/time changes
      const currentLocation = this.formData.location_id;
      const currentTeacher = this.formData.teacher_id;
      
      if (!this.formData.time_slot_date || !this.formData.time_slot.start_time || !this.formData.time_slot.end_time) {
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
        this.formData.location_id = null;
      }
      
      // If current teacher is not available anymore, reset it and subjects
      if (currentTeacher && !this.availableTeachers.find(t => t.id === currentTeacher)) {
        this.formData.teacher_id = null;
        this.formData.subject_id = null;
        this.teacherSubjects = [];
      }
    },
    
    async fetchAvailableLocations() {
      this.isLoadingLocations = true;
      try {
        const TimeTableAPI = (await import('@/stores/apis/TimeTableAPI')).default;
        
        // Add ':00' to times if needed for backend format (HH:mm:ss)
        const startTime = this.formData.time_slot.start_time.includes(':') && this.formData.time_slot.start_time.split(':').length === 2 
          ? this.formData.time_slot.start_time + ':00' 
          : this.formData.time_slot.start_time;
        const endTime = this.formData.time_slot.end_time.includes(':') && this.formData.time_slot.end_time.split(':').length === 2 
          ? this.formData.time_slot.end_time + ':00' 
          : this.formData.time_slot.end_time;
        
        // Pass the current event ID to exclude it from conflict checking (for edit mode)
        const eventId = this.eventData?.id || null;
        
        const locations = await TimeTableAPI.fetchAvailableLocations(
          this.formData.time_slot_date,
          startTime,
          endTime,
          eventId
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
        const startTime = this.formData.time_slot.start_time.includes(':') && this.formData.time_slot.start_time.split(':').length === 2 
          ? this.formData.time_slot.start_time + ':00' 
          : this.formData.time_slot.start_time;
        const endTime = this.formData.time_slot.end_time.includes(':') && this.formData.time_slot.end_time.split(':').length === 2 
          ? this.formData.time_slot.end_time + ':00' 
          : this.formData.time_slot.end_time;
        
        // Pass the current event ID to exclude it from conflict checking (for edit mode)
        const eventId = this.eventData?.id || null;
        
        const teachers = await TimeTableAPI.fetchAvailableTeachers(
          this.formData.time_slot_date,
          startTime,
          endTime,
          eventId
        );
        this.availableTeachers = teachers || [];
      } catch (error) {
        console.error('Error fetching available teachers:', error);
        this.availableTeachers = [...this.teachers]; // Fallback to all teachers
      } finally {
        this.isLoadingTeachers = false;
      }
    },
    
    async saveEvent() {
      if (!this.eventData || !this.eventData.id) {
        this.errorMessage = 'Error: Event data is not available. Please try again.';
        console.error('Error saving event: eventData is undefined or missing id', this.eventData);
        return;
      }
      
      // Validate required fields
      if (!this.formData.teacher_id) {
        this.errorMessage = 'Please select a teacher.';
        return;
      }
      
      if (!this.formData.subject_id) {
        this.errorMessage = 'Please select a subject.';
        return;
      }
      
      if (!this.formData.location_id) {
        this.errorMessage = 'Please select a location.';
        return;
      }
      
      if (!this.formData.time_slot_date) {
        this.errorMessage = 'Please select a date.';
        return;
      }
      
      if (!this.formData.time_slot.start_time || !this.formData.time_slot.end_time) {
        this.errorMessage = 'Please select start and end times.';
        return;
      }
      
      if (this.formData.time_slot.end_time <= this.formData.time_slot.start_time) {
        this.errorMessage = 'End time must be after start time.';
        return;
      }
      
      this.saving = true;
      this.errorMessage = '';
      try {
        this.$emit('update', {
          id: this.eventData.id,
          ...this.formData
        });
      } catch (error) {
        console.error('Error saving event:', error);
        this.errorMessage = 'Failed to save time slot. Please try again.';
      } finally {
        this.saving = false;
      }
    },
    
    async deleteEvent() {
      if (!this.eventData || !this.eventData.id) {
        this.errorMessage = 'Error: Event data is not available. Please try again.';
        console.error('Error deleting event: eventData is undefined or missing id', this.eventData);
        return;
      }
      
      // Show custom confirmation modal
      this.showDeleteConfirm = true;
    },
    
    cancelDelete() {
      this.showDeleteConfirm = false;
    },
    
    async confirmDelete() {
      this.deleting = true;
      this.errorMessage = '';
      try {
        this.$emit('delete', this.eventData.id);
        this.showDeleteConfirm = false;
      } catch (error) {
        console.error('Error deleting event:', error);
        this.errorMessage = 'Failed to delete time slot. Please try again.';
        this.showDeleteConfirm = false;
      } finally {
        this.deleting = false;
      }
    },
    
    closeModal(event) {
      // Prevent event propagation to avoid re-opening modal
      if (event) {
        event.stopPropagation();
      }
      this.errorMessage = '';
      this.showDeleteConfirm = false;
      this.$emit('close');
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
  padding: 24px;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

h3 {
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  margin-top: 12px;
  margin-bottom: 4px;
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}

.required {
  color: #dc2626;
  margin-left: 4px;
}

input,
select {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

select {
  background-color: white;
  cursor: pointer;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

button {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

button[type="submit"] {
  background: #10b981;
  color: white;
}

button[type="submit"]:hover:not(:disabled) {
  background: #059669;
}

button[type="button"]:nth-child(2) {
  background: #ef4444;
  color: white;
}

button[type="button"]:nth-child(2):hover:not(:disabled) {
  background: #dc2626;
}

button[type="button"]:nth-child(3) {
  background: #94a3b8;
  color: white;
}

button[type="button"]:nth-child(3):hover:not(:disabled) {
  background: #64748b;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

/* Delete Confirmation Card */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  animation: fadeIn 0.2s ease;
}

.confirm-card {
  background: white;
  border-radius: 16px;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

.confirm-header {
  padding: 24px 24px 16px 24px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.confirm-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.confirm-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.confirm-body {
  padding: 20px 24px;
}

.confirm-message {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  text-align: center;
}

.confirm-footer {
  padding: 16px 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-cancel,
.confirm-delete {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s ease;
  min-width: 120px;
}

.confirm-cancel {
  background: #f1f5f9;
  color: #475569;
}

.confirm-cancel:hover {
  background: #e2e8f0;
}

.confirm-delete {
  background: #ef4444;
  color: white;
}

.confirm-delete:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.confirm-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>