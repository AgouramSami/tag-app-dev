const mongoose = require("mongoose");

const StrateCommuneSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  populationMin: { type: Number, required: true },
  populationMax: { type: Number, required: true },
  actif: { type: Boolean, default: true },
  dateCreation: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StrateCommune", StrateCommuneSchema);
