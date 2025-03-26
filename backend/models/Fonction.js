const mongoose = require("mongoose");

const FonctionSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  description: { type: String },
  actif: { type: Boolean, default: true },
  dateCreation: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Fonction", FonctionSchema);
