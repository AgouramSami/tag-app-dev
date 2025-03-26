const express = require("express");
const router = express.Router();
const Commune = require("../models/Commune");

router.get("/", async (req, res) => {
  try {
    const communes = await Commune.find({ actif: true }); // Ne récupérer que les communes actives
    res.json(communes);
  } catch (error) {
    console.error("Erreur lors du chargement des communes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
