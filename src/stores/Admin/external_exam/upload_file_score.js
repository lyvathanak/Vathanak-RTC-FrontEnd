import { defineStore } from 'pinia';
import api from '@/stores/apis/axios';

export const useUploadFileScoreStore = defineStore('uploadFileScore', {
  state: () => ({
    uploading: false,
    uploadProgress: 0,
    error: null,
    lastUploadResult: null,
    uploadedFiles: [],
    loading: false,
    pagination: {
      currentPage: 1,
      lastPage: 1,
      from: 0,
      total: 0
    }
  }),

  getters: {
    /**
     * Check if upload is in progress
     */
    isUploading: (state) => state.uploading,

    /**
     * Get upload progress percentage
     */
    progressPercentage: (state) => state.uploadProgress,

    /**
     * Get last upload result
     */
    getLastUploadResult: (state) => state.lastUploadResult,

    /**
     * Get list of uploaded files
     */
    getUploadedFiles: (state) => state.uploadedFiles,

    /**
     * Check if data is loading
     */
    isLoading: (state) => state.loading,

    /**
     * Get pagination info
     */
    getPagination: (state) => state.pagination,
  },

  actions: {
    /**
     * Upload Excel file with student scores
     * @param {File} file - The Excel file to upload
     * @param {String|Number} academicYear - The academic year (e.g., 2026 or "2025-2026")
     * @returns {Promise<Object>} The upload response data
     */
    async uploadScoreFile(file, academicYear) {
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
      ];

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('Invalid file type. Please upload an Excel file (.xlsx or .xls)');
      }

      this.uploading = true;
      this.uploadProgress = 0;
      this.error = null;

      try {
        console.log(`📤 Uploading score file: ${file.name}`);

        // Format academic year properly
        let formattedAcademicYear;
        if (academicYear && typeof academicYear === 'string' && academicYear.includes('-')) {
          formattedAcademicYear = academicYear;
        } else {
          const year = academicYear || new Date().getFullYear();
          formattedAcademicYear = `${year - 1}-${year}`;
        }

        console.log(`📅 Academic year: ${formattedAcademicYear}`);

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('academic_year', formattedAcademicYear);

        // Upload file with progress tracking
        const response = await api.post('/external_exam/upload_score', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`⬆️ Upload progress: ${this.uploadProgress}%`);
            }
          },
        });

        console.log('✅ File uploaded successfully:', response.data);

        // Extract actual data from response (handle different response structures)
        const uploadData = response.data.data || response.data;
        
        // Store the result
        this.lastUploadResult = {
          id: uploadData.id,
          file: uploadData.file,
          academic_year: uploadData.academic_year || formattedAcademicYear,
          created_at: uploadData.created_at,
          updated_at: uploadData.updated_at,
          students: uploadData.students || [],
          uploadedAt: new Date().toISOString(),
        };

        this.uploading = false;
        this.uploadProgress = 100;

        // Return the extracted data with consistent structure
        return {
          id: uploadData.id,
          file: uploadData.file,
          academic_year: uploadData.academic_year || formattedAcademicYear,
          students: uploadData.students || [],
          ...uploadData
        };
      } catch (error) {
        console.error('❌ Error uploading score file:', error);

        // Extract error message
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            this.error = error.response.data;
          } else if (error.response.data.message) {
            this.error = error.response.data.message;
          } else if (error.response.data.detail) {
            this.error = error.response.data.detail;
          } else if (error.response.data.error) {
            this.error = error.response.data.error;
          } else {
            this.error = 'Failed to upload score file';
          }
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'An unexpected error occurred while uploading';
        }

        this.uploading = false;
        this.uploadProgress = 0;
        throw error;
      }
    },

    /**
     * Reset upload state
     */
    resetUploadState() {
      this.uploading = false;
      this.uploadProgress = 0;
      this.error = null;
    },

    /**
     * Clear last upload result
     */
    clearLastResult() {
      this.lastUploadResult = null;
    },

    /**
     * Get existing score file (most recent upload)
     * @returns {Promise<Object>} The existing file data with parsed students
     */
    async getExistingScoreFile() {
      this.loading = true;
      this.error = null;

      try {
        console.log('📥 Fetching existing score file...');

        const fileResponse = await api.get('/external_exam/scores');
        console.log('✅ File metadata fetched:', fileResponse.data);

        // ✅ Ensure array & take latest file
        if (Array.isArray(fileResponse.data) && fileResponse.data.length > 0) {
          const latestFile = fileResponse.data[0];

          const fileId = latestFile.id;
          const filename = latestFile.file;

          console.log(`📥 Fetching student data for file ID: ${fileId}`);

          const studentResponse = await api.get(`/external_exam/scores/${fileId}`);
          console.log('✅ Student data fetched:', studentResponse.data);

          // ✅ Normalize student list
          let students = [];
          if (Array.isArray(studentResponse.data)) {
            students = studentResponse.data;
          } else if (studentResponse.data?.students) {
            students = studentResponse.data.students;
          } else if (studentResponse.data?.data) {
            students = Array.isArray(studentResponse.data.data)
              ? studentResponse.data.data
              : [];
          }

          console.log(`✅ Extracted ${students.length} students`);

          this.loading = false;
          return {
            id: fileId,
            filename: filename || 'scores.xlsx',
            data: students,
            academic_year: latestFile.academic_year,
            created_at: latestFile.created_at
          };
        }

        console.log('ℹ️ No file found');
        this.loading = false;
        return null;

      } catch (error) {
        console.error('❌ No existing score file found:', error);
        this.loading = false;
        return null;
      }
    },


    /**
     * Fetch list of uploaded score files
     * @param {number} page - Page number for pagination
     * @returns {Promise<Object>} The response data with uploaded files
     */
    async fetchUploadedScores() {
      this.loading = true;
      this.error = null;

      try {
        console.log('📥 Fetching uploaded scores');

        const response = await api.get('/external_exam/scores');
        console.log('✅ Uploaded scores fetched:', response.data);

        // ✅ Direct array
        this.uploadedFiles = Array.isArray(response.data)
          ? response.data
          : [];

        this.pagination = null; // or remove pagination logic entirely

        this.loading = false;
        return response.data;

      } catch (error) {
        console.error('❌ Error fetching uploaded scores:', error);

        this.error =
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch uploaded scores';

        this.loading = false;
        throw error;
      }
    },


    /**
     * Reset entire store state
     */
    resetState() {
      this.uploading = false;
      this.uploadProgress = 0;
      this.error = null;
      this.lastUploadResult = null;
      this.uploadedFiles = [];
      this.loading = false;
      this.pagination = {
        currentPage: 1,
        lastPage: 1,
        from: 0,
        total: 0
      };
    },
  },
});
