import api from './axios.js';

/**
 * CV Management API
 * Handles CV templates, submissions, and admin actions
 */

// Constants based on your backend data
export const CV_CONSTANTS = {
  contactType: [
    'Email',
    'Phone',
    'Github',
    'Linkedin',
    'Portfolio',
    'Twitter',
    'Facebook',
    'Telegram',
    'Other'
  ],
  
  degreeLevels: [
    'High School',
    'Associate',
    'Bachelor',
    'Master',
    'Doctorate (PhD)',
    'Professional Certificate',
    'Diploma',
    'Other'
  ],
  
  proficiencyLevels: [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert',
    'Native'
  ],
  
  skillProficiencyLevels: [
    'Novice',
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert',
    'Master',
    'Other'
  ],
  
  experienceLevels: [
    'Internship',
    'Entry Level',
    'Junior Level',
    'Mid Level',
    'Senior Level',
    'Leadership',
    'Management',
    'Executive'
  ]
};

// Get all CVs with pagination (for admin management)
export const getAllCVs = async (params = {}) => {
  try {
    const { page = 1, per_page = 10, ...otherParams } = params;
    
    const queryParams = {
      page,
      per_page,
      ...otherParams
    };
    
    console.log('📤 Fetching all CVs with params:', queryParams);
    
    const response = await api.get('/cvs/get_all_cvs', { params: queryParams });
    
    const cvs = response.data?.cvs?.data || response.data?.data || [];
    const pagination = response.data?.cvs || response.data || {};
    
    console.log('📥 CVs fetched:', cvs.length);
    
    return {
      success: true,
      cvs: cvs,
      pagination: {
        current_page: pagination.current_page || 1,
        per_page: pagination.per_page || per_page,
        total: pagination.total || cvs.length,
        last_page: pagination.last_page || 1
      },
      total_count: pagination.total || cvs.length
    };
  } catch (error) {
    console.error('❌ Error fetching CVs:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch CVs',
      cvs: [],
      pagination: {}
    };
  }
};

// Get CV by ID
export const getCVById = async (id) => {
  try {
    console.log(`📤 Fetching CV with ID: ${id}`);
    const response = await api.get(`/cvs/get_cv_by_id/${id}`);
    
    const cv = response.data?.cv || response.data?.data || null;
    
    return {
      success: true,
      cv: cv,
      message: response.data?.message || 'CV retrieved successfully'
    };
  } catch (error) {
    console.error('❌ Error fetching CV:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch CV',
      cv: null
    };
  }
};

// Create new CV
export const createNewCV = async (cvData) => {
  try {
    console.log('📤 Creating new CV:', cvData);
    
    const response = await api.post('/cvs/create_new_cv', cvData);
    
    return {
      success: true,
      cv: response.data?.cv || response.data?.data || null,
      cv_id: response.data?.cv?.id || response.data?.data?.id,
      message: response.data?.message || 'CV created successfully'
    };
  } catch (error) {
    console.error('❌ Error creating CV:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create CV',
      errors: error.response?.data?.errors || {}
    };
  }
};

// Delete CV
export const deleteCV = async (id) => {
  try {
    console.log(`🗑️ Deleting CV with ID: ${id}`);
    const response = await api.delete(`/cvs/delete_cv/${id}`);
    
    return {
      success: true,
      message: response.data?.message || 'CV deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting CV:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete CV'
    };
  }
};

// Add new works to CV
export const addWorksToCV = async (cvId, works) => {
  try {
    console.log(`📤 Adding works to CV ${cvId}:`, works);
    
    const response = await api.post(`/cvs/add_new_works/${cvId}`, { works });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Works added successfully'
    };
  } catch (error) {
    console.error('❌ Error adding works:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add works'
    };
  }
};

