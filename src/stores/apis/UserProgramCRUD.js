import api from "@/stores/apis/axios";

export const UserProgramCRUD = {

  /* ================= GET ALL ================= */
  async getAllUserPrograms() {
    try {
      const response = await api.get("/managements/user-programs");

      return {
        success: true,
        data: response.data?.data || [],
      };
    } catch (error) {
      console.error("Error fetching all user programs:", error);
      return {
        success: false,
        data: [],
        error,
      };
    }
  },

  /* ================= GET ALL PROGRAMS ================= */
  async getAllPrograms() {
    try {
      const response = await api.get("/managements/programs");
      return { success: true, data: response.data?.data || [] };
    } catch (error) {
      console.error("Error fetching all programs:", error);
      return { success: false, data: [], error };
    }
  },

  /* ================= GET ALL DEPARTMENTS ================= */
  async getAllDepartments() {
    try {
      const response = await api.get("/managements/departments");
      return { success: true, data: response.data?.data || [] };
    } catch (error) {
      console.error("Error fetching all departments:", error);
      return { success: false, data: [], error };
    }
  },

  /* ================= GET ALL GROUPS ================= */
  async getAllGroups() {
    try {
      const response = await api.get("/managements/groups");
      return { success: true, data: response.data?.data || [] };
    } catch (error) {
      console.error("Error fetching all groups:", error);
      return { success: false, data: [], error };
    }
  },

  /* ================= GET ALL DEGREES ================= */
  async getAllDegrees() {
    try {
      const response = await api.get("/managements/degrees");
      return { success: true, data: response.data?.data || [] };
    } catch (error) {
      console.error("Error fetching all degrees:", error);
      return { success: false, data: [], error };
    }
  },

  /* ================= GET BY USER ================= */
  async getUserPrograms(userId) {
    try {
      const response = await api.get(`/managements/user-programs/${userId}`);

      return {
        success: true,
        data: response.data?.data || [],
      };
    } catch (error) {
      console.error("Error fetching user programs:", error);
      return {
        success: false,
        data: [],
        error,
      };
    }
  },

  /* ================= ADD SINGLE STUDENT ================= */
  async addStudentToProgram(user_id, program_id, generation_id = null) {
    try {
      const payload = { user_id, program_id };

      if (generation_id !== null) {
        payload.generation_id = generation_id;
      }

      const response = await api.post(
        "/managements/add_student_to_program",
        payload
      );

      return {
        success: response.status >= 200 && response.status < 300,
        data: response.data || {},
      };
    } catch (error) {
      console.error("Error adding student to program:", error);
      return {
        success: false,
        error,
      };
    }
  },

  /* ================= PROMOTE MULTIPLE ================= */
  async promoteMultipleStudents({
    user_ids,
    program_id,
    generation_id = null,
    year = null,
  }) {
    try {
      const payload = {
        user_ids,
        program_id,
      };

      if (generation_id !== null) payload.generation_id = generation_id;
      if (year !== null) payload.year = year;

      const response = await api.post(
        "/managements/promote-multiple",
        payload
      );

      return {
        success: response.status >= 200 && response.status < 300, // works for 201
        data: response.data || {},
      };
    } catch (error) {
      console.error("Error promoting multiple students:", error);
      return {
        success: false,
        error,
      };
    }
  },

  // Get unique years
  async getYears() {
    const res = await this.getAllUserPrograms();
    if (!res.success) return { success: false, data: [] };

    const years = [...new Set(
      res.data.map(up => up.year).filter(Boolean)
    )];

    return { success: true, data: years };
  },

  // Programs by year
  async getProgramsByYear(year) {
    const res = await this.getAllUserPrograms();
    if (!res.success) return { success: false, data: [] };

    const programs = res.data
      .filter(up => up.year === year)
      .map(up => up.program);

    const unique = Object.values(
      programs.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {})
    );

    return { success: true, data: unique };
  },

  // Generations by year + program
  async getGenerationsByYearProgram(year, programId) {
    const res = await this.getAllUserPrograms();
    if (!res.success) return { success: false, data: [] };

    const gens = res.data
      .filter(up =>
        up.year === year &&
        up.program_id === programId &&
        up.generation
      )
      .map(up => up.generation);

    const unique = Object.values(
      gens.reduce((acc, g) => {
        acc[g.id] = g;
        return acc;
      }, {})
    );

    return { success: true, data: unique };
  },

  /* ================= GET SEMESTERS BY PROGRAM ================= */
  async getSemestersByProgram(program_id) {
    console.log('Fetching semesters for program_id:', program_id);
    try {
      const response = await api.get(`managements/get_semesters_by_program/${program_id}`);
      console.log('API response:', response.data);
      return { success: true, data: response.data?.data || [] };
    } catch (error) {
      console.error("Error fetching semesters:", error);
      return { success: false, data: [], error };
    }
  }


};
