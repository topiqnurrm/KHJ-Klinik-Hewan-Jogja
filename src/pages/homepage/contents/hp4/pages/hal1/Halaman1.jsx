import React, { useEffect, useState } from "react";
import { getUserById } from "../../../../../../api/user";
import "./halaman1.css";

function Halaman1() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (storedUser && storedUser._id) {
      getUserById(storedUser._id).then(data => {
        if (data) setUser(data);
      });
    }
  }, []);

  return (
    <div className="hal1">
      <div className="form-group">
        <label>ID Klien</label>
        <input type="text" value={user?.user_id || ''} readOnly style={{ color: "#8C8C8C" }} />
      </div>
      <div className="form-group">
        <label>Telepon Klien *</label>
        <input type="text" value={user?.telepon || ''} readOnly style={{ color: "#8C8C8C" }} />
      </div>
      <div className="form-group">
        <label>Nama Klien *</label>
        <input type="text" value={user?.nama || ''} readOnly style={{ color: "#8C8C8C" }} />
      </div>
      <div className="form-group">
        <label>Email Klien *</label>
        <input type="text" value={user?.email || ''} readOnly style={{ color: "#8C8C8C" }} />
      </div>
      <div className="form-group_full-width">
        <label>Alamat Klien *</label>
        <input type="text" value={user?.alamat || ''} readOnly style={{ color: "#8C8C8C" }} />
      </div>
    </div>
  );
}

export default Halaman1;
