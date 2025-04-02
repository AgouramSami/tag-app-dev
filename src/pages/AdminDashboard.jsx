import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard-container">
      <h1 className="dashboard-title">Tableau de bord Administrateur</h1>

      <div className="dashboard-grid">
        {/* Section Panel Admin */}
        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-users-cog"></i>
          </div>
          <h2>Panel Admin</h2>
          <p>
            Gérez les comptes, les rôles et les permissions des utilisateurs.
          </p>
          <button
            className="dashboard-btn"
            onClick={() => navigate("/admin/panel")}
          >
            Accéder
          </button>
        </div>

        {/* Section Statistiques */}
        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <h2>Statistiques</h2>
          <p>
            Visualisez les statistiques globales et les performances du système.
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
          <p>Gérez les questions fréquentes et les réponses du système.</p>
          <button className="dashboard-btn" onClick={() => navigate("/faq")}>
            Accéder
          </button>
        </div>

        {/* Section Profil */}
        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-user-shield"></i>
          </div>
          <h2>Mon Profil</h2>
          <p>
            Gérez vos informations personnelles et vos paramètres
            administrateur.
          </p>
          <button className="dashboard-btn" onClick={() => navigate("/profil")}>
            Accéder
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
