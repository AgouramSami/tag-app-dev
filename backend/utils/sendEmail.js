const nodemailer = require("nodemailer");

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  service: "gmail", // Si tu utilises Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

/**
 * Fonction pour envoyer un email
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Sujet du mail
 * @param {string} text - Contenu en texte brut
 * @param {string} html - Contenu HTML (optionnel)
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Expéditeur
      to,
      subject,
      text,
      html: html || text, // Si pas de HTML, on envoie le texte brut
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📩 Email envoyé :", info.response);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error);
  }
};

module.exports = sendEmail;
