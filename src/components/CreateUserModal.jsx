import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/CreateUserModal.css";

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    role: "usager",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'utilisateur");
      }

      const data = await response.json();
      onUserCreated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Créer un nouvel utilisateur</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="prenom">Prénom</label>
            <input
              type="text"
              id="prenom"
              value={formData.prenom}
              onChange={(e) =>
                setFormData({ ...formData, prenom: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Rôle</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
            >
              <option value="usager">Usager</option>
              <option value="juriste">Juriste</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
