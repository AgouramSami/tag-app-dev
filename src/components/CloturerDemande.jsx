import React, { useState } from "react";
import PropTypes from "prop-types";
import "../styles/CloturerDemande.css";

const CloturerDemande = ({ demande, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Veuillez donner une note avant de clôturer la demande");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ note: rating, commentaire });
    } catch (error) {
      console.error("Erreur lors de la clôture:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNoteDescription = (rating) => {
    switch (rating) {
      case 0:
        return "Sélectionnez une note";
      case 1:
        return "Très insatisfait - Le service n'a pas répondu à mes attentes";
      case 2:
        return "Insatisfait - Le service pourrait être grandement amélioré";
      case 3:
        return "Neutre - Le service était correct mais pourrait être amélioré";
      case 4:
        return "Satisfait - Bon service, a répondu à mes attentes";
      case 5:
        return "Très satisfait - Excellent service, au-delà de mes attentes";
      default:
        return "";
    }
  };

  return (
    <div className="cloturer-demande-container">
      <h1 className="form-title">Clôturer la demande</h1>

      <div className="object-demande">
        <strong>Demande N° {demande._id.slice(-5)}</strong> -{" "}
        {new Date(demande.dateCreation).toLocaleDateString()}
        <p>{demande.objet}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Évaluez votre satisfaction concernant le traitement de votre demande
          </label>
          <div className="rating-container">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fas fa-star ${
                    star <= (hoveredStar || rating) ? "active" : ""
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  style={{
                    transform:
                      star <= (hoveredStar || rating)
                        ? "scale(1.2)"
                        : "scale(1)",
                  }}
                />
              ))}
            </div>
            <p className="rating-info">
              {getNoteDescription(hoveredStar || rating)}
            </p>
          </div>
        </div>

        <div className="commentaire-container">
          <label htmlFor="commentaire">Commentaire (optionnel) :</label>
          <textarea
            id="commentaire"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Laissez un commentaire sur la qualité de la réponse..."
            rows={4}
          />
        </div>

        <div className="button-container">
          <button
            type="submit"
            className="submit-btn"
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Clôture en cours...
              </>
            ) : (
              "Clôturer la demande"
            )}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

CloturerDemande.propTypes = {
  demande: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    objet: PropTypes.string.isRequired,
    dateCreation: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default CloturerDemande;
