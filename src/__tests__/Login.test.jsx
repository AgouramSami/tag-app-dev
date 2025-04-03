import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../pages/Login";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter } from "react-router-dom";

// Mock du contexte d'authentification
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

describe("Test du formulaire de connexion", () => {
  const renderLogin = () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test("Affiche un message d'erreur si email vide", async () => {
    renderLogin();

    // Trouve le bouton de connexion et clique dessus
    const submitButton = screen.getByRole("button", { name: /connexion/i });
    fireEvent.click(submitButton);

    // Vérifie que le message d'erreur est affiché
    expect(
      screen.getByText("Veuillez remplir tous les champs")
    ).toBeInTheDocument();
  });

  test("Les champs du formulaire se remplissent correctement", () => {
    renderLogin();

    // Trouve les champs de saisie
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);

    // Simule la saisie
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Vérifie que les valeurs sont correctement définies
    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });
});
