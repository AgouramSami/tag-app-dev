const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Vérification de la force du mot de passe
const isPasswordStrong = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[-.@$!%*?&])[A-Za-z\d-.@$!%*?&]{8,}$/;
  return regex.test(password);
};

// ✅ Route d'inscription sécurisée
router.post("/signup", (req, res) => {
  return res.status(403).json({
    message:
      "L'inscription est désactivée. Seuls les administrateurs peuvent créer des comptes.",
  });
});

// ✅ Route de connexion sécurisée
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔑 Tentative de connexion pour:", email);

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Utilisateur non trouvé:", email);
      return res.status(400).json({ message: "Utilisateur non trouvé." });
    }
    console.log("✅ Utilisateur trouvé");

    // Vérifier le mot de passe
    console.log("🔒 Vérification du mot de passe...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Résultat de la comparaison:", isMatch);

    if (!isMatch) {
      // Incrémenter le compteur de tentatives
      user.tentativesConnexion += 1;
      await user.save();
      console.log(
        "❌ Mot de passe incorrect, tentatives:",
        user.tentativesConnexion
      );
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }
    console.log("✅ Mot de passe correct");

    // Vérifier si l'utilisateur est validé
    if (!user.isValidated) {
      console.log("❌ Compte non validé");
      return res.status(403).json({
        message: "Votre compte n'est pas encore validé par un administrateur.",
      });
    }
    console.log("✅ Compte validé");

    // Vérifier si le compte est bloqué
    if (user.compteBloquer) {
      console.log("❌ Compte bloqué");
      return res.status(403).json({
        message:
          "Votre compte est bloqué. Veuillez contacter un administrateur.",
      });
    }
    console.log("✅ Compte actif");

    // Réinitialiser le compteur de tentatives et mettre à jour la dernière connexion
    user.tentativesConnexion = 0;
    user.derniereConnexion = new Date();
    await user.save();

    // Générer le token avec permissions
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        permissions: user.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Envoyer la réponse au front
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        _id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        permissions: user.permissions,
        fonction: user.fonction,
        commune: user.commune,
        telephone: user.telephone,
        isValidated: user.isValidated,
        isActive: user.isActive,
        photoUrl: user.photoUrl || "/default-avatar.png",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post(
  "/create-user",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        nom,
        prenom,
        email,
        fonction,
        commune,
        telephone,
        password,
        role,
      } = req.body;

      // Vérifier si l'email est déjà utilisé
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé." });
      }

      // Générer un mot de passe aléatoire s'il n'est pas fourni
      let userPassword = password;
      if (!password) {
        userPassword = Math.random().toString(36).slice(-8); // Mot de passe temporaire
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userPassword, 10);

      // Créer un nouvel utilisateur
      const newUser = new User({
        nom,
        prenom,
        email,
        fonction,
        commune,
        telephone,
        password: hashedPassword,
        role: role || "utilisateur", // Rôle par défaut utilisateur
        isValidated: true, // Directement validé par l'admin
      });

      await newUser.save();

      res.status(201).json({
        message: "Utilisateur créé avec succès.",
        user: { nom, prenom, email, role },
        temporaryPassword: password ? undefined : userPassword, // Envoyer le mot de passe généré si pas fourni
      });
    } catch (error) {
      console.error("❌ Erreur serveur :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);
router.get(
  "/admin-route",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    res.status(200).json({ message: "Bienvenue, administrateur !" });
  }
);

router.get("/me", async (req, res) => {
  console.log("🔍 Auth Header reçu :", req.headers.authorization);

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Vérifie si l'utilisateur avec ce token existe
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Supprime le token après usage
    user.resetToken = undefined;
    await user.save();

    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation du mot de passe :",
      error
    );
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Route pour mettre à jour le profil utilisateur
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { nom, prenom, email, photoUrl } = req.body;
    const userId = req.user._id;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé." });
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nom, prenom, email, photoUrl },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du profil" });
  }
});

// Route pour télécharger la photo de profil
router.post(
  "/upload-photo",
  authMiddleware,
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Aucun fichier n'a été téléchargé" });
      }

      const userId = req.user._id;
      const photoUrl = `/uploads/${req.file.filename}`;

      // Mettre à jour l'utilisateur avec la nouvelle URL de la photo
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { photoUrl },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      res.status(200).json({ photoUrl: updatedUser.photoUrl });
    } catch (error) {
      console.error("Erreur lors du téléchargement de la photo:", error);
      res
        .status(500)
        .json({ message: "Erreur lors du téléchargement de la photo" });
    }
  }
);

// Route pour la réinitialisation du mot de passe
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Aucun compte n'est associé à cet email.",
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 heure

    await user.save();

    // Créer le lien de réinitialisation
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Envoyer l'email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #012947; text-align: center;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour le réinitialiser :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #f3633f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser mon mot de passe</a>
          </div>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "Un email de réinitialisation a été envoyé à votre adresse.",
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'email de réinitialisation:",
      error
    );
    res.status(500).json({
      message:
        "Une erreur est survenue lors de l'envoi de l'email de réinitialisation.",
    });
  }
});

module.exports = router;
