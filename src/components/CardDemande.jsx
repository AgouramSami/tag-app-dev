import React from "react";
import PropTypes from "prop-types";
import "../styles/CardDemande.css";

const CardDemande = ({ numero, date, objet, theme, statut, onConsulter }) => {
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

      <button onClick={onConsulter} className="btn-consulter">
        Consulter le détail
      </button>
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
};

export default CardDemande;
