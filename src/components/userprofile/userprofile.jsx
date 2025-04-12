import React, { useEffect, useRef } from "react";
import "./userprofile.css";
import Default from "./gambar/default.png";
import Edit from "./gambar/edit.png";
import Keluar from "./gambar/keluar.png";
import Taufiq from "./gambar/taufiq.png";

function UserProfile({ isVisible, onClose, triggerRef }) {
    const popupRef = useRef(null);
  
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
  
    if (!isVisible) return null;

    return (
      <div className="profile-popup" ref={popupRef}>
        <div className="profile-card">
            <div className="profile-header">
                <img src={Taufiq} alt="User" className="profile-photo" />
                <div className="profile-text">
                    <h4>Taufiq Nurrohman</h4>
                    <p>Klien</p>
                </div>
            </div>
            <div className="profile-actions">
                <button className="btn-edit">
                    <img className="icon" src={Edit} alt="Edit Icon" />Edit
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
