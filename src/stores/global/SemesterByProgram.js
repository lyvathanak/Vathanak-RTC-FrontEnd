// src/stores/apis/semester.js
import api from '@/stores/apis/axios'

/**
 * Fetch semesters by program ID
 * @param {number|string} programId - Program ID to fetch semesters for
 * @returns {Promise<Object[]>} - List of semester objects with academic year info
 */
export async function getSemestersByProgram(programId) {
  try {
    const response = await api.get(`/managements/get_semesters_by_program/${programId}`)
    const data = response.data
    
    // Handle new nested structure: academic_years[].semesters[]
    if (data.academic_years && Array.isArray(data.academic_years)) {
      // Flatten all semesters from all academic years and add academic year info
      const allSemesters = []
      data.academic_years.forEach(academicYear => {
        if (academicYear.semesters && Array.isArray(academicYear.semesters)) {
          academicYear.semesters.forEach(semester => {
            allSemesters.push({
              ...semester,
              academic_year_label: academicYear.year_label,
              academic_year_id: academicYear.id
            })
          })
        }
      })
      return allSemesters
    }
    
    // Fallback for old structure
    return data.semesters || []
  } catch (error) {
    console.error('❌ Error fetching semesters:', error)
    throw error
  }
}