// Remove works from CV
export const removeWorksFromCV = async (cvId, workIds) => {
  try {
    console.log(`🗑️ Removing works from CV ${cvId}:`, workIds);
    
    const response = await api.delete(`/cvs/delete_works/${cvId}`, {
      data: { work_ids: workIds }
    });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Works removed successfully'
    };
  } catch (error) {
    console.error('❌ Error removing works:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to remove works'
    };
  }
};

// Add new educations to CV
export const addEducationsToCV = async (cvId, educations) => {
  try {
    console.log(`📤 Adding educations to CV ${cvId}:`, educations);
    
    const response = await api.post(`/cvs/add_new_educations/${cvId}`, { educations });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Educations added successfully'
    };
  } catch (error) {
    console.error('❌ Error adding educations:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add educations'
    };
  }
};

// Remove educations from CV
export const removeEducationsFromCV = async (cvId, educationIds) => {
  try {
    console.log(`🗑️ Removing educations from CV ${cvId}:`, educationIds);
    
    const response = await api.delete(`/cvs/delete_educations/${cvId}`, {
      data: { education_ids: educationIds }
    });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Educations removed successfully'
    };
  } catch (error) {
    console.error('❌ Error removing educations:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to remove educations'
    };
  }
};

// Add new languages to CV
export const addLanguagesToCV = async (cvId, languages) => {
  try {
    console.log(`📤 Adding languages to CV ${cvId}:`, languages);
    
    const response = await api.post(`/cvs/add_new_languages/${cvId}`, { languages });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Languages added successfully'
    };
  } catch (error) {
    console.error('❌ Error adding languages:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add languages'
    };
  }
};

// Remove languages from CV
export const removeLanguagesFromCV = async (cvId, languageIds) => {
  try {
    console.log(`🗑️ Removing languages from CV ${cvId}:`, languageIds);
    
    const response = await api.delete(`/cvs/delete_languages/${cvId}`, {
      data: { language_ids: languageIds }
    });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Languages removed successfully'
    };
  } catch (error) {
    console.error('❌ Error removing languages:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to remove languages'
    };
  }
};

// Add new skills to CV
export const addSkillsToCV = async (cvId, skills) => {
  try {
    console.log(`📤 Adding skills to CV ${cvId}:`, skills);
    
    const response = await api.post(`/cvs/add_new_skills/${cvId}`, { skills });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Skills added successfully'
    };
  } catch (error) {
    console.error('❌ Error adding skills:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add skills'
    };
  }
};

// Remove skills from CV
export const removeSkillsFromCV = async (cvId, skillIds) => {
  try {
    console.log(`🗑️ Removing skills from CV ${cvId}:`, skillIds);
    
    const response = await api.delete(`/cvs/delete_skills/${cvId}`, {
      data: { skill_ids: skillIds }
    });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Skills removed successfully'
    };
  } catch (error) {
    console.error('❌ Error removing skills:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to remove skills'
    };
  }
};

// Add new contacts to CV
export const addContactsToCV = async (cvId, contacts) => {
  try {
    console.log(`📤 Adding contacts to CV ${cvId}:`, contacts);
    
    const response = await api.post(`/cvs/add_new_contacts/${cvId}`, { contacts });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Contacts added successfully'
    };
  } catch (error) {
    console.error('❌ Error adding contacts:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add contacts'
    };
  }
};

// Remove contacts from CV
export const removeContactsFromCV = async (cvId, contactIds) => {
  try {
    console.log(`🗑️ Removing contacts from CV ${cvId}:`, contactIds);
    
    const response = await api.delete(`/cvs/delete_contacts/${cvId}`, {
      data: { contact_ids: contactIds }
    });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Contacts removed successfully'
    };
  } catch (error) {
    console.error('❌ Error removing contacts:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to remove contacts'
    };
  }
};

