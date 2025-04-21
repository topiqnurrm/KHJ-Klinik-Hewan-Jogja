import React from "react";
import ReactDOM from "react-dom";
import "./popupriwayat.css";

function Popup({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="popupriwayat" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>{title}</h2>
          <button className="popup-close" onClick={onClose}>
            ✖
          </button>
        </div>
        <div className="popup-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Popup;
