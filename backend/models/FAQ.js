const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  reponse: { type: String, required: true },
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Juriste qui a créé la FAQ
  dateCreation: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FAQ", faqSchema);
