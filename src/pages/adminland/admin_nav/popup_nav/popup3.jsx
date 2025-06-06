import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./popup3.css";
import ConfirmUpdatePopup from "./ConfirmUpdatePopup";
import { updateUser, sendVerificationEmail } from "../../../../api/api-user"; // Import fungsi dari api-user.js

const Popup3 = ({ isOpen, onClose, userData }) => {
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

  const [originalEmail, setOriginalEmail] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "";
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
      setOriginalEmail(userData.email || "");
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9+]+$/.test(phone);

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  const handleSendVerificationEmail = async (email, password) => {
    try {
      await sendVerificationEmail(email, password);
    } catch (err) {
      console.error("Email verifikasi gagal:", err);
      showError("Gagal mengirim email verifikasi.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "image/png") {
        showError("Hanya gambar PNG yang diperbolehkan.");
        return;
      }
      setFormData((prev) => ({ ...prev, gambar: file }));
      setFileName(file.name);
    }
  };

  const isEmailChanged = () => {
    return formData.email !== originalEmail;
  };

  const handleSubmit = async () => {
    if (!isDataChanged()) {
      return showError("Tidak ada perubahan.");
    }

    const { nama, email, password, telepon, alamat, gender, tanggal_lahir } = formData;

    if (!nama || nama.length > 100) return showError("Nama wajib diisi dan maksimal 100 karakter.");
    if (!email || !validateEmail(email) || email.length > 100) return showError("Email wajib diisi, format harus valid, dan maksimal 100 karakter.");
    
    // Check if email is changed but password is empty
    if (isEmailChanged() && !password) {
      return showError("Password wajib diisi jika mengubah email.");
    }
    
    if (password && (password.length < 6 || password.length > 100)) return showError("Password minimal 6 karakter dan maksimal 100 karakter.");
    if (!telepon || !validatePhone(telepon) || telepon.length > 20) return showError("Telepon wajib diisi, hanya angka atau +, maksimal 20 karakter.");
    if (!alamat) return showError("Alamat wajib diisi.");
    if (!gender || !["Laki-laki", "Perempuan"].includes(gender)) return showError("Gender wajib dipilih.");
    if (!tanggal_lahir) return showError("Tanggal lahir wajib diisi.");

    const tahun = parseInt(tanggal_lahir.split("-")[0], 10);
    if (tahun < 1900 || tahun > 2099) return showError("Tahun lahir harus antara 1900 dan 2099.");

    try {
      // Gunakan fungsi updateUser dari api-user.js
      const result = await updateUser(userData._id, formData);

      if (result.user) {
        // Update local storage dengan data user yang baru
        const currentUser = JSON.parse(localStorage.getItem("user")) || {};
        const mergedUser = { ...result.user, token: currentUser.token };
        localStorage.setItem("user", JSON.stringify(mergedUser));

        // Kirim email verifikasi jika email atau password diubah
        if (
          (email && email !== userData.email) ||
          (password && password.length > 0)
        ) {
          await handleSendVerificationEmail(email, password);
        }

        onClose();
        window.location.reload();
      } else {
        showError(result.message || "Gagal memperbarui data.");
      }
    } catch (error) {
      console.error("Update error:", error);
      showError(error.response?.data?.message || "Terjadi kesalahan saat mengirim data.");
    }
  };

  const handleSaveClick = () => {
    if (!isDataChanged()) {
      return showError("Tidak ada perubahan.");
    }
  
    const { nama, email, password, telepon, alamat, gender, tanggal_lahir } = formData;
  
    if (!nama || nama.length > 100) return showError("Nama wajib diisi dan maksimal 100 karakter.");
    if (!email || !validateEmail(email) || email.length > 100) return showError("Email wajib diisi, format harus valid, dan maksimal 100 karakter.");
    
    // Check if email is changed but password is empty
    if (isEmailChanged() && !password) {
      return showError("Password wajib diisi jika mengubah email.");
    }
    
    if (password && (password.length < 6 || password.length > 100)) return showError("Password minimal 6 karakter dan maksimal 100 karakter.");
    if (!telepon || !validatePhone(telepon) || telepon.length > 20) return showError("Telepon wajib diisi, hanya angka atau +, maksimal 20 karakter.");
    if (!alamat) return showError("Alamat wajib diisi.");
    if (!gender || !["Laki-laki", "Perempuan"].includes(gender)) return showError("Gender wajib dipilih.");
    if (!tanggal_lahir) return showError("Tanggal lahir wajib diisi.");
  
    const tahun = parseInt(tanggal_lahir.split("-")[0], 10);
    if (tahun < 1900 || tahun > 2099) return showError("Tahun lahir harus antara 1900 dan 2099.");
  
    setShowConfirmPopup(true);
  };
  
  const handleConfirm = () => {
    setShowConfirmPopup(false);
    handleSubmit();
  };

  const isDataChanged = () => {
    const { nama, gender, telepon, email, tanggal_lahir, alamat, password, gambar } = formData;
    return (
      nama !== userData.nama ||
      gender !== userData.gender ||
      telepon !== userData.telepon ||
      email !== userData.email ||
      tanggal_lahir !== formatDate(userData.tanggal_lahir) ||
      alamat !== userData.alamat ||
      password.length > 0 ||
      gambar !== null
    );
  };
  
  if (!isOpen || !userData) return null;

  return ReactDOM.createPortal(
    <>
      <div className="popup-overlay3-admin">
        <div className="popup-content popup-confirm" onClick={(e) => e.stopPropagation()}>
          <h2>Edit Data Saya</h2>

          {error && <div className="error-alert">{error}</div>}

          <form className="edit-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-left">
              <label>Nama *</label>
              <input name="nama" value={formData.nama} onChange={handleChange} className={formData.nama ? "edited" : ""} />

              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={formData.gender ? "edited" : ""}>
                <option value="">Pilih Gender</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>

              <label>Telepon *</label>
              <input name="telepon" value={formData.telepon} onChange={handleChange} className={formData.telepon ? "edited" : ""} />

              <label>Password {isEmailChanged() ? '* (Wajib diisi jika email diubah)' : ''}</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder={isEmailChanged() ? "Password wajib diisi" : "Tulis password baru"} 
                className={formData.password ? "edited" : isEmailChanged() ? "edited required" : ""}
                required={isEmailChanged()}
              />
            </div>

            <div className="form-right">
              <label>Email *</label>
              <input name="email" value={formData.email} onChange={handleChange} className={formData.email ? "edited" : ""} />

              <label>Tanggal Lahir *</label>
              <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} className={formData.tanggal_lahir ? "edited" : ""} min="1900-01-01" max="2099-12-31" />

              <label>Alamat *</label>
              <input name="alamat" value={formData.alamat} onChange={handleChange} className={formData.alamat ? "edited" : ""} />

              <label>Gambar Profile</label>
              <div className="file-input-wrapper">
                <label className="custom-file-upload-inside">
                  <span className="upload-button">Pilih Gambar</span>
                  <input type="file" accept="image/png" onChange={handleFileChange} />
                  <span className="file-name-inside">{fileName ? `File: ${fileName}` : "Belum ada file"}</span>
                </label>
              </div>
            </div>
          </form>

          <div className="form-buttons">
            <button type="button" className="popup-button cancel" onClick={onClose}>Batal</button>
            <button type="button" className="popup-button confirm" onClick={handleSaveClick}>Simpan</button>
          </div>
        </div>
      </div>

      <ConfirmUpdatePopup isOpen={showConfirmPopup} onClose={() => setShowConfirmPopup(false)} onConfirm={handleConfirm} />
    </>,
    document.body
  );
};

export default Popup3;