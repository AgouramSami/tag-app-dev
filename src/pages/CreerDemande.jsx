import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/creerDemande.css";
import { useNavigate } from "react-router-dom";

const CreerDemande = () => {
  const [themes, setThemes] = useState([]);
  const [theme, setTheme] = useState("");
  const [objet, setObjet] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [piecesJointes, setPiecesJointes] = useState([]);
  const [faqSuggestions, setFaqSuggestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleFaqClick = (faq) => {
    setObjet(faq.question);
    setFaqSuggestions([]);
  };

  const handleRemoveFile = (index) => {
    setPiecesJointes(piecesJointes.filter((_, i) => i !== index));
  };

  const fetchFaqSuggestions = async (query) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/faqs/search?query=${query}`
      );
      setFaqSuggestions(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des suggestions FAQ :", error);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/themes")
      .then((res) => setThemes(res.data))
      .catch(() => console.error("Erreur lors du chargement des thèmes."));
  }, []);

  useEffect(() => {
    if (objet.length > 2) {
      fetchFaqSuggestions(objet);
    } else {
      setFaqSuggestions([]);
    }
  }, [objet]);

  const handleFileChange = (e) => {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      alert("Seuls les fichiers PDF, PNG, JPEG et JPG sont autorisés !");
      return;
    }

    if (validFiles.length + piecesJointes.length > 8) {
      alert("Vous ne pouvez joindre que 8 fichiers maximum.");
      return;
    }

    setPiecesJointes([...piecesJointes, ...validFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      alert("La description ne peut pas être vide !");
      return;
    }

    const formData = new FormData();
    formData.append("theme", theme);
    formData.append("objet", objet);
    formData.append("description", description);
    piecesJointes.forEach((file) => {
      formData.append("fichiers", file);
    });

    try {
      await axios.post("http://localhost:5000/api/demandes", formData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setShowModal(true);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande :", error);
    }
  };

  return (
    <div className="tag-form-container">
      <h1 className="tag-form-title">Créer une demande</h1>
      {error && <div className="tag-error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="tag-form-group">
          <label className="tag-form-label">Thème</label>
          <select
            className="tag-form-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            required
          >
            <option value="">Sélectionnez un thème</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="tag-form-group">
          <label className="tag-form-label">Objet de la demande</label>
          <input
            type="text"
            className="tag-form-input tag-object-demande"
            value={objet}
            onChange={(e) => setObjet(e.target.value)}
            placeholder="Décrivez brièvement votre demande"
            required
          />
          {faqSuggestions.length > 0 && (
            <div className="tag-faq-suggestions">
              <div className="tag-faq-suggestions-title">
                Suggestions similaires :
              </div>
              <ul className="tag-ul">
                {faqSuggestions.map((faq) => (
                  <li
                    key={faq.id}
                    className="tag-faq-item"
                    onClick={() => handleFaqClick(faq)}
                  >
                    {faq.question}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="tag-form-group">
          <label className="tag-form-label">Description</label>
          <textarea
            className="tag-form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez en détail votre demande"
            required
          />
        </div>

        <div className="tag-form-group">
          <label className="tag-form-label">Pièces jointes</label>
          <div className="tag-pieces-jointes-container">
            <div className="tag-pieces-jointes-label">
              {piecesJointes.length === 0 ? (
                <div className="tag-pieces-jointes-empty">
                  Aucune pièce jointe
                </div>
              ) : (
                piecesJointes.map((piece, index) => (
                  <div key={index} className="tag-piece-jointe">
                    <span>{piece.name}</span>
                    <button
                      type="button"
                      className="tag-pieces-jointes-supprimer"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              type="button"
              className="tag-pieces-jointes-ajout"
              onClick={() => document.getElementById("file-upload").click()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
            <input
              id="file-upload"
              type="file"
              className="tag-file-input"
              onChange={handleFileChange}
              multiple
            />
          </div>
          <div className="tag-pieces-jointes-info">
            Formats acceptés : PDF, PNG, JPEG (max 8 pièces)
          </div>
        </div>

        <div className="tag-button-container">
          <button type="submit" className="tag-submit-btn">
            Envoyer la demande
          </button>
          <button
            type="button"
            className="tag-annuler-btn"
            onClick={() => navigate("/dashboard")}
          >
            Annuler
          </button>
        </div>
      </form>

      {showModal && (
        <div className="tag-modale-creer-demande">
          <div className="tag-modale-creer-demande-card">
            <h2 className="titre-modale">Demande créée avec succès !</h2>
            <p className="sous-titre-modale">
              Votre demande a été enregistrée et sera traitée dans les plus
              brefs délais.
            </p>
            <button
              className="tag-btn-retour-accueil"
              onClick={() => navigate("/dashboard")}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreerDemande;
