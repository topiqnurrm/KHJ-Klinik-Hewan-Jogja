// api-user-profile.js - Khusus untuk pengeditan profil user
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Update profile user - fungsi baru untuk pengeditan profil user
 * @param {string} userId - ID user yang ingin diupdate
 * @param {Object} userData - Data profil yang ingin diupdate
 * @returns {Promise<Object>} - Response data
 */
export const updateUserProfile = async (userId, userData) => {
  try {
    console.log("Starting updateUserProfile with ID:", userId);
    console.log("Profile update data:", JSON.stringify(userData, null, 2));
    
    // Get authentication token from localStorage
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    const token = currentUser.token;
    console.log("Auth token available:", !!token);
    
    // Validasi user hanya bisa edit data miliknya sendiri
    if (userId !== currentUser._id) {
      console.error("User trying to edit someone else's profile");
      throw { 
        response: { 
          status: 403, 
          data: { message: "Tidak diizinkan mengedit profil pengguna lain" } 
        }
      };
    }
    
    // Create form data untuk menangani upload file/gambar
    const formData = new FormData();
    
    // Tambahkan semua field ke FormData
    Object.keys(userData).forEach(key => {
      // Lewati nilai null atau undefined
      if (userData[key] === null || userData[key] === undefined) {
        console.log(`Skipping field '${key}': value is null or undefined`);
        return;
      }
      
      // Untuk objek file (upload gambar)
      if (key === 'gambar' && userData[key] instanceof File) {
        console.log(`Adding file '${key}': ${userData[key].name}, size: ${userData[key].size} bytes`);
        formData.append('gambar', userData[key]);
      } 
      // Untuk field lainnya yang memiliki nilai
      else {
        console.log(`Adding field '${key}': ${userData[key]}`);
        formData.append(key, userData[key]);
      }
    });
    
    // Log FormData untuk debugging
    console.log("FormData contents:");
    for (const pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: [File: ${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes]`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    
    console.log("Making API request to:", `${API_URL}/user-edit/profile/${userId}`);
    
    // Kirim request ke endpoint baru untuk edit profil
    const response = await axios.put(
      `${API_URL}/user-edit/profile/${userId}`, 
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
    console.error('Gagal update profil:', error);
    console.error('Error details:', error.response?.data || 'No detailed error data');
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

/**
 * Kirim email verifikasi setelah update profil
 * @param {string} email - Email tujuan
 * @param {string} password - Password user (plain text)
 * @returns {Promise<Object>} - Response data
 */
export const sendProfileVerificationEmail = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/user-edit/send-profile-verification`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Gagal mengirim email verifikasi profil:', error);
    throw error;
  }
};