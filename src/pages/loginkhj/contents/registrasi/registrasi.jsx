import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./registrasi.css";

const Registrasi = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegistrasi = () => {
    console.log(form);
    navigate("/");
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="registrasi-page">
        <div className="sticky-header">
            <button className="back-button" onClick={handleBack}>&lt;</button>
            <h2>Registrasi Layanan Klinik Hewan Kota Yogyakarta</h2>
        </div>
        <div className="registrasi-body">
            <div className="registrasi-form">
                    <div className="form-group">
                        <label>Nama</label>
                        <label className="ini">:</label>
                        <input
                        type="text"
                        name="nama"
                        placeholder="Nama"
                        value={form.nama}
                        onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <label className="ini">:</label>
                        <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <label className="ini">:</label>
                        <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Telepon</label>
                        <label className="ini">:</label>
                        <input
                        type="text"
                        name="telepon"
                        placeholder="Telepon"
                        value={form.telepon}
                        onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Alamat</label>
                        <label className="ini">:</label>
                        <input
                        type="text"
                        name="alamat"
                        placeholder="Alamat"
                        value={form.alamat}
                        onChange={handleChange}
                        />
                    </div>

                    <button className="bawah" onClick={handleRegistrasi}>Registrasi</button>
                </div>
            </div>
    </div>
  );
};

export default Registrasi;
