import React, { useState, useEffect } from 'react';
import printJS from 'print-js';

// Import API function for fetching data
// You'll need to adjust this path to match your project structure
import { getPembayaranDetail } from '../../api/api-aktivitas-farmasi';

/**
 * PrintServices - Component for handling printing of medical records and payment receipts
 * This is a standalone component that can be imported and used in other components
 */
export const PrintServices = () => {
  // This component doesn't render anything visible
  return null;
};

/**
 * Format currency in Indonesian Rupiah format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  const value = parseFloat(amount);
  return isNaN(value)
    ? 'Rp0'
    : new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value);
};

/**
 * Format date to Indonesian format
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Format decimal values, handling Decimal128 MongoDB format
 * @param {*} value - Value to format
 * @returns {string} Formatted string
 */
export const formatDecimal128Value = (value) => {
  if (!value) return '-';
  
  // Handle Decimal128 objects
  if (value.$numberDecimal) {
    return value.$numberDecimal;
  }
  
  // Handle direct number values
  if (typeof value === 'number') {
    return value.toString();
  }
  
  // If it's already a string
  if (typeof value === 'string') {
    return value;
  }
  
  // Default fallback
  return '-';
};

/**
 * Get current date and time in Indonesian format
 * @returns {string} Current date and time
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Fetch payment detail from API
 * @param {string} paymentId - ID of the payment to fetch
 * @returns {Promise<Object>} Payment detail object
 */
export const fetchPembayaranDetail = async (paymentId) => {
  try {
    const data = await getPembayaranDetail(paymentId);
    
    // Calculate totals from data
    let totalHargaObat = 0;
    let totalHargaPelayanan = 0;
    let produks = [];
    let pelayanans = [];
    let dokters = [];
    
    // Process medical record data if available
    if (data.rekam_medis) {
      // Process doctors
      if (data.rekam_medis.dokters && Array.isArray(data.rekam_medis.dokters)) {
        const filteredDokters = data.rekam_medis.dokters.filter(
          d => d.id_user && d.id_user.aktor === 'dokter'
        );
        dokters = filteredDokters;
      }
      
      // Process products/medications
      if (data.rekam_medis.produks && Array.isArray(data.rekam_medis.produks)) {
        produks = data.rekam_medis.produks;
        // Calculate total for medications
        totalHargaObat = data.rekam_medis.produks.reduce(
          (sum, produk) => {
            const subtotal = produk.subtotal_obat && produk.subtotal_obat.$numberDecimal 
              ? parseFloat(produk.subtotal_obat.$numberDecimal) 
              : 0;
            return sum + subtotal;
          }, 
          0
        );
      }
      
      // Process services
      if (data.rekam_medis.pelayanans2 && Array.isArray(data.rekam_medis.pelayanans2)) {
        pelayanans = data.rekam_medis.pelayanans2;
        // Calculate total for services
        totalHargaPelayanan = data.rekam_medis.pelayanans2.reduce(
          (sum, pelayanan) => {
            const subtotal = pelayanan.subtotal_pelayanan && pelayanan.subtotal_pelayanan.$numberDecimal 
              ? parseFloat(pelayanan.subtotal_pelayanan.$numberDecimal) 
              : 0;
            return sum + subtotal;
          }, 
          0
        );
      }
    }
    
    // Get service type properly
    let jenisLayanan = '';
    if (data.jenis_layanan && data.jenis_layanan !== '') {
      jenisLayanan = data.jenis_layanan;
    } else if (data.id_kunjungan && data.id_kunjungan.jenis_layanan) {
      jenisLayanan = data.id_kunjungan.jenis_layanan;
    }
    
    // Parse grand_total from Decimal128 format
    let grandTotal = 0;
    if (data.grand_total) {
      if (data.grand_total.$numberDecimal) {
        grandTotal = parseFloat(data.grand_total.$numberDecimal);
      } else if (typeof data.grand_total === 'string') {
        grandTotal = parseFloat(data.grand_total);
      } else if (typeof data.grand_total === 'number') {
        grandTotal = data.grand_total;
      }
    }
    
    // Parse payment amount
    let jumlahPembayaran = 0;
    if (data.jumlah_pembayaran) {
      if (data.jumlah_pembayaran.$numberDecimal) {
        jumlahPembayaran = parseFloat(data.jumlah_pembayaran.$numberDecimal);
      } else if (typeof data.jumlah_pembayaran === 'string') {
        jumlahPembayaran = parseFloat(data.jumlah_pembayaran);
      } else if (typeof data.jumlah_pembayaran === 'number') {
        jumlahPembayaran = data.jumlah_pembayaran;
      }
    }
    
    // Parse change amount
    let kembali = 0;
    if (data.kembali) {
      if (data.kembali.$numberDecimal) {
        kembali = parseFloat(data.kembali.$numberDecimal);
      } else if (typeof data.kembali === 'string') {
        kembali = parseFloat(data.kembali);
      } else if (typeof data.kembali === 'number') {
        kembali = data.kembali;
      }
    }
    
    // Calculate payment and change if not provided
    if (jumlahPembayaran <= 0 && kembali <= 0) {
      jumlahPembayaran = grandTotal;
      kembali = 0;
    } else if (jumlahPembayaran <= 0 && kembali > 0) {
      jumlahPembayaran = grandTotal + kembali;
    } else if (jumlahPembayaran > 0 && kembali <= 0) {
      kembali = Math.max(0, jumlahPembayaran - grandTotal);
    }
    
    // Return processed data
    return {
      ...data,
      produks,
      pelayanans,
      dokters,
      totalHargaObat,
      totalHargaPelayanan,
      grandTotal,
      jumlahPembayaran,
      kembali,
      jenisLayanan
    };
  } catch (err) {
    console.error('Error fetching payment detail:', err);
    throw new Error('Gagal mengambil detail pembayaran');
  }
};

