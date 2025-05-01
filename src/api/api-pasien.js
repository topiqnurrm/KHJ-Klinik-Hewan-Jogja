import axios from 'axios';

// Fungsi untuk mendapatkan token autentikasi dari penyimpanan lokal
const getAuthToken = () => {
  // Coba ambil dari localStorage atau sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token;
};

// Fungsi untuk mendapatkan user saat ini
const getCurrentUser = () => {
  // Coba ambil dari localStorage atau sessionStorage
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Fungsi helper untuk membuat headers dengan token autentikasi
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const getAllPasien = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/pasien", getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil semua data pasien:", error);
    throw error;
  }
};

export const getPasienByUserId = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/pasien/user/${userId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data pasien:", error);
    throw error;
  }
};

export const deletePasienById = async (id) => {
  try {
    const user = getCurrentUser();
    if (!user || user.aktor !== 'superadmin') {
      throw new Error("Hanya superadmin yang dapat menghapus data pasien");
    }

    const response = await axios.delete(`http://localhost:5000/api/pasien/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus pasien:", error);
    throw error;
  }
};

export const updatePasien = async (pasienId, pasienData) => {
  try {
    const user = getCurrentUser();
    if (!user || user.aktor !== 'superadmin') {
      throw new Error("Hanya superadmin yang dapat mengubah data pasien");
    }
    
    console.log("Sending update for pasien:", pasienId);
    console.log("Update data:", pasienData);
    
    const response = await axios.put(
      `http://localhost:5000/api/pasien/${pasienId}`, 
      pasienData, 
      getAuthHeaders()
    );
    
    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Gagal update data pasien:', error.response?.data || error.message);
    throw error;
  }
};

export const createPasien = async (pasienData) => {
  try {
    const user = getCurrentUser();
    if (!user || user.aktor !== 'superadmin') {
      throw new Error("Hanya superadmin yang dapat menambah data pasien");
    }
    
    const response = await axios.post(
      "http://localhost:5000/api/pasien", 
      pasienData, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Gagal menambah pasien baru:", error);
    throw error;
  }
};