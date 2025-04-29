import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./popupeditbooking.css";
import { getPasienByUserId } from "../../../../../api/api-pasien";
import { fetchLayanan } from "../../../../../api/api-pelayanan";
import { checkBookingAvailability, updateBooking } from "../../../../../api/api-booking";

// Custom select styles remain the same
// Update the customSelectStyles to handle the disabled state
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#d9d9d9", // Changed from #ecfcf7 to #d9d9d9 to match other inputs
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
    // Ensure the background color remains #d9d9d9 even when disabled
    opacity: state.isDisabled ? 0.9 : 1,
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
  singleValue: (provided, state) => ({
    ...provided,
    color: "#3F4254",
    // Ensure text color remains visible when disabled
    opacity: state.isDisabled ? 0.8 : 1,
  }),
  placeholder: (provided, state) => ({
    ...provided,
    color: "#999",
    // Ensure placeholder remains visible when disabled
    opacity: state.isDisabled ? 0.7 : 1,
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
  // Add styling for the disabled state
  container: (provided, state) => ({
    ...provided,
    opacity: state.isDisabled ? 0.9 : 1,
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

// Define the jenis layanan options
const jenisLayananOptions = [
  { value: "onsite", label: "Onsite (Booking Online)" },
  { value: "house call", label: "House Call (Booking Online)" }
];

const PopupEditBooking = ({ isOpen, onClose, bookingData }) => {
  const [selectedPasien, setSelectedPasien] = useState(null);
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
  // New state for jenis layanan
  const [selectedJenisLayanan, setSelectedJenisLayanan] = useState(null);
  const [lokasiPemeriksaan, setLokasiPemeriksaan] = useState("");
  // State to track form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State to track if lokasi is editable
  const [isLokasiEditable, setIsLokasiEditable] = useState(false);
  
  // Store original data for comparison
  const [originalData, setOriginalData] = useState({
    pasienId: "",
    layananId: "",
    date: "",
    complaint: "",
    jenisLayanan: "",
    lokasi: ""
  });

  const fetchMonthAvailability = async (date) => {
    if (!date) return;
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const promises = [];
  
    // Use the ID of the booking being edited
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
    
    // Instead of fetching all patients, just use the booking data
    if (bookingData?.id_pasien && bookingData?.nama) {
      // Create an option directly from the booking data
      const patientOption = {
        value: typeof bookingData.id_pasien === 'object' ? bookingData.id_pasien._id : bookingData.id_pasien,
        label: bookingData.nama
      };
      
      // Set this as the selected patient
      setSelectedPasien(patientOption);
      
      // Save to original data
      setOriginalData(prev => ({
        ...prev,
        pasienId: patientOption.value
      }));
    }

    // Still fetch patient data for later use (if needed for saving)
    const fetchDataPasien = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?._id;

      if (userId) {
        try {
          const pasienData = await getPasienByUserId(userId);
          setRawPasienData(pasienData);
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
          const serviceId = typeof bookingData.pelayanans1[0].id_pelayanan === 'object' 
            ? bookingData.pelayanans1[0].id_pelayanan._id 
            : bookingData.pelayanans1[0].id_pelayanan;
            
          const currentLayanan = sortedLayanan.find(l => l.value === serviceId);
          setSelectedLayanan(currentLayanan || null);
          
          // Save to original data
          setOriginalData(prev => ({
            ...prev,
            layananId: serviceId
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

    // Set jenis layanan from booking data
    if (bookingData?.jenis_layanan) {
      const currentJenisLayanan = jenisLayananOptions.find(option => 
        option.value === bookingData.jenis_layanan
      );
      
      if (currentJenisLayanan) {
        setSelectedJenisLayanan(currentJenisLayanan);
        
        // Set if lokasi is editable based on jenis layanan
        setIsLokasiEditable(currentJenisLayanan.value === "house call");
        
        // Set lokasi from booking data
        let locationValue = "Klinik KHJ";  // Changed from "Klinik Hewan A" to "Klinik KHJ"
        if (currentJenisLayanan.value === "house call") {
          locationValue = bookingData.alamat || "Alamat Rumah Anda";
        }
        setLokasiPemeriksaan(locationValue);
        
        // Save to original data
        setOriginalData(prev => ({
          ...prev,
          jenisLayanan: bookingData.jenis_layanan,
          lokasi: locationValue
        }));
      }
    }

    fetchDataPasien();
    loadLayanan();
    setLoading(false);
  }, [isOpen, bookingData]);

  // Update lokasi editable state whenever jenis layanan changes
  useEffect(() => {
    if (selectedJenisLayanan) {
      const isHouseCall = selectedJenisLayanan.value === "house call";
      setIsLokasiEditable(isHouseCall);
  
      if (isHouseCall) {
        setLokasiPemeriksaan(bookingData?.alamat || "");
      } else {
        setLokasiPemeriksaan("Klinik KHJ");
      }
    }
  }, [selectedJenisLayanan, bookingData]);
  

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
    const currentJenisLayanan = selectedJenisLayanan?.value || "";
    const currentLokasi = lokasiPemeriksaan;
    
    return (
      currentPasienId !== originalData.pasienId ||
      currentLayananId !== originalData.layananId ||
      currentDate !== originalData.date ||
      currentComplaint !== originalData.complaint ||
      currentJenisLayanan !== originalData.jenisLayanan ||
      currentLokasi !== originalData.lokasi
    );
  };

  const handleUpdate = async () => {
    // Check if required fields are filled
    if (!selectedPasien || !selectedLayanan || !selectedDate || !complaint || !selectedJenisLayanan) {
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
    
    // Check if house call has location
    if (selectedJenisLayanan.value === "house call" && (!lokasiPemeriksaan || lokasiPemeriksaan.trim() === "")) {
      setValidationMessage("Alamat untuk house call tidak boleh kosong.");
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
      setMessageType("error");
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
      
      // Validate availability before update
      const availabilityCheck = await checkBookingAvailability(dateStr, bookingId);
      if (availabilityCheck.tersedia === 0) {
        setValidationMessage("Kuota penuh pada tanggal tersebut. Pilih tanggal lain.");
        setMessageType("error");
        setTimeout(() => {
          setValidationMessage("");
          setMessageType("");
        }, 2000);
        setIsSubmitting(false);
        return;
      }
      
      // Create update object based on the service type
      const updateObject = {
        id_pasien: selectedPasien.value,
        pilih_tanggal: formatLocalDate(selectedDate),
        keluhan: complaint,
        pelayanans1: [{ id_pelayanan: selectedLayanan.value }],
        jenis_layanan: selectedJenisLayanan.value,
        status_booking: "menunggu respon administrasi" // Reset status
      };

      // Add alamat field only for house call, otherwise it will be null/undefined
      if (selectedJenisLayanan.value === "house call") {
        updateObject.alamat = lokasiPemeriksaan;
      }
      
      const updatedBooking = await updateBooking(bookingId, updateObject);
      
      // Find the patient data from the raw patient data
      const selectedPasienData = rawPasienData.find(p => p._id === selectedPasien.value);
      
      // Create saved input object similar to Halaman3's format
      const savedInput = {
        pasien: selectedPasien,
        layanan: selectedLayanan,
        tanggal: formatLocalDate(selectedDate),
        keluhan: complaint,
        jenisLayanan: selectedJenisLayanan.value,
        jenisLayananLabel: selectedJenisLayanan.label,
        lokasi: lokasiPemeriksaan
      };
      
      // Update localStorage with the most recent data
      localStorage.setItem("savedInput", JSON.stringify(savedInput));
      if (selectedPasienData) {
        localStorage.setItem("selectedPasienData", JSON.stringify(selectedPasienData));
      }
      
      setValidationMessage("Data booking berhasil diperbarui!");
      setMessageType("success");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
        setIsSubmitting(false);
        onClose(true); // Pass true to indicate successful update
      }, 2000);
    } catch (error) {
      console.error("Gagal memperbarui booking:", error);
      setValidationMessage("Gagal memperbarui booking. Silakan coba lagi.");
      setMessageType("error");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
        setIsSubmitting(false);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="popup-overlay-edit-admin">
      <div className="popup-content-edit" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Booking</h2>
        <div className="wadah-ini">
            {loading ? (
            <div className="loading-state">Loading...</div>
            ) : (
            <div className="edit-booking-form">
                {/* Notice for the user about status change */}
                <div className="form-group-edit">
                  <div className="status-info" style={{ fontSize: "0.9rem", color: "#666", backgroundColor: "#f8f8f8", padding: "10px", borderRadius: "5px", marginTop: "10px" }}>
                    <p><strong>Catatan:</strong> Setelah diperbarui, status booking akan kembali menjadi "menunggu respon administrasi".</p>
                  </div>
                </div>
                
                {/* Form Fields */}
                <div className="form-group-edit">
                <label>Pasien *</label>
                {/* Changed from Select to a simple display since we're using the name directly */}
                <div className="input-field-edit disabled-field" style={{ 
                  backgroundColor: "#ecfcf7", 
                  border: "1px solid #333",
                  borderRadius: "7px",
                  padding: "8px 12px",
                  color: "#3F4254",
                  fontSize: "0.95rem",
                  pointerEvents: "none"
                }}>
                  {selectedPasien?.label || "Loading..."}
                </div>
                </div>
                
                <div className="form-group-edit">
                <label>Pilih Layanan *</label>
                <Select
                    styles={customSelectStyles}
                    options={layananOptions}
                    placeholder="Pilih Layanan"
                    onChange={setSelectedLayanan}
                    value={selectedLayanan}
                    isDisabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                        </select>
                        <select 
                          value={date.getMonth()} 
                          onChange={({ target: { value } }) => changeMonth(Number(value))}
                          disabled={isSubmitting}
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
                    disabled={isSubmitting}
                />
                <div style={{ textAlign: "right", fontSize: "0.85rem", color: complaint.length > 240 ? "#c00" : "#666" }}>
                    {complaint.length}/250
                </div>
                </div>

                <div className="form-group-edit">
                <label>Pilih Jenis Layanan *</label>
                <Select
                    styles={customSelectStyles}
                    options={jenisLayananOptions}
                    placeholder="Pilih Jenis Layanan"
                    onChange={setSelectedJenisLayanan}
                    value={selectedJenisLayanan}
                    isDisabled={isSubmitting}
                />
                </div>

                <div className="form-group-edit">
                  <label>Lokasi Pemeriksaan *</label>
                  {selectedJenisLayanan?.value === "house call" ? (
                    <input
                      type="text"
                      placeholder="Masukkan alamat pemeriksaan"
                      value={lokasiPemeriksaan}
                      onChange={(e) => setLokasiPemeriksaan(e.target.value)}
                      disabled={isSubmitting}
                      className="input-field-edit"
                    />
                  ) : (
                    <input
                      type="text"
                      value="Klinik KHJ"
                      disabled
                      className="input-field-edit"
                    />
                  )}
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
                  disabled={isSubmitting || loading}
                >
                  Batal
                </button>
                <button 
                  type="button" 
                  className="popup-button confirm" 
                  onClick={handleUpdate}
                  disabled={isSubmitting || loading}
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