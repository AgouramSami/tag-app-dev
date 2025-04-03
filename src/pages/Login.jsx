import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Login.css";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000";

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Identifiants invalides");
      }

      login(data);
      // Rediriger vers la page précédente ou la page d'accueil
      const redirectPath = location.state?.from?.pathname || "/";
      navigate(redirectPath);
    } catch (error) {
      setError(error.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tag-login-container">
      <div className="signup-card">
        <div className="logo-container">
          <img src="src/assets/tag_logo.svg" alt="TAG Logo" className="logo" />
        </div>

        {error && (
          <div className="tag-login-error-container">
            <p className="tag-login-error-message">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email" className="label_signup">
            Email
          </label>
          <input
            id="email"
            className="input_signup"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john.doe@gmail.com"
            required
          />

          <label htmlFor="password" className="label_signup">
            Mot de passe
          </label>
          <div className="tag-password-input-container">
            <input
              id="password"
              className="input_signup"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
            />
            <button
              type="button"
              className="tag-password-toggle-btn"
              onClick={togglePasswordVisibility}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          <Link to="/forgot-password" className="tag-forgot-password">
            Mot de passe oublié ?
          </Link>

          <button type="submit" className="tag-signup-btn3" disabled={loading}>
            {loading ? "Connexion en cours..." : "CONNEXION"}
          </button>
          {/*  
          <Link to="/signup">
            <button type="button" className="tag-signup-btn2">
              INSCRIPTION
            </button>
          </Link>
*/}
        </form>
      </div>
    </div>
  );
};

export default Login;
