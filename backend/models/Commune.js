const mongoose = require("mongoose");

const CommuneSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  population: { type: Number, required: true },
  strate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StrateCommune",
    required: true,
  },
  actif: { type: Boolean, default: true },
  dateCreation: { type: Date, default: Date.now },
});

// Middleware pour mettre à jour automatiquement la strate en fonction de la population
CommuneSchema.pre("save", async function (next) {
  if (this.isModified("population")) {
    const StrateCommune = mongoose.model("StrateCommune");
    const strate = await StrateCommune.findOne({
      populationMin: { $lte: this.population },
      populationMax: { $gte: this.population },
      actif: true,
    });
    if (strate) {
      this.strate = strate._id;
    }
  }
  next();
});

module.exports = mongoose.model("Commune", CommuneSchema);
