exports.signup = async (req, res) => {
  try {
    console.log("🟢 Données reçues du frontend :", req.body); // Vérifie les données reçues

    const { nom, prenom, email, fonction, commune, telephone, password } =
      req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Cet email est déjà utilisé." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      nom,
      prenom,
      email,
      fonction,
      commune,
      telephone,
      password: hashedPassword,
    });

    await user.save();
    console.log("✅ Utilisateur enregistré dans MongoDB :", user);

    res
      .status(201)
      .json({
        message: "Utilisateur créé avec succès.",
        requiresValidation: true,
      });
  } catch (error) {
    console.error("🔴 Erreur serveur :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
