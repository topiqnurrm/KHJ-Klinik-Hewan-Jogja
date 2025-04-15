import React, { useEffect, useRef, useState } from "react";
import "./userprofile.css";
import Default from "./gambar/default.png";
import Edit from "./gambar/edit.png";
import Keluar from "./gambar/keluar.png";
import { getUserById } from "../../api/user"; // pastikan path sesuai

function UserProfile({ isVisible, onClose, triggerRef, identity }) {
    const popupRef = useRef(null);
    const [userData, setUserData] = useState(null);

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
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)
            ) {
                onClose();
            }
        }

        if (isVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isVisible, onClose, triggerRef]);

    if (!isVisible || !userData) return null;

    return (
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
                    <button className="btn-edit">
                        <img className="icon" src={Edit} alt="Edit Icon" /> Edit
                    </button>
                    <button className="btn-logout">
                        <img className="icon" src={Keluar} alt="Logout Icon" /> Keluar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
