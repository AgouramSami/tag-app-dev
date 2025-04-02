import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/header.css";

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Cache le header sur les pages login et signup
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  console.log("Utilisateur du contexte:", user);
  console.log("Chemin actuel:", location.pathname);

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
    <header className="tag-header">
      <div className="logo-site"></div>
      <nav className="tag-nav">
        {/* Liens principaux */}
        <NavLink to={getHomeLink()} className="tag-nav-link" end>
          <i className="fas fa-home"></i>
          <span>Accueil</span>
        </NavLink>

        {/* Liens spécifiques aux utilisateurs normaux */}
        {user?.permissions === "user" && (
          <NavLink to="/mes-demandes" className="tag-nav-link">
            <i className="fas fa-list"></i>
            <span>Demandes</span>
          </NavLink>
        )}

        {/* Liens spécifiques aux juristes */}
        {user?.permissions === "juriste" && (
          <>
            <NavLink to="/juriste/demandes" className="tag-nav-link">
              <i className="fas fa-list"></i>
              <span>Demandes</span>
            </NavLink>
            <NavLink to="/statistiques" className="tag-nav-link">
              <i className="fas fa-chart-bar"></i>
              <span>Statistiques</span>
            </NavLink>
          </>
        )}

        {/* Liens spécifiques aux administrateurs */}
        {user?.permissions === "admin" && (
          <>
            <NavLink to="/admin/panel" className="tag-nav-link">
              <i className="fas fa-cog"></i>
              <span>Panel Admin</span>
            </NavLink>
            <NavLink to="/statistiques" className="tag-nav-link">
              <i className="fas fa-chart-bar"></i>
              <span>Statistiques</span>
            </NavLink>
          </>
        )}

        {/* Lien Créer demande au milieu */}
        {user?.permissions === "user" && (
          <NavLink to="/creer-demande" className="tag-nav-link">
            <i className="fas fa-plus-circle"></i>
            <span>Créer</span>
          </NavLink>
        )}

        {/* Liens utilitaires */}
        <NavLink to="/faq" className="tag-nav-link">
          <i className="fas fa-question-circle"></i>
          <span>FAQ</span>
        </NavLink>
        <NavLink to="/profil" className="tag-nav-link">
          <i className="fas fa-user"></i>
          <span>Profil</span>
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
