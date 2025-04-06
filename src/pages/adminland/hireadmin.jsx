import React, { useState } from 'react';
import NavBar from './admin_nav/NavBar.jsx';
import NavLeft from './navleft/navleft.jsx';

import Dashboard from './contents/dashboard/dashboard.jsx';
import Pengguna from './contents/pengguna/pengguna.jsx';
import Obat from './contents/obat/obat.jsx';
import Tindakan from './contents/tindakan/tindakan.jsx';
import Kunjungan from './contents/kunjungan/kunjungan.jsx';
import Kasir from './contents/kasir/kasir.jsx';
import Laporan from './contents/laporan/laporan.jsx';
import Pasien from './contents/pasien/pasien.jsx';
import Booking from './contents/booking/booking.jsx';
import Farmasi from './contents/farmasi/farmasi.jsx';

import "./hireadmin.css";

const HomePage = () => {
    const [activeMenu, setActiveMenu] = useState("Dashboard"); // State untuk menyimpan menu aktif

    // Fungsi untuk menampilkan konten berdasarkan activeMenu
    const renderContent = () => {
        switch (activeMenu) {
            case "Pasien":
                return <Pasien />;
            case "Booking":
                return <Booking />;
            case "Dashboard":
                return <Dashboard />;
            case "Pengguna":
                return <Pengguna />;
            case "Obat":
                return <Obat />;
            case "Tindakan":
                return <Tindakan />;
            case "Kunjungan":
                return <Kunjungan />;
            case "Kasir":
                return <Kasir />;
            case "Laporan":
                return <Laporan />;
            case "Farmasi":
                return <Farmasi />;
            default:
                return <Dashboard />; // Default ke Dashboard jika tidak ada yang cocok
        }
    };

    return (
        <div className="hireadmin">
            <NavBar />
            <div className='admin'>
                <NavLeft activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                
                {/* Gunakan renderContent untuk menampilkan komponen sesuai activeMenu */}
                <div className="isi">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
