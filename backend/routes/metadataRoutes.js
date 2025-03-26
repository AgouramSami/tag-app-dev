const express = require("express");
const router = express.Router();
const Commune = require("../models/Commune");
const Fonction = require("../models/Fonction");

// ✅ Récupérer toutes les communes
router.get("/communes", async (req, res) => {
  try {
    const communes = await Commune.find();
    res.json(communes);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ Ajouter une commune
router.post("/communes", async (req, res) => {
  try {
    const { nom } = req.body;
    const newCommune = new Commune({ nom });
    await newCommune.save();
    res.status(201).json(newCommune);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ Récupérer toutes les fonctions
router.get("/fonctions", async (req, res) => {
  try {
    const fonctions = await Fonction.find();
    res.json(fonctions);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ Ajouter une fonction
router.post("/fonctions", async (req, res) => {
  try {
    const { nom } = req.body;
    const newFonction = new Fonction({ nom });
    await newFonction.save();
    res.status(201).json(newFonction);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
