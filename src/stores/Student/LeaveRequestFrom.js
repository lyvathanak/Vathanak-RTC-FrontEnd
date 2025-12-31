// stores/Student/LeaveRequestFrom.js
import api from "@/stores/apis/axios";

export async function submitStudentLeaveRequestService(payload) {
  const response = await api.post(
    "/request/create_leave_request_student",
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

// export async function getStudentLeaveRequestsService() {
//   const response = await api.get("/request/get_leave_request_student");
//   return response.data.requests;
// }

export async function getStudentLeaveRequestsService(params = {}) {
  try {
    const response = await api.get("/request/get_leave_request_student", {
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
