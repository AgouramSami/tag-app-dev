import React from "react";
import { Link } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  return (
    <div className="signup-container">
      <div className="signup-card">
      <div className="logo-container">
          <img src="src/assets/tag_logo.svg" alt="TAG Logo" className="logo" />
        </div>
        <form>
          <label className="label_signup">Entrez votre email</label>
          <input className="input_signup" type="email" placeholder="john.doe@gmail.com" />

          <button className="signup-btn">Réinitialiser le mot de passe</button>

          <p>Retour à la <Link to="/login">connexion</Link></p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
