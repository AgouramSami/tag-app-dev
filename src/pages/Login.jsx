import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      if (response.data.token) {
        await login(response.data);
      } else {
        setError("Erreur d'authentification.");
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(err.response?.data?.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="signup-card">
        <div className="logo-container">
          <img src="src/assets/tag_logo.svg" alt="TAG Logo" className="logo" />
        </div>

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
          <input
            id="password"
            className="input_signup"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            required
          />

          <Link to="/forgot-password" className="forgot-password">
            Mot de passe oublié ?
          </Link>

          <button type="submit" className="signup-btn3" disabled={loading}>
            {loading ? "Connexion en cours..." : "CONNEXION"}
          </button>
          {/*  
          <Link to="/signup">
            <button type="button" className="signup-btn2">
              INSCRIPTION
            </button>
          </Link>
*/}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
