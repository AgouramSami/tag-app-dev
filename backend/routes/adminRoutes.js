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

      user.isValidated = !user.isValidated;
      await user.save();

      console.log("✅ Utilisateur mis à jour :", user);
      res.status(200).json({
        message: "Utilisateur mis à jour",
        isValidated: user.isValidated,
      });
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
  // Utiliser des caractères plus simples pour éviter les confusions
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Sans I et O
  const lowercase = "abcdefghijkmnpqrstuvwxyz"; // Sans l et o
  const numbers = "23456789"; // Sans 0 et 1
  const symbols = "@#$!";

  let password = "";

  // Au moins une majuscule
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  // Au moins une minuscule
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  // Au moins un chiffre
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  // Au moins un symbole
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  // Compléter jusqu'à 8 caractères
  while (password.length < 8) {
    const allChars = uppercase + lowercase + numbers + symbols;
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Mélanger le mot de passe
  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

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
      console.log("🔑 Mot de passe généré:", plainPassword);

      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      console.log("🔒 Mot de passe hashé créé");

      // Générer un token pour la réinitialisation du mot de passe
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Créer un nouvel utilisateur
      const newUser = new User({
        nom,
        prenom,
        email,
        fonction,
        commune: communeExists._id,
        telephone,
        password: hashedPassword,
        permissions,
        isValidated: true,
        resetToken,
        resetTokenExpiry: Date.now() + 3600000,
      });

      console.log("👤 Nouvel utilisateur avant sauvegarde:", {
        email: newUser.email,
        passwordLength: newUser.password.length,
        isValidated: newUser.isValidated,
      });

      await newUser.save();

      console.log("✅ Utilisateur sauvegardé avec succès");

      // Envoi de l'e-mail avec les identifiants
      const mailOptions = {
        from: {
          name: "TAG - Support",
          address: process.env.EMAIL_USER,
        },
        to: email,
        subject: "Bienvenue sur TAG - Activation de votre compte",
        text: `
Bienvenue sur TAG - Territoires Avocats Groupement

Bonjour ${prenom} ${nom},

Votre compte a été créé avec succès sur la plateforme TAG.

Vos identifiants de connexion :
- Email : ${email}
- Mot de passe temporaire : ${plainPassword}

Pour accéder à la plateforme : ${process.env.FRONTEND_URL}/login

Important : Pour votre sécurité, nous vous recommandons de modifier votre mot de passe dès votre première connexion.

Pour modifier votre mot de passe : ${process.env.FRONTEND_URL}/reset-password/${resetToken}

Cordialement,
L'équipe TAG

---
Cet email a été envoyé par TAG - Territoires Avocats Groupement
Pour nous contacter : ${process.env.FRONTEND_URL}/contact
Mentions légales : ${process.env.FRONTEND_URL}/mentions-legales
`,
        html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenue sur TAG</title>
          </head>
          <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;line-height:1.6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="min-width:100%;background-color:#f5f5f5;">
              <tr>
                <td align="center" style="padding:40px 0;">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding:40px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <!-- Logo -->
                          <tr>
                            <td align="center" style="padding-bottom:30px;">
                              <img src="${process.env.FRONTEND_URL}/logo.png" alt="TAG Logo" style="max-width:200px;height:auto;">
                            </td>
                          </tr>
                          
                          <!-- Titre -->
                          <tr>
                            <td align="center" style="padding-bottom:30px;">
                              <h1 style="margin:0;color:#04416d;font-size:24px;">Bienvenue sur TAG</h1>
                            </td>
                          </tr>
                          
                          <!-- Contenu -->
                          <tr>
                            <td style="padding-bottom:30px;">
                              <p>Bonjour ${prenom} ${nom},</p>
                              <p>Votre compte a été créé avec succès sur la plateforme TAG (Territoires Avocats Groupement).</p>
                            </td>
                          </tr>
                          
                          <!-- Identifiants -->
                          <tr>
                            <td style="padding:20px;background-color:#f8f9fa;border-radius:5px;margin-bottom:30px;">
                              <h2 style="margin:0 0 15px;color:#04416d;font-size:18px;">Vos identifiants de connexion</h2>
                              <p style="margin:5px 0;"><strong>Email :</strong> ${email}</p>
                              <p style="margin:5px 0;"><strong>Mot de passe temporaire :</strong> ${plainPassword}</p>
                            </td>
                          </tr>
                          
                          <!-- Bouton Connexion -->
                          <tr>
                            <td align="center" style="padding:30px 0;">
                              <a href="${process.env.FRONTEND_URL}/login" 
                                 style="display:inline-block;padding:12px 30px;background-color:#04416d;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold;">
                                Accéder à la plateforme
                              </a>
                            </td>
                          </tr>
                          
                          <!-- Message Important -->
                          <tr>
                            <td style="padding:20px;background-color:#fff3cd;border-radius:5px;margin:30px 0;">
                              <p style="margin:0;color:#856404;">
                                <strong>Important :</strong> Pour votre sécurité, nous vous recommandons de modifier votre mot de passe dès votre première connexion.
                              </p>
                            </td>
                          </tr>
                          
                          <!-- Bouton Modification mot de passe -->
                          <tr>
                            <td align="center" style="padding:30px 0;">
                              <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" 
                                 style="display:inline-block;padding:12px 30px;background-color:#28a745;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold;">
                                Modifier mon mot de passe
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 40px;background-color:#f8f9fa;border-radius:0 0 8px 8px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="color:#666666;font-size:12px;">
                              <p style="margin:0 0 10px;">Ce message a été envoyé automatiquement par TAG - Territoires Avocats Groupement</p>
                              <p style="margin:0 0 10px;">Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
                              <p style="margin:0;">
                                <a href="${process.env.FRONTEND_URL}/contact" style="color:#04416d;text-decoration:none;">Nous contacter</a> |
                                <a href="${process.env.FRONTEND_URL}/mentions-legales" style="color:#04416d;text-decoration:none;">Mentions légales</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
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
