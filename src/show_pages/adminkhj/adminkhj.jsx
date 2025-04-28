import React from "react";
import Hireadmin from "../../pages/adminland/hireadmin.jsx";
import ProtectedRoute from "../../ProtectedRoute.jsx";

import './adminkhj.css';

function Userland() {
  // Mengambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Cek jika tidak ada data user, arahkan kembali ke halaman login
  if (!user) {
    return (
      <div className="access-denied-container">
        <h1>❌ Akses Ditolak</h1>
        <p>Anda belum login. Silakan login terlebih dahulu.</p>
        <button className="access-denied-button" onClick={() => window.location.href = '/'}>Kembali ke Login</button>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["superadmin", "administrasi", "pembayaran", "dokter", "paramedis"]}>
      <Hireadmin />
    </ProtectedRoute>
  );
}

export default Userland;
