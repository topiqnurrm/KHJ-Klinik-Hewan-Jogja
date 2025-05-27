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
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Store original overflow value
  const [originalOverflow, setOriginalOverflow] = useState('');

  // Effect to handle popup open/close and body scrolling
  useEffect(() => {
    if (isOpen) {
      // Store current overflow value
      const currentOverflow = document.body.style.overflow || getComputedStyle(document.body).overflow;
      setOriginalOverflow(currentOverflow);
      
      // Prevent background scrolling when popup is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore original overflow value or remove the style property entirely
      if (originalOverflow && originalOverflow !== 'hidden') {
        document.body.style.overflow = originalOverflow;
      } else {
        // Remove the inline style to let CSS take over
        document.body.style.removeProperty('overflow');
      }
      
      // Clear data states when popup closes after a short delay
      const timeoutId = setTimeout(() => {
        setBookingData(null);
        setKunjunganData(null);
        setRekamMedisData(null);
        setRetribusiData(null);
        setError(null);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }

    // Cleanup function to ensure scroll is restored
    return () => {
      if (isOpen) {
        if (originalOverflow && originalOverflow !== 'hidden') {
          document.body.style.overflow = originalOverflow;
        } else {
          document.body.style.removeProperty('overflow');
        }
      }
    };
  }, [isOpen, originalOverflow]);

  // Effect to fetch data when bookingId changes or popup opens
  useEffect(() => {
    if (isOpen && bookingId) {
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
    if (!bookingId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Fetch booking data
      const bookingResponse = await axios.get(`${API_URL}/booking/${bookingId}`);
      setBookingData(bookingResponse.data);
      
      // 2. Fetch kunjungan data using booking ID
      const kunjunganResponse = await axios.get(`${API_URL}/kunjungan/by-booking/${bookingId}`);
      setKunjunganData(kunjunganResponse.data);
      
      // 3. If kunjungan exists, try to fetch rekam medis and retribusi
      if (kunjunganResponse.data) {
        const kunjunganId = kunjunganResponse.data._id;
        
        try {
          const rekamMedisResponse = await axios.get(`${API_URL}/rekam-medis/by-kunjungan/${kunjunganId}`);
          setRekamMedisData(rekamMedisResponse.data);
        } catch (rekamMedisErr) {
          setRekamMedisData(null);
        }
        
        try {
          const retribusiResponse = await axios.get(`${API_URL}/retribusi/by-kunjungan/${kunjunganId}`);
          setRetribusiData(retribusiResponse.data);
        } catch (retribusiErr) {
          setRetribusiData(null);
        }
      } else {
        setRekamMedisData(null);
        setRetribusiData(null);
      }
    } catch (err) {
      console.error("Error fetching medical record data:", err);
      setError("Gagal mengambil data rekam medis");
      setBookingData(null);
      setKunjungarData(null);
      setRekamMedisData(null);
      setRetribusiData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced close handler to ensure scroll restoration
  const handleClose = () => {
    // Explicitly restore scroll before closing
    if (originalOverflow && originalOverflow !== 'hidden') {
      document.body.style.overflow = originalOverflow;
    } else {
      document.body.style.removeProperty('overflow');
    }
    
    // Call the parent's onClose
    onClose();
  };

  const handlePopupClick = (e) => {
    e.stopPropagation();
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

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };
  
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
  
  const formatDisplayStatus = (status) => {
    if (status === "sedang diperiksa") {
      return "check in";
    }
    return status;
  };

  // Function to get the correct billing amount for house call
  const getHouseCallBilling = () => {
    // Check if jenis_layanan is house call
    const isHouseCall = bookingData?.jenis_layanan?.toLowerCase() === "house call";
    if (!isHouseCall) return null;

    // Priority 1: Check grand_total in retribusiData
    if (retribusiData?.grand_total) {
      const grandTotal = typeof retribusiData.grand_total === 'object' && retribusiData.grand_total.$numberDecimal
        ? parseFloat(retribusiData.grand_total.$numberDecimal)
        : retribusiData.grand_total;
      return grandTotal;
    }

    // Priority 2: Check biaya in kunjunganData
    if (kunjunganData?.biaya) {
      const biaya = typeof kunjunganData.biaya === 'object' && kunjunganData.biaya.$numberDecimal
        ? parseFloat(kunjunganData.biaya.$numberDecimal)
        : kunjunganData.biaya;
      return biaya;
    }

    // Priority 3: Check total_tagihan in retribusiData (fallback)
    if (retribusiData?.total_tagihan) {
      const totalTagihan = typeof retribusiData.total_tagihan === 'object' && retribusiData.total_tagihan.$numberDecimal
        ? parseFloat(retribusiData.total_tagihan.$numberDecimal)
        : retribusiData.total_tagihan;
      return totalTagihan;
    }

    // Priority 4: Check total_tagihan in dokter data
    const dokterWithTotal = filteredDokters
      .filter(dokter => dokter.total_tagihan)
      .pop();
    
    if (dokterWithTotal) {
      const totalTagihan = typeof dokterWithTotal.total_tagihan === 'object' && dokterWithTotal.total_tagihan.$numberDecimal
        ? parseFloat(dokterWithTotal.total_tagihan.$numberDecimal)
        : dokterWithTotal.total_tagihan;
      return totalTagihan;
    }

    // Priority 5: Parse from hasil text (case insensitive)
    const dokterWithHasil = filteredDokters
      .filter(dokter => dokter.hasil && /total\s*tagihan/i.test(dokter.hasil))
      .pop();
    
    if (dokterWithHasil) {
      const hasilText = dokterWithHasil.hasil;
      const totalMatch = hasilText.match(/total\s*tagihan[:\s]*rp?\s*([\d.,]+)/i);
      
      if (totalMatch) {
        const totalValue = parseInt(totalMatch[1].replace(/[.,]/g, ''));
        return totalValue;
      }
    }

    return null;
  };
  
  const filteredAdministrasis = bookingData?.administrasis1?.filter(item => 
    ["menunggu respon administrasi", "disetujui administrasi", "ditolak administrasi", "dibatalkan administrasi"].includes(item.status_administrasi)
  ) || [];
  
  const filteredKunjunganAdministrasis = kunjunganData?.administrasis2?.filter(item => 
    ["sedang diperiksa"].includes(item.status_kunjungan)
  ) || [];
  
  const filteredDokters = rekamMedisData?.dokters?.filter(item => 
    ["sedang diperiksa", "dirawat inap", "menunggu pembayaran", "selesai", "mengambil obat"].includes(item.status)
  ) || [];
  
  // Check if jenis_layanan is house call
  const isHouseCall = bookingData?.jenis_layanan?.toLowerCase() === "house call";
  
  // Show retribusi section - always show if retribusi data exists and status is selesai
  const showRetribusi = retribusiData && retribusiData.status_retribusi === "selesai";

  const isPaymentWaitingMedication = (status) => {
    return formatDokterStatus(status) === "pembayaran berhasil & menunggu obat";
  };

  const hasAnyData = filteredAdministrasis.length > 0 || 
                    filteredKunjunganAdministrasis.length > 0 || 
                    filteredDokters.length > 0 || 
                    showRetribusi;

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="medical-record-popup-overlay" onClick={handleClose}>
      <div className="medical-record-popup" onClick={handlePopupClick}>
        <div className="medical-record-header">
          <h2>Timeline Pemeriksaan {bookingId && `- ID: ${bookingId.slice(-6)}`}</h2>
          <button className="popup-close" onClick={handleClose}>
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

              {/* RETRIBUSI SECTION - Updated for house call */}
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
                      {isHouseCall ? (
                        <>
                          {(() => {
                            const billingAmount = getHouseCallBilling();
                            
                            if (billingAmount !== null) {
                              return (
                                <p><strong>Total Tagihan:</strong> Rp {billingAmount.toLocaleString('id-ID')}</p>
                              );
                            }
                            
                            return <p><strong>Total Tagihan:</strong> Data tidak tersedia</p>;
                          })()}
                          <p><strong>Metode Pembayaran:</strong> {retribusiData?.metode_bayar || "N/A"}</p>
                        </>
                      ) : (
                        <p>-</p>
                      )}
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