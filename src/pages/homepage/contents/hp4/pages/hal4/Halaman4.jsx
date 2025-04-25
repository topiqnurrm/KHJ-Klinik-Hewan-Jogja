import React, { useEffect, useState } from "react";
import "./halaman4.css";
import { createBooking } from "../../../../../../api/api-booking";
import Popup from "../../../../../../components/popup/popup2"; // sesuaikan path-nya

function Halaman4({ onPre, onBookingSaved }) {
  const [user, setUser] = useState(null);
  const [savedInput, setSavedInput] = useState(null);
  const [pasien, setPasien] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // ✅ Popup state

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

  const handleKonfirmasi = async () => {
    if (!savedInput || !pasien) return;
  
    const bookingData = {
      id_pasien: pasien._id,
      pilih_tanggal: savedInput.tanggal,
      keluhan: savedInput.keluhan,
      nama: pasien.nama, // Tambahkan nama hewan ke data booking
      pelayanans1: [
        {
          id_pelayanan: savedInput.layanan.value,
          nama: savedInput.layanan.label,  // Add the service name here
          jumlah: 1,
        },
      ],
      administrasis1: [],
    };
  
    try {
      setLoading(true);
      const response = await createBooking(bookingData);
  
      // Hapus data dari localStorage
      localStorage.removeItem("savedInput");
      localStorage.removeItem("selectedPasienData");
  
      // Reset state
      setSavedInput(null);
      setPasien(null);
  
      // Trigger the onBookingSaved callback to refresh NavBar notifications
      if (onBookingSaved) onBookingSaved();
  
      // Panggil onPre untuk kembali ke Halaman3 setelah booking berhasil
      onPre();
    } catch (error) {
      alert("❌ Gagal booking: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const confirmPopup = () => {
    closePopup();
    handleKonfirmasi();
  };

  if (!savedInput || !pasien) {
    return (
      <div className="hal4" style={{ textAlign: "center", padding: "2rem", fontSize: "1.2rem" }}>
        <p className="belumisi" style={{ marginTop: '5rem' }}>
          ⚠️ Silahkan isi dan simpan <strong>'3. Pelayanan'</strong> terlebih dahulu.
        </p>
      </div>
    );
  }

  return (
    <div className="hal4">
      <p><strong>Nama Klien :</strong> {user?.nama}</p>
      <p><strong>Telepon Pengguna :</strong> {user?.telepon}</p>
      <p><strong>Nama Hewan :</strong> {pasien.nama}</p>
      <p><strong>Jenis Hewan :</strong> {pasien.jenis}</p>
      <p><strong>Kategori Hewan :</strong> {pasien.kategori}</p>
      <p><strong>Jenis Pelayanan :</strong> {savedInput.jenisLayanan}</p>
      <p><strong>Waktu Pemeriksaan :</strong> {formatTanggal(savedInput.tanggal)}</p>
      <p><strong>Lokasi Pemeriksaan :</strong> {savedInput.lokasi}</p>
      <p><strong>Keluhan :</strong> {savedInput.keluhan}</p>
      <p><strong>Layanan :</strong> {savedInput.layanan.label}</p>

      <p className="iniw" style={{ marginTop: "1rem" }}>
        * Setelah pilih konfirmasi, silakan cek <span>"Riwayat Pemeriksaan Hewan Saya"</span> (sebelah kiri profile)<br />
        * Jangan lupa untuk datang sesuai hari booking anda
      </p>

      <button
        className="btn-konfirmasi"
        onClick={openPopup}
        disabled={loading}
      >
        {loading ? "Memproses..." : "Konfirmasi"}
      </button>

      {/* ✅ Popup Konfirmasi */}
      <Popup
        isOpen={isPopupOpen}
        onClose={closePopup}
        title="Konfirmasi Booking"
        description="Apakah Anda yakin ingin melakukan booking online ini?"
        onConfirm={confirmPopup}
      />
    </div>
  );
}

export default Halaman4;