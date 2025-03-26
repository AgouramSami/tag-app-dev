const mongoose = require("mongoose");
const Demande = require("../models/Demandes");
const User = require("../models/User");
require("dotenv").config();

const seedDemandes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "tag_db" });

    // Suppression des anciennes demandes
    await Demande.deleteMany({});
    console.log("🗑 Anciennes demandes supprimées");

    // Récupérer un utilisateur aléatoire existant
    const utilisateurs = await User.find();
    if (utilisateurs.length === 0) {
      console.log(
        "⚠️ Aucun utilisateur trouvé ! Ajoutez d'abord des utilisateurs."
      );
      return;
    }
    const utilisateur =
      utilisateurs[Math.floor(Math.random() * utilisateurs.length)];

    // Création de demandes fictives
    const demandes = [
      {
        utilisateur: utilisateur._id,
        theme: "Urbanisme",
        objet: "Demande de permis de construire",
        description: "Je souhaite obtenir un permis pour agrandir ma maison.",
        fichiers: ["uploads/permis.pdf"],
        statut: "En attente",
      },
      {
        utilisateur: utilisateur._id,
        theme: "Droit du travail",
        objet: "Litige avec mon employeur",
        description:
          "J'ai besoin d'une assistance juridique sur un licenciement abusif.",
        fichiers: ["uploads/contrat.jpg"],
        statut: "En cours",
      },
      {
        utilisateur: utilisateur._id,
        theme: "Fiscalité",
        objet: "Erreur de calcul sur mes impôts",
        description:
          "Mon dernier avis d'imposition contient une erreur de calcul.",
        fichiers: [],
        statut: "Terminée",
      },
    ];

    await Demande.insertMany(demandes);
    console.log("✅ 3 demandes fictives ajoutées !");

    mongoose.connection.close();
  } catch (error) {
    console.error("🔴 Erreur lors de l'insertion des demandes :", error);
    mongoose.connection.close();
  }
};

seedDemandes();
