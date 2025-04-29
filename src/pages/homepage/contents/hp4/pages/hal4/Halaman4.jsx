import React, { useEffect, useState } from "react";
import "./halaman4.css";
import { createBooking } from "../../../../../../api/api-booking";
import Popup from "../../../../../../components/popup/popup2"; // sesuaikan path-nya

function Halaman4({ onPre, onBookingSaved }) {
  const [user, setUser] = useState(null);
  const [savedInput, setSavedInput] = useState(null);
  const [pasien, setPasien] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState(null);

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
    if (!savedInput || !pasien || !user) {
      setError("Data tidak lengkap. Silakan lengkapi data terlebih dahulu.");
      return;
    }
    
    // Validasi alamat untuk house call
    if (savedInput.jenisLayanan === "house call" && (!savedInput.lokasi || savedInput.lokasi.trim() === "")) {
      setError("Alamat untuk house call tidak boleh kosong.");
      return;
    }

    // Log data yang akan disimpan
    console.log("Jenis layanan:", savedInput.jenisLayanan);
    console.log("Lokasi dari input:", savedInput.lokasi);
    
    // Prepare booking data object sesuai dengan skema
    const bookingData = {
      id_pasien: pasien._id,
      pilih_tanggal: savedInput.tanggal, // Format YYYY-MM-DD
      keluhan: savedInput.keluhan || "-",
      nama: `${pasien.nama} (${pasien.jenis})`,
      kategori: pasien.kategori,
      jenis_layanan: savedInput.jenisLayanan, // onsite atau house call
      alamat: savedInput.lokasi, // Gunakan lokasi yang telah diinput di Halaman3
      pelayanans1: [
        {
          id_pelayanan: savedInput.layanan.value,
          nama: savedInput.layanan.label,
          jumlah: 1,
          tanggal: new Date().toISOString()
        },
      ],
      administrasis1: [
        {
          id_user: user._id,
          catatan: "-",
          status_administrasi: "menunggu respon administrasi",
          tanggal: new Date().toISOString(),
        },
      ],
      status_booking: "menunggu respon administrasi", // Menetapkan status booking awal
      biaya: 0, // Biaya default
    };
  
    try {
      setLoading(true);
      setError(null);
      
      console.log("Submitting booking data:", bookingData); // Debugging
      const response = await createBooking(bookingData);
      console.log("Booking response:", response); // Debugging
  
      // Clear local storage
      localStorage.removeItem("savedInput");
      localStorage.removeItem("selectedPasienData");
  
      // Clear state
      setSavedInput(null);
      setPasien(null);
  
      // Call callback functions
      if (onBookingSaved) onBookingSaved();
      onPre();
    } catch (error) {
      console.error("Error during booking:", error);
      setError(
        error.response?.data?.message || 
        "Gagal membuat booking. Silakan coba lagi."
      );
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

  // Dapatkan label untuk jenis layanan
  const jenisLayananLabel = savedInput.jenisLayananLabel || 
    (savedInput.jenisLayanan === "onsite" ? "Onsite (Booking Online)" : 
     savedInput.jenisLayanan === "house call" ? "House Call (Booking Online)" : 
     savedInput.jenisLayanan);

  return (
    <div className="hal4">
      <p><strong>Nama Klien :</strong> {user?.nama}</p>
      <p><strong>Telepon Pengguna :</strong> {user?.telepon}</p>
      <p><strong>Nama Hewan :</strong> {pasien.nama}</p>
      <p><strong>Jenis Hewan :</strong> {pasien.jenis}</p>
      <p><strong>Kategori Hewan :</strong> {pasien.kategori}</p>
      <p><strong>Jenis Pelayanan :</strong> {jenisLayananLabel}</p>
      <p><strong>Waktu Pemeriksaan :</strong> {formatTanggal(savedInput.tanggal)}</p>
      <p><strong>Lokasi Pemeriksaan :</strong> {savedInput.lokasi}</p>
      <p><strong>Keluhan :</strong> {savedInput.keluhan}</p>
      <p><strong>Layanan :</strong> {savedInput.layanan.label}</p>

      <p className="iniw" style={{ marginTop: "1rem" }}>
        * Setelah pilih konfirmasi, silakan cek <span>"Riwayat Pemeriksaan Hewan Saya"</span> (sebelah kiri profile)<br />
        * Jangan lupa untuk datang sesuai hari booking anda
      </p>

      {error && (
        <div className="error-message" style={{ color: "red", margin: "10px 0", padding: "10px", background: "#ffeeee", borderRadius: "5px" }}>
          {error}
        </div>
      )}

      <button
        className="btn-konfirmasi"
        onClick={openPopup}
        disabled={loading}
      >
        {loading ? "Memproses..." : "Konfirmasi"}
      </button>

      {/* Popup Konfirmasi */}
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