const express = require("express");
const router = express.Router();
const FAQ = require("../models/FAQ");
const { authMiddleware } = require("../middleware/authMiddleware");

// 📌 🔍 Récupérer toutes les FAQ
router.get("/", async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ dateCreation: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des FAQ :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 📤 Ajouter une nouvelle FAQ (🔒 Réservé aux juristes)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "juriste") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { question, reponse } = req.body;

    if (!question || !reponse) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const nouvelleFAQ = new FAQ({
      question,
      reponse,
      auteur: req.user._id,
    });

    await nouvelleFAQ.save();
    res
      .status(201)
      .json({ message: "FAQ ajoutée avec succès", faq: nouvelleFAQ });
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de la FAQ :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 🗑️ Supprimer une FAQ (🔒 Réservé aux juristes)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "juriste") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ non trouvée" });
    }

    await faq.deleteOne();
    res.status(200).json({ message: "FAQ supprimée avec succès" });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la FAQ :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔍 Fonction pour supprimer les accents et normaliser une chaîne
const normalizeText = (str) => {
  return str
    .normalize("NFD") // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .toLowerCase(); // Met en minuscule pour l'insensibilité à la casse
};

// 📌 Route pour rechercher des FAQ
router.get("/search", async (req, res) => {
  try {
    let query = req.query.query;

    if (!query || query.length < 3) {
      return res.status(400).json({ message: "Requête trop courte." });
    }

    // 🔥 Normalisation du texte de la requête
    const normalizedQuery = normalizeText(query);

    // 🔍 Récupérer toutes les FAQ pour comparer avec la requête normalisée
    const faqs = await FAQ.find({});

    // 🛠️ Filtrage manuel des questions en supprimant accents et majuscules
    const filteredFaqs = faqs.filter((faq) =>
      normalizeText(faq.question).includes(normalizedQuery)
    );

    res.json(filteredFaqs.slice(0, 5)); // Limite à 5 résultats
  } catch (error) {
    console.error("❌ Erreur lors de la recherche des FAQ :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
