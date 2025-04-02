import React from "react";
import { Box, Typography, Container, Paper } from "@mui/material";
import "../styles/ConditionsGenerales.css";

const ConditionsGenerales = () => {
  return (
    <Container maxWidth="md" className="conditions-generales-container">
      <Paper elevation={3} className="conditions-generales-paper">
        <Typography variant="h4" gutterBottom>
          Conditions Générales d'Utilisation
        </Typography>

        <Box className="conditions-section">
          <Typography variant="h6" gutterBottom>
            1. Acceptation des conditions
          </Typography>
          <Typography paragraph>
            En accédant et en utilisant le service TAG (Trouvez une Aide
            Gratuite), vous acceptez d'être lié par ces conditions générales
            d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne
            pas utiliser notre service.
          </Typography>
        </Box>

        <Box className="conditions-section">
          <Typography variant="h6" gutterBottom>
            2. Description du service
          </Typography>
          <Typography paragraph>
            TAG est une plateforme permettant aux utilisateurs de poser des
            questions juridiques et d'obtenir des réponses de juristes
            qualifiés. Le service est gratuit et accessible à tous les
            utilisateurs inscrits.
          </Typography>
        </Box>

        <Box className="conditions-section">
          <Typography variant="h6" gutterBottom>
            3. Inscription et compte utilisateur
          </Typography>
          <Typography paragraph>
            Pour utiliser le service, vous devez créer un compte en fournissant
            des informations exactes et à jour. Vous êtes responsable de la
            confidentialité de votre compte et de votre mot de passe.
          </Typography>
        </Box>

        <Box className="conditions-section">
          <Typography variant="h6" gutterBottom>
            4. Règles de conduite
          </Typography>
          <Typography paragraph>Les utilisateurs s'engagent à :</Typography>
          <ul className="conditions-list">
            <li>Respecter les lois et règlements en vigueur</li>
            <li>Ne pas publier de contenu illégal ou inapproprié</li>
            <li>Ne pas harceler ou intimider d'autres utilisateurs</li>
            <li>
              Ne pas utiliser le service à des fins commerciales non autorisées
            </li>
          </ul>
        </Box>

        <Box className="conditions-section">
          <Typography variant="h6" gutterBottom>
            5. Propriété intellectuelle
          </Typography>
          <Typography paragraph>
            Tout le contenu du service (textes, images, logos, etc.) est protégé
            par le droit d'auteur et autres lois sur la propriété
            intellectuelle. Vous ne pouvez pas copier, modifier ou distribuer ce
            contenu sans autorisation.
          </Typography>
        </Box>

        <Box className="conditions-section">
          <Typography variant="h6" gutterBottom>
            6. Limitation de responsabilité
          </Typography>
          <Typography paragraph>
            TAG ne peut être tenu responsable des dommages directs ou indirects
            résultant de l'utilisation ou de l'impossibilité d'utiliser le
            service.
          </Typography>
        </Box>

        <Box className="conditions-section">
          <Typography variant="h6" gutterBottom>
            7. Modification des conditions
          </Typography>
          <Typography paragraph>
            Nous nous réservons le droit de modifier ces conditions à tout
            moment. Les modifications entrent en vigueur dès leur publication
            sur le site.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConditionsGenerales;
