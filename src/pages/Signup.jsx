import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import communes from "../data/communes.json"; // Importer la liste des communes

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    fonction: "",
    commune: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Liste des fonctions disponibles (exclut "admin")
  const fonctions = [
    "Maire",
    "Conseiller municipal",
    "Employé de mairie",
    "Juriste",
    "Secrétaire",
  ];

  // Vérifier la complexité du mot de passe
  const isPasswordStrong = (password) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[-.@$!%*?&])[A-Za-z\d-.@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // Évaluer la force du mot de passe (score sur 4)
  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[-.@$!%*?&]/.test(password)) score++;
    return score;
  };

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Vérifie si le champ est vide
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value.trim() === "" ? "Ce champ est requis" : "",
    }));

    // Met à jour la force du mot de passe en temps réel
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }

    // Vérification dynamique des mots de passe
    if (name === "confirmPassword" || name === "password") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword:
          (name === "password" && value !== formData.confirmPassword) ||
          (name === "confirmPassword" && value !== formData.password)
            ? "Les mots de passe ne correspondent pas."
            : "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Réinitialise les erreurs

    let newErrors = {};

    // Vérifie chaque champ obligatoire
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = "Ce champ est requis";
      }
    });

    // Vérifie que le mot de passe est bien conforme
    if (!isPasswordStrong(formData.password)) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.";
    } else {
      console.log("✅ Mot de passe valide !");
    }

    // Vérifie la correspondance des mots de passe
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    // Afficher les erreurs en console pour voir ce qui se passe
    console.log("🛠 Erreurs détectées :", newErrors);

    // Si des erreurs existent, on les affiche
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Envoie les données si tout est valide
    try {
      console.log(
        "📤 Données envoyées au serveur :",
        JSON.stringify(formData, null, 2)
      );

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          password: formData.password,
          fonction: formData.fonction,
          commune: formData.commune,
          telephone: formData.telephone,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'inscription");
      }

      const data = await response.json();
      setIsSubmitted(true);
      navigate("/login");
    } catch (error) {
      console.error("🔴 Erreur lors de l'inscription :", error);
      setErrors({
        api:
          error.response?.data?.message ||
          "Une erreur est survenue lors de l'inscription",
      });
    }
  };

  return (
    <div className="tag-signup-container">
      <div className="tag-signup-card">
        <div className="tag-logo-container">
          <img
            src="src/assets/tag_logo.svg"
            alt="TAG Logo"
            className="tag-logo"
          />
        </div>

        {isSubmitted ? (
          <div className="tag-success-message">
            <p>Votre compte a été créé avec succès !</p>
            <p>Un administrateur doit valider votre compte avant connexion.</p>
            <Link to="/login" className="tag-login-link">
              Aller à la page de connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {["nom", "prenom", "email", "telephone"].map((field, index) => (
              <div key={index}>
                <label className="tag-label-signup">
                  {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                  <span className="required">*</span> :
                </label>
                <input
                  className="tag-input-signup"
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                />
                {errors[field] && (
                  <small className="tag-error-text">{errors[field]}</small>
                )}
              </div>
            ))}

            <label className="tag-label-signup">
              Fonction <span className="required">*</span> :
            </label>
            <select
              className="tag-input-signup"
              name="fonction"
              value={formData.fonction}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez votre fonction</option>
              {fonctions.map((fonction, index) => (
                <option key={index} value={fonction}>
                  {fonction}
                </option>
              ))}
            </select>

            <label className="tag-label-signup">
              Commune <span className="required">*</span> :
            </label>
            <select
              className="tag-input-signup"
              name="commune"
              value={formData.commune}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez votre commune</option>
              {communes.map((commune, index) => (
                <option key={index} value={commune}>
                  {commune}
                </option>
              ))}
            </select>

            <label className="tag-label-signup">
              Mot de passe <span className="required">*</span> :
            </label>
            <div className="tag-password-container">
              <input
                className="tag-input-signup"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="tag-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Cacher" : "Voir"}
              </button>
            </div>

            {/* Barre de force du mot de passe */}
            <div className="tag-password-strength">
              <div
                className={`tag-strength-bar tag-strength-${passwordStrength}`}
              ></div>
              <p className="tag-strength-text">
                {passwordStrength === 0 && "Faible"}
                {passwordStrength === 1 && "Moyen"}
                {passwordStrength === 2 && "Bon"}
                {passwordStrength >= 3 && "Fort"}
              </p>
            </div>

            <label className="tag-label-signup">
              Confirmer le mot de passe <span className="required">*</span> :
            </label>
            <div className="tag-password-container">
              <input
                className="tag-input-signup"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="tag-toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Cacher" : "Voir"}
              </button>
            </div>

            {errors.confirmPassword && (
              <small className="tag-error-text">{errors.confirmPassword}</small>
            )}

            <button type="submit" className="tag-signup-btn">
              S'INSCRIRE
            </button>

            {errors.api && <p className="tag-error-text">{errors.api}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
