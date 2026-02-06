import api from "./axios";

class TimeTableAPI {
    // ==========================================
    //  NEW METHODS FOR STUDENT & TEACHER VIEWS
    // ==========================================

    // Fetch time slots for the logged-in student
    async fetchStudentTimeSlots(params = {}) {
        try {
            const res = await api.get('/time_table/get_time_slots_user', { 
                params: { per_page: 1000, ...params } 
            });
            return res.data?.time_slots?.data || res.data?.time_slots || res.data || [];
        } catch (e) {
            console.error("Error fetching student time slots:", e);
            return [];
        }
    }

    // Fetch time slots for the logged-in teacher
    async fetchTeacherTimeSlots(params = {}) {
        try {
            const res = await api.get('/time_table/get_time_slots_teacher', { 
                params: { per_page: 1000, ...params } 
            });
            return res.data?.time_slots?.data || res.data?.time_slots || res.data || [];
        } catch (e) {
            console.error("Error fetching teacher time slots:", e);
            return [];
        }
    }

    // ==========================================
    //  NEW METHODS FOR HEAD OF DEPARTMENT (HOD)
    // ==========================================

    // {{base_url}}/departments/get_program_by_department/1
    async fetchHODPrograms(deptId) {
        try {
            const res = await api.get(`/departments/get_program_by_department/${deptId}`);
            return res.data?.programs || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD programs:", e);
            return [];
        }
    }

    // {{base_url}}/departments/get_sub_department_by_department/1
    async fetchHODSubDepartments(deptId) {
        try {
            const res = await api.get(`/departments/get_sub_department_by_department/${deptId}`);
            return res.data?.sub_departments || res.data?.sub_department || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD sub-departments:", e);
            return [];
        }
    }

    // {{base_url}}/departments/get_groups_by_program/1
    async fetchHODGroups(programId) {
        try {
            const res = await api.get(`/departments/get_groups_by_program/${programId}`);
            return res.data?.groups || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD groups:", e);
            return [];
        }
    }

    async fetchHODGroupsBySemester(semesterId) {
        try {
            const res = await api.get(`/departments/get_groups_by_semester/${semesterId}`);
            return res.data?.groups || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD groups by semester:", e);
            return [];
        }
    }

    // {{base_url}}/departments/get_semesters_by_program/1
    async fetchHODSemesters(programId) {
        try {
            const res = await api.get(`/departments/get_semesters_by_program/${programId}`);
            return res.data?.semesters || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD semesters:", e);
            return [];
        }
    }

    // {{base_url}}/departments/get_academic_years_by_program/1
    async fetchHODAcademicYears(programId) {
        try {
            const res = await api.get(`/departments/get_academic_years_by_program/${programId}`);
            return res.data?.academic_years || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD academic years:", e);
            return [];
        }
    }

    // ✅ FIXED: Ensures params are sent as Query Parameters
    // URL: {{base_url}}/time_table/get_time_slot_department?department_id=1&...
    async fetchHODTimeSlots(params) {
        try {
            // NOTE: 'params' must be a plain object: { department_id: 1, ... }
            // Do NOT double wrap it in { params: { ... } } from the component.
            const res = await api.get('/time_table/get_time_slot_department', { 
                params: { ...params, per_page: 10000 } 
            });
            return res.data?.data || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD time slots:", e);
            return [];
        }
    }

    // ==========================================
    //  EXISTING METHODS
    // ==========================================

    async fetchTimeTable(page) {
        try {
            const response = await api.get(`/time_table/get_all_time_table`);
            return response.data?.time_tables?.data || response.data?.time_tables || response.data || [];
        } catch (e) {
            console.error("Error fetching time table:", e);
            return [];
        }
    }

    async fetchTimeTableById(id) {
        try {
            const res = await api.get(`/time_table/get_time_table/${id}`)
            return res.data?.time_table || null;
        } catch (e) {
            console.error("Error fetching time table by id:", e);
            return null;
        }
    }

    async fetchSubjects(q) {
        try {
            const res = await api.get(`/managements/search_paginate_subjects?search='${q}'`);
            return res.data?.subjects || res.subjects || [];
        } catch (e) {
            console.error("Error Subject:", e)
            return [];
        }
    }

    async fetchAllSubjects() {
        try {
            const res = await api.get(`/managements/get_all_subjects`);
            return res.data?.subjects?.data || res.data?.subjects || [];
        } catch (e) {
            console.error("Error fetching all subjects:", e)
            return [];
        }
    }

    async fetchTeachers() {
        try {
            const res = await api.get(`/users/get_all_staff`);
            return res.data?.staffs?.data || res.data?.staffs || res.staffs || [];
        } catch (e) {
            console.error("Error fetching teachers:", e)
            return [];
        }
    }

