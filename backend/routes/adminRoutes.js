const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const User = require("../models/User");
const Commune = require("../models/Commune");
const Fonction = require("../models/Fonction");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// ✅ Récupérer tous les utilisateurs (Accessible uniquement aux admins)
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/communes", async (req, res) => {
  try {
    const communes = await Commune.find();
    res.json(communes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du chargement des communes" });
  }
});

router.get("/fonctions", async (req, res) => {
  try {
    const fonctions = await Fonction.find();
    res.json(fonctions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors du chargement des fonctions" });
  }
});

router.put(
  "/toggle-validation/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      console.log(
        "🔍 Requête reçue pour validation :",
        req.params.id,
        req.body
      );

      const user = await User.findById(req.params.id);
      if (!user)
        return res.status(404).json({ message: "Utilisateur non trouvé" });

      user.isValidated = req.body.isValidated;
      await user.save();

      console.log("✅ Utilisateur mis à jour :", user);
      res.status(200).json({ message: "Utilisateur mis à jour" });
    } catch (err) {
      console.error("❌ Erreur serveur :", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);
router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      console.log("🗑 Suppression utilisateur :", req.params.id);

      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser)
        return res.status(404).json({ message: "Utilisateur introuvable" });

      console.log("✅ Utilisateur supprimé :", deletedUser);
      res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (err) {
      console.error("❌ Erreur de suppression :", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// ✅ Modifier le rôle d'un utilisateur
router.put(
  "/update-role/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { role } = req.body;
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      user.role = role;
      await user.save();

      res.status(200).json({ message: "Rôle mis à jour avec succès" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour du rôle" });
    }
  }
);

// ✅ Fonction pour générer un mot de passe aléatoire
const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// ✅ Configuration de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Remplace par ton service d'email si besoin
  auth: {
    user: process.env.EMAIL_USER, // Définis ces valeurs dans le .env
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Route pour créer un utilisateur et envoyer un e-mail
router.post(
  "/create-user",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { nom, prenom, email, fonction, commune, telephone, role } =
        req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé." });
      }

      // Générer et hasher le mot de passe
      const plainPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Générer un token pour la réinitialisation du mot de passe
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Créer un nouvel utilisateur
      const newUser = new User({
        nom,
        prenom,
        email,
        fonction,
        commune,
        telephone,
        password: hashedPassword, // Stocker le hash en BDD
        role,
        isValidated: true, // L'utilisateur est validé par défaut
        resetToken, // Stocke le token
        resetTokenExpiry: Date.now() + 3600000, // Expire dans 1h
      });

      await newUser.save();

      // ✅ Envoi de l'e-mail avec les identifiants et le lien de réinitialisation
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Vos identifiants de connexion - TAG",
        html: `
        <h2>Bienvenue sur la plateforme TAG</h2>
        <p>Bonjour <strong>${prenom}</strong>,</p>
        <p>Votre compte a été créé avec succès sur la plateforme TAG.</p>
        <ul>
          <li>✉️ <strong>Email</strong> : ${email}</li>
          <li>🔑 <strong>Mot de passe</strong> : ${plainPassword}</li>
        </ul>
        <p>Vous pouvez vous connecter dès maintenant en cliquant sur le bouton ci-dessous :</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display:inline-block;background:#007bff;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">Connexion</a>
        
        <p><strong>Nous vous conseillons de changer votre mot de passe dès la première connexion.</strong></p>
        <p>Si vous souhaitez le modifier maintenant, cliquez ici :</p>
        <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" style="display:inline-block;background:#28a745;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">Réinitialiser mon mot de passe</a>
        
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
        <br>
        <p>Cordialement,<br>L'équipe TAG</p>
      `,
      };

      await transporter.sendMail(mailOptions);

      res.status(201).json({ message: "Utilisateur créé et e-mail envoyé !" });
    } catch (error) {
      console.error("🔴 Erreur lors de la création de l'utilisateur :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// ✅ Modifier le rôle d'un utilisateur
router.put(
  "/update-role/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { role } = req.body;
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      user.role = role;
      await user.save();

      res.status(200).json({ message: "Rôle mis à jour avec succès" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour du rôle" });
    }
  }
);

module.exports = router;
