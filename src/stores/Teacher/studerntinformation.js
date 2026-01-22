import api from "@/stores/apis/axios.js";

/**
 * Teacher / Staff only
 * Get students by teacher's department
 * Backend: GET /users/by_teacher
 */
export async function getStudentsByTeacherDepartment(params = {}) {
  try {
    const response = await api.get("/users/by_teacher", {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 14,
      },
    });

    const paginated = response.data.students;
    const departmentInfo = response.data.department || {};

    // Safely extract data array: paginated?.data (if Laravel resource) or paginated (if simple array)
    const rawData = Array.isArray(paginated) ? paginated : (paginated?.data || []);

    // Normalize data → same shape used by StudentTable
    const students = rawData.map((student) => {
      const userDetail = student.userDetail || student.user_detail || {};

      return {
        user_id: student.id,
        id: student.id,

        id_card: userDetail.id_card || "",
        latin_name: userDetail.latin_name || student.name || "",
        khmer_name: userDetail.khmer_name || "",
        gender: userDetail.gender || "",
        date_of_birth: userDetail.date_of_birth || "",
        phone_number: userDetail.phone_number || "",
        email: student.email || "",

        department_id:
          userDetail.department_id ?? student.department_id ?? null,
        sub_department_id:
          userDetail.sub_department_id ?? student.sub_department_id ?? null,
        program_id: userDetail.program_id ?? student.program_id ?? null,

        academic_year: userDetail.academic_year || "",
        grade: userDetail.grade || "",

        groups: student.groups || [],
        roles: student.roles || [],

        // Add department name for easy display
        department_name: departmentInfo.name || "",

        user_detail: userDetail,
      };
    });

    return {
      success: true,
      data: students,
      department: departmentInfo,
      // Safely access pagination or default to basic values
      total: paginated?.total || students.length,
      pagination: {
        current_page: paginated?.current_page || 1,
        last_page: paginated?.last_page || 1,
        per_page: paginated?.per_page || params.per_page || 15,
      },
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.response?.data || error.message,
      message: "Failed to load students for teacher",
    };
  }
}