    async fetchLocations() {
        try {
            const res = await api.get(`/locations/get_all_locations`);
            return res.data?.locations?.data || res.data?.locations || res.locations?.data || [];
        } catch (e) {
            console.error("Error fetching locations:", e)
            return [];
        }
    }

    async fetchTimeSlotsByGroupId(groupId) {
        try {
            const res = await api.get(`/time_table/get_all_time_slot_by_group/${groupId}`);
            return res.data?.time_slots || [];
        } catch (e) {
            if (e.response && e.response.status === 404) {
                return [];
            }
            console.error("Error Time Slots By Group ID:", e);
            return [];
        }
    }

    async fetchPrograms() {
        try {
            const res = await api.get(`/managements/get_all_program`);
            return res.data?.programs || [];
        } catch (e) {
            console.error("Error Programs:", e);
            return [];
        }
    }

    async fetchSemesters(academic_year_id) {
        try {
            const res = await api.get(`/managements/get_all_semesters_by_academic_year`, {
                params: { academic_year_id }
            });
            return res.data?.semesters || [];
        } catch (e) {
            console.error("Error Semesters:", e);
            return [];
        }
    }

    async fetchDepartments() {
        try {
            const res = await api.get(`/managements/get_all_department`);
            return res.data?.all_department || [];
        } catch (e) {
            console.error("Error Departments:", e);
            return [];
        }
    }

    async fetchProgramsByDepartment(deptId) {
        try {
            const res = await api.get(`/managements/get_program_by`, { 
                params: { department_id: deptId } 
            });
            return res.data?.programs || [];
        } catch (e) {
            console.error("Error Programs By Department:", e)
            return [];
        }
    }

    async fetchAllSubDepartmentByDepartmentId(deptId) {
        try {
            const res = await api.get(`/managements/get_all_sub_department`, {
                params: { department_id: deptId }
            });
            return res.data?.all_sub_department || res.data?.sub_department || [];
        } catch (e) {
            console.error("Error Subdepartments By Department:", e)
            return [];
        }
    }

    async fetchAcademicYears() {
        try {
            const res = await api.get(`/managements/get_academic_year`);
            return res.data?.academic_year || [];
        } catch (e) {
            console.error("Error Academic Years:", e);
            return [];
        }
    }

    async fetchDepartmentDetails(deptId) {
        try {
            const res = await api.get(`/managements/get_department_detail/${deptId}`);
            return res.data?.department || null;
        } catch (e) {
            console.error("Error Department Details:", e);
            return null;
        }
    }

    async fetchSemestersByProgram(program_id) {
        try {
            const res = await api.get(`/managements/get_semesters_by_program/${program_id}`);
            return res.data?.semesters || [];
        } catch (e) {
            console.error("Error Semesters By Program:", e);
            return e.response?.data?.semesters || [];
        }
    }

    async fetchAllAcademicYears() {
        try {
            const res = await api.get(`/managements/get_academic_year`);
            return res.data?.academic_years || Object.values(res.data?.academic_year || {});
        } catch (e) {
            console.error("Error All Academic Years:", e)
            return [];
        }
    }

    async fetchAcademicYearsByProgram(programId) {
        try {
            const res = await api.get(`/managements/get_academic_years_by_program/${programId}`);
            return res.data?.academic_years || [];
        } catch (e) {
            console.error("Error fetching academic years by program:", e);
            return [];
        }
    }

    async fetchGroupsBySemesterId(semesterId) {
        try {
            const res = await api.get(`/groups/get_group_semester/${semesterId}`);
            return res.data?.semesters || []; // Note: API seems to return 'semesters' key for groups?
        } catch (e) {
            console.error("Error Groups By Semester ID:", e)
            return e.response?.data?.semesters || [];
        }
    }

    async fetchGroupsByProgramId(programId) {
        try {
            const res = await api.get(`/groups/filter_group_by_program/${programId}`);
            return res.data?.groups?.data || res.data?.groups || [];
        } catch (e) {
            console.error("Error Groups By Program ID:", e);
            return e.response?.data?.groups?.data || e.response?.data?.groups || [];
        }
    }

    async fetchAllGroups() {
        try {
            const res = await api.get(`/groups/get_all_groups`);
            return res.data?.groups?.data || res.data?.groups || res.data?.all_groups || [];
        } catch (e) {
            console.error("Error fetching all groups:", e);
            return [];
        }
    }
    
    // }}/time_table/get_all_time_slot_by_group/1
     async fetchTimeSlotByGroupId(groupId){
        try{
        const res= await api.get(`/time_table/get_all_time_slot_by_group/${groupId}`);
        const r = res.data.time_slots;
        return r;
        }catch(e){
        console.error("Error Time Slot By Group ID:", e)
        // Check if 404 but has data
        if (e.response && e.response.status === 404 && e.response.data) {
            return e.response.data.time_slots || [];
        }
        return [];
        }
    }

