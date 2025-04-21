import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./halaman3.css";
import { getPasienByUserId } from "../../../../../../api/api-pasien";
import { fetchLayanan } from "../../../../../../api/api-pelayanan";
import { checkBookingAvailability } from "../../../../../../api/api-booking";

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

function Halaman3() {
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [pasienOptions, setPasienOptions] = useState([]);
  const [rawPasienData, setRawPasienData] = useState([]); // untuk menyimpan data lengkap
  const [layananOptions, setLayananOptions] = useState([]);
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [complaint, setComplaint] = useState("");
  const [savedData, setSavedData] = useState(null);
  const [kuotaBooking, setKuotaBooking] = useState(null);

  const [validationMessage, setValidationMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const jenisLayanan = "Onsite (Booking Online)";
  const lokasiPemeriksaan = "Klinik Hewan A";

  useEffect(() => {
    const fetchDataPasien = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?._id;

      if (userId) {
        try {
          const pasienData = await getPasienByUserId(userId);
          setRawPasienData(pasienData); // Simpan data lengkap

          const sortedPasienData = pasienData.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          const formattedOptions = sortedPasienData
            .map((item) => ({
              value: item._id,
              label: `${item.nama} (${item.jenis})`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));

          setPasienOptions(formattedOptions);
        } catch (error) {
          console.error("Gagal mengambil data pasien:", error);
        }
      }
    };

    const loadLayanan = async () => {
      const layananData = await fetchLayanan();
      const sortedLayanan = layananData.sort((a, b) =>
        a.label.localeCompare(b.label)
      );
      setLayananOptions(sortedLayanan);
      const defaultLayanan = sortedLayanan.find(
        (layanan) => layanan.label === "Pemeriksaan Umum"
      );
      if (defaultLayanan) {
        setSelectedLayanan(defaultLayanan);
      }
    };

    fetchDataPasien();
    loadLayanan();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("savedInput");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedData(parsed);
      setSelectedPasien(parsed.pasien);
      setSelectedLayanan(parsed.layanan);
      setSelectedDate(parsed.tanggal);
      setComplaint(parsed.keluhan);
    }
  }, []);

  useEffect(() => {
    const fetchKuota = async () => {
      if (selectedDate) {
        try {
          const result = await checkBookingAvailability(selectedDate);
          setKuotaBooking(result.tersedia);
        } catch (error) {
          setKuotaBooking(null);
        }
      }
    };
    fetchKuota();
  }, [selectedDate]);

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

    if (kuotaBooking === 0) {
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
      tanggal: selectedDate,
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
    localStorage.setItem("selectedPasienData", JSON.stringify(fullPasienData)); // ✅ Simpan data pasien
    setSavedData(newData);

    console.log("=== Data Booking Disimpan ===");
    console.log(newData);
    console.log("=== Data Pasien Disimpan ===");
    console.log(fullPasienData);

    setValidationMessage("Data berhasil disimpan!");
    setMessageType("success");
    setTimeout(() => {
      setValidationMessage("");
      setMessageType("");
    }, 2000);
  };

  return (
    <div className="hal3">
      <div className="form-group-1">
        <label>Pilih Pasien *</label>
        <Select
          styles={customSelectStyles}
          options={pasienOptions}
          placeholder="Pilih Pasien"
          onChange={(option) => setSelectedPasien(option)}
          value={selectedPasien}
        />
      </div>

      <div className="form-group">
        <label>Pilih Waktu Pemeriksaan *</label>
        <div className="date-input-wrapper">
          <input
            className={selectedDate === "" ? "empty" : ""}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min="1900-01-01"
            max="2099-12-31"
          />
        </div>
        {selectedDate && kuotaBooking !== null && (
          <div className={`kuota-info ${kuotaBooking === 0 ? "full" : "available"}`}>
            {kuotaBooking === 0
              ? "Kuota penuh pada tanggal ini. Silakan pilih tanggal lain."
              : `Tersisa ${kuotaBooking} slot booking tersedia.`}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Pilih Layanan *</label>
        <Select
          styles={customSelectStyles}
          options={layananOptions}
          placeholder="Pilih Layanan"
          onChange={(option) => setSelectedLayanan(option)}
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
        <button className="btn-simpan" onClick={handleSave}>
          Simpan
        </button>

        {validationMessage && (
          <div className={`validation-message ${messageType}`}>
            {validationMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default Halaman3;
