const express = require("express");
const router = express.Router();
const Demande = require("../models/Demandes");
const Commune = require("../models/Commune");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

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
          },
        ],
      });

      await nouvelleDemande.save();
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
    if (req.user.permissions.includes("juriste")) {
      console.log("✅ L'utilisateur a les permissions juriste");
      filter = {
        $or: [
          { "reponse.juriste": req.user._id },
          { statut: { $regex: new RegExp("^en attente$", "i") } },
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
      .populate("reponse.juriste", "nom prenom")
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
        texte: req.body.reponse || "Aucune réponse",
        juriste: req.user._id,
        fichiers: fichiersReponse,
        statut: "répondu",
      };

      // Mettre à jour la demande avec la réponse
      await demande.mettreAJourReponse(reponseData);

      // Ajouter la réponse comme message
      await demande.ajouterMessage({
        auteur: req.user._id,
        texte: req.body.reponse || "Aucune réponse",
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
          .json({ message: "Le message ne peut pas être vide." });
      }

      const demande = await Demande.findById(req.params.id);
      if (!demande) {
        return res.status(404).json({ message: "Demande non trouvée." });
      }

      // Vérifier les permissions
      if (
        !req.user.permissions.includes("juriste") &&
        demande.utilisateur.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "Accès non autorisé." });
      }

      await demande.ajouterMessage({
        auteur: req.user._id,
        texte,
        piecesJointes: fichiers,
        type: "message",
      });

      res.json({ message: "Message ajouté avec succès", demande });
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout d'un message :", error);
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
    const { note } = req.body;
    const demande = await Demande.findById(req.params.id);

    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    // Vérifier que l'utilisateur est bien le propriétaire de la demande
    if (demande.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Vérifier que la demande est bien en statut "répondu"
    if (demande.statut !== "répondu") {
      return res.status(400).json({
        message: "La demande doit être en statut 'répondu' pour être clôturée",
      });
    }

    // Récupérer la commune et sa strate
    const commune = await Commune.findOne({ nom: demande.commune });
    if (!commune) {
      return res.status(404).json({ message: "Commune non trouvée" });
    }

    // Mettre à jour la demande
    demande.statut = "clôturé";
    demande.note = note;
    demande.dateCloture = new Date();
    demande.strateCommune = commune.strate;

    await demande.save();

    res.json({ message: "Demande clôturée avec succès", demande });
  } catch (error) {
    console.error("❌ Erreur lors de la clôture de la demande :", error);
    res.status(500).json({ message: "Erreur serveur" });
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
setInterval(supprimerDemandesRGPD, 24 * 60 * 60 * 1000);

// 📊 Statistiques de satisfaction par strate
router.get("/stats/satisfaction", authMiddleware, async (req, res) => {
  try {
    console.log("👤 Utilisateur connecté:", {
      id: req.user._id,
      permissions: req.user.permissions,
      email: req.user.email,
    });

    if (!req.user || !["admin", "juriste"].includes(req.user.permissions)) {
      console.log(
        "❌ Accès non autorisé pour l'utilisateur:",
        req.user?.permissions
      );
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    console.log("🔍 Début de l'agrégation des statistiques...");

    // Vérifier d'abord s'il y a des demandes clôturées avec des notes
    const demandesAvecNotes = await Demande.countDocuments({
      note: { $exists: true, $ne: null },
      statut: "clôturé",
    });

    if (demandesAvecNotes === 0) {
      console.log("ℹ️ Aucune demande clôturée avec note trouvée");
      return res.json([]);
    }

    const stats = await Demande.aggregate([
      {
        $match: {
          note: { $exists: true, $ne: null },
          statut: "clôturé",
        },
      },
      {
        $lookup: {
          from: "communes",
          localField: "commune",
          foreignField: "_id",
          as: "communeInfo",
        },
      },
      {
        $unwind: {
          path: "$communeInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "stratecommunes",
          localField: "communeInfo.strateCommune",
          foreignField: "_id",
          as: "strateInfo",
        },
      },
      {
        $unwind: {
          path: "$strateInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "strateInfo._id": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$strateInfo._id",
          strate: { $first: "$strateInfo" },
          totalDemandes: { $sum: 1 },
          noteMoyenne: { $avg: "$note" },
          distribution: {
            $push: "$note",
          },
        },
      },
      {
        $project: {
          _id: 1,
          strate: 1,
          totalDemandes: 1,
          noteMoyenne: 1,
          distribution: {
            $reduce: {
              input: { $range: [1, 6] },
              initialValue: {},
              in: {
                $mergeObjects: [
                  "$$value",
                  {
                    ["$$this"]: {
                      $size: {
                        $filter: {
                          input: "$$distribution",
                          as: "note",
                          cond: { $eq: ["$$note", "$$this"] },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    console.log("✅ Statistiques récupérées avec succès:", stats);
    res.json(stats);
  } catch (error) {
    console.error(
      "❌ Erreur détaillée lors de la récupération des statistiques:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
      stack: error.stack,
    });
  }
});

module.exports = router;
