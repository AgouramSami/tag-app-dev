import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CardDemande from "../components/CardDemande";
import ConsulterDemande from "../components/ConsulterDemande";
import SearchFilter from "../components/SearchFilter";
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

  const filterOptions = [
    { value: "tous", label: "Tous les statuts" },
    { value: "en attente", label: "En attente" },
    { value: "en cours", label: "En cours" },
    { value: "traitée", label: "Traitée" },
    { value: "archivée", label: "Archivée" },
  ];

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/demandes`, {
          credentials: "include",
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
      const response = await fetch(`${API_URL}/api/demandes/${id}`, {
        method: "DELETE",
        credentials: "include",
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
      if (demande.statut === "archivée") {
        console.log("Affichage direct d'une demande archivée");
        setSelectedDemande(demande);
        return;
      }

      const fetchDemande = async () => {
        try {
          const response = await fetch(
            `${API_URL}/api/demandes/${demande._id}`,
            {
              credentials: "include",
            }
          );

          if (response.ok) {
            const data = await response.json();
            setSelectedDemande(data);
          } else {
            setSelectedDemande(demande);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de la demande:", error);
          setSelectedDemande(demande);
        }
      };

      fetchDemande();
    } else {
      console.error("Demande invalide:", demande);
    }
  };

  const handleRetour = () => {
    setSelectedDemande(null);
    setReponse("");
    setFichier(null);
    setErreurFichier("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErreurFichier("Le fichier ne doit pas dépasser 10MB");
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
        return;
      }

      setFichier(file);
      setErreurFichier("");
    }
  };

  const handleSubmitReponse = async (e) => {
    e.preventDefault();
    if (!reponse.trim()) {
      alert("Veuillez entrer un message");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("texte", reponse);
      formData.append("type", "demande");
      formData.append("estJuriste", false);

      if (fichier) {
        formData.append("fichiers", fichier);
      }

      console.log("📤 Envoi de la réponse:", {
        texte: reponse,
        fichier: fichier?.name,
      });

      const response = await fetch(
        `${API_URL}/api/demandes/${selectedDemande._id}/message`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      console.log("Fetch a fini de se charger :", response.url);

      let responseData;
      try {
        responseData = await response.json();
      } catch (error) {
        console.error("Erreur lors de la lecture de la réponse:", error);
        throw new Error("Erreur lors de la lecture de la réponse");
      }

      if (!response.ok) {
        throw new Error(
          responseData.message || "Erreur lors de l'envoi du message"
        );
      }

      const updatedDemande = {
        ...selectedDemande,
        messages: [...selectedDemande.messages, responseData.message],
      };

      setSelectedDemande(updatedDemande);
      setReponse("");
      setFichier(null);
      setErreurFichier("");
    } catch (err) {
      console.error("❌ Erreur détaillée:", err);
      if (err.message) {
        console.error("Message d'erreur:", err.message);
      }
      alert(
        "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer."
      );
    }
  };

  const handleCloturer = (demande) => {
    if (demande.statut !== "traitée") {
      alert("La demande doit être en statut 'traitée' pour être clôturée");
      return;
    }
    setDemandeToClose(demande);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async () => {
    if (note < 1 || note > 5) {
      alert("Veuillez donner une note entre 1 et 5");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/demandes/${demandeToClose._id}/cloturer`,
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

      const updatedDemande = await response.json();
      setDemandes(
        demandes.map((d) =>
          d._id === updatedDemande.demande._id ? updatedDemande.demande : d
        )
      );
      setShowRatingModal(false);
      setNote(0);
      setDemandeToClose(null);
      alert("Demande clôturée avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de la clôture de la demande");
    }
  };

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
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterValue={filtreStatut}
          onFilterChange={setFiltreStatut}
          filterOptions={filterOptions}
          searchPlaceholder="Rechercher par objet ou numéro de demande..."
          filterLabel="Statut"
        />
      </div>

      {selectedDemande && selectedDemande._id ? (
        <div className="mes-demande-detail">
          <div className="mes-demande-actions">
            <button
              className="mes-demande-btn mes-demande-btn-voir"
              onClick={() => navigate("/mes-demandes")}
            >
              Retour aux demandes
            </button>
            {selectedDemande.statut === "traitée" && (
              <button
                className="mes-demande-btn mes-demande-btn-cloturer"
                onClick={() => handleCloturer(selectedDemande)}
              >
                Clôturer la demande
              </button>
            )}
          </div>

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

            {showRatingModal && (
              <div className="rating-modal">
                <div className="rating-modal-content">
                  <h2>Noter la réponse</h2>
                  <p>Veuillez noter la qualité de la réponse (1-5 étoiles)</p>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`star-btn ${note >= star ? "active" : ""}`}
                        onClick={() => setNote(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="rating-modal-buttons">
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setShowRatingModal(false);
                        setNote(0);
                        setDemandeToClose(null);
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      className="submit-btn"
                      onClick={handleRatingSubmit}
                      disabled={note === 0}
                    >
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedDemande.messages &&
              selectedDemande.messages.length > 0 && (
                <div className="tag-chat-section">
                  <h3 className="tag-chat-title">Discussion</h3>
                  <div className="tag-chat-container">
                    <div className="tag-chat-messages-wrapper">
                      {selectedDemande.messages.map((message, index) => {
                        const userRole = sessionStorage.getItem("role");

                        const shouldShowOnRight =
                          userRole === "juriste"
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
                              <p className="tag-chat-message-text">
                                {message.texte}
                              </p>
                              {message.piecesJointes &&
                                message.piecesJointes.length > 0 && (
                                  <div className="tag-chat-attachments">
                                    {message.piecesJointes.map(
                                      (file, fileIndex) => (
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
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                            <div className="tag-chat-message-info">
                              <span className="tag-chat-message-author">
                                {message.auteur.nom} {message.auteur.prenom}
                                {message.estJuriste && " (Juriste)"}
                              </span>
                              <span className="tag-chat-message-time">
                                {new Date(message.date).toLocaleString(
                                  "fr-FR",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form
                      onSubmit={handleSubmitReponse}
                      className="tag-chat-input-form"
                    >
                      <div className="tag-chat-input-container">
                        <textarea
                          value={reponse}
                          onChange={(e) => setReponse(e.target.value)}
                          placeholder="Écrivez votre message..."
                          className="tag-chat-input"
                        />
                        <div className="tag-chat-actions">
                          <label className="tag-chat-file-upload-btn">
                            <i className="fas fa-paperclip"></i>
                            <input
                              type="file"
                              onChange={handleFileChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{ display: "none" }}
                            />
                          </label>
                          <button type="submit" className="tag-chat-send-btn">
                            <i className="fas fa-paper-plane"></i>
                          </button>
                        </div>
                      </div>
                      {erreurFichier && (
                        <p className="tag-chat-error">{erreurFichier}</p>
                      )}
                      {fichier && (
                        <div className="tag-chat-selected-file">
                          <i className="fas fa-file"></i>
                          {fichier.name}
                          <button
                            type="button"
                            onClick={() => setFichier(null)}
                            className="tag-chat-remove-file-btn"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                    </form>
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
                onDelete={handleDelete}
                id={demande._id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MesDemandes;
