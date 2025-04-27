// src/ProtectedRoute.jsx

import React from "react";
import './ProtectedRoute.css';
import { useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const userData = JSON.parse(localStorage.getItem("user"));

  if (!userData) {
    // Jika tidak ada user, tetap izinkan akses ke halaman umum
    return children;
  }

  const userRole = userData.aktor;

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="access-denied-container">
        <h1>❌ Akses Ditolak</h1>
        <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <button 
          className="access-denied-button" 
          onClick={() => window.location.href = "/"}
        >
          Kembali ke Login
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
