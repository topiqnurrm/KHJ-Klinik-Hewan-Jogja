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
    console.log('Sending update request:', { id, dataUpdate }); // Debug log
    
    // Validasi data sebelum dikirim
    if (!id) {
      throw new Error('ID pembayaran tidak valid');
    }
    
    if (!dataUpdate || typeof dataUpdate !== 'object') {
      throw new Error('Data update tidak valid');
    }
    
    // Pastikan data dikirimkan dengan format yang benar
    const response = await axios.put(`${API_URL}/update/${id}`, dataUpdate, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 detik timeout
    });
    
    console.log('Update response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Gagal mengupdate status pembayaran:', error);
    
    // Log error detail untuk debugging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request made but no response:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
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

// Mendapatkan informasi user saat ini
export const getCurrentUser = () => {
  try {
    // Mendapatkan user dari localStorage
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    
    // Parse string ke objek JSON
    const user = JSON.parse(userString);
    
    // Verifikasi data minimal yang diperlukan
    if (!user || !user._id || !user.aktor) {
      // console.log('Data user tidak lengkap:', user);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Gagal mendapatkan data user:', error);
    return null;
  }
};

// Cek apakah user memiliki izin untuk mengedit pembayaran
export const hasEditPermission = () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      // console.log('User tidak ditemukan di localStorage');
      return false;
    }
    
    // console.log('Checking permissions for user:', user);
    
    // Periksa berdasarkan aktor bukan role
    const allowedActors = ['superadmin', 'Pembayaran', 'pembayaran', 'admin', 'kasir'];
    
    // Jika user.aktor adalah string, lakukan pemeriksaan langsung
    if (typeof user.aktor === 'string') {
      const hasPermission = allowedActors.includes(user.aktor.toLowerCase());
      // console.log(`User aktor: ${user.aktor}, Has permission: ${hasPermission}`);
      return hasPermission;
    }
    
    // Jika aktor tidak ditemukan
    // console.log('Aktor tidak terdeteksi pada user:', user);
    return false;
  } catch (error) {
    console.error('Gagal memeriksa izin:', error);
    return false;
  }
};

// Menambahkan fungsi debug untuk membantu troubleshooting
export const debugUserPermission = () => {
  try {
    const userString = localStorage.getItem('user');
    // console.log('Raw user data from localStorage:', userString);
    
    const user = getCurrentUser();
    // console.log('Parsed user data:', user);
    
    if (user) {
      // console.log('User actor/role:', user.aktor);
      // console.log('Has edit permission:', hasEditPermission());
    } else {
      // console.log('No user data found or could not be parsed');
    }
    
    return {
      rawData: userString,
      parsedUser: user,
      hasPermission: user ? hasEditPermission() : false
    };
  } catch (error) {
    console.error('Debug error:', error);
    return {
      error: error.message
    };
  }
};