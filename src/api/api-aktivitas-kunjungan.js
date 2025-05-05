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

// Check if the current user has edit permissions for kunjungan
export const hasEditPermission = () => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return ['superadmin', 'administrasi', 'dokter'].includes(user.aktor);
};

// Get all kunjungan with enhanced information
export const getAllKunjungan = async () => {
  try {
    const response = await axios.get(`${AKTIVITAS_KUNJUNGAN_API_URL}`);
    
    // Format dates and filter by VALID_STATUSES if needed
    const formattedKunjungan = response.data
      // Optionally filter by valid statuses (uncomment if you want to filter)
      // .filter(item => VALID_STATUSES.includes(item.status))
      .map(kunjungan => ({
        ...kunjungan,
        tanggal_checkin_display: new Date(kunjungan.tanggal_checkin).toLocaleString()
      }));
    
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
    return {
      ...response.data,
      tanggal_checkin_display: new Date(response.data.tanggal_checkin).toLocaleString()
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
    const response = await axios.put(`${AKTIVITAS_KUNJUNGAN_API_URL}/${id}/status`, { status });
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
    const response = await axios.post(`${AKTIVITAS_KUNJUNGAN_API_URL}/${id}/administrasi`, adminData);
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
    
    // Client-side search
    return allKunjungan.filter(kunjungan => {
      // Create a string with all searchable fields
      const searchableText = `
        ${kunjungan.klien || ''}
        ${kunjungan.nama_hewan || ''}
        ${kunjungan.nomor_antri || ''}
        ${kunjungan.status || ''}
        ${kunjungan.tanggal_checkin_display || ''}
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
  // Check permissions first
  if (!hasEditPermission()) {
    throw new Error('Tidak memiliki izin untuk menghapus kunjungan');
  }
  
  try {
    const response = await axios.delete(`${AKTIVITAS_KUNJUNGAN_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal menghapus kunjungan dengan ID ${id}:`, error);
    throw error;
  }
};

// ---- TAMBAHAN UNTUK FUNGSI YANG DIBUTUHKAN ADDKUNJUNGAN COMPONENT ---- //

// Create a new kunjungan
export const createKunjungan = async (kunjunganData) => {
  // Check permissions first
  if (!hasEditPermission()) {
    throw new Error('Tidak memiliki izin untuk membuat kunjungan baru');
  }
  
  try {
    const response = await axios.post(`${AKTIVITAS_KUNJUNGAN_API_URL}`, kunjunganData);
    return response.data;
  } catch (error) {
    console.error('Gagal membuat kunjungan baru:', error);
    throw error;
  }
};

// Get available bookings that can be used for kunjungan
export const getBookingsForKunjungan = async () => {
  try {
    // Get bookings with status 'terkonfirmasi' or similar statuses that are ready for kunjungan
    const response = await axios.get(`${BOOKING_API_URL}`, {
      params: {
        status: 'terkonfirmasi' // Adjust based on your booking status flow
      }
    });
    
    // Process and enhance booking data for display
    const enhancedBookings = response.data.map(booking => ({
      ...booking,
      klien: booking.klien || 'Klien tidak diketahui',
      nama_hewan: booking.nama || 'Hewan tidak diketahui',
      jenis_layanan: booking.jenis_layanan || 'Layanan tidak diketahui'
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
    // Format date for API query (if needed)
    const formattedDate = date; // Already in YYYY-MM-DD format from the component
    
    const response = await axios.get(`${AKTIVITAS_KUNJUNGAN_API_URL}/by-date`, {
      params: { date: formattedDate }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil data kunjungan untuk tanggal ${date}:`, error);
    throw error;
  }
};





// Add this function to your api-aktivitas-kunjungan.js file

// Create a new kunjungan directly (without requiring booking)
export const createDirectKunjungan = async (kunjunganData) => {
    // Check permissions first
    if (!hasEditPermission()) {
      throw new Error('Tidak memiliki izin untuk membuat kunjungan baru');
    }
    
    try {
      const response = await axios.post(`${AKTIVITAS_KUNJUNGAN_API_URL}/direct`, kunjunganData);
      return response.data;
    } catch (error) {
      console.error('Gagal membuat kunjungan langsung:', error);
      throw error;
    }
  };