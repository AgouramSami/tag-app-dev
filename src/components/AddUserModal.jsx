import React from "react";
import "./AddUserModal.css";

const AddUserModal = ({
  isOpen,
  onClose,
  newUser,
  onInputChange,
  onSubmit,
  communes,
  fonctions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="add-user-modal-overlay" onClick={onClose}>
      <div
        className="add-user-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="add-user-modal-header">
          <h2>Ajouter un utilisateur</h2>
          <button className="add-user-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="add-user-form">
          <div className="add-user-form-group">
            <label htmlFor="nom">Nom</label>
            <input
              id="nom"
              type="text"
              name="nom"
              value={newUser.nom || ""}
              onChange={onInputChange}
              required
            />
          </div>
          <div className="add-user-form-group">
            <label htmlFor="prenom">Prénom</label>
            <input
              id="prenom"
              type="text"
              name="prenom"
              value={newUser.prenom || ""}
              onChange={onInputChange}
              required
            />
          </div>
          <div className="add-user-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={newUser.email || ""}
              onChange={onInputChange}
              required
            />
          </div>
          <div className="add-user-form-group">
            <label htmlFor="fonction">Fonction</label>
            <select
              id="fonction"
              name="fonction"
              value={newUser.fonction || ""}
              onChange={onInputChange}
              required
            >
              <option value="">Sélectionner une fonction</option>
              {fonctions &&
                fonctions.map((fonction) => (
                  <option key={fonction._id} value={fonction._id}>
                    {fonction.nom}
                  </option>
                ))}
            </select>
          </div>
          <div className="add-user-form-group">
            <label htmlFor="commune">Commune</label>
            <select
              id="commune"
              name="commune"
              value={newUser.commune || ""}
              onChange={onInputChange}
              required
            >
              <option value="">Sélectionner une commune</option>
              {communes &&
                communes.map((commune) => (
                  <option key={commune._id} value={commune._id}>
                    {commune.nom}
                  </option>
                ))}
            </select>
          </div>
          <div className="add-user-form-group">
            <label htmlFor="telephone">Téléphone</label>
            <input
              id="telephone"
              type="tel"
              name="telephone"
              value={newUser.telephone || ""}
              onChange={onInputChange}
              required
            />
          </div>
          <div className="add-user-form-group">
            <label htmlFor="permissions">Permissions</label>
            <select
              id="permissions"
              name="permissions"
              value={newUser.permissions || "user"}
              onChange={onInputChange}
              required
            >
              <option value="user">Utilisateur</option>
              <option value="juriste">Juriste</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <button type="submit" className="add-user-submit-btn">
            Créer l'utilisateur
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