// Update CV status (approve/reject)
export const updateCVStatus = async (id, status, remark = '') => {
  try {
    console.log(`📤 Updating CV ${id} status to: ${status}`);
    
    const response = await api.put(`/cvs/update_status/${id}`, {
      status: status,
      remark: remark,
      updated_at: new Date().toISOString()
    });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || `CV ${status} successfully`
    };
  } catch (error) {
    console.error('❌ Error updating CV status:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update CV status'
    };
  }
};

// Bulk update CV status
export const bulkUpdateCVStatus = async (cvIds, status, remark = '') => {
  try {
    console.log(`📤 Bulk updating CVs status to: ${status}`, cvIds);
    
    const response = await api.put('/cvs/bulk_update_status', {
      cv_ids: cvIds,
      status: status,
      remark: remark,
      updated_at: new Date().toISOString()
    });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || `CVs ${status} successfully`
    };
  } catch (error) {
    console.error('❌ Error bulk updating CV status:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update CVs'
    };
  }
};

// Get CV statistics
export const getCVStats = async () => {
  try {
    console.log('📤 Fetching CV statistics');
    
    const response = await api.get('/cvs/statistics');
    
    return {
      success: true,
      stats: response.data?.stats || {},
      message: response.data?.message || 'Statistics fetched successfully'
    };
  } catch (error) {
    console.error('❌ Error fetching CV statistics:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch statistics',
      stats: {}
    };
  }
};

