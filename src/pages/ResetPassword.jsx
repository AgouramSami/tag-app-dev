import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ResetPassword.css"; // Ajoute un fichier de style

const ResetPassword = () => {
  const { token } = useParams(); // Récupère le token depuis l'URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          token,
          newPassword,
        }
      );

      setMessage(res.data.message);
      setError("");
      setTimeout(() => navigate("/login"), 3000); // Redirection après 3 sec
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur.");
    }
  };

  return (
    <div className="reset-password-container">
      <h2>🔑 Réinitialiser mon mot de passe</h2>
      {message ? (
        <p className="success-message">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="reset-password-form">
          <label>Nouveau mot de passe :</label>
          <input
            type="password"
            placeholder="Entrez un nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label>Confirmer le mot de passe :</label>
          <input
            type="password"
            placeholder="Confirmez votre mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button className="button1" type="submit">
            🔒 Mettre à jour
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
