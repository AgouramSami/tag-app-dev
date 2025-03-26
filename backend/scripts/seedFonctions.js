const mongoose = require("mongoose");
const Fonction = require("../models/Fonction");
require("dotenv").config();

const fonctions = [
  {
    nom: "Maire",
    description: "Représente la commune et administre ses affaires",
  },
  {
    nom: "Adjoint au Maire",
    description: "Assiste le Maire dans ses responsabilités",
  },
  {
    nom: "Conseiller Municipal",
    description: "Élu participant aux décisions de la commune",
  },
  {
    nom: "Employé Municipal",
    description:
      "Salarié assurant le bon fonctionnement des services communaux",
  },
  {
    nom: "Juriste",
    description:
      "Spécialiste du droit assistant les communes sur les questions légales",
  },
  {
    nom: "Secrétaire de Mairie",
    description: "Assure l'administration générale et la gestion des dossiers",
  },
];

const insertFonctions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "tag_db",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🟢 Connecté à MongoDB - tag_db");

    await Fonction.deleteMany({});
    console.log("🗑 Anciennes fonctions supprimées");

    const fonctionsData = fonctions.map((f) => ({
      ...f,
      actif: true,
      dateCreation: new Date(),
    }));

    await Fonction.insertMany(fonctionsData);
    console.log("✅ Fonctions ajoutées avec succès !");
  } catch (error) {
    console.error("🔴 Erreur lors de l'insertion :", error);
  } finally {
    mongoose.connection.close();
  }
};

// Exécution du script
insertFonctions();
