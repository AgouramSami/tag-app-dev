import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/CookieBanner.css";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="tag-cookie-banner">
      <div className="tag-cookie-content">
        <p>
          Nous utilisons des cookies pour améliorer votre expérience sur notre
          site. En continuant à naviguer, vous acceptez notre{" "}
          <Link to="/politique-confidentialite" className="tag-cookie-link">
            politique de confidentialité
          </Link>
          .
        </p>
        <button onClick={handleAccept} className="tag-cookie-accept">
          Accepter
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
