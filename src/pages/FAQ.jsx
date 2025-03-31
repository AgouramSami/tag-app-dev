import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FAQ.css";

const FAQ = () => {
  // États
  const [faqs, setFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Configuration axios
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
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
  }, []);

  // Vérification des permissions
  const checkJuristPermissions = () => {
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
      const response = await api.get("/faqs", {
        params: { apiKey: import.meta.env.VITE_API_KEY },
      });
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

    try {
      await api.post("/faqs", {
        ...newFaq,
        apiKey: import.meta.env.VITE_API_KEY,
        userId: user._id,
      });

      await fetchFaqs();
      setIsModalOpen(false);
      setNewFaq({ theme: "", question: "", reponse: "" });
    } catch (error) {
      setError("Erreur lors de l'ajout de la FAQ");
      console.error("Erreur lors de l'ajout de la FAQ :", error);
    }
  };

  const handleEditFaq = async () => {
    if (!checkJuristPermissions()) return;

    try {
      await api.put(`/faqs/${editingFaq._id}`, {
        ...editingFaq,
        apiKey: import.meta.env.VITE_API_KEY,
        userId: user._id,
      });

      await fetchFaqs();
      setIsModalOpen(false);
      setEditingFaq(null);
    } catch (error) {
      setError("Erreur lors de la modification de la FAQ");
      console.error("Erreur lors de la modification de la FAQ :", error);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!checkJuristPermissions()) return;

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette FAQ ?")) {
      try {
        await api.delete(`/api/faqs/${id}`, {
          params: {
            apiKey: import.meta.env.VITE_API_KEY,
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
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.theme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Composants
  const FAQItem = ({ faq }) => (
    <div className="tag-faq-item">
      <div className="tag-faq-header">
        <h3 className="tag-faq-question">{faq.question}</h3>
        <span className="tag-faq-theme">{faq.theme}</span>
      </div>
      <p className="tag-faq-answer">{faq.reponse}</p>
      {user?.permissions === "juriste" && (
        <div className="tag-faq-actions">
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

  const FAQModal = () => (
    <div className="tag-faq-modal">
      <div className="tag-faq-modal-content">
        <h2>{editingFaq ? "Modifier la FAQ" : "Ajouter une FAQ"}</h2>
        <div className="tag-faq-form">
          <div className="tag-form-group">
            <label>Thème</label>
            <input
              type="text"
              value={editingFaq ? editingFaq.theme : newFaq.theme}
              onChange={(e) =>
                editingFaq
                  ? setEditingFaq({ ...editingFaq, theme: e.target.value })
                  : setNewFaq({ ...newFaq, theme: e.target.value })
              }
            />
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

  if (loading) {
    return <div className="tag-loading">Chargement...</div>;
  }

  return (
    <div className="tag-faq-container">
      <h1 className="tag-faq-title">FAQ</h1>
      {error && <div className="tag-error-message">{error}</div>}

      <div className="tag-search-container">
        <input
          type="text"
          className="tag-search-input"
          placeholder="Rechercher une question ou un thème..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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

      {isModalOpen && <FAQModal />}
    </div>
  );
};

export default FAQ;
