import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./popup3.css";

import { uploadImage } from "../../api/user"; // pastikan path ini sesuai

const customSelectStyles = {
    dropdownIndicator: (provided) => ({
      paddingRight: "50px",
    }),
    indicatorSeparator: () => ({ display: "none" }),
};

function Popup3({ isOpen, onClose, userData }) {
    const [formData, setFormData] = useState({
        nama: "",
        gender: "",
        telepon: "",
        password: "",
        email: "",
        tanggal_lahir: "",
        alamat: "",
        gambar: null,
    });

    const [fileName, setFileName] = useState("");

    // Format tanggal agar jadi yyyy-mm-dd
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split("T")[0];
        }
        return "";
    };

    useEffect(() => {
        if (userData) {
            setFormData({
                nama: userData.nama || "",
                gender: userData.gender || "",
                telepon: userData.telepon || "",
                password: "",
                email: userData.email || "",
                tanggal_lahir: formatDate(userData.tanggal_lahir),
                alamat: userData.alamat || "",
                gambar: null,
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const dataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value) {
            dataToSend.append(key, value);
          }
        });
      
        try {
          const response = await fetch(`http://localhost:5000/api/users/${userData._id}`, {
            method: "PUT",
            body: dataToSend,
          });
      
          const result = await response.json();
      
          if (response.ok) {
            alert("Data berhasil diperbarui.");
            onClose();
          } else {
            alert(result.message || "Gagal memperbarui data.");
          }
        } catch (error) {
          console.error("Update error:", error);
          alert("Terjadi kesalahan saat mengirim data.");
        }
    };
      
      

    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const response = await uploadImage(file);
        if (response && response.imageUrl) {
          setFormData((prev) => ({ ...prev, gambar: response.imageUrl }));
          setFileName(file.name);
        } else {
          alert("Gagal upload gambar.");
        }
      }
    };    

    if (!isOpen || !userData) return null;

    return ReactDOM.createPortal(
        <div className="popup-overlay3">
            <div className="popup-content popup-confirm" style={{ maxHeight: "90vh", overflowY: "auto" }}>
                <h2>Edit Data Saya</h2>
                <form className="edit-form" onSubmit={handleSubmit}>
                    <div className="form-left">
                        <label>Nama *</label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            className={formData.nama ? "edited" : ""}
                            placeholder="Nama"
                        />

                        <label>Gender *</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className={formData.gender ? "edited" : ""}
                            styles={customSelectStyles}
                        >
                            <option value="">Pilih Gender</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>

                        <label>Telepon *</label>
                        <input
                            type="text"
                            name="telepon"
                            value={formData.telepon}
                            onChange={handleChange}
                            className={formData.telepon ? "edited" : ""}
                            placeholder="Telepon"
                        />

                        <label>Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Tulis password baru"
                            className={formData.password ? "edited" : ""}
                        />
                    </div>

                    <div className="form-right">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={formData.email ? "edited" : ""}
                            placeholder="Email"
                        />

                        <label>Tanggal Lahir *</label>
                        <input
                            type="date"
                            name="tanggal_lahir"
                            value={formData.tanggal_lahir}
                            onChange={handleChange}
                            className={formData.tanggal_lahir ? "edited" : ""}
                            min="1900-01-01"
                            max="2099-12-31"
                        />

                        <label>Alamat *</label>
                        <input
                            type="text"
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleChange}
                            className={formData.alamat ? "edited" : ""}
                            placeholder="Alamat"
                        />

                        <label>Gambar Profile</label>
                        <div className="file-input-wrapper">
                            <label className="custom-file-upload-inside">
                                <span className="upload-button">Pilih Gambar</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <span className="file-name-inside">{fileName ? `File: ${fileName}` : "Belum ada file"}</span>
                            </label>
                        </div>
                    </div>
                </form>

                <div className="form-buttons">
                    <button type="button" className="popup-button cancel" onClick={onClose}>Batal</button>
                    <button type="submit" className="popup-button confirm" onClick={handleSubmit}>Simpan</button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default Popup3;
