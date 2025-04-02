const express = require("express");
const router = express.Router();
const Commune = require("../models/Commune");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", async (req, res) => {
  try {
    const communes = await Commune.find({ actif: true }); // Ne récupérer que les communes actives
    res.json(communes);
  } catch (error) {
    console.error("Erreur lors du chargement des communes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour récupérer une commune spécifique
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const commune = await Commune.findById(req.params.id);
    if (!commune) {
      return res.status(404).json({ message: "Commune non trouvée" });
    }
    res.json(commune);
  } catch (error) {
    console.error("Erreur lors de la récupération de la commune :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
