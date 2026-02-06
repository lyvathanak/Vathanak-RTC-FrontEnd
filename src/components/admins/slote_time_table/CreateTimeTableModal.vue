<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="text-lg font-semibold text-gray-800">Create New Time Table</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <form @submit.prevent="handleCreate" class="modal-body">
        <!-- Name Input -->
        <div class="form-group">
          <label>Time Table Name <span class="required">*</span></label>
          <input 
            v-model="formData.name" 
            type="text" 
            required
            placeholder="e.g., Time Table for Group A"
            class="form-input"
          />
        </div>

        <!-- Description Input -->
        <div class="form-group">
          <label>Description</label>
          <textarea 
            v-model="formData.description" 
            rows="3"
            placeholder="Optional description"
            class="form-input"
          ></textarea>
        </div>

        <!-- Group Selection -->
        <div class="form-group">
          <label>Select Group <span class="required">*</span></label>
          <select v-model="formData.group_id" required class="form-input" @change="checkGroupTimetable">
            <option :value="null" disabled>Select a group</option>
            <option 
              v-for="group in sortedGroups" 
              :key="group.id" 
              :value="group.id"
              :class="{ 'group-has-timetable': groupsWithTimetable.includes(group.id) }"
            >
              {{ group.name || `Group ${group.id}` }}
              {{ groupsWithTimetable.includes(group.id) ? ' (Already has timetable)' : '' }}
            </option>
          </select>
          <p v-if="formData.group_id && groupsWithTimetable.includes(formData.group_id)" class="warning-text">
            This group already has a timetable. Please select a different group.
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
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
            <span v-else>Create Time Table</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateTimeTableModal',
  props: {
    groups: {
      type: Array,
      default: () => []
    },
    preSelectedGroupId: {
      type: [Number, String],
      default: null
    }
  },
  emits: ['close', 'created'],
  computed: {
    // Sort groups to show groups without timetables first
    sortedGroups() {
      if (!this.groups || this.groups.length === 0) return [];
      
      return [...this.groups].sort((a, b) => {
        const aHasTimetable = this.groupsWithTimetable.includes(a.id);
        const bHasTimetable = this.groupsWithTimetable.includes(b.id);
        
        // Groups without timetables come first
        if (aHasTimetable && !bHasTimetable) return 1;
        if (!aHasTimetable && bHasTimetable) return -1;
        
        // Then sort by name
        const aName = a.name || `Group ${a.id}`;
        const bName = b.name || `Group ${b.id}`;
        return aName.localeCompare(bName);
      });
    }
  },
  data() {
    return {
      formData: {
        name: '',
        description: '',
        group_id: null
      },
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      groupsWithTimetable: [], // Track which groups already have timetables
      checkingGroup: false
    };
  },
  mounted() {
    // Pre-select group if provided
    if (this.preSelectedGroupId) {
      this.formData.group_id = this.preSelectedGroupId;
      // Check if this group already has a timetable
      this.checkGroupTimetable();
    }
    // Check all groups for existing timetables
    this.checkAllGroupsForTimetables();
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    
    // Check if a specific group already has a timetable
    async checkGroupTimetable() {
      if (!this.formData.group_id) return;
      
      this.checkingGroup = true;
      this.errorMessage = '';
      
      try {
        const TimeTableAPI = (await import('@/stores/apis/TimeTableAPI')).default;
        const existingTimetable = await TimeTableAPI.getTimeTableByGroupId(this.formData.group_id);
        
        if (existingTimetable && existingTimetable.id) {
          if (!this.groupsWithTimetable.includes(this.formData.group_id)) {
            this.groupsWithTimetable.push(this.formData.group_id);
          }
          
          // Show warning but don't prevent creation (backend will handle it)
          const groupName = this.groups.find(g => g.id === this.formData.group_id)?.name || 'this group';
          console.log(`Group ${groupName} already has timetable:`, existingTimetable);
        }
      } catch (error) {
        // No timetable found - this is okay
        console.log('No existing timetable for group:', this.formData.group_id);
      } finally {
        this.checkingGroup = false;
      }
    },
    
    // Check all groups for existing timetables
    async checkAllGroupsForTimetables() {
      if (!this.groups || this.groups.length === 0) return;
      
      try {
        const TimeTableAPI = (await import('@/stores/apis/TimeTableAPI')).default;
        
        // Check each group
        const checkPromises = this.groups.map(async (group) => {
          try {
            const existingTimetable = await TimeTableAPI.getTimeTableByGroupId(group.id);
            if (existingTimetable && existingTimetable.id) {
              return group.id;
            }
          } catch (error) {
            // No timetable for this group
            return null;
          }
        });
        
        const results = await Promise.all(checkPromises);
        this.groupsWithTimetable = results.filter(id => id !== null);
        console.log('Groups with timetables:', this.groupsWithTimetable);
      } catch (error) {
        console.error('Error checking groups for timetables:', error);
      }
    },
    
    async handleCreate() {
      this.errorMessage = '';
      this.successMessage = '';
      
      // Validation
      if (!this.formData.name || !this.formData.group_id) {
        this.errorMessage = 'Please fill in all required fields';
        return;
      }
      
      // Warn if group already has a timetable
      if (this.groupsWithTimetable.includes(this.formData.group_id)) {
        const groupName = this.groups.find(g => g.id === this.formData.group_id)?.name || 'This group';
        this.errorMessage = `${groupName} already has a timetable. Please select a different group or delete the existing timetable first.`;
        return;
      }

      this.isLoading = true;

      try {
        const TimeTableAPI = (await import('@/stores/apis/TimeTableAPI')).default;
        
        const result = await TimeTableAPI.createTimeTableForGroup(
          this.formData.group_id,
          this.formData.name,
          this.formData.description
        );

        this.successMessage = 'Time table created successfully!';
        
        // Emit success event after a short delay
        setTimeout(() => {
          this.$emit('created', result);
        }, 1000);

      } catch (error) {
        console.error('Create time table error:', error);
        
        // Handle specific error messages
        if (error.response && error.response.status === 409) {
          this.errorMessage = 'A timetable already exists for this group. Please select a different group.';
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Failed to create time table. Please try again.';
        }
      } finally {
        this.isLoading = false;
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
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
  margin-bottom: 16px;
}

.success-message {
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
  font-size: 14px;
  margin-bottom: 16px;
}

.warning-text {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef3c7;
  border: 1px solid #ffdf5f;
  border-radius: 6px;
  color: #000000;
  font-size: 13px;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-create {
  padding: 10px 20px;
  border: none;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create:hover:not(:disabled) {
  background: #2563eb;
}

.btn-create:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Style for groups that already have timetables */
.group-has-timetable {
  color: #9ca3af;
  font-style: italic;
}
</style>
