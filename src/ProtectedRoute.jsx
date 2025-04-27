// src/ProtectedRoute.jsx
import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import './ProtectedRoute.css';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  if (!userData) {
    return <Navigate to="/login" />;
  }

  const userRole = userData.aktor;

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="access-denied-container">
        <h1>❌ Akses Ditolak</h1>
        <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <button className="access-denied-button" onClick={() => navigate("/")}>
          Kembali ke Login
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
