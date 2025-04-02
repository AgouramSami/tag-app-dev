import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminPanel.css";
import ModalSubmit from "../components/ModalSubmit";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false); // ✅ Gère l'affichage de la modal
  const [showPassword, setShowPassword] = useState(false); // ✅ État pour afficher/cacher le mdp
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitType, setSubmitType] = useState("success");

  const [communes, setCommunes] = useState([]); // ✅ Stocke les communes depuis la BDD
  const [fonctions, setFonctions] = useState([]); // ✅ Stocke les fonctions depuis la BDD

  const [newUser, setNewUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    fonction: "",
    commune: "",
    telephone: "",
    permissions: "user",
    isValidated: false,
  });

  useEffect(() => {
    fetchUsers();
    fetchCommunes();
    fetchFonctions();
  }, []);

  const fetchUsers = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      setError("Erreur lors du chargement des utilisateurs.");
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
    const token = sessionStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:5000/api/admin/toggle-validation/${userId}`,
        { isValidated: !isValidated },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
      setSubmitMessage("Erreur lors de la mise à jour du statut.");
      setSubmitType("error");
      setShowSubmitModal(true);
      console.error("Erreur de mise à jour :", err);
    }
  };

  const handleDelete = async (userId) => {
    const token = sessionStorage.getItem("token");

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
      setSubmitMessage("Erreur lors de la suppression de l'utilisateur.");
      setSubmitType("error");
      setShowSubmitModal(true);
      console.error("Erreur de suppression :", err);
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
    const { name, value, type, checked } = e.target;
    setNewUser({ ...newUser, [name]: type === "checkbox" ? checked : value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/create-user",
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubmitMessage("Utilisateur créé avec succès !");
      setSubmitType("success");
      setShowSubmitModal(true);
      setUsers([...users, res.data.user]);
      setShowModal(false);
      setNewUser({
        nom: "",
        prenom: "",
        email: "",
        fonction: "",
        commune: "",
        telephone: "",
        permissions: "user",
        isValidated: false,
      });
    } catch (error) {
      setSubmitMessage(
        error.response?.data?.message ||
          "Erreur lors de la création de l'utilisateur."
      );
      setSubmitType("error");
      setShowSubmitModal(true);
    }
  };

  const handleOpenModal = async () => {
    setShowModal(true);
    try {
      const [communeRes, fonctionRes] = await Promise.all([
        axios.get("http://localhost:5000/api/communes"),
        axios.get("http://localhost:5000/api/fonctions"),
      ]);

      setCommunes(communeRes.data);
      setFonctions(fonctionRes.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="title-admin">Panneau d'administration</h1>

      <div className="top">
        <div className="search-container">
          <label htmlFor="searchUsers" className="search-label"></label>
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>

        <button className="add-user-btn" onClick={handleOpenModal}>
          Ajouter un utilisateur
        </button>
      </div>

      {/* ✅ Modal pour le formulaire */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <h2>Créer un nouvel utilisateur</h2>

            <form onSubmit={handleCreateUser} className="create-user-form">
              <label>Nom :</label>
              <input
                type="text"
                name="nom"
                value={newUser.nom}
                onChange={handleInputChange}
              />

              <label>Prénom :</label>
              <input
                type="text"
                name="prenom"
                value={newUser.prenom}
                onChange={handleInputChange}
              />

              <label>Email :</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
              />

              <label>Fonction :</label>
              <select
                name="fonction"
                value={newUser.fonction}
                onChange={handleInputChange}
              >
                <option value="">Sélectionner une fonction</option>
                {fonctions.length === 0 ? (
                  <option disabled>Chargement...</option>
                ) : (
                  fonctions.map((fonction) => (
                    <option key={fonction._id} value={fonction.nom}>
                      {fonction.nom}
                    </option>
                  ))
                )}
              </select>

              <label>Commune :</label>
              <select
                name="commune"
                value={newUser.commune}
                onChange={handleInputChange}
              >
                <option value="">Sélectionner une commune</option>
                {communes.length === 0 ? (
                  <option disabled>Chargement...</option>
                ) : (
                  communes.map((commune) => (
                    <option key={commune._id} value={commune._id}>
                      {commune.nom}
                    </option>
                  ))
                )}
              </select>

              <label>Permissions :</label>
              <select
                name="permissions"
                value={newUser.permissions}
                onChange={handleInputChange}
              >
                <option value="user">Utilisateur</option>
                <option value="juriste">Juriste</option>
                <option value="admin">Administrateur</option>
              </select>

              <button className="button1" type="submit">
                Créer l'utilisateur
              </button>
            </form>
          </div>
        </div>
      )}

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
                  onClick={() => toggleValidation(user._id, user.isValidated)}
                >
                  {user.isValidated ? "✅" : "❌"}
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
