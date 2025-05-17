import axios from 'axios';

const API_URL = 'http://localhost:5000/api/aktivitas-farmasi';

// Mendapatkan semua data pembayaran untuk tampilan kasir
// Mendapatkan semua data pembayaran untuk tampilan kasir
export const getAllPembayaran = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    
    // Log a sample item to see what date fields we're actually getting
    if (response.data && response.data.length > 0) {
    //   console.log('Sample pembayaran item date fields:', {
    //     _id: response.data[0]._id,
    //     updatedAt: response.data[0].updatedAt,
    //     createdAt: response.data[0].createdAt,
    //     last_edited_date: response.data[0].last_edited_date,
    //     tanggal_selesai: response.data[0].tanggal_selesai,
    //     tanggal_raw: response.data[0].tanggal_raw
    //   });
    }
    
    // Process all data to ensure date fields are correctly formatted
    const processedData = response.data.map(item => {
      // Ensure we're not modifying the original data
      const processedItem = { ...item };
      
      // Make sure updatedAt is in ISO format string if it exists
      if (processedItem.updatedAt) {
        try {
          const date = new Date(processedItem.updatedAt);
          // Test if the date is valid
          if (!isNaN(date.getTime())) {
            processedItem.updatedAt = date.toISOString();
          } else {
            console.warn(`Invalid updatedAt date for item ${processedItem._id}:`, processedItem.updatedAt);
            processedItem.updatedAt = null;
          }
        } catch (err) {
          console.error(`Error processing updatedAt for item ${processedItem._id}:`, err);
          processedItem.updatedAt = null;
        }
      }
      
      return processedItem;
    });
    
    return processedData;
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
    // Pastikan data dikirimkan dengan format yang benar
    const response = await axios.put(`${API_URL}/update/${id}`, dataUpdate);
    return response.data;
  } catch (error) {
    console.error('Gagal mengupdate status pembayaran:', error);
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
    //   console.log('Data user tidak lengkap:', user);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Gagal mendapatkan data user:', error);
    return null;
  }
};

// Cek apakah user memiliki izin untuk mengedit pembayaran
// Hanya superadmin dan paramedis yang diizinkan mengedit
export const hasEditPermission = () => {
  try {
    const user = getCurrentUser();
    if (!user) {
    //   console.log('User tidak ditemukan di localStorage');
      return false;
    }
    
    // console.log('Checking permissions for user:', user);
    
    // Hanya superadmin dan paramedis yang diizinkan
    const allowedActors = ['superadmin', 'paramedis'];
    
    // Jika user.aktor adalah string, lakukan pemeriksaan langsung
    if (typeof user.aktor === 'string') {
      const hasPermission = allowedActors.includes(user.aktor.toLowerCase());
    //   console.log(`User aktor: ${user.aktor}, Has permission: ${hasPermission}`);
      return hasPermission;
    }
    
    // Cek juga role jika ada
    if (typeof user.role === 'string') {
      const hasPermission = allowedActors.includes(user.role.toLowerCase());
    //   console.log(`User role: ${user.role}, Has permission: ${hasPermission}`);
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
    //   console.log('User actor/role:', user.aktor);
    //   console.log('Has edit permission:', hasEditPermission());
    } else {
    //   console.log('No user data found or could not be parsed');
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