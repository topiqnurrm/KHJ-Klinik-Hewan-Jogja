import React, { useEffect, useState } from "react";
import "./halaman4.css"; // pastikan kamu punya file CSS sesuai styling

function Halaman4() {
  const [user, setUser] = useState(null);
  const [savedInput, setSavedInput] = useState(null);
  const [pasien, setPasien] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const saved = JSON.parse(localStorage.getItem("savedInput"));
    const pasienData = JSON.parse(localStorage.getItem("selectedPasienData"));

    setUser(userData);
    setSavedInput(saved);
    setPasien(pasienData);
  }, []);

  const formatTanggal = (tanggalStr) => {
    const tanggal = new Date(tanggalStr);
    const hari = tanggal.toLocaleDateString("id-ID", { weekday: "long" });
    const tanggalFormat = tanggal.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${hari}, ${tanggalFormat}`;
  };

  if (!user || !savedInput || !pasien) return <div>Memuat data...</div>;

  return (
    <div className="hal4">
      <p><strong>Nama Klien :</strong> {user.nama}</p>
      <p><strong>Telepon Pengguna :</strong> {user.telepon}</p>
      <p><strong>Nama Hewan :</strong> {pasien.nama}</p>
      <p><strong>Jenis Hewan :</strong> {pasien.jenis}</p>
      <p><strong>Kategori Hewan :</strong> {pasien.kategori}</p>
      <p><strong>Jenis Pelayanan :</strong> {savedInput.jenisLayanan}</p>
      <p><strong>Waktu Pemeriksaan :</strong> {formatTanggal(savedInput.tanggal)}</p>
      <p><strong>Lokasi Pemeriksaan :</strong> {savedInput.lokasi}</p>
      <p><strong>Keluhan :</strong> {savedInput.keluhan}</p>
      <p><strong>Layanan :</strong> {savedInput.layanan.label}</p>

      <p style={{ marginTop: "1rem" }}>
        * Setelah pilih konfirmasi, silakan cek <strong>“Riwayat Pemeriksaan Hewan Saya”</strong><br />
        * Jangan lupa untuk datang sesuai hari booking anda
      </p>

      <button className="btn-konfirmasi">Konfirmasi</button>
    </div>
  );
}

export default Halaman4;
