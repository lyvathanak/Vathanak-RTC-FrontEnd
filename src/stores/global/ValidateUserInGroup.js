import { GroupCRUD } from '../apis/GroupCRUD.js';

/**
 * Validates if students are already assigned to any group.
 * A student can only be in one group at a time.
 * 
 * @param {Array<number|string>} userIds - Array of user IDs to validate
 * @returns {Promise<Object>} Validation result with conflicts if any
 */
export async function validateStudentsNotInGroup(userIds) {
  try {
    if (!userIds || userIds.length === 0) {
      return {
        success: true,
        hasConflicts: false,
        conflicts: {},
        validUsers: [],
        message: 'No user IDs provided',
      };
    }

    // Normalize user IDs to numbers
    const normalizedUserIds = userIds.map(id => Number(id)).filter(id => !isNaN(id));

    if (normalizedUserIds.length === 0) {
      return {
        success: false,
        hasConflicts: false,
        conflicts: {},
        validUsers: [],
        message: 'No valid user IDs found',
      };
    }

    // Fetch all groups
    const allGroupsResult = await GroupCRUD.getAllGroups();
    if (!allGroupsResult.success) {
      return {
        success: false,
        hasConflicts: false,
        conflicts: {},
        validUsers: [],
        error: allGroupsResult.error,
        message: 'Failed to fetch groups for validation',
      };
    }

    const conflicts = {};
    const validUsers = [...normalizedUserIds];

    // Check each group for student membership
    for (const group of allGroupsResult.data) {
      const groupResult = await GroupCRUD.getGroupById(group.id);
      
      if (groupResult.success && groupResult.data.students) {
        const groupStudentIds = groupResult.data.students
          .map(s => Number(s.user_id || s.id))
          .filter(id => !isNaN(id));

        // Check if any of our target users are in this group
        normalizedUserIds.forEach(userId => {
          if (groupStudentIds.includes(userId)) {
            conflicts[userId] = {
              groupId: group.id,
              groupName: group.name,
              department: group.department || 'N/A',
              section: group.section || null,
            };
            // Remove from valid users
            const index = validUsers.indexOf(userId);
            if (index > -1) {
              validUsers.splice(index, 1);
            }
          }
        });
      }
    }

    const hasConflicts = Object.keys(conflicts).length > 0;

    return {
      success: true,
      hasConflicts,
      conflicts,
      validUsers,
      message: hasConflicts
        ? `Found ${Object.keys(conflicts).length} student(s) already in groups`
        : 'All students are available',
    };
  } catch (error) {
    console.error('Error validating students in groups:', error);
    return {
      success: false,
      hasConflicts: false,
      conflicts: {},
      validUsers: [],
      error: error.message,
      message: 'An error occurred during validation',
    };
  }
}

/**
 * Validates a single student
 * 
 * @param {number|string} userId - User ID to validate
 * @returns {Promise<Object>} Validation result
 */
export async function validateStudentNotInGroup(userId) {
  const result = await validateStudentsNotInGroup([userId]);
  
  return {
    ...result,
    isInGroup: result.hasConflicts,
    groupInfo: result.conflicts[userId] || null,
  };
}

/**
 * Get detailed conflict information for display
 * 
 * @param {Object} conflicts - Conflicts object from validation
 * @returns {Array<string>} Array of formatted conflict messages
 */
export function formatConflictMessages(conflicts) {
  return Object.entries(conflicts).map(([userId, info]) => {
    const section = info.section ? ` (${info.section})` : '';
    return `Student ID ${userId} is already in group "${info.groupName}"${section}`;
  });
}

/**
 * Filter students into valid and conflicting groups
 * 
 * @param {Array<Object>} students - Array of student objects
 * @param {Object} conflicts - Conflicts object from validation
 * @returns {Object} Object with valid and conflicting student arrays
 */
export function separateStudentsByConflict(students, conflicts) {
  const conflictUserIds = Object.keys(conflicts).map(id => Number(id));
  
  const validStudents = students.filter(student => {
    const userId = Number(student.user_id || student.id);
    return !conflictUserIds.includes(userId);
  });

  const conflictingStudents = students.filter(student => {
    const userId = Number(student.user_id || student.id);
    return conflictUserIds.includes(userId);
  });

  return {
    validStudents,
    conflictingStudents,
  };
}

export default {
  validateStudentsNotInGroup,
  validateStudentNotInGroup,
  formatConflictMessages,
  separateStudentsByConflict,
};
