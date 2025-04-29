import React, { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./halaman3.css";
import { getPasienByUserId } from "../../../../../../api/api-pasien";
import { fetchLayanan } from "../../../../../../api/api-pelayanan";
import { checkBookingAvailability } from "../../../../../../api/api-booking";
import { useNavigate } from 'react-router-dom';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#ecfcf7",
    border: "1px solid #333",
    borderRadius: "7px",
    padding: "0px 4px",
    fontSize: "0.95rem",
    color: "#666",
    width: "365px",
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return new Date(year, month - 1, day);
};

const jenisLayananOptions = [
  { value: "onsite", label: "Onsite (Booking Online)" },
  { value: "house call", label: "House Call (Booking Online)" }
];

function Halaman3({ onNext }) {
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [pasienOptions, setPasienOptions] = useState([]);
  const [rawPasienData, setRawPasienData] = useState([]);
  const [layananOptions, setLayananOptions] = useState([]);
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [monthAvailability, setMonthAvailability] = useState({});
  const [complaint, setComplaint] = useState("");
  const [savedData, setSavedData] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedJenisLayanan, setSelectedJenisLayanan] = useState(jenisLayananOptions[0]);
  const [lokasiPemeriksaan, setLokasiPemeriksaan] = useState("Klinik KHJ");
  const [isLokasiEditable, setIsLokasiEditable] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const navigate = useNavigate();

  const fetchMonthAvailability = async (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const promises = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const current = new Date(year, month, day);
      const dateStr = formatLocalDate(current);
      promises.push(
        checkBookingAvailability(dateStr)
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

  // Initial data loading from localStorage
  useEffect(() => {
    const savedInput = JSON.parse(localStorage.getItem("savedInput"));
    
    // Initialize fields from saved data first if available
    if (savedInput) {
      setSelectedPasien(savedInput.pasien);
      setSelectedLayanan(savedInput.layanan);
      setComplaint(savedInput.keluhan || "");
      
      // Load jenis layanan from saved data
      if (savedInput.jenisLayanan) {
        const jenisOption = jenisLayananOptions.find(opt => 
          opt.value === savedInput.jenisLayanan || opt.label === savedInput.jenisLayananLabel
        );
        
        if (jenisOption) {
          setSelectedJenisLayanan(jenisOption);
          // Set editable status based on saved jenis layanan
          setIsLokasiEditable(jenisOption.value === "house call");
        }
      }
      
      // Important: Always load the saved location regardless of the service type
      if (savedInput.lokasi) {
        setLokasiPemeriksaan(savedInput.lokasi);
      }
      
      if (savedInput.tanggal) {
        const savedDate = parseLocalDate(savedInput.tanggal);
        setSelectedDate(savedDate);
        setCalendarMonth(savedDate);
      }
      
      setSavedData(savedInput);
    }
    
    setIsInitialized(true);
  }, []);

  // Fetch patient and service data
  useEffect(() => {
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
    
        const savedInput = JSON.parse(localStorage.getItem("savedInput"));
    
        if (savedInput && savedInput.layanan) {
          const layananSaved = sortedLayanan.find(l => l.value === savedInput.layanan.value);
          if (layananSaved) {
            setSelectedLayanan(layananSaved);
          }
        } else {
          // Kalau tidak ada saved input, baru pilih default
          const defaultLayanan = sortedLayanan.find(l => l.label === "Pemeriksaan Umum");
          if (defaultLayanan) {
            setSelectedLayanan(defaultLayanan);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data layanan:", error);
      }
    };
    
  
    fetchDataPasien();
    loadLayanan();
  }, []);

  // Effect to handle changes in service type
  useEffect(() => {
    if (!isInitialized) return;
    
    // Update lokasi whenever service type changes AFTER initialization
    if (selectedJenisLayanan?.value === "onsite") {
      // For onsite, always set to clinic location and make readonly
      setLokasiPemeriksaan("Klinik KHJ");
      setIsLokasiEditable(false);
    } else if (selectedJenisLayanan?.value === "house call") {
      setIsLokasiEditable(true);
      // Only clear location if it's the default clinic location
      if (lokasiPemeriksaan === "Klinik KHJ") {
        setLokasiPemeriksaan("");
      }
    }
  }, [selectedJenisLayanan, isInitialized]);

  // Fetch availability when calendar month changes
  useEffect(() => {
    if (calendarMonth) fetchMonthAvailability(calendarMonth);
  }, [calendarMonth]);

  // Check if selected date is available
  useEffect(() => {
    if (selectedDate && Object.keys(monthAvailability).length > 0) {
      const dateStr = formatLocalDate(selectedDate);
      if (monthAvailability[dateStr] === 0) {
        setValidationMessage("Kuota penuh pada tanggal yang disimpan. Pilih tanggal lain.");
        setMessageType("error");
        setTimeout(() => {
          setValidationMessage("");
          setMessageType("");
        }, 2000);
      }
    }
  }, [selectedDate, monthAvailability]);

  const getDayClassName = (date) => {
    const dateStr = formatLocalDate(date);
    const slot = monthAvailability[dateStr];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    // Menambahkan class untuk tanggal yang sudah lewat
    if (date < today) return "red-day";
    
    // Menambahkan class untuk tanggal dengan kuota penuh
    if (slot === 0) return "red-day";
    
    // Menambahkan class untuk tanggal dengan kuota tersedia
    if (typeof slot === "number") return "green-day";
    
    // Menambahkan class untuk tanggal yang dipilih
    if (selectedDate && formatLocalDate(selectedDate) === dateStr) {
      return "highlighted-day";
    }
  
    return "";
  };

  const handleSave = () => {
    if (!selectedPasien || !selectedLayanan || !selectedDate || !complaint || !selectedJenisLayanan) {
      setValidationMessage("Harap lengkapi semua kolom terlebih dahulu!");
      setMessageType("error");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
      }, 2000);
      return;
    }
  
    // Validasi khusus untuk house call - lokasi harus diisi
    if (selectedJenisLayanan.value === "house call" && !lokasiPemeriksaan.trim()) {
      setValidationMessage("Harap isi lokasi pemeriksaan untuk House Call!");
      setMessageType("error");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
      }, 2000);
      return;
    }
  
    if (complaint.length > 250) {
      setValidationMessage("Keluhan maksimal 250 karakter.");
      setMessageType("error");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
      }, 2000);
      return;
    }
  
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
  
    const dateStr = formatLocalDate(selectedDate);
    if (monthAvailability[dateStr] === 0) {
      setValidationMessage("Kuota penuh pada tanggal tersebut. Pilih tanggal lain.");
      setMessageType("error");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
      }, 2000);
      return;
    }
  
    const fullPasienData = rawPasienData.find(p => p._id === selectedPasien?.value);
  
    const newData = {
      pasien: selectedPasien,
      layanan: selectedLayanan,
      tanggal: dateStr,
      keluhan: complaint,
      jenisLayanan: selectedJenisLayanan.value,
      jenisLayananLabel: selectedJenisLayanan.label,
      lokasi: lokasiPemeriksaan,
    };
  
    if (JSON.stringify(newData) === JSON.stringify(savedData)) {
      setValidationMessage("Data masih sama, tidak ada perubahan.");
      setMessageType("warning");
      setTimeout(() => {
        setValidationMessage("");
        setMessageType("");
      }, 2000);
      return;
    }
  
    localStorage.setItem("savedInput", JSON.stringify(newData));
    localStorage.setItem("selectedPasienData", JSON.stringify(fullPasienData));
    setSavedData(newData);
    setValidationMessage("Data berhasil disimpan!");
    setMessageType("success");
    if (onNext) onNext();
    setTimeout(() => {
      setValidationMessage("");
      setMessageType("");
    }, 2000);
  };
  

  return (
    <div className="hal3">
      {/* Form Fields */}
      <div className="form-group-1">
        <label>Pilih Pasien *</label>
        <Select
          styles={customSelectStyles}
          options={pasienOptions}
          placeholder="Pilih Pasien"
          onChange={setSelectedPasien}
          value={selectedPasien}
        />
      </div>

      <div className="form-group">
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
          className="datepicker-custom"
          renderCustomHeader={({
            date, changeYear, changeMonth,
            decreaseMonth, increaseMonth,
            prevMonthButtonDisabled, nextMonthButtonDisabled,
          }) => (
            <div style={{ margin: 10, display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
              <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>{"<"}</button>
              <select value={date.getFullYear()} onChange={({ target: { value } }) => changeYear(Number(value))}>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select value={date.getMonth()} onChange={({ target: { value } }) => changeMonth(Number(value))}>
                {[
                  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ].map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>{">"}</button>
            </div>
          )}
        />
        {selectedDate && typeof monthAvailability[formatLocalDate(selectedDate)] === "number" && (
          <div className={`kuota-info ${monthAvailability[formatLocalDate(selectedDate)] === 0 ? "full" : "available"}`}>
            {monthAvailability[formatLocalDate(selectedDate)] === 0
              ? "Kuota penuh pada tanggal ini. Silakan pilih tanggal lain."
              : `Tersisa ${monthAvailability[formatLocalDate(selectedDate)]} slot booking tersedia.`}
          </div>
        )}
      </div>

      {/* Layanan, Keluhan, and Save */}
      <div className="form-group">
        <label>Pilih Layanan *</label>
        <Select
          styles={customSelectStyles}
          options={layananOptions}
          placeholder="Pilih Layanan"
          onChange={setSelectedLayanan}
          value={selectedLayanan}
        />
      </div>

      <div className="form-group">
        <label>Pilih Jenis Layanan *</label>
        <Select
          styles={customSelectStyles}
          options={jenisLayananOptions}
          placeholder="Pilih Jenis Layanan"
          onChange={setSelectedJenisLayanan}
          value={selectedJenisLayanan}
        />
      </div>

      <div className="form-group">
        <label>Keluhan Pasien *</label>
        <textarea
          className="keluhan"
          rows={3}
          value={complaint}
          onChange={(e) => {
            if (e.target.value.length <= 250) {
              setComplaint(e.target.value);
            }
          }}
          placeholder="Masukkan keluhan (maks. 250 karakter)"
        />
        <div style={{ textAlign: "right", fontSize: "0.85rem", color: complaint.length > 240 ? "#c00" : "#666" }}>
          {complaint.length}/250
        </div>
      </div>

      <div className="form-group">
        <label className="warna">Lokasi Pemeriksaan *</label>
        <input 
          className={`warna ${!isLokasiEditable ? "readonly-field" : ""}`}
          type="text" 
          value={lokasiPemeriksaan} 
          onChange={(e) => setLokasiPemeriksaan(e.target.value)}
          readOnly={!isLokasiEditable}
          placeholder={isLokasiEditable ? "Masukkan alamat lengkap Anda" : ""}
        />
        {isLokasiEditable && (
          <div className="lokasi-info">
            Dokter hewan akan melakukan kunjungan
          </div>
        )}
      </div>

      <div className="simpan">
        <button className="btn-simpan" onClick={handleSave}>Simpan</button>
        {validationMessage && (
          <div className={`validation-message ${messageType}`}>{validationMessage}</div>
        )}
      </div>
    </div>
  );
}

export default Halaman3;