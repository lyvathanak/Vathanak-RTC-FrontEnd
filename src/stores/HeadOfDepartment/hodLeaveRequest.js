import { defineStore } from "pinia";
import axios from "@/stores/apis/axios";

const BASE = "/request/leave-requests";

export const useHodLeaveRequestStore = defineStore("hodLeaveRequest", {
  state: () => ({
    leaveRequests: [],
    meta: null,

    // current query state (useful for refresh after approve/reject)
    query: {
      page: 1,
      per_page: 14,
      role: null, // "Student" | "Staff" | null
      status: null, // "Pending" | "Approved" | "Rejected" | null
      start_date: null, // "YYYY-MM-DD" | null
      end_date: null, // "YYYY-MM-DD" | null
    },

    loading: false,
    approving: false,
    rejecting: false,

    error: null, // string message
    errors: null, // Laravel validation errors object
  }),

  actions: {
    // ---------------------------
    // Error helpers
    // ---------------------------
    setError(err) {
      const data = err?.response?.data;
      const errors = data?.errors;

      const firstValidationMessage =
        errors && typeof errors === "object"
          ? Object.values(errors).flat()?.[0]
          : null;

      this.error =
        data?.message ||
        firstValidationMessage ||
        data?.error ||
        err?.message ||
        "Something went wrong";

      this.errors = errors || null;

      // helpful debug
      console.log("API ERROR:", err?.response?.status, data);
    },

    clearError() {
      this.error = null;
      this.errors = null;
    },

    // ---------------------------
    // Fetch leave requests
    // ---------------------------
    async fetchLeaveRequests(params = {}) {
      this.loading = true;
      this.clearError();

      // merge + persist query so we can refresh later
      this.query = { ...this.query, ...params };

      const { page, per_page, role, status, start_date, end_date } = this.query;

      try {
        const { data } = await axios.get(BASE, {
          params: {
            page,
            per_page,
            ...(role ? { role } : {}),
            ...(status ? { status } : {}),
            ...(start_date ? { start_date } : {}),
            ...(end_date ? { end_date } : {}),
          },
        });

        const paginator = data?.requests;
        this.leaveRequests = paginator?.data || [];
        this.meta = paginator || null;

        return data;
      } catch (err) {
        this.setError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ---------------------------
    // Approve
    // ---------------------------
    async approve(id) {
      this.approving = true;
      this.clearError();

      try {
        const { data } = await axios.post(`${BASE}/${id}/approve`);

        // update item in current list if present
        const updated = data?.leave_request;
        if (updated) {
          const idx = this.leaveRequests.findIndex(
            (x) => String(x.id) === String(updated.id),
          );
          if (idx !== -1) this.leaveRequests[idx] = updated;
        }

        // optional: refresh list to reflect filters/pagination accurately
        // await this.fetchLeaveRequests();

        return data;
      } catch (err) {
        this.setError(err);
        throw err;
      } finally {
        this.approving = false;
      }
    },

    // ---------------------------
    // Reject
    // ---------------------------
    async reject(id, remark) {
      this.rejecting = true;
      this.clearError();

      try {
        const { data } = await axios.post(`${BASE}/${id}/reject`, { remark });

        // update item in current list if present
        const updated = data?.leave_request;
        if (updated) {
          const idx = this.leaveRequests.findIndex(
            (x) => String(x.id) === String(updated.id),
          );
          if (idx !== -1) this.leaveRequests[idx] = updated;
        }

        // optional: refresh list to reflect filters/pagination accurately
        // await this.fetchLeaveRequests();

        return data;
      } catch (err) {
        this.setError(err);
        throw err;
      } finally {
        this.rejecting = false;
      }
    },

    // convenience
    async refresh() {
      return this.fetchLeaveRequests(this.query);
    },
  },
});