    async getTimeTableByGroupId(groupId) {
        try {
            // Use the get_all_time_table endpoint with group_id filter to check if timetable exists
            const res = await api.get(`/time_table/get_all_time_table`, {
                params: { group_id: groupId }
            });
            
            // Backend returns paginated data: { time_tables: { data: [...], current_page: 1, ... } }
            const timeTables = res.data.time_tables?.data || res.data.time_tables || res.data.data || [];
            console.log("TimeTable query result for group:", timeTables);
            
            // If timetable exists, return the first one
            if (timeTables && Array.isArray(timeTables) && timeTables.length > 0) {
                const timeTable = timeTables[0];
                console.log("Found existing timetable:", timeTable);
                return timeTable;
            }
            
            console.log("No timetable found for group:", groupId);
            return null;
        } catch (e) {
            console.log("Error checking timetable for group:", e);
            return null;
        }
    }

    async getOrCreateTimeTableByGroupId(groupId) {
        try {
            // First try to get existing timetable by querying all timetables filtered by group_id
            const res = await api.get(`/time_table/get_all_time_table`, {
                params: { group_id: groupId }
            });
            
            // Backend returns paginated data: { time_tables: { data: [...], current_page: 1, ... } }
            const timeTables = res.data.time_tables?.data || res.data.time_tables || res.data.data || [];
            console.log("TimeTable query result for group:", timeTables);
            
            // If timetable exists, return the first one
            if (timeTables && Array.isArray(timeTables) && timeTables.length > 0) {
                const timeTable = timeTables[0];
                console.log("Found existing timetable:", timeTable);
                return timeTable;
            }
            
            // If no timetable found, create one
            console.log("No timetable found, creating new one for group:", groupId);
            return await this.createTimeTableForGroup(groupId);
        } catch (e) {
            // If not found (404) or other error that indicates no timetable, create a new one
            if (e.response && (e.response.status === 404 || e.response.status === 422)) {
                console.log("Timetable not found, creating new one");
                return await this.createTimeTableForGroup(groupId);
            }
            throw e;
        }
    }

    async createTimeTableForGroup(groupId, name = null, description = null) {
        try {
            const createRes = await api.post(`/time_table/create_new_time_table`, {
                name: name || `Time Table for Group ${groupId}`,
                description: description || `Time table for group ${groupId}`,
                group_id: groupId
            });
            return createRes.data?.time_table || createRes.data;
        } catch (createError) {
            if (createError.response && createError.response.status === 409) {
                console.log("Timetable already exists (409), using existing one from response");
                console.log("Full 409 response data:", createError.response.data);
                
                // The backend now returns the existing timetable in the 409 response
                const existingTimeTable = createError.response.data?.time_table;
                console.log("Extracted timetable:", existingTimeTable);
                
                if (existingTimeTable && existingTimeTable.id) {
                    console.log("✅ Returning existing timetable:", existingTimeTable);
                    return existingTimeTable;
                }
                
                console.warn("⚠️ No timetable found in 409 response, trying fallback GET request");
                
                // Fallback: try to fetch if not in response
                try {
                    const res = await api.get(`/time_table/get_all_time_slot_by_group/${groupId}`);
                    const timeTable = res.data.time_table;
                    if (timeTable && timeTable.id) {
                        return timeTable;
                    }
                } catch (getError) {
                    console.error("Error fetching existing timetable:", getError);
                }
            }
            
            if (createError.response && createError.response.data) {
                throw createError.response.data;
            }
            throw createError;
        }
    }

    async createTimeSlots(time_table_id, payload) {
        const res = await api.post(`/time_table/create_new_time_slot/${time_table_id}`, payload);
        return res.data;
    }

    async deleteSingleSlotById(id) {
        const res = await api.delete(`/time_table/remove_time_slot/${id}`);
        return res.data;
    }

    async deleteTimeTableByTimeTableId(id) {
        const res = await api.delete(`/time_table/remove_time_table/${id}`);
        return res.data;
    }

    async updateTimeSlotById(id, payload) {
        const res = await api.put(`/time_table/update_time_slot/${id}`, payload);
        return res.data;
    }

    async deleteTimeSlotById(id) {
        const res = await api.delete(`/time_table/remove_time_slot/${id}`);
        return res.data;
    }

    async cloneWeek(timetable_id, fromStart, fromEnd, toStart) {
        const res = await api.post(`/time_table/clone_time_slot/${timetable_id}`, {
            from_start: fromStart,
            from_end: fromEnd,
            to_start: toStart
        });
        return res.data;
    }
}

export default new TimeTableAPI();