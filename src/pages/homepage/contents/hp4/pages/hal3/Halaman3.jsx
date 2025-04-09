import React, { useState } from "react";
import "./halaman3.css";
// import tanggalIcon from "./gambar/tanggal.png";

function Halaman3() {
  const [selectedDate, setSelectedDate] = useState("");
  const [complaint, setComplaint] = useState("");

  return (
    <div className="hal3">
      <div className="form-group">
        <label>Pilih Pasien *</label>
        <select>
          <option>Wowo</option>
          {/* Nantinya isi dengan data dari MongoDB */}
        </select>
      </div>

      <div className="form-group">
        <label>Pilih Layanan *</label>
        <select>
          <option>Pemeriksaan Umum</option>
          {/* Nantinya isi dengan data dari MongoDB */}
        </select>
      </div>

      <div className="form-group">
        <label>Pilih Waktu Pemeriksaan *</label>
        <div className="date-input-wrapper">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {/* <img src={tanggalIcon} alt="tanggal" /> */}
        </div>
      </div>

      <div className="form-group">
        <label>Pilih Jenis Layanan *</label>
        <input type="text" value="Onsite (Booking Online)" readOnly />
      </div>

      <div className="form-group_full-width">
        <label>Keluhan Pasien *</label>
        <textarea
          rows={3}
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Masukkan keluhan..."
        />
      </div>

      <div className="form-group_full-width">
        <label>Pilih Lokasi Pemeriksaan *</label>
        <input type="text" value="Klinik Hewan A" readOnly />
      </div>
    </div>
  );
}

export default Halaman3;