/**
 * Print payment receipt (retribusi)
 * @param {Object} pembayaranItem - Payment item data
 * @param {Object} detailData - Detailed payment data
 * @param {Object} paymentData - Payment information (amounts, method)
 */
export const printRetribusi = (pembayaranItem, detailData, paymentData) => {
  const currentDateTime = getCurrentDateTime();
  
  // Extract important data
  const { produks = [], pelayanans = [], totalHargaObat = 0, totalHargaPelayanan = 0, grandTotal = 0 } = detailData;
  const { jumlahPembayaran = 0, kembali = 0, metodeBayar = 'cash' } = paymentData;
  
  // Create HTML content for printing
  const printContent = `
    <div style="font-family: Arial, sans-serif; padding: 10px; width: 80mm; max-width: 80mm;">
      <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px;">
        <h1 style="font-size: 16px; font-weight: bold; margin: 0;">Laporan Kunjungan </br>Poliklinik Hewan Jogja (KHJ)</h1>
        <p style="font-size: 14px; margin: 5px 0;">RETRIBUSI PEMBAYARAN</p>
      </div>
      
      <div style="margin-bottom: 10px; font-size: 12px;">
        <div style="margin-bottom: 3px;"><strong>ID:</strong> ${pembayaranItem._id}</div>
        <div style="margin-bottom: 3px;"><strong>Tanggal:</strong> ${currentDateTime}</div>
        <div style="margin-bottom: 3px;"><strong>Nama Pemilik:</strong> ${pembayaranItem.nama_klien}</div>
        <div style="margin-bottom: 3px;"><strong>Nama Pasien:</strong> ${pembayaranItem.nama_hewan}</div>
        <div style="margin-bottom: 3px;"><strong>Nomor Antrian:</strong> ${detailData.id_kunjungan?.no_antri || '-'}</div>
        <div style="margin-bottom: 3px;"><strong>Jenis Layanan:</strong> ${detailData.jenisLayanan || '-'}</div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 12px;">PEMAKAIAN OBAT</div>
        ${produks.length > 0 ? 
          `<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Nama Obat</th>
                <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Qty</th>
                <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${produks.map(produk => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${produk.nama}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${produk.jumlah}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${formatCurrency(parseFloat(produk.subtotal_obat?.$numberDecimal || 0))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div><strong>Total Obat:</strong> ${formatCurrency(totalHargaObat)}</div>` : 
          '<div>Tidak ada pemakaian obat</div>'}
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 12px;">JASA TINDAKAN</div>
        ${pelayanans.length > 0 ? 
          `<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Tindakan</th>
                <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Qty</th>
                <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${pelayanans.map(pelayanan => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${pelayanan.nama}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${pelayanan.jumlah}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${formatCurrency(parseFloat(pelayanan.subtotal_pelayanan?.$numberDecimal || 0))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div><strong>Total Tindakan:</strong> ${formatCurrency(totalHargaPelayanan)}</div>` : 
          '<div>Tidak ada jasa tindakan</div>'}
      </div>
      
      <div style="margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <div><strong>Grand Total:</strong></div>
          <div>${formatCurrency(grandTotal)}</div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <div><strong>Jumlah Pembayaran:</strong></div>
          <div>${formatCurrency(jumlahPembayaran)}</div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <div><strong>Kembalian:</strong></div>
          <div>${formatCurrency(kembali)}</div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <div><strong>Metode Pembayaran:</strong></div>
          <div>${metodeBayar.toUpperCase()}</div>
        </div>
      </div>
      
      <div style="margin-top: 15px; text-align: center; font-style: italic; font-size: 11px;">
        <p>Terima kasih atas kunjungan Anda</p>
        <p>Semoga hewan peliharaan Anda lekas sembuh</p>
      </div>
    </div>
  `;

  // Use Print-JS to print the HTML with custom configuration
  printJS({
    printable: printContent,
    type: 'raw-html',
    documentTitle: `Retribusi - ${pembayaranItem.nama_klien}`,
    targetStyles: ['*'],
    style: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 5mm;
      }
    `
  });
};

/**
 * Print medical record (rekam medis)
 * @param {Object} pembayaranItem - Payment item data 
 * @param {Object} detailData - Detailed payment data
 */
export const printRekamMedis = (pembayaranItem, detailData) => {
  // Extract medical record data
  const rekamMedis = detailData.rekam_medis || {};
  const { produks = [], pelayanans = [] } = detailData;
  
  // Extract doctor names
  const doctorNames = [];
  if (rekamMedis && rekamMedis.dokters && Array.isArray(rekamMedis.dokters)) {
    rekamMedis.dokters.forEach(dokter => {
      let doctorName = null;
      
      // Check direct nama property first
      if (dokter.nama && dokter.nama !== '') {
        doctorName = dokter.nama;
      } 
      // Then check id_user.nama if available
      else if (dokter.id_user && dokter.id_user.nama && dokter.id_user.nama !== '') {
        doctorName = dokter.id_user.nama;
      }
      
      // Only add if we found a name and it's not already in the list
      if (doctorName && !doctorNames.includes(doctorName)) {
        doctorNames.push(doctorName);
      }
    });
  }
  
  // Join doctor names with commas or show "Tidak ada dokter" if empty
  const doctorsText = doctorNames.length > 0 ? doctorNames.join(', ') : 'Tidak ada dokter';
  
  // For main medical details, use the first doctor with data if available
  let mainDoctor = {};
  if (rekamMedis.dokters && Array.isArray(rekamMedis.dokters) && rekamMedis.dokters.length > 0) {
    // Find the first doctor with some medical data
    mainDoctor = rekamMedis.dokters.find(d => 
      d.hasil || d.diagnosa || d.berat_badan || d.suhu_badan
    ) || rekamMedis.dokters[0] || {};
  }
  
  // Create HTML content for the medical record
  const printContent = `
    <div style="font-family: Arial, sans-serif; padding: 10px; width: 80mm; max-width: 80mm;">
      <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px;">
        <h1 style="font-size: 16px; font-weight: bold; margin: 0;">Laporan Kunjungan </br>Poliklinik Hewan Jogja (KHJ)</h1>
        <p style="font-size: 14px; margin: 5px 0;">REKAM MEDIS</p>
      </div>
      
      <div style="margin-bottom: 10px; font-size: 12px;">
        <div style="margin-bottom: 3px;"><strong>ID:</strong> ${rekamMedis._id || '-'}</div>
        <div style="margin-bottom: 3px;"><strong>Tanggal:</strong> ${formatDate(rekamMedis.tanggal)}</div>
        <div style="margin-bottom: 3px;"><strong>Nama Pemilik:</strong> ${pembayaranItem.nama_klien}</div>
        <div style="margin-bottom: 3px;"><strong>Nama Pasien:</strong> ${pembayaranItem.nama_hewan}</div>
        
        <div style="margin-bottom: 3px;"><strong>Jenis Kelamin:</strong> ${detailData.id_kunjungan?.jenis_kelamin || '-'}</div>
        <div style="margin-bottom: 3px;"><strong>Ras:</strong> ${detailData.id_kunjungan?.ras || '-'}</div>
        <div style="margin-bottom: 3px;"><strong>Umur (tahun):</strong> ${detailData.id_kunjungan?.umur_hewan || '-'}</div>
        <div style="margin-bottom: 3px;"><strong>Dokter:</strong> ${doctorsText}</div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 12px;">HASIL PEMERIKSAAN</div>
        <div style="display: grid; grid-template-columns: 1fr; gap: 5px; margin-bottom: 10px; font-size: 11px;">
          <div style="margin-bottom: 3px;"><strong>Keluhan:</strong> ${mainDoctor.hasil || rekamMedis.hasil || '-'}</div>
          <div style="margin-bottom: 3px;"><strong>Diagnosa:</strong> ${mainDoctor.diagnosa || rekamMedis.diagnosa || '-'}</div>
          <div style="margin-bottom: 3px;"><strong>Berat Badan (Kg):</strong> ${formatDecimal128Value(mainDoctor.berat_badan || rekamMedis.berat_badan)}</div>
          <div style="margin-bottom: 3px;"><strong>Suhu Badan (°C):</strong> ${formatDecimal128Value(mainDoctor.suhu_badan || rekamMedis.suhu_badan)}</div>
          
          <div style="margin-bottom: 3px;"><strong>Hasil:</strong> ${rekamMedis.hasil || '-'}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 12px;">PEMAKAIAN OBAT</div>
        ${produks.length > 0 ? 
          `<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Nama Obat</th>
                <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${produks.map(produk => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${produk.nama}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${produk.jumlah}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>` : 
          '<div>Tidak ada pemakaian obat</div>'}
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 12px;">JASA TINDAKAN</div>
        ${pelayanans.length > 0 ? 
          `<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Tindakan</th>
                <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${pelayanans.map(pelayanan => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${pelayanan.nama}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${pelayanan.jumlah}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>` : 
          '<div>Tidak ada jasa tindakan</div>'}
      </div>
      
      <div style="margin-top: 15px; text-align: center; font-style: italic; font-size: 11px;">
        <p>Dokumen ini adalah rekam medis resmi dari Klinik Hewan</p>
      </div>
    </div>
  `;

  // Use Print-JS to print the HTML with custom configuration
  printJS({
    printable: printContent,
    type: 'raw-html',
    documentTitle: `Rekam Medis - ${pembayaranItem.nama_hewan}`,
    targetStyles: ['*'],
    style: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 5mm;
      }
    `
  });
};

/**
 * UsePaymentDetail hook - custom hook to get payment details and handle printing
 * @param {string} paymentId - ID of the payment to fetch
 * @returns {Object} Payment detail state and printing functions
 */
export const usePaymentDetail = (paymentId) => {
  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch payment details when component mounts
  useEffect(() => {
    const loadPaymentDetail = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPembayaranDetail(paymentId);
        setDetailData(data);
        setIsLoading(false);
      } catch (err) {
        setError('Gagal mengambil detail pembayaran');
        setIsLoading(false);
        console.error('Error fetching payment detail:', err);
      }
    };
    
    if (paymentId) {
      loadPaymentDetail();
    }
  }, [paymentId]);
  
  // Print retribusi function
  const handlePrintRetribusi = (pembayaranItem) => {
    if (!detailData || !pembayaranItem) {
      console.error('Cannot print retribusi: Missing data');
      return;
    }
    
    const paymentData = {
      jumlahPembayaran: detailData.jumlahPembayaran,
      kembali: detailData.kembali,
      metodeBayar: detailData.metode_bayar || 'cash'
    };
    
    printRetribusi(pembayaranItem, detailData, paymentData);
  };
  
  // Print rekam medis function
  const handlePrintRekamMedis = (pembayaranItem) => {
    if (!detailData || !pembayaranItem) {
      console.error('Cannot print rekam medis: Missing data');
      return;
    }
    
    printRekamMedis(pembayaranItem, detailData);
  };
  
  return {
    detailData,
    isLoading,
    error,
    handlePrintRetribusi,
    handlePrintRekamMedis
  };
};

// Example usage:
/*
import { usePaymentDetail } from './PrintServices';

const YourComponent = ({ pembayaranItem }) => {
  const { 
    detailData, 
    isLoading, 
    error, 
    handlePrintRetribusi, 
    handlePrintRekamMedis 
  } = usePaymentDetail(pembayaranItem._id);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <button onClick={() => handlePrintRetribusi(pembayaranItem)}>
        Print Retribusi
      </button>
      <button onClick={() => handlePrintRekamMedis(pembayaranItem)}>
        Print Rekam Medis
      </button>
    </div>
  );
};
*/