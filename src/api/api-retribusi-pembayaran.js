import axios from 'axios';

const API_URL = 'http://localhost:5000/api/retribusi-pembayaran';

export const getAllRetribusi = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data retribusi pembayaran:', error);
    throw error;
  }
};
