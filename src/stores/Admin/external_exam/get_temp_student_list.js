import { defineStore } from 'pinia';
import api from '@/stores/apis/axios';

export const useTempStudentListStore = defineStore('tempStudentList', {
  state: () => ({
    students: [],
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Get all students with scores
     */
    allStudents: (state) => state.students,

    /**
     * Get students by enrollment decision
     */
    getStudentsByDecision: (state) => (decision) => {
      return state.students.filter(s => s.enrollment_decision === decision);
    },

    /**
     * Get selected students only
     */
    selectedStudents: (state) => {
      return state.students.filter(s => s.enrollment_decision === 'selected');
    },

    /**
     * Get students sorted by rank
     */
    studentsByRank: (state) => {
      return [...state.students].sort((a, b) => a.rank - b.rank);
    },

    /**
     * Get students sorted by score (descending)
     */
    studentsByScore: (state) => {
      return [...state.students].sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    },

    /**
     * Check if there are any students
     */
    hasStudents: (state) => state.students.length > 0,

    /**
     * Get total number of students
     */
    totalStudents: (state) => state.students.length,
  },

  actions: {
    /**
     * Fetch temp students list with scores by academic year
     * @param {number|string} academicYear - The academic year to filter by (e.g., 2026 or "2025-2026")
     * @returns {Promise<Array>} The list of students with scores
     */
    async fetchTempStudentList(academicYear) {
      this.loading = true;
      this.error = null;

      try {
        // Format academic year properly
        let formattedAcademicYear;
        if (academicYear && typeof academicYear === 'string' && academicYear.includes('-')) {
          formattedAcademicYear = academicYear;
        } else {
          const year = academicYear || new Date().getFullYear();
          formattedAcademicYear = `${year - 1}-${year}`;
        }

        console.log(`📋 Fetching temp student list for academic year ${formattedAcademicYear}...`);

        const response = await api.get('/external_exam/temp_student_list', {
          params: { academic_year: formattedAcademicYear }
        });

        console.log('✅ Temp student list fetched successfully:', response.data);

        // Update state with response data
        this.students = response.data || [];
        this.loading = false;

        return response.data;
      } catch (error) {
        console.error('❌ Error fetching temp student list:', error);

        // Extract error message
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            this.error = error.response.data;
          } else if (error.response.data.message) {
            this.error = error.response.data.message;
          } else if (error.response.data.detail) {
            this.error = error.response.data.detail;
          } else {
            this.error = 'Failed to fetch temp student list';
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
     * Get student by ID (searches in the fetched list)
     * @param {number} id - The student enrollment ID (not temp_student_id)
     * @returns {Object|undefined} The student data
     */
    getStudentById(id) {
      return this.students.find(s => s.id === id);
    },

    /**
     * Get student by temp_student_id
     * @param {number} tempStudentId - The temp_student_id
     * @returns {Object|undefined} The student data
     */
    getStudentByTempId(tempStudentId) {
      return this.students.find(s => s.temp_student_id === tempStudentId);
    },

    /**
     * Update a student in the local list
     * @param {number} id - The student enrollment ID
     * @param {Object} updatedData - The updated student data
     */
    updateStudentInList(id, updatedData) {
      const index = this.students.findIndex(s => s.id === id);
      if (index !== -1) {
        this.students[index] = { ...this.students[index], ...updatedData };
        console.log('✏️ Updated student in list:', id);
      }
    },

    /**
     * Remove a student from the local list
     * @param {number} id - The student enrollment ID
     */
    removeStudentFromList(id) {
      const index = this.students.findIndex(s => s.id === id);
      if (index !== -1) {
        this.students.splice(index, 1);
        console.log('➖ Removed student from list:', id);
      }
    },

    /**
     * Reset the store state
     */
    resetState() {
      this.students = [];
      this.loading = false;
      this.error = null;
    },
  },
});
