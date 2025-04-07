const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware d'authentification
const authMiddleware = async (req, res, next) => {
  // Vérifier le token dans les cookies ou dans le header Authorization
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Accès non autorisé" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }
    next();
  } catch (error) {
    res.clearCookie("jwt");
    return res.status(401).json({ message: "Token invalide" });
  }
};

// Middleware d'autorisation pour les admins
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.permissions !== "admin") {
    return res
      .status(403)
      .json({ message: "Accès refusé. Administrateur requis." });
  }
  next();
};

// Middleware d'autorisation pour les juristes et admins
const juristeOrAdminMiddleware = (req, res, next) => {
  if (
    !req.user ||
    (req.user.permissions !== "juriste" && req.user.permissions !== "admin")
  ) {
    return res
      .status(403)
      .json({ message: "Accès refusé. Juriste ou administrateur requis." });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, juristeOrAdminMiddleware };
