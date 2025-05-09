import { useState, useEffect } from "react";
import React from "react";
import "./hp1.css";
import dokter from "./gambar/dokter.png";
import periksa from "./gambar/daftar.png";
import prks from "./gambar/dfrhitam.png";
import aktif from "./gambar/aktif.png";
import nonaktif from "./gambar/nonaktif.png";
import islam from "./gambar/22.png";
import konghucu from "./gambar/11.png";

function Hp1() {
  const slides = [dokter, konghucu, islam]; // Daftar gambar slide
  const [activeIndex, setActiveIndex] = useState(0); // Indeks aktif
  const [isHovered, setIsHovered] = useState(false); // Untuk efek hover tombol

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 10000); // Pindah slide setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  const handleSwipe = (direction) => {
    if (direction === "left") {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    } else {
      setActiveIndex((prevIndex) =>
        prevIndex === 0 ? slides.length - 1 : prevIndex - 1
      );
    }
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hp1"
      className="hp1"
      onTouchStart={(e) =>
        handleSwipe(e.touches[0].clientX < window.innerWidth / 2 ? "left" : "right")
      }
    >
      <div className="container">
        {activeIndex === 0 && ( // Tampilkan teks hanya di slide pertama
          <div className="left-section">
            <h1>Layanan Klinik Hewan <br />Kota Yogyakarta</h1>
            <p>
              Layanan terpadu dari Pemerintah Kota <br />
              Yogyakarta untuk kebutuhan klinik hewan. <br />
              Mudah diakses untuk pemeriksaan, vaksinasi, <br />
              dan layanan kesehatan hewan lainnya.
            </p>
            <p className="noted">Booking Onsite dan House Call.</p>
            <a
              href="#"
              className="cta-button"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => scrollToSection("hp4")}
            >
              <img
                src={isHovered ? prks : periksa}
                alt="Ikon"
                className="icon"
              />
              Booking Online
            </a>
          </div>
        )}

        <div className="right-section">
          <img src={slides[activeIndex]} alt="Slide" className="animated-image" />
        </div>
      </div>

      <div className="image-slider">
        {slides.map((_, index) => (
          <img
            key={index}
            src={activeIndex === index ? aktif : nonaktif}
            alt={`Slide ${index}`}
            className={`slider-dot ${activeIndex === index ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default Hp1;
