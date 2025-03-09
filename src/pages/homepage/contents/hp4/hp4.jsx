import { useState } from "react";
import "./hp4.css";

import Halaman1 from "./pages/hal1/Halaman1";
import Halaman2 from "./pages//hal2/Halaman2";
import Halaman3 from "./pages//hal3/Halaman3";
import Halaman4 from "./pages/hal4/Halaman4";

import kiri from "./gambar/kiri.png";
import kiriHover from "./gambar/kiri_hover.png";
import kanan from "./gambar/kanan.png";
import kananHover from "./gambar/kanan_hover.png";

function Hp4() {
  const tabs = ["data-user", "data-pasien", "pelayanan", "konfirmasi"];
  const [activeTab, setActiveTab] = useState("data-user");
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

  return (
    <section id="hp4" className="hp4">
      <div className="content-wrapper">
        <div className="header">
          <h1>Daftar Booking</h1>
        </div>
        <nav className="top-bar">
          <button className={`tab ${activeTab === "data-user" ? "active" : ""}`} onClick={() => setActiveTab("data-user")}>
            Data User
          </button>
          <span>+</span>
          <button className={`tab ${activeTab === "data-pasien" ? "active" : ""}`} onClick={() => setActiveTab("data-pasien")}>
            Data Pasien
          </button>
          <span>=</span>
          <button className={`tab ${activeTab === "pelayanan" ? "active" : ""}`} onClick={() => setActiveTab("pelayanan")}>
            Pelayanan
          </button>
          <span>→</span>
          <button className={`tab ${activeTab === "konfirmasi" ? "active" : ""}`} onClick={() => setActiveTab("konfirmasi")}>
            Konfirmasi
          </button>
        </nav>

        <div className="bottom-container">
          <button
            className="nav-button_kiri"
            onClick={handleLeftClick}
            disabled={activeTab === "data-user"}
            onMouseEnter={() => setLeftHover(true)}
            onMouseLeave={() => setLeftHover(false)}
          >
            <img src={leftHover ? kiriHover : kiri} alt="Kiri" />
          </button>
          <div className="content-box">
            {activeTab === "data-user" && <Halaman1 />}
            {activeTab === "data-pasien" && <Halaman2 />}
            {activeTab === "pelayanan" && <Halaman3 />}
            {activeTab === "konfirmasi" && <Halaman4 />}
          </div>
          <button
            className="nav-button_kanan"
            onClick={handleRightClick}
            disabled={activeTab === "konfirmasi"}
            onMouseEnter={() => setRightHover(true)}
            onMouseLeave={() => setRightHover(false)}
          >
            <img src={rightHover ? kananHover : kanan} alt="Kanan" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hp4;