import React, { useState } from "react";
import "./NavLeft.css";
import dashboardIcon from "./gambar/dashboard.png";
import databaseIcon from "./gambar/database.png";
import transaksiIcon from "./gambar/transaksi.png";
import laporanIcon from "./gambar/laporan.png";
import penggunaIcon from "./gambar/pengguna.png";
import obatIcon from "./gambar/obat.png";
import tindakanIcon from "./gambar/tindakan.png";
import kunjunganIcon from "./gambar/kunjungan.png";
import kasirIcon from "./gambar/kasir.png";
import pasienIcon from "./gambar/pasien.png";
import bookingIcon from "./gambar/booking.png";

const NavLeft = ({ activeMenu, setActiveMenu }) => {
    const [openDatabase, setOpenDatabase] = useState(false);
    const [openTransaksi, setOpenTransaksi] = useState(false);

    const isDatabaseActive = ["Pengguna", "Pasien", "Obat", "Tindakan"].includes(activeMenu);
    const isTransaksiActive = ["Booking", "Kunjungan", "Kasir"].includes(activeMenu);

    const handleMenuClick = (menu) => {
        if (menu === "Database") {
            setOpenDatabase(!openDatabase);
        } else if (menu === "Transaksi Klinik") {
            setOpenTransaksi(!openTransaksi);
        }
    };

    const handleSubmenuClick = (submenu) => {
        setActiveMenu(submenu); // Kirim data ke Parent
    };

    return (
        <nav className="nav-left">
            <h2 className="nav-title">Navigasi</h2>

            <ul className="nav-list">
                <li className={`nav-item ${activeMenu === "Dashboard" ? "active" : ""}`}
                    onClick={() => handleSubmenuClick("Dashboard")}>
                    <img src={dashboardIcon} alt="Dashboard" className="icon" />
                    <span>Dashboard</span>
                </li>

                <li className={`nav-item ${isDatabaseActive ? "active" : ""}`} 
                    onClick={() => handleMenuClick("Database")}>
                    <img src={databaseIcon} alt="Database" className="icon" />
                    <span>Database</span>
                </li>
                {openDatabase && (
                    <ul className="dropdown">
                        <li className={`dropdown-item ${activeMenu === "Pengguna" ? "submenu-active" : ""}`} 
                            onClick={() => handleSubmenuClick("Pengguna")}>
                            <img src={penggunaIcon} alt="Pengguna" className="icon" /> Pengguna
                        </li>
                        <li className={`dropdown-item ${activeMenu === "Pasien" ? "submenu-active" : ""}`} 
                            onClick={() => handleSubmenuClick("Pasien")}>
                            <img src={pasienIcon} alt="Pasien" className="icon" /> Pasien
                        </li>
                        <li className={`dropdown-item ${activeMenu === "Obat" ? "submenu-active" : ""}`} 
                            onClick={() => handleSubmenuClick("Obat")}>
                            <img src={obatIcon} alt="Obat" className="icon" /> Obat
                        </li>
                        <li className={`dropdown-item ${activeMenu === "Tindakan" ? "submenu-active" : ""}`} 
                            onClick={() => handleSubmenuClick("Tindakan")}>
                            <img src={tindakanIcon} alt="Tindakan" className="icon" /> Tindakan
                        </li>
                    </ul>
                )}

                <li className={`nav-item ${isTransaksiActive ? "active" : ""}`} 
                    onClick={() => handleMenuClick("Transaksi Klinik")}>
                    <img src={transaksiIcon} alt="Transaksi Klinik" className="icon" />
                    <span>Transaksi Klinik</span>
                </li>
                {openTransaksi && (
                    <ul className="dropdown">
                        <li className={`dropdown-item ${activeMenu === "Booking" ? "submenu-active" : ""}`} 
                            onClick={() => handleSubmenuClick("Booking")}>
                            <img src={bookingIcon} alt="Booking" className="icon" /> Booking
                        </li>
                        <li className={`dropdown-item ${activeMenu === "Kunjungan" ? "submenu-active" : ""}`} 
                            onClick={() => handleSubmenuClick("Kunjungan")}>
                            <img src={kunjunganIcon} alt="Kunjungan" className="icon" /> Kunjungan
                        </li>
                        <li className={`dropdown-item ${activeMenu === "Kasir" ? "submenu-active" : ""}`} 
                            onClick={() => handleSubmenuClick("Kasir")}>
                            <img src={kasirIcon} alt="Kasir" className="icon" /> Kasir
                        </li>
                    </ul>
                )}

                <li className={`nav-item ${activeMenu === "Laporan" ? "active" : ""}`} 
                    onClick={() => handleSubmenuClick("Laporan")}>
                    <img src={laporanIcon} alt="Laporan" className="icon" />
                    <span>Laporan</span>
                </li>
            </ul>
        </nav>
    );
};

export default NavLeft;
