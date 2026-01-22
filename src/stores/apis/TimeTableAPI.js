import api from "./axios";

class TimeTableAPI {
    // ==========================================
    //  NEW METHODS FOR STUDENT & TEACHER VIEWS
    // ==========================================

    // Fetch time slots for the logged-in student
    async fetchStudentTimeSlots(params = {}) {
        try {
            // Adjust per_page to ensure we get all slots for the week/month
            const res = await api.get('/time_table/get_time_slots_user', { params: { per_page: 1000, ...params } });
            const slots = res.data?.time_slots?.data || res.data?.time_slots || res.data || [];
            console.log("Student Time Slots:", slots);
            return slots;
        } catch (e) {
            console.error("Error fetching student time slots:", e);
            return [];
        }
    }

    // Fetch time slots for the logged-in teacher
    async fetchTeacherTimeSlots(params = {}) {
        try {
            const res = await api.get('/time_table/get_time_slots_teacher', { params: { per_page: 1000, ...params } });
            const slots = res.data?.time_slots?.data || res.data?.time_slots || res.data || [];
            console.log("Teacher Time Slots:", slots);
            return slots;
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
            // Check robustly for response structure
            return res.data.programs || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD programs:", e);
            return [];
        }
    }

    // {{base_url}}/departments/get_sub_department_by_department/1
    async fetchHODSubDepartments(deptId) {
        try {
            const res = await api.get(`/departments/get_sub_department_by_department/${deptId}`);
            return res.data.sub_departments || res.data.sub_department || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD sub-departments:", e);
            return [];
        }
    }

    // {{base_url}}/departments/get_groups_by_program/1
    async fetchHODGroups(programId) {
        try {
            const res = await api.get(`/departments/get_groups_by_program/${programId}`);
            return res.data.groups || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD groups:", e);
            return [];
        }
    }
    async fetchHODGroupsBySemester(semesterId) {
        try {
            // Note: If this specific endpoint doesn't exist in your backend, 
            // you might need to use `fetchHODGroups(programId)` and filter client-side.
            // But usually, HODs have a get_groups_by_semester endpoint too.
            const res = await api.get(`/departments/get_groups_by_semester/${semesterId}`);
            return res.data.groups || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD groups by semester:", e);
            // Fallback: If 404/403, try returning empty to prevent crash
            return [];
        }
    }

    // {{base_url}}/departments/get_semesters_by_program/1
    async fetchHODSemesters(programId) {
        try {
            const res = await api.get(`/departments/get_semesters_by_program/${programId}`);
            return res.data.semesters || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD semesters:", e);
            return [];
        }
    }

    // {{base_url}}/departments/get_academic_years_by_program/1
    async fetchHODAcademicYears(programId) {
        try {
            const res = await api.get(`/departments/get_academic_years_by_program/${programId}`);
            return res.data.academic_years || res.data || [];
        } catch (e) {
            console.error("Error fetching HOD academic years:", e);
            return [];
        }
    }

    // {{base_url}}/time_table/get_time_slot_department?department_id=...
    async fetchHODTimeSlots(params) {
        try {
            const res = await api.get('/time_table/get_time_slot_department', { 
                params: { ...params, per_page: 10000 } 
            });
            return res.data.data || res.data || [];
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
            const timeTables = response.data.time_tables?.data || response.data.time_tables || response.data;
            return timeTables;
        } catch (e) {
            console.error("Error fetching time table:", e);
            return [];
        }
    }

    // get time table by timetable id 
    async fetchTimeTableById(id) {
        try {
            const res = await api.get(`/time_table/get_time_table/${id}`)
            const result = res.data.time_table;
            console.log("result of time table by id:", result);
            return result;
        } catch (e) {
            console.error("Error fetching time table by id:", e);
            return null;
        }
    }

    // subjects
    async fetchSubjects(q) {
        try {
            const res = await api.get(`/managements/search_paginate_subjects?search='${q}'`);
            const r = res.data?.subjects || res.subjects || [];
            return r;
        } catch (e) {
            console.error("Error Subject:", e)
            return [];
        }
    }

