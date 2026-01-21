import api from '../apis/axios';

/**
 * Get user details after login
 * @returns {Promise} User details from the API
 */
export const getUserDetail = async () => {
  try {
    const response = await api.get('/auth/get_detail_user');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching user details:', error.response?.data || error.message);
    throw error;
  }
};

export default getUserDetail;
