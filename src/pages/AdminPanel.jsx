import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPanel.css";
import ModalSubmit from "../components/ModalSubmit";
import AddUserModal from "../components/AddUserModal";
import SearchFilter from "../components/SearchFilter";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitType, setSubmitType] = useState("success");
  const [communes, setCommunes] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [newUser, setNewUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    fonction: "",
    commune: "",
    telephone: "",
    permissions: "user",
    isValidated: true,
  });

  useEffect(() => {
    console.log("Chargement des données...");
    fetchUsers();
    fetchCommunes();
    fetchFonctions();
  }, []);

  const checkAuth = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return false;
    }
    return token;
  };

  const fetchUsers = async () => {
    const token = checkAuth();
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        sessionStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Erreur lors du chargement des utilisateurs.");
      }
    }
  };

  const fetchCommunes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/communes");
      setCommunes(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des communes", error);
    }
  };

  const fetchFonctions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fonctions");
      setFonctions(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des fonctions", error);
    }
  };

  const toggleValidation = async (userId, isValidated) => {
    const token = checkAuth();
    if (!token) return;

    if (!userId) {
      console.error("ID utilisateur manquant");
      setSubmitMessage("Erreur : ID utilisateur manquant");
      setSubmitType("error");
      setShowSubmitModal(true);
      return;
    }

    console.log("Tentative de mise à jour pour l'utilisateur:", userId);
    console.log("État actuel:", isValidated);

    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/toggle-validation/${userId}`,
        { isValidated: !isValidated },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Réponse du serveur:", res.data);

      setSubmitMessage(
        `Utilisateur ${isValidated ? "désactivé" : "activé"} avec succès !`
      );
      setSubmitType("success");
      setShowSubmitModal(true);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, isValidated: !user.isValidated }
            : user
        )
      );
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("token");
        navigate("/login");
      } else {
        setSubmitMessage("Erreur lors de la mise à jour du statut.");
        setSubmitType("error");
        setShowSubmitModal(true);
      }
    }
  };

  const handleDelete = async (userId) => {
    const token = checkAuth();
    if (!token) return;

    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubmitMessage("Utilisateur supprimé avec succès !");
      setSubmitType("success");
      setShowSubmitModal(true);
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("token");
        navigate("/login");
      } else {
        setSubmitMessage("Erreur lors de la suppression de l'utilisateur.");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = checkAuth();
    if (!token) return;

    // Vérifier que tous les champs requis sont remplis
    if (
      !newUser.nom ||
      !newUser.prenom ||
      !newUser.email ||
      !newUser.fonction ||
      !newUser.commune ||
      !newUser.telephone
    ) {
      setSubmitMessage("Veuillez remplir tous les champs obligatoires.");
      setSubmitType("error");
      setShowSubmitModal(true);
      return;
    }

    try {
      const userData = {
        ...newUser,
        isValidated: true, // Forcer à true
      };
      console.log("Envoi des données utilisateur:", userData);

      const res = await axios.post(
        "http://localhost:5000/api/admin/create-user",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Réponse du serveur:", res.data);

      if (res.data.user) {
        // S'assurer que l'utilisateur a toutes les propriétés nécessaires
        const newUserWithDefaults = {
          ...res.data.user,
          isValidated: true, // Forcer à true même si pas dans la réponse
        };
        console.log("Nouvel utilisateur à ajouter:", newUserWithDefaults);

        // Mettre à jour la liste des utilisateurs
        setUsers((prevUsers) => [...prevUsers, newUserWithDefaults]);

        // Rafraîchir la liste complète pour s'assurer d'avoir les données à jour
        fetchUsers();
      }

      setSubmitMessage(res.data.message || "Utilisateur créé avec succès !");
      setSubmitType("success");
      setShowSubmitModal(true);
      setShowModal(false);
      setNewUser({
        nom: "",
        prenom: "",
        email: "",
        fonction: "",
        commune: "",
        telephone: "",
        permissions: "user",
        isValidated: true,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la création :",
        error.response?.data || error
      );
      setSubmitMessage(
        error.response?.data?.message ||
          "Erreur lors de la création de l'utilisateur."
      );
      setSubmitType("error");
      setShowSubmitModal(true);
    }
  };

  const filterOptions = [
    { value: "tous", label: "Tous les statuts" },
    { value: "validated", label: "Validé" },
    { value: "not-validated", label: "Non validé" },
  ];

  const handleOpenModal = () => {
    setNewUser({
      nom: "",
      prenom: "",
      email: "",
      fonction: "",
      commune: "",
      telephone: "",
      permissions: "user",
      isValidated: true,
    });
    setShowModal(true);
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
                <td key={`name-${user._id}`}>
                  {user.nom} {user.prenom}
                </td>
                <td key={`email-${user._id}`}>{user.email}</td>
                <td key={`perm-${user._id}`}>{user.permissions}</td>
                <td
                  key={`status-${user._id}`}
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
                    toggleValidation(user._id, user.isValidated);
                  }}
                >
                  <span className="status-icon">
                    {user.isValidated ? "✅" : "❌"}
                  </span>
                </td>
                <td key={`action-${user._id}`}>
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
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        newUser={newUser}
        onInputChange={handleInputChange}
        onSubmit={handleCreateUser}
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
