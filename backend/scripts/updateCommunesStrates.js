const mongoose = require("mongoose");
const Commune = require("../models/Commune");
const StrateCommune = require("../models/StrateCommune");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const updateCommunesStrates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à la base de données");

    // Récupérer toutes les strates
    const strates = await StrateCommune.find({ actif: true });
    console.log(`📊 ${strates.length} strates trouvées`);

    // Récupérer toutes les communes
    const communes = await Commune.find({});
    console.log(`📊 ${communes.length} communes trouvées`);

    // Vérifier les communes sans strate
    const communesSansStrate = communes.filter((commune) => !commune.strate);
    console.log(
      `⚠️ ${communesSansStrate.length} communes sans strate associée`
    );

    if (communesSansStrate.length > 0) {
      console.log("Liste des communes sans strate :");
      communesSansStrate.forEach((commune) => {
        console.log(`- ${commune.nom} (${commune.population} habitants)`);
      });
    }

    // Mettre à jour chaque commune
    for (const commune of communes) {
      // Trouver la strate appropriée en fonction de la population
      const strate = strates.find(
        (s) =>
          commune.population >= s.populationMin &&
          commune.population <= s.populationMax
      );

      if (strate) {
        commune.strate = strate._id;
        await commune.save();
        console.log(
          `✅ Commune ${commune.nom} mise à jour (strate: ${strate.nom})`
        );
      } else {
        console.log(
          `⚠️ Aucune strate trouvée pour ${commune.nom} (${commune.population} habitants)`
        );
      }
    }

    // Vérifier le résultat final
    const communesFinales = await Commune.find({});
    const communesSansStrateFinales = communesFinales.filter(
      (commune) => !commune.strate
    );
    console.log(`\n📊 Résultat final :`);
    console.log(`- Total des communes : ${communesFinales.length}`);
    console.log(`- Communes sans strate : ${communesSansStrateFinales.length}`);

    if (communesSansStrateFinales.length > 0) {
      console.log("\nListe des communes sans strate après mise à jour :");
      communesSansStrateFinales.forEach((commune) => {
        console.log(`- ${commune.nom} (${commune.population} habitants)`);
      });
    }

    console.log("✅ Mise à jour terminée");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour :", error);
    process.exit(1);
  }
};

updateCommunesStrates();
