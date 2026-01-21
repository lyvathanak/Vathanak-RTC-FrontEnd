import api from './axios';

export default {
  async getAllSemesters() {
    try {
      const response = await api.get('managements/get_all_semesters');
      return response.data || { semesters: [] }; // return object with semesters
    } catch (error) {
      console.error('Error fetching semesters:', error);
      return { semesters: [] };
    }
  },

  async getSemestersByProgram(programId) {
    try {
      const response = await api.get(`managements/get_semesters_by_program/${programId}`);
      return response.data || { semesters: [] }; // return object with semesters
    } catch (error) {
      console.error('Error fetching semesters by program:', error);
      return { semesters: [] };
    }
  },

  async getSubjectsBySemester(semester_id) {
    try {
      const response = await api.get(`managements/get_all_subject_in_semester/${semester_id}`);
      return response.data || { subjects: [] };
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return { subjects: [] };
    }
  },

  async importMoodleScores(formData) {
    return api.post('managements/import_moodle_scores', formData);
  },

  async getAllSubjectScoresByUserProgram(userProgramId) {
    try {
      // use the correct route
      const response = await api.get(`managements/user-programs/${userProgramId}/scores`);
      return response.data || { subjects: [] }; // always return object with subjects
    } catch (error) {
      console.error('Error fetching subject scores:', error);
      return { subjects: [] };
    }
  }

};
