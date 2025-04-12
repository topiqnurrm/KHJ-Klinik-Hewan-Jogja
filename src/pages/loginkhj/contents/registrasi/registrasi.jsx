import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "./registrasi.css";

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#F1F1F1",
    border: "none",              // Hilangkan border
    borderRadius: "8px",
    padding: "2px 4px",
    fontSize: "1rem",
    color: "#666",
    width: "530px",
    outline: "none",
    boxShadow: "none",           // Pastikan tidak ada shadow
    boxSizing: "border-box",
    minHeight: "42px",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "8px",
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#e0f7ef" : "#fff",
    fontSize: "1rem",
    color: "#555",
  }),
  
  singleValue: (provided) => ({
    ...provided,
    color: "#3F4254",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#999",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#555",   // warna ikon (seperti di gambar kamu)
    padding: "4px",
    "&:hover": {
      color: "#555",  // supaya tidak berubah saat hover
    },
    paddingRight: "5px",
  }),  
  indicatorSeparator: () => ({ display: 'none' }),
};

const Registrasi = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
    password: "",
    gender: null,
    tanggal_lahir: ""
  });

  const genderOptions = [
    { value: "Laki-laki", label: "Laki-laki" },
    { value: "Perempuan", label: "Perempuan" }
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9+]+$/.test(phone);

  const [error, setError] = useState("");

  const handleRegistrasi = () => {
    const { nama, email, telepon, alamat, password, gender, tanggal_lahir } = form;

    if (!nama || nama.length > 100) return showError("Nama wajib diisi dan maksimal 100 karakter.");
    if (!email || !validateEmail(email) || email.length > 100) return showError("Email wajib diisi, format harus valid, dan maksimal 100 karakter.");
    if (!password || password.length > 100) return showError("Password wajib diisi dan maksimal 100 karakter.");
    if (!telepon || !validatePhone(telepon) || telepon.length > 20) return showError("Telepon wajib diisi, hanya angka atau +, maksimal 20 karakter.");
    if (!alamat) return showError("Alamat wajib diisi.");
    if (!gender || !["Laki-laki", "Perempuan"].includes(gender.value)) return showError("Gender wajib dipilih.");
    if (!tanggal_lahir) return showError("Tanggal lahir wajib diisi.");

    const tahun = parseInt(tanggal_lahir.split("-")[0], 10);
    if (tahun < 1900 || tahun > 2099) return showError("Tahun lahir harus antara 1900 dan 2099.");

    console.log(form);
    navigate("/");
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") handleRegistrasi();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [form]);

  return (
    <div className="registrasi-page">
      <div className="sticky-header">
        <button className="back-button" onClick={() => navigate("/")}>&lt;</button>
        <div className="header-content">
          <h2>Registrasi Layanan Klinik Hewan Kota Yogyakarta</h2>
          {error && <div className="error-alert">{error}</div>}
        </div>
      </div>
      <div className="registrasi-body">
        
        <form>
          <div className="registrasi-form">
          <div className="form-group">
              <label>Nama</label>
              <label className="ini">:</label>
              <input
                type="text"
                name="nama"
                placeholder="Nama"
                value={form.nama}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <label className="ini">:</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <label className="ini">:</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <label className="ini">:</label>
              <div className="pilihan" style={{ width: "530px" }}>
                <Select
                  styles={customSelectStyles}
                  options={genderOptions}
                  placeholder="Pilih Gender"
                  value={form.gender}
                  onChange={(selected) =>
                    setForm({ ...form, gender: selected })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tanggal Lahir</label>
              <label className="ini">:</label>
              <input
                type="date"
                name="tanggal_lahir"
                value={form.tanggal_lahir}
                onChange={handleChange}
                min="1900-01-01"
                max="2099-12-31"
              />
            </div>

            <div className="form-group">
              <label>Telepon</label>
              <label className="ini">:</label>
              <input
                type="text"
                name="telepon"
                placeholder="Telepon"
                value={form.telepon}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Alamat</label>
              <label className="ini">:</label>
              <input
                type="text"
                name="alamat"
                placeholder="Alamat"
                value={form.alamat}
                onChange={handleChange}
              />
            </div>
            {/* semua input tetap seperti sebelumnya */}
            {/* Gender */}
            <div className="form-group">
              <label>Gender</label>
              <label className="ini">:</label>
              <div className="pilihan" style={{ width: "530px" }}>
                <Select
                  styles={customSelectStyles}
                  options={genderOptions}
                  placeholder="Pilih Gender"
                  value={form.gender}
                  onChange={(selected) => setForm({ ...form, gender: selected })}
                />
              </div>
            </div>
            <button className="bawah" type="button" onClick={handleRegistrasi}>Registrasi</button>
          </div>
        </form>
        
      </div>
    </div>
  );
};

export default Registrasi;
