import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AddUserModal from "../components/AddUserModal";
import CreateUserModal from "../components/CreateUserModal";
import "../styles/AdminPanel.css";
import ModalSubmit from "../components/ModalSubmit";
import SearchFilter from "../components/SearchFilter";

const API_URL = "http://localhost:5000";

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    fonction: "",
    commune: "",
    telephone: "",
    permissions: "user",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitType, setSubmitType] = useState("success");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Chargement des données...");

        // Récupérer les communes
        const communesResponse = await fetch(`${API_URL}/api/communes`, {
          credentials: "include",
        });
        if (!communesResponse.ok) {
          throw new Error("Erreur lors de la récupération des communes");
        }
        const communesData = await communesResponse.json();
        setCommunes(communesData);

        // Récupérer les fonctions
        const fonctionsResponse = await fetch(`${API_URL}/api/fonctions`, {
          credentials: "include",
        });
        if (!fonctionsResponse.ok) {
          throw new Error("Erreur lors de la récupération des fonctions");
        }
        const fonctionsData = await fonctionsResponse.json();
        setFonctions(fonctionsData);

        // Récupérer les utilisateurs
        const usersResponse = await fetch(`${API_URL}/api/admin/users`, {
          credentials: "include",
        });
        if (!usersResponse.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs");
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Erreur:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Données utilisateur à envoyer:", newUser);
      const response = await fetch(`${API_URL}/api/admin/create-user`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la création de l'utilisateur"
        );
      }

      const data = await response.json();
      console.log("Réponse du serveur:", data); // Pour le débogage

      // Vérifier si l'utilisateur a été créé avec succès
      if (data.message === "Utilisateur créé et e-mail envoyé avec succès !") {
        // Récupérer la liste mise à jour des utilisateurs
        const usersResponse = await fetch(`${API_URL}/api/admin/users`, {
          credentials: "include",
        });
        if (!usersResponse.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs");
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);

        setShowAddUserModal(false);
        setNewUser({
          nom: "",
          prenom: "",
          email: "",
          fonction: "",
          commune: "",
          telephone: "",
          permissions: "user",
        });
        setSubmitMessage("Utilisateur créé avec succès !");
        setSubmitType("success");
        setShowSubmitModal(true);
      } else {
        throw new Error(
          data.message || "Erreur lors de la création de l'utilisateur"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message);
      setSubmitMessage("Erreur lors de la création de l'utilisateur");
      setSubmitType("error");
      setShowSubmitModal(true);
    }
  };

  const toggleValidation = async (userId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/toggle-validation/${userId}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la modification de la validation");
      }

      const data = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, isValidated: data.isValidated }
            : user
        )
      );
      setSubmitMessage(
        `Utilisateur ${data.isValidated ? "activé" : "désactivé"} avec succès !`
      );
      setSubmitType("success");
      setShowSubmitModal(true);
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message);
      setSubmitMessage("Erreur lors de la modification du statut");
      setSubmitType("error");
      setShowSubmitModal(true);
    }
  };

  const handleDelete = async (userId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        const response = await fetch(`${API_URL}/api/admin/delete/${userId}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(
            data.message || "Erreur lors de la suppression de l'utilisateur"
          );
        }

        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );
        setSubmitMessage("Utilisateur supprimé avec succès !");
        setSubmitType("success");
        setShowSubmitModal(true);
      } catch (error) {
        console.error("Erreur:", error);
        setError(error.message);
        setSubmitMessage("Erreur lors de la suppression de l'utilisateur");
        setSubmitType("error");
        setShowSubmitModal(true);
      }
    }
  };

  const sortUsers = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...users].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setUsers(sortedUsers);
  };

  const filteredUsers = users.filter((user) =>
    `${user.nom} ${user.prenom} ${user.email} ${user.permissions}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = () => {
    setNewUser({
      nom: "",
      prenom: "",
      email: "",
      fonction: "",
      commune: "",
      telephone: "",
      permissions: "user",
    });
    setShowAddUserModal(true);
  };

  return (
    <div className="admin-container">
      <div className="admin-panel-header">
        <div className="header-content">
          <h1 className="admin-title">Espace Administrateur</h1>
          <p className="admin-subtitle">
            Gérez les utilisateurs et leurs permissions
          </p>
        </div>
      </div>

      <div className="search-container">
        <div className="search-group">
          <label>Rechercher un utilisateur</label>
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-user-btn" onClick={handleOpenModal}>
          <i className="fas fa-plus"></i> Ajouter un utilisateur
        </button>
      </div>

      {error && <div className="error-container">{error}</div>}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => sortUsers("nom")}>
                Nom{" "}
                {sortConfig.key === "nom"
                  ? sortConfig.direction === "asc"
                    ? "⬆"
                    : "⬇"
                  : "⬍"}
              </th>
              <th className="sortable" onClick={() => sortUsers("email")}>
                Email{" "}
                {sortConfig.key === "email"
                  ? sortConfig.direction === "asc"
                    ? "⬆"
                    : "⬇"
                  : "⬍"}
              </th>
              <th className="sortable" onClick={() => sortUsers("permissions")}>
                Permissions{" "}
                {sortConfig.key === "permissions"
                  ? sortConfig.direction === "asc"
                    ? "⬆"
                    : "⬇"
                  : "⬍"}
              </th>
              <th className="sortable" onClick={() => sortUsers("isValidated")}>
                Statut{" "}
                {sortConfig.key === "isValidated"
                  ? sortConfig.direction === "asc"
                    ? "⬆"
                    : "⬇"
                  : "⬍"}
              </th>
              <th className="no-sort">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  {user.nom} {user.prenom}
                </td>
                <td>{user.email}</td>
                <td>{user.permissions}</td>
                <td
                  className={`status ${
                    user.isValidated ? "validated" : "not-validated"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!user._id) {
                      console.error("Pas d'ID pour l'utilisateur:", user);
                      return;
                    }
                    console.log("Toggle validation pour:", user);
                    toggleValidation(user._id);
                  }}
                >
                  <span className="status-icon">
                    {user.isValidated ? "✅" : "❌"}
                  </span>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(user._id)}
                  >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10 18a1 1 0 0 0 1-1v-6a1 1 0 0 0-2 0v6a1 1 0 0 0 1 1ZM20 6h-4V5a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3v1H4a1 1 0 0 0 0 2h1v11a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8h1a1 1 0 0 0 0-2ZM10 5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1h-4Zm7 14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8h10Zm-3-1a1 1 0 0 0 1-1v-6a1 1 0 0 0-2 0v6a1 1 0 0 0 1 1Z"
                        fill="#f3633f"
                      ></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        newUser={newUser}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        communes={communes}
        fonctions={fonctions}
      />

      <ModalSubmit
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        message={submitMessage}
        type={submitType}
      />
    </div>
  );
};

export default AdminPanel;
