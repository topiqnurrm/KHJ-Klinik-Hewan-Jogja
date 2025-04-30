import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Simplified base URL

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Gagal fetch data users:', error);
    return [];
  }
};

export const getKlienUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/klien`);
    return response.data;
  } catch (error) {
    console.error('Gagal fetch data klien:', error);
    return [];
  }
};

export const getUserById = async (_id) => {
  try {
    const response = await axios.get(`${API_URL}/users/${_id}`);
    return response.data;
  } catch (error) {
    console.error('Gagal fetch user by ID:', error);
    return null;
  }
};

export const deleteUser = async (_id) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${_id}`);
    return response.data;
  } catch (error) {
    console.error('Gagal hapus user:', error);
    throw error;
  }
};

export const updateUser = async (_id, userData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${_id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Gagal update user:', error);
    throw error;
  }
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await axios.post(`${API_URL}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    console.error('Upload gagal:', err);
    return null;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} - Created user
 */
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};