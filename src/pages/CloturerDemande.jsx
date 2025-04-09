import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/CloturerDemande.css";

const CloturerDemande = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [note, setNote] = useState(0);

  useEffect(() => {
    const fetchDemande = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/demandes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de la demande");
        }

        const data = await response.json();
        setDemande(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDemande();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/demandes/${id}/cloturer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            commentaire,
            note,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la clôture de la demande");
      }

      navigate("/mes-demandes");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!demande) {
    return <div className="error">Demande non trouvée</div>;
  }

  return (
    <div className="cloturer-demande-container">
      <div className="demande-header">
        <h1>Clôturer la demande</h1>
        <button onClick={() => navigate(-1)} className="back-button">
          Retour
        </button>
      </div>

      <div className="demande-info">
        <h2>Informations de la demande</h2>
        <p>
          <strong>ID :</strong> {demande._id}
        </p>
        <p>
          <strong>Date de création :</strong>{" "}
          {new Date(demande.dateCreation).toLocaleDateString()}
        </p>
        <p>
          <strong>Contenu :</strong> {demande.contenu}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="cloture-form">
        <div className="form-group">
          <label htmlFor="note">Note de satisfaction (1-5)</label>
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`rating-button ${note === value ? "selected" : ""}`}
                onClick={() => setNote(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="commentaire">Commentaire</label>
          <textarea
            id="commentaire"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Ajoutez un commentaire sur votre expérience..."
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Clôturer la demande
          </button>
        </div>
      </form>
    </div>
  );
};

export default CloturerDemande;
