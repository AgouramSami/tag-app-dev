import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/CookieBanner.css";

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowBanner(false);
  };

  const handleMentionsLegales = (e) => {
    e.preventDefault();
    navigate("/mentions-legales");
  };

  const handleConditionsGenerales = (e) => {
    e.preventDefault();
    navigate("/conditions-generales");
  };

  if (!showBanner) return null;

  return (
    <Box className="cookie-banner">
      <Box className="cookie-content">
        <Typography className="cookie-text">
          Nous utilisons des cookies pour améliorer votre expérience sur notre
          site. En continuant à naviguer, vous acceptez notre utilisation des
          cookies.{" "}
          <Link
            href="/mentions-legales"
            onClick={handleMentionsLegales}
            className="cookie-link"
          >
            Mentions légales
          </Link>{" "}
          et{" "}
          <Link
            href="/conditions-generales"
            onClick={handleConditionsGenerales}
            className="cookie-link"
          >
            Conditions générales
          </Link>
        </Typography>
        <Box className="cookie-buttons">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAccept}
            className="cookie-button accept"
          >
            Accepter
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleDecline}
            className="cookie-button decline"
          >
            Refuser
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CookieBanner;
