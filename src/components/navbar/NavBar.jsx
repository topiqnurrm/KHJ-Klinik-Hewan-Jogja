import React, { useState, useEffect, useRef } from "react";
import logo from "./image/logo.png";
import ada0 from "./shop/0ada.png";
import ada1 from "./shop/1ada.png";
import kosong0 from "./shop/0kosong.png";
import kosong1 from "./shop/1kosong.png";
import userImg from "./image/user.png";
import loginImg from "./image/login.png";
import "./NavBar.css";
import ProfilePopup from "../userprofile/userprofile";
import { getUserById } from "../../api/api-user";
import { Link } from "react-router-dom";
import RiwayatPopup from "../riwayat/riwayatklien";

import { checkUnfinishedBookingByUserId } from "../../api/api-booking";

const NavBar = ({ userId, identity, refetchBooking, refreshTrigger }) => {
    const [hasUnfinishedBooking, setHasUnfinishedBooking] = useState(false);
    const [activeSection, setActiveSection] = useState("hp1");
    const [showProfile, setShowProfile] = useState(false);
    const profileButtonRef = useRef(null);
    const [userData, setUserData] = useState(null);
    const [showRiwayat, setShowRiwayat] = useState(false);
    
    // Add a local state to track refetch triggers
    const [refetchTrigger, setRefetchTrigger] = useState(false);

    // Ambil data user
    useEffect(() => {
        if (identity) {
            getUserById(identity)
                .then((res) => {
                    if (res) setUserData(res);
                    else console.warn("User data is null");
                });
        }
    }, [identity]);

    // refresh notif otomatis
    // NavBar.jsx
    useEffect(() => {
        const cekUnfinishedBooking = async () => {
        if (identity) {
            try {
            const adaBookingBelumSelesai = await checkUnfinishedBookingByUserId(identity);
            setHasUnfinishedBooking(adaBookingBelumSelesai);
            } catch (err) {
            console.error("Gagal cek unfinished booking:", err);
            setHasUnfinishedBooking(false);
            }
        }
        };
        cekUnfinishedBooking();
    }, [identity, refetchTrigger, refreshTrigger]); // Add refreshTrigger from props here
    
    // Function to handle refresh from child component
    const handleBookingDeleted = () => {
        // Toggle local state
        setRefetchTrigger(prev => !prev);
        
        // Call parent's refetchBooking function if it exists
        if (typeof refetchBooking === 'function') {
            refetchBooking();
        }
    };

    // Scroll & highlight section
    const scrollToSection = (id) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        const sections = document.querySelectorAll("section");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5 }
        );

        sections.forEach((section) => observer.observe(section));
        return () => sections.forEach((section) => observer.unobserve(section));
    }, []);

    const handleProfileClick = () => {
        setShowProfile((prev) => !prev);
    };

    return (
        <nav className="navbar">
            {/* Logo */}
            <img
                src={logo}
                alt="Logo"
                className="logo"
                onClick={() => scrollToSection("hp1")}
            />

            {/* Menu Navigasi */}
            <ul className="ulknav">
                <li onClick={() => scrollToSection("hp1")} className={`linav ${activeSection === "hp1" ? "active" : ""}`}>Beranda</li>
                <li onClick={() => scrollToSection("hp2")} className={`linav ${activeSection === "hp2" ? "active" : ""}`}>Layanan</li>
                <li onClick={() => scrollToSection("hp3")} className={`linav ${activeSection === "hp3" ? "active" : ""}`}>Panduan</li>
                <li onClick={() => scrollToSection("hp4")} className={`linav ${activeSection === "hp4" ? "active" : ""}`}>Booking Online</li>
                <li onClick={() => scrollToSection("hp5")} className={`linav ${activeSection === "hp5" ? "active" : ""}`}>Kontak</li>
            </ul>

            {/* Ikon Notifikasi */}
            {identity && (
                <>
                    <div className="message-icon">
                        <img
                            src={hasUnfinishedBooking ? ada0 : kosong0}
                            alt="Message Icon"
                            className="message-img"
                            onMouseEnter={(e) => (e.target.src = hasUnfinishedBooking ? ada1 : kosong1)}
                            onMouseLeave={(e) => (e.target.src = hasUnfinishedBooking ? ada0 : kosong0)}
                            onClick={() => setShowRiwayat(true)}
                        />
                    </div>
                    <RiwayatPopup 
                        isOpen={showRiwayat} 
                        onClose={() => setShowRiwayat(false)} 
                        onBookingDeleted={handleBookingDeleted}
                    />
                </>
            )}

            {/* Profil atau Login */}
            {identity ? (
                <>
                    <a
                        href="#profil"
                        className="user-profile"
                        style={{ textDecoration: "none" }}
                        ref={profileButtonRef}
                        onClick={(e) => {
                            e.preventDefault();
                            handleProfileClick();
                        }}
                    >
                        <span className="user-id">{userId || ""}</span>
                        <img
                            src={userData && userData.gambar ? `http://localhost:5000${userData.gambar}` : userImg}
                            alt="User"
                            className="user-img"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = userImg;
                            }}
                        />
                    </a>

                    <ProfilePopup
                        isVisible={showProfile}
                        onClose={() => setShowProfile(false)}
                        triggerRef={profileButtonRef}
                        identity={identity}
                    />
                </>
            ) : (
                <Link
                    to="/"
                    className={`user-profile login-wrapper ${!identity ? "not-logged-in" : ""}`}
                    style={{ textDecoration: "none" }}
                >
                    <div className="login-content">
                        <span className="user-id">Login</span>
                        <img src={loginImg} alt="Login" className="login-img" />
                    </div>
                </Link>
            )}
        </nav>
    );
};

export default NavBar;