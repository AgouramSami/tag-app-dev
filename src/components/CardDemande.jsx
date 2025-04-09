import React, { useState } from "react";
import PropTypes from "prop-types";
import "../styles/CardDemande.css";

const CardDemande = ({
  numero,
  date,
  objet,
  theme,
  statut,
  onConsulter,
  onDelete,
  id,
  isJuriste,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(id);
    setShowDeleteModal(false);
  };

  return (
    <div className="card-demande">
      <div className="demande-info">
        <span>Demande N° {numero}</span>
        <span className="date">Date: {date}</span>
      </div>

      <div className="card-demande-content">
        <div className="info-group">
          <label>Objet de la demande:</label>
          <p>{objet}</p>
        </div>

        <div className="info-group">
          <label>Statut de la demande:</label>
          <p className="statut-badge">{statut}</p>
        </div>
      </div>

      <div className="card-demande-actions">
        <button onClick={onConsulter} className="btn-consulter">
          Consulter le détail
        </button>
        {!isJuriste && (
          <button onClick={handleDelete} className="btn-delete">
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>

      {showDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer cette demande ?</p>
            <div className="delete-modal-buttons">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-cancel"
              >
                Annuler
              </button>
              <button onClick={confirmDelete} className="btn-confirm">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CardDemande.propTypes = {
  numero: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  objet: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  statut: PropTypes.string.isRequired,
  onConsulter: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  isJuriste: PropTypes.bool,
};

CardDemande.defaultProps = {
  isJuriste: false,
};

export default CardDemande;
