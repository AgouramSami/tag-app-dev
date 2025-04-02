import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="tag-footer">
      <div className="tag-footer-content">
        <div className="tag-footer-section">
          <h3>À propos</h3>
          <p>
            TAG-App est une plateforme de gestion des demandes juridiques pour
            les communes.
          </p>
        </div>
        <div className="tag-footer-section">
          <h3>Liens utiles</h3>
          <ul>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/politique-confidentialite">
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <a href="mailto:contact@tag-app.fr">Contact</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="tag-footer-bottom">
        <p>&copy; {new Date().getFullYear()} TAG-App. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;
