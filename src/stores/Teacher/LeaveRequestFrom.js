import api from "@/stores/apis/axios";

/**
 * Service to submit a leave request (student version)
 */
export async function submitLeaveRequestService(formData) {
  try {
    const response = await api.post("/request/create_leave_request", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("❌ API error submitting student leave request:", error);
    throw error;
  }
}

/**
 * Service to submit a leave request (teacher version)
 */
export async function submitTeacherLeaveRequestService(formData) {
  try {
    const response = await api.post(
      "/request/create_leave_request_teacher",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ API error submitting teacher leave request:", error);
    throw error;
  }
}

/**
 * Service to fetch leave requests for a student
 */
export async function getLeaveRequestsService() {
  try {
    const response = await api.get("/request/get_leave_request");
    return response.data.requests || []; // Always return an array
  } catch (error) {
    console.error("❌ API error fetching student leave requests:", error);
    throw error;
  }
}

/**
 * Service to fetch leave requests for the authenticated teacher
 */
export async function getAllLeaveRequestsByTeacher(params = {}) {
  try {
    const response = await api.get("/request/get_leave_request_teacher", {
      params: {
        status: params.status || null,
        start_date: params.start_date || null,
        end_date: params.end_date || null,
      },
    });

    const requestsData = response.data?.requests || []; // plain array

    return {
      success: true,
      requests: requestsData,
    };
  } catch (error) {
    console.error("❌ Failed to fetch teacher leave requests:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to fetch teacher leave requests",
      requests: [],
    };
  }
}
