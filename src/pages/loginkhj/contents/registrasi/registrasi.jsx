import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "./registrasi.css";

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#F1F1F1",
    border: "none",
    borderRadius: "8px",
    padding: "2px 4px",
    fontSize: "1rem",
    color: "#666",
    width: "530px",
    outline: "none",
    boxShadow: "none",
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
    color: "#555",
    padding: "4px",
    "&:hover": {
      color: "#555",
    },
    paddingRight: "5px",
  }),
  indicatorSeparator: () => ({ display: "none" }),
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
    tanggal_lahir: "",
    aktor: "klien",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const genderOptions = [
    { value: "Laki-laki", label: "Laki-laki" },
    { value: "Perempuan", label: "Perempuan" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9+]+$/.test(phone);

  const handleRegistrasi = async () => {
    const { nama, email, telepon, alamat, password, gender, tanggal_lahir } = form;

    if (!nama || nama.length > 100) return showError("Nama wajib diisi dan maksimal 100 karakter.");
    if (!email || !validateEmail(email) || email.length > 100) return showError("Email wajib diisi, format harus valid, dan maksimal 100 karakter.");
    if (!password || password.length < 6) return showError("Password wajib diisi dan minimal 6 karakter.");
    if (!password || password.length > 100) return showError("Password wajib diisi dan maksimal 100 karakter.");
    if (!telepon || !validatePhone(telepon) || telepon.length > 20) return showError("Telepon wajib diisi, hanya angka atau +, maksimal 20 karakter.");
    if (!alamat) return showError("Alamat wajib diisi.");
    if (!gender || !["Laki-laki", "Perempuan"].includes(gender.value)) return showError("Gender wajib dipilih.");
    if (!tanggal_lahir) return showError("Tanggal lahir wajib diisi.");

    const tahun = parseInt(tanggal_lahir.split("-")[0], 10);
    if (tahun < 1900 || tahun > 2099) return showError("Tahun lahir harus antara 1900 dan 2099.");

    setIsLoading(true); // Mulai loading

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          email,
          password,
          telepon,
          alamat,
          aktor: "klien",
          gender: gender.value,
          tanggal_lahir,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        //penyebab eror
        // await sendVerificationEmail(email, password);  
        navigate("/?success=Registrasi berhasil! Email pemberitahuan terkirim.");
      } else {
        showError(data.message || "Registrasi gagal.");
      }
    } catch (error) {
      console.error(error);
      showError("Terjadi kesalahan, coba lagi.");
    } finally {
      setIsLoading(false); // Selesai loading
    }
  };

  const sendVerificationEmail = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const contentType = response.headers.get("content-type");
  
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.message || "Gagal mengirim email verifikasi.");
        } else {
          const text = await response.text(); // Untuk debug
          console.error("Unexpected response:", text);
          throw new Error("Gagal mengirim email verifikasi. Server tidak mengembalikan JSON.");
        }
      }
  
    } catch (error) {
      console.error("Email verifikasi gagal:", error);
      showError("Gagal mengirim email verifikasi.");
    }
  };  

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
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
              <input type="text" name="nama" placeholder="Nama" value={form.nama} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <label className="ini">:</label>
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <label className="ini">:</label>
              <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
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
                  onChange={(selected) => setForm({ ...form, gender: selected })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tanggal Lahir</label>
              <label className="ini">:</label>
              <input
                className={!form.tanggal_lahir ? "empty" : ""}
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
              <input type="text" name="telepon" placeholder="Telepon" value={form.telepon} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Alamat</label>
              <label className="ini">:</label>
              <input type="text" name="alamat" placeholder="Alamat" value={form.alamat} onChange={handleChange} />
            </div>

            <button className="bawah" type="button" onClick={handleRegistrasi} disabled={isLoading}>
              {isLoading ? "Memproses..." : "Registrasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registrasi;
