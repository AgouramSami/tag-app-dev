import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Statistiques.css";

const Statistiques = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDemandes: 0,
    parStatut: [],
    parTheme: [],
    parStrate: [],
    parType: [],
    evolutionMensuelle: [],
    satisfaction: {
      globale: {
        totalDemandes: 0,
        noteMoyenneGlobale: 0,
      },
      parStrate: [],
      parTheme: [],
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsResponse, satisfactionResponse] = await Promise.all([
          fetch("http://localhost:5000/api/demandes/stats", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch("http://localhost:5000/api/demandes/stats/satisfaction", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        if (!statsResponse.ok || !satisfactionResponse.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }

        const [statsData, satisfactionData] = await Promise.all([
          statsResponse.json(),
          satisfactionResponse.json(),
        ]);

        setStats({
          ...statsData,
          satisfaction: satisfactionData,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="stats-loading">Chargement des statistiques...</div>;
  }

  if (error) {
    return <div className="stats-error">{error}</div>;
  }

  return (
    <div className="stats-container">
      <div className="stats-sections-container">
        {/* Section Statistiques Globales */}
        <section className="stats-section">
          <h2>Statistiques Globales</h2>
          <div className="stats-cards">
            <div className="stats-card">
              <h3>Total des demandes</h3>
              <p className="stats-number">{stats.totalDemandes}</p>
            </div>
            <div className="stats-card">
              <h3>Note moyenne globale</h3>
              <p className="stats-number">
                {stats.satisfaction.globale.noteMoyenneGlobale}
              </p>
            </div>
          </div>
        </section>

        {/* Section Répartition par Statut */}
        <section className="stats-section">
          <h2>Répartition par Statut</h2>
          <div className="stats-table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Nombre</th>
                  <th>Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {stats.parStatut.map((statut) => (
                  <tr key={statut.statut}>
                    <td>{statut.statut}</td>
                    <td>{statut.count}</td>
                    <td>
                      {((statut.count / stats.totalDemandes) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section Statistiques par Strate */}
        <section className="stats-section">
          <h2>Statistiques par Strate</h2>
          <div className="stats-table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Strate</th>
                  <th>Nombre de demandes</th>
                  <th>Note moyenne</th>
                </tr>
              </thead>
              <tbody>
                {stats.satisfaction.parStrate.map((strate) => (
                  <tr key={strate.strate}>
                    <td>{strate.strate}</td>
                    <td>{strate.totalDemandes}</td>
                    <td>{strate.noteMoyenne.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section Statistiques par Thème */}
        <section className="stats-section">
          <h2>Statistiques par Thème</h2>
          <div className="stats-table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Thème</th>
                  <th>Nombre de demandes</th>
                  <th>Note moyenne</th>
                </tr>
              </thead>
              <tbody>
                {stats.satisfaction.parTheme.map((theme) => (
                  <tr key={theme.theme}>
                    <td>{theme.theme}</td>
                    <td>{theme.totalDemandes}</td>
                    <td>{theme.noteMoyenne}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section Évolution Mensuelle */}
        <section className="stats-section">
          <h2>Évolution sur 12 mois</h2>
          <div className="stats-table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Mois</th>
                  <th>Nombre de demandes</th>
                </tr>
              </thead>
              <tbody>
                {stats.evolutionMensuelle.map((mois) => (
                  <tr key={mois.mois}>
                    <td>{mois.mois}</td>
                    <td>{mois.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Statistiques;
