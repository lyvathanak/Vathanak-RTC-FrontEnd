import api from '@/stores/apis/axios';

/**
 * Finalize enrollment exam
 * @param {String|Number} academicYear - Format: "2025-2026" or just year number like 2025. Optional, defaults to current academic year
 * @param {Number} importScoreId
 * @param {Number} fromRank
 * @param {Number} toRank
 * @param {Array} students - sorted DESC by score. MUST contain temp_student_id from database
 */
export async function finalizeExam({
  academicYear,
  importScoreId,
  fromRank,
  toRank,
  students
}) {
  // Format academic year properly
  let formattedAcademicYear;
  if (academicYear && typeof academicYear === 'string' && academicYear.includes('-')) {
    formattedAcademicYear = academicYear;
  } else {
    const year = academicYear || new Date().getFullYear();
    formattedAcademicYear = `${year-1}-${year}`;
  }
  
  const payload = {
    academic_year: formattedAcademicYear,
    import_score_id: importScoreId,
    from: fromRank,
    to: toRank,
    students: students.map(s => ({
      temp_student_id: s.temp_student_id || s.id, // ⚠️ Prefer temp_student_id from database
      score: s.score
    }))
  }

  const response = await api.post(
    '/external_exam/finalize',
    payload
  )

  return response.data
}