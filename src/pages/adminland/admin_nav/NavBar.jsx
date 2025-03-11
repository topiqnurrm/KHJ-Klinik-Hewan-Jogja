import React from "react";
import logo from "./image/logo.png";
import Logout from "./image/logout.png";
import "./NavBar.css";

const NavBar = () => {
    const userName = "taufiq nur";
    const userRole = "Administrasi";
    
    return (
        <nav className="admin_nav">
            <img
                src={logo}
                alt="Logo"
                className="logo"
            />

            {/* Ikon Pesan */}
            <div>
                <div className="message-icon">
                    <a href="#pesanan" style={{ textDecoration: "none" }}>
                       <span className="user-name">{`${userName}, (${userRole})`}</span>
                    </a>
                </div>
            </div>

            {/* Profil Pengguna */}
            <a href="#profil" className="exit" style={{ textDecoration: "none" }}>
                <span className="user-id">Log Out</span>
                <img src={Logout} alt="User" className="user-img" />
            </a>
        </nav>
    );
};

export default NavBar;
