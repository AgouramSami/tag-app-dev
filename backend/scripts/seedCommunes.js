const mongoose = require("mongoose");
const Commune = require("../models/Commune"); // Import du modèle
require("dotenv").config();

// ✅ Liste complète des 64 communes du Groenland avec population réelle
const communes = [
  { nom: "Nuuk", population: 19604 },
  { nom: "Sisimiut", population: 5436 },
  { nom: "Ilulissat", population: 4848 },
  { nom: "Qaqortoq", population: 3005 },
  { nom: "Aasiaat", population: 2903 },
  { nom: "Maniitsoq", population: 2519 },
  { nom: "Tasiilaq", population: 1904 },
  { nom: "Uummannaq", population: 1407 },
  { nom: "Narsaq", population: 1312 },
  { nom: "Paamiut", population: 1173 },
  { nom: "Nanortalik", population: 1119 },
  { nom: "Upernavik", population: 1090 },
  { nom: "Qasigiannguit", population: 1037 },
  { nom: "Qeqertarsuaq", population: 845 },
  { nom: "Qaanaaq", population: 629 },
  { nom: "Kangaatsiaq", population: 507 },
  { nom: "Kangerlussuaq", population: 491 },
  { nom: "Kullorsuaq", population: 444 },
  { nom: "Ittoqqortoormiit", population: 352 },
  { nom: "Kangaamiut", population: 291 },
  { nom: "Saattut", population: 259 },
  { nom: "Kuummiut", population: 250 },
  { nom: "Tasiusaq", population: 249 },
  { nom: "Niaqornaarsuk", population: 233 },
  { nom: "Ikerasak", population: 229 },
  { nom: "Kulusuk", population: 226 },
  { nom: "Upernavik Kujalleq", population: 201 },
  { nom: "Attu", population: 196 },
  { nom: "Atammik", population: 192 },
  { nom: "Sermiligaaq", population: 189 },
  { nom: "Nuussuaq", population: 181 },
  { nom: "Qeqertarsuatsiaat", population: 177 },
  { nom: "Innaarsuit", population: 171 },
  { nom: "Alluitsup Paa", population: 164 },
  { nom: "Qaarsut", population: 161 },
  { nom: "Saqqaq", population: 160 },
  { nom: "Aappilattoq (Avannaata)", population: 149 },
  { nom: "Ukkusissat", population: 144 },
  { nom: "Kangersuatsiaq", population: 141 },
  { nom: "Narsarsuaq", population: 139 },
  { nom: "Qeqertaq", population: 112 },
  { nom: "Sarfannguit", population: 101 },
  { nom: "Ikerasaarsuk", population: 94 },
  { nom: "Aappilattoq (Kujalleq)", population: 93 },
  { nom: "Tiniteqilaaq", population: 93 },
  { nom: "Itilleq", population: 91 },
  { nom: "Eqalugaarsuit", population: 79 },
  { nom: "Ikamiut", population: 76 },
  { nom: "Arsuk", population: 72 },
  { nom: "Napasoq", population: 70 },
  { nom: "Akunnaaq", population: 61 },
  { nom: "Base aérienne de Thulé", population: 51 },
  { nom: "Qassimiut", population: 50 },
  { nom: "Niaqornat", population: 50 },
  { nom: "Oqaatsut", population: 50 },
  { nom: "Siorapaluk", population: 50 },
  { nom: "Tasiusaq (Kujalleq)", population: 50 },
  { nom: "Igaliku", population: 50 },
  { nom: "Qassiarsuk", population: 50 },
  { nom: "Kangerluk", population: 50 },
  { nom: "Kangerluarsoruseq", population: 40 },
  { nom: "Qassersuaq", population: 60 },
  { nom: "Naajaat", population: 50 }, // Commune ajoutée
  { nom: "Neriunaq", population: 45 }, // Commune ajoutée
];

// ✅ Génération des objets pour MongoDB avec toutes les communes actives
const generateCommuneData = () => {
  return communes.map((commune) => ({
    nom: commune.nom,
    population: commune.population,
    actif: true, // ✅ Toutes les communes sont actives
    dateCreation: new Date(),
  }));
};

// 🔄 Connexion à MongoDB et insertion des communes
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "tag_db",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("🟢 Connecté à MongoDB - tag_db");

    // 🗑 Suppression des anciennes communes sans supprimer la collection
    await Commune.deleteMany({});
    console.log("🗑 Anciennes communes supprimées");

    // ✅ Insertion des nouvelles communes
    const communesData = generateCommuneData();
    await Commune.insertMany(communesData);
    console.log(`✅ ${communesData.length} communes ajoutées avec succès !`);

    mongoose.connection.close(); // 🔄 Fermeture propre de la connexion
  })
  .catch((err) => {
    console.error("🔴 Erreur MongoDB :", err);
    mongoose.connection.close();
  });
