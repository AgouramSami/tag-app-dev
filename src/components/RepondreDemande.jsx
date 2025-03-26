import React, { useState } from "react";
import PropTypes from "prop-types";
import "../styles/RepondreDemande.css";

const RepondreDemande = ({ demande, onSubmit, onCancel }) => {
  const [reponse, setReponse] = useState("");
  const [pieceJointe, setPieceJointe] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ reponse, pieceJointe });
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Répondre à la demande</h1>

      <div className="object-demande">
        <strong>Demande N° {demande.numero}</strong> - {demande.date}
        <p>{demande.objet}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Votre réponse</label>
          <textarea
            className="form-textarea"
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            placeholder="Rédigez votre réponse ici..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Pièce jointe (optionnel)</label>
          <div className="file-upload">
            <input
              type="file"
              onChange={(e) => setPieceJointe(e.target.files[0])}
              className="file-input"
              id="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              {pieceJointe ? pieceJointe.name : "Choisir un fichier"}
            </label>
            <div className="file-button">
              <i className="fas fa-paperclip"></i>
            </div>
          </div>
          <p className="file-info">
            Formats acceptés : PDF, DOC, DOCX - Max 10 Mo
          </p>
        </div>

        <div className="button-container">
          <button type="submit" className="submit-btn">
            Envoyer la réponse
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

RepondreDemande.propTypes = {
  demande: PropTypes.shape({
    numero: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    objet: PropTypes.string.isRequired,
    theme: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RepondreDemande;
