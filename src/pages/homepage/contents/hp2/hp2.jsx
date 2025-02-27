import { useState } from "react";
import "./hp2.css"; 
import g11 from "./gambar/g11.png";
import g22 from "./gambar/g22.png";
import g33 from "./gambar/g33.png";
import umum from "./gambar/umum.png";
import khusus from "./gambar/khusus.png";
import lain from "./gambar/lain.png";
import Popup from "../../../../components/popup/popup.jsx";
import pop1 from "./gambar/pop1.png";
import pop2 from "./gambar/pop2.png";
import pop3 from "./gambar/pop3.png";

function Hp2() {

  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState({ image: "", title: "" });

  const openPopup = (image, title) => {
    setSelectedPopup({ image, title });
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  const [selectedImage, setSelectedImage] = useState("image1");

  const images = {
    image1: umum,
    image2: khusus,
    image3: lain,
  };

  return (
    <section id="hp2" className="hp2">
      {/* Judul dan Penjelasan */}
      <header className="header">
          <h1>Layanan Kami</h1>
          <p>
            Poliklinik Hewan Kota Yogyakarta menjalankan <span className="ini">SOP Pelayanan</span> Kesehatan Hewan sesuai <br />
            Keputusan Kepala Dinas Pertanian dan Pangan Kota Yogyakarta Tahun 2023
          </p>
        </header>
      <div className="content-wrapper">
        {/* Bagian Kiri: Tombol Menu */}
        <div className="left-menu">
          <button className="menu-button" onClick={() => openPopup(pop2, "SOP Prosedur Pelayanan Grooming")}>
            <img src={g11} alt="Grooming" />
            SOP Prosedur <br /> Pelayanan Grooming
          </button>
          <button className="menu-button" onClick={() => openPopup(pop1, "SOP Prosedur Pelayanan Kesehatan di Poliklinik")}>
            <img src={g22} alt="Poliklinik" />
            SOP Prosedur Pelayanan <br /> Kesehatan di Poliklinik
          </button>
          <button className="menu-button" onClick={() => openPopup(pop3, "SOP Prosedur Pelayanan Kesehatan di Lapangan")}>
            <img src={g33} alt="Lapangan" />
            SOP Prosedur Pelayanan <br /> Kesehatan di Lapangan
          </button>
        </div>

        {/* Popup */}
        <Popup isOpen={popupOpen} onClose={closePopup} imageSrc={selectedPopup.image} title={selectedPopup.title} />

        <div className="middle">

        </div>

        {/* Bagian Kanan: Gambar dan Tombol Pilihan */}
        <div className="right-content">
          <div className="image-buttons">
            <button 
              className={selectedImage === "image1" ? "active" : ""}
              onClick={() => setSelectedImage("image1")}
            >
              Tindakan Umum
            </button>
            <button 
              className={selectedImage === "image2" ? "active" : ""}
              onClick={() => setSelectedImage("image2")}
            >
              Tindakan Khusus
            </button>
            <button 
              className={selectedImage === "image3" ? "active" : ""}
              onClick={() => setSelectedImage("image3")}
            >
              Lain - Lain
            </button>
          </div>
          <div className="image-container">
            <img src={images[selectedImage]} alt="Tampilan" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hp2;