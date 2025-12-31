import api from "@/stores/apis/axios";

export async function getTeacherProfile(teacherId) {
  try {
    const response = teacherId
      ? await api.get(`/auth/get_detail_user/${teacherId}`) // path param
      : await api.get("/auth/get_detail_user"); // token-based

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching teacher profile:", error);
    throw error;
  }
}
