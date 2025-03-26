const mongoose = require("mongoose");
const dotenv = require("dotenv");
const FAQ = require("../models/FAQ"); // Assure-toi que le chemin est correct
const User = require("../models/User");

dotenv.config(); // Charge les variables d'environnement

// 📌 Connexion à la base de données
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("📡 Connexion à MongoDB réussie !");

    // ✅ Trouver un juriste existant
    const juriste = await User.findOne({ role: "juriste" });

    if (!juriste) {
      console.log("❌ Aucun juriste trouvé, impossible d'ajouter des FAQ.");
      return process.exit(1);
    }

    // 🔥 Suppression des anciennes FAQ avant insertion
    await FAQ.deleteMany();
    console.log("🗑️ Anciennes FAQ supprimées.");

    // 📌 Liste des FAQ à ajouter
    const faqs = [
      {
        question:
          "Quels documents sont nécessaires pour obtenir un permis de construire ?",
        reponse:
          "Vous devez fournir un plan de situation du terrain, un plan de masse, et une notice explicative.",
        auteur: juriste._id,
        theme: "Urbanisme",
      },
      {
        question: "Quels sont les délais pour l'obtention d'un permis ?",
        reponse: "Le délai moyen est de 2 à 3 mois après dépôt du dossier.",
        auteur: juriste._id,
        theme: "Urbanisme",
      },
      {
        question: "Comment déclarer ses impôts ?",
        reponse:
          "Vous devez remplir votre déclaration en ligne sur impots.gouv.fr ou envoyer le formulaire papier.",
        auteur: juriste._id,
        theme: "Affaires sociales",
      },
      {
        question:
          "Quels sont les délais de réponse pour une demande d'urbanisme ?",
        reponse:
          "Les délais peuvent varier entre 1 et 3 mois en fonction de la complexité de la demande.",
        auteur: juriste._id,
        theme: "Urbanisme",
      },
      {
        question:
          "Quelles sont les aides disponibles pour la rénovation énergétique ?",
        reponse:
          "Vous pouvez bénéficier de MaPrimeRénov, du crédit d'impôt et d'aides locales.",
        auteur: juriste._id,
        theme: "Logement",
      },
      {
        question: "Comment obtenir un acte de naissance ?",
        reponse:
          "Vous pouvez faire la demande en ligne sur service-public.fr ou auprès de votre mairie.",
        auteur: juriste._id,
        theme: "État civil",
      },
      {
        question: "Comment créer une association ?",
        reponse:
          "Vous devez rédiger les statuts, tenir une assemblée générale constitutive et déposer le dossier en préfecture.",
        auteur: juriste._id,
        theme: "Droit des associations",
      },
      {
        question: "Quels sont les droits d’un salarié en télétravail ?",
        reponse:
          "Les salariés ont droit à la prise en charge des frais professionnels et au respect du droit à la déconnexion.",
        auteur: juriste._id,
        theme: "Droit du travail",
      },
      {
        question: "Comment contester une amende ?",
        reponse:
          "Vous devez adresser un recours au service compétent en fournissant les justificatifs nécessaires.",
        auteur: juriste._id,
        theme: "Infractions routières",
      },
      {
        question:
          "Comment obtenir une autorisation pour organiser un événement public ?",
        reponse:
          "Une déclaration en mairie est obligatoire, et des autorisations spécifiques peuvent être nécessaires selon l'événement.",
        auteur: juriste._id,
        theme: "Événements publics",
      },
    ];

    // 🔥 Insertion des FAQ
    await FAQ.insertMany(faqs);
    console.log("✅ FAQ ajoutées avec succès !");

    mongoose.connection.close(); // Déconnexion propre de MongoDB
    console.log("🔌 Déconnexion de MongoDB.");
  })
  .catch((error) => {
    console.error("❌ Erreur de connexion à MongoDB :", error);
    process.exit(1);
  });
