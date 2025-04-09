const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcrypt");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI, { dbName: "tag_db" });
    console.log("🟢 Connecté à MongoDB");

    // Supprimer l'admin existant s'il existe
    await User.deleteMany({ permissions: "admin" });
    console.log("🗑 Ancien admin supprimé");

    // Créer l'administrateur
    const hashedPassword = await bcrypt.hash("password123", 10);
    const admin = new User({
      email: "test@example.com",
      password: hashedPassword,
      nom: "Admin",
      prenom: "System",
      fonction: "administrateur",
      commune: new mongoose.Types.ObjectId(),
      permissions: "admin",
      isValidated: true,
      isActive: true,
    });

    await admin.save();
    console.log("✅ Administrateur créé avec succès");
    console.log("Email:", admin.email);
    console.log("Mot de passe: password123");

    // Déconnexion de MongoDB
    await mongoose.disconnect();
    console.log("🔴 Déconnecté de MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
};

createAdmin();
