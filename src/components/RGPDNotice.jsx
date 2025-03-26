import React from "react";
import "../styles/RGPDNotice.css";

const RGPDNotice = () => {
  return (
    <div className="rgpd-notice">
      <h3>Protection des données personnelles (RGPD)</h3>
      <p>
        Conformément au Règlement Général sur la Protection des Données (RGPD),
        nous vous informons que :
      </p>
      <ul>
        <li>
          Vos données personnelles sont collectées et traitées uniquement dans
          le cadre de votre demande
        </li>
        <li>
          Ces données sont conservées pendant la durée nécessaire au traitement
          de votre demande
        </li>
        <li>
          Vous disposez d'un droit d'accès, de rectification et de suppression
          de vos données
        </li>
        <li>
          Vos données ne sont pas transmises à des tiers sans votre consentement
        </li>
        <li>
          Vous pouvez exercer vos droits en contactant le délégué à la
          protection des données
        </li>
      </ul>
      <p className="rgpd-contact">
        Pour toute question concernant vos données personnelles, contactez-nous
        à :<a href="mailto:rgpd@tag-app.fr">rgpd@tag-app.fr</a>
      </p>
    </div>
  );
};

export default RGPDNotice;
