import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/JuristeDashboard.css";
import "../styles/common/PageTitle.css";

const JuristeDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Tableau de bord Juriste</h1>
          <p className="page-subtitle">
            Gérez les demandes et accédez à vos outils de travail
          </p>
        </div>
      </div>

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

        {/* Section FAQ */}
        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-question-circle"></i>
          </div>
          <h2>FAQ</h2>
          <p>Consultez et gérez les questions fréquentes.</p>
          <button className="dashboard-btn" onClick={() => navigate("/faq")}>
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
