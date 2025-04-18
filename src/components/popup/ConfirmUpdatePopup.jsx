import React from "react";
import ReactDOM from "react-dom";
import "./popup2.css";

function ConfirmUpdatePopup({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="popup-overlay2">
            <div className="popup-content popup-confirm" onClick={(e) => e.stopPropagation()}>
                <h2>Konfirmasi Perubahan</h2>
                <div className="popup-description">
                    Apakah Anda yakin ingin mengupdate data Anda?
                    <br />
                    Jika Anda mengubah <strong>email</strong> atau <strong>password</strong>, maka konfirmasi ulang akan dikirimkan ke email Anda.
                </div>
                <div className="popup-buttons">
                    <button className="popup-button cancel" onClick={onClose}>Tidak</button>
                    <button className="popup-button confirm" onClick={onConfirm}>Ya</button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ConfirmUpdatePopup;
