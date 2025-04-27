import React from "react";
import Hireadmin from "../../pages/adminland/hireadmin.jsx";
import ProtectedRoute from "../../ProtectedRoute.jsx";

import './adminkhj.css'

function userland() {

  return (
    <ProtectedRoute allowedRoles={["superadmin", "administrasi", "pembayaran", "dokter", "paramedis"]}>
      <Hireadmin />
    </ProtectedRoute>
  )
}

export default userland