// Export CV as PDF
export const exportCVAsPDF = async (id) => {
  try {
    console.log(`📤 Exporting CV ${id} as PDF`);
    
    const response = await api.get(`/cvs/export_pdf/${id}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cv_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: 'CV exported successfully'
    };
  } catch (error) {
    console.error('❌ Error exporting CV:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to export CV'
    };
  }
};

// Search CVs
export const searchCVs = async (query, params = {}) => {
  try {
    console.log('🔍 Searching CVs for:', query);
    
    const response = await api.get('/cvs/search', {
      params: { q: query, ...params }
    });
    
    const cvs = response.data?.cvs?.data || response.data?.data || [];
    
    return {
      success: true,
      cvs: cvs,
      total_count: response.data?.total_count || cvs.length
    };
  } catch (error) {
    console.error('❌ Error searching CVs:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to search CVs',
      cvs: []
    };
  }
};

// Helper function to build CV data for dropdown forms
export const buildCVFormData = (formData) => {
  console.log('🔨 Building CV form data from:', formData);
  
  // Map form data from template fields to backend structure
  return {
    name: formData['Full Name'] || formData.name || '',
    position: formData['Job Title'] || formData.position || '',
    summary: formData['Professional Summary'] || formData.summary || '',
    address: formData['Address'] || formData.address || null,
    
    // Map skills
    skills: (formData['Skills'] || formData.skills || []).map(skill => {
      if (typeof skill === 'string') {
        // Parse skill string like "PHP (Advanced)"
        const [skillName, proficiency] = skill.split('(');
        return {
          skill_name: skillName.trim(),
          proficiency_level: proficiency ? proficiency.replace(')', '').trim() : 'Intermediate'
        };
      }
      return skill;
    }),
    
    // Map educations
    educations: (formData['Education'] || formData.educations || []).map(edu => {
      if (typeof edu === 'string') {
        // Handle string format
        return {
          institution_name: edu || '',
          degree: formData['Highest Degree'] || 'Bachelor',
          field_of_study: formData['Major/Field'] || '',
          start_date: formData['Start Date'] || '2020-08-01',
          end_date: formData['End Date'] || formData['Graduation Year'] ? `${formData['Graduation Year']}-06-01` : '2024-06-01',
          is_current: false,
          description: formData['Description'] || ''
        };
      }
      return edu;
    }),
    
    // Map languages
    languages: (formData['Languages'] || formData.languages || []).map(lang => {
      if (typeof lang === 'string') {
        const [languageName, proficiency] = lang.split('(');
        return {
          language_name: languageName.trim(),
          proficiency_level: proficiency ? proficiency.replace(')', '').trim() : 'Intermediate'
        };
      }
      return lang;
    }),
    
    // Map works
    works: (formData['Work Experience'] || formData.works || []).map(work => {
      if (typeof work === 'string') {
        // Parse work experience string
        const matches = work.match(/(.+) at (.+) \((.+)\)/);
        if (matches) {
          return {
            company_name: matches[2],
            position: matches[1],
            start_date: '2020-01-01',
            end_date: '2023-12-31',
            experience_level: matches[3] || 'Mid Level',
            is_current: false
          };
        }
        return {
          company_name: work,
          position: 'Position not specified',
          start_date: '2020-01-01',
          end_date: '2023-12-31',
          experience_level: 'Mid Level',
          is_current: false
        };
      }
      return work;
    }),
    
    // Map contacts
    contacts: [
      ...(formData['Email'] ? [{ contact_type: 'Email', contact: formData['Email'] }] : []),
      ...(formData['Phone'] ? [{ contact_type: 'Phone', contact: formData['Phone'] }] : []),
      ...(formData['LinkedIn'] ? [{ contact_type: 'Linkedin', contact: formData['LinkedIn'] }] : []),
      ...(formData['Github'] ? [{ contact_type: 'Github', contact: formData['Github'] }] : []),
      ...(formData['Telegram'] ? [{ contact_type: 'Telegram', contact: formData['Telegram'] }] : []),
      ...(formData['Portfolio'] ? [{ contact_type: 'Portfolio', contact: formData['Portfolio'] }] : [])
    ].filter(contact => contact.contact)
  };
};

// Helper function to format CV for display
export const formatCVForDisplay = (cv) => {
  if (!cv) return null;
  
  return {
    ...cv,
    id: cv.id,
    user_name: cv.name || 'Unknown',
    template_name: 'Professional CV',
    template_description: 'Standard CV template',
    submitted_date: cv.created_at || new Date().toISOString(),
    status: cv.status || 'pending',
    role: 'Admin',
    form_data: {
      'Full Name': cv.name,
      'Job Title': cv.position,
      'Email': cv.contacts?.find(c => c.contact_type === 'Email')?.contact,
      'Phone': cv.contacts?.find(c => c.contact_type === 'Phone')?.contact,
      'Address': cv.address,
      'LinkedIn': cv.contacts?.find(c => c.contact_type === 'Linkedin')?.contact,
      'Github': cv.contacts?.find(c => c.contact_type === 'Github')?.contact,
      'Highest Degree': cv.educations?.[0]?.degree,
      'Major/Field': cv.educations?.[0]?.field_of_study,
      'University': cv.educations?.[0]?.institution_name,
      'Graduation Year': cv.educations?.[0]?.end_date?.split('-')[0],
      'Work Experience': cv.works?.map(work => 
        `${work.position} at ${work.company_name} (${work.experience_level})`
      ).join('\n'),
      'Skills': cv.skills?.map(skill => 
        `${skill.skill_name} (${skill.proficiency_level})`
      ).join('\n'),
      'Languages': cv.languages?.map(lang => 
        `${lang.language_name} (${lang.proficiency_level})`
      ).join('\n'),
      'Professional Summary': cv.summary
    }
  };
};

// Get CV status badge class
export const getCVStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Export all functions
export default {
  CV_CONSTANTS,
  getAllCVs,
  getCVById,
  createNewCV,
  deleteCV,
  addWorksToCV,
  removeWorksFromCV,
  addEducationsToCV,
  removeEducationsFromCV,
  addLanguagesToCV,
  removeLanguagesFromCV,
  addSkillsToCV,
  removeSkillsFromCV,
  addContactsToCV,
  removeContactsFromCV,
  updateCVStatus,
  bulkUpdateCVStatus,
  getCVStats,
  exportCVAsPDF,
  searchCVs,
  buildCVFormData,
  formatCVForDisplay,
  getCVStatusBadgeClass
};