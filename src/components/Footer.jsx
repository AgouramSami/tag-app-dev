import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="tag-footer">
      <div className="tag-footer-content">
        <div className="tag-footer-links">
          <Link to="/mentions-legales" className="tag-footer-link">
            Mentions légales
          </Link>
          <Link to="/politique-confidentialite" className="tag-footer-link">
            Politique de confidentialité
          </Link>
          <Link to="/contact" className="tag-footer-link">
            Contact
          </Link>
        </div>
        <div className="tag-footer-copyright">
          © {new Date().getFullYear()} TAG. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
