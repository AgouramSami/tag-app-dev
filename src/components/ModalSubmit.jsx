import React from "react";
import "../styles/ModalSubmit.css";

const ModalSubmit = ({ isOpen, onClose, message, type }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-submit-overlay">
      <div className="modal-submit-content">
        <div className={`modal-submit-icon ${type}`}>
          {type === "success" ? "✓" : "✕"}
        </div>
        <p className="modal-submit-message">{message}</p>
        <button className="modal-submit-button" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
};

export default ModalSubmit;
