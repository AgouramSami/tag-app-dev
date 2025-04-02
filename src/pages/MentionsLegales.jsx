import React from "react";
import { Box, Typography, Container, Paper } from "@mui/material";
import "../styles/MentionsLegales.css";

const MentionsLegales = () => {
  return (
    <Container maxWidth="md" className="mentions-legales-container">
      <Paper elevation={3} className="mentions-legales-paper">
        <Typography variant="h4" gutterBottom>
          Mentions Légales
        </Typography>

        <Box className="mentions-section">
          <Typography variant="h6" gutterBottom>
            1. Informations légales
          </Typography>
          <Typography paragraph>
            Le présent site est la propriété de TAG (Trouvez une Aide Gratuite).
            <br />
            Adresse : [Adresse de l'entreprise]
            <br />
            SIRET : [Numéro SIRET]
            <br />
            Contact : [Email de contact]
          </Typography>
        </Box>

        <Box className="mentions-section">
          <Typography variant="h6" gutterBottom>
            2. Protection des données personnelles
          </Typography>
          <Typography paragraph>
            Conformément à la loi "Informatique et Libertés" du 6 janvier 1978
            modifiée et au Règlement Général sur la Protection des Données
            (RGPD), vous disposez d'un droit d'accès, de rectification et de
            suppression des données vous concernant.
          </Typography>
        </Box>

        <Box className="mentions-section">
          <Typography variant="h6" gutterBottom>
            3. Cookies
          </Typography>
          <Typography paragraph>
            Notre site utilise des cookies pour améliorer votre expérience de
            navigation. En continuant à utiliser notre site, vous acceptez
            l'utilisation de ces cookies. Pour plus d'informations, consultez
            notre politique de confidentialité.
          </Typography>
        </Box>

        <Box className="mentions-section">
          <Typography variant="h6" gutterBottom>
            4. Propriété intellectuelle
          </Typography>
          <Typography paragraph>
            L'ensemble du contenu de ce site (textes, images, vidéos, etc.) est
            protégé par le droit d'auteur. Toute reproduction, même partielle,
            est strictement interdite sans autorisation préalable.
          </Typography>
        </Box>

        <Box className="mentions-section">
          <Typography variant="h6" gutterBottom>
            5. Hébergement
          </Typography>
          <Typography paragraph>
            Ce site est hébergé par [Nom de l'hébergeur]
            <br />
            Adresse : [Adresse de l'hébergeur]
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default MentionsLegales;
