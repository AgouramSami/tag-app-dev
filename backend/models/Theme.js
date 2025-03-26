const mongoose = require("mongoose");

const themeSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true }, // Le nom du thème (ex: "Urbanisme", "Droit du travail", etc.)
  actif: { type: Boolean, default: true }, // Pour désactiver un thème si besoin
});

module.exports = mongoose.model("Theme", themeSchema);
