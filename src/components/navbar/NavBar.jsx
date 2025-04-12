import React, { useState, useEffect, useRef } from "react";
import logo from "./image/logo.png";
import ada0 from "./shop/0ada.png";
import ada1 from "./shop/1ada.png";
import kosong0 from "./shop/0kosong.png";
import kosong1 from "./shop/1kosong.png";
import userImg from "./image/user.png";
import "./NavBar.css";
import ProfilePopup from "../userprofile/userprofile";

const NavBar = () => {
    const [hasMessage, setHasMessage] = useState(true); // Status pesan
    const [activeSection, setActiveSection] = useState("hp1"); // Section aktif
    const userId = "AHDKB3746"; // ID pengguna

    // Fungsi scroll ke section
    const scrollToSection = (id) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Gunakan Intersection Observer untuk mendeteksi bagian yang terlihat
    useEffect(() => {
        const sections = document.querySelectorAll("section"); // Semua section
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5 } // 50% dari bagian harus terlihat
        );

        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    const [showProfile, setShowProfile] = useState(false);
    const profileButtonRef = useRef(null);  // Tambahin ref

    const handleProfileClick = () => {
        setShowProfile((prev) => !prev);  // TOGGLE, bukan set true saja
    };

    return (
        <nav className="navbar">
            <img
                src={logo}
                alt="Logo"
                className="logo"
                onClick={() => scrollToSection("hp1")}
            />

            {/* Menu Navigasi */}
            <ul className="ulknav">
                <li
                    onClick={() => scrollToSection("hp1")}
                    className={`linav ${activeSection === "hp1" ? "active" : ""}`}
                >
                    Beranda
                </li>
                <li
                    onClick={() => scrollToSection("hp2")}
                    className={`linav ${activeSection === "hp2" ? "active" : ""}`}
                >
                    Layanan
                </li>
                <li
                    onClick={() => scrollToSection("hp3")}
                    className={`linav ${activeSection === "hp3" ? "active" : ""}`}
                >
                    Panduan
                </li>
                <li
                    onClick={() => scrollToSection("hp4")}
                    className={`linav ${activeSection === "hp4" ? "active" : ""}`}
                >
                    Booking Online
                </li>
                <li
                    onClick={() => scrollToSection("hp5")}
                    className={`linav ${activeSection === "hp5" ? "active" : ""}`}
                >
                    Kontak
                </li>
            </ul>

            {/* Ikon Pesan */}
            <a href="#pesanan" style={{ textDecoration: "none" }}>
                <div className="message-icon">
                    <img
                        src={hasMessage ? ada0 : kosong0}
                        alt="Message Icon"
                        className="message-img"
                        onMouseEnter={(e) => (e.target.src = hasMessage ? ada1 : kosong1)}
                        onMouseLeave={(e) => (e.target.src = hasMessage ? ada0 : kosong0)}
                    />
                </div>
            </a>

            {/* Profil Pengguna */}
            <a 
                href="#profil" 
                className="user-profile" 
                style={{ textDecoration: "none" }}
                ref={profileButtonRef}
                onClick={(e) => {
                    e.preventDefault(); 
                    handleProfileClick();  // toggle show/hide
                }}
            >
                <span className="user-id">{userId}</span>
                <img src={userImg} alt="User" className="user-img" />
            </a>

            <ProfilePopup 
                isVisible={showProfile} 
                onClose={() => setShowProfile(false)} 
                triggerRef={profileButtonRef}
            />

        </nav>
    );
};

export default NavBar;
