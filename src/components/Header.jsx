import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../styles/header.css";

const Header = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ✅ Récupère l'utilisateur depuis sessionStorage
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  // Cache le header sur les pages login et signup
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  const getHomeLink = () => {
    switch (user?.permissions) {
      case "admin":
        return "/admin";
      case "juriste":
        return "/juriste";
      case "user":
        return "/dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="header">
      <div className="logo-site"></div>
      <nav className="nav">
        {/* Liens communs à tous les utilisateurs */}
        <NavLink to={getHomeLink()} className="nav-link" end>
          Accueil
        </NavLink>
        <NavLink to="/profil" className="nav-link">
          Profil
        </NavLink>

        {/* Liens spécifiques aux utilisateurs normaux */}
        {user?.permissions === "user" && (
          <>
            <NavLink to="/creer-demande" className="nav-link">
              Créer
            </NavLink>
            <NavLink to="/mes-demandes" className="nav-link">
              Demandes
            </NavLink>
          </>
        )}

        {/* Liens spécifiques aux juristes */}
        {user?.permissions === "juriste" && (
          <>
            <NavLink to="/juriste/demandes" className="nav-link">
              Demandes
            </NavLink>
            <NavLink to="/statistiques" className="nav-link">
              Statistiques
            </NavLink>
          </>
        )}

        {/* Liens spécifiques aux administrateurs */}
        {user?.permissions === "admin" && (
          <>
            <NavLink to="/admin/panel" className="nav-link">
              Panel Admin
            </NavLink>
            <NavLink to="/statistiques" className="nav-link">
              Statistiques
            </NavLink>
          </>
        )}

        {/* Liens communs à tous les utilisateurs */}
        <NavLink to="/faq" className="nav-link">
          FAQ
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
