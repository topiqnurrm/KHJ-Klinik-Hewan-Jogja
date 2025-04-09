import React, { useState } from "react";
import Select from "react-select";
import "./halaman3.css";

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
};

function Halaman3() {
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [complaint, setComplaint] = useState("");

  const pasienOptions = [
    { value: "wowo", label: "Wowo" },
    { value: "john", label: "John Doe" },
  ];

  const layananOptions = [
    { value: "pemeriksaan_umum", label: "Pemeriksaan Umum" },
    { value: "pemeriksaan_umum_a", label: "Pemeriksaan Umum a" },
    { value: "pemeriksaan_umum_b", label: "Pemeriksaan Umum b" },
  ];

  const handleSave = () => {
    console.log("=== Data yang Disimpan ===");
    console.log("Pasien:", selectedPasien);
    console.log("Layanan:", selectedLayanan);
    console.log("Tanggal:", selectedDate);
    console.log("Keluhan:", complaint);
    console.log("Jenis Layanan: Onsite (Booking Online)");
    console.log("Lokasi: Klinik Hewan A");
    alert("Data berhasil disimpan ke console!");
  };

  return (
    <div className="hal3">
      <div className="form-group">
        <label>Pilih Pasien *</label>
        <Select
          styles={customSelectStyles}
          options={pasienOptions}
          placeholder="Pilih Pasien"
          onChange={(selectedOption) => setSelectedPasien(selectedOption)}
        />
      </div>

      <div className="form-group">
        <label>Pilih Layanan *</label>
        <Select
          styles={customSelectStyles}
          options={layananOptions}
          placeholder="Pilih Layanan"
          onChange={(selectedOption) => setSelectedLayanan(selectedOption)}
        />
      </div>

      <div className="form-group">
        <label>Pilih Waktu Pemeriksaan *</label>
        <div className="date-input-wrapper">
          <input
            className="date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min="1900-01-01"
            max="2099-12-31"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="warna">Pilih Jenis Layanan *</label>
        <input className="warna" type="text" value="Onsite (Booking Online)" readOnly />
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
        <input className="warna" type="text" value="Klinik Hewan A" readOnly />
      </div>

      {/* Tombol Simpan */}
      <div className="simpan">
        <button className="btn-simpan" onClick={handleSave}>
          Simpan
        </button>
      </div>
    </div>
  );
}

export default Halaman3;
