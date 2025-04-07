import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/ResetPassword.css";
import tagLogo from "../assets/tag_logo.svg";

// Assurez-vous que l'URL se termine par /api
const BASE_URL =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";
const API_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Lien de réinitialisation invalide.");
        setVerifying(false);
        setTokenValid(false);
        return;
      }

      try {
        console.log("URL de l'API:", API_URL);
        console.log("Vérification du token:", token);
        const response = await fetch(
          `${API_URL}/auth/verify-reset-token/${token}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "omit", // Ne pas envoyer de cookies
          }
        );

        const data = await response.json();
        console.log("Réponse de vérification:", data);

        if (response.ok && data.valid) {
          console.log("Token validé avec succès");
          setTokenValid(true);
        } else {
          console.log("Token invalide:", data.message);
          setError(data.message || "Lien de réinitialisation invalide.");
          setTokenValid(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        setError("Une erreur est survenue lors de la vérification du lien.");
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

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
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "omit", // Ne pas envoyer de cookies
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Mot de passe réinitialisé avec succès !");
        setTimeout(() => {
          navigate("/login", {
            state: {
              successMessage:
                "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
            },
          });
        }, 2000);
      } else {
        setError(
          data.message || "Erreur lors de la réinitialisation du mot de passe"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError(
        "Une erreur est survenue lors de la réinitialisation du mot de passe"
      );
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="logo-container">
            <img src={tagLogo} alt="TAG Logo" className="logo" />
          </div>
          <h2 className="reset-title">Vérification du lien...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="logo-container">
            <img src={tagLogo} alt="TAG Logo" className="logo" />
          </div>
          <h2 className="reset-title">Erreur</h2>
          {error && <p className="error-message">{error}</p>}
          <Link to="/login" className="back-to-login">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

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
