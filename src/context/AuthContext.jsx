import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = () => {
      const storedToken = sessionStorage.getItem("token");
      const storedUser = JSON.parse(sessionStorage.getItem("user"));

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const getDefaultRoute = (permissions) => {
    const currentPermissions = permissions || user?.permissions;
    switch (currentPermissions) {
      case "admin":
        return "/admin/dashboard";
      case "juriste":
        return "/juriste";
      case "user":
      default:
        return "/dashboard";
    }
  };

  const login = async (userData) => {
    try {
      const newToken = userData.token;
      const newUser = userData.user;

      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("user", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);

      // Redirection selon le rôle
      switch (newUser.permissions) {
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

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const updateUser = (updatedUser) => {
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
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
    token,
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
