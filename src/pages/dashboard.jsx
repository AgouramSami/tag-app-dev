import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Statistiques from "./Statistiques";
import "../styles/dashboard.css";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <p className="tag-loading-text">Chargement...</p>;

  return (
    <div className="tag-dashboard-container">
      <h1 className="tag-dashboard-title">
        Bienvenue, {user.nom} {user.prenom} !
      </h1>
      <p className="tag-dashboard-subtitle">
        Vous êtes connecté en tant que{" "}
        {user.permissions === "admin"
          ? "Administrateur"
          : user.permissions === "juriste"
          ? "Juriste"
          : "Utilisateur"}
        .
      </p>

      {/* Dashboard spécifique selon le rôle */}
      {user.permissions === "admin" && (
        <div className="tag-admin-dashboard">
          <Statistiques />
        </div>
      )}

      {/* Autres sections du dashboard selon le rôle */}
      {user.permissions === "admin" ? (
        <div className="tag-dashboard-grid">
          <div
            className="tag-dashboard-card"
            onClick={() => navigate("/adminpanel")}
          >
            <h2>Gérer les utilisateurs</h2>
            <p>Validez, modifiez et supprimez les comptes.</p>
            <button className="tag-dashboard-btn">Accéder</button>
          </div>

          <div className="tag-dashboard-card">
            <h2>Statistiques</h2>
            <p>Analysez les demandes et l'activité des utilisateurs.</p>
            <button className="tag-dashboard-btn">Voir</button>
          </div>

          <div className="tag-dashboard-card">
            <h2>Paramètres</h2>
            <p>Gérez les configurations générales.</p>
            <button className="tag-dashboard-btn">Configurer</button>
          </div>
        </div>
      ) : (
        <div className="tag-dashboard-grid">
          <div
            className="tag-dashboard-card"
            onClick={() => navigate("/creer-demande")}
          >
            <h2>Créer une demande</h2>
            <p>Soumettez rapidement une nouvelle demande juridique.</p>
            <button className="tag-dashboard-btn">Créer</button>
          </div>

          <div
            className="tag-dashboard-card"
            onClick={() => navigate("/mes-demandes")}
          >
            <h2>Mes demandes</h2>
            <p>Consultez l'état de vos demandes et suivez leur évolution.</p>
            <button className="tag-dashboard-btn">Voir</button>
          </div>

          <div className="tag-dashboard-card" onClick={() => navigate("/faq")}>
            <h2>FAQ</h2>
            <p>Trouvez des réponses aux questions les plus courantes.</p>
            <button className="tag-dashboard-btn">Consulter</button>
          </div>

          <div
            className="tag-dashboard-card"
            onClick={() => navigate("/profil")}
          >
            <h2>Mon Profil</h2>
            <p>Modifiez vos informations personnelles et paramètres.</p>
            <button className="tag-dashboard-btn">Modifier</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
