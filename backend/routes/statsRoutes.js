const express = require("express");
const router = express.Router();
const Demande = require("../models/Demandes");
const Commune = require("../models/Commune");
const { authMiddleware } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const StrateCommune = require("../models/StrateCommune");

// Statistiques par commune
router.get("/par-commune", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 Début du calcul des statistiques par commune");
    const stats = await Demande.aggregate([
      {
        $lookup: {
          from: "communes",
          localField: "commune",
          foreignField: "_id",
          as: "communeInfo",
        },
      },
      {
        $unwind: "$communeInfo",
      },
      {
        $group: {
          _id: "$communeInfo.nom",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          commune: "$_id",
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { commune: 1 },
      },
    ]);
    console.log("✅ Stats par commune:", JSON.stringify(stats, null, 2));
    res.json(stats);
  } catch (error) {
    console.error(
      "❌ Erreur lors du calcul des statistiques par commune:",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Statistiques par thème
router.get("/par-theme", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 Début du calcul des statistiques par thème");
    const stats = await Demande.aggregate([
      {
        $group: {
          _id: "$theme",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          theme: "$_id",
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { theme: 1 },
      },
    ]);
    console.log("✅ Stats par thème:", JSON.stringify(stats, null, 2));
    res.json(stats);
  } catch (error) {
    console.error(
      "❌ Erreur lors du calcul des statistiques par thème:",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Statistiques de satisfaction par commune
router.get("/satisfaction-commune", authMiddleware, async (req, res) => {
  try {
    console.log(
      "🔍 Début du calcul des statistiques de satisfaction par commune"
    );

    // Récupérer toutes les communes actives
    const communes = await Commune.find({ actif: true });
    console.log("📊 Communes trouvées:", communes.length);

    const stats = await Demande.aggregate([
      {
        $match: {
          statut: "archivée",
          note: { $exists: true, $ne: null },
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
        $unwind: "$communeInfo",
      },
      {
        $group: {
          _id: "$communeInfo.nom",
          noteMoyenne: { $avg: "$note" },
          totalDemandes: { $sum: 1 },
        },
      },
      {
        $project: {
          commune: "$_id",
          noteMoyenne: { $round: ["$noteMoyenne", 2] },
          totalDemandes: 1,
          _id: 0,
        },
      },
    ]);

    // Ajouter les communes qui n'ont pas de demandes
    const statsCompletes = communes.map((commune) => {
      const stat = stats.find((s) => s.commune === commune.nom);
      return (
        stat || {
          commune: commune.nom,
          noteMoyenne: 0,
          totalDemandes: 0,
        }
      );
    });

    // Trier par nom de commune
    statsCompletes.sort((a, b) => a.commune.localeCompare(b.commune));

    console.log(
      "✅ Stats satisfaction par commune:",
      JSON.stringify(statsCompletes, null, 2)
    );
    res.json(statsCompletes);
  } catch (error) {
    console.error(
      "❌ Erreur lors du calcul des statistiques de satisfaction par commune:",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Statistiques de satisfaction par strate
router.get("/satisfaction-strate", authMiddleware, async (req, res) => {
  try {
    console.log(
      "🔍 Début du calcul des statistiques de satisfaction par strate"
    );

    // Récupérer toutes les strates actives
    const strates = await StrateCommune.find({ actif: true });
    console.log("📊 Strates trouvées:", strates.length);

    const stats = await Demande.aggregate([
      {
        $match: {
          statut: "archivée",
          note: { $exists: true, $ne: null },
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
        $unwind: "$communeInfo",
      },
      {
        $lookup: {
          from: "stratecommunes",
          localField: "communeInfo.strate",
          foreignField: "_id",
          as: "strateInfo",
        },
      },
      {
        $unwind: "$strateInfo",
      },
      {
        $group: {
          _id: "$strateInfo.nom",
          noteMoyenne: { $avg: "$note" },
          totalDemandes: { $sum: 1 },
        },
      },
      {
        $project: {
          strate: "$_id",
          noteMoyenne: { $round: ["$noteMoyenne", 2] },
          totalDemandes: 1,
          _id: 0,
        },
      },
    ]);

    // Ajouter les strates qui n'ont pas de demandes
    const statsCompletes = strates.map((strate) => {
      const stat = stats.find((s) => s.strate === strate.nom);
      return (
        stat || {
          strate: strate.nom,
          noteMoyenne: 0,
          totalDemandes: 0,
        }
      );
    });

    // Trier par nom de strate
    statsCompletes.sort((a, b) => a.strate.localeCompare(b.strate));

    console.log(
      "✅ Stats satisfaction par strate:",
      JSON.stringify(statsCompletes, null, 2)
    );
    res.json(statsCompletes);
  } catch (error) {
    console.error(
      "❌ Erreur lors du calcul des statistiques de satisfaction par strate:",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
