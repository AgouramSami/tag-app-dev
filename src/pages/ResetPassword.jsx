import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../styles/ResetPassword.css";
import tagLogo from "../assets/tag_logo.svg";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          token,
          newPassword,
        }
      );

      setMessage(response.data.message);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
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

          <p>
            Retour à la <Link to="/login">connexion</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