    // fetch all subjects
    async fetchAllSubjects() {
        try {
            const res = await api.get(`/managements/get_all_subjects`);
            // API returns paginated data: { subjects: { data: [...] } }
            const r = res.data.subjects?.data || res.data.subjects || [];
            return r;
        } catch (e) {
            console.error("Error fetching all subjects:", e)
            return [];
        }
    }

    // fetch teachers (staff users)
    async fetchTeachers() {
        try {
            const res = await api.get(`/users/get_all_staff`);
            // Handle paginated response: { staffs: { data: [...] } } or direct array
            const r = res.data?.staffs?.data || res.data?.staffs || res.staffs || [];
            return r;
        } catch (e) {
            console.error("Error fetching teachers:", e)
            return [];
        }
    }

    // fetch locations
    async fetchLocations() {
        try {
            const res = await api.get(`/locations/get_all_locations`);
            // Handle paginated response: { locations: { data: [...] } }
            const r = res.data?.locations?.data || res.data?.locations || res.locations?.data || [];
            return r;
        } catch (e) {
            console.error("Error fetching locations:", e)
            return [];
        }
    }

    // fetch timeslote by group id
    async fetchTimeSlotsByGroupId(groupId) {
        try {
            // /time_table/get_all_time_slot_by_group/${groupId}
            const res = await api.get(`/time_table/get_all_time_slot_by_group/${groupId}`);
            const r = res.data.time_slots;
            console.log("Time Slots By Group ID Response:", r);
            return r || [];
        } catch (e) {
            // 404 means no time slots found for this group
            if (e.response && e.response.status === 404) {
                console.log("No time slots found for group:", groupId);
                return [];
            }
            console.error("Error Time Slots By Group ID:", e);
            return [];
        }
    }

    // program
    async fetchPrograms() {
        try {
            const res = await api.get(`/managements/get_all_program`);
            const r = res.data.programs;
            return r;
        } catch (e) {
            console.error("Error Programs:", e)
        }
    }
    // semester /managements/get_all_semesters_by_academic_year?academic_year_id=4
    async fetchSemesters(academic_year_id) {
        try {
            const res = await api.get(`/managements/get_all_semesters_by_academic_year?academic_year_id=${academic_year_id}`);
            const r = res.data.semesters;
            return r;
        } catch (e) {
            console.error("Error Semesters:", e)
        }
    }
    // department
    async fetchDepartments() {
        try {
            const res = await api.get(`/managements/get_all_department`);
            const r = res.data.all_department;
            return r;
        } catch (e) {
            console.error("Error Departments:", e)
        }
    }
    // get program by department id
    async fetchProgramsByDepartment(deptId) {
        try {
            const res = await api.get(`/managements/get_program_by?department_id=${deptId}`);
            const r = res.data.programs;
            return r;
        } catch (e) {
            console.error("Error Programs By Department:", e)
            return [];
        }
    }
    // get subdepartments by department id
    async fetchAllSubDepartmentByDepartmentId(deptId) {
        try {
            const res = await api.get(`/managements/get_all_sub_department?department_id=${deptId}`);
            // API returns: { sub_department: { data: [...] } }
            const r = res.data.all_sub_department || res.data.sub_department || [];
            return r;
        } catch (e) {
            console.error("Error Subdepartments By Department:", e)
            return [];
        }
    }
    // acadamic year
    async fetchAcademicYears() {
        try {
            const res = await api.get(`/managements/get_academic_year`);
            const r = res.data.academic_year;
            return r;
        } catch (e) {
            console.error("Error Academic Years:", e)
        }
    }
    // department details
    async fetchDepartmentDetails(deptId) {
        try {
            const res = await api.get(`/managements/get_department_detail/${deptId}`);
            const r = res.data.department;
            return r;
        } catch (e) {
            console.error("Error Department Details:", e)
        }
    }

