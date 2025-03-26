import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = () => {
      const token = sessionStorage.getItem("token");
      const storedUser = JSON.parse(sessionStorage.getItem("user"));

      if (token && storedUser) {
        setIsAuthenticated(true);
        setUser(storedUser);
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
    sessionStorage.setItem("token", userData.token);
    sessionStorage.setItem("user", JSON.stringify(userData.user));
    setIsAuthenticated(true);
    setUser(userData.user);
    const redirectPath = getDefaultRoute(userData.user.permissions);
    navigate(redirectPath, { replace: true });
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login", { replace: true });
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
  };

  if (loading) {
    return <div>Chargement...</div>; // Vous pouvez remplacer par un composant de loading
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
