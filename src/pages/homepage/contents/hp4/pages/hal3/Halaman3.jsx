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

  const jenisLayanan = "Onsite (Booking Online)";
  const lokasiPemeriksaan = "Klinik Hewan A";
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

  useEffect(() => {
    const savedInput = JSON.parse(localStorage.getItem("savedInput"));
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
      const layananData = await fetchLayanan();
      const sortedLayanan = layananData.sort((a, b) => a.label.localeCompare(b.label));
      setLayananOptions(sortedLayanan);
      const savedLayanan = savedInput?.layanan || sortedLayanan.find(l => l.label === "Pemeriksaan Umum");
      if (savedLayanan) {
        setSelectedLayanan(savedLayanan);
      }
    };

    fetchDataPasien();
    loadLayanan();

    if (savedInput) {
      setSelectedPasien(savedInput.pasien);
      setSelectedLayanan(savedInput.layanan);
      setComplaint(savedInput.keluhan);
      const savedDate = parseLocalDate(savedInput.tanggal);
      setSelectedDate(savedDate);
      setCalendarMonth(savedDate);
      setSavedData(savedInput);

      // Fetch month availability based on the saved date
      fetchMonthAvailability(savedDate);
    } else {
      setCalendarMonth(new Date());
    }
  }, []);

  useEffect(() => {
    if (calendarMonth) fetchMonthAvailability(calendarMonth);
  }, [calendarMonth]);

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
    if (!selectedPasien || !selectedLayanan || !selectedDate || !complaint) {
      setValidationMessage("Harap lengkapi semua kolom terlebih dahulu!");
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
      jenisLayanan,
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
        <label className="warna">Pilih Jenis Layanan *</label>
        <input className="warna" type="text" value={jenisLayanan} readOnly />
      </div>

      <div className="form-group">
        <label>Keluhan Pasien *</label>
        <textarea
          className="keluhan"
          rows={3}
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Masukkan keluhan..."
        />
      </div>

      <div className="form-group">
        <label className="warna">Pilih Lokasi Pemeriksaan *</label>
        <input className="warna" type="text" value={lokasiPemeriksaan} readOnly />
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
