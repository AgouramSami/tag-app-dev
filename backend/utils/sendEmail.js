const nodemailer = require("nodemailer");

// Configuration du transporteur SMTP avec des options anti-spam
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Options pour améliorer la délivrabilité
  pool: true,
  maxConnections: 1,
  maxMessages: 20,
  rateDelta: 20000, // 20 secondes entre chaque email
  rateLimit: 3,
  dkim: {
    domainName: "gmail.com",
    keySelector: "2023",
    privateKey: process.env.DKIM_PRIVATE_KEY,
  },
});

/**
 * Fonction pour envoyer un email avec des paramètres optimisés
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: {
        name: "TAG - Support",
        address: process.env.EMAIL_USER,
      },
      replyTo: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: html || text,
      // En-têtes pour améliorer la délivrabilité
      headers: {
        "X-Mailer": "TAG Mailer",
        "X-Entity-Ref-ID": `TAG-${new Date().getTime()}`,
        "List-Unsubscribe": `<${process.env.FRONTEND_URL}/unsubscribe>, <mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
        "Feedback-ID": "TAG:gmail",
        "X-Priority": "3",
        "Message-ID": `<${Math.random().toString(36).substring(2)}@gmail.com>`,
        "X-Report-Abuse": `Please report abuse here: ${process.env.FRONTEND_URL}/contact`,
      },
      dsn: {
        id: `TAG-${new Date().getTime()}`,
        return: "headers",
        notify: ["failure", "delay"],
        recipient: process.env.EMAIL_USER,
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📩 Email envoyé :", info.response);
    console.log("Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error);
    throw error;
  }
};

// Vérifier la configuration du transporteur au démarrage
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Erreur de configuration SMTP:", error);
  } else {
    console.log("✅ Serveur SMTP prêt à envoyer des emails");
  }
});

module.exports = sendEmail;
