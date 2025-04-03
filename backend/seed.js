const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcrypt");
require("dotenv").config();

const createAdminUser = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI, { dbName: "tag_db" });
    console.log("🟢 Connecté à MongoDB");

    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ permissions: "admin" });
    if (adminExists) {
      console.log("❌ Un administrateur existe déjà");
      process.exit(1);
    }

    // Créer l'administrateur
    const hashedPassword = await bcrypt.hash("Elodie.Pln91", 10);
    const admin = new User({
      email: "admin@gmail.com",
      password: hashedPassword,
      nom: "Admin",
      prenom: "System",
      fonction: "administrateur",
      commune: new mongoose.Types.ObjectId(), // Commune par défaut
      permissions: "admin",
      isValidated: true,
      isActive: true,
    });

    await admin.save();
    console.log("✅ Administrateur créé avec succès");
    console.log("Email:", admin.email);
    console.log("Mot de passe: Elodie.Pln91");

    // Déconnexion de MongoDB
    await mongoose.disconnect();
    console.log("🔴 Déconnecté de MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
};

createAdminUser();
