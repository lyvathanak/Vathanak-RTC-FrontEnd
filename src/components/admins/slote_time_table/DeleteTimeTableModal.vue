<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h3 class="modal-title">{{ showConfirmation ? 'Confirm Deletion' : 'Delete Time Table' }}</h3>
      
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading time tables...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchTimeTables" class="retry-btn">Retry</button>
      </div>
      
      <div v-else class="content">
        <!-- Confirmation Step -->
        <div v-if="showConfirmation" class="confirmation-step">
          <div class="confirmation-header">
            <div class="warning-icon">
              <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h4 class="confirmation-title">Confirm Deletion</h4>
          </div>
          
          <div class="confirmation-content">
            <p class="confirmation-message">
              Are you sure you want to delete <strong>"{{ selectedTimeTable?.name || 'this time table' }}"</strong> 
              for group <strong>"{{ selectedTimeTable?.group?.name || selectedTimeTable?.group?.group_name || 'Unknown Group' }}"</strong>?
            </p>
            <div class="warning-details">
              <div class="warning-item">
                <svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span>This action <strong>cannot be undone</strong></span>
              </div>
              <div class="warning-item">
                <svg class="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span>All associated time slots will be <strong>permanently removed</strong></span>
              </div>
            </div>
          </div>
          
          <div class="confirmation-buttons">
            <button 
              type="button" 
              @click="confirmDelete"
              :disabled="deleting"
              class="confirm-delete-btn"
            >
              {{ deleting ? 'Deleting...' : 'Yes, Delete Time Table' }}
            </button>
            <button 
              type="button" 
              @click="cancelConfirmation"
              :disabled="deleting"
              class="cancel-confirmation-btn"
            >
              Cancel
            </button>
          </div>
        </div>
        
        <!-- Selection Step -->
        <div v-else>
          <p class="description">Select a time table to delete:</p>
          
          <div v-if="timeTables.length === 0" class="no-data">
            <p>No time tables found</p>
          </div>
          
          <div v-else class="timetable-list">
            <div 
              v-for="tt in timeTables" 
              :key="tt.id"
              class="timetable-item"
              :class="{ 'selected': selectedTimeTableId === tt.id }"
              @click="selectedTimeTableId = tt.id"
            >
              <div class="timetable-info">
                <h4>{{ tt.name }}</h4>
                <p class="timetable-group">Group: {{ tt.group?.name || tt.group?.group_name || 'Unknown Group' }}</p>
                <p class="timetable-desc">{{ tt.description || 'No description' }}</p>
                <p class="timetable-meta">
                  <span v-if="tt.id">ID: {{ tt.id }}</span>
                </p>
              </div>
              <div v-if="selectedTimeTableId === tt.id" class="checkmark">✓</div>
            </div>
          </div>
          
          <div class="buttons">
            <button 
              type="button" 
              @click="showConfirmationStep"
              :disabled="!selectedTimeTableId"
              class="delete-btn"
            >
              Delete Selected
            </button>
            <button 
              type="button" 
              @click="closeModal"
              class="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TimeTableAPI from '@/stores/apis/TimeTableAPI';

export default {
  name: 'DeleteTimeTableModal',
  
  data() {
    return {
      timeTables: [],
      selectedTimeTableId: null,
      loading: false,
      deleting: false,
      error: null,
      showConfirmation: false
    };
  },
  
  async mounted() {
    await this.fetchTimeTables();
  },
  
  computed: {
    selectedTimeTable() {
      return this.timeTables.find(tt => tt.id === this.selectedTimeTableId);
    }
  },
  
  methods: {
    async fetchTimeTables() {
      this.loading = true;
      this.error = null;
      try {
        const result = await TimeTableAPI.fetchTimeTable();
        this.timeTables = result || [];
        console.log('Loaded time tables:', this.timeTables);
      } catch (e) {
        console.error('Error fetching time tables:', e);
        this.error = 'Failed to load time tables. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    
    showConfirmationStep() {
      if (!this.selectedTimeTableId) {
        alert('Please select a time table to delete');
        return;
      }
      this.showConfirmation = true;
    },
    
    cancelConfirmation() {
      this.showConfirmation = false;
    },
    
    async confirmDelete() {
      this.deleting = true;
      try {
        const result = await TimeTableAPI.deleteTimeTableByTimeTableId(this.selectedTimeTableId);
        console.log('Delete result:', result);
        
        // Emit success event
        this.$emit('deleted', {
          timeTableId: this.selectedTimeTableId,
          message: result.message || 'Time table deleted successfully'
        });
        
        // Close modal
        this.closeModal();
      } catch (e) {
        console.error('Error deleting time table:', e);
        const errorMsg = e.message || 'Failed to delete time table. Please try again.';
        alert(`Error: ${errorMsg}`);
      } finally {
        this.deleting = false;
      }
    },
    
    closeModal() {
      this.showConfirmation = false;
      this.selectedTimeTableId = null;
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
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.description {
  color: #64748b;
  margin-bottom: 16px;
  font-size: 14px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  padding: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  text-align: center;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  background: #b91c1c;
}

.no-data {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
}

.timetable-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.timetable-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timetable-item:last-child {
  border-bottom: none;
}

.timetable-item:hover {
  background-color: #f8fafc;
}

.timetable-item.selected {
  background-color: #fef2f2;
  border-left: 4px solid #dc2626;
}

.timetable-info {
  flex: 1;
}

.timetable-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.timetable-group {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #059669;
  font-weight: 500;
}

.timetable-desc {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #64748b;
}

.timetable-meta {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  gap: 12px;
}

.checkmark {
  width: 28px;
  height: 28px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.delete-btn,
.cancel-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.delete-btn {
  background: #dc2626;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.delete-btn:disabled {
  background: #fca5a5;
  cursor: not-allowed;
  opacity: 0.6;
}

.cancel-btn {
  background: #f1f5f9;
  color: #475569;
}

.cancel-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirmation-step {
  text-align: center;
}

.confirmation-header {
  margin-bottom: 24px;
}

.warning-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.confirmation-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.confirmation-content {
  margin-bottom: 32px;
}

.confirmation-message {
  font-size: 16px;
  color: #374151;
  margin-bottom: 20px;
  line-height: 1.5;
}

.warning-details {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.warning-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #92400e;
}

.warning-item:last-child {
  margin-bottom: 0;
}

.warning-item strong {
  font-weight: 600;
}

.confirmation-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-delete-btn,
.cancel-confirmation-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  min-width: 140px;
}

.confirm-delete-btn {
  background: #dc2626;
  color: white;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.confirm-delete-btn:disabled {
  background: #fca5a5;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.cancel-confirmation-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-confirmation-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.cancel-confirmation-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
