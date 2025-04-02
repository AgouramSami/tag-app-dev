const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  reponse: { type: String, required: true },
  theme: { type: String, required: true },
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Juriste qui a créé la FAQ
  dateCreation: { type: Date, default: Date.now },
  dateModification: { type: Date, default: Date.now },
});

// Middleware pour mettre à jour la date de modification
faqSchema.pre("save", function (next) {
  this.dateModification = new Date();
  next();
});

module.exports = mongoose.model("FAQ", faqSchema);
