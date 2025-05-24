// api/laporanApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/laporan';

export const getLaporanKunjungan = async (tanggalAwal, tanggalAkhir) => {
  try {
    const response = await axios.get(`${API_URL}/kunjungan`, {
      params: {
        tanggal_awal: tanggalAwal,
        tanggal_akhir: tanggalAkhir
      }
    });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil laporan kunjungan:', error);
    throw error;
  }
};