import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/ResetPassword.css";
import tagLogo from "../assets/tag_logo.svg";

const API_URL = "http://localhost:5000";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Token de réinitialisation manquant");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de la réinitialisation du mot de passe"
        );
      }

      setMessage(data.message || "Mot de passe réinitialisé avec succès !");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Erreur:", error);
      setError(
        error.message ||
          "Une erreur est survenue lors de la réinitialisation du mot de passe"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="logo-container">
          <img src={tagLogo} alt="TAG Logo" className="logo" />
        </div>

        <h2 className="reset-title">Réinitialisation du mot de passe</h2>

        <form onSubmit={handleSubmit}>
          <label className="label_signup">Nouveau mot de passe</label>
          <input
            className="input_signup"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="********"
          />

          <label className="label_signup">Confirmer le mot de passe</label>
          <input
            className="input_signup"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="********"
          />

          <button className="button1" type="submit" disabled={loading}>
            {loading
              ? "Réinitialisation en cours..."
              : "Réinitialiser le mot de passe"}
          </button>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <Link to="/login" className="back-to-login">
            Retour à la connexion
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
