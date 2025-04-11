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

  const handleLogin = () => {
    if (!username || !password) {
      setError("Email dan password harus diisi.");
      
      // Hilangkan error setelah 2 detik
      setTimeout(() => {
        setError("");
      }, 2000);

      return;
    }

    if (username === "admin" && password === "admin") {
      navigate("/hireadmin");
    } else {
      navigate("/homepage");
    }
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

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logoKHJ} alt="Logo KHJ" className="logo" />
        <p>Login Layanan Klinik Hewan <br /> Kota Yogyakarta</p>

        <div className="input-group">
          <img src={userIcon} alt="User Icon" className="input-icon" />
          <input 
            type="text" 
            placeholder="Email" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
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

        {/* Tampilkan error dan auto hilang */}
        {error && (
          <p style={{ color: "red", fontSize: "0.9rem", marginTop: "-5px", transition: "opacity 0.5s ease" }}>
            {error}
          </p>
        )}

        <div className="button-group">
          <button className="register-btn" onClick={handleGoToRegister}>Registrasi</button>
          <button className="login-btn" onClick={handleLogin}>Login</button>
        </div>

        <p className="guest-text" onClick={handleGuestLogin}>
          Lanjutkan sebagai Guest
        </p>
      </div>
    </div>
  );
};

export default Login;
