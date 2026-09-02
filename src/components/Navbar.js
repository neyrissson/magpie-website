'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function Navbar({ lang, setLang, logoUrl }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const logoRedirect = session ? "/portal" : "/login";
  const logoSrc = logoUrl || "/assets/logo.svg";

  return (
    <nav className="nav" style={{ background: 'rgba(10, 7, 5, 0.98)', padding: '0.8rem 3rem' }}>
      <div className="nav-container">
        <Link href={logoRedirect} className="nav-logo-link">
          <img src={logoSrc} alt="Magpie Magique Logo" className="nav-logo-svg" />
        </Link>
        <div className="nav-links">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>
            <span className="fr">À Propos</span>
            <span className="en">About</span>
          </Link>
          <Link href="/menu" className={pathname === '/menu' ? 'active' : ''}>
            <span className="fr">Menus</span>
            <span className="en">Menus</span>
          </Link>
          <Link href="/events" className={pathname === '/events' ? 'active' : ''}>
            <span className="fr">Événements</span>
            <span className="en">Events</span>
          </Link>
          <Link href="/#contact">
            <span className="fr">Contact</span>
            <span className="en">Contact</span>
          </Link>
        </div>
        <div className="nav-right">
          <a href="https://www.instagram.com/magpiemagiquemtl/" target="_blank" className="nav-social" rel="noreferrer">
            <span className="fr">Suivez-nous</span>
            <span className="en">Follow Us</span>
          </a>
          <div className="lang-switcher" id="lang-switcher">
            <span 
              className={`lang-opt ${lang === 'fr' ? 'active' : ''}`} 
              onClick={() => setLang('fr')}
              data-lang="fr"
            >FR</span>
            <span className="lang-sep">|</span>
            <span 
              className={`lang-opt ${lang === 'en' ? 'active' : ''}`} 
              onClick={() => setLang('en')}
              data-lang="en"
            >EN</span>
          </div>
          <a href="https://booking.libroreserve.com/1764704553526020c1231/QC0176470455364B882/seat"
            target="_blank" className="nav-reserve" rel="noreferrer">
            <span className="fr">Réserver</span>
            <span className="en">Book Now</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
