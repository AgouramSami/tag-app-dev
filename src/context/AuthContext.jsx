import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const API_URL = "http://localhost:5000";

const AuthContext = createContext(null);

// Liste des routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // Ne pas vérifier l'authentification sur les routes publiques
      if (publicRoutes.includes(location.pathname)) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          // Si l'utilisateur n'est pas authentifié et n'est pas sur une route publique
          setUser(null);
          setIsAuthenticated(false);
          if (!publicRoutes.includes(location.pathname)) {
            navigate("/login");
          }
          return;
        }

        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // En cas d'erreur, on considère que l'utilisateur n'est pas authentifié
        setUser(null);
        setIsAuthenticated(false);
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

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

  const login = async (userData) => {
    try {
      setUser(userData.user);
      setIsAuthenticated(true);

      // Redirection selon le rôle
      switch (userData.user.permissions) {
        case "admin":
          navigate("/admin");
          break;
        case "juriste":
          navigate("/juriste");
          break;
        case "user":
          navigate("/dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la déconnexion");
      }

      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const checkAccess = (requiredPermission) => {
    if (!isAuthenticated) return false;
    if (requiredPermission === "user") return true;
    if (Array.isArray(requiredPermission)) {
      return requiredPermission.includes(user?.permissions);
    }
    return user?.permissions === requiredPermission;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAccess,
    getDefaultRoute,
    updateUser,
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

export default AuthContext;
