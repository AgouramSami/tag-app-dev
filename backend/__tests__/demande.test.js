const request = require("supertest");
const { app } = require("../server");
const mongoose = require("mongoose");
const Demande = require("../models/Demandes");
const User = require("../models/User");
const { generateToken } = require("../utils/auth");
const cron = require("node-cron");

// Configuration pour la connexion à la base de données de test
require("dotenv").config({ path: ".env.test" });

// Augmenter le timeout de Jest à 10 secondes
jest.setTimeout(10000);

// Nettoyer la base de données après tous les tests
afterAll(async () => {
  // Arrêter toutes les tâches cron
  cron.getTasks().forEach((task) => task.stop());

  // Fermer la connexion MongoDB
  await mongoose.connection.close();

  // Arrêter tous les timers
  jest.useRealTimers();
});

describe("Tests de création de demande", () => {
  let mockUser;
  let token;

  beforeEach(async () => {
    // Nettoyer la base de données
    await Demande.deleteMany({});
    await User.deleteMany({});

    // Créer l'utilisateur de test
    mockUser = new User({
      email: "test@example.com",
      password: "password123",
      commune: new mongoose.Types.ObjectId(),
      permissions: "user",
    });
    await mockUser.save();

    // Générer le token
    token = generateToken(mockUser);
  });

  test("Création d'une demande avec succès", async () => {
    const demande = {
      theme: "Urbanisme",
      objet: "Permis de construire",
      description: "Demande de renseignements",
      commune: mockUser.commune.toString(),
    };

    const response = await request(app)
      .post("/api/demandes")
      .set("Authorization", `Bearer ${token}`)
      .send(demande);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Demande créée avec succès");
    expect(response.body.demande.theme).toBe(demande.theme);
    expect(response.body.demande.statut).toBe("en attente");
  });

  test("Création d'une demande sans description échoue", async () => {
    const demandeIncomplete = {
      theme: "Urbanisme",
      objet: "Permis de construire",
      commune: mockUser.commune.toString(),
    };

    const response = await request(app)
      .post("/api/demandes")
      .set("Authorization", `Bearer ${token}`)
      .send(demandeIncomplete);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("La description est requise.");
  });
});

describe("Tests de suppression automatique des demandes expirées", () => {
  beforeEach(async () => {
    await Demande.deleteMany({});
  });

  test("Suppression des demandes archivées depuis plus de 5 ans", async () => {
    // Créer une demande archivée avec une date de suppression dépassée
    const dateArchivage = new Date();
    dateArchivage.setFullYear(dateArchivage.getFullYear() - 6); // 6 ans en arrière

    const demandeExpiree = new Demande({
      commune: new mongoose.Types.ObjectId(),
      utilisateur: new mongoose.Types.ObjectId(),
      theme: "Test",
      objet: "Test",
      description: "Test",
      statut: "archivée",
      dateArchivage: dateArchivage,
      dateSuppression: new Date(
        dateArchivage.getTime() + 5 * 365 * 24 * 60 * 60 * 1000
      ), // 5 ans après l'archivage
    });

    await demandeExpiree.save();

    // Créer une demande archivée récente (ne devrait pas être supprimée)
    const demandeRecente = new Demande({
      commune: new mongoose.Types.ObjectId(),
      utilisateur: new mongoose.Types.ObjectId(),
      theme: "Test",
      objet: "Test",
      description: "Test",
      statut: "archivée",
      dateArchivage: new Date(),
      dateSuppression: new Date(
        new Date().getTime() + 5 * 365 * 24 * 60 * 60 * 1000
      ), // 5 ans dans le futur
    });

    await demandeRecente.save();

    // Exécuter la suppression automatique
    await Demande.supprimerDemandesExpirees();

    // Vérifier que seule la demande expirée a été supprimée
    const demandesRestantes = await Demande.find({});
    expect(demandesRestantes).toHaveLength(1);
    expect(demandesRestantes[0]._id.toString()).toBe(
      demandeRecente._id.toString()
    );
  });

  test("Ne supprime pas les demandes non archivées", async () => {
    // Créer une demande non archivée avec une date de suppression dépassée
    const dateSuppression = new Date();
    dateSuppression.setFullYear(dateSuppression.getFullYear() - 6);

    const demandeNonArchivee = new Demande({
      commune: new mongoose.Types.ObjectId(),
      utilisateur: new mongoose.Types.ObjectId(),
      theme: "Test",
      objet: "Test",
      description: "Test",
      statut: "en attente",
      dateSuppression: dateSuppression,
    });

    await demandeNonArchivee.save();

    // Exécuter la suppression automatique
    await Demande.supprimerDemandesExpirees();

    // Vérifier que la demande n'a pas été supprimée
    const demandesRestantes = await Demande.find({});
    expect(demandesRestantes).toHaveLength(1);
    expect(demandesRestantes[0]._id.toString()).toBe(
      demandeNonArchivee._id.toString()
    );
  });

  test("Archivage d'une demande avec date de suppression automatique", async () => {
    // Créer une demande
    const demande = new Demande({
      commune: new mongoose.Types.ObjectId(),
      utilisateur: new mongoose.Types.ObjectId(),
      theme: "Test",
      objet: "Test",
      description: "Test",
      statut: "en attente",
    });

    await demande.save();

    // Archiver la demande
    await demande.archiver(5, "Test d'archivage");

    // Vérifier que la date de suppression est fixée à J+5 ans
    const demandeArchivee = await Demande.findById(demande._id);
    const dateSuppressionAttendue = new Date();
    dateSuppressionAttendue.setFullYear(
      dateSuppressionAttendue.getFullYear() + 5
    );

    expect(demandeArchivee.dateSuppression.getFullYear()).toBe(
      dateSuppressionAttendue.getFullYear()
    );
    expect(demandeArchivee.dateSuppression.getMonth()).toBe(
      dateSuppressionAttendue.getMonth()
    );
    expect(demandeArchivee.dateSuppression.getDate()).toBe(
      dateSuppressionAttendue.getDate()
    );
  });
});
