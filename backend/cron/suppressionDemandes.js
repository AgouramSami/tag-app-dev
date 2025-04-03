const cron = require("node-cron");
const Demande = require("../models/Demandes");

// Tâche planifiée qui s'exécute tous les jours à minuit
const supprimerDemandesExpirees = cron.schedule("0 0 * * *", async () => {
  try {
    console.log("🕒 Début de la tâche de suppression des demandes expirées");
    await Demande.supprimerDemandesExpirees();
    console.log("✅ Tâche de suppression des demandes expirées terminée");
  } catch (error) {
    console.error(
      "❌ Erreur lors de la suppression des demandes expirées:",
      error
    );
  }
});

module.exports = supprimerDemandesExpirees;
