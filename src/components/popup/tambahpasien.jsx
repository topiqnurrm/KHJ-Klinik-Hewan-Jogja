import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./tambahpasien.css";
import Select from "react-select";

const TambahPasien = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nama: "",
    jenis: "",
    kategori: "",
    ras: "",
    kelamin: "",
    umur: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 2000);
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
      onClose();
      window.location.reload();
    }, 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { nama, jenis, kategori, kelamin, ras, umur } = formData;
  
    if (!nama || !jenis || !kategori) {
      return showError("Harap lengkapi semua data wajib (dengan tanda *).");
    }
  
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const id_user = storedUser?._id;
  
      // Susun data untuk dikirim, hapus jika kosong
      const dataToSend = {
        nama,
        jenis,
        kategori,
        id_user,
      };
  
      if (kelamin) dataToSend.jenis_kelamin = kelamin;
      if (ras) dataToSend.ras = ras;
      if (umur) dataToSend.umur = umur;
  
      const res = await fetch("http://localhost:5000/api/pasien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
  
      if (res.ok) {
        showSuccess("Pasien berhasil ditambahkan!");
      } else {
        const data = await res.json();
        showError(data.message || "Gagal menambahkan pasien.");
      }
    } catch (err) {
      showError("Terjadi kesalahan saat mengirim data.");
    }
  };
  

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="tambahpasien-overlay">
      <div className="tambahpasien-content" onClick={(e) => e.stopPropagation()}>
        <h2>Tambah Pasien Baru</h2>

        {error && <div className="tambahpasien-error">{error}</div>}
        {successMessage && <div className="tambahpasien-success">{successMessage}</div>}

        <form className="tambahpasien-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-column">
            <label>Nama Hewan *</label>
            <input
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Nama Hewan"
              className={formData.nama ? "edited" : ""}
            />

            <label>Jenis Hewan *</label>
            <Select
              classNamePrefix="react-select"
              options={[
                { value: "anjing", label: "Anjing" },
                { value: "kucing", label: "Kucing" },
                { value: "ayam", label: "Ayam" },
                { value: "kelinci", label: "Kelinci" },
                { value: "burung", label: "Burung" },
              ]}
              isClearable
              isSearchable
              placeholder="Jenis Hewan"
              value={formData.jenis ? { value: formData.jenis, label: formData.jenis } : null}
              onChange={(selectedOption) =>
                setFormData((prev) => ({
                  ...prev,
                  jenis: selectedOption ? selectedOption.value : "",
                }))
              }
            />

            <label>Kategori Hewan *</label>
            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className={formData.kategori ? "edited" : ""}
            >
              <option value="">Pilih Kategori Hewan</option>
              <option value="ternak">Ternak</option>
              <option value="kesayangan / satwa liar">Kesayangan / Satwa Liar</option>
              <option value="unggas">Unggas</option>
            </select>
          </div>

          <div className="form-column">
            <label>Ras Hewan</label>
            <input
              name="ras"
              value={formData.ras}
              onChange={handleChange}
              placeholder="Ras Hewan"
              className={formData.ras ? "edited" : ""}
            />

            <label>Jenis Kelamin Hewan</label>
            <select
              name="kelamin"
              value={formData.kelamin}
              onChange={handleChange}
              className={formData.kelamin ? "edited" : ""}
            >
              <option value="">Pilih Jenis Kelamin Hewan</option>
              <option value="jantan">Jantan</option>
              <option value="betina">Betina</option>
            </select>

            <label>Umur Hewan (tahun)</label>
            <input
              name="umur"
              type="number"
              value={formData.umur}
              onChange={handleChange}
              placeholder="Umur Hewan (tahun)"
              className={formData.umur ? "edited" : ""}
            />
          </div>
        </form>

        <div className="tambahpasien-buttons">
          <button className="btn cancel" onClick={onClose}>Batal</button>
          <button className="btn confirm" onClick={handleSubmit}>Tambah</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TambahPasien;
