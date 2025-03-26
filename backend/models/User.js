const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  nom: {
    type: String,
    default: "",
  },
  prenom: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fonction: {
    type: String,
    default: "administrateur",
  },
  commune: {
    type: String,
    default: "Upernavik",
  },
  telephone: {
    type: String,
    default: "",
  },
  isValidated: {
    type: Boolean,
    default: true,
  },
  __v: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  permissions: {
    type: String,
    required: true,
    default: "user",
  },
  actif: {
    type: Boolean,
    default: true,
  },
  compteBloquer: {
    type: Boolean,
    default: false,
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
  dateExpirationPassword: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours par défaut
  },
  dateModification: {
    type: Date,
    default: Date.now,
  },
  tentativesConnexion: {
    type: Number,
    default: 0,
  },
  derniereConnexion: {
    type: Date,
    default: Date.now,
  },
});

// Middleware pour mettre à jour dateModification avant chaque sauvegarde
userSchema.pre("save", function (next) {
  this.dateModification = new Date();
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
