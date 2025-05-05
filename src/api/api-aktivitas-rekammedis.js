import axios from 'axios';

const API_URL = 'http://localhost:5000/api/rekam-medis';

//----- api rekam medis
/**
 * Get medical record by visit ID (id_kunjungan)
 * @param {String} kunjunganId - Visit ID
 * @returns {Promise} - API response with medical record data
 */
export const getRekamMedisByKunjungan = async (kunjunganId) => {
    try {
      const response = await axios.get(`${API_URL}/by-kunjungan/${kunjunganId}`);
      return response.data;
    } catch (error) {
      console.error('Gagal mengambil rekam medis:', error.response?.data || error.message);
      throw error;
    }
  };
  
  /**
   * Update an existing medical record
   * @param {String} rekamMedisId - Medical record ID
   * @param {Object} updateData - Updated medical record data
   * @returns {Promise} - API response
   */
  export const updateRekamMedis = async (rekamMedisId, updateData) => {
    try {
      const response = await axios.put(`${API_URL}/update/${rekamMedisId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Gagal memperbarui rekam medis:', error.response?.data || error.message);
      throw error;
    }
  };
  
  /**
   * Get all medical records for a patient
   * @param {String} pasienId - Patient ID
   * @returns {Promise} - API response with all medical records
   */
  export const getRekamMedisByPasien = async (pasienId) => {
    try {
      const response = await axios.get(`${API_URL}/by-pasien/${pasienId}`);
      return response.data;
    } catch (error) {
      console.error('Gagal mengambil riwayat rekam medis pasien:', error.response?.data || error.message);
      throw error;
    }
  };
  
  /**
   * Delete a medical record
   * @param {String} rekamMedisId - Medical record ID to delete
   * @returns {Promise} - API response
   */
  export const deleteRekamMedis = async (rekamMedisId) => {
    try {
      const response = await axios.delete(`${API_URL}/delete/${rekamMedisId}`);
      return response.data;
    } catch (error) {
      console.error('Gagal menghapus rekam medis:', error.response?.data || error.message);
      throw error;
    }
  };
  
  /**
   * Save medical record - creates new or updates existing based on id_kunjungan
   * Also updates booking status
   * @param {Object} rekamMedisData - Medical record data to save
   * @returns {Promise} - API response
   */
  export const saveRekamMedis = async (rekamMedisData) => {
    try {
        // Check if a record with this id_kunjungan already exists
        const existingRecord = await getRekamMedisByKunjungan(rekamMedisData.id_kunjungan)
            .catch(error => {
                // If it's a 404, it means no record exists
                if (error.response && error.response.status === 404) {
                    return null;
                }
                throw error; // Re-throw other errors
            });
        
        if (existingRecord && existingRecord._id) {
            // Record exists, update it
            // Preserve existing data structure by removing dokters from the update if present
            // The backend will handle appending them instead
            const updateData = { ...rekamMedisData };
            
            // Add a flag to indicate this is a full update (replace all produks and pelayanans)
            updateData.replaceCollections = true;
            
            // We'll still send dokters so they get appended, but we need to handle this properly
            // on the backend side (which we've modified to append, not replace)
            
            const updateResponse = await axios.put(
                `${API_URL}/update/${existingRecord._id}`, 
                updateData
            );
            return updateResponse.data;
        } else {
            // Record doesn't exist, create new one
            const createResponse = await axios.post(
                `${API_URL}/create`, 
                rekamMedisData
            );
            return createResponse.data;
        }
    } catch (error) {
        console.error('Gagal menyimpan rekam medis:', error.response?.data || error.message);
        throw error;
    }
};


//----- api obat dan pelayanan
// Fungsi untuk mengambil semua produk
export const getAllProduk = async () => {
    try {
      const response = await axios.get(`${API_URL}/produk/all`);
      return response.data;
    } catch (error) {
      console.error('Gagal mengambil semua produk:', error);
      throw error;
    }
  };
  
  // Fungsi untuk mengambil semua pelayanan
  export const getAllPelayanan = async () => {
    try {
      const response = await axios.get(`${API_URL}/pelayanan/all`);
      return response.data;
    } catch (error) {
      console.error('Gagal mengambil semua pelayanan:', error);
      throw error;
    }
  };
  
  // Fungsi untuk membuat produk baru
  export const createProduk = async (produkData) => {
    try {
      const response = await axios.post(`${API_URL}/produk/tambah`, produkData);
      return response.data;
    } catch (error) {
      console.error('Gagal menambah produk:', error.response?.data || error.message);
      throw error;
    }
  };
  
  // Fungsi untuk membuat pelayanan baru
  export const createPelayanan = async (pelayananData) => {
    try {
      const response = await axios.post(`${API_URL}/pelayanan/tambah`, pelayananData);
      return response.data;
    } catch (error) {
      console.error('Gagal menambah pelayanan:', error.response?.data || error.message);
      throw error;
    }
  };



  // ----- api retribusi pembayaran

  export const createRetribusiPembayaran = async (retribusiData) => {
    try {
      const response = await axios.post(`${API_URL}/tambah`, retribusiData);
      return response.data;
    } catch (error) {
      console.error('Gagal menambah retribusi pembayaran:', error.response?.data || error.message);
      throw error;
    }
  };
  
  export const updateRetribusiPembayaran = async (retribusiData) => {
    try {
      const response = await axios.put(`${API_URL}/update-by-kunjungan/${retribusiData.id_kunjungan}`, retribusiData);
      return response.data;
    } catch (error) {
      console.error('Gagal memperbarui retribusi pembayaran:', error.response?.data || error.message);
      throw error;
    }
  };
  
  export const getRetribusiPembayaranByKunjungan = async (kunjunganId) => {
    try {
      const response = await axios.get(`${API_URL}/by-kunjungan/${kunjunganId}`);
      return response.data;
    } catch (error) {
      // Jika tidak ditemukan (404), kembalikan null
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error('Gagal mengambil retribusi pembayaran:', error.response?.data || error.message);
      throw error;
    }
  };
  
  export const getAllRetribusiPembayaran = async () => {
    try {
      const response = await axios.get(`${API_URL}/all`);
      return response.data;
    } catch (error) {
      console.error('Gagal mengambil semua retribusi pembayaran:', error);
      throw error;
    }
  };



  //----- api kunjungan

  export const updateKunjunganStatus = async (kunjunganId, statusData) => {
    try {
      const response = await axios.put(`${API_URL}/update-status/${kunjunganId}`, statusData);
      return response.data;
    } catch (error) {
      console.error('Gagal mengupdate status kunjungan:', error.response?.data || error.message);
      throw error;
    }
  };