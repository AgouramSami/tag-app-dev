import React from "react";
import "../styles/PolitiqueConfidentialite.css";

const PolitiqueConfidentialite = () => {
  return (
    <div className="tag-politique-container">
      <div className="tag-politique-content">
        <h1>Politique de confidentialité</h1>

        <section className="tag-politique-section">
          <h2>1. Collecte des données</h2>
          <p>Nous collectons les informations suivantes :</p>
          <ul>
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Commune d'appartenance</li>
            <li>Fonction</li>
            <li>Historique des demandes</li>
          </ul>
        </section>

        <section className="tag-politique-section">
          <h2>2. Utilisation des cookies</h2>
          <p>Nous utilisons des cookies pour :</p>
          <ul>
            <li>Maintenir votre session active</li>
            <li>Mémoriser vos préférences</li>
            <li>Améliorer votre expérience utilisateur</li>
          </ul>
          <p>
            Vous pouvez désactiver les cookies dans les paramètres de votre
            navigateur.
          </p>
        </section>

        <section className="tag-politique-section">
          <h2>3. Conservation des données</h2>
          <p>
            Vos données sont conservées pendant une durée maximale de 5 ans à
            compter de votre dernière activité sur la plateforme. Passé ce
            délai, votre compte sera automatiquement supprimé si aucune nouvelle
            demande n'a été effectuée.
          </p>
        </section>

        <section className="tag-politique-section">
          <h2>4. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement</li>
            <li>Droit à la portabilité des données</li>
            <li>Droit d'opposition</li>
          </ul>
        </section>

        <section className="tag-politique-section">
          <h2>5. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité appropriées pour
            protéger vos données personnelles contre tout accès non autorisé.
          </p>
        </section>

        <section className="tag-politique-section">
          <h2>6. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité,
            vous pouvez nous contacter à l'adresse suivante :
            <br />
            <a href="mailto:contact@tag-app.fr">contact@tag-app.fr</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
