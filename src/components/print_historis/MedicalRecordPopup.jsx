import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom';
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
  const [fetchTrigger, setFetchTrigger] = useState(0); // Added to force refetch

  // Effect to handle popup open/close and body scrolling
  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling when popup is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore background scrolling when popup is closed
      document.body.style.overflow = 'auto';
      
      // Clear data states when popup closes after a short delay
      // This prevents flickering content when closing/opening the same record
      const timeoutId = setTimeout(() => {
        setBookingData(null);
        setKunjunganData(null);
        setRekamMedisData(null);
        setRetribusiData(null);
        setError(null);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Effect to fetch data when bookingId changes or popup opens
  useEffect(() => {
    if (isOpen && bookingId) {
      // Increment the fetch trigger to force a refetch
      setFetchTrigger(prev => prev + 1);
    }
  }, [isOpen, bookingId]);

  // Effect to handle actual data fetching
  useEffect(() => {
    if (isOpen && bookingId) {
      fetchMedicalRecordData(bookingId);
    }
  }, [fetchTrigger]);

  const fetchMedicalRecordData = async (bookingId) => {
    // Only proceed if we have a valid bookingId
    if (!bookingId) return;
    
    // console.log("Fetching medical record for booking ID:", bookingId);
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Fetch booking data
      const bookingResponse = await axios.get(`${API_URL}/booking/${bookingId}`);
      setBookingData(bookingResponse.data);
      // console.log("Booking data fetched:", bookingResponse.data);
      
      // 2. Fetch kunjungan data using booking ID
      const kunjunganResponse = await axios.get(`${API_URL}/kunjungan/by-booking/${bookingId}`);
      setKunjunganData(kunjunganResponse.data);
      // console.log("Kunjungan data fetched:", kunjunganResponse.data);
      
      // 3. If kunjungan exists, try to fetch rekam medis and retribusi
      if (kunjunganResponse.data) {
        const kunjunganId = kunjunganResponse.data._id;
        
        try {
          // Fetch rekam medis - wrap in try/catch to handle 404
          const rekamMedisResponse = await axios.get(`${API_URL}/rekam-medis/by-kunjungan/${kunjunganId}`);
          setRekamMedisData(rekamMedisResponse.data);
          // console.log("Rekam medis data fetched:", rekamMedisResponse.data);
        } catch (rekamMedisErr) {
          // console.log("Rekam medis belum tersedia:", rekamMedisErr.message);
          // Clear previous data
          setRekamMedisData(null);
        }
        
        try {
          // Fetch retribusi - wrap in try/catch to handle 404
          const retribusiResponse = await axios.get(`${API_URL}/retribusi/by-kunjungan/${kunjunganId}`);
          setRetribusiData(retribusiResponse.data);
          // console.log("Retribusi data fetched:", retribusiResponse.data);
        } catch (retribusiErr) {
          // console.log("Data retribusi belum tersedia:", retribusiErr.message);
          // Clear previous data
          setRetribusiData(null);
        }
      } else {
        // Clear previous data if no kunjungan found
        setRekamMedisData(null);
        setRetribusiData(null);
      }
    } catch (err) {
      console.error("Error fetching medical record data:", err);
      setError("Gagal mengambil data rekam medis");
      // Clear all data on error
      setBookingData(null);
      setKunjunganData(null);
      setRekamMedisData(null);
      setRetribusiData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopupClick = (e) => {
    e.stopPropagation(); // Stop clicks inside popup from reaching parent elements
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

  // New function to format date only (without time)
  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };
  
  // Format display status for doctor section
  const formatDokterStatus = (status) => {
    if (status === "menunggu pembayaran") {
      return "selesai diperiksa";
    } else if (status === "selesai") {
      return "pembayaran berhasil & menunggu obat";
    } else if (status === "mengambil obat") {
      return "pembayaran berhasil & menunggu obat";
    } else {
      return status;
    }
  };
  
  // Format display status for UI display (sedang diperiksa -> check in)
  const formatDisplayStatus = (status) => {
    if (status === "sedang diperiksa") {
      return "check in";
    }
    return status;
  };
  
  // Filter administrasis1 with specified statuses
  const filteredAdministrasis = bookingData?.administrasis1?.filter(item => 
    ["menunggu respon administrasi", "disetujui administrasi", "ditolak administrasi", "dibatalkan administrasi"].includes(item.status_administrasi)
  ) || [];
  
  // Filter administrasis2 with specified statuses
  const filteredKunjunganAdministrasis = kunjunganData?.administrasis2?.filter(item => 
    ["sedang diperiksa"].includes(item.status_kunjungan)
  ) || [];
  
  // Filter dokters with specified statuses
  const filteredDokters = rekamMedisData?.dokters?.filter(item => 
    ["sedang diperiksa", "dirawat inap", "menunggu pembayaran", "selesai", "mengambil obat"].includes(item.status)
  ) || [];
  
  // Filter retribusi with status 'selesai'
  const showRetribusi = retribusiData && retribusiData.status_retribusi === "selesai";

  // Function to check if we should show the payment result differently
  const isPaymentWaitingMedication = (status) => {
    return formatDokterStatus(status) === "pembayaran berhasil & menunggu obat";
  };

  // Display debug information while developing
  const hasAnyData = filteredAdministrasis.length > 0 || 
                    filteredKunjunganAdministrasis.length > 0 || 
                    filteredDokters.length > 0 || 
                    showRetribusi;

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="medical-record-popup-overlay" onClick={onClose}>
      <div className="medical-record-popup" onClick={handlePopupClick}>
        <div className="medical-record-header">
          <h2>Timeline Pemeriksaan {bookingId && `- ID: ${bookingId.slice(-6)}`}</h2>
          <button className="popup-close" onClick={onClose}>
            ✖
          </button>
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
                <p><strong>Tanggal Booking:</strong> {formatDateOnly(bookingData?.pilih_tanggal)}</p>
              </div>

              {/* ADMINISTRASI SECTION */}
              {filteredAdministrasis.length > 0 && (
                <div className="record-section">
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
                  {filteredKunjunganAdministrasis.map((admin, index) => (
                    <div key={`kunjungan-${index}`} className="record-item">
                      <div className="record-header">
                        <span className={`status check-in`}>
                          {formatDisplayStatus(admin.status_kunjungan)}
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

              {/* DOKTER SECTION */}
              {filteredDokters.length > 0 && (
                <div className="record-section">
                  {filteredDokters.map((dokter, index) => {
                    const formattedStatus = formatDokterStatus(dokter.status);
                    const showPaymentMethod = formattedStatus === "pembayaran berhasil & menunggu obat";
                    const shouldShowHasilDirectly = isPaymentWaitingMedication(dokter.status);
                    
                    return (
                      <div key={`dokter-${index}`} className="record-item">
                        <div className="record-header">
                          <span className={`status ${formattedStatus.replace(/\s+/g, '-').replace(/&/g, '').replace(/\./g, '')}`}>
                            {dokter.status === "sedang diperiksa" ? "check in" : formattedStatus}
                          </span>
                          <span className="date">{formatDateTime(dokter.tanggal)}</span>
                        </div>
                        <div className="record-body">
                          {dokter.status === "mengambil obat" ? (
                            // For "mengambil obat" status, only show Hasil
                            <>
                              {shouldShowHasilDirectly ? (
                                <p dangerouslySetInnerHTML={{ __html: dokter.hasil ? dokter.hasil.replace(/Total Tagihan:/g, "<strong>Total Tagihan:</strong>") : "Belum ada hasil" }} />
                              ) : (
                                <p><strong>Hasil:</strong> {dokter.hasil || "Belum ada hasil"}</p>
                              )}
                              {showPaymentMethod && (
                                <p><strong>Metode Pembayaran:</strong> {retribusiData?.metode_bayar || "N/A"}</p>
                              )}
                            </>
                          ) : (
                            // For other statuses
                            <>
                              <p><strong>Dokter:</strong> {dokter.nama || "N/A"}</p>
                              <p><strong>Diagnosa:</strong> {dokter.diagnosa || "Belum ada diagnosa"}</p>
                              <p><strong>Berat Badan:</strong> {dokter.berat_badan?.$numberDecimal || dokter.berat_badan || "N/A"} kg</p>
                              <p><strong>Suhu Badan:</strong> {dokter.suhu_badan?.$numberDecimal || dokter.suhu_badan || "N/A"}°C</p>
                              {shouldShowHasilDirectly ? (
                                <p dangerouslySetInnerHTML={{ __html: dokter.hasil ? dokter.hasil.replace(/Total Tagihan:/g, "<strong>Total Tagihan:</strong>") : "Belum ada hasil" }} />
                              ) : (
                                <p><strong>Hasil:</strong> {dokter.hasil || "Belum ada hasil"}</p>
                              )}
                              {showPaymentMethod && (
                                <p><strong>Metode Pembayaran:</strong> {retribusiData?.metode_bayar || "N/A"}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* RETRIBUSI SECTION */}
              {showRetribusi && (
                <div className="record-section">
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
                      <p>-</p>
                    </div>
                  </div>
                </div>
              )}

              {!hasAnyData && !isLoading && (
                <div className="no-records">
                  <p>Tidak ada data rekam medis yang tersedia</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MedicalRecordPopup;