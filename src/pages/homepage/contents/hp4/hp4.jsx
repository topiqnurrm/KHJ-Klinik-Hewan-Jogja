import { useState } from "react";
import "./hp4.css";

import Halaman1 from "./pages/hal1/Halaman1";
import Halaman2 from "./pages/hal2/Halaman2";
import Halaman3 from "./pages/hal3/Halaman3";
import Halaman4 from "./pages/hal4/Halaman4";

import kiri from "./gambar/kiri.png";
import kiriHover from "./gambar/kiri_hover.png";
import kanan from "./gambar/kanan.png";
import kananHover from "./gambar/kanan_hover.png";

import { Link } from "react-router-dom";

function Hp4({ identity, onBookingSaved }) {
  const tabs = ["data-user", "data-pasien", "pelayanan", "konfirmasi"];
  const [activeTab, setActiveTab] = useState("pelayanan");
  const [leftHover, setLeftHover] = useState(false);
  const [rightHover, setRightHover] = useState(false);

  const handleLeftClick = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleRightClick = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const [refetchToggle, setRefetchToggle] = useState(false);

  const handleRefetchBooking = () => {
    setRefetchToggle(prev => !prev); // toggle untuk memicu useEffect di NavBar
  };

  // 🔒 Jika belum login, tampilkan hanya pesan login
  if (!identity) {
    return (
      <section id="hp4" className="hp4 login-required">
        <div className="content-wrapper">
          <div className="header">
            <h1>Booking Online</h1>
          </div>
          <div className="login-message">
            <p>Untuk melakukan booking online, harap login terlebih dahulu.</p>
            <Link to="/" className="login-btn">Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // ✅ Jika sudah login, tampilkan isi booking
  return (
    <section id="hp4" className="hp4">
      <div className="content-wrapper">
        <div className="header">
          <h1>Booking Online</h1>
        </div>

        <nav className="top-bar">
          <button className={`tab ${activeTab === "data-user" ? "active" : ""}`} onClick={() => setActiveTab("data-user")}>
            1. Data Klien
          </button>
          <button className={`tab ${activeTab === "data-pasien" ? "active" : ""}`} onClick={() => setActiveTab("data-pasien")}>
            2. Data Pasien
          </button>
          <button className={`tab ${activeTab === "pelayanan" ? "active" : ""}`} onClick={() => setActiveTab("pelayanan")}>
            3. Pelayanan
          </button>
          <button className={`tab ${activeTab === "konfirmasi" ? "active" : ""}`} onClick={() => setActiveTab("konfirmasi")}>
            4. Konfirmasi
          </button>
        </nav>

        <div className="bottom-container">
          <div className="content-box">
            {activeTab === "data-user" && <Halaman1 />}
            {activeTab === "data-pasien" && <Halaman2 />}
            {activeTab === "pelayanan" && (
              <Halaman3
                onNext={() => setActiveTab("konfirmasi")}
                onBookingSaved={onBookingSaved}
              />
            )}
            {activeTab === "konfirmasi" && (
              <Halaman4 
                onPre={() => setActiveTab("pelayanan")} 
                onBookingSaved={onBookingSaved} 
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hp4;
