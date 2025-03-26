const mongoose = require("mongoose");
const StrateCommune = require("../models/StrateCommune");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

console.log("MONGO_URI:", process.env.MONGO_URI);

const seedStrates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "tag_db" });

    // Suppression des anciennes strates
    await StrateCommune.deleteMany({});
    console.log("🗑 Anciennes strates supprimées");

    // Création des strates
    const strates = [
      {
        nom: "Petite commune",
        description: "Communes de moins de 100 habitants",
        populationMin: 0,
        populationMax: 99,
      },
      {
        nom: "Commune moyenne",
        description: "Communes de 100 à 500 habitants",
        populationMin: 100,
        populationMax: 499,
      },
      {
        nom: "Grande commune",
        description: "Communes de plus de 500 habitants",
        populationMin: 500,
        populationMax: 999999, // Valeur maximale pour représenter "plus de 500"
      },
    ];

    await StrateCommune.insertMany(strates);
    console.log("✅ Strates de communes ajoutées avec succès !");

    mongoose.connection.close();
  } catch (error) {
    console.error("🔴 Erreur lors de l'insertion des strates :", error);
    mongoose.connection.close();
  }
};

seedStrates();
