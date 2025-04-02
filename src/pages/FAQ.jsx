import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/FAQ.css";

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
  // États
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
  const [user, setUser] = useState(null);
  const [openFaqId, setOpenFaqId] = useState(null);

  // Configuration axios
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // Intercepteur pour ajouter le token
  api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Fonctions API
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

  // Vérification de l'authentification
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const token = sessionStorage.getItem("token");

    if (!storedUser || !token) {
      setError("Veuillez vous connecter pour accéder à cette page");
      return;
    }

    setUser(storedUser);
    fetchFaqs();
    fetchThemes();
  }, []);

  // Vérification des permissions
  const checkJuristPermissions = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Utilisateur non connecté");
      return false;
    }
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }
    if (user.permissions !== "juriste") {
      setError(
        `Permissions insuffisantes. Permissions actuelles: ${user.permissions}`
      );
      return false;
    }
    return true;
  };

  // Fonctions API
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

  const handleAddFaq = async () => {
    if (!checkJuristPermissions()) return;

    // Validation des champs
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

  const handleEditFaq = async () => {
    if (!checkJuristPermissions()) return;

    try {
      const faqData = {
        theme: editingFaq.theme,
        question: editingFaq.question,
        reponse: editingFaq.reponse,
        apiKey: import.meta.env.VITE_API_KEY,
        userId: user._id,
        auteur: user._id,
        dateCreation: editingFaq.dateCreation,
        dateModification: new Date().toISOString(),
      };

      const response = await api.put(`/faqs/${editingFaq._id}`, faqData);

      if (response.status === 200) {
        await fetchFaqs();
        setIsModalOpen(false);
        setEditingFaq(null);
      }
    } catch (error) {
      console.error("Erreur lors de la modification de la FAQ :", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors de la modification de la FAQ"
      );
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!checkJuristPermissions()) return;

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette FAQ ?")) {
      try {
        const token = sessionStorage.getItem("token");
        await api.delete(`/faqs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        await fetchFaqs();
        setError("");
      } catch (error) {
        console.error("Erreur de suppression:", error.response?.data);
        setError(
          error.response?.data?.message ||
            "Erreur lors de la suppression de la FAQ"
        );
      }
    }
  };

  // Filtrage des FAQ
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.theme.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTheme = selectedTheme === "" || faq.theme === selectedTheme;

    return matchesSearch && matchesTheme;
  });

  // Composants
  const FAQItem = ({ faq }) => (
    <div
      className={`tag-faq-item ${openFaqId === faq._id ? "active" : ""}`}
      onClick={() => setOpenFaqId(openFaqId === faq._id ? null : faq._id)}
    >
      <div className="tag-faq-header">
        <h3 className="tag-faq-question">{faq.question}</h3>
        <span className="tag-faq-theme-badge">{faq.theme || "Sans thème"}</span>
      </div>
      <p className="tag-faq-answer">{faq.reponse}</p>
      {user?.permissions === "juriste" && (
        <div className="tag-faq-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="tag-faq-edit-btn"
            onClick={() => {
              setEditingFaq(faq);
              setIsModalOpen(true);
            }}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="tag-faq-delete-btn"
            onClick={() => handleDeleteFaq(faq._id)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="tag-loading">Chargement...</div>;
  }

  return (
    <div className="tag-faq-container">
      <div className="tag-faq-header-container">
        <h1 className="tag-faq-title">FAQ</h1>
        <span className="tag-faq-theme-badge">
          {selectedTheme || "Tous les thèmes"}
        </span>
      </div>
      {error && <div className="tag-error-message">{error}</div>}

      <div className="tag-search-container">
        <div className="tag-search-input-container">
          <input
            type="text"
            className="tag-search-input"
            placeholder="Rechercher une question ou un thème..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
      </div>

      {user?.permissions === "juriste" && (
        <button
          className="tag-faq-add-btn"
          onClick={() => {
            setEditingFaq(null);
            setNewFaq({ theme: "", question: "", reponse: "" });
            setIsModalOpen(true);
          }}
        >
          <i className="fas fa-plus"></i> Ajouter une FAQ
        </button>
      )}

      <div className="tag-faq-list">
        {filteredFaqs.map((faq) => (
          <FAQItem key={faq._id} faq={faq} />
        ))}
      </div>

      {isModalOpen && (
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
      )}
    </div>
  );
};

export default FAQ;
