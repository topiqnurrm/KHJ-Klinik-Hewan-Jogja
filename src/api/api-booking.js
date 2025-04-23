import axios from 'axios';

// API URL masing-masing endpoint
const BOOKING_API_URL = 'http://localhost:5000/api/booking';
const BOOKING_RETRIBUSI_API_URL = 'http://localhost:5000/api/bookings-retribusi';

// === Booking API ===
export const checkBookingAvailability = async (tanggal) => {
  try {
    const response = await axios.get(`${BOOKING_API_URL}/cek-ketersediaan`, {
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
    const response = await axios.post(`${BOOKING_API_URL}/booking`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Gagal membuat booking:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllBooking = async () => {
  try {
    const response = await axios.get(`${BOOKING_API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil semua booking:', error);
    throw error;
  }
};

// === Booking + Retribusi API ===
export const getBookingWithRetribusi = async () => {
  try {
    const response = await axios.get(`${BOOKING_RETRIBUSI_API_URL}/with-retribusi`);
    return response.data;
  } catch (error) {
    console.error('Gagal ambil booking + retribusi:', error);
    throw error;
  }
};

export const checkUnfinishedBooking = async (id_pasien) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/booking/ada-booking-belum-selesai/${id_pasien}`);
    console.log("Cek unfinished booking response:", response.data); // Debug
    return response.data.ada;
  } catch (error) {
    console.error("Gagal cek booking belum selesai:", error);
    return false;
  }
};



export const getAllBookingByUserId = async (id_pasien) => {
  try {
    const response = await axios.get(`${BOOKING_API_URL}/by-user/${id_pasien}`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil booking user:', error);
    throw error;
  }
};



export const checkUnfinishedBookingByUserId = async (id_user) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/booking/cek-booking-user/${id_user}`);
    return response.data.ada;
  } catch (error) {
    console.error("Gagal cek booking user:", error);
    return false;
  }
};
