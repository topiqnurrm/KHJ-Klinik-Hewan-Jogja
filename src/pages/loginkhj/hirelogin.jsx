import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./contents/login/login.jsx";
import Homepage from "../../show_pages/homepage/homepage.jsx";
import Hireadmin from "../../show_pages/adminkhj/adminkhj.jsx";

import "./hirelogin.css";

function Loginkhj() {
  return (
    <Router>
      <div className="hirelogin">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/hireadmin" element={<Hireadmin />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default Loginkhj;
