import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/Profil.css";
import Parametres from "../components/Parametres";
import { Container, Paper, Box, Typography, Button } from "@mui/material";

const API_URL = "http://localhost:5000";

const Profil = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [communeName, setCommuneName] = useState("");
  const [showParametres, setShowParametres] = useState(false);
  const fileInputRef = useRef(null);
  const [communes, setCommunes] = useState([]);

  useEffect(() => {
    const fetchCommuneName = async () => {
      try {
        if (!user?.commune) {
          setCommuneName("Aucune commune assignée");
          return;
        }

        if (user.commune.nom) {
          setCommuneName(user.commune.nom);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/communes/${user.commune._id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.nom) {
          setCommuneName(data.nom);
        } else {
          setCommuneName("Commune non trouvée");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du nom de la commune:",
          error
        );
        setCommuneName("Commune non trouvée");
      }
    };

    fetchCommuneName();
  }, [user?.commune]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/communes`, {
          credentials: "include",
        });
        const data = await response.json();
        setCommunes(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
    setError(null);
    setSuccess(false);
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image valide");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(`${API_URL}/api/auth/upload-photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      const updatedUser = { ...user, photoUrl: data.photoUrl };
      updateUser(updatedUser);
      setEditedUser(updatedUser);
      setSuccess(true);
      setError(null);

      await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          photoUrl: data.photoUrl,
        }),
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement de la photo:", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors du téléchargement de la photo"
      );
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: editedUser.nom,
          prenom: editedUser.prenom,
          email: editedUser.email,
        }),
      });

      const data = await response.json();
      updateUser(data);
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

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });
      // ... existing code ...
    } catch (error) {
      // ... existing code ...
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("prenom", prenom);
      formData.append("email", email);
      if (photo) {
        formData.append("photo", photo);
      }

      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      // ... existing code ...
    } catch (error) {
      // ... existing code ...
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/update-password`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      // ... existing code ...
    } catch (error) {
      // ... existing code ...
    }
  };

  if (!user) {
    return <div className="tag-loading">Chargement des informations...</div>;
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <div className="tag-profil-container">
          <div className="tag-profil-card">
            <h1>{isEditing ? "Modifier le profil" : "Profil"}</h1>
            <div className="tag-profil-header">
              <div
                className="tag-profil-image-container"
                onClick={handleImageClick}
              >
                <img
                  src={
                    editedUser?.photoUrl || user.photoUrl
                      ? editedUser?.photoUrl || user.photoUrl.startsWith("http")
                        ? editedUser?.photoUrl || user.photoUrl
                        : `http://localhost:5000${
                            editedUser?.photoUrl || user.photoUrl
                          }`
                      : "/default-avatar.png"
                  }
                  alt="Photo de profil"
                  className="tag-profil-image"
                />
                {isEditing && (
                  <div className="tag-profil-image-edit">
                    <i className="fas fa-camera"></i>
                    <span>Changer la photo</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </div>
              <div className="tag-profil-username">{`${
                editedUser?.prenom || user.prenom
              } ${editedUser?.nom || user.nom}`}</div>
              <div className="tag-profil-handle">{user.fonction}</div>
            </div>

            {error && <div className="tag-profil-error-message">{error}</div>}
            {success && (
              <div className="tag-profil-success-message">
                Modifications enregistrées avec succès !
              </div>
            )}

            <div className="tag-profil-info">
              {!isEditing ? (
                <>
                  <div className="tag-profil-info-group">
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>
                  <div className="tag-profil-info-group">
                    <label>Commune</label>
                    <p>{communeName || "Chargement..."}</p>
                  </div>
                  <div className="tag-profil-info-group">
                    <label>Fonction</label>
                    <p>{user.fonction}</p>
                  </div>
                  <div className="tag-profil-info-group">
                    <label>Permissions</label>
                    <p>{user.permissions}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="tag-profil-info-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      value={editedUser.nom}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, nom: e.target.value })
                      }
                    />
                  </div>
                  <div className="tag-profil-info-group">
                    <label>Prénom</label>
                    <input
                      type="text"
                      value={editedUser.prenom}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, prenom: e.target.value })
                      }
                    />
                  </div>
                  <div className="tag-profil-info-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="tag-profil-info-group">
                    <label>Commune</label>
                    <select
                      value={editedUser.commune}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          commune: e.target.value,
                        })
                      }
                      className="tag-profil-select"
                    >
                      {communes.map((commune) => (
                        <option key={commune._id} value={commune._id}>
                          {commune.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {!isEditing ? (
              <div className="tag-profil-menu">
                <button className="tag-profil-edit-btn" onClick={handleEdit}>
                  <i className="fas fa-edit"></i>
                  Modifier le profil
                </button>
                <button
                  className="tag-profil-parametres-btn"
                  onClick={() => setShowParametres(!showParametres)}
                >
                  <i className="fas fa-cog"></i>
                  {showParametres ? "Masquer les paramètres" : "Paramètres"}
                </button>
                <button
                  className="tag-profil-logout-btn"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Se déconnecter
                </button>
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

            {showParametres && <Parametres />}
          </div>
        </div>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Liens utiles
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/politique-confidentialite"
            sx={{ mr: 2 }}
          >
            Politique de confidentialité
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/parametres-rgpd"
          >
            Paramètres RGPD
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profil;
