const mongoose = require("mongoose");

const ReponseSchema = new mongoose.Schema({
  texte: { type: String, required: true },
  juriste: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
  fichiers: { type: [String], default: [] },
  statut: {
    type: String,
    enum: ["en attente", "en cours", "traitée", "archivée"],
    default: "en attente",
  },
});

const MessageSchema = new mongoose.Schema({
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  texte: { type: String, required: true },
  date: { type: Date, default: Date.now },
  piecesJointes: { type: [String], default: [] },
  type: {
    type: String,
    enum: ["demande", "reponse", "message"],
    default: "message",
  },
});

const DemandeSchema = new mongoose.Schema({
  commune: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Commune",
    required: true,
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  theme: { type: String, required: true },
  objet: { type: String, required: true },
  description: { type: String, required: true },
  fichiers: { type: [String], default: [] },
  statut: {
    type: String,
    enum: [
      "en attente",
      "en cours",
      "traitée",
      "archivée",
      "répondu",
      "clôturé",
    ],
    default: "en attente",
  },
  reponse: { type: ReponseSchema },
  messages: [MessageSchema],
  dateCreation: { type: Date, default: Date.now },
  dateModification: { type: Date, default: Date.now },
  dateArchivage: { type: Date },
  dateSuppression: { type: Date },
  dateCloture: { type: Date },
  note: { type: Number, min: 1, max: 5 },
  strateCommune: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StrateCommune",
  },
});

// Middleware pour mettre à jour la date de modification
DemandeSchema.pre("save", function (next) {
  this.dateModification = new Date();
  next();
});

// Méthode pour ajouter un message
DemandeSchema.methods.ajouterMessage = async function (messageData) {
  this.messages.push(messageData);
  return this.save();
};

// Méthode pour mettre à jour la réponse
DemandeSchema.methods.mettreAJourReponse = async function (reponseData) {
  this.reponse = reponseData;
  this.statut = reponseData.statut;
  return this.save();
};

// Méthode pour archiver une demande (RGPD)
DemandeSchema.methods.archiver = async function () {
  this.statut = "archivée";
  this.dateArchivage = new Date();
  this.dateSuppression = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000);
  return this.save();
};

// Méthode pour traiter une demande
DemandeSchema.methods.traiter = async function () {
  this.statut = "traitée";
  return this.save();
};

// Méthode pour mettre en cours une demande
DemandeSchema.methods.mettreEnCours = async function () {
  this.statut = "en cours";
  return this.save();
};

module.exports = mongoose.model("Demande", DemandeSchema);
