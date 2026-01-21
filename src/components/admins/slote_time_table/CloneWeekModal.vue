<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="text-lg font-semibold text-gray-800">Clone Week</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <form @submit.prevent="handleClone" class="modal-body">
        <!-- Source Week -->
        <div class="form-section">
          <h4 class="section-title">Source Week (Copy From)</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date</label>
              <input 
                v-model="fromStart" 
                type="date" 
                required 
                :min="semesterStartFormatted"
                :max="semesterEndFormatted"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input 
                v-model="fromEnd" 
                type="date" 
                required
                :min="fromStart"
                :max="semesterEndFormatted"
                class="form-input"
              />
            </div>
          </div>
          <p class="hint-text">Select the week you want to copy events from</p>
        </div>

        <!-- Target Week -->
        <div class="form-section">
          <h4 class="section-title">Target Week (Clone To)</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date</label>
              <input 
                v-model="toStart" 
                type="date" 
                required
                :min="todayFormatted"
                :max="semesterEndFormatted"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>End Date (Auto-calculated)</label>
              <input 
                :value="toEndCalculated" 
                type="date" 
                disabled
                class="form-input disabled"
              />
            </div>
          </div>
          <p class="hint-text">Events will be cloned to this week (must be today or future date within semester)</p>
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
          <button type="submit" :disabled="isLoading" class="btn-clone">
            <span v-if="isLoading">Cloning...</span>
            <span v-else>Clone Week</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CloneWeekModal',
  props: {
    timeTableId: {
      type: [Number, String],
      required: true
    },
    semesterStart: {
      type: String,
      required: true
    },
    semesterEnd: {
      type: String,
      required: true
    },
    currentWeekStart: {
      type: String,
      default: null
    },
    currentWeekEnd: {
      type: String,
      default: null
    }
  },
  emits: ['close', 'cloned'],
  data() {
    return {
      fromStart: '',
      fromEnd: '',
      toStart: '',
      isLoading: false,
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
    todayFormatted() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    toEndCalculated() {
      if (!this.fromStart || !this.fromEnd || !this.toStart) return '';
      
      const fromStartDate = new Date(this.fromStart);
      const fromEndDate = new Date(this.fromEnd);
      const toStartDate = new Date(this.toStart);
      
      const diffDays = Math.ceil((fromEndDate - fromStartDate) / (1000 * 60 * 60 * 24));
      const toEndDate = new Date(toStartDate);
      toEndDate.setDate(toEndDate.getDate() + diffDays);
      
      return toEndDate.toISOString().split('T')[0];
    }
  },
  mounted() {
    // Pre-fill with current week if provided
    if (this.currentWeekStart) {
      this.fromStart = this.currentWeekStart;
    }
    if (this.currentWeekEnd) {
      this.fromEnd = this.currentWeekEnd;
    }
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
    async handleClone() {
      this.errorMessage = '';
      this.successMessage = '';
      
      // Validation
      if (!this.fromStart || !this.fromEnd || !this.toStart) {
        this.errorMessage = 'Please fill in all required fields';
        return;
      }

      const fromStartDate = new Date(this.fromStart);
      const fromEndDate = new Date(this.fromEnd);
      const toStartDate = new Date(this.toStart);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (fromEndDate < fromStartDate) {
        this.errorMessage = 'Source end date must be after start date';
        return;
      }

      if (toStartDate < today) {
        this.errorMessage = 'Cannot clone to a past date';
        return;
      }

      this.isLoading = true;

      try {
        const TimeTableAPI = (await import('@/stores/apis/TimeTableAPI')).default;
        
        const result = await TimeTableAPI.cloneWeek(
          this.timeTableId,
          this.fromStart,
          this.fromEnd,
          this.toStart
        );

        this.successMessage = `Successfully cloned ${result.cloned_slots?.length || 0} time slots!`;
        
        // Emit success event after a short delay to show success message
        setTimeout(() => {
          this.$emit('cloned', result);
        }, 1500);

      } catch (error) {
        console.error('Clone error:', error);
        this.errorMessage = error.message || 'Failed to clone week. Please try again.';
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
  width: 500px;
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

.form-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
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

.form-input.disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.hint-text {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
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

.btn-clone {
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

.btn-clone:hover:not(:disabled) {
  background: #1e4d8c;
}

.btn-clone:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
