import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/creerDemande.css";

const CreerDemande = () => {
  const [themes, setThemes] = useState([]);
  const [theme, setTheme] = useState("");
  const [objet, setObjet] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [piecesJointes, setPiecesJointes] = useState([]);
  const [faqSuggestions, setFaqSuggestions] = useState([]);
  const [showModal, setShowModal] = useState(false);

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
      // ✅ Lance la recherche après 3 caractères
      fetchFaqSuggestions(objet);
    } else {
      setFaqSuggestions([]); // ✅ Si l'objet est vide, ne rien afficher
    }
  }, [objet]);

  const handleFileChange = (e) => {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
    const selectedFiles = Array.from(e.target.files);

    // Vérifier si tous les fichiers ont une extension autorisée
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

    const token = sessionStorage.getItem("token");

    // ✅ Création de `FormData`
    const formData = new FormData();
    formData.append("theme", theme);
    formData.append("objet", objet);
    formData.append("description", description);

    piecesJointes.forEach((file) => {
      formData.append("fichiers", file); // ✅ Ajoute les fichiers correctement
    });

    console.log(
      "📤 Données envoyées :",
      Object.fromEntries(formData.entries())
    );

    try {
      const res = await axios.post(
        "http://localhost:5000/api/demandes",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // ✅ Obligatoire pour gérer les fichiers
          },
        }
      );

      console.log("✅ Réponse backend :", res.data);

      setShowModal(true);
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de la demande :", error);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Je crée ma demande</h1>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="theme" className="form-label">
            Thème de la demande :
          </label>
          <select
            id="theme"
            className="form-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            required
          >
            <option value="">Sélectionner un thème</option>
            {themes.map((t) => (
              <option key={t._id} value={t.nom}>
                {t.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="objet" className="form-label">
            Objet de la demande :
          </label>
          <input
            type="text"
            id="objet"
            className="form-input object-demand"
            value={objet}
            onChange={(e) => setObjet(e.target.value)}
            required
          />
        </div>
        {/* ✅ Suggestions FAQ dynamiques sous l'objet */}
        {faqSuggestions.length > 0 && (
          <div className="faq-suggestions">
            {faqSuggestions.length > 0 && (
              <p>Ces articles peuvent répondre à votre question :</p>
            )}
            {faqSuggestions.map((faq) => (
              <p key={faq._id} className="faq-item">
                <a
                  href={`/faq#${faq._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {faq.question}
                </a>
              </p>
            ))}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Demande :
          </label>
          <textarea
            id="description"
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Écrivez votre demande ici..."
            required
          ></textarea>
        </div>

        {/* 📎 Ajout de pièce jointe */}
        <div className="form-group">
          <label htmlFor="file-upload" className="form-label">
            Pièces jointes :
          </label>

          {/* 📦 Conteneur flex des pièces jointes */}
          <div className="pieces-jointes-container">
            {/* ✅ Affichage des fichiers ou message par défaut */}
            <span className="pieces-jointes-label">
              {piecesJointes.length > 0
                ? piecesJointes.map((file, index) => (
                    <div key={index} className="piece-jointe">
                      {file.name}
                      {/* ❌ Bouton pour supprimer */}
                      <button
                        className="pieces-jointes-supprimer"
                        onClick={() => {
                          setPiecesJointes(
                            piecesJointes.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  ))
                : "Aucune pièce jointe."}
            </span>

            {/* 📎 Bouton d'ajout */}
            <button
              type="button"
              className="pieces-jointes-ajout"
              onClick={() => document.getElementById("file-upload").click()}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_iconCarrier">
                  <path
                    opacity="0.5"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 14.25C3.41421 14.25 3.75 14.5858 3.75 15C3.75 16.4354 3.75159 17.4365 3.85315 18.1919C3.9518 18.9257 4.13225 19.3142 4.40901 19.591C4.68577 19.8678 5.07435 20.0482 5.80812 20.1469C6.56347 20.2484 7.56459 20.25 9 20.25H15C16.4354 20.25 17.4365 20.2484 18.1919 20.1469C18.9257 20.0482 19.3142 19.8678 19.591 19.591C19.8678 19.3142 20.0482 18.9257 20.1469 18.1919C20.2484 17.4365 20.25 16.4354 20.25 15C20.25 14.5858 20.5858 14.25 21 14.25C21.4142 14.25 21.75 14.5858 21.75 15V15.0549C21.75 16.4225 21.75 17.5248 21.6335 18.3918C21.5125 19.2919 21.2536 20.0497 20.6517 20.6516C20.0497 21.2536 19.2919 21.5125 18.3918 21.6335C17.5248 21.75 16.4225 21.75 15.0549 21.75H8.94513C7.57754 21.75 6.47522 21.75 5.60825 21.6335C4.70814 21.5125 3.95027 21.2536 3.34835 20.6517C2.74643 20.0497 2.48754 19.2919 2.36652 18.3918C2.24996 17.5248 2.24998 16.4225 2.25 15.0549C2.25 15.0366 2.25 15.0183 2.25 15C2.25 14.5858 2.58579 14.25 3 14.25Z"
                    fill="#003255"
                  ></path>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 16.75C12.2106 16.75 12.4114 16.6615 12.5535 16.5061L16.5535 12.1311C16.833 11.8254 16.8118 11.351 16.5061 11.0715C16.2004 10.792 15.726 10.8132 15.4465 11.1189L12.75 14.0682V3C12.75 2.58579 12.4142 2.25 12 2.25C11.5858 2.25 11.25 2.58579 11.25 3V14.0682L8.55353 11.1189C8.27403 10.8132 7.79963 10.792 7.49393 11.0715C7.18823 11.351 7.16698 11.8254 7.44648 12.1311L11.4465 16.5061C11.5886 16.6615 11.7894 16.75 12 16.75Z"
                    fill="#003255"
                  ></path>
                </g>
              </svg>
            </button>
          </div>

          {/* ✅ Input fichier caché */}
          <input
            type="file"
            id="file-upload"
            className="file-input"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* ℹ️ Infos sur les fichiers */}
          <p className="file-info">
            Fichiers acceptés : pdf, png, jpeg. Taille max : 5 Mo, 8 fichiers
            max.
          </p>
        </div>

        <div className="button-container">
          <button type="submit" className="submit-btn">
            ENVOYER MA DEMANDE
          </button>
          <button
            type="button"
            className="annuler-btn"
            onClick={() => window.history.back()}
          >
            ANNULER
          </button>
          {showModal && (
            <div className="modale-creer-demande">
              <div className="modale-creer-demande-card">
                <p className="titre-modale">Votre demande à été envoyée avec succès !</p>
                <p className="sous-titre-modale">Nous la traiterons dans les meilleurs delais.</p>
                <button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="btn-retour-accueil"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreerDemande;
