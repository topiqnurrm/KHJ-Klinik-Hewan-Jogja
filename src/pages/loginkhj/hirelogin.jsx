import { useLocation } from "react-router-dom";

import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import halaman
import Login from "./contents/login/login.jsx";
import Homepage from "../../show_pages/homepage/homepage.jsx";
import Hireadmin from "../../show_pages/adminkhj/adminkhj.jsx";
import Registrasi from "./contents/registrasi/registrasi.jsx";

// Import ProtectedRoute
import ProtectedRoute from "../../ProtectedRoute.jsx";

// Import CSS
import "./hirelogin.css";

function Loginkhj() {
  useEffect(() => {
    if (location.pathname === "/") {
      // Hanya hapus localStorage saat path adalah '/'
      localStorage.removeItem("user");
    }
  }, [location]);

  return (
    <Router>
      <div className="hirelogin">
        <Routes>
          {/* Route login */}
          <Route path="/" element={<Login />} />

          {/* Route homepage */}
          <Route 
            path="/homepage" 
            element={
              <ProtectedRoute allowedRoles={["klien", ""]}>
                <Homepage />
              </ProtectedRoute>
            } 
          />

          {/* Route admin page */}
          <Route 
            path="/hireadmin" 
            element={
              <ProtectedRoute allowedRoles={["superadmin", "administrasi", "pembayaran", "dokter", "paramedis"]}>
                <Hireadmin />
              </ProtectedRoute>
            } 
          />

          {/* Route registrasi */}
          <Route path="/registrasi" element={<Registrasi />} />
        </Routes>
      </div>
    </Router>
  );
}

export default Loginkhj;
