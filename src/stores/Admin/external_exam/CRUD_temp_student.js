import { defineStore } from 'pinia';
import api from '@/stores/apis/axios';

export const useTempStudentStore = defineStore('tempStudent', {
  state: () => ({
    tempStudents: [],
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
    lastAddedStudent: null,
    updatedStudent: null,
    successMessage: null,
    success: false,
  }),

  getters: {
    /**
     * Get all temp students as array
     */
    allTempStudents: (state) => state.tempStudents,

    /**
     * Get temp student by ID
     */
    getTempStudentById: (state) => (id) => {
      return state.tempStudents.find(student => student.id === id);
    },

    /**
     * Check if there are any temp students
     */
    hasTempStudents: (state) => state.tempStudents.length > 0,

    /**
     * Check if currently editing
     */
    isEditing: (state) => state.loading,

    /**
     * Get the last updated student
     */
    getUpdatedStudent: (state) => state.updatedStudent,
  },

  actions: {
    /**
     * Fetch temp students list with optional pagination
     * @param {number} [page=1] - Page number for pagination
     * @returns {Promise<Object>} The response data with pagination info
     */
    async fetchTempStudents(page = 1) {
      this.loading = true;
      this.error = null;

      try {
        console.log(`📋 Fetching temp students (page ${page})...`);

        const response = await api.get('/external_exam/get_temp_students', {
          params: { page }
        });

        console.log('✅ Temp students fetched successfully:', response.data);

        // Update state with response data
        this.tempStudents = response.data.data || [];
        this.currentPage = response.data.current_page || 1;
        this.totalPages = response.data.total_pages || 1;
        this.loading = false;

        return response.data;
      } catch (error) {
        console.error('❌ Error fetching temp students:', error);

        // Extract error message
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            this.error = error.response.data;
          } else if (error.response.data.message) {
            this.error = error.response.data.message;
          } else if (error.response.data.detail) {
            this.error = error.response.data.detail;
          } else {
            this.error = 'Failed to fetch temporary students';
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
     * Refresh the current page
     */
    async refresh() {
      return this.fetchTempStudents(this.currentPage);
    },

    /**
     * Fetch a single temp student by ID
     * @param {number} id - The temp student ID
     * @returns {Promise<Object>} The temp student data
     */
    async fetchTempStudentById(id) {
      this.loading = true;
      this.error = null;

      try {
        console.log(`📋 Fetching temp student with ID ${id}...`);

        const response = await api.get(`/external_exam/get_temp_student/${id}`);

        console.log('✅ Temp student fetched successfully:', response.data);

        // Extract student data and profile picture URL from new backend structure
        const studentData = response.data.data;
        const profilePictureUrl = response.data.profile_picture_url;

        // Merge profile picture URL into student object for easier access
        const studentWithImage = {
          ...studentData,
          profile_picture_url: profilePictureUrl
        };

        this.loading = false;
        return studentWithImage;
      } catch (error) {
        console.error('❌ Error fetching temp student:', error);

        // Extract error message
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            this.error = error.response.data;
          } else if (error.response.data.message) {
            this.error = error.response.data.message;
          } else if (error.response.data.detail) {
            this.error = error.response.data.detail;
          } else {
            this.error = 'Failed to fetch temporary student';
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
     * Add a new temporary student
     * @param {Object} studentData - The student data from the modal
     * @param {string} studentData.academic_year - Academic year (e.g., "2025-2026")
     * @param {string} studentData.khmer_name - Khmer name
     * @param {string} studentData.latin_name - Latin name
     * @param {string} studentData.gender - Gender (Male/Female)
     * @param {string} studentData.date_of_birth - Date of birth (YYYY-MM-DD)
     * @param {string} studentData.phone_number - Phone number
     * @param {string} studentData.origin - Origin/hometown
     * @param {number} studentData.department_id - Department ID
     * @param {number} studentData.program_id - Program ID
     * @param {File} [studentData.file] - Profile picture file (optional)
     * @returns {Promise<Object>} The created student data
     */
    async addTempStudent(studentData) {
      this.loading = true;
      this.error = null;
      this.success = false;

      try {
        console.log('📤 Adding temp student:', studentData);

        // Prepare the request body with correct field names for backend
        const requestBody = {
          academic_year: studentData.academic_year,
          khmer_name: studentData.khmer_name,
          latin_name: studentData.latin_name,
          gender: studentData.gender,
          date_of_birth: studentData.date_of_birth,
          phone_number: studentData.phone_number,
          origin: studentData.origin,
          department_id: studentData.department_id,
          program_id: studentData.program_id,
        };

        // If there's a profile picture file, use FormData
        let requestData;
        let headers = {};

        if (studentData.file) {
          requestData = new FormData();
          requestData.append('academic_year', requestBody.academic_year);
          requestData.append('khmer_name', requestBody.khmer_name);
          requestData.append('latin_name', requestBody.latin_name);
          requestData.append('gender', requestBody.gender);
          requestData.append('date_of_birth', requestBody.date_of_birth);
          requestData.append('phone_number', requestBody.phone_number);
          requestData.append('origin', requestBody.origin);
          requestData.append('department_id', requestBody.department_id);
          requestData.append('program_id', requestBody.program_id);
          requestData.append('profile_picture', studentData.file);

          headers['Content-Type'] = 'multipart/form-data';
          console.log('📸 Uploading with profile picture');
        } else {
          requestData = requestBody;
          console.log('📝 Uploading without profile picture');
        }

        const response = await api.post('/external_exam/add_temp_student', requestData, { headers });

        console.log('✅ Temp student added successfully:', response.data);

        this.lastAddedStudent = response.data;
        this.success = true;
        this.loading = false;

        // Add to local list
        this.addTempStudentToList(response.data);

        return response.data;
      } catch (error) {
        console.error('❌ Error adding temp student:', error);
        this.error = this.extractErrorMessage(error, 'Failed to add temporary student');
        this.loading = false;
        this.success = false;
        throw error;
      }
    },

    /**
     * Edit an existing temp student
     * @param {number} studentId - The ID of the student to edit
     * @param {Object} studentData - The updated student data
     * @param {string} studentData.khmer_name - Student's name in Khmer
     * @param {string} studentData.latin_name - Student's name in Latin
     * @param {string} studentData.gender - Student's gender (male/female)
     * @param {string} studentData.date_of_birth - Date of birth (YYYY-MM-DD)
     * @param {string} [studentData.phone_number] - Phone number (optional)
     * @param {string} [studentData.origin] - Origin/hometown (optional)
     * @param {number} studentData.department_id - Department ID
     * @param {number} studentData.program_id - Program ID
     * @param {File} [studentData.file] - Profile picture file (optional)
     * @param {string|null} [studentData.profile_picture] - Existing profile picture path or null to remove (optional)
     * @returns {Promise<Object>} The updated student data
     */
    async editTempStudent(studentId, studentData) {
      this.loading = true;
      this.error = null;

      try {
        console.log(`✏️ Editing temp student ID ${studentId}...`, studentData);

        // Prepare request data - use FormData if there's a file, otherwise JSON
        let requestData;
        let headers = {};
        let response;

        if (studentData.file) {
          // Use FormData for file upload with POST + _method=PUT
          requestData = new FormData();
          requestData.append('_method', 'PUT'); // 👈 Laravel workaround for multipart/form-data
          requestData.append('khmer_name', studentData.khmer_name);
          requestData.append('latin_name', studentData.latin_name);
          requestData.append('gender', studentData.gender);
          requestData.append('date_of_birth', studentData.date_of_birth);
          requestData.append('phone_number', studentData.phone_number || '');
          requestData.append('origin', studentData.origin || '');
          requestData.append('department_id', studentData.department_id);
          requestData.append('program_id', studentData.program_id);
          requestData.append('profile_picture', studentData.file);

          headers['Content-Type'] = 'multipart/form-data';
          console.log('📤 Using FormData with POST + _method=PUT for file upload');
          
          // Use POST with _method=PUT for FormData
          response = await api.post(`/external_exam/temp-students/${studentId}`, requestData, { headers });
        } else {
          // Use JSON for regular update with PUT
          requestData = {
            khmer_name: studentData.khmer_name,
            latin_name: studentData.latin_name,
            gender: studentData.gender,
            date_of_birth: studentData.date_of_birth,
            phone_number: studentData.phone_number,
            origin: studentData.origin,
            department_id: studentData.department_id,
            program_id: studentData.program_id,
          };

          // Include profile_picture if explicitly provided (to preserve or remove)
          if (studentData.profile_picture !== undefined) {
            requestData.profile_picture = studentData.profile_picture;
          }

          console.log('📤 Using JSON with PUT for update');
          
          // Use PUT for JSON data
          response = await api.put(`/external_exam/temp-students/${studentId}`, requestData, { headers });
        }

        console.log('✅ Temp student updated successfully:', response.data);

        // Update state with the updated student
        this.updatedStudent = response.data.data || response.data;
        this.loading = false;

        // Update in local list
        this.updateTempStudentInList(studentId, this.updatedStudent);

        return response.data;
      } catch (error) {
        console.error('❌ Error editing temp student:', error);
        this.error = this.extractErrorMessage(error, 'Failed to update temporary student');
        this.loading = false;
        throw error;
      }
    },

    /**
     * Delete a temp student by ID
     * @param {number} studentId - The ID of the temp student to delete
     * @returns {Promise<Object>} The response data with success message
     */
    async deleteTempStudent(studentId) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      try {
        console.log(`🗑️ Deleting temp student with ID ${studentId}...`);

        const response = await api.delete(`/external_exam/delete_temp_student/${studentId}`);

        console.log('✅ Temp student deleted successfully:', response.data);

        this.successMessage = response.data.message || 'Temp student deleted successfully';
        this.loading = false;

        // Remove from local list
        this.removeTempStudentFromList(studentId);

        return response.data;
      } catch (error) {
        console.error('❌ Error deleting temp student:', error);
        this.error = this.extractErrorMessage(error, 'Failed to delete temporary student');
        this.loading = false;
        throw error;
      }
    },

    /**
     * Add a temp student to the local state (after successful creation)
     * @param {Object} student - The new temp student data
     */
    addTempStudentToList(student) {
      this.tempStudents.unshift(student); // Add to beginning of array
      console.log('➕ Added temp student to list:', student);
    },

    /**
     * Remove a temp student from local state
     * @param {number} studentId - The ID of the student to remove
     */
    removeTempStudentFromList(studentId) {
      const index = this.tempStudents.findIndex(s => s.id === studentId);
      if (index !== -1) {
        this.tempStudents.splice(index, 1);
        console.log('➖ Removed temp student from list:', studentId);
      }
    },

    /**
     * Update a temp student in local state
     * @param {number} studentId - The ID of the student to update
     * @param {Object} updatedData - The updated student data
     */
    updateTempStudentInList(studentId, updatedData) {
      const index = this.tempStudents.findIndex(s => s.id === studentId);
      if (index !== -1) {
        this.tempStudents[index] = { ...this.tempStudents[index], ...updatedData };
        console.log('✏️ Updated temp student in list:', studentId);
      }
    },

    /**
     * Extract error message from error response
     * @param {Error} error - The error object
     * @param {string} defaultMessage - Default error message
     * @returns {string} The extracted error message
     */
    extractErrorMessage(error, defaultMessage) {
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          return error.response.data;
        } else if (error.response.data.message) {
          return error.response.data.message;
        } else if (error.response.data.detail) {
          return error.response.data.detail;
        }
      } else if (error.message) {
        return error.message;
      }
      return defaultMessage || 'An unexpected error occurred';
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null;
    },

    /**
     * Reset the store state
     */
    resetState() {
      this.tempStudents = [];
      this.currentPage = 1;
      this.totalPages = 1;
      this.loading = false;
      this.error = null;
      this.lastAddedStudent = null;
      this.updatedStudent = null;
      this.successMessage = null;
      this.success = false;
    },
  },
});
