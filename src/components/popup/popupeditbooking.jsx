import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./popupeditbooking.css";
import { getPasienByUserId } from "../../api/api-pasien";
import { fetchLayanan } from "../../api/api-pelayanan";
import { checkBookingAvailability, updateBooking } from "../../api/api-booking";

// Custom select styles remain the same
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#ecfcf7",
    border: "1px solid #333",
    borderRadius: "7px",
    padding: "0px 4px",
    fontSize: "0.95rem",
    color: "#666",
    width: "100%",
    outline: "none",
    boxShadow: state.isFocused ? "0 0 0 1px #000" : "none",
    boxSizing: "border-box",
    minHeight: "38px",
    '&:hover': {
      border: "1px solid #333",
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "7px",
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#e0f7ef" : "#fff",
    color: "#333",
    fontSize: "0.95rem",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#3F4254",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#999",
  }),
  valueContainer: (provided) => ({
    ...provided,
    justifyContent: 'flex-start',
    paddingLeft: '1px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "150px",
    overflowY: "auto",
  }),
};

const formatLocalDate = (date) => {
  if (!date) return "";
  const dateObj = date instanceof Date ? date : new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-");
  return new Date(year, month - 1, day);
};

const PopupEditBooking = ({ isOpen, onClose, bookingData }) => {
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [pasienOptions, setPasienOptions] = useState([]);
  const [rawPasienData, setRawPasienData] = useState([]);
  const [layananOptions, setLayananOptions] = useState([]);
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [monthAvailability, setMonthAvailability] = useState({});
  const [complaint, setComplaint] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  // New state to track form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Store original data for comparison
  const [originalData, setOriginalData] = useState({
    pasienId: "",
    layananId: "",
    date: "",
    complaint: ""
  });

  const jenisLayanan = "Onsite (Booking Online)";
  const lokasiPemeriksaan = "Klinik Hewan A";

  const fetchMonthAvailability = async (date) => {
    if (!date) return;
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const promises = [];
  
    // Pastikan kita menggunakan ID booking yang sedang diedit
    const bookingId = bookingData?._id;
  
    for (let day = 1; day <= daysInMonth; day++) {
      const current = new Date(year, month, day);
      const dateStr = formatLocalDate(current);
      promises.push(
        checkBookingAvailability(dateStr, bookingId)
          .then((res) => ({ date: dateStr, tersedia: res.tersedia }))
          .catch(() => ({ date: dateStr, tersedia: null }))
      );
    }
  
    const results = await Promise.all(promises);
    const availMap = {};
    results.forEach(({ date, tersedia }) => {
      availMap[date] = tersedia;
    });
  
    setMonthAvailability(availMap);
  };

  useEffect(() => {
    if (!isOpen || !bookingData) return;

    setLoading(true);
    const fetchDataPasien = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?._id;

      if (userId) {
        try {
          const pasienData = await getPasienByUserId(userId);
          setRawPasienData(pasienData);
          const formattedOptions = pasienData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item) => ({
            value: item._id,
            label: `${item.nama} (${item.jenis})`,
          }));
          setPasienOptions(formattedOptions);
          
          // Find and set the current pasien from booking data
          if (bookingData?.id_pasien?._id) {
            const currentPasien = formattedOptions.find(option => option.value === bookingData.id_pasien._id);
            setSelectedPasien(currentPasien || null);
            
            // Save to original data
            setOriginalData(prev => ({
              ...prev,
              pasienId: bookingData.id_pasien._id
            }));
          }
        } catch (error) {
          console.error("Gagal mengambil data pasien:", error);
        }
      }
    };

    const loadLayanan = async () => {
      try {
        const layananData = await fetchLayanan();
        const sortedLayanan = layananData.sort((a, b) => a.label.localeCompare(b.label));
        setLayananOptions(sortedLayanan);
        
        // Find and set the current layanan from booking data
        if (bookingData?.pelayanans1?.[0]?.id_pelayanan) {
          const currentLayanan = sortedLayanan.find(l => l.value === bookingData.pelayanans1[0].id_pelayanan._id);
          setSelectedLayanan(currentLayanan || null);
          
          // Save to original data
          setOriginalData(prev => ({
            ...prev,
            layananId: bookingData.pelayanans1[0].id_pelayanan._id
          }));
        }
      } catch (error) {
        console.error("Gagal mengambil data layanan:", error);
      }
    };

    // Set complaint from booking data
    if (bookingData?.keluhan) {
      setComplaint(bookingData.keluhan);
      
      // Save to original data
      setOriginalData(prev => ({
        ...prev,
        complaint: bookingData.keluhan
      }));
    }

    // Set date from booking data
    if (bookingData?.pilih_tanggal) {
      const bookingDate = new Date(bookingData.pilih_tanggal);
      setSelectedDate(bookingDate);
      setCalendarMonth(bookingDate);
      
      // Save to original data
      setOriginalData(prev => ({
        ...prev,
        date: formatLocalDate(bookingDate)
      }));
    }

    fetchDataPasien();
    loadLayanan();
    setLoading(false);
  }, [isOpen, bookingData]);

  useEffect(() => {
    if (calendarMonth) fetchMonthAvailability(calendarMonth);
  }, [calendarMonth]);

  const getDayClassName = (date) => {
    const dateStr = formatLocalDate(date);
    const slot = monthAvailability[dateStr];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    // Add class for past dates
    if (date < today) return "red-day";
    
    // Add class for dates with no availability
    if (slot === 0) return "red-day";
    
    // Add class for dates with availability
    if (typeof slot === "number") return "green-day";
    
    // Add class for selected date
    if (selectedDate && formatLocalDate(selectedDate) === dateStr) {
      return "highlighted-day";
    }
  
    return "";
  };

  const hasDataChanged = () => {
    const currentPasienId = selectedPasien?.value || "";
    const currentLayananId = selectedLayanan?.value || "";
    const currentDate = formatLocalDate(selectedDate);
    const currentComplaint = complaint;
    
    return (
      currentPasienId !== originalData.pasienId ||
      currentLayananId !== originalData.layananId ||
      currentDate !== originalData.date ||
      currentComplaint !== originalData.complaint
    );
  };

  const handleUpdate = async () => {
    // Check if required fields are filled
    if (!selectedPasien || !selectedLayanan || !selectedDate || !complaint) {
      setValidationMessage("Harap lengkapi semua kolom terlebih dahulu!");
      setMessageType("error");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
      }, 2000);
      return;
    }
    
    // Check complaint length
    if (complaint.length > 250) {
      setValidationMessage("Keluhan maksimal 250 karakter.");
      setMessageType("error");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
      }, 2000);
      return;
    }
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(0, 0, 0, 0);
  
    if (bookingDate < today) {
      setValidationMessage("Tanggal booking tidak boleh lebih kecil dari hari ini.");
      setMessageType("error");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
      }, 2000);
      return;
    }
    
    // Check if any data has changed
    if (!hasDataChanged()) {
      setValidationMessage("Tidak ada perubahan data booking anda.");
      setMessageType("error"); // Changed from the default to "info" style
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
      }, 2000);
      return;
    }
  
    const dateStr = formatLocalDate(selectedDate);
    const bookingId = bookingData?._id;
    
    try {
      // Set submitting state to true
      setIsSubmitting(true);
      
      // Cek ketersediaan khusus untuk validasi akhir sebelum update
      const availabilityCheck = await checkBookingAvailability(dateStr, bookingId);
      if (availabilityCheck.tersedia === 0) {
        setValidationMessage("Kuota penuh pada tanggal tersebut. Pilih tanggal lain.");
        setMessageType("error");
        setTimeout(() => {
          setValidationMessage("");
          setMessageType("");
        }, 2000);
        setIsSubmitting(false); // Reset submitting state
        return;
      }
      
      // Sekarang lakukan update booking yang sebenarnya
      const updatedBooking = await updateBooking(bookingId, {
        id_pasien: selectedPasien.value,
        pilih_tanggal: formatLocalDate(selectedDate),
        keluhan: complaint,
        pelayanans1: [{ id_pelayanan: selectedLayanan.value }]
      });
      
      setValidationMessage("Data booking berhasil diperbarui!");
      setMessageType("success");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
        setIsSubmitting(false); // Reset submitting state
        onClose(true); // Pass true to indicate successful update
      }, 2000);
    } catch (error) {
      console.error("Gagal memperbarui booking:", error);
      setValidationMessage("Gagal memperbarui booking. Silakan coba lagi.");
      setMessageType("error");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
        setIsSubmitting(false); // Reset submitting state
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="popup-overlay-edit">
      <div className="popup-content-edit" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Booking</h2>
        <div className="wadah-ini">
            {loading ? (
            <div className="loading-state">Loading...</div>
            ) : (
            <div className="edit-booking-form">
                {/* Form Fields */}
                <div className="form-group-edit">
                <label>Pilih Pasien *</label>
                <Select
                    styles={customSelectStyles}
                    options={pasienOptions}
                    placeholder="Pilih Pasien"
                    onChange={setSelectedPasien}
                    value={selectedPasien}
                    isDisabled={isSubmitting} // Disable during submission
                />
                </div>
                
                <div className="form-group-edit">
                <label>Pilih Layanan *</label>
                <Select
                    styles={customSelectStyles}
                    options={layananOptions}
                    placeholder="Pilih Layanan"
                    onChange={setSelectedLayanan}
                    value={selectedLayanan}
                    isDisabled={isSubmitting} // Disable during submission
                />
                </div>

                <div className="form-group-edit">
                <label>Pilih Waktu Pemeriksaan *</label>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                    setSelectedDate(date);
                    setCalendarMonth(date);
                    }}
                    onMonthChange={(date) => setCalendarMonth(date)}
                    dayClassName={getDayClassName}
                    minDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Pilih tanggal"
                    className="datepicker-custom-edit"
                    disabled={isSubmitting} // Disable during submission
                    renderCustomHeader={({
                    date, changeYear, changeMonth,
                    decreaseMonth, increaseMonth,
                    prevMonthButtonDisabled, nextMonthButtonDisabled,
                    }) => (
                    <div style={{ margin: 10, display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
                        <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled || isSubmitting}>{"<"}</button>
                        <select 
                          value={date.getFullYear()} 
                          onChange={({ target: { value } }) => changeYear(Number(value))}
                          disabled={isSubmitting} // Disable during submission
                        >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                        </select>
                        <select 
                          value={date.getMonth()} 
                          onChange={({ target: { value } }) => changeMonth(Number(value))}
                          disabled={isSubmitting} // Disable during submission
                        >
                        {[
                            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                        ].map((month, index) => (
                            <option key={month} value={index}>{month}</option>
                        ))}
                        </select>
                        <button onClick={increaseMonth} disabled={nextMonthButtonDisabled || isSubmitting}>{">"}</button>
                    </div>
                    )}
                />
                {selectedDate && typeof monthAvailability[formatLocalDate(selectedDate)] === "number" && (
                    <div className={`kuota-info-edit ${monthAvailability[formatLocalDate(selectedDate)] === 0 ? "full" : "available"}`}>
                    {monthAvailability[formatLocalDate(selectedDate)] === 0
                        ? "Kuota penuh pada tanggal ini. Silakan pilih tanggal lain."
                        : `Tersisa ${monthAvailability[formatLocalDate(selectedDate)]} slot booking tersedia.`}
                    </div>
                )}
                </div>

                <div className="form-group-edit">
                <label>Keluhan Pasien *</label>
                <textarea
                    className="keluhan-edit"
                    rows={3}
                    value={complaint}
                    onChange={(e) => {
                    if (e.target.value.length <= 250) {
                        setComplaint(e.target.value);
                    }
                    }}
                    placeholder="Masukkan keluhan (maks. 250 karakter)"
                    disabled={isSubmitting} // Disable during submission
                />
                <div style={{ textAlign: "right", fontSize: "0.85rem", color: complaint.length > 240 ? "#c00" : "#666" }}>
                    {complaint.length}/250
                </div>
                </div>

                <div className="form-group-edit">
                <label className="warna">Pilih Jenis Layanan *</label>
                <input className="warna" type="text" value={jenisLayanan} readOnly disabled={isSubmitting} />
                </div>

                <div className="form-group-edit">
                <label className="warna">Pilih Lokasi Pemeriksaan *</label>
                <input className="warna" type="text" value={lokasiPemeriksaan} readOnly disabled={isSubmitting} />
                </div>
            </div>
            )}
        </div>

        <div className="form-buttons-edit-wadah">
            {validationMessage && (
                <div className={`validation-message-edit ${messageType}`}>
                    {validationMessage}
                </div>
            )}

            <div className="form-buttons-edit">
                <button 
                  type="button" 
                  className="popup-button cancel" 
                  onClick={onClose}
                  disabled={isSubmitting || loading} // Disable during loading or submission
                >
                  Batal
                </button>
                <button 
                  type="button" 
                  className="popup-button confirm" 
                  onClick={handleUpdate}
                  disabled={isSubmitting || loading} // Disable during loading or submission
                >
                  {isSubmitting ? "Memproses..." : "Perbarui"}
                </button>
            </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default PopupEditBooking;