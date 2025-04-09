import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Pages d'authentification
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
import PrivacySettings from "./pages/PrivacySettings";

// Pages des tableaux de bord/accueil
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JuristeDashboard from "./pages/JuristeDashboard";

// Pages de gestion des demandes
import CreerDemande from "./pages/CreerDemande";
import MesDemandes from "./pages/MesDemandes";
import JuristePanel from "./pages/JuristePanel";
import AdminPanel from "./pages/AdminPanel";

// Pages d'analyse et faq
import Statistiques from "./pages/Statistiques";
import FAQ from "./pages/FAQ";

// Pages de profil et paramètres
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";

// Composants UI réutilisables
import Header from "./components/Header";
import CookieBanner from "./components/CookieBanner";

// Contexte d'authentification
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated, checkAccess, getDefaultRoute } = useAuth();

  {
    /* Routes publiques qui ne nécessitent pas d'authentification */
  }
  const publicRoutes = ["/login", "/forgot-password", "/reset-password"];

  {
    /* Vérifie si la route actuelle est publique */
  }
  const isPublicRoute = publicRoutes.some((route) =>
    window.location.pathname.startsWith(route)
  );

  {
    /* Composant pour protéger les routes */
  }
  const ProtectedRoute = ({ permissions, children }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (permissions && !checkAccess(permissions))
      return <Navigate to={getDefaultRoute()} />;
    return children;
  };

  return (
    <div className="tag-app-container">
      {/* Affiche le header seulement si l'utilisateur est authentifié et la route n'est pas publique */}
      {isAuthenticated && !isPublicRoute && <Header />}

      <div style={{ paddingBottom: isPublicRoute ? "0" : "80px" }}>
        <Routes>
          {/* Route racine avec redirection */}
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? getDefaultRoute() : "/login"} />
            }
          />

          {/* Pages d'authentification */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Pages du tableau de bord */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute>{<Dashboard />}</ProtectedRoute>}
          />

          {/* Pages de gestion des demandes */}
          <Route
            path="/creer-demande"
            element={
              <ProtectedRoute permissions="user">
                <CreerDemande />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mes-demandes"
            element={
              <ProtectedRoute permissions="user">
                <MesDemandes />
              </ProtectedRoute>
            }
          />

          {/* Pages publiques d'information */}
          <Route path="/faq" element={<FAQ />} />
          <Route
            path="/politique-confidentialite"
            element={<PolitiqueConfidentialite />}
          />

          {/* Pages administrateur */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute permissions="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/panel"
            element={
              <ProtectedRoute permissions="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/statistiques"
            element={
              <ProtectedRoute permissions="admin">
                <Statistiques />
              </ProtectedRoute>
            }
          />

          {/* Pages juriste */}
          <Route
            path="/juriste"
            element={
              <ProtectedRoute permissions="juriste">
                <JuristeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/juriste/panel"
            element={
              <ProtectedRoute permissions="juriste">
                <JuristePanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/juriste/demandes"
            element={
              <ProtectedRoute permissions="juriste">
                <JuristePanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/juriste/statistiques"
            element={
              <ProtectedRoute permissions="juriste">
                <Statistiques />
              </ProtectedRoute>
            }
          />

          {/* Pages de profil et paramètres */}
          <Route path="/profil" element={<UserProfile />} />
          <Route path="/parametres-rgpd" element={<PrivacySettings />} />

          {/* Route de redirection des statistiques */}
          <Route
            path="/statistiques"
            element={
              <ProtectedRoute>
                {checkAccess("admin") ? (
                  <Navigate to="/admin/statistiques" />
                ) : checkAccess("juriste") ? (
                  <Navigate to="/juriste/statistiques" />
                ) : (
                  <Navigate to={getDefaultRoute()} />
                )}
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      <CookieBanner />
    </div>
  );
}

export default App;
