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

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <img src={logoSrc} alt="Magpie Magique" className="mobile-menu-logo" />
              <button 
                className="mobile-menu-close" 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-nav-links">
              <Link href="/" className={pathname === '/' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                <span className="fr">À Propos</span>
                <span className="en">About</span>
              </Link>
              <Link href="/menu" className={pathname === '/menu' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                <span className="fr">Menus</span>
                <span className="en">Menus</span>
              </Link>
              <Link href="/events" className={pathname === '/events' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                <span className="fr">Événements</span>
                <span className="en">Events</span>
              </Link>
              <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>
                <span className="fr">Contact & Heures</span>
                <span className="en">Contact & Hours</span>
              </Link>
            </div>

            <div className="mobile-menu-footer">
              <a 
                href="https://booking.libroreserve.com/1764704553526020c1231/QC0176470455364B882/seat"
                target="_blank" 
                className="btn-primary mobile-reserve-btn" 
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="fr">Réserver une table</span>
                <span className="en">Book a table</span>
              </a>

              <div className="mobile-lang-and-social">
                <div className="lang-switcher">
                  <span 
                    className={`lang-opt ${lang === 'fr' ? 'active' : ''}`} 
                    onClick={() => setLang('fr')}
                  >FR</span>
                  <span className="lang-sep">|</span>
                  <span 
                    className={`lang-opt ${lang === 'en' ? 'active' : ''}`} 
                    onClick={() => setLang('en')}
                  >EN</span>
                </div>
                <a href="https://www.instagram.com/magpiemagiquemtl/" target="_blank" className="mobile-social-link" rel="noreferrer">
                  Instagram ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          flex-direction: column;
          gap: 6px;
          justify-content: center;
          align-items: center;
          z-index: 1001;
        }

        .bar {
          display: block;
          width: 26px;
          height: 2px;
          background: var(--gold);
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .bar.open:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }
        .bar.open:nth-child(2) {
          opacity: 0;
        }
        .bar.open:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 9999;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.25s ease;
        }

        .mobile-menu-drawer {
          width: 85%;
          max-width: 360px;
          height: 100%;
          background: #0d0a08;
          border-left: 1px solid rgba(201, 168, 76, 0.3);
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.8);
          animation: slideIn 0.3s ease;
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(201, 168, 76, 0.2);
          padding-bottom: 1.5rem;
        }

        .mobile-menu-logo {
          height: 38px;
          width: auto;
        }

        .mobile-menu-close {
          background: none;
          border: 1px solid rgba(201, 168, 76, 0.4);
          color: var(--gold);
          font-size: 1.2rem;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin: 3rem 0;
        }

        .mobile-nav-links a {
          font-family: var(--font-deco);
          font-size: 1.4rem;
          color: #ffffff;
          text-decoration: none;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: color 0.2s;
        }

        .mobile-nav-links a.active,
        .mobile-nav-links a:hover {
          color: var(--gold);
        }

        .mobile-reserve-btn {
          display: block;
          text-align: center;
          width: 100%;
          padding: 1.1rem;
          margin-bottom: 1.8rem;
          font-size: 1rem;
          font-weight: bold;
        }

        .mobile-lang-and-social {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(201, 168, 76, 0.2);
          padding-top: 1.5rem;
        }

        .mobile-social-link {
          color: var(--gold-light);
          font-family: var(--font-deco);
          font-size: 0.95rem;
          text-decoration: none;
          letter-spacing: 0.05em;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
          }
          .nav-social {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
