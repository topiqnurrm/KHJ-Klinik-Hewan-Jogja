import axios from 'axios';

// API URL for kunjungan activities
const AKTIVITAS_KUNJUNGAN_API_URL = 'http://localhost:5000/api/aktivitas-kunjungan2';
const BOOKING_API_URL = 'http://localhost:5000/api/booking';

// Status values that should be displayed in the kunjungan view
const VALID_STATUSES = [
  'sedang diperiksa',
  'dirawat inap',
];

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

// Check if the current user has edit permissions for kunjungan (only dokter and superadmin)
export const hasEditPermission = () => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return ['superadmin', 'dokter','paramedis'].includes(user.aktor);
};

// Check if the current user has add permissions for kunjungan (only administrasi and superadmin)
export const hasAddPermission = () => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return ['superadmin', 'administrasi'].includes(user.aktor);
};

// Get all kunjungan with filtered status
export const getAllKunjungan = async () => {
  try {
    const response = await axios.get(`${AKTIVITAS_KUNJUNGAN_API_URL}`);
    
    // Format dates and filter by VALID_STATUSES
    const formattedKunjungan = response.data
      .filter(kunjungan => VALID_STATUSES.includes(kunjungan.status))
      .map(kunjungan => ({
        ...kunjungan,
        tanggal_checkin_display: new Date(kunjungan.tanggal_checkin).toLocaleString(),
        keluhan: kunjungan.keluhan || 'N/A',
        kategori: kunjungan.kategori || 'kesayangan / satwa liar',
        // Pastikan field ras, umur, dan jenis_kelamin menggunakan nama yang konsisten
        jenis_layanan: kunjungan.jenis_layanan || 'N/A',
        layanan: kunjungan.layanan || 'N/A',
        // Menggunakan nama field persis seperti yang dikirim dari backend
        jenis_kelamin: kunjungan.jenis_kelamin || '-',
        ras: kunjungan.ras || '-',
        // Pastikan menggunakan field yang benar, bisa umur atau umur_hewan
        umur: kunjungan.umur || '-'
      }));
    
    console.log('Data kunjungan dari API:', formattedKunjungan);
    return formattedKunjungan;
  } catch (error) {
    console.error('Gagal mengambil data kunjungan:', error);
    throw error;
  }
};

// Get a single kunjungan by ID
export const getKunjunganById = async (id) => {
  try {
    const response = await axios.get(`${AKTIVITAS_KUNJUNGAN_API_URL}/${id}`);
    
    // Verify the status is valid before returning
    if (!VALID_STATUSES.includes(response.data.status)) {
      throw new Error('Kunjungan tidak tersedia atau tidak dalam status yang valid');
    }
    
    // Tambahkan console.log untuk debugging
    console.log('Data kunjungan detail dari API:', response.data);
    
    return {
      ...response.data,
      tanggal_checkin_display: new Date(response.data.tanggal_checkin).toLocaleString(),
      keluhan: response.data.keluhan || 'N/A',
      kategori: response.data.kategori || 'kesayangan / satwa liar',
      // Pastikan field ini menggunakan nama yang benar dan konsisten
      jenis_layanan: response.data.jenis_layanan || 'N/A',
      layanan: response.data.layanan || 'N/A',
      jenis_kelamin: response.data.jenis_kelamin || '-',
      ras: response.data.ras || '-',
      // Coba ambil dari umur_hewan jika umur tidak ada
      umur: response.data.umur || response.data.umur_hewan || '-'
    };
  } catch (error) {
    console.error(`Gagal mengambil data kunjungan dengan ID ${id}:`, error);
    throw error;
  }
};

