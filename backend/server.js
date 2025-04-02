const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration des fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("📁 Dossier uploads configuré:", path.join(__dirname, "uploads"));

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

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, { dbName: "tag_db" })
  .then(() => console.log("🟢 Connecté à MongoDB - tag_db"))
  .catch((err) => console.error("🔴 Erreur MongoDB :", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
  console.log("📝 Routes disponibles:");
  console.log("- POST /api/auth/upload-photo");
  console.log("- POST /api/test-upload");
});
