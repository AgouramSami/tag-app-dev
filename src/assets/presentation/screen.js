// 1. MODÈLE UTILISATEUR
const userSchema = new mongoose.Schema({
    // Infos de base
    nom: { type: String },
    prenom: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Rôle et rattachement
    fonction: { type: String, default: "administrateur" },
    permissions: { 
      type: String, 
      required: true,
      default: "user",
      enum: ["user", "juriste", "admin"]  //enumération des permissions 
    },
    commune: { type: mongoose.Schema.Types.ObjectId, ref: "Commune" }, //Lien Commune
  });
  
  // 2. MODÈLE DEMANDE
  const DemandeSchema = new mongoose.Schema({
    // Infos essentielles
    numeroReference: { type: String, unique: true },     // TAG-2024-0001
    objet: { type: String, required: true },
    description: { type: String, required: true },
    
    // Références principales
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "User" },     // → Lien User
    commune: { type: mongoose.Schema.Types.ObjectId, ref: "Commune" },      // → Lien Commune
    theme: { type: mongoose.Schema.Types.ObjectId, ref: "Theme" },          // → Lien Theme
    
    // Suivi
    statut: { type: String, enum: ["en attente", "traitée", "archivée"] },
    messages: [{ 
      auteur: { type: mongoose.Schema.Types.ObjectId, ref: "User" },        // → Lien User
      texte: String,
      estJuriste: Boolean