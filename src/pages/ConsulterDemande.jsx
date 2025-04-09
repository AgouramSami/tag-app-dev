import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/ConsulterDemande.css";

const ConsulterDemande = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

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
        setMessages(data.messages || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDemande();
  }, [id]);

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/demandes/${id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content: newMessage }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }

      const data = await response.json();
      setMessages([...messages, data]);
      setNewMessage("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/demandes/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }

      const data = await response.json();
      setDemande(data);
      setShowModal(false);
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
    <div className="consulter-demande-container">
      <div className="demande-header">
        <h1>Détails de la demande</h1>
        <button onClick={() => navigate(-1)} className="back-button">
          Retour
        </button>
      </div>

      <div className="demande-info">
        <div className="info-section">
          <h2>Informations générales</h2>
          <p>
            <strong>ID :</strong> {demande._id}
          </p>
          <p>
            <strong>Statut :</strong>{" "}
            <span className={`status-${demande.statut}`}>{demande.statut}</span>
          </p>
          <p>
            <strong>Date de création :</strong>{" "}
            {new Date(demande.dateCreation).toLocaleDateString()}
          </p>
        </div>

        <div className="info-section">
          <h2>Contenu de la demande</h2>
          <p>{demande.contenu}</p>
        </div>

        {user.permissions === "juriste" && (
          <div className="actions-section">
            <h2>Actions</h2>
            <div className="action-buttons">
              <button
                onClick={() => {
                  setModalType("valider");
                  setShowModal(true);
                }}
                className="validate-button"
              >
                Valider
              </button>
              <button
                onClick={() => {
                  setModalType("refuser");
                  setShowModal(true);
                }}
                className="reject-button"
              >
                Refuser
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="messages-section">
        <h2>Messages</h2>
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`message ${
                message.expediteur === user._id ? "sent" : "received"
              }`}
            >
              <p className="message-content">{message.contenu}</p>
              <p className="message-date">
                {new Date(message.dateCreation).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmitMessage} className="message-form">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            required
          />
          <button type="submit">Envoyer</button>
        </form>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>
              {modalType === "valider"
                ? "Valider la demande"
                : "Refuser la demande"}
            </h2>
            <p>
              Êtes-vous sûr de vouloir{" "}
              {modalType === "valider" ? "valider" : "refuser"} cette demande ?
            </p>
            <div className="modal-buttons">
              <button
                onClick={() =>
                  handleStatusChange(
                    modalType === "valider" ? "validée" : "refusée"
                  )
                }
                className={`${
                  modalType === "valider" ? "validate-button" : "reject-button"
                }`}
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="cancel-button"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsulterDemande;
