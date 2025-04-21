import axios from 'axios';

const API_URL = 'http://localhost:5000/api/kunjungan';

export const getAllKunjungan = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil semua kunjungan:', error);
    throw error;
  }
};

export const createKunjungan = async (kunjunganData) => {
  try {
    const response = await axios.post(`${API_URL}/tambah`, kunjunganData);
    return response.data;
  } catch (error) {
    console.error('Gagal menambah kunjungan:', error.response?.data || error.message);
    throw error;
  }
};
