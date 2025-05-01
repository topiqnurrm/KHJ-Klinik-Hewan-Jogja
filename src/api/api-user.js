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

/**
 * Delete user with superadmin validation
 * @param {string} _id - User ID to delete
 * @returns {Promise<Object>} - Response data
 */
export const deleteUser = async (_id) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    const token = currentUser.token;
    
    // Check if user is superadmin
    if (currentUser.aktor !== "superadmin") {
      throw { 
        response: { 
          status: 403, 
          data: { message: "Tidak memiliki izin untuk menghapus user. Hanya Superadmin yang diizinkan." } 
        }
      };
    }
    
    const response = await axios.delete(`${API_URL}/users/${_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Gagal hapus user:', error);
    throw error;
  }
};

/**
 * Enhanced update user function with debugging and superadmin validation
 * @param {string} _id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} - Response data
 */
export const updateUser = async (_id, userData) => {
  try {
    console.log("Starting updateUser with ID:", _id);
    console.log("Update data received:", JSON.stringify(userData, null, 2));
    
    // Get authentication token from localStorage
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    const token = currentUser.token;
    console.log("Auth token available:", !!token); // Log if token exists
    
    // Check if user is superadmin
    if (currentUser.aktor !== "superadmin") {
      throw { 
        response: { 
          status: 403, 
          data: { message: "Tidak memiliki izin untuk mengubah user. Hanya Superadmin yang diizinkan." } 
        }
      };
    }
    
    // Create form data to handle file uploads
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(userData).forEach(key => {
      // Skip null or undefined values
      if (userData[key] === null || userData[key] === undefined) {
        console.log(`Skipping field '${key}': value is null or undefined`);
        return;
      }
      
      // For file objects (image upload)
      if (key === 'gambar' && userData[key] instanceof File) {
        console.log(`Adding file '${key}': ${userData[key].name}, size: ${userData[key].size} bytes`);
        formData.append('gambar', userData[key]);
      } 
      // For all other fields that have values
      else {
        console.log(`Adding field '${key}': ${userData[key]}`);
        formData.append(key, userData[key]);
      }
    });
    
    // Log FormData entries for debugging
    console.log("FormData contents:");
    for (const pair of formData.entries()) {
      // Don't log file content, just name and type
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: [File: ${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes]`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    
    console.log("Making API request to:", `http://localhost:5000/api/users/${_id}`);
    
    // Make API request with FormData and authentication
    const response = await axios.put(
      `http://localhost:5000/api/users/${_id}`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      }
    );
    
    console.log("API response received:", response.status);
    return response.data;
  } catch (error) {
    console.error('Gagal update user:', error);
    console.error('Error details:', error.response?.data || 'No detailed error data');
    console.error('Error status:', error.response?.status);
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
 * Create a new user with superadmin validation
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} - Created user
 */
export const createUser = async (userData) => {
  try {
    // Get authentication token from localStorage
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    
    // Check if user is superadmin
    if (currentUser.aktor !== "superadmin") {
      throw { 
        response: { 
          status: 403, 
          data: { message: "Tidak memiliki izin untuk membuat user baru. Hanya Superadmin yang diizinkan." } 
        }
      };
    }
    
    const token = currentUser.token;
    
    const response = await axios.post(`${API_URL}/users`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Kirim email verifikasi ke user
 * @param {string} email - Email tujuan
 * @param {string} password - Password user (plain text)
 * @returns {Promise<Object>} - Response data
 */
export const sendVerificationEmail = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/send-verification-email`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Gagal mengirim email verifikasi:', error);
    throw error;
  }
};