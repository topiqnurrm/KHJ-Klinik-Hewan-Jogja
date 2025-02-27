import React from "react";
import "./popup.css"; // Import CSS untuk styling

function Popup({ isOpen, onClose, imageSrc, title }) {
  if (!isOpen) return null; // Jangan tampilkan jika tidak aktif

return (
    <div className="popup-overlay" onClick={onClose}>
        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-container">
                <button className="popup-close" onClick={onClose}>
                    ✖
                </button>
                <h2>{title}</h2>
            </div>
            <div className="popup-image">
                <img src={imageSrc} alt={title} />
            </div>
        </div>
    </div>
);
}

export default Popup;
