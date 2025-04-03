import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/ForgotPassword.css";

const API_URL = "http://localhost:5000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi de l'email");
      }

      setMessage(data.message);
      setEmail("");
    } catch (error) {
      console.error("Erreur:", error);
      setError(
        error.message || "Une erreur est survenue lors de l'envoi de l'email"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="logo-container">
          <img src="src/assets/tag_logo.svg" alt="TAG Logo" className="logo" />
        </div>

        <form onSubmit={handleSubmit}>
          <label className="label_signup">Entrez votre email</label>
          <input
            className="input_signup"
            type="email"
            placeholder="john.doe@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="signup-btn" type="submit" disabled={loading}>
            {loading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
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

export default ForgotPassword;
