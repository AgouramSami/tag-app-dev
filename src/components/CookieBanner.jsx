import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Link,
  Stack,
  FormControlLabel,
  Switch,
  Collapse,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/CookieBanner.css";

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [cookies, setCookies] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    setCookies({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    handleSave();
  };

  const handleSave = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(cookies));
    setShowBanner(false);
  };

  const handleReject = () => {
    setCookies({
      necessary: true,
      analytics: false,
      marketing: false,
    });
    handleSave();
  };

  if (!showBanner) return null;

  return (
    <Paper
      elevation={3}
      className="cookie-banner"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        p: 3,
        zIndex: 1000,
        borderRadius: "16px 16px 0 0",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              🍪 Nous utilisons des cookies
            </Typography>
            <Button
              size="small"
              onClick={() => setShowDetails(!showDetails)}
              sx={{ color: "primary.main" }}
            >
              {showDetails ? "Masquer les détails" : "Voir les détails"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Nous utilisons des cookies pour améliorer votre expérience sur notre
            site. En continuant à naviguer, vous acceptez notre utilisation des
            cookies.
          </Typography>

          <Collapse in={showDetails}>
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={cookies.necessary}
                      disabled
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2">
                        Cookies nécessaires
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ces cookies sont indispensables au fonctionnement du
                        site.
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={cookies.analytics}
                      onChange={(e) =>
                        setCookies({ ...cookies, analytics: e.target.checked })
                      }
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2">
                        Cookies analytiques
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Nous aident à comprendre comment les visiteurs
                        interagissent avec notre site.
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={cookies.marketing}
                      onChange={(e) =>
                        setCookies({ ...cookies, marketing: e.target.checked })
                      }
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2">
                        Cookies marketing
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Permettent de personnaliser votre expérience et de vous
                        envoyer des contenus pertinents.
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Box>
          </Collapse>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={handleReject}
              sx={{ borderRadius: "20px" }}
            >
              Rejeter tout
            </Button>
            <Button
              variant="contained"
              onClick={handleAcceptAll}
              sx={{ borderRadius: "20px" }}
            >
              Tout accepter
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ borderRadius: "20px" }}
            >
              Enregistrer mes préférences
            </Button>
          </Box>

          <Typography
            variant="caption"
            sx={{ textAlign: "center", color: "text.secondary" }}
          >
            Pour plus d'informations, consultez notre{" "}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/politique-confidentialite")}
              sx={{ textDecoration: "underline" }}
            >
              politique de confidentialité
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};

export default CookieBanner;
