import React, { useEffect, useRef, useState } from "react";
import "./userprofile.css";
import Default from "./gambar/default.png";
import Edit from "./gambar/edit.png";
import Keluar from "./gambar/keluar.png";
import { getUserById } from "../../api/user";
import { useNavigate } from "react-router-dom";
import Popup2 from "../../components/popup/popup2";
import Popup3 from "../../components/popup/popup3";

function UserProfile({ isVisible, onClose, triggerRef, identity }) {
    const popupRef = useRef(null);
    const [userData, setUserData] = useState(null);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false); // ⬅️ Pindahkan ke sini
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUser() {
            if (identity) {
                const result = await getUserById(identity);
                setUserData(result);
            }
        }
        fetchUser();
    }, [identity]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (showEditPopup) return; // ⬅️ Tambahkan ini: jangan tutup saat Edit popup terbuka
    
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)
            ) {
                onClose();
            }
        }
    
        if (isVisible && !showLogoutPopup) {
            document.addEventListener("mousedown", handleClickOutside);
        }
    
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isVisible, onClose, triggerRef, showLogoutPopup, showEditPopup]); // ⬅️ Tambahkan showEditPopup ke dependency    

    const handleLogout = () => {
        setShowLogoutPopup(true);
    };

    const handleConfirmLogout = () => {
        localStorage.removeItem("user");
        setShowLogoutPopup(false);
        onClose();
        navigate("/homepage");
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const handleCancelLogout = () => {
        setShowLogoutPopup(false);
    };

    const handleEdit = () => {
        setShowEditPopup(true);
    };

    const handleCloseEdit = () => {
        setShowEditPopup(false);
    };

    if (!isVisible || !userData) return null; // ⬅️ Ini aman sekarang

    return (
        <>
            <div className="profile-popup" ref={popupRef}>
                <div className="profile-card">
                    <div className="profile-header">
                        <img
                            src={userData.gambar ? `http://localhost:5000/${userData.gambar}` : Default}
                            alt="User"
                            className="profile-photo"
                        />
                        <div className="profile-text">
                            <h4>{userData.nama}</h4>
                            <p>{userData.aktor}</p>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="btn-edit" onClick={handleEdit}>
                            <img className="icon" src={Edit} alt="Edit Icon" /> Edit
                        </button>
                        <button className="btn-logout" onClick={handleLogout}>
                            <img className="icon" src={Keluar} alt="Logout Icon" /> Keluar
                        </button>
                    </div>
                </div>
            </div>

            {showLogoutPopup && (
                <Popup2
                    isOpen={showLogoutPopup}
                    onClose={handleCancelLogout}
                    title="Konfirmasi Logout"
                    description="Apakah Anda yakin ingin logout?"
                    onConfirm={handleConfirmLogout}
                />
            )}

            {showEditPopup && (
                <Popup3
                    isOpen={showEditPopup}
                    onClose={handleCloseEdit}
                    userData={userData}
                />
            )}
        </>
    );
}

export default UserProfile;
