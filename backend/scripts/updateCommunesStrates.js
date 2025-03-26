const mongoose = require("mongoose");
const Commune = require("../models/Commune");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const updateCommunesStrates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à la base de données");

    // Récupérer toutes les communes
    const communes = await Commune.find({});
    console.log(`📊 ${communes.length} communes trouvées`);

    // Mettre à jour chaque commune
    for (const commune of communes) {
      await commune.save(); // Le middleware s'occupera de mettre à jour la strate
      console.log(`✅ Commune ${commune.nom} mise à jour`);
    }

    console.log("✅ Mise à jour terminée");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour :", error);
    process.exit(1);
  }
};

updateCommunesStrates();
