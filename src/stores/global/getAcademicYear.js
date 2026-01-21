import api from '@/stores/apis/axios.js';

/**
 * Fetch all available programs
 * @returns {Promise<Array>} Array of program objects
 */
async function getAllPrograms() {
  try {
    const response = await api.get('/managements/get_all_program');
    return response.data.programs || [];
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw error;
  }
}

/**
 * Fetch generation data for a specific program
 * @param {number} programId - The ID of the program
 * @returns {Promise<Object>} Object containing program and generation data
 */
// async function getGenerationByProgram(programId) {
//   try {
//     const response = await api.get(`/managements/get_generation_by_program/${programId}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching generation data:', error);
//     throw error;
//   }
// }

/**
 * Fetch all academic years
 * @returns {Promise<Array>} Array of academic year objects
 */
async function getAllAcademicYears() {
  try {
    const response = await api.get('/managements/get_academic_year');
    return response.data.academic_year || [];
  } catch (error) {
    console.error('Error fetching academic years:', error);
    throw error;
  }
}

/**
 * Parse dates field which can be either a JSON string or object
 * @param {string|Object} dates - The dates field from academic year
 * @returns {Object} Parsed dates object with start_year and end_year
 */
function parseDates(dates) {
  if (typeof dates === 'string') {
    try {
      return JSON.parse(dates);
    } catch (error) {
      console.error('Error parsing dates:', error);
      return null;
    }
  }
  return dates;
}

/**
 * Find matching academic year based on generation start year
 * @param {Array} academicYears - Array of academic year objects
 * @param {string|number} startYear - Start year from generation
 * @returns {Object|null} Matching academic year or null
 */
function findMatchingAcademicYear(academicYears, startYear) {
  const yearNum = parseInt(startYear);
  
  for (const academicYear of academicYears) {
    const dates = parseDates(academicYear.dates);
    if (dates) {
      const academicStartYear = parseInt(dates.start_year);
      if (academicStartYear === yearNum) {
        return {
          ...academicYear,
          dates: dates // Return parsed dates
        };
      }
    }
  }
  
  return null;
}

/**
 * Main function: Get academic year for a selected program
 * @param {number} programId - The ID of the selected program
 * @returns {Promise<Object>} Object containing program and academic year data
 */
async function getAcademicYearForProgram(programId) {
  try {
    // Get all programs
    const programs = await getAllPrograms();
    
    // Find the selected program
    const program = programs.find(p => p.id === programId);
    
    if (!program) {
      throw new Error('Program not found');
    }
    
    if (!program.academic_year) {
      throw new Error('No academic year found for this program');
    }
    
    // Return complete data
    return {
      success: true,
      program: program,
      academicYear: program.academic_year,
      message: 'Academic year retrieved from program data'
    };
    
  } catch (error) {
    console.error('Error in getAcademicYearForProgram:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Helper function to get all data needed for program selection UI
 * @returns {Promise<Object>} Object containing all programs and academic years
 */
async function getInitialData() {
  try {
    const [programs, academicYears] = await Promise.all([
      getAllPrograms(),
      getAllAcademicYears()
    ]);
    
    return {
      success: true,
      programs: programs,
      academicYears: academicYears.map(ay => ({
        ...ay,
        dates: parseDates(ay.dates)
      }))
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export functions
export {
  getAllPrograms,
  // getGenerationByProgram,
  getAllAcademicYears,
  getAcademicYearForProgram,
  getInitialData,
  findMatchingAcademicYear,
  parseDates
};

// For CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getAllPrograms,
    // getGenerationByProgram,
    getAllAcademicYears,
    getAcademicYearForProgram,
    getInitialData,
    findMatchingAcademicYear,
    parseDates
  };
}