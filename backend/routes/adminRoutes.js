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

// ✅ Modifier les permissions d'un utilisateur
router.put(
  "/update-role/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { permissions } = req.body;
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      user.permissions = permissions;
      await user.save();

      res.status(200).json({ message: "Permissions mises à jour avec succès" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour des permissions" });
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
      const { nom, prenom, email, fonction, commune, telephone, permissions } =
        req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé." });
      }

      // Vérifier si la commune existe
      const communeExists = await Commune.findById(commune);
      if (!communeExists) {
        return res.status(400).json({ message: "Commune non trouvée." });
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
        commune: communeExists._id, // Utiliser l'ID de la commune
        telephone,
        password: hashedPassword,
        permissions,
        isValidated: true,
        resetToken,
        resetTokenExpiry: Date.now() + 3600000,
      });

      await newUser.save();

      // Envoi de l'e-mail avec les identifiants
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Vos identifiants de connexion - TAG",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #04416d; text-align: center;">Bienvenue sur la plateforme TAG</h2>
            <p>Bonjour <strong>${prenom}</strong>,</p>
            <p>Votre compte a été créé avec succès sur la plateforme TAG.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #04416d; margin-top: 0;">Vos identifiants de connexion :</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 10px 0;">✉️ <strong>Email :</strong> ${email}</li>
                <li style="margin: 10px 0;">🔑 <strong>Mot de passe :</strong> ${plainPassword}</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" 
                 style="display: inline-block; background-color: #04416d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px;">
                Se connecter
              </a>
            </div>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; margin: 0;">
                <strong>⚠️ Important :</strong> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" 
                 style="display: inline-block; background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.<br>
              Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email envoyé avec succès à :", email);
        res.status(201).json({
          message: "Utilisateur créé et e-mail envoyé avec succès !",
          user: {
            nom,
            prenom,
            email,
            permissions,
          },
        });
      } catch (emailError) {
        console.error("❌ Erreur lors de l'envoi de l'email :", emailError);
        // L'utilisateur est créé mais l'email n'a pas pu être envoyé
        res.status(201).json({
          message: "Utilisateur créé mais l'email n'a pas pu être envoyé.",
          user: {
            nom,
            prenom,
            email,
            permissions,
          },
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'utilisateur :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

module.exports = router;
