import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import CloturerDemande from "./CloturerDemande";
import "../styles/ConsulterDemande.css";

const API_URL = "http://localhost:5000"; // URL du backend

const ConsulterDemande = ({
  demande,
  onSubmit,
  onRetour,
  isJuriste = false,
}) => {
  console.log("ConsulterDemande reçoit:", { demande, isJuriste });
  const [message, setMessage] = useState("");
  const [fichier, setFichier] = useState(null);
  const [erreurFichier, setErreurFichier] = useState("");
  const [messages, setMessages] = useState([]);
  const [commune, setCommune] = useState(null);
  const messagesEndRef = useRef(null);
  const [showCloturer, setShowCloturer] = useState(false);

  useEffect(() => {
    console.log("useEffect ConsulterDemande - demande:", demande);
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/demandes/${demande._id}/messages`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        } else {
          console.log("⚠️ Utilisation des messages locaux");
          setMessages(demande.messages || []);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des messages:", error);
        setMessages(demande.messages || []);
      }
    };

    if (demande && demande._id) {
      fetchMessages();
      fetchCommune();
      scrollToBottom();
    }
  }, [demande?._id]);

  const fetchCommune = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/communes/${demande.commune}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const communeData = await response.json();
        setCommune(communeData);
      } else {
        console.error(
          "Erreur lors de la récupération de la commune:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Veuillez entrer un message");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("texte", message);
      formData.append("type", isJuriste ? "reponse" : "demande");
      formData.append("estJuriste", isJuriste.toString());
      if (fichier) {
        formData.append("fichiers", fichier);
      }

      const response = await fetch(
        `${API_URL}/api/demandes/${demande._id}/message`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }

      const messageData = await response.json();
      const nouveauMessage = messageData.message;
      setMessages((prevMessages) => [...prevMessages, nouveauMessage]);
      setMessage("");
      setFichier(null);
      scrollToBottom();
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert(
        error.message || "Une erreur est survenue lors de l'envoi du message"
      );
    }
  };

  const handleCloturer = async (note) => {
    try {
      const response = await fetch(
        `${API_URL}/api/demandes/${demande._id}/cloturer`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ note }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la clôture de la demande");
      }

      const data = await response.json();
      console.log("✅ Demande clôturée avec succès:", data);
      window.location.href = "/"; // Redirection vers la page d'accueil
    } catch (error) {
      console.error("❌ Erreur lors de la clôture:", error);
      alert("Une erreur est survenue lors de la clôture de la demande");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErreurFichier("Le fichier ne doit pas dépasser 5MB");
        e.target.value = null;
        return;
      }

      const typesAutorises = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!typesAutorises.includes(file.type)) {
        setErreurFichier(
          "Format de fichier non autorisé. Formats acceptés : PDF, JPEG, JPG, PNG"
        );
        e.target.value = null;
        return;
      }

      setFichier(file);
      setErreurFichier("");
    }
  };

  // Fonction pour formater le nom du fichier
  const formatFileName = (filePath) => {
    return filePath.split("/").pop();
  };

  return (
    <div className="tag-consulter-container">
      <div className="tag-consulter-breadcrumb">
        <button onClick={onRetour} className="tag-consulter-btn-retour">
          <i className="fas fa-arrow-left"></i> Retour
        </button>
      </div>

      <div className="tag-consulter-content">
        <div className="tag-consulter-content-top">
          <div className="tag-consulter-detail-info">
            <h2>Informations générales</h2>
            <div className="tag-consulter-info-grid">
              <div className="tag-consulter-info-item">
                <label>Thème</label>
                <span>{demande?.theme || "Non spécifié"}</span>
              </div>
              <div className="tag-consulter-info-item">
                <label>Commune</label>
                <span>{commune?.nom || "Chargement..."}</span>
              </div>
              <div className="tag-consulter-info-item">
                <label>Demandeur</label>
                <span>
                  {demande?.utilisateur?.nom || "N/A"}{" "}
                  {demande?.utilisateur?.prenom || ""}
                </span>
              </div>
            </div>
          </div>

          <div className="tag-consulter-detail-objet">
            <h2>Objet de la demande</h2>
            <p>{demande?.objet || "Aucun objet spécifié"}</p>
          </div>
        </div>

        <div className="tag-consulter-chat-section">
          <h2 className="tag-chat-title">Conversation</h2>
          <div className="tag-chat-messages-wrapper">
            {messages && messages.length > 0 ? (
              messages.map((message, index) => {
                // Gérer les messages sans auteur (anciens messages)
                const auteurInfo = message.auteur
                  ? {
                      nom: message.auteur.nom || "Utilisateur",
                      prenom: message.auteur.prenom || "Inconnu",
                    }
                  : {
                      nom: message.estJuriste ? "Juriste" : "Utilisateur",
                      prenom: "Inconnu",
                    };

                const shouldShowOnRight = isJuriste
                  ? message.estJuriste
                  : !message.estJuriste;

                return (
                  <div
                    key={index}
                    className={`tag-chat-message ${
                      shouldShowOnRight
                        ? "tag-chat-message-sent"
                        : "tag-chat-message-received"
                    }`}
                  >
                    <div className="tag-chat-message-content">
                      <p className="tag-chat-message-text">{message.texte}</p>
                      {message.piecesJointes &&
                        message.piecesJointes.length > 0 && (
                          <div className="tag-chat-attachments">
                            {message.piecesJointes.map((file, fileIndex) => (
                              <a
                                key={fileIndex}
                                href={`${API_URL}/uploads/${file.replace(
                                  /^.*[\\/]/,
                                  ""
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tag-chat-attachment-link"
                              >
                                <i className="fas fa-paperclip"></i>
                                {file.replace(/^.*[\\/]/, "")}
                              </a>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="tag-chat-message-info">
                      <span className="tag-chat-message-author">
                        {auteurInfo.nom} {auteurInfo.prenom}
                        {message.estJuriste && " (Juriste)"}
                      </span>
                      <span className="tag-chat-message-time">
                        {new Date(message.date).toLocaleString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-messages">
                <p>Aucun message dans cette conversation</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {demande.statut !== "clôturé" && (
            <form onSubmit={handleSubmit} className="tag-consulter-chat-form">
              <div className="tag-consulter-chat-input-container">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="tag-consulter-chat-input"
                />
                <div className="tag-consulter-chat-actions">
                  <div className="tag-consulter-file-upload">
                    <input
                      type="file"
                      id="fichier"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="fichier"
                      className="tag-consulter-file-upload-btn"
                    >
                      <i className="fas fa-paperclip"></i>
                    </label>
                  </div>
                  <button type="submit" className="tag-consulter-send-btn">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
              {fichier && (
                <div className="tag-consulter-selected-file">
                  <i className="fas fa-file"></i>
                  <span>{fichier.name}</span>
                  <button
                    type="button"
                    onClick={() => setFichier(null)}
                    className="tag-consulter-remove-file-btn"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
              {erreurFichier && (
                <p className="tag-consulter-chat-error">{erreurFichier}</p>
              )}
            </form>
          )}
        </div>

        {demande.statut === "traitée" &&
          demande.utilisateur._id === sessionStorage.getItem("userId") &&
          !showCloturer && (
            <button
              className="btn-cloturer"
              onClick={() => setShowCloturer(true)}
            >
              Clôturer et noter la demande
            </button>
          )}

        {showCloturer && (
          <CloturerDemande
            demande={demande}
            onSubmit={handleCloturer}
            onCancel={() => setShowCloturer(false)}
          />
        )}
      </div>
    </div>
  );
};

ConsulterDemande.propTypes = {
  demande: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    objet: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    theme: PropTypes.string.isRequired,
    commune: PropTypes.string.isRequired,
    statut: PropTypes.string.isRequired,
    dateCreation: PropTypes.string.isRequired,
    fichiers: PropTypes.arrayOf(PropTypes.string),
    messages: PropTypes.arrayOf(
      PropTypes.shape({
        auteur: PropTypes.shape({
          nom: PropTypes.string.isRequired,
          prenom: PropTypes.string.isRequired,
        }).isRequired,
        texte: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        piecesJointes: PropTypes.arrayOf(PropTypes.string),
      })
    ),
    utilisateur: PropTypes.shape({
      nom: PropTypes.string.isRequired,
      prenom: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onRetour: PropTypes.func.isRequired,
  isJuriste: PropTypes.bool,
};

export default ConsulterDemande;
