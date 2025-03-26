const express = require("express");
const router = express.Router();
const StrateCommune = require("../models/StrateCommune");
const { authMiddleware } = require("../middleware/authMiddleware");

// 📌 Récupérer toutes les strates
router.get("/", authMiddleware, async (req, res) => {
  try {
    const strates = await StrateCommune.find({ actif: true });
    res.json(strates);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des strates :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Créer une nouvelle strate (admin uniquement)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (!req.user.permissions.includes("admin")) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const { nom, description, populationMin, populationMax } = req.body;

    // Vérifier qu'il n'y a pas de chevauchement avec les strates existantes
    const stratesExistantes = await StrateCommune.find({
      $or: [
        {
          populationMin: { $lte: populationMax },
          populationMax: { $gte: populationMin },
        },
      ],
    });

    if (stratesExistantes.length > 0) {
      return res.status(400).json({
        message: "Cette plage de population chevauche une strate existante",
      });
    }

    const nouvelleStrate = new StrateCommune({
      nom,
      description,
      populationMin,
      populationMax,
    });

    await nouvelleStrate.save();
    res.status(201).json(nouvelleStrate);
  } catch (error) {
    console.error("❌ Erreur lors de la création de la strate :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Mettre à jour une strate (admin uniquement)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user.permissions.includes("admin")) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const { nom, description, populationMin, populationMax } = req.body;

    // Vérifier qu'il n'y a pas de chevauchement avec les autres strates
    const stratesExistantes = await StrateCommune.find({
      _id: { $ne: req.params.id },
      $or: [
        {
          populationMin: { $lte: populationMax },
          populationMax: { $gte: populationMin },
        },
      ],
    });

    if (stratesExistantes.length > 0) {
      return res.status(400).json({
        message: "Cette plage de population chevauche une strate existante",
      });
    }

    const strate = await StrateCommune.findByIdAndUpdate(
      req.params.id,
      { nom, description, populationMin, populationMax },
      { new: true }
    );

    if (!strate) {
      return res.status(404).json({ message: "Strate non trouvée" });
    }

    res.json(strate);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de la strate :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Désactiver une strate (admin uniquement)
router.put("/:id/desactiver", authMiddleware, async (req, res) => {
  try {
    if (!req.user.permissions.includes("admin")) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const strate = await StrateCommune.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { new: true }
    );

    if (!strate) {
      return res.status(404).json({ message: "Strate non trouvée" });
    }

    res.json(strate);
  } catch (error) {
    console.error("❌ Erreur lors de la désactivation de la strate :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
