import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../styles/StatistiquesSatisfaction.css";

const StatistiquesSatisfaction = () => {
  const [statistiques, setStatistiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistiques = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/demandes/stats/satisfaction",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }
        const data = await response.json();
        setStatistiques(data);
      } catch (err) {
        setError(err.message);
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistiques();
  }, []);

  if (loading) {
    return <div className="tag-loading">Chargement des statistiques...</div>;
  }

  if (error) {
    return <div className="tag-error">{error}</div>;
  }

  return (
    <div className="tag-stats-container">
      <h2 className="tag-stats-title">
        Statistiques de satisfaction par strate de commune
      </h2>

      <div className="tag-stats-grid">
        {statistiques.map((stat) => (
          <div key={stat.strate._id} className="tag-stats-card">
            <h3 className="tag-strate-title">{stat.strate.nom}</h3>
            <div className="tag-stats-content">
              <div className="tag-stats-item">
                <span className="tag-stats-label">Total des demandes :</span>
                <span className="tag-stats-value">{stat.totalDemandes}</span>
              </div>
              <div className="tag-stats-item">
                <span className="tag-stats-label">Note moyenne :</span>
                <span className="tag-stats-value">
                  {stat.noteMoyenne.toFixed(1)} / 5
                </span>
              </div>
              <div className="tag-stats-item">
                <span className="tag-stats-label">Taux de satisfaction :</span>
                <span className="tag-stats-value">
                  {(
                    ((stat.distribution[4] + stat.distribution[5]) /
                      stat.totalDemandes) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="tag-stars-distribution">
                <h4>Distribution des notes :</h4>
                {[1, 2, 3, 4, 5].map((note) => (
                  <div key={note} className="tag-star-bar">
                    <span className="tag-star-label">
                      {note} étoile{note > 1 ? "s" : ""} :
                    </span>
                    <span className="tag-star-count">
                      {stat.distribution[note] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatistiquesSatisfaction;
