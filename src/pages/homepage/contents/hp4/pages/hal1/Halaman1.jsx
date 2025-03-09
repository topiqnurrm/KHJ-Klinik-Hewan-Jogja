import React from "react";
import "./halaman1.css";

function Halaman1() {
  return (
    <div className="hal1">
      <div className="form-group">
        <label>ID Pengguna *</label>
        <input type="text" value="AHDKB3746" readOnly style={{ color: "#8C8C8C"}} />
      </div>
      <div className="form-group">
        <label>Telepon Pengguna *</label>
        <input type="text" value="088232363332" readOnly style={{ color: "#8C8C8C" }} />
      </div>
      <div className="form-group">
        <label>Nama Pengguna *</label>
        <input type="text" value="Taufiq Nurrohman" readOnly style={{ color: "#8C8C8C" }} />
      </div>
      <div className="form-group">
        <label>Email Pengguna *</label>
        <input type="text" value="toopique@gmail.com" readOnly style={{ color: "#8C8C8C" }} />
      </div>
      <div className="form-group_full-width">
        <label>Alamat Pengguna *</label>
        <input type="text" value="Ledok Gowok Caturtunggal Depok Sleman" readOnly style={{ color: "#8C8C8C" }} />
      </div>
    </div>
  );
}

export default Halaman1;
