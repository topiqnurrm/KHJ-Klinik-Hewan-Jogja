import axios from 'axios';

// Base API URL
const API_URL = 'http://localhost:5000/api/medical_record';

// Fetch single booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await axios.get(`${API_URL}/booking/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil detail booking:', error);
    throw error;
  }
};

// Fetch kunjungan by booking ID
export const getKunjunganByBookingId = async (bookingId) => {
  try {
    const response = await axios.get(`${API_URL}/kunjungan/by-booking/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil kunjungan:', error);
    if (error.response && error.response.status === 404) {
      return null; // Return null if kunjungan not found
    }
    throw error;
  }
};

// Fetch rekam medis by kunjungan ID
export const getRekamMedisByKunjunganId = async (kunjunganId) => {
  try {
    const response = await axios.get(`${API_URL}/rekam-medis/by-kunjungan/${kunjunganId}`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil rekam medis:', error);
    if (error.response && error.response.status === 404) {
      return null; // Return null if rekam medis not found
    }
    throw error;
  }
};

// Fetch retribusi by kunjungan ID
export const getRetribusiByKunjunganId = async (kunjunganId) => {
  try {
    const response = await axios.get(`${API_URL}/retribusi/by-kunjungan/${kunjunganId}`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil retribusi:', error);
    if (error.response && error.response.status === 404) {
      return null; // Return null if retribusi not found
    }
    throw error;
  }
};

// Combined function to get all medical record data at once
export const getAllMedicalRecordData = async (bookingId) => {
  try {
    // Step 1: Get booking data
    const booking = await getBookingById(bookingId);
    
    // Step 2: Get kunjungan data
    let kunjungan = null;
    try {
      kunjungan = await getKunjunganByBookingId(bookingId);
    } catch (err) {
      if (err.response?.status !== 404) {
        throw err;
      }
    }
    
    // Step 3: If kunjungan exists, get rekam medis and retribusi
    let rekamMedis = null;
    let retribusi = null;
    
    if (kunjungan) {
      try {
        rekamMedis = await getRekamMedisByKunjunganId(kunjungan._id);
      } catch (err) {
        if (err.response?.status !== 404) {
          throw err;
        }
      }
      
      try {
        retribusi = await getRetribusiByKunjunganId(kunjungan._id);
      } catch (err) {
        if (err.response?.status !== 404) {
          throw err;
        }
      }
    }
    
    return {
      booking,
      kunjungan,
      rekamMedis,
      retribusi
    };
  } catch (error) {
    console.error('Gagal mengambil data rekam medis:', error);
    throw error;
  }
};