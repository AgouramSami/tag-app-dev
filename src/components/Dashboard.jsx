import React from "react";
import PropTypes from "prop-types";
import StatistiquesSatisfaction from "./StatistiquesSatisfaction";
import "../styles/Dashboard.css";

const Dashboard = ({ user }) => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Tableau de bord administrateur</h1>

      {/* Section des statistiques de satisfaction */}
      <section className="dashboard-section">
        <h2 className="section-title">Statistiques de satisfaction</h2>
        <StatistiquesSatisfaction />
      </section>

      {/* Autres sections du tableau de bord à venir */}
    </div>
  );
};

Dashboard.propTypes = {
  user: PropTypes.shape({
    nom: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
};

export default Dashboard;
