import axios from 'axios';

const API_URL = 'http://localhost:5000/api/booking';

export const checkBookingAvailability = async (tanggal) => {
  try {
    const response = await axios.get(`${API_URL}/cek-ketersediaan`, {
      params: { tanggal }
    });
    return response.data;
  } catch (error) {
    console.error('Gagal cek ketersediaan booking:', error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(`${API_URL}/booking`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Gagal membuat booking:', error.response?.data || error.message);
    throw error;
  }
};


export const getAllBooking = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil semua booking:', error);
    throw error;
  }
};
