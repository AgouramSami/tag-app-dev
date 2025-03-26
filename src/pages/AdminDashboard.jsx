import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Tableau de bord Administrateur</h1>
      <div className="admin-grid">
        {/* Statistiques */}
        <div className="admin-card">
          <h2>Statistiques</h2>
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-value">150</div>
              <div className="stat-label">Utilisateurs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">45</div>
              <div className="stat-label">Demandes en cours</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">89%</div>
              <div className="stat-label">Taux de satisfaction</div>
            </div>
          </div>
        </div>

        {/* Gestion des utilisateurs */}
        <div className="admin-card">
          <h2>Gestion des utilisateurs</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>Juriste</td>
                <td>
                  <button className="action-button edit-button">
                    Modifier
                  </button>
                  <button className="action-button delete-button">
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Gestion des demandes */}
        <div className="admin-card">
          <h2>Gestion des demandes</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#12345</td>
                <td>En attente</td>
                <td>
                  <button className="action-button edit-button">Voir</button>
                  <button className="action-button delete-button">
                    Archiver
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
