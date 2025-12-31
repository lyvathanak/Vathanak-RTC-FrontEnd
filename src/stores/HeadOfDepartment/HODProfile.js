import api from "@/stores/apis/axios";

export async function getHODProfile(hodId) {
  try {
    const response = hodId
      ? await api.get(`/auth/get_detail_user/${hodId}`) // path param
      : await api.get("/auth/get_detail_user"); // token-based

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching hod profile:", error);
    throw error;
  }
}
