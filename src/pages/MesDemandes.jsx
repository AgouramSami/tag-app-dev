import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RGPDNotice from "../components/RGPDNotice";
import CardDemande from "../components/CardDemande";
import "../styles/MesDemandes.css";

const API_URL = "http://localhost:5000";

const MesDemandes = () => {
  const [demandes, setDemandes] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reponse, setReponse] = useState("");
  const [fichier, setFichier] = useState(null);
  const [erreurFichier, setErreurFichier] = useState("");
  const [note, setNote] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [demandeToClose, setDemandeToClose] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/demandes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des demandes");
        }

        const data = await response.json();
        setDemandes(data);
      } catch (err) {
        console.error("❌ Erreur:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemandes();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/demandes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la demande");
      }

      setDemandes(demandes.filter((d) => d._id !== id));
      setSelectedDemande(null);
    } catch (err) {
      console.error("❌ Erreur:", err);
      alert("Une erreur est survenue lors de la suppression de la demande");
    }
  };

  const handleConsultation = (demande) => {
    console.log("Consultation de la demande:", demande);
    if (demande && demande._id) {
      setSelectedDemande(demande);
    } else {
      console.error("Demande invalide:", demande);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérification de la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErreurFichier("Le fichier ne doit pas dépasser 10MB");
        return;
      }

      // Vérification du type de fichier
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
        return;
      }

      setFichier(file);
      setErreurFichier("");
    }
  };

  const handleSubmitReponse = async (e) => {
    e.preventDefault();
    if (!reponse.trim()) {
      alert("Veuillez entrer une réponse");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("texte", reponse);
      if (fichier) {
        formData.append("fichier", fichier);
      }

      const response = await fetch(
        `${API_URL}/api/demandes/${selectedDemande._id}/message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de la réponse");
      }

      const data = await response.json();
      setSelectedDemande(data);
      setReponse("");
      setFichier(null);
      setErreurFichier("");
    } catch (err) {
      console.error("❌ Erreur:", err);
      alert("Une erreur est survenue lors de l'envoi de la réponse");
    }
  };

  const handleCloturer = (demande) => {
    setDemandeToClose(demande);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/demandes/${demandeToClose._id}/cloturer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ note }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la clôture de la demande");
      }

      const updatedDemande = await response.json();
      setDemandes(
        demandes.map((d) => (d._id === updatedDemande._id ? updatedDemande : d))
      );
      setShowRatingModal(false);
      setNote(0);
      setDemandeToClose(null);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de la clôture de la demande");
    }
  };

  // Filtrage des demandes
  const demandesFiltrees = demandes.filter((demande) => {
    const matchSearch =
      demande.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande._id.slice(-5).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut =
      filtreStatut === "tous" || demande.statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="mes-demandes-container">
      <div className="mes-demandes-header">
        <h1 className="mes-demandes-title">Mes Demandes</h1>
        <div className="mes-demandes-filters">
          <input
            type="text"
            placeholder="Rechercher une demande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="search-bar"
          >
            <option value="tous">Tous les statuts</option>
            <option value="en attente">En attente</option>
            <option value="en cours">En cours</option>
            <option value="traitée">Traitée</option>
            <option value="archivée">Archivée</option>
          </select>
        </div>
      </div>

      {selectedDemande && selectedDemande._id ? (
        <div className="mes-demande-detail">
          <button
            onClick={() => setSelectedDemande(null)}
            className="mes-demande-btn mes-demande-btn-voir"
          >
            <i className="fas fa-arrow-left"></i> Retour aux demandes
          </button>

          <div className="demande-content">
            <h2>Détail de la demande</h2>
            <div className="demande-info">
              <p>
                <strong>Objet :</strong>{" "}
                {selectedDemande.objet || "Non spécifié"}
              </p>
              <p>
                <strong>Thème :</strong>{" "}
                {selectedDemande.theme || "Aucun thème spécifié"}
              </p>
              <p>
                <strong>Demande :</strong>{" "}
                {selectedDemande.description || "Aucune description"}
              </p>
              <p>
                <strong>Statut :</strong>{" "}
                <span
                  className={`mes-demande-status ${
                    selectedDemande.statut || "en attente"
                  }`}
                >
                  {selectedDemande.statut || "En attente"}
                </span>
              </p>
            </div>

            {/* Affichage de la réponse du juriste */}
            {selectedDemande.reponse && selectedDemande.reponse.texte ? (
              <div className="reponse-section">
                <h3>Réponse du juriste</h3>
                <div className="reponse-content">
                  <p>{selectedDemande.reponse.texte}</p>
                  <p>
                    <strong>Répondu par :</strong>{" "}
                    {selectedDemande.reponse.juriste
                      ? `${selectedDemande.reponse.juriste.nom} ${selectedDemande.reponse.juriste.prenom}`
                      : "Juriste non spécifié"}
                  </p>

                  {/* Pièces jointes envoyées par le juriste */}
                  {selectedDemande.reponse.fichiers &&
                    selectedDemande.reponse.fichiers.length > 0 && (
                      <div className="mes-demande-pj-container">
                        <h4>Pièces jointes du juriste :</h4>
                        <ul className="mes-demande-pj-list">
                          {selectedDemande.reponse.fichiers.map(
                            (file, index) => (
                              <li key={index} className="mes-demande-pj-item">
                                <a
                                  href={`${API_URL}/uploads/${file.replace(
                                    /^.*[\\/]/,
                                    ""
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <i className="fas fa-paperclip"></i>
                                  {file.replace(/^.*[\\/]/, "")}
                                </a>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <p>
                <strong>Réponse :</strong> Aucune réponse pour le moment.
              </p>
            )}

            {/* Formulaire de réponse */}
            {selectedDemande.reponse && (
              <div className="reponse-form-section">
                <h3>Répondre au juriste</h3>
                <form onSubmit={handleSubmitReponse} className="reponse-form">
                  <div className="form-group">
                    <label htmlFor="reponse">Votre réponse :</label>
                    <textarea
                      id="reponse"
                      value={reponse}
                      onChange={(e) => setReponse(e.target.value)}
                      placeholder="Écrivez votre réponse ici..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fichier">Pièce jointe (optionnel) :</label>
                    <input
                      type="file"
                      id="fichier"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {erreurFichier && (
                      <p className="error-message">{erreurFichier}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="mes-demande-btn mes-demande-btn-voir"
                  >
                    <i className="fas fa-paper-plane"></i> Envoyer la réponse
                  </button>
                </form>
              </div>
            )}

            {/* Bouton de clôture */}
            {selectedDemande.statut === "traitée" && (
              <div className="cloture-section">
                <button
                  onClick={() => handleCloturer(selectedDemande)}
                  className="mes-demande-btn mes-demande-btn-cloturer"
                >
                  <i className="fas fa-check-circle"></i> Clôturer la demande
                </button>
              </div>
            )}

            {/* Modal de notation */}
            {showRatingModal && (
              <div className="rating-modal-overlay">
                <div className="rating-modal-content">
                  <h3>Évaluez votre demande</h3>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`fas fa-star ${
                          star <= note ? "star-filled" : "star-empty"
                        }`}
                        onClick={() => setNote(star)}
                      ></i>
                    ))}
                  </div>
                  <div className="rating-actions">
                    <button
                      onClick={() => {
                        setShowRatingModal(false);
                        setNote(0);
                        setDemandeToClose(null);
                      }}
                      className="mes-demande-btn mes-demande-btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleRatingSubmit}
                      className="mes-demande-btn mes-demande-btn-primary"
                      disabled={note === 0}
                    >
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pièces jointes envoyées par l'utilisateur */}
            {selectedDemande.fichiers.length > 0 && (
              <div className="mes-demande-pj-container">
                <h4>Pièces jointes envoyées :</h4>
                <ul className="mes-demande-pj-list">
                  {selectedDemande.fichiers.map((file, index) => (
                    <li key={index} className="mes-demande-pj-item">
                      <a
                        href={`${API_URL}/uploads/${file.replace(
                          /^.*[\\/]/,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fas fa-paperclip"></i>
                        {file.replace(/^.*[\\/]/, "")}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Historique des messages */}
            {selectedDemande.messages &&
              selectedDemande.messages.length > 0 && (
                <div className="messages-section">
                  <h3>Historique des échanges</h3>
                  <div className="messages-list">
                    {selectedDemande.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`message ${
                          message.type === "reponse" ? "message-reponse" : ""
                        }`}
                      >
                        <div className="message-header">
                          <span className="message-author">
                            {message.auteur.nom} {message.auteur.prenom}
                          </span>
                          <span className="message-date">
                            {new Date(message.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="message-content">
                          <p>{message.texte}</p>
                          {message.piecesJointes &&
                            message.piecesJointes.length > 0 && (
                              <div className="message-fichiers">
                                <ul>
                                  {message.piecesJointes.map(
                                    (file, fileIndex) => (
                                      <li key={fileIndex}>
                                        <a
                                          href={`${API_URL}/uploads/${file.replace(
                                            /^.*[\\/]/,
                                            ""
                                          )}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <i className="fas fa-paperclip"></i>
                                          {file.replace(/^.*[\\/]/, "")}
                                        </a>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      ) : (
        <>
          <div className="mes-demandes-grid">
            {demandesFiltrees.map((demande) => (
              <CardDemande
                key={demande._id}
                numero={demande._id.slice(-6)}
                date={new Date(demande.dateCreation).toLocaleDateString()}
                objet={demande.objet}
                theme={demande.theme}
                statut={demande.statut}
                onConsulter={() => handleConsultation(demande)}
              />
            ))}
          </div>
          <RGPDNotice />
        </>
      )}
    </div>
  );
};

export default MesDemandes;
