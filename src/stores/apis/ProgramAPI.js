import api from './axios'; // your axios instance

/**
 * Program API Service
 */
export default {
  /**
   * Get all programs
   * @returns {Promise<Array>}
   */
  async getAllPrograms() {
    const { data } = await api.get('/managements/get_all_program');
    return data?.programs || [];
  },

  /**
   * Get programs by department ID
   * @param {string|number} departmentId
   */
  async getProgramsByDepartment(departmentId) {
    const { data } = await api.get('/managements/get_program_by', {
      params: { department_id: departmentId },
    });
    return data?.programs || [];
  },

  /**
   * Search programs with pagination
   * @param {string} searchTerm
   */
  async searchPrograms(searchTerm) {
    const { data } = await api.get('/managements/search_paginate_program', {
      params: { search: searchTerm },
    });
    return data?.programs?.data || [];
  },

  /**
   * Create a new program
   * @param {Object} programData
   */
  async createProgram(programData) {
    const { data } = await api.post('/managements/create_program', programData);
    return data;
  },

  /**
   * Update a program
   * @param {number|string} programId
   * @param {Object} programData
   */
  async updateProgram(programId, programData) {
    const { data } = await api.put(`/managements/update_program/${programId}`, programData);
    return data;
  },

  /**
   * Delete a program
   * @param {number|string} programId
   */
  async deleteProgram(programId) {
    const { data } = await api.delete(`/managements/remove_program/${programId}`);
    return data;
  },

  /**
   * Clone a program
   * @param {number|string} programId
   */
  async cloneProgram(programId) {
    const { data } = await api.post('/managements/clone_program', { program_id: programId });
    return data;
  },
};
