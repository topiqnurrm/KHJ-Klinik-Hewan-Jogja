// src/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const userData = JSON.parse(localStorage.getItem("user"));

  if (!userData) {
    return <Navigate to="/login" />;
  }

  const userRole = userData.aktor;

  if (!allowedRoles.includes(userRole)) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>❌ Akses Ditolak</h1>
      <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
    </div>;
  }

  return children;
};

export default ProtectedRoute;
