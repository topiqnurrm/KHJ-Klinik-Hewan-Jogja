import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import logoKHJ from "./gambar/logoKHJ.png";
import userIcon from "./gambar/user-icon.png";
import lockIcon from "./gambar/lock-icon.png";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State untuk loading

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (!username || !password) {
      return showError("Email dan password harus diisi.");
    }
  
    if (!validateEmail(username)) {
      return showError("Format email tidak valid.");
    }
  
    if (password.length < 6) {
      return showError("Password minimal 6 karakter.");
    }
  
    setLoading(true); // Set loading ke true saat mulai login
  
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Simpan data user ke localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
      
        // Arahkan ke halaman sesuai peran
        const adminRoles = ['superadmin', 'dokter', 'administrasi', 'pembayaran', 'paramedis'];
        if (adminRoles.includes(data.user.aktor)) {
          navigate("/Hireadmin");
        } else {
          navigate("/homepage");
        }
      } else {
        showError(data.message);
      }      
  
    } catch (error) {
      console.error("Login error:", error);
      showError("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false); // Set loading ke false setelah login selesai
    }
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 2000);
  };

  const handleGuestLogin = () => {
    navigate("/homepage");
  };

  const handleGoToRegister = () => {
    navigate("/registrasi");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleLogin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [username, password]);

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pesan = params.get('success');
    if (pesan) {
      setSuccessMessage(pesan);

      const timer = setTimeout(() => setSuccessMessage(""), 7000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="login-container">
      {successMessage && (
        <div style={{
          backgroundColor: "#d4edda",
          color: "#155724",
          padding: "10px 20px",
          borderRadius: "8px",
          marginBottom: "15px",
          position: "relative",
          paddingRight: "40px",
        }}>
          {successMessage}
          <button
            style={{
              position: "absolute",
              right: "10px",
              top: "0px",
              background: "transparent",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              color: "#155724"
            }}
            onClick={() => setSuccessMessage("")}
          >
            ✖
          </button>
        </div>
      )}
      
      <div className="login-card">
        <img src={logoKHJ} alt="Logo KHJ" className="logo" />
        <p>Login Layanan Klinik Hewan <br /> Kota Yogyakarta</p>

        <div className="input-group">
          <img src={userIcon} alt="User Icon" className="input-icon" />
          <input 
            type="email" 
            placeholder="Email" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            autoComplete="email"  // Menambahkan autoComplete untuk autofill
          />
        </div>

        <div className="input-group">
          <img src={lockIcon} alt="Lock Icon" className="input-icon" />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        {error && (
          <p style={{ color: "red", fontSize: "0.9rem", marginTop: "-5px", transition: "opacity 0.5s ease" }}>
            {error}
          </p>
        )}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}

        <div className="button-group">
          <button 
            className="register-btn" 
            onClick={handleGoToRegister} 
            disabled={loading} // Tombol registrasi dinonaktifkan saat loading
          >
            Registrasi
          </button>
          <button 
            className="login-btn" 
            onClick={handleLogin} 
            disabled={loading} // Tombol login dinonaktifkan saat loading
          >
            Login
          </button>
        </div>

        <p className="guest-text" onClick={handleGuestLogin}>
          Lanjutkan sebagai Guest
        </p>
      </div>
    </div>
  );
};

export default Login;
