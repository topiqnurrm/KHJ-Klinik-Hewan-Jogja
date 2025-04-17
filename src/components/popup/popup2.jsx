import React from "react";
import ReactDOM from "react-dom";
import "./popup2.css";

function Popup({ isOpen, onClose, title, description, onConfirm }) {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="popup-overlay2">
            <div className="popup-content popup-confirm">
                <h2>{title}</h2>
                <div className="popup-description">{description}</div>
                <div className="popup-buttons">
                    <button className="popup-button cancel" onClick={onClose}>Tidak</button>
                    <button className="popup-button confirm" onClick={onConfirm}>Ya</button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default Popup;
