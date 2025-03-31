import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/Profil.css";

const Profil = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Récupérer les infos de l'utilisateur depuis le stockage
  const user = JSON.parse(sessionStorage.getItem("user"));

  const handleLogout = () => {
    logout();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        {
          nom: editedUser.nom,
          prenom: editedUser.prenom,
          email: editedUser.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Mettre à jour les informations dans le sessionStorage
      sessionStorage.setItem("user", JSON.stringify(response.data));
      setSuccess(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors de la sauvegarde des modifications"
      );
    }
  };

  if (!user) {
    return <div className="tag-loading">Chargement des informations...</div>;
  }

  return (
    <div className="tag-profil-container">
      <div className="tag-profil-card">
        <div className="tag-profil-header">
          <h1>{isEditing ? "Modifier le profil" : "Profil"}</h1>
          <div className="tag-profile-image-container">
            <img
              src={user.photoUrl || "https://via.placeholder.com/150"}
              alt="Photo de profil"
              className="tag-profile-image"
            />
            {isEditing && (
              <div className="tag-profile-image-edit">
                <i className="fas fa-camera"></i>
              </div>
            )}
          </div>
          <div className="tag-profile-username">{`${user.prenom} ${user.nom}`}</div>
          <div className="tag-profile-handle">@{user.commune}</div>
          {!isEditing && (
            <button className="tag-profil-edit-btn" onClick={handleEdit}>
              Modifier le profil
            </button>
          )}
        </div>

        {error && <div className="tag-profil-error-message">{error}</div>}
        {success && (
          <div className="tag-profil-success-message">
            Modifications enregistrées avec succès !
          </div>
        )}

        <div className="tag-profil-info">
          <div className="tag-profil-info-group">
            <label>Nom</label>
            {isEditing ? (
              <input
                type="text"
                value={editedUser.nom}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, nom: e.target.value })
                }
              />
            ) : (
              <p>{user.nom}</p>
            )}
          </div>

          <div className="tag-profil-info-group">
            <label>Prénom</label>
            {isEditing ? (
              <input
                type="text"
                value={editedUser.prenom}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, prenom: e.target.value })
                }
              />
            ) : (
              <p>{user.prenom}</p>
            )}
          </div>

          <div className="tag-profil-info-group">
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                value={editedUser.email}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, email: e.target.value })
                }
              />
            ) : (
              <p>{user.email}</p>
            )}
          </div>

          <div className="tag-profil-info-group">
            <label>Fonction</label>
            <p>{user.fonction}</p>
          </div>

          <div className="tag-profil-info-group">
            <label>Commune</label>
            <p>{user.commune}</p>
          </div>

          <div className="tag-profil-info-group">
            <label>Permissions</label>
            <p>{user.permissions}</p>
          </div>
        </div>

        {!isEditing ? (
          <div className="tag-profil-menu">
            <div className="tag-profil-menu-item">
              <i className="fas fa-cog"></i>
              Paramètres
            </div>
            <div className="tag-profil-menu-item">
              <i className="fas fa-credit-card"></i>
              Détails de facturation
            </div>
            <div className="tag-profil-menu-item">
              <i className="fas fa-users"></i>
              Gestion des utilisateurs
            </div>
            <div className="tag-profil-menu-item">
              <i className="fas fa-info-circle"></i>
              Informations
            </div>
            <div className="tag-profil-menu-item logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Se déconnecter
            </div>
          </div>
        ) : (
          <div className="tag-profil-actions">
            <button className="tag-profil-save-btn" onClick={handleSave}>
              Enregistrer
            </button>
            <button
              className="tag-profil-cancel-btn"
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profil;
