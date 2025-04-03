import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import CreerDemande from "./pages/CreerDemande";
import MesDemandes from "./pages/MesDemandes";
import FAQ from "./pages/FAQ";
import FAQArticle from "./pages/FAQArticle";
import Profil from "./pages/Profil";
import Header from "./components/Header";
import ResetPassword from "./pages/ResetPassword";
import JuristeDashboard from "./pages/JuristeDashboard";
import JuristePanel from "./pages/JuristePanel";
import AdminDashboard from "./pages/AdminDashboard";
import Statistiques from "./pages/Statistiques";
import { useAuth } from "./context/AuthContext";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import CookieBanner from "./components/CookieBanner";
import ParametresRGPD from "./pages/ParametresRGPD";

function App() {
  const { isAuthenticated, checkAccess, getDefaultRoute } = useAuth();

  // Liste des routes publiques
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  // Vérifie si la route actuelle est publique
  const isPublicRoute = publicRoutes.some((route) =>
    window.location.pathname.startsWith(route)
  );

  return (
    <div className="tag-app-container">
      {isAuthenticated && !isPublicRoute && <Header />}

      <div style={{ paddingBottom: isPublicRoute ? "0" : "80px" }}>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? getDefaultRoute() : "/login"} />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/creer-demande"
            element={
              checkAccess("user") ? (
                <CreerDemande />
              ) : (
                <Navigate to={getDefaultRoute()} />
              )
            }
          />
          <Route
            path="/mes-demandes"
            element={
              checkAccess("user") ? (
                <MesDemandes />
              ) : (
                <Navigate to={getDefaultRoute()} />
              )
            }
          />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/faq/:id" element={<FAQArticle />} />
          <Route
            path="/admin"
            element={
              checkAccess("admin") ? (
                <AdminDashboard />
              ) : (
                <Navigate to={getDefaultRoute()} />
              )
            }
          />
          <Route
            path="/admin/panel"
            element={
              checkAccess("admin") ? (
                <AdminPanel />
              ) : (
                <Navigate to={getDefaultRoute()} />
              )
            }
          />
          <Route
            path="/admin/statistiques"
            element={
              checkAccess("admin") ? (
                <Statistiques />
              ) : (
                <Navigate to={getDefaultRoute()} />
              )
            }
          />
          <Route
            path="/juriste"
            element={
              checkAccess("juriste") ? (
                <JuristeDashboard />
              ) : (
                <Navigate to={getDefaultRoute()} />
              )
            }
          />
          <Route
            path="/juriste/panel"
            element={
              checkAccess("juriste") ? (
                <JuristePanel />
              ) : (
                <Navigate to={getDefaultRoute()} />
              )
            }
          />
          <Route
            path="/profil"
            element={isAuthenticated ? <Profil /> : <Navigate to="/login" />}
          />
          <Route
            path="/politique-confidentialite"
            element={<PolitiqueConfidentialite />}
          />
          <Route
            path="/parametres-rgpd"
            element={
              isAuthenticated ? <ParametresRGPD /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>

      <CookieBanner />
    </div>
  );
}

export default App;
