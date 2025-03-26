const express = require("express");
const router = express.Router();
const Fonction = require("../models/Fonction");

router.get("/", async (req, res) => {
  try {
    const fonctions = await Fonction.find();
    res.json(fonctions);
  } catch (error) {
    console.error("Erreur lors du chargement des fonctions :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
