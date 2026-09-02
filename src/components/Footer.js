'use client';

import React from 'react';

export default function Footer({ logoUrl, siteContents }) {
  const logoSrc = logoUrl || "/assets/logo.svg";

  const getContent = (key, field, defaultValue) => {
    const item = siteContents?.find(c => c.key === key);
    return item ? item[field] : defaultValue;
  };

  const renderContactLines = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.includes('@')) {
        return (
          <span key={idx}>
            <a href={`mailto:${line.trim()}`}>{line}</a>
            <br />
          </span>
        );
      }
      return (
        <span key={idx}>
          {line}
          <br />
        </span>
      );
    });
  };

  return (
    <footer id="contact" className="footer">
      <div className="footer-logo">
        <img src={logoSrc} alt="Magpie Magique" className="footer-logo-svg" />
      </div>
      <div className="footer-divider"></div>
      <div className="footer-info">
        <div className="info-block">
          <h4>
            <span className="fr">Adresse</span>
            <span className="en">Location</span>
          </h4>
          <p style={{ whiteSpace: 'pre-line' }}>
            <span className="fr">
              {getContent('footer_address', 'text_fr', "380 Rue Gilford, Montréal\nQC H2J 1N4")}
            </span>
            <span className="en">
              {getContent('footer_address', 'text_en', "380 Rue Gilford, Montreal\nQC H2J 1N4")}
            </span>
          </p>
        </div>
        <div className="info-block">
          <h4>
            <span className="fr">Contact</span>
            <span className="en">Contact</span>
          </h4>
          <p>
            <span className="fr">
              {renderContactLines(getContent('footer_contact', 'text_fr', "514-759-6247 (SMS ONLY)\ninfo@magpiemagique.com"))}
            </span>
            <span className="en">
              {renderContactLines(getContent('footer_contact', 'text_en', "514-759-6247 (SMS ONLY)\ninfo@magpiemagique.com"))}
            </span>
          </p>
        </div>
        <div className="info-block">
          <h4>
            <span className="fr">Heures</span>
            <span className="en">Hours</span>
          </h4>
          <p style={{ whiteSpace: 'pre-line' }}>
            <span className="fr">
              {getContent('footer_hours', 'text_fr', "Mercredi et Dimanche: 17h – minuit\nJeudi, Vendredi et Samedi: 17h – 2h\nFermé Lundi & Mardi")}
            </span>
            <span className="en">
              {getContent('footer_hours', 'text_en', "Wednesday and Sunday: 5pm – midnight\nThursday, Friday and Saturday: 5pm – 2am\nClosed Monday & Tuesday")}
            </span>
          </p>
        </div>
      </div>
      <div className="footer-copy">
        © 2024 Magpie Magique · <span className="fr">Tous droits réservés</span>
        <span className="en">All rights reserved</span>
      </div>
    </footer>
  );
}
