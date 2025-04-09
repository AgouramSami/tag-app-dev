import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CardDemande from "../components/CardDemande";
import ConsulterDemande from "./ConsulterDemande";
import SearchFilter from "../components/SearchFilter";
import "../styles/JuristePanel.css";

const API_URL = "http://localhost:5000"; // URL de votre serveur backend

const JuristePanel = () => {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [demandeSelectionnee, setDemandeSelectionnee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 Début de la récupération des demandes...");

        const response = await fetch(`${API_URL}/api/demandes`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Erreur serveur:", errorData);
          throw new Error(
            errorData.message || "Erreur lors de la récupération des demandes"
          );
        }

        const data = await response.json();
        console.log("✅ Demandes reçues:", data);
        setDemandes(data);
      } catch (err) {
        console.error("❌ Erreur détaillée:", {
          message: err.message,
          stack: err.stack,
          name: err.name,
        });
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemandes();
  }, [navigate]);

  // Filtrage des demandes
  const demandesFiltrees = demandes.filter((demande) => {
    const matchSearch =
      demande.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande._id.slice(-5).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut =
      filtreStatut === "tous" || demande.statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  const handleConsultation = (demande) => {
    console.log("Demande sélectionnée:", demande);
    setDemandeSelectionnee(demande);
  };

  const handleRetour = () => {
    setDemandeSelectionnee(null);
  };

  const handleSubmitReponse = async (reponse) => {
    try {
      const formData = new FormData();

      if (!reponse.texte) {
        throw new Error("Le texte de la réponse est requis");
      }

      formData.append("texte", reponse.texte);
      formData.append("statut", "traitée");

      if (reponse.fichier) {
        formData.append("fichiersReponse", reponse.fichier);
      }

      const response = await fetch(
        `${API_URL}/api/demandes/${demandeSelectionnee._id}/repondre`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erreur serveur:", errorData);
        throw new Error(
          errorData.message || "Erreur lors de l'envoi de la réponse"
        );
      }

      const updatedDemande = await response.json();
      console.log("✅ Réponse envoyée avec succès:", updatedDemande);

      setDemandes((prevDemandes) =>
        prevDemandes.map((d) =>
          d._id === demandeSelectionnee._id ? updatedDemande.demande : d
        )
      );

      setDemandeSelectionnee(null);
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert(
        error.message || "Une erreur est survenue lors de l'envoi de la réponse"
      );
    }
  };

  const handleDelete = (id) => {
    // Implement the delete logic here
    console.log("Suppression de la demande:", id);
  };

  const filterOptions = [
    { value: "tous", label: "Tous les statuts" },
    { value: "en attente", label: "En attente" },
    { value: "en cours", label: "En cours" },
    { value: "traitée", label: "Traitée" },
    { value: "archivée", label: "Archivée" },
  ];

  if (isLoading) {
    return (
      <div className="juriste-panel-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="juriste-panel-container">
        <div className="error-container">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (demandeSelectionnee) {
    console.log("Rendu de ConsulterDemande avec:", demandeSelectionnee);
    return (
      <ConsulterDemande
        demande={demandeSelectionnee}
        onSubmit={handleSubmitReponse}
        onRetour={handleRetour}
        isJuriste={true}
      />
    );
  }

  return (
    <div className="juriste-panel-container">
      <div className="juriste-panel-header">
        <div className="header-content">
          <h1 className="juriste-title">Espace Juriste</h1>
          <p className="juriste-subtitle">
            Gérez et répondez aux demandes des utilisateurs
          </p>
        </div>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterValue={filtreStatut}
        onFilterChange={setFiltreStatut}
        filterOptions={filterOptions}
        searchPlaceholder="Rechercher par objet ou numéro de demande..."
        filterLabel="Statut"
      />

      <div className="demandes-list">
        {demandesFiltrees.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <p>Aucune demande ne correspond à votre recherche</p>
          </div>
        ) : (
          demandesFiltrees.map((demande) => (
            <CardDemande
              key={demande._id}
              numero={demande._id.slice(-5)}
              date={new Date(demande.dateCreation).toLocaleDateString()}
              objet={demande.objet}
              theme={demande.theme}
              statut={demande.statut}
              onConsulter={() => handleConsultation(demande)}
              onDelete={handleDelete}
              id={demande._id}
              isJuriste={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default JuristePanel;