// Update kunjungan status (which updates the related booking)
export const updateKunjunganStatus = async (id, status) => {
  // Check permissions first
  if (!hasEditPermission()) {
    throw new Error('Tidak memiliki izin untuk mengubah status kunjungan');
  }
  
  // Validate that the status is one of the valid statuses
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Status ${status} tidak valid. Status yang valid adalah: ${VALID_STATUSES.join(', ')}`);
  }
  
  try {
    const response = await axios.put(`${AKTIVITAS_KUNJUNGAN_API_URL}/${id}/status`, { 
      status,
      userId: getCurrentUser()?._id // Send user ID for backend validation
    });
    return response.data;
  } catch (error) {
    console.error(`Gagal mengupdate status kunjungan dengan ID ${id}:`, error);
    throw error;
  }
};

// Add administration record to kunjungan
export const addAdministrasiToKunjungan = async (id, adminData) => {
  // Check permissions first
  if (!hasEditPermission()) {
    throw new Error('Tidak memiliki izin untuk menambahkan catatan administrasi');
  }
  
  // Validate status if it's present in the adminData
  if (adminData.status_kunjungan && !VALID_STATUSES.includes(adminData.status_kunjungan)) {
    throw new Error(`Status ${adminData.status_kunjungan} tidak valid. Status yang valid adalah: ${VALID_STATUSES.join(', ')}`);
  }
  
  try {
    const response = await axios.post(`${AKTIVITAS_KUNJUNGAN_API_URL}/${id}/administrasi`, {
      ...adminData,
      userId: getCurrentUser()?._id // Send user ID for backend validation
    });
    return response.data;
  } catch (error) {
    console.error(`Gagal menambahkan catatan administrasi ke kunjungan dengan ID ${id}:`, error);
    throw error;
  }
};

// Search kunjungan by keyword
export const searchKunjungan = async (keyword) => {
  try {
    const allKunjungan = await getAllKunjungan();
    const lowerKeyword = keyword.toLowerCase();
    
    // Client-side search with additional fields
    return allKunjungan.filter(kunjungan => {
      // Create a string with all searchable fields including new fields
      const searchableText = `
        ${kunjungan.klien || ''}
        ${kunjungan.nama_hewan || ''}
        ${kunjungan.nomor_antri || ''}
        ${kunjungan.status || ''}
        ${kunjungan.tanggal_checkin_display || ''}
        ${kunjungan.jenis_layanan || ''}
        ${kunjungan.layanan || ''}
        ${kunjungan.jenis_kelamin || ''}
        ${kunjungan.ras || ''}
        ${kunjungan.umur || ''}
      `.toLowerCase();
      
      return searchableText.includes(lowerKeyword);
    });
  } catch (error) {
    console.error('Gagal mencari kunjungan:', error);
    throw error;
  }
};

// Delete a kunjungan
export const deleteKunjunganById = async (id) => {
  // Only superadmin can delete
  const user = getCurrentUser();
  if (!user || user.aktor !== 'superadmin') {
    throw new Error('Tidak memiliki izin untuk menghapus kunjungan');
  }
  
  try {
    const response = await axios.delete(`${AKTIVITAS_KUNJUNGAN_API_URL}/${id}`, {
      data: { userId: user._id } // Send user ID for backend validation
    });
    return response.data;
  } catch (error) {
    console.error(`Gagal menghapus kunjungan dengan ID ${id}:`, error);
    throw error;
  }
};

// Create a new kunjungan
export const createKunjungan = async (kunjunganData) => {
  // Check permissions first
  if (!hasAddPermission()) {
    throw new Error('Tidak memiliki izin untuk membuat kunjungan baru');
  }
  
  try {
    const response = await axios.post(`${AKTIVITAS_KUNJUNGAN_API_URL}`, {
      ...kunjunganData,
      userId: getCurrentUser()?._id // Send user ID for backend validation
    });
    return response.data;
  } catch (error) {
    console.error('Gagal membuat kunjungan baru:', error);
    throw error;
  }
};

// Get available bookings that can be used for kunjungan
export const getBookingsForKunjungan = async () => {
  try {
    // Verify if user has add permissions
    if (!hasAddPermission()) {
      throw new Error('Tidak memiliki izin untuk melihat data booking');
    }
    
    // Get bookings with status 'terkonfirmasi' or similar statuses that are ready for kunjungan
    const response = await axios.get(`${BOOKING_API_URL}`, {
      params: {
        status: 'terkonfirmasi' // Adjust based on your booking status flow
      },
      headers: {
        'user-id': getCurrentUser()?._id // Send user ID for backend validation
      }
    });
    
    // Process and enhance booking data for display
    const enhancedBookings = response.data.map(booking => ({
      ...booking,
      klien: booking.klien || 'Klien tidak diketahui',
      nama_hewan: booking.nama || 'Hewan tidak diketahui',
      jenis_layanan: booking.jenis_layanan || 'Layanan tidak diketahui',
      // Add new fields
      layanan: booking.pelayanans1 && booking.pelayanans1[0]?.nama ? booking.pelayanans1[0].nama : 'N/A',
      jenis_kelamin: booking.jenis_kelamin || '-',
      ras: booking.ras || '-',
      // Coba ambil dari umur_hewan jika umur tidak ada
      umur: booking.umur || booking.umur_hewan || '-'
    }));
    
    return enhancedBookings;
  } catch (error) {
    console.error('Gagal mengambil data booking untuk kunjungan:', error);
    throw error;
  }
};

// Get all kunjungan for a specific date (used for generating the queue number)
export const getAllKunjunganByDate = async (date) => {
  try {
    // Verify if user has add permissions
    if (!hasAddPermission()) {
      throw new Error('Tidak memiliki izin untuk melihat data kunjungan berdasarkan tanggal');
    }
    
    // Format date for API query (if needed)
    const formattedDate = date; // Already in YYYY-MM-DD format from the component
    
    const response = await axios.get(`${AKTIVITAS_KUNJUNGAN_API_URL}/by-date`, {
      params: { date: formattedDate },
      headers: {
        'user-id': getCurrentUser()?._id // Send user ID for backend validation
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil data kunjungan untuk tanggal ${date}:`, error);
    throw error;
  }
};

// Create a new kunjungan directly (without requiring booking)
export const createDirectKunjungan = async (kunjunganData) => {
  // Check permissions first
  if (!hasAddPermission()) {
    throw new Error('Tidak memiliki izin untuk membuat kunjungan baru');
  }
  
  try {
    // Get current user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user._id;
    
    // Make sure all required fields for medical records are included
    const completeData = {
      ...kunjunganData,
      // Ensure these fields have defaults if not provided
      jenis_layanan: kunjunganData.jenis_layanan || 'offline',
      jenis_kelamin: kunjunganData.jenis_kelamin || '-',
      ras: kunjunganData.ras || '-',
      umur_hewan: kunjunganData.umur_hewan || '-',
      kategori: kunjunganData.kategori || 'kesayangan / satwa liar',
      keluhan: kunjunganData.keluhan || '-',
      // Make sure pelayanans1 is properly formatted as an array of objects
      pelayanans1: Array.isArray(kunjunganData.pelayanans1) ? kunjunganData.pelayanans1 : [],
      // Important: Use id_user key instead of userId to match backend expectation
      id_user: userId
    };
    
    // For debugging - log the request payload
    console.log('Sending data to API:', completeData);
    
    // Make sure the API endpoint matches exactly what's configured on the server
    const response = await axios.post(`${AKTIVITAS_KUNJUNGAN_API_URL}/direct`, completeData);
    return response.data;
  } catch (error) {
    console.error('Gagal membuat kunjungan langsung:', error);
    
    // Enhanced error logging to get more details
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    }
    
    throw error;
  }
};