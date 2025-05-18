import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MedicalRecordPopup.css";

const API_URL = "http://localhost:5000/api/medical_record";

const MedicalRecordPopup = ({ isOpen, onClose, bookingId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [kunjunganData, setKunjunganData] = useState(null);
  const [rekamMedisData, setRekamMedisData] = useState(null);
  const [retribusiData, setRetribusiData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchMedicalRecordData(bookingId);
    }
  }, [isOpen, bookingId]);

  const fetchMedicalRecordData = async (bookingId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Fetch booking data
      const bookingResponse = await axios.get(`${API_URL}/booking/${bookingId}`);
      setBookingData(bookingResponse.data);
      
      // 2. Fetch kunjungan data using booking ID
      const kunjunganResponse = await axios.get(`${API_URL}/kunjungan/by-booking/${bookingId}`);
      setKunjunganData(kunjunganResponse.data);
      
      // 3. If kunjungan exists, fetch rekam medis and retribusi
      if (kunjunganResponse.data) {
        const kunjunganId = kunjunganResponse.data._id;
        
        // Fetch rekam medis
        const rekamMedisResponse = await axios.get(`${API_URL}/rekam-medis/by-kunjungan/${kunjunganId}`);
        setRekamMedisData(rekamMedisResponse.data);
        
        // Fetch retribusi
        const retribusiResponse = await axios.get(`${API_URL}/retribusi/by-kunjungan/${kunjunganId}`);
        setRetribusiData(retribusiResponse.data);
      }
    } catch (err) {
      console.error("Error fetching medical record data:", err);
      setError("Gagal mengambil data rekam medis");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  // Format display status for doctor section
  const formatDokterStatus = (status) => {
    if (status === "menunggu pembayaran") {
      return "selesai diperiksa";
    } else if (status === "selesai") {
      return "pembayaran berhasil & menunggu obat";
    } else {
      return status;
    }
  };
  
  // Filter administrasis1 with specified statuses
  const filteredAdministrasis = bookingData?.administrasis1?.filter(item => 
    ["menunggu respon administrasi", "disetujui administrasi", "ditolak administrasi", "dibatalkan administrasi"].includes(item.status_administrasi)
  ) || [];
  
  // Filter administrasis2 with specified statuses
  const filteredKunjunganAdministrasis = kunjunganData?.administrasis2?.filter(item => 
    ["sedang diperiksa"].includes(item.status_kunjungan)
    // ["sedang diperiksa", "dirawat inap", "selesai"].includes(item.status_kunjungan)
  ) || [];
  
  // Filter dokters with specified statuses
  const filteredDokters = rekamMedisData?.dokters?.filter(item => 
    ["sedang diperiksa", "dirawat inap", "menunggu pembayaran", "selesai", "mengambil obat"].includes(item.status)
  ) || [];
  
  // Filter retribusi with status 'selesai'
  const showRetribusi = retribusiData && retribusiData.status_retribusi === "selesai";

  if (!isOpen) return null;

  return (
    <div className="medical-record-popup-overlay">
      <div className="medical-record-popup">
        <div className="medical-record-header">
          <h2>Rekam Medis</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="medical-record-content">
          {isLoading ? (
            <div className="loading">Memuat data rekam medis...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="patient-info">
                <h3>Informasi Pasien</h3>
                <p><strong>Nama:</strong> {bookingData?.nama || "N/A"}</p>
                <p><strong>Kategori:</strong> {bookingData?.kategori || "N/A"}</p>
                <p><strong>Keluhan:</strong> {bookingData?.keluhan || "N/A"}</p>
                <p><strong>Jenis Layanan:</strong> {bookingData?.jenis_layanan || "N/A"}</p>
                <p><strong>Tanggal Booking:</strong> {formatDateTime(bookingData?.pilih_tanggal)}</p>
              </div>

              {/* ADMINISTRASI SECTION */}
              {filteredAdministrasis.length > 0 && (
                <div className="record-section">
                  {/* <h3>Riwayat Administrasi</h3> */}
                  {filteredAdministrasis.map((admin, index) => (
                    <div key={`admin-${index}`} className="record-item">
                      <div className="record-header">
                        <span className={`status ${admin.status_administrasi.replace(/\s+/g, '-')}`}>
                          {admin.status_administrasi}
                        </span>
                        <span className="date">{formatDateTime(admin.tanggal)}</span>
                      </div>
                      <div className="record-body">
                        <p>{admin.catatan || "Tidak ada catatan"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* KUNJUNGAN SECTION */}
              {filteredKunjunganAdministrasis.length > 0 && (
                <div className="record-section">
                  {/* <h3>Riwayat Kunjungan</h3> */}
                  {filteredKunjunganAdministrasis.map((admin, index) => (
                    <div key={`kunjungan-${index}`} className="record-item">
                      <div className="record-header">
                        <span className={`status ${admin.status_kunjungan.replace(/\s+/g, '-')}`}>
                          {admin.status_kunjungan}
                        </span>
                        <span className="date">{formatDateTime(admin.tanggal)}</span>
                      </div>
                      <div className="record-body">
                        <p>{admin.catatan || "Tidak ada catatan"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DOKTER SECTION - MODIFIED TO DISPLAY "selesai diperiksa" INSTEAD OF "menunggu pembayaran" */}
              {filteredDokters.length > 0 && (
                <div className="record-section">
                  {/* <h3>Pemeriksaan Dokter</h3> */}
                  {filteredDokters.map((dokter, index) => (
                    <div key={`dokter-${index}`} className="record-item">
                      <div className="record-header">
                        <span className={`status ${formatDokterStatus(dokter.status).replace(/\s+/g, '-').replace(/&/g, '').replace(/\./g, '')}`}>
                          {formatDokterStatus(dokter.status)}
                        </span>
                        <span className="date">{formatDateTime(dokter.tanggal)}</span>
                      </div>
                      <div className="record-body">
                        <p><strong>Dokter:</strong> {dokter.nama || "N/A"}</p>
                        <p><strong>Diagnosa:</strong> {dokter.diagnosa || "Belum ada diagnosa"}</p>
                        <p><strong>Berat Badan:</strong> {dokter.berat_badan?.$numberDecimal || dokter.berat_badan || "N/A"} kg</p>
                        <p><strong>Suhu Badan:</strong> {dokter.suhu_badan?.$numberDecimal || dokter.suhu_badan || "N/A"}°C</p>
                        <p><strong>Hasil:</strong> {dokter.hasil || "Belum ada hasil"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RETRIBUSI SECTION - MODIFIED TO USE PREFERRED DATE FIELD FOR RETRIBUSI */}
              {showRetribusi && (
                <div className="record-section">
                  {/* <h3>Pembayaran</h3> */}
                  <div className="record-item">
                    <div className="record-header">
                      <span className="status selesai">Selesai</span>
                      <span className="date">{formatDateTime(
                        retribusiData?.updatedAt || 
                        retribusiData?.updated_at || 
                        retribusiData?.tanggal_update || 
                        retribusiData?.tanggal
                      )}</span>
                    </div>
                    <div className="record-body">
                      <p><strong>Metode Pembayaran:</strong> {retribusiData?.metode_bayar || "N/A"}</p>
                      <p><strong>Total Pembayaran:</strong> {
                        typeof retribusiData?.grand_total === 'object' && retribusiData?.grand_total.$numberDecimal
                          ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(parseFloat(retribusiData.grand_total.$numberDecimal))
                          : "N/A"
                      }</p>
                    </div>
                  </div>
                </div>
              )}

              {!filteredAdministrasis.length && !filteredKunjunganAdministrasis.length && 
               !filteredDokters.length && !showRetribusi && (
                <div className="no-records">
                  <p>Tidak ada data rekam medis yang tersedia</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordPopup;