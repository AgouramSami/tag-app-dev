const mongoose = require("mongoose");
const Theme = require("../models/Theme");
require("dotenv").config();

const themes = [
  "Urbanisme",
  "Droit du travail",
  "Environnement",
  "Fiscalité",
  "Droit des entreprises",
  "Logement",
  "Santé publique",
  "Sécurité",
  "Transports",
  "Éducation",
  "Culture et patrimoine",
  "Justice",
  "Énergie",
  "Numérique et nouvelles technologies",
  "Tourisme",
  "Affaires sociales",
];

const insertThemes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "tag_db" });

    await Theme.deleteMany({});
    console.log("🗑 Suppression des anciens thèmes");

    await Theme.insertMany(themes.map((nom) => ({ nom })));
    console.log("✅ Thèmes ajoutés avec succès !");

    mongoose.connection.close();
  } catch (error) {
    console.error("🔴 Erreur lors de l'insertion des thèmes :", error);
    mongoose.connection.close();
  }
};

insertThemes();
