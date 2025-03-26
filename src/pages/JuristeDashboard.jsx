import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/JuristeDashboard.css";

const JuristeDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="juriste-dashboard-container">
      <h1 className="dashboard-title">Tableau de bord Juriste</h1>

      <div className="dashboard-grid">
        {/* Section Suivi des demandes */}
        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-tasks"></i>
          </div>
          <h2>Suivi des demandes</h2>
          <p>Consultez et gérez les demandes qui vous sont assignées.</p>
          <button
            className="dashboard-btn"
            onClick={() => navigate("/juriste/demandes")}
          >
            Accéder
          </button>
        </div>

        {/* Section Statistiques */}
        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-chart-bar"></i>
          </div>
          <h2>Statistiques</h2>
          <p>
            Visualisez les statistiques de satisfaction par strate de commune.
          </p>
          <button
            className="dashboard-btn"
            onClick={() => navigate("/statistiques")}
          >
            Accéder
          </button>
        </div>

        {/* Section Profil */}
        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-user"></i>
          </div>
          <h2>Mon Profil</h2>
          <p>Gérez vos informations personnelles et vos préférences.</p>
          <button className="dashboard-btn" onClick={() => navigate("/profil")}>
            Accéder
          </button>
        </div>
      </div>
    </div>
  );
};

export default JuristeDashboard;
