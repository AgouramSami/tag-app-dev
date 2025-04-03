const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  texte: { type: String, required: true },
  date: { type: Date, default: Date.now },
  piecesJointes: { type: [String], default: [] },
  estJuriste: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ["demande", "reponse"],
    required: true,
  },
});

const DemandeSchema = new mongoose.Schema({
  numeroReference: {
    type: String,
    unique: true,
  },
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
    enum: ["en attente", "traitée", "archivée"],
    default: "en attente",
  },
  messages: [MessageSchema],
  dateCreation: { type: Date, default: Date.now },
  dateModification: { type: Date, default: Date.now },
  dateCloture: { type: Date },
  dateArchivage: { type: Date },
  dateSuppression: { type: Date },
  note: { type: Number, min: 1, max: 5 },
  commentaireNote: { type: String },
  strateCommune: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StrateCommune",
  },
});

// Middleware pour générer le numéro de référence avant la sauvegarde
DemandeSchema.pre("save", async function (next) {
  if (!this.numeroReference) {
    const date = new Date();
    const year = date.getFullYear();
    const count = await mongoose.model("Demande").countDocuments({
      dateCreation: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
    });
    this.numeroReference = `TAG-${year}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  this.dateModification = new Date();
  next();
});

// Méthode pour ajouter un message
DemandeSchema.methods.ajouterMessage = async function (messageData) {
  this.messages.push(messageData);

  // Si c'est une réponse d'un juriste, mettre à jour le statut
  if (messageData.type === "reponse" && messageData.estJuriste) {
    this.statut = "traitée";
  }

  this.dateModification = new Date();
  await this.save();
};

// Méthode pour archiver une demande
DemandeSchema.methods.archiver = async function (note, commentaire) {
  this.statut = "archivée";
  this.note = note;
  this.commentaireNote = commentaire;
  this.dateCloture = new Date();
  this.dateArchivage = new Date();

  // Date de suppression fixée à 5 ans après la date d'archivage
  this.dateSuppression = new Date(this.dateArchivage);
  this.dateSuppression.setFullYear(this.dateSuppression.getFullYear() + 5);

  return this.save();
};

// Méthode pour supprimer les demandes expirées
DemandeSchema.statics.supprimerDemandesExpirees = async function () {
  const dateLimite = new Date();
  const demandesASupprimer = await this.find({
    statut: "archivée",
    dateSuppression: { $lte: dateLimite },
  });

  for (const demande of demandesASupprimer) {
    await demande.deleteOne();
    console.log(`✅ Demande ${demande._id} supprimée conformément au RGPD`);
  }
};

const Demande = mongoose.model("Demande", DemandeSchema);

module.exports = Demande;
