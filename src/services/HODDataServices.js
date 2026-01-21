import api from '@/stores/apis/axios';

/**
 * HOD Data Service
 * USES STANDARD ENDPOINTS
 * Note: If these return 403, the Backend Permission for 'Head_Department' must be fixed.
 */
export const HODDataService = {

    async getStudents(departmentId) {
        if (!departmentId) return { success: false, message: 'No Dept ID' };
        try {
            // Standard endpoint used in StudentCRUD
            const response = await api.get('/users/by_department', {
                params: {
                    role: 'student',
                    department_id: departmentId
                }
            });
            const users = response.data?.users?.data || response.data?.data || [];
            return { success: true, data: users, total: users.length };
        } catch (error) {
            console.warn('HOD: Student Access Denied (403). check Backend Permissions.');
            return { success: false, data: [] }; // Return empty to prevent crash
        }
    },

    async getTeachers(departmentId) {
        if (!departmentId) return { success: false, message: 'No Dept ID' };
        try {
            // Standard endpoint used in TeacherCRUD
            const response = await api.get('/users/by_department', {
                params: {
                    role: 'staff',
                    department_id: departmentId
                }
            });
            const users = response.data?.users?.data || response.data?.data || [];
            return { success: true, data: users, total: users.length };
        } catch (error) {
            console.warn('HOD: Teacher Access Denied (403). Check Backend Permissions.');
            return { success: false, data: [] };
        }
    },

    async getLeaveRequests(departmentId) {
        if (!departmentId) return { success: false, message: 'No Dept ID' };
        try {
            const response = await api.get('/request/get_all_leave_request', {
                params: { department_id: departmentId }
            });
            const requests = response.data?.requests?.data || response.data?.data || [];
            return { success: true, data: requests, total: requests.length };
        } catch (error) {
            console.warn('HOD: Leave Request Access Denied (403).');
            return { success: false, data: [] };
        }
    },

    async getTimeTable(departmentId) {
        if (!departmentId) return { success: false, message: 'No Dept ID' };
        try {
            const response = await api.get('/time_table/get_all_time_slots', {
                params: { department_id: departmentId }
            });
            const slots = response.data?.time_slots?.data || response.data?.slots || [];
            return { success: true, data: slots };
        } catch (error) {
            console.warn('HOD: TimeTable Access Denied (403).');
            return { success: false, data: [] };
        }
    }
};

export default HODDataService;