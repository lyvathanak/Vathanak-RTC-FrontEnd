import api from "@/stores/apis/axios.js";

export async function getStudentLearnWithTeacher(params = {}) {
  try {
    const response = await api.get("/users/get_student_of_teacher", {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 14,
      },
    });

    const rows = response.data?.data ?? [];
    const total = response.data?.total ?? rows.length;

    const students = rows.map((up) => {
      const user = up.user ?? {};
      const userDetail = up.user_detail ?? user.user_detail ?? {};
      const program = up.program ?? {};
      const department = program.department ?? {};

      // ✅ Backend now sends section (from sub_department) + section_name
      // Fallbacks kept to avoid breaking old responses
      const section =
        up.section ??
        (up.section_name
          ? {
              id:
                up.sub_department_id ??
                userDetail.sub_department_id ??
                program.sub_department_id ??
                null,
              name: up.section_name,
            }
          : null) ??
        (Array.isArray(user.groups) && user.groups.length > 0
          ? {
              id: user.groups[0]?.id ?? null,
              name: user.groups[0]?.name ?? "",
              semester: user.groups[0]?.semester ?? null,
            }
          : null);

      return {
        id: user.id ?? up.user_id ?? userDetail.user_id ?? null,
        user_id: user.id ?? up.user_id ?? userDetail.user_id ?? null,

        id_card: userDetail.id_card ?? "",
        latin_name: userDetail.latin_name ?? user.name ?? "",
        khmer_name: userDetail.khmer_name ?? "",
        gender: userDetail.gender ?? "",
        date_of_birth: userDetail.date_of_birth ?? "",
        phone_number: userDetail.phone_number ?? "",
        email: user.email ?? "",

        department_id:
          userDetail.department_id ?? program.department_id ?? null,
        sub_department_id:
          userDetail.sub_department_id ?? program.sub_department_id ?? null,
        program_id: up.program_id ?? program.id ?? null,

        academic_year: program.academic_year ?? "",
        grade: userDetail.grade ?? "",

        // ✅ Names (API first)
        department_name: up.department_name ?? department.department_name ?? "",
        program_name: up.program_name ?? program.program_name ?? "",

        // ✅ Section name (sub_department as section)
        section_name: up.section_name ?? section?.name ?? "",

        section,
        groups: Array.isArray(user.groups) ? user.groups : [],

        user_detail: userDetail,
        _user_program: up,
      };
    });

    return {
      success: true,
      data: students,
      total,
      message: response.data?.message ?? "",
    };
  } catch (error) {
    const status = error?.response?.status;
    const payload = error?.response?.data;

    // keep same behavior
    if (status === 404) {
      return { success: true, data: [], total: 0, message: payload?.message };
    }

    return {
      success: false,
      data: [],
      total: 0,
      message: payload?.message || "Failed to load students for teacher",
      error: payload || error?.message,
    };
  }
}