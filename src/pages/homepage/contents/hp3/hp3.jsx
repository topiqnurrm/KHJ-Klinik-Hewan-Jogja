import { useState } from 'react';
import './hp3.css';
import layananImage from './gambar/kiri.png'; // Background kotak informasi
import qrCode from './gambar/kanan.png'; // Gambar di bagian kanan bawah
import hoverLayanan from './gambar/kiri2.png'; // Gambar hover kiri
import hoverQrCode from './gambar/kanan2.png'; // Gambar hover kanan
import bg from './gambar/bg.png';
import flowchart from './gambar/flowchart.png';
import Popup from "../../../../components/popup/popup.jsx";

function Hp3() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState({ image: "", title: "" });

  const openPopup = (image, title) => {
    setSelectedPopup({ image, title });
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  // State untuk gambar normal dan hover
  const [layananSrc, setLayananSrc] = useState(layananImage);
  const [qrCodeSrc, setQrCodeSrc] = useState(qrCode);
  const [bgColor, setBgColor] = useState('#EFFFFA'); // Warna awal

  const [selectedImage, setSelectedImage] = useState("image1");
  
    const images = {
      image1: flowchart,
    };

  return (
    <section id="hp3" className="hp3">
      {/* Bagian Atas */}
      <div className="header">
        <h1>Panduan</h1>
      </div>

      {/* Bagian Bawah */}
      <div className="main-content">
        {/* Kiri: Layanan Daftar Online */}
        <div className="left-section">
          <h2>Layanan Booking Online <span style={{ color: "#33374A" }}>KHJ (Klinik Hewan Jogja) :</span></h2>
          <ol>
            <li><span>Registrasi dan Login.</span> <br/>Silakan login terlebih dahulu. Jika Anda belum memiliki akun, lakukan  registrasi untuk menikmati <br/>layanan booking online.</li>
            <li><span>Membaca Informasi Layanan.</span> <br/>Sebelum melakukan pemesanan online, harap membaca informasi yang tersedia untuk memahami <br/>prosedur dan layanan yang kami tawarkan.</li>
            <li><span>Mengisi Data Hewan Pasien.</span> <br/>Masukkan data hewan, keluhan, dan informasi lain yang diperlukan untuk pemeriksaan.</li>
            {/* <li><span>Memilih Jenis Layanan.</span> <br/>Setelah memilih Booking Online, Anda akan diminta memilih jenis layanan medis.</li> */}
            <li><span>pemilihan Layanan dan jenis layanan.</span> <br/>Pilih layanan yang Anda butuhkan (grooming, pemeriksaan umum, dll), dan juga pilih jenis layanan (onsite, house call, dan offline).</li>
            <li><span>Konfirmasi Pendaftaran.</span> <br/>Setelah pendaftaran, Anda akan bisa konsultasi melalui WhatsApp petugas administrasi. Anda juga dapat memantau perkembangan pemeriksaan di bagian riwayat pemeriksaan hewan saya (kanan atas).</li>
            <li><span>Datang untuk Pemeriksaan / menunggu petugas datang.</span> <br/>Jika semua sudah terkonfirmasi dan sudah tiba waktunya pemeriksaan sesuai jadwal, maka datanglah ke klinik kami sesuai jadwal anda (akan mendapatkan nomor antri) atau tunggu petugas klinik datang bila jenis pelayanan anda house call.</li>
            <li><span>Pembayaran dan Pengambilan Obat.</span> <br/>Lakukan pembayaran dan pengambilan obat (mengambil obat untuk onsite dan offline) dan layanan Anda selesai.</li>
          </ol>
        </div>

        {/* Kanan: Informasi Layanan & Wadah */}
        <div className="right-section">
          {/* Kotak Informasi Layanan */}
          <div className="info-box" style={{ backgroundImage: `url(${bg})` }}>
            <h3>Informasi Layanan !</h3>
            <ul>
              {/* <li><span>Layanan Onsite </span>: Pemeriksaan di klinik kami.</li>
              <li><span>Layanan House Call </span>: Pemeriksaan di lokasi pemilik atau lokasi yang disepakati.</li> */}
              <li><span>Jenis Layanan (Onsite, House Call, dan Offline)</span>: Pemeriksaan di klinik kami (onsite), Pemeriksaan di lokasi pemilik atau lokasi yang disepakati (house call), pemeriksaan offline dengan mendaftar dari klinik langsung.</li>
              
              <li><span>Layanan Medis </span>: Pemeriksaan umum dan khusus, seperti laboratorium, injeksi, dll.</li>
              <li><span>Layanan Non-Medis </span>: Layanan grooming.</li>
            </ul>
          </div>

          {/* Wadah hover */}
          <div 
            className="container"
            style={{ backgroundColor: bgColor }}
            onMouseEnter={() => {
              setLayananSrc(hoverLayanan);
              setQrCodeSrc(hoverQrCode);
              setBgColor('#38AB97'); // Ubah warna saat hover
            }}
            onMouseLeave={() => {
              setLayananSrc(layananImage);
              setQrCodeSrc(qrCode);
              setBgColor('#EFFFFA'); // Kembalikan warna awal
            }}
          onClick={() => openPopup(flowchart, "Lihat flowchart booking online")}>

            <div className="bottom-image">
              <img src={layananSrc} alt="Layanan" className="layanan" />
              <img src={qrCodeSrc} alt="QR Code" className="qr-img" />
            </div>
            <div className="top-text">
              <p>Lihat flowchart booking online</p>
            </div>
          </div>

          {/* Popup */}
          <Popup isOpen={popupOpen} onClose={closePopup} imageSrc={selectedPopup.image} title={selectedPopup.title} />

        </div>
      </div>
    </section>
  );
}

export default Hp3;
