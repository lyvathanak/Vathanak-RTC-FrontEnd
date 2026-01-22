import api from "@/stores/apis/axios";

// ✅ Fetch academic info
export async function getAcademicInfo() {
  try {
    const response = await api.get("/users/student_academic_history");
    // Return the full response data so the component can inspect structure
    return response.data;
  } catch (error) {
    console.error("Error fetching academic info:", error);
    throw error;
  }
}