    // /managements/get_semesters_by_program/{program_id}
    // Returns: { semesters: [{ id, academic_year_id, semester_number, semester_key, start_date, end_date, program_id, ... }] }
    async fetchSemestersByProgram(program_id) {
        try {
            const url = `/managements/get_semesters_by_program/${program_id}`;
            const res = await api.get(url);
            console.log("fetchSemestersByProgram response:", res.data);

            // API returns: { semesters: [...] }
            const semesters = res.data.semesters || [];
            return semesters;
        } catch (e) {
            console.error("Error Semesters By Program:", e);
            // Check if it's 404 but has data
            if (e.response && e.response.data && e.response.data.semesters) {
                return e.response.data.semesters;
            }
            return [];
        }
    }
    // get all Academic Years
    async fetchAllAcademicYears() {
        try {
            const res = await api.get(`/managements/get_academic_year`);
            const r = res.data.academic_years || Object.values(res.data.academic_year || {});

            return r;
        } catch (e) {
            console.error("Error All Academic Years:", e)
            return [];
        }
    }

    // Get academic years by program ID (only years that have semesters for this program)
    async fetchAcademicYearsByProgram(programId) {
        try {
            const res = await api.get(`/managements/get_academic_years_by_program/${programId}`);
            console.log("fetchAcademicYearsByProgram response:", res.data);
            const r = res.data.academic_years || [];
            return r;
        } catch (e) {
            console.error("Error fetching academic years by program:", e);
            return [];
        }
    }

    async fetchGroupsBySemesterId(semesterId) {
        try {
            const res = await api.get(`/groups/get_group_semester/${semesterId}`);
            const r = res.data.semesters;
            return r;
        } catch (e) {
            console.error("Error Groups By Semester ID:", e)
            // Check if 404 but has data
            if (e.response && e.response.status === 404 && e.response.data && e.response.data.semesters) {
                return e.response.data.semesters;
            }
            return [];
        }
    }

    // /groups/filter_group_by_program/{program_id}
    // Returns: { message, groups: { data: [...], current_page, ... } }
    async fetchGroupsByProgramId(programId) {
        try {
            const res = await api.get(`/groups/filter_group_by_program/${programId}`);
            console.log("fetchGroupsByProgramId response:", res.data);
            // API returns paginated: { groups: { data: [...] } }
            const groups = res.data.groups?.data || res.data.groups || [];
            return groups;
        } catch (e) {
            console.error("Error Groups By Program ID:", e);
            // Check if 404 but has data
            if (e.response && e.response.data && e.response.data.groups) {
                return e.response.data.groups?.data || e.response.data.groups || [];
            }
            return [];
        }
    }

    // Get all groups
    async fetchAllGroups() {
        try {
            const res = await api.get(`/groups/get_all_groups`);
            // API returns paginated data: { groups: { data: [...] } }
            const r = res.data.groups?.data || res.data.groups || res.data.all_groups || [];
            return r;
        } catch (e) {
            console.error("Error fetching all groups:", e);
            return [];
        }
    }

    // }}/time_table/get_time_slot_by_group/1
    async fetchTimeSlotByGroupId(groupId) {
        try {
            const res = await api.get(`/time_table/get_time_slot_by_group/${groupId}`);
            const r = res.data.time_slots;
            return r;
        } catch (e) {
            console.error("Error Time Slot By Group ID:", e)
            // Check if 404 but has data
            if (e.response && e.response.status === 404 && e.response.data) {
                return e.response.data.time_slots || [];
            }
            return [];
        }
    }

    // Get existing timetable for a group (no auto-creation)
    async getTimeTableByGroupId(groupId) {
        try {
            const res = await api.get(`/time_table/get_time_slot_by_group/${groupId}`);
            const timeTable = res.data.time_table;
            console.log("TimeTable for group:", timeTable);
            return timeTable;
        } catch (e) {
            console.log("No timetable found for group:", e);
            return null;
        }
    }

    // Get or create timetable for a group
    async getOrCreateTimeTableByGroupId(groupId) {
        try {
            // First try to get existing timetable using the correct endpoint
            const res = await api.get(`/time_table/get_time_slot_by_group/${groupId}`);
            const timeTable = res.data.time_table;
            console.log("TimeTable for group:", timeTable);

            // If timetable exists and has an id, return it
            if (timeTable && timeTable.id) {
                return timeTable;
            }

            // If no timetable found, create one
            console.log("No timetable found, creating new one for group:", groupId);
            return await this.createTimeTableForGroup(groupId);
        } catch (e) {
            // If not found (404) or other error that indicates no timetable, create a new one
            if (e.response && e.response.status === 404) {
                console.log("Timetable not found (404), creating new one");
                return await this.createTimeTableForGroup(groupId);
            }
            console.error("Error getting timetable by group:", e);
            if (e.response && e.response.data) {
                throw e.response.data;
            }
            throw e;
        }
    }

