import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      setMessage(response.data.message);
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue. Veuillez réessayer."
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
