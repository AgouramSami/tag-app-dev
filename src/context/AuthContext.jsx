import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * URL de base de l'API
 * À déplacer dans un fichier .env en production
 */
const API_URL = "http://localhost:5000";

/**
 * Création du contexte d'authentification
 * Sera utilisé pour partager l'état d'authentification dans toute l'application
 */
const AuthContext = createContext(null);

/**
 * Liste des routes accessibles sans authentification
 * Toutes les routes commençant par ces chemins seront considérées comme publiques
 */
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password", // Inclut /reset-password/:token
];

/**
 * Composant Provider pour gérer l'authentification
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Les composants enfants
 */
export const AuthProvider = ({ children }) => {
  // États pour gérer l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hooks de navigation
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Effet pour vérifier l'état d'authentification
   * S'exécute à chaque changement de route
   */
  useEffect(() => {
    const checkAuth = async () => {
      // Vérifie si la route actuelle est publique
      const isPublicRoute = publicRoutes.some((route) =>
        location.pathname.startsWith(route)
      );

      // Si c'est une route publique, pas besoin de vérifier l'auth
      if (isPublicRoute) {
        setLoading(false);
        return;
      }

      try {
        // Appel à l'API pour vérifier l'authentification
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include", // Inclut les cookies dans la requête
        });

        if (!response.ok) {
          // Si non authentifié, réinitialiser l'état et rediriger
          setUser(null);
          setIsAuthenticated(false);
          navigate("/login");
          return;
        }

        // Si authentifié, mettre à jour l'état
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error
        );
        setUser(null);
        setIsAuthenticated(false);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  /**
   * Détermine la route par défaut selon les permissions de l'utilisateur
   * @param {string} permissions - Les permissions à vérifier (optionnel)
   * @returns {string} La route par défaut
   */
  const getDefaultRoute = (permissions) => {
    const currentPermissions = permissions || user?.permissions;
    switch (currentPermissions) {
      case "admin":
        return "/admin";
      case "juriste":
        return "/juriste";
      case "user":
      default:
        return "/dashboard";
    }
  };

  /**
   * Gère la connexion de l'utilisateur
   * @param {Object} userData - Les données de l'utilisateur
   */
  const login = async (userData) => {
    try {
      setUser(userData.user);
      setIsAuthenticated(true);

      // Redirection basée sur le rôle
      const defaultRoute = getDefaultRoute(userData.user.permissions);
      navigate(defaultRoute);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  };

  /**
   * Gère la déconnexion de l'utilisateur
   */
  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la déconnexion");
      }

      // Réinitialisation de l'état
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  /**
   * Met à jour les informations de l'utilisateur
   * @param {Object} updatedUser - Les nouvelles données utilisateur
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  /**
   * Vérifie si l'utilisateur a les permissions requises
   * @param {string|string[]} requiredPermission - La/les permission(s) requise(s)
   * @returns {boolean} True si l'utilisateur a les permissions
   */
  const checkAccess = (requiredPermission) => {
    if (!isAuthenticated) return false;
    if (requiredPermission === "user") return true;
    if (Array.isArray(requiredPermission)) {
      return requiredPermission.includes(user?.permissions);
    }
    return user?.permissions === requiredPermission;
  };

  // Valeurs exposées par le contexte
  const contextValue = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAccess,
    getDefaultRoute,
    updateUser,
  };

  // Affichage d'un loader pendant la vérification
  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Validation des props avec PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 * @returns {Object} Le contexte d'authentification
 * @throws {Error} Si utilisé en dehors d'un AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

export default AuthContext;
