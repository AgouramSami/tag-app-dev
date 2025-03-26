import React, { useState } from "react";
import PropTypes from "prop-types";
import "../styles/CloturerDemande.css";

const CloturerDemande = ({ demande, onSubmit, onCancel }) => {
  const [note, setNote] = useState(0);
  const [hoveredNote, setHoveredNote] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (note === 0) {
      alert("Veuillez attribuer une note avant de clôturer la demande");
      return;
    }
    onSubmit({ note });
  };

  return (
    <div className="cloturer-demande-container">
      <h1 className="form-title">Clôturer la demande</h1>

      <div className="object-demande">
        <strong>Demande N° {demande.numero}</strong> - {demande.date}
        <p>{demande.objet}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Votre satisfaction</label>
          <div className="rating-container">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fas fa-star ${
                    star <= (hoveredNote || note) ? "active" : ""
                  }`}
                  onClick={() => setNote(star)}
                  onMouseEnter={() => setHoveredNote(star)}
                  onMouseLeave={() => setHoveredNote(0)}
                />
              ))}
            </div>
            <p className="rating-info">
              {note === 0
                ? "Sélectionnez une note"
                : note === 1
                ? "Très insatisfait"
                : note === 2
                ? "Insatisfait"
                : note === 3
                ? "Neutre"
                : note === 4
                ? "Satisfait"
                : "Très satisfait"}
            </p>
          </div>
        </div>

        <div className="button-container">
          <button type="submit" className="submit-btn">
            Clôturer la demande
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

CloturerDemande.propTypes = {
  demande: PropTypes.shape({
    numero: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    objet: PropTypes.string.isRequired,
    commune: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default CloturerDemande;
