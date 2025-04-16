import React from "react";
import "./popup.css";

function Popup({ isOpen, onClose, title, description, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content popup-confirm" onClick={(e) => e.stopPropagation()}>
                <div className="popup-container">
                    <h2>{title}</h2>
                    <div className="popup-description">{description}</div>
                    <div className="popup-buttons">
                        <button className="popup-button cancel" onClick={onClose}>Tidak</button>
                        <button className="popup-button confirm" onClick={onConfirm}>Ya</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Popup;
