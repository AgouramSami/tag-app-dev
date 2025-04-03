import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Parametres.css";

const API_URL = "http://localhost:5000";

const Parametres = () => {
  const { user, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) {
      try {
        const response = await fetch(`${API_URL}/api/auth/delete-account`, {
          method: "DELETE",
          credentials: "include",
        });
        setSuccess("Votre compte a été supprimé avec succès.");
        logout();
      } catch (error) {
        setError("Une erreur est survenue lors de la suppression du compte.");
      }
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/export-data`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'export des données");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "mes-donnees.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess("Vos données ont été exportées avec succès.");
    } catch (error) {
      setError("Une erreur est survenue lors de l'export de vos données.");
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/update-settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notifications,
          theme,
        }),
      });

      if (response.ok) {
        setSuccess("Paramètres mis à jour avec succès.");
      } else {
        setError("Erreur lors de la mise à jour des paramètres.");
      }
    } catch (error) {
      setError(
        "Une erreur est survenue lors de la mise à jour des paramètres."
      );
    }
  };

  return (
    <div className="tag-parametres-container">
      <h2>Paramètres du compte</h2>

      {error && <div className="tag-parametres-error">{error}</div>}
      {success && <div className="tag-parametres-success">{success}</div>}

      <section className="tag-parametres-section">
        <h3>Données personnelles</h3>
        <div className="tag-parametres-actions">
          <button onClick={handleExportData} className="tag-parametres-btn">
            <i className="fas fa-download"></i>
            Exporter mes données
          </button>
        </div>
      </section>

      <section className="tag-parametres-section">
        <h3>Politique de confidentialité</h3>
        <div className="tag-parametres-actions">
          <a href="/politique-confidentialite" className="tag-parametres-link">
            <i className="fas fa-shield-alt"></i>
            Consulter la politique de confidentialité
          </a>
        </div>
      </section>

      <section className="tag-parametres-section">
        <h3>Suppression du compte</h3>
        <div className="tag-parametres-actions">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="tag-parametres-btn tag-parametres-btn-danger"
            >
              <i className="fas fa-trash"></i>
              Supprimer mon compte
            </button>
          ) : (
            <div className="tag-parametres-confirm">
              <p>
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action
                est irréversible.
              </p>
              <div className="tag-parametres-confirm-actions">
                <button
                  onClick={handleDeleteAccount}
                  className="tag-parametres-btn tag-parametres-btn-danger"
                >
                  Confirmer la suppression
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="tag-parametres-btn"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Parametres;
