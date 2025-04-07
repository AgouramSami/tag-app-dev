import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/FAQ.css";
import { useAuth } from "../context/AuthContext";

const FAQModal = ({
  isOpen,
  editingFaq,
  newFaq,
  setEditingFaq,
  setNewFaq,
  setIsModalOpen,
  handleEditFaq,
  handleAddFaq,
  themes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="tag-faq-modal">
      <div className="tag-faq-modal-content">
        <h2>{editingFaq ? "Modifier la FAQ" : "Ajouter une FAQ"}</h2>
        <div className="tag-faq-form">
          <div className="tag-form-group">
            <label>Thème</label>
            <select
              value={editingFaq ? editingFaq.theme : newFaq.theme}
              onChange={(e) =>
                editingFaq
                  ? setEditingFaq({ ...editingFaq, theme: e.target.value })
                  : setNewFaq({ ...newFaq, theme: e.target.value })
              }
            >
              <option value="">Sélectionnez un thème</option>
              {themes.map((theme) => (
                <option key={theme._id} value={theme.nom}>
                  {theme.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="tag-form-group">
            <label>Question</label>
            <input
              type="text"
              value={editingFaq ? editingFaq.question : newFaq.question}
              onChange={(e) =>
                editingFaq
                  ? setEditingFaq({ ...editingFaq, question: e.target.value })
                  : setNewFaq({ ...newFaq, question: e.target.value })
              }
            />
          </div>
          <div className="tag-form-group">
            <label>Réponse</label>
            <textarea
              value={editingFaq ? editingFaq.reponse : newFaq.reponse}
              onChange={(e) =>
                editingFaq
                  ? setEditingFaq({ ...editingFaq, reponse: e.target.value })
                  : setNewFaq({ ...newFaq, reponse: e.target.value })
              }
            />
          </div>
        </div>
        <div className="tag-faq-modal-actions">
          <button
            className="tag-faq-cancel-btn"
            onClick={() => {
              setIsModalOpen(false);
              setEditingFaq(null);
              setNewFaq({ theme: "", question: "", reponse: "" });
            }}
          >
            Annuler
          </button>
          <button
            className="tag-faq-save-btn"
            onClick={editingFaq ? handleEditFaq : handleAddFaq}
          >
            {editingFaq ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  // États du composant
  const [faqs, setFaqs] = useState([]);
  const [themes, setThemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [newFaq, setNewFaq] = useState({
    theme: "",
    question: "",
    reponse: "",
  });
  const [openFaqId, setOpenFaqId] = useState(null);

  // Contexte d'authentification
  const { user, checkAccess } = useAuth();

  // Configuration de l'API
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });

  // Récupération des thèmes
  const fetchThemes = async () => {
    try {
      const response = await api.get("/themes");
      setThemes(response.data);
      setError("");
    } catch (error) {
      setError("Erreur lors du chargement des thèmes");
      console.error("Erreur lors du chargement des thèmes :", error);
    }
  };

  // Récupération des FAQs
  const fetchFaqs = async () => {
    try {
      const response = await api.get("/faqs");
      setFaqs(response.data);
      setError("");
    } catch (error) {
      setError("Erreur lors du chargement des FAQ");
      console.error("Erreur lors du chargement des FAQ :", error);
    } finally {
      setLoading(false);
    }
  };

  // Vérification des permissions de juriste
  const checkJuristPermissions = () => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }
    if (!checkAccess("juriste")) {
      setError(
        "Permissions insuffisantes. Seuls les juristes peuvent modifier la FAQ."
      );
      return false;
    }
    return true;
  };

  // Gérer l'ajout d'une nouvelle FAQ
  const handleAddFaq = async () => {
    if (!checkJuristPermissions()) return;

    if (!newFaq.theme || !newFaq.question || !newFaq.reponse) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await api.post("/faqs", {
        theme: newFaq.theme,
        question: newFaq.question,
        reponse: newFaq.reponse,
      });

      if (response.status === 201) {
        await fetchFaqs();
        setIsModalOpen(false);
        setNewFaq({ theme: "", question: "", reponse: "" });
        setError("");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la FAQ :", error);
      setError(
        error.response?.data?.message || "Erreur lors de l'ajout de la FAQ"
      );
    }
  };

  // Gérer la modification d'une FAQ existante
  const handleEditFaq = async () => {
    if (!checkJuristPermissions()) return;

    if (
      !editingFaq._id ||
      !editingFaq.theme ||
      !editingFaq.question ||
      !editingFaq.reponse
    ) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await api.put(`/faqs/${editingFaq._id}`, {
        theme: editingFaq.theme,
        question: editingFaq.question,
        reponse: editingFaq.reponse,
      });

      if (response.status === 200) {
        await fetchFaqs();
        setIsModalOpen(false);
        setEditingFaq(null);
        setError("");
      }
    } catch (error) {
      console.error("Erreur lors de la modification de la FAQ :", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors de la modification de la FAQ"
      );
    }
  };

  // Gérer la suppression d'une FAQ
  const handleDeleteFaq = async (id) => {
    if (!checkJuristPermissions()) return;

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette FAQ ?")) {
      try {
        const response = await api.delete(`/faqs/${id}`);
        if (response.status === 200) {
          await fetchFaqs();
          setError("");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la FAQ :", error);
        setError(
          error.response?.data?.message ||
            "Erreur lors de la suppression de la FAQ"
        );
      }
    }
  };

  // Fonction pour afficher le bouton d'ajout de FAQ
  const renderAddButton = () => {
    if (checkAccess("juriste")) {
      return (
        <button
          className="tag-faq-add-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="fas fa-plus"></i> Ajouter une FAQ
        </button>
      );
    }
    return null;
  };

  // Toggle pour ouvrir/fermer une FAQ
  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  // Effet pour charger les données initiales
  useEffect(() => {
    fetchFaqs();
    fetchThemes();
  }, []);

  // Filtrage des FAQ par recherche et thème
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = searchQuery
      ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.reponse.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesTheme = selectedTheme ? faq.theme === selectedTheme : true;

    return matchesSearch && matchesTheme;
  });

  if (loading) {
    return <div className="tag-loading">Chargement...</div>;
  }

  return (
    <div className="tag-faq-container">
      {/* Titre */}
      <h1 className="tag-faq-title">Foire Aux Questions</h1>

      {/* Message d'erreur */}
      {error && <div className="tag-error-message">{error}</div>}

      {/* Conteneur de recherche et filtre */}
      <div className="tag-search-container">
        {/* Barre de recherche */}
        <div className="tag-search-input-container">
          <input
            className="tag-search-input"
            type="text"
            placeholder="Rechercher une FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtre par thème */}
        <select
          className="tag-theme-filter"
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
        >
          <option value="">Tous les thèmes</option>
          {themes.map((theme) => (
            <option key={theme._id} value={theme.nom}>
              {theme.nom}
            </option>
          ))}
        </select>

        {/* Bouton pour réinitialiser la recherche */}
        {(searchQuery || selectedTheme) && (
          <button
            className="tag-faq-reset-search"
            onClick={() => {
              setSearchQuery("");
              setSelectedTheme("");
            }}
          >
            <i className="fas fa-times"></i> Réinitialiser
          </button>
        )}
      </div>

      {/* Bouton d'ajout (visible uniquement pour les juristes) */}
      {renderAddButton()}

      {/* Liste des FAQ */}
      <div className="tag-faq-list">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <div
              key={faq._id}
              className={`tag-faq-item ${
                openFaqId === faq._id ? "active" : ""
              }`}
            >
              <div
                className="tag-faq-header"
                onClick={() => toggleFaq(faq._id)}
              >
                <h3 className="tag-faq-question">{faq.question}</h3>
                <span className="tag-faq-theme-badge">{faq.theme}</span>
              </div>
              <div className="tag-faq-answer">{faq.reponse}</div>

              {/* Actions pour les juristes */}
              {checkAccess("juriste") && (
                <div className="tag-faq-actions">
                  <button
                    className="tag-faq-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFaq(faq);
                      setIsModalOpen(true);
                    }}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="tag-faq-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFaq(faq._id);
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="tag-faq-no-results">
            <i className="fas fa-search"></i>
            <p>Aucun résultat trouvé</p>
            <button
              className="tag-faq-reset-search"
              onClick={() => {
                setSearchQuery("");
                setSelectedTheme("");
              }}
            >
              Réinitialiser la recherche
            </button>
          </div>
        )}
      </div>

      {/* Modal pour ajouter/éditer une FAQ */}
      <FAQModal
        isOpen={isModalOpen}
        editingFaq={editingFaq}
        newFaq={newFaq}
        setEditingFaq={setEditingFaq}
        setNewFaq={setNewFaq}
        setIsModalOpen={setIsModalOpen}
        handleEditFaq={handleEditFaq}
        handleAddFaq={handleAddFaq}
        themes={themes}
      />
    </div>
  );
};

export default FAQ;
