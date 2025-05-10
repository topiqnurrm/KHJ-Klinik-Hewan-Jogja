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
      // return null;
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
 * Save medical record - creates new or updates existing based on id_kunjungan
 * Also validates and updates product stock
 * @param {Object} rekamMedisData - Medical record data to save
 * @returns {Promise} - API response
 */
export const saveRekamMedis = async (rekamMedisData) => {
  try {
    // Log data original
    // console.log("Data rekam medis original:", JSON.stringify(rekamMedisData, null, 2));
    
    const formattedData = { ...rekamMedisData };
    
    // Format produks
    if (formattedData.produks && formattedData.produks.length > 0) {
      formattedData.produks = formattedData.produks.map(prod => {
        // console.log("Produk sebelum format:", JSON.stringify(prod, null, 2));
        
        const formatted = {
          ...prod,
          nama: prod.nama || "Tidak ada nama",
          kategori: prod.kategori || "obat",
          jenis: prod.jenis || "-"
        };
        
        // console.log("Produk setelah format:", JSON.stringify(formatted, null, 2));
        return formatted;
      });
      
      // MODIFICATION: Only check stock for NEW products (isExisting = false)
      const productsToCheck = formattedData.produks
        .filter(prod => prod.isExisting === false)
        .map(prod => ({
          id_produk: prod.id_produk,
          jumlah: prod.jumlah
        }));
      
      // Skip if no new products
      if (productsToCheck.length > 0) {
        // Check stock sufficiency
        const stockCheck = await checkStockSufficiency(productsToCheck);
        
        if (!stockCheck.semua_mencukupi) {
          // Stock insufficient
          const detailKekurangan = stockCheck.detail
            .filter(item => !item.mencukupi)
            .map(item => `${item.nama}: Tersedia ${item.stok_tersedia}, Diminta ${item.jumlah_diminta}`);
          
          throw new Error(`Stok tidak mencukupi untuk: ${detailKekurangan.join('; ')}`);
        }
      }
    }
    
    // Lanjutkan dengan format data lainnya
    if (formattedData.pelayanans2 && formattedData.pelayanans2.length > 0) {
      formattedData.pelayanans2 = formattedData.pelayanans2.map(pel => {
        // console.log("Layanan sebelum format:", JSON.stringify(pel, null, 2));
        const formatted = {
          ...pel,
          nama: pel.nama || "Tidak ada nama",
          kategori: pel.kategori || "layanan medis"
        };
        // console.log("Layanan setelah format:", JSON.stringify(formatted, null, 2));
        return formatted;
      });
    }
    
    // Format dokters
    if (formattedData.dokters && formattedData.dokters.length > 0) {
      formattedData.dokters = formattedData.dokters.map(dokter => {
        const formattedDokter = { ...dokter };
        
        if (formattedDokter.berat_badan !== undefined && formattedDokter.berat_badan !== null) {
          formattedDokter.berat_badan = Number(formattedDokter.berat_badan);
        }
        
        if (formattedDokter.suhu_badan !== undefined && formattedDokter.suhu_badan !== null) {
          formattedDokter.suhu_badan = Number(formattedDokter.suhu_badan);
        }
        
        return formattedDokter;
      });
    }
    
    // console.log("Sending to API - formatted data:", JSON.stringify(formattedData, null, 2));
    
    // Check if record exists or create new
    const existingRecord = await getRekamMedisByKunjungan(formattedData.id_kunjungan)
      .catch(error => {
        if (error.response && error.response.status === 404) {
          return null;
        }
        throw error;
      });
    
    let saveResponse;
    
    if (existingRecord && existingRecord._id) {
      // Record exists, update it
      const updateData = { ...formattedData };
      updateData.replaceCollections = true;
      
      // console.log("Updating existing record with ID:", existingRecord._id);
      saveResponse = await axios.put(
        `${API_URL}/update/${existingRecord._id}`, 
        updateData
      );
    } else {
      // Record doesn't exist, create new one
      // console.log("Creating new record");
      saveResponse = await axios.post(
        `${API_URL}/create`, 
        formattedData
      );
    }
    
    // Update product stock after successful save
    if (formattedData.produks && formattedData.produks.length > 0) {
      const productsToUpdate = formattedData.produks
        .filter(prod => prod.isExisting === false) // Only update stock for new products
        .map(prod => ({
          id_produk: prod.id_produk,
          jumlah: prod.jumlah
        }));
      
      if (productsToUpdate.length > 0) {
        await updateProductStock(productsToUpdate);
      }
    }
    
    return saveResponse.data;
  } catch (error) {
    console.error('Gagal menyimpan rekam medis:', error.response?.data || error.message);
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





  //----- stok 
  // Tambahkan fungsi-fungsi ini ke file api-aktivitas-rekammedis.js Anda

/**
 * Get current stock for a specific product
 * @param {String} productId - Product ID
 * @returns {Promise} - API response with current stock
 */
export const getProductStock = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/produk/stock/${productId}`);
    return parseFloat(response.data.stok.$numberDecimal || 0);
  } catch (error) {
    console.error("Error fetching product stock:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Check if stock is sufficient for a list of products
 * @param {Array} products - List of products with id_produk and jumlah
 * @returns {Promise} - API response with stock check results
 */
export const checkStockSufficiency = async (products) => {
  try {
    const response = await axios.post(`${API_URL}/produk/check-stock`, { products });
    return response.data;
  } catch (error) {
    console.error("Error checking stock sufficiency:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update stock after medical record is saved
 * @param {Array} products - List of products with id_produk and jumlah
 * @returns {Promise} - API response with updated stock info
 */
export const updateProductStock = async (products) => {
  try {
    const response = await axios.post(`${API_URL}/produk/update-stock`, { products });
    return response.data;
  } catch (error) {
    console.error("Error updating product stock:", error.response?.data || error.message);
    throw error;
  }
};