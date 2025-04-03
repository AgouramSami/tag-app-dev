const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const communeRoutes = require("./routes/communesRoutes");
const fonctionRoutes = require("./routes/fonctionsRoutes");
const demandeRoutes = require("./routes/demandesRoutes");
const strateRoutes = require("./routes/stratesRoutes");
const themeRoutes = require("./routes/themeRoutes");
const path = require("path");
const faqRoutes = require("./routes/faqRoutes");
const supprimerDemandesExpirees = require("./cron/suppressionDemandes");
const fs = require("fs");
const cron = require("node-cron");
const { supprimerDemandesRGPD } = require("./routes/demandesRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN.split(","),
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration des fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("📁 Dossier uploads configuré:", path.join(__dirname, "uploads"));

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
console.log("📁 Dossier uploads configuré:", uploadsDir);

// Routes API
app.use("/api/auth", authRoutes);
console.log("🔐 Routes d'authentification chargées");

app.use("/api/admin", adminRoutes);
app.use("/api/communes", communeRoutes);
app.use("/api/fonctions", fonctionRoutes);
app.use("/api/demandes", demandeRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/strates", strateRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/stats", require("./routes/statsRoutes"));

// Route de test pour les uploads
app.post("/api/test-upload", (req, res) => {
  console.log("📤 Test d'upload reçu");
  res.json({ message: "Route d'upload accessible" });
});

// Démarrer la tâche cron de suppression des demandes expirées
supprimerDemandesExpirees.start();
console.log("🕒 Tâche de suppression des demandes expirées planifiée");

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, { dbName: "tag_db" })
  .then(() => console.log("🟢 Connecté à MongoDB - tag_db"))
  .catch((err) => console.error("🔴 Erreur MongoDB :", err));

// Ne démarrer le serveur que si le fichier est exécuté directement
if (require.main === module) {
  const server = app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Serveur lancé sur le port ${process.env.PORT || 5000}`);
    console.log("📝 Routes disponibles:");
    console.log("- POST /api/auth/upload-photo");
    console.log("- POST /api/test-upload");
  });
}

module.exports = { app };
