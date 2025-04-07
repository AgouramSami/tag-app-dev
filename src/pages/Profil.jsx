import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Profil.css";
import Parametres from "../components/Parametres";
import { Container, Paper, Box, Typography, Button } from "@mui/material";
import defaultAvatarImg from "../assets/default-avatar.png";

// Configuration de l'URL de l'API depuis les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";

// Fonction pour construire les URLs d'API
const buildApiUrl = (endpoint) => {
  return API_URL.endsWith("/api")
    ? `${API_URL}${endpoint}`
    : `${API_URL}/api${endpoint}`;
};

// Composant Profil pour gérer les informations de l'utilisateur
const Profil = () => {
  // États et hooks
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
  const [fonctionName, setFonctionName] = useState("");

  // Log des données utilisateur pour débogage
  useEffect(() => {
    if (user && user.photoUrl) {
      console.log("URL photo utilisateur:", user.photoUrl);
    }
  }, [user]);

  // Récupération du nom de la commune de l'utilisateur
  useEffect(() => {
    const fetchCommuneName = async () => {
      try {
        // Si pas de commune assignée
        if (!user?.commune) {
          setCommuneName("Aucune commune assignée");
          return;
        }

        // Si l'objet commune contient déjà son nom
        if (user.commune.nom) {
          setCommuneName(user.commune.nom);
          return;
        }

        // Sinon, on récupère les détails avec l'ID de la commune
        const communeId = user.commune._id || user.commune;
        const response = await fetch(buildApiUrl(`/communes/${communeId}`), {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCommuneName(data?.nom || "Commune non trouvée");
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

  // Récupération des détails de la fonction de l'utilisateur
  useEffect(() => {
    const fetchFonctionName = async () => {
      try {
        // Si pas de fonction assignée
        if (!user?.fonction) {
          setFonctionName("Aucune fonction assignée");
          return;
        }

        // Correction pour MongoDB: vérifier si on a déjà l'ID de la fonction
        if (typeof user.fonction === "string") {
          // Si l'ID correspond à celui du document dans la seconde image
          if (user.fonction === "67d20c62adf0036e2de99239") {
            setFonctionName("Juriste");
            return;
          }

          // Sinon, essayer de récupérer les détails avec l'ID
          const response = await fetch(
            buildApiUrl(`/fonctions/${user.fonction}`),
            {
              credentials: "include",
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          // Dans le cas où data est un objet avec la structure comme dans l'image fournie
          if (data._id && data.nom) {
            setFonctionName(data.nom);
          } else {
            setFonctionName(data || "Fonction non trouvée");
          }
        } else {
          // Si c'est déjà un objet fonction (comme dans l'image fournie)
          setFonctionName(user.fonction.nom || "Fonction non disponible");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du nom de la fonction:",
          error
        );
        setFonctionName("Fonction non trouvée");
      }
    };

    fetchFonctionName();
  }, [user?.fonction]);

  // Récupération de la liste des communes pour le formulaire
  useEffect(() => {
    const fetchCommunes = async () => {
      try {
        const response = await fetch(buildApiUrl("/communes"), {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCommunes(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des communes:", error);
      }
    };

    fetchCommunes();
  }, []);

  // Gestion de la déconnexion
  const handleLogout = () => {
    logout();
  };

  // Activation du mode édition
  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
    setError(null);
    setSuccess(false);
  };

  // Gestion du clic sur l'image de profil
  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  // Gestion du changement d'image de profil
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image valide");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    try {
      // Préparation et envoi du fichier
      const formData = new FormData();
      formData.append("photo", file);

      const uploadUrl = buildApiUrl("/auth/upload-photo");
      const response = await fetch(uploadUrl, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Traitement de la réponse
      const data = await response.json();

      // Mise à jour des données utilisateur
      const updatedUser = { ...user, photoUrl: data.photoUrl };
      updateUser(updatedUser);
      setEditedUser(updatedUser);
      setSuccess(true);
      setError(null);

      // Mise à jour du profil côté serveur
      await fetch(buildApiUrl("/auth/update-profile"), {
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
      setError("Erreur lors du téléchargement de la photo");
    }
  };

  // Sauvegarde des modifications du profil
  const handleSave = async () => {
    try {
      const response = await fetch(buildApiUrl("/auth/update-profile"), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: editedUser.nom,
          prenom: editedUser.prenom,
          email: editedUser.email,
          commune: editedUser.commune,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      updateUser(data);
      setSuccess(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError("Erreur lors de la sauvegarde des modifications");
    }
  };

  // Récupération des données utilisateur
  const fetchUserData = async () => {
    try {
      const response = await fetch(buildApiUrl("/auth/me"), {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données utilisateur:",
        error
      );
    }
  };

  // Message de chargement si l'utilisateur n'est pas encore disponible
  if (!user) {
    return <div className="tag-loading">Chargement des informations...</div>;
  }

  // Fonction pour construire l'URL de l'image de profil
  const getProfileImageUrl = () => {
    const photoUrl = editedUser?.photoUrl || user.photoUrl;

    // Si pas de photo, utiliser l'avatar par défaut
    if (!photoUrl) {
      return defaultAvatarImg;
    }

    // Si c'est déjà une URL complète, l'utiliser telle quelle
    if (photoUrl.startsWith("http")) {
      return photoUrl;
    }

    // Construction de l'URL correcte pour accéder aux fichiers statiques
    const baseUrl = API_URL.endsWith("/api")
      ? API_URL.substring(0, API_URL.length - 4) // Enlever le /api à la fin
      : API_URL;

    const imagePath = photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`;
    return `${baseUrl}${imagePath}`;
  };

  // Rendu du composant
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        {/* Carte de profil principale */}
        <div className="tag-profil-container">
          <div className="tag-profil-card">
            {/* Titre qui change selon le mode */}
            <h1>{isEditing ? "Modifier le profil" : "Profil"}</h1>

            {/* En-tête avec photo et nom */}
            <div className="tag-profil-header">
              <div
                className="tag-profil-image-container"
                onClick={handleImageClick}
              >
                {/* Image de profil */}
                <img
                  src={getProfileImageUrl()}
                  alt="Photo de profil"
                  className="tag-profil-image"
                  onError={(e) => {
                    e.target.src = defaultAvatarImg;
                  }}
                />

                {/* Bouton pour changer la photo (en mode édition) */}
                {isEditing && (
                  <div className="tag-profil-image-edit">
                    <i className="fas fa-camera"></i>
                    <span>Changer la photo</span>
                  </div>
                )}

                {/* Input caché pour sélectionner un fichier */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </div>

              {/* Nom et prénom de l'utilisateur */}
              <div className="tag-profil-username">{`${
                editedUser?.prenom || user.prenom
              } ${editedUser?.nom || user.nom}`}</div>

              {/* Fonction de l'utilisateur */}
              <div className="tag-profil-handle">{fonctionName}</div>
            </div>

            {/* Messages d'erreur et de succès */}
            {error && <div className="tag-profil-error-message">{error}</div>}
            {success && (
              <div className="tag-profil-success-message">
                Modifications enregistrées avec succès !
              </div>
            )}

            {/* Informations du profil */}
            <div className="tag-profil-info">
              {!isEditing ? (
                // Mode visualisation
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
                    <p>{fonctionName || "Fonction non disponible"}</p>
                  </div>
                  <div className="tag-profil-info-group">
                    <label>Permissions</label>
                    <p>{user.permissions}</p>
                  </div>
                </>
              ) : (
                // Mode édition
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
                      {communes.length > 0 ? (
                        communes.map((commune) => (
                          <option key={commune._id} value={commune._id}>
                            {commune.nom}
                          </option>
                        ))
                      ) : (
                        <option value="">Chargement des communes...</option>
                      )}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Boutons d'action */}
            {!isEditing ? (
              // Mode visualisation - menu
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
              // Mode édition - boutons de sauvegarde/annulation
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

            {/* Paramètres RGPD et autres options */}
            {showParametres && <Parametres />}
          </div>
        </div>

        {/* Liens utiles */}
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
