const multer = require("multer");
const path = require("path"); // ✅ Import du module path

// 📌 Configuration de stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Assure-toi que le dossier uploads/ existe
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// 📌 Vérification des types de fichiers
const fileFilter = (req, file, cb) => {
  const fileTypes = /pdf|jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(
      new Error("Seuls les fichiers PDF, JPEG, JPG et PNG sont autorisés.")
    );
  }
};

// 📌 Configuration de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});

module.exports = upload;
