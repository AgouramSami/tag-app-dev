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
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
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

// Route pour créer l'administrateur initial (à supprimer après utilisation)
router.post("/create-admin", async (req, res) => {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ permissions: "admin" });
    if (adminExists) {
      return res.status(403).json({
        message: "Un administrateur existe déjà. Cette route est désactivée.",
      });
    }

    const { email, password } = req.body;

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'administrateur
    const admin = new User({
      email,
      password: hashedPassword,
      nom: "Admin",
      prenom: "System",
      fonction: "administrateur",
      commune: new mongoose.Types.ObjectId(), // Commune par défaut
      permissions: "admin",
      isValidated: true,
      isActive: true,
    });

    await admin.save();

    res.status(201).json({
      message: "Administrateur créé avec succès.",
      user: {
        email: admin.email,
        nom: admin.nom,
        prenom: admin.prenom,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'administrateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
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

    // Définir le cookie HTTPOnly
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true en production
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // lax en développement
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    });

    // Envoyer la réponse au front sans le token
    res.status(200).json({
      message: "Connexion réussie",
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

// Ajouter une route de déconnexion qui supprime le cookie
router.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Déconnexion réussie" });
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

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("commune");
    res.status(200).json({ user });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(401).json({ message: "Token invalide" });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log("Token reçu:", token);

    // Vérifie si l'utilisateur avec ce token existe
    const user = await User.findOne({ resetToken: token });
    console.log(
      "Utilisateur trouvé:",
      user
        ? {
            email: user.email,
            resetToken: user.resetToken,
            resetTokenExpiry: user.resetTokenExpiry
              ? new Date(user.resetTokenExpiry).toLocaleString()
              : "Non défini",
          }
        : "Non"
    );

    if (!user) {
      console.log("Token invalide ou expiré");
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }

    // Vérifier si le token n'est pas expiré
    if (user.resetTokenExpiry && user.resetTokenExpiry < Date.now()) {
      console.log("Token expiré");
      return res.status(400).json({ message: "Token expiré." });
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Supprime le token après usage
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    console.log("Mot de passe mis à jour avec succès");
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
    const { nom, prenom, email, photoUrl, commune } = req.body;
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
      { nom, prenom, email, photoUrl, commune },
      { new: true }
    )
      .populate("commune")
      .select("-password");

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

// Route pour vérifier la validité du token
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    console.log("Vérification du token:", req.params.token);

    const user = await User.findOne({
      resetToken: req.params.token,
    });

    console.log("Utilisateur trouvé:", user ? "Oui" : "Non");

    if (!user) {
      console.log("Token non trouvé dans la base de données");
      return res.status(400).json({
        message: "Token non trouvé",
        valid: false,
        reason: "not_found",
      });
    }

    if (!user.resetTokenExpiry) {
      console.log("Token sans date d'expiration");
      return res.status(400).json({
        message: "Token invalide",
        valid: false,
        reason: "invalid",
      });
    }

    if (user.resetTokenExpiry < Date.now()) {
      console.log("Token expiré");
      return res.status(400).json({
        message: "Token expiré",
        valid: false,
        reason: "expired",
      });
    }

    console.log("Token valide");
    res.json({
      valid: true,
      message: "Token valide",
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res.status(500).json({
      message: "Erreur serveur",
      valid: false,
      reason: "server_error",
    });
  }
});

// Route pour la réinitialisation du mot de passe
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📧 Demande de réinitialisation pour l'email:", email);

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Aucun utilisateur trouvé avec cet email");
      return res.status(404).json({
        message: "Aucun compte n'est associé à cet email.",
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 heure

    // Mettre à jour l'utilisateur
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    console.log("Token généré:", resetToken);
    console.log(
      "Date d'expiration:",
      new Date(resetTokenExpiry).toLocaleString()
    );

    // Créer le lien de réinitialisation
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("URL de réinitialisation:", resetUrl);

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
    console.log("Email envoyé avec succès");

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

// Route pour exporter les données personnelles
router.get("/export-data", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const userData = user.toObject();

    // Ajouter la date d'export
    userData.dateExport = new Date().toISOString();

    // Créer un fichier JSON avec les données
    const fileName = `export_${user.email}_${Date.now()}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.json(userData);
  } catch (error) {
    console.error("Erreur lors de l'export des données:", error);
    res.status(500).json({ message: "Erreur lors de l'export des données" });
  }
});

// Route pour supprimer le compte
router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Supprimer la photo de profil si elle existe
    if (user.photoUrl && !user.photoUrl.startsWith("http")) {
      const photoPath = path.join(__dirname, "..", user.photoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(req.user._id);

    // Supprimer le cookie JWT
    res.clearCookie("jwt");

    res.status(200).json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du compte" });
  }
});

module.exports = router;
