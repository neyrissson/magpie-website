'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RecruitSection from './RecruitSection';

export default function HomeClient({ heroBgUrl }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // --- GSAP HERO ANIMATIONS (PERFECT L-CORNER SLIDING) ---
    const heroPath = document.getElementById('hero-path');
    if (heroPath) {
      const pathLength = heroPath.getTotalLength();
      const segment = 40;
      const gap = (pathLength / 2) - segment;

      gsap.set(heroPath, {
        strokeDasharray: `${segment}, ${gap}, ${segment}, ${gap}`,
        strokeDashoffset: segment / 2,
      });

      gsap.to(heroPath, {
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom+=50% top",
          scrub: 2.5,
        },
        strokeDashoffset: (segment / 2) - pathLength,
        ease: "none",
      });
    }

    // Hero Content Fade
    gsap.to(".hero-content", {
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      y: -100,
      opacity: 0,
      ease: "none",
    });

    // Reveal Animations
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    document.querySelectorAll('.about-section').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'all 0.6s ease-out';
      observer.observe(el);
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url('${heroBgUrl || "/assets/background_2_v2.jpeg"}')` }}></div>
        <div className="hero-overlay"></div>
        <svg className="hero-frame-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="orn-grad" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C9A84C" />
              <stop offset="50%" stopColor="#F2EAD8" />
              <stop offset="100%" stopColor="#C9A84C" />
            </linearGradient>
          </defs>
          <rect id="hero-path" x="5" y="14" width="90" height="76" fill="none" stroke="url(#orn-grad)" strokeWidth="0.4" />
        </svg>
        <div className="deco-lines"></div>
        <div className="hero-content">
          <p className="hero-eyebrow">380 Rue Gilford · Montréal</p>
          <h1 className="hero-title">
            Magpie
            <span>Magique</span>
          </h1>
          <div className="hero-divider"></div>
          <p className="hero-sub">
            <span className="fr">Bar à cocktails · Ambiance Feutrée · Speakeasy</span>
            <span className="en">Cocktail Bar · Intimate Atmosphere · Speakeasy</span>
          </p>
          <div className="hero-cta">
            <a href="https://booking.libroreserve.com/1764704553526020c1231/QC0176470455364B882/seat"
              target="_blank" className="btn-primary" rel="noreferrer" style={{ padding: '1rem 2.5rem' }}>
              <span className="fr">Réserver</span>
              <span className="en">Book a table</span>
            </a>
            <Link href="/menu" className="btn-secondary" style={{ padding: '1rem 2.5rem' }}>
              <span className="fr">Menus</span>
              <span className="en">Menus</span>
            </Link>
          </div>
          <a href="https://www.instagram.com/magpiemagiquemtl" target="_blank" className="hero-instagram-link" rel="noreferrer">
            <span className="fr">Suivez-nous sur Instagram</span>
            <span className="en">Follow us on Instagram</span>
          </a>
        </div>
        <div className="hero-scroll">
          <span className="fr">Descendre</span>
          <span className="en">Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-text">
            <p className="section-label">
              <span className="fr">À propos de nous</span>
              <span className="en">About us</span>
            </p>
            <h2>
              <span className="fr">Un refuge <em>caché</em></span>
              <span className="en">A <em>Hidden</em> Refuge</span>
            </h2>
            <p className="fr">À mi-chemin entre le speakeasy new-yorkais et le bar d'hôtel parisien, Magpie Magique vous
              invite à franchir sa porte pour découvrir un monde à part sur le Plateau Mont-Royal.</p>
            <p className="en">Halfway between a New York speakeasy and a Parisian hotel bar, Magpie Magique invites you
              through its doors to discover a world of its own on the Plateau Mont-Royal.</p>

            <p className="fr">Cocktails de caractère, lumières tamisées, murmures et verres qui s'entrechoquent... Et
              certains soirs, un saxophone qui fait vibrer l'air. Magpie Magique existe dans une parenthèse du
              temps, quelque part où le temps accepte de ralentir.</p>
            <p className="en">Bold cocktails, low lights, hushed voices and the clink of glasses... And some nights, a
              saxophone humming through the room. Magpie Magique is a fold in time, somewhere the clock agrees to
              slow down.</p>
          </div>
          <div className="about-visual">
            <div className="stat-grid">
              <div className="stat">
                <span className="stat-num">5</span>
                <span className="stat-label">
                  <span className="fr">Soirs par semaine</span>
                  <span className="en">Nights per week</span>
                </span>
              </div>
              <div className="stat">
                <span className="stat-num">17h</span>
                <span className="stat-label">
                  <span className="fr">Ouverture</span>
                  <span className="en">Opening</span>
                </span>
              </div>
              <div className="stat">
                <span className="stat-num">Jazz</span>
                <span className="stat-label">Atmosphere</span>
              </div>
              <div className="stat">
                <span className="stat-num">Intime</span>
                <span className="stat-label">
                  <span className="fr">Expérience</span>
                  <span className="en">Intimate Experience</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECRUITMENT SECTION */}
      <RecruitSection />
    </main>
  );
}
