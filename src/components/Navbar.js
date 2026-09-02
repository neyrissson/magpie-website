'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function Navbar({ lang, setLang, logoUrl }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoRedirect = session ? "/portal" : "/login";
  const logoSrc = logoUrl || "/assets/logo.svg";

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="nav" style={{ background: 'rgba(10, 7, 5, 0.98)', padding: '0.8rem 1.5rem' }}>
        <div className="nav-container">
          <Link href={logoRedirect} className="nav-logo-link">
            <img src={logoSrc} alt="Magpie Magique Logo" className="nav-logo-svg" />
          </Link>

          {/* Desktop Navigation Links */}
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

            {/* Mobile Hamburger Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Luxury Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-header" onClick={(e) => e.stopPropagation()}>
            <img src={logoSrc} alt="Magpie Magique" className="mobile-menu-logo" />
            <button 
              className="mobile-menu-close" 
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="mobile-nav-links" onClick={(e) => e.stopPropagation()}>
            <Link 
              href="/" 
              className={`mobile-nav-link ${pathname === '/' ? 'active' : ''}`}
              style={{ color: pathname === '/' ? 'var(--gold)' : '#ffffff', textDecoration: 'none', fontFamily: 'var(--font-deco)', fontSize: '1.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 'bold' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="fr">À Propos</span>
              <span className="en">About</span>
            </Link>

            <Link 
              href="/menu" 
              className={`mobile-nav-link ${pathname === '/menu' ? 'active' : ''}`}
              style={{ color: pathname === '/menu' ? 'var(--gold)' : '#ffffff', textDecoration: 'none', fontFamily: 'var(--font-deco)', fontSize: '1.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 'bold' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="fr">Menus</span>
              <span className="en">Menus</span>
            </Link>

            <Link 
              href="/events" 
              className={`mobile-nav-link ${pathname === '/events' ? 'active' : ''}`}
              style={{ color: pathname === '/events' ? 'var(--gold)' : '#ffffff', textDecoration: 'none', fontFamily: 'var(--font-deco)', fontSize: '1.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 'bold' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="fr">Événements</span>
              <span className="en">Events</span>
            </Link>

            <Link 
              href="/#contact" 
              className="mobile-nav-link"
              style={{ color: '#ffffff', textDecoration: 'none', fontFamily: 'var(--font-deco)', fontSize: '1.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 'bold' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="fr">Contact</span>
              <span className="en">Contact</span>
            </Link>
          </div>

          <div className="mobile-menu-footer" onClick={(e) => e.stopPropagation()}>
            <a 
              href="https://booking.libroreserve.com/1764704553526020c1231/QC0176470455364B882/seat"
              target="_blank" 
              className="btn-primary mobile-reserve-btn" 
              rel="noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#000000', textDecoration: 'none' }}
            >
              <span className="fr">Réserver une table</span>
              <span className="en">Book a table</span>
            </a>

            <div className="mobile-lang-and-social">
              <div className="lang-switcher" style={{ fontSize: '1.1rem' }}>
                <span 
                  className={`lang-opt ${lang === 'fr' ? 'active' : ''}`} 
                  onClick={() => setLang('fr')}
                  style={{ color: lang === 'fr' ? 'var(--gold)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 'bold' }}
                >FR</span>
                <span className="lang-sep" style={{ margin: '0 0.5rem', color: 'rgba(255,255,255,0.3)' }}>|</span>
                <span 
                  className={`lang-opt ${lang === 'en' ? 'active' : ''}`} 
                  onClick={() => setLang('en')}
                  style={{ color: lang === 'en' ? 'var(--gold)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 'bold' }}
                >EN</span>
              </div>
              <a 
                href="https://www.instagram.com/magpiemagiquemtl/" 
                target="_blank" 
                className="mobile-social-link" 
                rel="noreferrer"
                style={{ color: 'var(--gold)', textDecoration: 'none', fontFamily: 'var(--font-deco)', fontWeight: 'bold', letterSpacing: '0.1em' }}
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
