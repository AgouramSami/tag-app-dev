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
const app = express();
const themeRoutes = require("./routes/themeRoutes");
const path = require("path");
const faqRoutes = require("./routes/faqRoutes"); // Ajout des routes FAQ

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // ✅ Remplace par l'URL de ton frontend
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/communes", communeRoutes);
app.use("/api/fonctions", fonctionRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/demandes", demandeRoutes);
app.use("/api/strates", strateRoutes);
app.use("/api/faqs", faqRoutes);

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, { dbName: "tag_db" })
  .then(() => console.log("🟢 Connecté à MongoDB - tag_db"))
  .catch((err) => console.error("🔴 Erreur MongoDB :", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
