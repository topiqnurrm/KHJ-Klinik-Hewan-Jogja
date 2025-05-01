import axios from 'axios';

export const getAllPasien = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/pasien");
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil semua data pasien:", error);
    throw error;
  }
};

export const getPasienByUserId = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/pasien/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data pasien:", error);
    throw error;
  }
};

export const deletePasienById = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:5000/api/pasien/${id}`);
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus pasien:", error);
    throw error;
  }
};

export const updatePasien = async (pasienId, pasienData) => {
  try {
    console.log("Sending update for pasien:", pasienId);
    console.log("Update data:", pasienData);
    
    const response = await axios.put(`http://localhost:5000/api/pasien/${pasienId}`, pasienData);
    
    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Gagal update data pasien:', error.response?.data || error.message);
    throw error;
  }
};

export const createPasien = async (pasienData) => {
  try {
    const response = await axios.post("http://localhost:5000/api/pasien", pasienData);
    return response.data;
  } catch (error) {
    console.error("Gagal menambah pasien baru:", error);
    throw error;
  }
};