import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreerDemande from "../pages/CreerDemande";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

// Mock axios
jest.mock("axios");

// Mock du localStorage/sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, "sessionStorage", { value: mockSessionStorage });

describe("Test de création d'une demande", () => {
  beforeEach(() => {
    // Simuler un utilisateur connecté avec un token
    mockSessionStorage.getItem.mockReturnValue("fake-jwt-token");
  });

  test("Scénario complet : création et envoi d'une demande", async () => {
    // 1. Préparation de la réponse simulée du backend
    const mockResponse = {
      status: 201,
      data: {
        message: "Demande créée avec succès",
        demande: {
          _id: "123",
          theme: "Urbanisme",
          objet: "Permis de construire",
          description: "Demande de renseignements",
          statut: "en attente",
          dateCreation: new Date().toISOString(),
        },
      },
    };
    axios.post.mockResolvedValue(mockResponse);

    // 2. Rendu du composant
    render(
      <BrowserRouter>
        <AuthProvider>
          <CreerDemande />
        </AuthProvider>
      </BrowserRouter>
    );

    // 3. Simulation du remplissage du formulaire
    fireEvent.change(screen.getByLabelText(/thème/i), {
      target: { value: "Urbanisme" },
    });

    fireEvent.change(screen.getByLabelText(/objet/i), {
      target: { value: "Permis de construire" },
    });

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Demande de renseignements" },
    });

    // 4. Simulation de l'upload de fichier
    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const fileInput = screen.getByLabelText(/pièces jointes/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // 5. Envoi du formulaire
    fireEvent.click(screen.getByText(/envoyer ma demande/i));

    // 6. Vérifications
    await waitFor(() => {
      // Vérifie que la requête a été envoyée avec les bonnes données
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/demandes"),
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer fake-jwt-token",
          }),
        })
      );

      // Vérifie que le message de succès est affiché
      expect(
        screen.getByText(/demande créée avec succès/i)
      ).toBeInTheDocument();
    });

    // 7. Vérification des données envoyées
    const sentData = axios.post.mock.calls[0][1];
    expect(sentData.get("theme")).toBe("Urbanisme");
    expect(sentData.get("objet")).toBe("Permis de construire");
    expect(sentData.get("description")).toBe("Demande de renseignements");
    expect(sentData.get("fichiers")).toBeTruthy();
  });
});
