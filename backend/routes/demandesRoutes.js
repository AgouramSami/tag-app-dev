const express = require("express");
const router = express.Router();
const Demande = require("../models/Demandes");
const Commune = require("../models/Commune");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const cron = require("node-cron");

// 📌 📤 Enregistrer une nouvelle demande avec fichiers
router.post(
  "/",
  authMiddleware,
  upload.array("fichiers", 8),
  async (req, res) => {
    try {
      console.log("📥 Données reçues par le backend :", req.body);
      console.log("📂 Fichiers reçus :", req.files);

      const { theme, objet, description } = req.body;
      const fichiers = req.files ? req.files.map((file) => file.path) : [];

      if (!req.user || !req.user.commune) {
        return res
          .status(403)
          .json({ message: "Accès refusé, utilisateur non authentifié." });
      }

      if (!description) {
        return res.status(400).json({ message: "La description est requise." });
      }

      // Créer la demande avec le premier message
      const nouvelleDemande = new Demande({
        commune: req.user.commune,
        utilisateur: req.user._id,
        objet,
        theme,
        description,
        fichiers,
        statut: "en attente",
        messages: [
          {
            auteur: req.user._id,
            texte: description,
            piecesJointes: fichiers,
            type: "demande",
            estJuriste: false,
            date: new Date(),
          },
        ],
      });

      await nouvelleDemande.save();

      // Peupler l'auteur du message pour la réponse
      await nouvelleDemande.populate("messages.auteur", "nom prenom");

      res.status(201).json({
        message: "Demande créée avec succès",
        demande: nouvelleDemande,
      });
    } catch (error) {
      console.error(
        "❌ Erreur serveur lors de la création de la demande :",
        error
      );
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// 📌 🔄 Récupérer les demandes
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(403)
        .json({ message: "Accès refusé, utilisateur non authentifié." });
    }

    console.log("👤 Utilisateur connecté:", {
      id: req.user._id,
      permissions: req.user.permissions,
      email: req.user.email,
      nom: req.user.nom,
    });

    let filter = {};
    if (req.user.permissions === "juriste") {
      console.log("✅ L'utilisateur a les permissions juriste");
      filter = {
        $or: [
          { "reponse.juriste": req.user._id },
          {
            statut: { $in: ["en attente", "en cours", "traitée", "archivée"] },
          },
        ],
      };
      console.log("🔍 Filtre appliqué:", JSON.stringify(filter, null, 2));
    } else {
      console.log(
        "❌ L'utilisateur n'a pas les permissions juriste:",
        req.user.permissions
      );
      filter = { utilisateur: req.user._id };
    }

    const demandes = await Demande.find(filter)
      .populate("utilisateur", "nom prenom email")
      .populate("messages.auteur", "nom prenom")
      .sort({ dateCreation: -1 });

    // Logs détaillés
    console.log(
      "🔍 Toutes les demandes dans la base :",
      await Demande.find({})
    );
    console.log("📋 Demandes trouvées avec le filtre:", demandes.length);
    console.log(
      "📊 Détails des demandes:",
      demandes.map((d) => ({
        id: d._id,
        statut: d.statut,
        commune: d.commune,
        theme: d.theme,
      }))
    );

    res.json(demandes);
  } catch (error) {
    console.error(
      "❌ Erreur serveur lors de la récupération des demandes :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 🔄 Récupérer une demande spécifique
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id)
      .populate("utilisateur", "nom prenom email")
      .populate("messages.auteur", "nom prenom");

    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    // Vérifier que l'utilisateur a le droit d'accéder à la demande
    const isJuriste = req.user.permissions.includes("juriste");
    const isOwner =
      demande.utilisateur._id.toString() === req.user._id.toString();

    if (!isJuriste && !isOwner) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    res.json(demande);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la demande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 ✅ Répondre à une demande (Juriste)
router.put(
  "/:id/repondre",
  authMiddleware,
  upload.array("fichiersReponse", 5),
  async (req, res) => {
    try {
      if (!req.user || !req.user.permissions.includes("juriste")) {
        return res.status(403).json({
          message: "Accès refusé, seuls les juristes peuvent répondre.",
        });
      }

      const demande = await Demande.findById(req.params.id);
      if (!demande) {
        return res.status(404).json({ message: "Demande non trouvée" });
      }

      const fichiersReponse = req.files
        ? req.files.map((file) => file.path)
        : [];

      // Créer la réponse
      const reponseData = {
        texte: req.body.reponse || req.body.texte || "Aucune réponse",
        juriste: req.user._id,
        fichiers: fichiersReponse,
        statut: "répondu",
      };

      // Mettre à jour la demande avec la réponse
      await demande.mettreAJourReponse(reponseData);

      // Ajouter la réponse comme message
      await demande.ajouterMessage({
        auteur: req.user._id,
        texte: req.body.reponse || req.body.texte || "Aucune réponse",
        piecesJointes: fichiersReponse,
        type: "reponse",
      });

      res.json({ message: "Réponse enregistrée avec succès", demande });
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'enregistrement de la réponse :",
        error
      );
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// 📌 💬 Ajouter un message à une demande
router.post(
  "/:id/message",
  authMiddleware,
  upload.array("fichiers", 5),
  async (req, res) => {
    try {
      const { texte } = req.body;
      const fichiers = req.files ? req.files.map((file) => file.path) : [];

      if (!texte) {
        return res
          .status(400)
          .json({ message: "Le texte du message est requis" });
      }

      const demande = await Demande.findById(req.params.id);
      if (!demande) {
        return res.status(404).json({ message: "Demande non trouvée" });
      }

      // Déterminer si l'utilisateur est un juriste
      const estJuriste = req.user.permissions.includes("juriste");

      // Créer le message
      const messageData = {
        auteur: req.user._id,
        texte,
        piecesJointes: fichiers,
        type: estJuriste ? "reponse" : "demande",
        estJuriste,
      };

      // Ajouter le message à la demande
      await demande.ajouterMessage(messageData);

      // Peupler l'auteur du message pour la réponse
      await demande.populate("messages.auteur", "nom prenom");

      // Retourner le dernier message ajouté
      const nouveauMessage = demande.messages[demande.messages.length - 1];

      res.json({
        message: "Message ajouté avec succès",
        message: nouveauMessage,
      });
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du message :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// 📌 🗑️ Supprimer une demande
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    // Vérifier les permissions
    if (
      req.user.role !== "admin" &&
      demande.utilisateur.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    await demande.deleteOne();
    res.status(200).json({ message: "Demande supprimée avec succès !" });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la demande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 ✅ Clôturer une demande avec une note
router.put("/:id/cloturer", authMiddleware, async (req, res) => {
  try {
    const { note, commentaire } = req.body;

    if (!note || note < 1 || note > 5) {
      return res
        .status(400)
        .json({ message: "La note doit être comprise entre 1 et 5" });
    }

    const demande = await Demande.findById(req.params.id);

    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    if (demande.utilisateur.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à clôturer cette demande" });
    }

    await demande.cloturer(note, commentaire);

    res.json({ message: "Demande clôturée avec succès", demande });
  } catch (error) {
    console.error("Erreur lors de la clôture de la demande:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la clôture de la demande" });
  }
});

// 📌 ✅ Traiter une demande
router.put("/:id/traiter", authMiddleware, async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    // Vérifier que l'utilisateur est un juriste
    if (!req.user.permissions.includes("juriste")) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    await demande.traiter();
    res.json({ message: "Demande marquée comme traitée", demande });
  } catch (error) {
    console.error("❌ Erreur lors du traitement de la demande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 ✅ Mettre en cours une demande
router.put("/:id/en-cours", authMiddleware, async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    // Vérifier que l'utilisateur est un juriste
    if (!req.user.permissions.includes("juriste")) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    await demande.mettreEnCours();
    res.json({ message: "Demande mise en cours", demande });
  } catch (error) {
    console.error("❌ Erreur lors de la mise en cours de la demande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 ✅ Archiver une demande (RGPD)
router.put("/:id/archiver", authMiddleware, async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    // Vérifier que l'utilisateur est le propriétaire de la demande
    if (demande.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Vérifier que la demande est bien en statut "traitée"
    if (demande.statut !== "traitée") {
      return res.status(400).json({
        message: "La demande doit être en statut 'traitée' pour être archivée",
      });
    }

    await demande.archiver();
    res.json({
      message: "Demande archivée avec succès",
      demande,
      dateSuppression: demande.dateSuppression, // Informer de la date de suppression RGPD
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'archivage de la demande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 🔄 Tâche planifiée pour la suppression RGPD
const supprimerDemandesRGPD = async () => {
  try {
    const dateLimite = new Date();
    dateLimite.setFullYear(dateLimite.getFullYear() - 5); // 5 ans

    const demandesASupprimer = await Demande.find({
      statut: "archivée",
      dateSuppression: { $lte: dateLimite },
    });

    for (const demande of demandesASupprimer) {
      await demande.deleteOne();
      console.log(`✅ Demande ${demande._id} supprimée conformément au RGPD`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la suppression RGPD :", error);
  }
};

// Planifier la tâche de suppression RGPD (exécution quotidienne)
cron.schedule("0 0 * * *", supprimerDemandesRGPD);

// 📊 Statistiques de satisfaction
router.get("/stats/satisfaction", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 Début du calcul des statistiques de satisfaction");
    console.log("👤 Utilisateur:", req.user);

    if (!req.user || !req.user.permissions.includes("juriste")) {
      console.log("❌ Accès refusé - Permissions insuffisantes");
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Vérifier d'abord s'il y a des demandes archivées avec des notes
    const demandesArchivees = await Demande.find({
      statut: "archivée",
      note: { $exists: true, $ne: null },
    });

    console.log(
      `📊 Nombre de demandes archivées avec notes: ${demandesArchivees.length}`
    );

    const stats = await Demande.aggregate([
      {
        $match: {
          statut: "archivée",
          note: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$theme",
          theme: { $first: "$theme" },
          totalDemandes: { $sum: 1 },
          noteMoyenne: { $avg: "$note" },
          note1: { $sum: { $cond: [{ $eq: ["$note", 1] }, 1, 0] } },
          note2: { $sum: { $cond: [{ $eq: ["$note", 2] }, 1, 0] } },
          note3: { $sum: { $cond: [{ $eq: ["$note", 3] }, 1, 0] } },
          note4: { $sum: { $cond: [{ $eq: ["$note", 4] }, 1, 0] } },
          note5: { $sum: { $cond: [{ $eq: ["$note", 5] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          theme: 1,
          totalDemandes: 1,
          noteMoyenne: { $round: ["$noteMoyenne", 2] },
          distribution: {
            1: "$note1",
            2: "$note2",
            3: "$note3",
            4: "$note4",
            5: "$note5",
          },
        },
      },
      {
        $sort: { theme: 1 },
      },
    ]);

    console.log(
      "✅ Statistiques calculées avec succès:",
      JSON.stringify(stats, null, 2)
    );
    res.json(stats);
  } catch (error) {
    console.error(
      "❌ Erreur détaillée lors du calcul des statistiques:",
      error
    );
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 ⚡ Mettre à jour le statut d'une demande
router.put("/:id/statut", authMiddleware, async (req, res) => {
  try {
    const { statut } = req.body;

    if (!req.user.permissions.includes("juriste")) {
      return res.status(403).json({
        message: "Seuls les juristes peuvent mettre à jour le statut",
      });
    }

    const demande = await Demande.findById(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    demande.statut = statut;
    await demande.save();

    res.json({ message: "Statut mis à jour avec succès", demande });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