    // Helper method to create timetable for a group
    async createTimeTableForGroup(groupId, name = null, description = null) {
        try {
            const createRes = await api.post(`/time_table/create_new_time_table`, {
                name: name || `Time Table for Group ${groupId}`,
                description: description || `Time table for group ${groupId}`,
                group_id: groupId
            });
            console.log("Created new TimeTable:", createRes.data);
            return createRes.data.time_table || createRes.data;
        } catch (createError) {
            console.error("Error creating timetable:", createError);

            // Handle 409 - timetable already exists
            if (createError.response && createError.response.status === 409) {
                console.log("Timetable already exists (409), fetching existing one");
                // Try to get the existing timetable using the correct group endpoint
                try {
                    const res = await api.get(`/time_table/get_time_slot_by_group/${groupId}`);
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

    // CREATE TIMESLOTS
    async createTimeSlots(time_table_id, payload) {
        try {
            const res = await api.post(`/time_table/create_new_time_slot/${time_table_id}`, payload);
            const r = res.data;
            console.log("Create Time Slots Response:", r);
            return r;
        } catch (e) {
            console.error("Error Creating Time Slots:", e);
            if (e.response && e.response.data) {
                throw e.response.data;
            }
            throw e;
        }
    }
    // DELETE ENDPOINTS
    // Note: This method name was misleading - it deletes a TIME SLOT, not a time table
    // Use deleteTimeSlotById instead for clarity
    async deleteSingleSlotById(id) {
        try {
            const res = await api.delete(`/time_table/remove_time_slot/${id}`);
            const r = res.data;
            return r;
        } catch (e) {
            console.error("Error Deleting Time Slot By ID:", e)
            return null;
        }
    }
    // remove timetable by timetable id
    async deleteTimeTableByTimeTableId(id) {
        try {
            const res = await api.delete(`/time_table/remove_time_table/${id}`);
            const r = res.data;
            console.log("Delete Time Table Response:", r);
            return r;
        } catch (e) {
            console.error("Error Deleting Time Table By ID:", e);
            if (e.response && e.response.data) {
                throw e.response.data;
            }
            throw e;
        }
    }
    // update time slot by id
    async updateTimeSlotById(id, payload) {
        try {
            const res = await api.put(`/time_table/update_time_slot/${id}`, payload);
            const r = res.data;
            console.log("Update Time Slot Response:", r);
            return r;
        } catch (e) {
            console.error("Error Updating Time Slot By ID:", e);
            if (e.response && e.response.data) {
                throw e.response.data;
            }
            throw e;
        }
    }
    // delete time slot by id
    async deleteTimeSlotById(id) {
        try {
            const res = await api.delete(`/time_table/remove_time_slot/${id}`);
            const r = res.data;
            console.log("Delete Time Slot Response:", r);
            return r;
        } catch (e) {
            console.error("Error Deleting Time Slot By ID:", e);
            if (e.response && e.response.data) {
                throw e.response.data;
            }
            throw e;
        }
    }
    // clone week
    async cloneWeek(timetable_id, fromStart, fromEnd, toStart) {
        try {
            const res = await api.post(`/time_table/clone_time_slot/${timetable_id}`, {
                from_start: fromStart,  // Format: 'YYYY-MM-DD'
                from_end: fromEnd,      // Format: 'YYYY-MM-DD'
                to_start: toStart       // Format: 'YYYY-MM-DD'
            });
            const r = res.data;
            console.log("Clone Week Response:", r);
            return r;
        } catch (e) {
            console.error("Error Cloning Week:", e);
            if (e.response && e.response.data) {
                throw e.response.data;
            }
            throw e;
        }
    }

}

export default new TimeTableAPI();