//src\stores\apis\missionApi.js
import api from "./axios";

/**
 * Mission API Service
 * Handles all mission-related API calls
 */
export default {
  /**
   * Get all missions with optional filtering
   */
  async getAllMissions(params = {}) {
    try {
      const response = await api.get("missions/get_all_missions", { params });
      return response.data;
    } catch (error) {
      console.error("Mission API - Get all missions error:", error);
      return this.handleError(error, "Failed to fetch missions");
    }
  },

  /**
   * Get mission details by ID
   */
  async getMissionDetails(missionId) {
    try {
      const response = await api.get(
        `missions/get_mission_detail/${missionId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Mission API - Get mission details error:", error);
      return this.handleError(error, "Failed to fetch mission details");
    }
  },

  /**
   * Create a new mission
   */
  // missionApi.js
  async createMission(missionData) {
    try {
      const response = await api.post("missions/create_mission", missionData);
      return response.data;
    } catch (error) {
      console.error(
        "Mission API - Create mission error:",
        error?.response?.data || error,
      );
      throw error; // ✅ re-throw so handleSubmit catch runs
    }
  },

  /**
   * Update an existing mission
   */
  async updateMission(missionId, missionData) {
    try {
      const response = await api.put(
        `missions/update_mission/${missionId}`,
        missionData,
      );
      return response.data;
    } catch (error) {
      console.error("Mission API - Update mission error:", error);
      return this.handleError(error, "Failed to update mission");
    }
  },

  /**
   * Cancel a mission
   */
  async cancelMission(missionId) {
    try {
      const response = await api.put(`missions/cancel_mission/${missionId}`);
      return response.data;
    } catch (error) {
      console.error("Mission API - Cancel mission error:", error);
      return this.handleError(error, "Failed to cancel mission");
    }
  },

  /**
   * Mark a mission as complete
   */
  async completeMission(missionId) {
    try {
      const response = await api.put(`missions/complete_mission/${missionId}`);
      return response.data;
    } catch (error) {
      console.error("Mission API - Complete mission error:", error);
      return this.handleError(error, "Failed to complete mission");
    }
  },

  /**
   * Get available teachers for mission assignment
   * Uses fallback strategies if primary endpoint fails
   */
  async getAvailableTeachers(search = "") {
    try {
      console.log("🔍 Fetching teachers for mission assignment...");

      // Try primary endpoint first
      const response = await api.get("/users/get_all_users", {
        params: {
          role: "staff",
          search: search.trim() || undefined,
        },
      });

      const teachers = this.extractTeachers(response.data);

      if (teachers.length === 0) {
        console.log("No teachers found, trying alternative endpoint...");
        return await this.tryAlternativeTeacherEndpoint(search);
      }

      const transformedTeachers = this.transformTeachers(teachers);

      console.log(`✅ Found ${transformedTeachers.length} teachers`);
      return this.successResponse(transformedTeachers);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      return this.errorResponse(error, "Failed to fetch teachers");
    }
  },

  /**
   * Helper Methods
   */

  // Extract teachers from various response structures
  extractTeachers(data) {
    if (!data) return [];

    // Common response structures
    const structures = [
      { path: ["users", "data"] },
      { path: ["data"] },
      { path: ["users"] },
      { path: ["teachers"] },
    ];

    for (const { path } of structures) {
      let result = data;
      for (const key of path) {
        if (result && result[key] !== undefined) {
          result = result[key];
        } else {
          result = null;
          break;
        }
      }
      if (Array.isArray(result) && result.length > 0) {
        console.log(`✅ Found teachers in structure: ${path.join(".")}`);
        return result;
      }
    }

    // Check if data itself is an array
    if (Array.isArray(data)) {
      return data;
    }

    return [];
  },

  // Transform teacher data to consistent format
  transformTeachers(teachers) {
    return teachers.map((teacher) => {
      const userDetail = teacher.user_detail || {};

      return {
        id: teacher.id || teacher.user_id,
        user_id: teacher.user_id || teacher.id,
        name:
          teacher.name ||
          userDetail.name ||
          userDetail.latin_name ||
          userDetail.full_name ||
          "Unknown Teacher",
        email: teacher.email || "",
        phone:
          userDetail.phone_number ||
          teacher.phone_number ||
          teacher.phone ||
          "",
        department:
          userDetail.department || teacher.department || "Unknown Department",
        position: userDetail.position || teacher.position || "Teacher",
      };
    });
  },

  // Try alternative teacher endpoints
  async tryAlternativeTeacherEndpoint(search) {
    try {
      const response = await api.get("users/teachers", {
        params: { search: search.trim() || undefined },
      });

      const teachers = this.extractTeachers(response.data);
      const transformedTeachers = this.transformTeachers(teachers);

      return this.successResponse(transformedTeachers);
    } catch (fallbackError) {
      console.error("Alternative endpoint also failed:", fallbackError);
      return this.errorResponse(fallbackError, "All teacher endpoints failed");
    }
  },

  // Standard success response
  successResponse(data, message = "") {
    return {
      success: true,
      data: data || [],
      total: (data || []).length,
      message: message || `Found ${(data || []).length} items`,
    };
  },

  // Standard error response
  errorResponse(error, defaultMessage = "Operation failed") {
    return {
      success: false,
      data: [],
      error: error.response?.data || error.message,
      status: error.response?.status,
      message: error.response?.data?.message || defaultMessage,
    };
  },

  // Generic error handler
  handleError(error, defaultMessage) {
    return {
      status: "error",
      message: error.response?.data?.message || defaultMessage,
      errors: error.response?.data?.errors || [],
      ...(defaultMessage.includes("missions") && {
        missions: [],
        total: 0,
        total_per_status: {},
        pagination: {},
      }),
    };
  },

  /**
   * Legacy methods for backward compatibility
   */
  async getTeachers() {
    return this.getAvailableTeachers("");
  },
};
