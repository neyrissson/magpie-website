'use client';

import React, { useState, useEffect } from 'react';
import { SessionProvider } from "next-auth/react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ClientLayout({ children, logoUrl, siteContents }) {
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('magpie-lang');
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('magpie-lang', lang);
    document.body.className = `lang-${lang}`;
  }, [lang]);

  return (
    <SessionProvider>
      <Navbar lang={lang} setLang={setLang} logoUrl={logoUrl} />
      {children}
      <Footer logoUrl={logoUrl} siteContents={siteContents} />
    </SessionProvider>
  );
}
