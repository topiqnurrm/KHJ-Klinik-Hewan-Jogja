import axios from 'axios';

const API_URL = 'http://localhost:5000/api/aktivitas-kasir';

// Mendapatkan semua data pembayaran untuk tampilan kasir
export const getAllPembayaran = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data pembayaran:', error);
    throw error;
  }
};

// Mendapatkan detail pembayaran berdasarkan ID
export const getPembayaranDetail = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/detail/${id}`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil detail pembayaran:', error);
    throw error;
  }
};

// Mengupdate status pembayaran dan proses pembayaran
export const updateStatusPembayaran = async (id, dataUpdate) => {
  try {
    // Pastikan data dikirimkan dengan format yang benar
    const response = await axios.put(`${API_URL}/update/${id}`, dataUpdate);
    return response.data;
  } catch (error) {
    console.error('Gagal mengupdate status pembayaran:', error);
    throw error;
  }
};

// Mencetak Retribusi Pembayaran
export const printRetribusiPembayaran = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/print-retribusi/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Gagal mencetak retribusi pembayaran:', error);
    throw error;
  }
};

// Mencetak Rekam Medis
export const printRekamMedis = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/print-rekam-medis/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Gagal mencetak rekam medis:', error);
    throw error;
  }
};
