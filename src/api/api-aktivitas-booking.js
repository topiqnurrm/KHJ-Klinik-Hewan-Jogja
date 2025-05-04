import axios from 'axios';

// API URL for booking activities
const AKTIVITAS_BOOKING_API_URL = 'http://localhost:5000/api/aktivitas-booking';

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    return user;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

// Check if the current user has admin permissions
export const hasAdminPermission = () => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return ['superadmin', 'administrasi'].includes(user.aktor);
};

// Get all bookings with enhanced information
export const getAllBookings = async () => {
  try {
    const response = await axios.get(`${AKTIVITAS_BOOKING_API_URL}`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data booking:', error);
    throw error;
  }
};

// Get a single booking by ID
export const getBookingById = async (id) => {
  try {
    const response = await axios.get(`${AKTIVITAS_BOOKING_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil data booking dengan ID ${id}:`, error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (id, status) => {
  // Check permissions first
  if (!hasAdminPermission()) {
    throw new Error('Tidak memiliki izin untuk mengubah status booking');
  }
  
  try {
    const response = await axios.put(`${AKTIVITAS_BOOKING_API_URL}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Gagal mengupdate status booking dengan ID ${id}:`, error);
    throw error;
  }
};

// Add note to a booking
export const addNoteToBooking = async (id, noteData) => {
  // Check permissions first
  if (!hasAdminPermission()) {
    throw new Error('Tidak memiliki izin untuk menambahkan catatan pada booking');
  }
  
  try {
    const response = await axios.post(`${AKTIVITAS_BOOKING_API_URL}/${id}/catatan`, noteData);
    return response.data;
  } catch (error) {
    console.error(`Gagal menambahkan catatan ke booking dengan ID ${id}:`, error);
    throw error;
  }
};

// Delete a booking
export const deleteBookingById = async (id) => {
  // Check permissions first
  if (!hasAdminPermission()) {
    throw new Error('Tidak memiliki izin untuk menghapus booking');
  }
  
  try {
    const response = await axios.delete(`${AKTIVITAS_BOOKING_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal menghapus booking dengan ID ${id}:`, error);
    throw error;
  }
};

// Filter bookings by date range
export const filterBookingsByDateRange = async (startDate, endDate) => {
  try {
    const allBookings = await getAllBookings();
    
    // Client-side filtering by date
    return allBookings.filter(booking => {
      const bookingDate = new Date(booking.tanggal_booking);
      return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate);
    });
  } catch (error) {
    console.error('Gagal memfilter booking berdasarkan tanggal:', error);
    throw error;
  }
};

// Search bookings by keyword
export const searchBookings = async (keyword) => {
  try {
    const allBookings = await getAllBookings();
    const lowerKeyword = keyword.toLowerCase();
    
    // Client-side search
    return allBookings.filter(booking => {
      return (
        (booking.nama_hewan && booking.nama_hewan.toLowerCase().includes(lowerKeyword)) ||
        (booking.klien && booking.klien.toLowerCase().includes(lowerKeyword)) ||
        (booking.jenis_hewan && booking.jenis_hewan.toLowerCase().includes(lowerKeyword)) ||
        (booking.jenis_layanan && booking.jenis_layanan.toLowerCase().includes(lowerKeyword)) ||
        (booking.status && booking.status.toLowerCase().includes(lowerKeyword)) ||
        (booking.catatan && booking.catatan.toLowerCase().includes(lowerKeyword))
      );
    });
  } catch (error) {
    console.error('Gagal mencari booking:', error);
    throw error;
  }
};