import axios from 'axios';

// API URL masing-masing endpoint
const BOOKING_API_URL = 'http://localhost:5000/api/booking';
const BOOKING_RETRIBUSI_API_URL = 'http://localhost:5000/api/bookings-retribusi';

export const checkBookingAvailability = async (tanggal, excludeBookingId = null) => {
  try {
    const response = await axios.get(`${BOOKING_API_URL}/cek-ketersediaan`, {
      params: { 
        tanggal,
        excludeBookingId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Gagal cek ketersediaan booking:', error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    // Make sure services include both name and type
    if (bookingData.pelayanans1) {
      bookingData.pelayanans1 = bookingData.pelayanans1.map(service => {
        // If we have a service object with proper fields, ensure it's correctly formatted
        if (service.id_pelayanan && service.nama && service.jenis_layanan) {
          return {
            id_pelayanan: service.id_pelayanan,
            nama: service.nama,
            jenis_layanan: service.jenis_layanan
          };
        }
        // Otherwise, just return the service as is
        return service;
      });
    }
    
    // Add logging to see what we're sending
    console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));
    
    const response = await axios.post(`${BOOKING_API_URL}/booking`, bookingData);
    console.log('Booking created successfully:', response.data);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error('Gagal membuat booking:', {
      message: error.message,
      response: error.response?.data,
      request: error.request ? 'Request was made but no response received' : null,
      config: error.config
    });
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
    const response = await axios.get(`${BOOKING_API_URL}/ada-booking-belum-selesai/${id_pasien}`);
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
    const response = await axios.get(`${BOOKING_API_URL}/cek-booking-user/${id_user}`);
    return response.data.ada;
  } catch (error) {
    console.error("Gagal cek booking user:", error);
    return false;
  }
};

export const deleteBooking = async (bookingId) => {
  try {
    const response = await axios.delete(`${BOOKING_API_URL}/delete/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Gagal menghapus booking:', error.response?.data || error.message);
    throw error;
  }
};

export const updateBooking = async (bookingId, bookingData) => {
  try {
    const response = await axios.put(`${BOOKING_API_URL}/update/${bookingId}`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Gagal memperbarui booking:', error.response?.data || error.message);
    throw error;
  }
};