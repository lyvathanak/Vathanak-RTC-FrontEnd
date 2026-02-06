import { defineStore } from 'pinia';
import api from '@/stores/apis/axios';

export const useEnrollStudentStore = defineStore('enrollStudent', {
  state: () => ({
    loading: false,
    error: null,
    successMessage: null,
    enrolledStudent: null,
  }),

  getters: {
    /**
     * Check if enrollment is in progress
     */
    isEnrolling: (state) => state.loading,

    /**
     * Get the last enrolled student data
     */
    lastEnrolledStudent: (state) => state.enrolledStudent,
  },

  actions: {
    /**
     * Enroll a single student by ID
     * @param {number} id - The student ID to enroll
     * @returns {Promise<Object>} The response data with enrollment details
     */
    async enrollStudentById(id) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      try {
        console.log(`📝 Enrolling student with ID ${id}...`);

        const response = await api.post(`/external_exam/enroll-one/${id}`);

        console.log('✅ Student enrolled successfully:', response.data);

        this.enrolledStudent = response.data.data || response.data;
        this.successMessage = response.data.message || 'Student enrolled successfully';
        this.loading = false;

        return response.data;
      } catch (error) {
        console.error('❌ Error enrolling student:', error);

        // Extract error message
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            this.error = error.response.data;
          } else if (error.response.data.message) {
            this.error = error.response.data.message;
          } else if (error.response.data.detail) {
            this.error = error.response.data.detail;
          } else {
            this.error = 'Failed to enroll student';
          }
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'An unexpected error occurred';
        }

        this.loading = false;
        throw error;
      }
    },

    /**
     * Enroll multiple students by their IDs
     * @param {Array<number>} ids - Array of student IDs to enroll
     * @returns {Promise<Object>} The response data with enrollment results
     */
    async enrollMultipleStudents(ids) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      const results = {
        successful: [],
        failed: [],
      };

      try {
        console.log(`📝 Enrolling ${ids.length} students...`);

        for (const id of ids) {
          try {
            const response = await api.post(`/external_exam/enroll`);
            results.successful.push({
              id,
              data: response.data,
            });
          } catch (error) {
            results.failed.push({
              id,
              error: error.response?.data?.message || error.message,
            });
          }
        }

        console.log('✅ Enrollment completed:', results);

        if (results.failed.length === 0) {
          this.successMessage = `All ${ids.length} students enrolled successfully`;
        } else if (results.successful.length === 0) {
          this.error = 'Failed to enroll all students';
        } else {
          this.successMessage = `${results.successful.length} students enrolled, ${results.failed.length} failed`;
        }

        this.loading = false;
        return results;
      } catch (error) {
        console.error('❌ Error enrolling multiple students:', error);
        this.error = 'An unexpected error occurred during bulk enrollment';
        this.loading = false;
        throw error;
      }
    },

    /**
     * Reset the store state
     */
    resetState() {
      this.loading = false;
      this.error = null;
      this.successMessage = null;
      this.enrolledStudent = null;
    },
  },
});
