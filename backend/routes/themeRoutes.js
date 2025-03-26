const express = require("express");
const router = express.Router();
const Theme = require("../models/Theme");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

// 📌 📥 Ajouter un nouveau thème (Admin uniquement)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { nom } = req.body;

    // Vérifier si le thème existe déjà
    const existingTheme = await Theme.findOne({ nom });
    if (existingTheme) {
      return res.status(400).json({ message: "Ce thème existe déjà." });
    }

    const newTheme = new Theme({ nom });
    await newTheme.save();

    res.status(201).json({ message: "Thème ajouté avec succès !" });
  } catch (error) {
    console.error("Erreur lors de l'ajout du thème :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 🔍 Récupérer tous les thèmes actifs
router.get("/", async (req, res) => {
  try {
    const themes = await Theme.find({ actif: true }).sort({ nom: 1 });
    res.status(200).json(themes);
  } catch (error) {
    console.error("Erreur lors de la récupération des thèmes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 🔄 Désactiver un thème (Admin uniquement)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) return res.status(404).json({ message: "Thème non trouvé" });

    theme.actif = !theme.actif; // Bascule l'état actif/inactif
    await theme.save();

    res.status(200).json({ message: "Statut du thème mis à jour !" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du thème :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 🗑️ Supprimer un thème (Admin uniquement)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Theme.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Thème supprimé avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la suppression du thème :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
