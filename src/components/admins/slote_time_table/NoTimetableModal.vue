<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="text-lg font-semibold text-gray-800">No Timetable Found</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <div class="message">
          <svg class="w-12 h-12 text-amber-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <p class="text-gray-700 mb-4">
            No timetable has been created for <strong>{{ groupName }}</strong> yet.
          </p>
          <p class="text-sm text-gray-600">
            Would you like to create a timetable for this group?
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Buttons -->
        <div class="button-group">
          <button type="button" @click="closeModal" class="btn-cancel">
            Cancel
          </button>
          <button type="button" @click="handleCreate" :disabled="isLoading" class="btn-create">
            <span v-if="isLoading">Creating...</span>
            <span v-else>Create Timetable</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoTimetableModal',
  props: {
    groupId: {
      type: [Number, String],
      required: true
    },
    groupName: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'created'],
  data() {
    return {
      isLoading: false,
      errorMessage: ''
    };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    async handleCreate() {
      this.errorMessage = '';
      this.isLoading = true;

      try {
        const TimeTableAPI = (await import('@/stores/apis/TimeTableAPI')).default;

        const result = await TimeTableAPI.createTimeTableForGroup(this.groupId);

        // Emit success event
        this.$emit('created', result);
        this.closeModal();

      } catch (error) {
        console.error('Create timetable error:', error);
        this.errorMessage = error.message || 'Failed to create timetable. Please try again.';
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
  max-width: 400px;
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
  text-align: center;
}

.message {
  margin-bottom: 24px;
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

.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
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
</style>