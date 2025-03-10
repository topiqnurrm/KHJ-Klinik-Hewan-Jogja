import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./login.css";
import logoKHJ from "./gambar/logoKHJ.png";
import userIcon from "./gambar/user-icon.png";
import lockIcon from "./gambar/lock-icon.png";

const Login = () => {
  const navigate = useNavigate(); // Hook untuk navigasi
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "admin") {
      navigate("/hireadmin"); // Redirect ke HireAdmin jika admin
    } else {
      navigate("/homepage"); // Redirect ke Homepage jika bukan admin
    }
  };

  const handleGuestLogin = () => {
    navigate("/homepage"); // Redirect ke Homepage sebagai Guest
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logoKHJ} alt="Logo KHJ" className="logo" />
        <p>Login Layanan Klinik Hewan <br /> Kota Yogyakarta</p>

        <div className="input-group">
          <img src={userIcon} alt="User Icon" className="input-icon" />
          <input 
            type="text" 
            placeholder="Username / Email" 
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

        <div className="button-group">
          <button className="register-btn">Registrasi</button>
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
