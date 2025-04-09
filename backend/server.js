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

// Configuration CORS plus sécurisée
const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400, // 24 heures
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configuration des fichiers statiques
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Dossier uploads créé:", uploadsDir);
}
app.use("/uploads", express.static(uploadsDir));

// Routes API avec logging
const routes = {
  "/api/auth": authRoutes,
  "/api/admin": adminRoutes,
  "/api/communes": communeRoutes,
  "/api/fonctions": fonctionRoutes,
  "/api/demandes": demandeRoutes,
  "/api/themes": themeRoutes,
  "/api/strates": strateRoutes,
  "/api/faqs": faqRoutes,
  "/api/stats": require("./routes/statsRoutes"),
};

Object.entries(routes).forEach(([path, router]) => {
  app.use(path, router);
  console.log(`🛣️ Route configurée: ${path}`);
});

// Route de test pour les uploads
app.post("/api/test-upload", (req, res) => {
  console.log("📤 Test d'upload reçu");
  res.json({ message: "Route d'upload accessible" });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur:", err);
  res.status(500).json({
    message: "Une erreur est survenue sur le serveur",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Connexion à MongoDB avec gestion d'erreur améliorée
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "tag_db",
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("🟢 Connecté à MongoDB - tag_db");
    // Démarrer la tâche cron de suppression des demandes expirées
    supprimerDemandesExpirees.start();
    console.log("🕒 Tâche de suppression des demandes expirées planifiée");
  })
  .catch((err) => {
    console.error("🔴 Erreur MongoDB:", err);
    process.exit(1);
  });

// Ne démarrer le serveur que si le fichier est exécuté directement
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur le port ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log("📝 Routes disponibles:");
    Object.keys(routes).forEach((route) => {
      console.log(`- ${route}`);
    });
  });

  // Gestion propre de l'arrêt du serveur
  process.on("SIGTERM", () => {
    console.log("SIGTERM reçu. Arrêt du serveur...");
    server.close(() => {
      console.log("Serveur arrêté");
      mongoose.connection.close(false, () => {
        console.log("Connexion MongoDB fermée");
        process.exit(0);
      });
    });
  });
}

module.exports = { app };
