'use client';

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { saveGeneratedPoster, savePosterPreset, getPosterPresets, deletePosterPreset, getSiteLogoUrl } from '../app/portal/actions-cms';

// ── Tiny inline alignment toggle for each text field ──────────────
function AlignBtn({ field, aligns, onChange }) {
  const ta = aligns[field] || 'left';
  return (
    <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '0.5rem', verticalAlign: 'middle' }}>
      {[['left','←'],['center','↔'],['right','→']].map(([v, sym]) => (
        <button key={v} type="button" onClick={() => onChange(field, v)}
          style={{
            padding: '1px 5px', fontSize: '0.65rem', lineHeight: 1,
            border: `1px solid ${ta === v ? 'var(--gold)' : 'rgba(201,168,76,0.25)'}`,
            background: ta === v ? 'rgba(201,168,76,0.18)' : 'transparent',
            color: ta === v ? 'var(--gold)' : 'rgba(201,168,76,0.45)',
            cursor: 'pointer', borderRadius: '3px',
          }}>{sym}</button>
      ))}
    </span>
  );
}

function InstrumentIcon({ type, color = 'var(--gold)', size = 22 }) {
  const s = { stroke: color, fill: 'none', strokeWidth: '1.6', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const f = { fill: color, stroke: 'none' };

  const icons = {

    // ── TRUMPET ─────────────────────────────────────────────
    // Clear horizontal profile: mouthpiece left → 3 bold valves → bell right
    trumpet: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Mouthpiece */}
        <rect x="1" y="14" width="5" height="4" rx="1" {...s} />
        {/* Lead pipe */}
        <line x1="6" y1="16" x2="10" y2="16" {...s} />
        {/* Valve block (3 thick casings) */}
        <rect x="10" y="11" width="3.5" height="10" rx="1" {...s} />
        <rect x="14" y="11" width="3.5" height="10" rx="1" {...s} />
        <rect x="18" y="11" width="3.5" height="10" rx="1" {...s} />
        {/* Valve caps on top */}
        <rect x="10.5" y="8" width="2.5" height="3" rx="0.5" style={f} />
        <rect x="14.5" y="8" width="2.5" height="3" rx="0.5" style={f} />
        <rect x="18.5" y="8" width="2.5" height="3" rx="0.5" style={f} />
        {/* Tube from valves to bell */}
        <path d="M21.5 13 Q25 13 26 11" {...s} />
        <path d="M21.5 19 Q25 19 26 21" {...s} />
        {/* Bell */}
        <path d="M26 11 Q31 11 31 16 Q31 21 26 21" {...s} strokeWidth="2" />
      </svg>
    ),

    // ── UPRIGHT BASS ────────────────────────────────────────
    // Simple violin/cello silhouette — bold hourglass shape
    bass: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Neck */}
        <rect x="15" y="1" width="2" height="7" rx="1" style={f} />
        {/* Upper bout */}
        <path d="M12 8 Q8 9 8 13 Q8 15 11 16" {...s} strokeWidth="2" />
        <path d="M20 8 Q24 9 24 13 Q24 15 21 16" {...s} strokeWidth="2" />
        {/* Waist */}
        <path d="M11 16 Q13 16.5 13 17.5" {...s} />
        <path d="M21 16 Q19 16.5 19 17.5" {...s} />
        {/* Lower bout */}
        <path d="M13 17.5 Q8 19 8 23 Q8 28 16 29 Q24 28 24 23 Q24 19 19 17.5" {...s} strokeWidth="2" />
        {/* f-holes */}
        <line x1="13" y1="19" x2="13" y2="24" {...s} strokeWidth="1.2" />
        <line x1="19" y1="19" x2="19" y2="24" {...s} strokeWidth="1.2" />
        {/* Bridge */}
        <path d="M13 22 Q16 21 19 22" {...s} />
      </svg>
    ),

    // ── DRUMS ────────────────────────────────────────────────
    // Front-face snare drum with two crossed sticks above
    drums: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Crossed drumsticks */}
        <line x1="7" y1="3" x2="18" y2="14" {...s} strokeWidth="2" />
        <line x1="25" y1="3" x2="14" y2="14" {...s} strokeWidth="2" />
        <circle cx="7" cy="3" r="1.5" style={f} />
        <circle cx="25" cy="3" r="1.5" style={f} />
        {/* Drum shell */}
        <ellipse cx="16" cy="16" rx="12" ry="4" {...s} strokeWidth="2" />
        <line x1="4" y1="16" x2="4" y2="26" {...s} strokeWidth="2" />
        <line x1="28" y1="16" x2="28" y2="26" {...s} strokeWidth="2" />
        <ellipse cx="16" cy="26" rx="12" ry="4" {...s} strokeWidth="2" />
        {/* Snare wires at bottom */}
        <line x1="9" y1="28" x2="23" y2="28" {...s} strokeWidth="0.9" />
        <line x1="9" y1="29.5" x2="23" y2="29.5" {...s} strokeWidth="0.9" />
      </svg>
    ),

    // ── MICROPHONE ──────────────────────────────────────────
    // Bold capsule dome + body + cable
    vocals: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Capsule */}
        <path d="M11 14 Q11 5 16 5 Q21 5 21 14" {...s} strokeWidth="2" />
        <ellipse cx="16" cy="14" rx="5" ry="2" {...s} strokeWidth="2" />
        {/* Mesh lines on dome */}
        <line x1="12" y1="8" x2="20" y2="8" {...s} strokeWidth="1" />
        <line x1="11.2" y1="11" x2="20.8" y2="11" {...s} strokeWidth="1" />
        {/* Body */}
        <rect x="13" y="14" width="6" height="9" rx="2" {...s} strokeWidth="2" />
        {/* Stand */}
        <line x1="16" y1="23" x2="16" y2="29" {...s} strokeWidth="2" />
        <line x1="11" y1="29" x2="21" y2="29" {...s} strokeWidth="2" />
      </svg>
    ),

    // ── PIANO ────────────────────────────────────────────────
    // Keyboard: 7 white + 5 black keys, bold and clear
    piano: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* White key body */}
        <rect x="2" y="10" width="28" height="18" rx="1.5" {...s} strokeWidth="2" />
        {/* White key dividers */}
        {[6, 10, 14, 18, 22, 26].map((x, i) => (
          <line key={i} x1={x} y1="10" x2={x} y2="28" {...s} strokeWidth="1.2" />
        ))}
        {/* Black keys */}
        {[3.5, 7.5, 15.5, 19.5, 23.5].map((x, i) => (
          <rect key={i} x={x} y="10" width="3.5" height="11" rx="0.7" style={f} />
        ))}
      </svg>
    ),

    // ── ACOUSTIC GUITAR ─────────────────────────────────────
    // Front-facing upright acoustic guitar — single outline path + details
    guitar: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Headstock */}
        <rect x="13" y="1" width="6" height="5" rx="1.5" {...s} strokeWidth="1.8" />
        {/* Tuning pegs */}
        <circle cx="12" cy="2.5" r="1.2" style={f} />
        <circle cx="12" cy="5" r="1.2" style={f} />
        <circle cx="20" cy="2.5" r="1.2" style={f} />
        <circle cx="20" cy="5" r="1.2" style={f} />
        {/* Nut */}
        <line x1="13" y1="6" x2="19" y2="6" {...s} strokeWidth="1.5" />
        {/* Neck */}
        <path d="M14 6 L13 11" {...s} strokeWidth="2.2" />
        <path d="M18 6 L19 11" {...s} strokeWidth="2.2" />
        {/* Fret lines on neck */}
        <line x1="13.3" y1="8" x2="18.7" y2="8" {...s} strokeWidth="0.9" />
        <line x1="13.1" y1="10" x2="18.9" y2="10" {...s} strokeWidth="0.9" />
        {/* Body — single continuous outline */}
        <path d="
          M13 11 Q9 11.5 8 14 Q7 16 9 17.5
          Q7 18.5 7 21 Q7 25.5 16 27 Q25 25.5 25 21
          Q25 18.5 23 17.5 Q25 16 24 14 Q23 11.5 19 11 Z
        " {...s} strokeWidth="2" />
        {/* Sound hole */}
        <circle cx="16" cy="20" r="3" {...s} strokeWidth="1.5" />
        {/* Bridge */}
        <rect x="13.5" y="23.5" width="5" height="1.5" rx="0.5" style={f} />
        {/* Strings */}
        <line x1="15" y1="6" x2="15" y2="23.5" {...s} strokeWidth="0.6" />
        <line x1="16" y1="6" x2="16" y2="23.5" {...s} strokeWidth="0.6" />
        <line x1="17" y1="6" x2="17" y2="23.5" {...s} strokeWidth="0.6" />
      </svg>
    ),

    // ── SAXOPHONE ───────────────────────────────────────────
    // Clear crook at top, thick J-shaped body, flared bell
    saxophone: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Mouthpiece */}
        <rect x="18" y="2" width="6" height="3" rx="1" {...s} />
        {/* Neck crook */}
        <path d="M18 3.5 Q14 3.5 13 7" {...s} strokeWidth="2.5" />
        {/* Main body */}
        <path d="M13 7 Q12 10 12 15 Q12 22 13 25" {...s} strokeWidth="3" />
        {/* Bell curve */}
        <path d="M13 25 Q12 28 9 29 Q6 30 6 27 Q6 24 9 24" {...s} strokeWidth="2.5" />
        {/* Keys (3 filled circles on side) */}
        <circle cx="16" cy="11" r="1.5" style={f} />
        <circle cx="16.5" cy="16" r="1.5" style={f} />
        <circle cx="16" cy="21" r="1.5" style={f} />
      </svg>
    ),

    // ── VIOLIN ──────────────────────────────────────────────
    // Cleaner hourglass body, scroll at top, bow diagonal
    violin: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Scroll */}
        <path d="M16 1 Q19 1 19 4 Q19 6 16 6" {...s} strokeWidth="1.5" />
        {/* Neck */}
        <path d="M14.5 6 L13.5 10" {...s} strokeWidth="1.8" />
        <path d="M17.5 6 L18.5 10" {...s} strokeWidth="1.8" />
        {/* Upper bout */}
        <path d="M13.5 10 Q9 11 9 15" {...s} strokeWidth="2" />
        <path d="M18.5 10 Q23 11 23 15" {...s} strokeWidth="2" />
        {/* Waist */}
        <path d="M9 15 Q12 16 12 17" {...s} />
        <path d="M23 15 Q20 16 20 17" {...s} />
        {/* Lower bout */}
        <path d="M12 17 Q8 19 8.5 24 Q9 28 16 29 Q23 28 23.5 24 Q24 19 20 17" {...s} strokeWidth="2" />
        {/* f-holes — clear S shapes */}
        <path d="M13 19 L13 23" {...s} strokeWidth="1.2" />
        <line x1="11.5" y1="19.5" x2="14.5" y2="19.5" {...s} strokeWidth="1" />
        <line x1="11.5" y1="22.5" x2="14.5" y2="22.5" {...s} strokeWidth="1" />
        <path d="M19 19 L19 23" {...s} strokeWidth="1.2" />
        <line x1="17.5" y1="19.5" x2="20.5" y2="19.5" {...s} strokeWidth="1" />
        <line x1="17.5" y1="22.5" x2="20.5" y2="22.5" {...s} strokeWidth="1" />
        {/* Bridge */}
        <path d="M13 22 Q16 21 19 22" {...s} />
      </svg>
    ),

    // ── COMEDY MASK ─────────────────────────────────────────
    comedy: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M4 10 Q4 3 16 3 Q28 3 28 10 Q28 22 22 26 Q19 28 16 28 Q13 28 10 26 Q4 22 4 10Z" {...s} strokeWidth="2" />
        {/* Happy arched eyes */}
        <path d="M10 13 Q12 10 14 13" {...s} strokeWidth="1.8" />
        <path d="M18 13 Q20 10 22 13" {...s} strokeWidth="1.8" />
        {/* Big grin */}
        <path d="M10 19 Q13 24 16 24 Q19 24 22 19" {...s} strokeWidth="2" />
      </svg>
    ),

    // ── COCKTAIL ────────────────────────────────────────────
    cocktail: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Glass */}
        <path d="M4 5 L16 20 L28 5 Z" {...s} strokeWidth="2" />
        {/* Fill */}
        <path d="M8 9 L16 20 L24 9 Z" style={f} />
        {/* Stem */}
        <line x1="16" y1="20" x2="16" y2="28" {...s} strokeWidth="2" />
        {/* Base */}
        <line x1="10" y1="28" x2="22" y2="28" {...s} strokeWidth="2.5" />
        {/* Olive pick */}
        <line x1="19" y1="5" x2="26" y2="2" {...s} strokeWidth="1.5" />
        <circle cx="26.5" cy="1.5" r="2" {...s} strokeWidth="1.5" />
        <circle cx="26.5" cy="1.5" r="0.7" style={f} />
      </svg>
    ),
  };

  return icons[type] || icons.trumpet;
}

const getSecondWordFormatted = (title) => {
  if (!title) return 'Live';
  const parts = title.trim().split(/\s+/);
  if (parts.length <= 1) return 'Live';
  const word = parts.slice(1).join(' ');
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export default function PosterGenerator({ events = [], photos = [], onSave, defaultAddressFr = '', defaultAddressEn = '' }) {
  const [selectedTemplate, setSelectedTemplate] = useState('live-music'); 
  const [selectedEventId, setSelectedEventId] = useState('');
  const [posterLang, setPosterLang] = useState('fr'); // 'fr' | 'en'
  const [bgZoom, setBgZoom] = useState(100);
  const [bgShiftX, setBgShiftX] = useState(0);
  const [bgShiftY, setBgShiftY] = useState(0);
  const [bgContrast, setBgContrast] = useState(100);
  const [bgGrayscale, setBgGrayscale] = useState(false);
  const [vignetteStrength, setVignetteStrength] = useState(60);
  const [bgCropTop, setBgCropTop] = useState(0);
  const [bgCropRight, setBgCropRight] = useState(0);
  const [bgCropBottom, setBgCropBottom] = useState(0);
  const [bgCropLeft, setBgCropLeft] = useState(0);
  
  // Preset models configuration
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [newPresetName, setNewPresetName] = useState('');
  
  // Photo bank selection modal
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [targetPhotoField, setTargetPhotoField] = useState('bg'); // 'bg' | 'weekly1' | 'weekly2' | 'weekly3'
  
  // General form inputs
  // Bilingual form inputs (FR/EN states)
  const [posterTitleFr, setPosterTitleFr] = useState('MUSIQUE LIVE');
  const [posterTitleEn, setPosterTitleEn] = useState('LIVE MUSIC');
  const [posterSubTitleFr, setPosterSubTitleFr] = useState('CE SOIR');
  const [posterSubTitleEn, setPosterSubTitleEn] = useState('TONIGHT');
  const [posterDateTextFr, setPosterDateTextFr] = useState('SAMEDI 4 JUILLET');
  const [posterDateTextEn, setPosterDateTextEn] = useState('SATURDAY 4 JULY');
  const [posterTaglineFr, setPosterTaglineFr] = useState('BONNE MUSIQUE. EXCELLENTS COCKTAILS. SOIRÉES INOUBLIABLES.');
  const [posterTaglineEn, setPosterTaglineEn] = useState('GREAT MUSIC. EXCELLENT COCKTAILS. UNFORGETTABLE NIGHTS.');
  const [posterFootnoteFr, setPosterFootnoteFr] = useState('RÉSERVATIONS RECOMMANDÉES');
  const [posterFootnoteEn, setPosterFootnoteEn] = useState('RESERVATIONS RECOMMENDED');
  const [posterAddressFr, setPosterAddressFr] = useState("380 Rue Gilford, Montréal");
  const [posterAddressEn, setPosterAddressEn] = useState("380 Rue Gilford, Montreal");

  const [bannerHeaderFr, setBannerHeaderFr] = useState("LES JEUDIS À 20H");
  const [bannerHeaderEn, setBannerHeaderEn] = useState("THURSDAY'S AT 8PM");
  const [bannerMainFr, setBannerMainFr] = useState("SOIRÉE D'HUMOUR");
  const [bannerMainEn, setBannerMainEn] = useState("COMEDY EVERY THURSDAY");

  // Computed bilingual getters & setters
  const posterTitle = posterLang === 'fr' ? posterTitleFr : posterTitleEn;
  const setPosterTitle = (val) => posterLang === 'fr' ? setPosterTitleFr(val) : setPosterTitleEn(val);
  
  const posterSubTitle = posterLang === 'fr' ? posterSubTitleFr : posterSubTitleEn;
  const setPosterSubTitle = (val) => posterLang === 'fr' ? setPosterSubTitleFr(val) : setPosterSubTitleEn(val);
  
  const posterDateText = posterLang === 'fr' ? posterDateTextFr : posterDateTextEn;
  const setPosterDateText = (val) => posterLang === 'fr' ? setPosterDateTextFr(val) : setPosterDateTextEn(val);
  
  const posterTagline = posterLang === 'fr' ? posterTaglineFr : posterTaglineEn;
  const setPosterTagline = (val) => posterLang === 'fr' ? setPosterTaglineFr(val) : setPosterTaglineEn(val);
  
  const posterFootnote = posterLang === 'fr' ? posterFootnoteFr : posterFootnoteEn;
  const setPosterFootnote = (val) => posterLang === 'fr' ? setPosterFootnoteFr(val) : setPosterFootnoteEn(val);

  const posterAddress = posterLang === 'fr' ? posterAddressFr : posterAddressEn;
  const setPosterAddress = (val) => posterLang === 'fr' ? setPosterAddressFr(val) : setPosterAddressEn(val);

  const bannerHeader = posterLang === 'fr' ? bannerHeaderFr : bannerHeaderEn;
  const setBannerHeader = (val) => posterLang === 'fr' ? setBannerHeaderFr(val) : setBannerHeaderEn(val);

  const bannerMain = posterLang === 'fr' ? bannerMainFr : bannerMainEn;
  const setBannerMain = (val) => posterLang === 'fr' ? setBannerMainFr(val) : setBannerMainEn(val);

  // Remaining general form inputs
  const [posterPrice, setPosterPrice] = useState('10$');
  const [posterPriceSub, setPosterPriceSub] = useState('/SET');
  const [posterTime1, setPosterTime1] = useState('20 h');
  const [posterTime2, setPosterTime2] = useState('22 h');
  const [showLogo, setShowLogo] = useState(true);
  const [logoUrl, setLogoUrl] = useState('/assets/logo.svg');
  const [textAlign, setTextAlign] = useState('left'); // 'left' | 'center' | 'right'
  const [textAligns, setTextAligns] = useState({
    title: 'left', subtitle: 'center', date: 'center',
    tagline: 'center', footnote: 'center',
  });
  const setAlign = (field, val) => setTextAligns(prev => ({ ...prev, [field]: val }));
  const ta = (field) => textAligns[field] || 'left';
  const taFlex = (field) => ({ left: 'flex-start', center: 'center', right: 'flex-end' }[ta(field)]);

  // Background photos
  const [bgPhotoUrl, setBgPhotoUrl] = useState('/assets/Raf_Jazz.JPG');
  
  // Template 1: Lineup Artists
  const [lineup, setLineup] = useState([
    { name: 'RAFAEL SALAZAR', role: 'TROMPETTE', type: 'trumpet' },
    { name: 'DEVON GILLINGHAM', role: 'CONTREBASSE', type: 'bass' },
    { name: 'TOMMY CRANE', role: 'BATTERIE', type: 'drums' }
  ]);

  // Template 2: Comedy Banner fields
  const [bannerFooter1, setBannerFooter1] = useState("AT MAGPIE MAGIQUE");
  const [bannerFooter2, setBannerFooter2] = useState("380 RUE GILFORD");
  const [bannerPrice, setBannerPrice] = useState('10$');
  const [bannerPriceSub, setBannerPriceSub] = useState('/ SET');

  // Template 3: Weekly Lineup rows
  const [weeklyRows, setWeeklyRows] = useState([
    {
      day: 'THURSDAY, JUNE 18',
      title: 'THE RED ROOM COMEDY SHOW',
      subtitle: 'HOSTED BY MARIAM KHAN',
      time: 'SHOW STARTS AT 8PM | DOORS OPEN AT 7:30PM',
      extra: 'TICKETS AVAILABLE ON EVENTBRITE',
      photoUrl: '/assets/microphone.png'
    },
    {
      day: 'FRIDAY, JUNE 19',
      title: 'LIVE MUSIC',
      subtitle: 'ISABELLA HALLIA (VOCALS) & GABRIEL AUDET (GUITAR)',
      time: '1ST SET AT 8PM | 2ND SET AT 10PM',
      extra: '$10 PER SET',
      photoUrl: '/assets/background_4.jpeg'
    },
    {
      day: 'SATURDAY, JUNE 20',
      title: 'LIVE JAZZ',
      subtitle: 'RAFAEL SALAZAR QUARTET PERFORMANCE',
      time: '1ST SET AT 8PM | 2ND SET AT 10PM',
      extra: '$15 PER SET | RESERVATIONS RECOMMENDED',
      photoUrl: '/assets/Raf_Jazz.JPG'
    }
  ]);

  const previewRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load presets and site logo on mount
  useEffect(() => {
    async function loadInitialData() {
      const res = await getPosterPresets();
      if (res.success) {
        setPresets(res.presets);
      }
      const logoRes = await getSiteLogoUrl();
      if (logoRes.success && logoRes.url) {
        setLogoUrl(logoRes.url);
      }
    }
    loadInitialData();
  }, []);

  // Pre-fill the poster address from the website's database address dynamically
  useEffect(() => {
    if (defaultAddressFr) {
      setPosterAddressFr(defaultAddressFr);
    }
  }, [defaultAddressFr]);

  useEffect(() => {
    if (defaultAddressEn) {
      setPosterAddressEn(defaultAddressEn);
    }
  }, [defaultAddressEn]);

  const handleSavePreset = async () => {
    if (!newPresetName.trim()) {
      alert('Please enter a name for the model template');
      return;
    }
    const presetName = newPresetName.trim();
    const configObj = {
      selectedTemplate,
      posterTitleFr,
      posterTitleEn,
      posterSubTitleFr,
      posterSubTitleEn,
      posterDateTextFr,
      posterDateTextEn,
      posterPrice,
      posterPriceSub,
      posterTime1,
      posterTime2,
      posterTaglineFr,
      posterTaglineEn,
      posterFootnoteFr,
      posterFootnoteEn,
      posterAddressFr,
      posterAddressEn,
      showLogo,
      posterLang,
      bgZoom,
      bgShiftX,
      bgShiftY,
      bgContrast,
      bgGrayscale,
      vignetteStrength,
      bgCropTop,
      bgCropRight,
      bgCropBottom,
      bgCropLeft,
      textAlign,
      textAligns,
      bgPhotoUrl,
      lineup,
      bannerHeaderFr,
      bannerHeaderEn,
      bannerMainFr,
      bannerMainEn,
      bannerFooter1,
      bannerFooter2,
      bannerPrice,
      bannerPriceSub,
      weeklyRows
    };
    const configJson = JSON.stringify(configObj);
    const res = await savePosterPreset(presetName, configJson);
    if (res.success) {
      alert(`Model template "${presetName}" saved successfully!`);
      setNewPresetName('');
      const loadRes = await getPosterPresets();
      if (loadRes.success) {
        setPresets(loadRes.presets);
        const matched = loadRes.presets.find(p => p.name === presetName);
        if (matched) {
          setSelectedPresetId(matched.id);
        }
      }
    } else {
      alert('Failed to save model preset: ' + res.error);
    }
  };

  const handleSelectPreset = (presetId) => {
    setSelectedPresetId(presetId);
    if (!presetId) return;
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    try {
      const config = JSON.parse(preset.config);
      if (config.selectedTemplate) setSelectedTemplate(config.selectedTemplate);
      
      // Bilingual titles load
      if (config.posterTitleFr) setPosterTitleFr(config.posterTitleFr);
      if (config.posterTitleEn) setPosterTitleEn(config.posterTitleEn);
      if (config.posterTitle && !config.posterTitleFr) {
        if (config.posterLang === 'en') setPosterTitleEn(config.posterTitle);
        else setPosterTitleFr(config.posterTitle);
      }

      if (config.posterSubTitleFr) setPosterSubTitleFr(config.posterSubTitleFr);
      if (config.posterSubTitleEn) setPosterSubTitleEn(config.posterSubTitleEn);
      if (config.posterSubTitle && !config.posterSubTitleFr) {
        if (config.posterLang === 'en') setPosterSubTitleEn(config.posterSubTitle);
        else setPosterSubTitleFr(config.posterSubTitle);
      }

      if (config.posterDateTextFr) setPosterDateTextFr(config.posterDateTextFr);
      if (config.posterDateTextEn) setPosterDateTextEn(config.posterDateTextEn);
      if (config.posterDateText && !config.posterDateTextFr) {
        if (config.posterLang === 'en') setPosterDateTextEn(config.posterDateText);
        else setPosterDateTextFr(config.posterDateText);
      }

      if (config.posterPrice) setPosterPrice(config.posterPrice);
      if (config.posterPriceSub) setPosterPriceSub(config.posterPriceSub);
      if (config.posterTime1) setPosterTime1(config.posterTime1);
      if (config.posterTime2) setPosterTime2(config.posterTime2);

      if (config.posterTaglineFr) setPosterTaglineFr(config.posterTaglineFr);
      if (config.posterTaglineEn) setPosterTaglineEn(config.posterTaglineEn);
      if (config.posterTagline && !config.posterTaglineFr) {
        if (config.posterLang === 'en') setPosterTaglineEn(config.posterTagline);
        else setPosterTaglineFr(config.posterTagline);
      }

      if (config.posterFootnoteFr) setPosterFootnoteFr(config.posterFootnoteFr);
      if (config.posterFootnoteEn) setPosterFootnoteEn(config.posterFootnoteEn);
      if (config.posterFootnote && !config.posterFootnoteFr) {
        if (config.posterLang === 'en') setPosterFootnoteEn(config.posterFootnote);
        else setPosterFootnoteFr(config.posterFootnote);
      }

      if (config.posterAddressFr) setPosterAddressFr(config.posterAddressFr);
      if (config.posterAddressEn) setPosterAddressEn(config.posterAddressEn);
      if (config.posterAddress && !config.posterAddressFr) {
        if (config.posterLang === 'en') setPosterAddressEn(config.posterAddress);
        else setPosterAddressFr(config.posterAddress);
      }

      if (config.bannerHeaderFr) setBannerHeaderFr(config.bannerHeaderFr);
      if (config.bannerHeaderEn) setBannerHeaderEn(config.bannerHeaderEn);
      if (config.bannerHeader && !config.bannerHeaderFr) {
        if (config.posterLang === 'en') setBannerHeaderEn(config.bannerHeader);
        else setBannerHeaderFr(config.bannerHeader);
      }

      if (config.bannerMainFr) setBannerMainFr(config.bannerMainFr);
      if (config.bannerMainEn) setBannerMainEn(config.bannerMainEn);
      if (config.bannerMain && !config.bannerMainFr) {
        if (config.posterLang === 'en') setBannerMainEn(config.bannerMain);
        else setBannerMainFr(config.bannerMain);
      }

      if (config.showLogo !== undefined) setShowLogo(config.showLogo);
      if (config.posterLang) setPosterLang(config.posterLang);
      if (config.bgZoom !== undefined) setBgZoom(config.bgZoom);
      if (config.bgShiftX !== undefined) setBgShiftX(config.bgShiftX);
      if (config.bgShiftY !== undefined) setBgShiftY(config.bgShiftY);
      if (config.bgContrast !== undefined) setBgContrast(config.bgContrast);
      if (config.bgGrayscale !== undefined) setBgGrayscale(config.bgGrayscale);
      if (config.vignetteStrength !== undefined) setVignetteStrength(config.vignetteStrength);
      if (config.bgCropTop !== undefined) setBgCropTop(config.bgCropTop);
      if (config.bgCropRight !== undefined) setBgCropRight(config.bgCropRight);
      if (config.bgCropBottom !== undefined) setBgCropBottom(config.bgCropBottom);
      if (config.bgCropLeft !== undefined) setBgCropLeft(config.bgCropLeft);
      if (config.textAlign) setTextAlign(config.textAlign);
      if (config.textAligns) setTextAligns(prev => ({ ...prev, ...config.textAligns }));
      if (config.bgPhotoUrl) setBgPhotoUrl(config.bgPhotoUrl);
      if (config.lineup) setLineup(config.lineup);
      if (config.bannerFooter1) setBannerFooter1(config.bannerFooter1);
      if (config.bannerFooter2) setBannerFooter2(config.bannerFooter2);
      if (config.bannerPrice) setBannerPrice(config.bannerPrice);
      if (config.bannerPriceSub) setBannerPriceSub(config.bannerPriceSub);
      if (config.weeklyRows) setWeeklyRows(config.weeklyRows);
    } catch (e) {
      console.error('Error loading preset configuration:', e);
    }
  };

  const handleDeletePresetClick = async (presetId, name) => {
    if (!confirm(`Are you sure you want to delete the model template "${name}"?`)) return;
    const res = await deletePosterPreset(presetId);
    if (res.success) {
      setSelectedPresetId('');
      const loadRes = await getPosterPresets();
      if (loadRes.success) {
        setPresets(loadRes.presets);
      }
    } else {
      alert('Failed to delete preset: ' + res.error);
    }
  };

  // Manual helper to apply details from selected public event
  const handleApplyEventPrefill = (eventId) => {
    if (!eventId) return;
    const evt = events.find(e => e.id === eventId);
    if (!evt) return;

    // Determine template based on type
    if (evt.type === 'COMEDY') {
      setSelectedTemplate('comedy-banner');
      setBannerHeaderFr("LES JEUDIS À 20H");
      setBannerHeaderEn("THURSDAY'S AT 8PM");
      setBannerMainFr("SOIRÉE D'HUMOUR");
      setBannerMainEn("COMEDY EVERY THURSDAY");
    } else {
      setSelectedTemplate('live-music');
      setPosterTitleFr('MUSIQUE LIVE');
      setPosterTitleEn('LIVE MUSIC');
      setPosterSubTitleFr('CE SOIR');
      setPosterSubTitleEn('TONIGHT');
      setPosterTaglineFr('BONNE MUSIQUE. EXCELLENTS COCKTAILS. SOIRÉES INOUBLIABLES.');
      setPosterTaglineEn('GREAT MUSIC. EXCELLENT COCKTAILS. UNFORGETTABLE NIGHTS.');
      setPosterFootnoteFr('RÉSERVATIONS RECOMMANDÉES');
      setPosterFootnoteEn('RESERVATIONS RECOMMENDED');
    }

    // Format date text for both languages
    const dateObj = new Date(evt.date);
    const optionsFr = { weekday: 'long', day: 'numeric', month: 'long' };
    setPosterDateTextFr(dateObj.toLocaleDateString('fr-FR', optionsFr).toUpperCase());
    
    const optionsEn = { weekday: 'long', month: 'long', day: 'numeric' };
    setPosterDateTextEn(dateObj.toLocaleDateString('en-US', optionsEn).toUpperCase());

    if (evt.photo?.url) {
      setBgPhotoUrl(evt.photo.url);
    }
  };

  // Automatically update ONLY the date when user links an event
  const handleSelectEvent = (eventId) => {
    setSelectedEventId(eventId);
    if (!eventId) return;

    const evt = events.find(e => e.id === eventId);
    if (!evt) return;

    const dateObj = new Date(evt.date);
    const optionsFr = { weekday: 'long', day: 'numeric', month: 'long' };
    setPosterDateTextFr(dateObj.toLocaleDateString('fr-FR', optionsFr).toUpperCase());
    
    const optionsEn = { weekday: 'long', month: 'long', day: 'numeric' };
    setPosterDateTextEn(dateObj.toLocaleDateString('en-US', optionsEn).toUpperCase());
  };

  // Handler to open image library selector
  const openPhotoSelector = (field) => {
    setTargetPhotoField(field);
    setShowPhotoSelector(true);
  };

  // Selector feedback
  const handleSelectPhoto = (url) => {
    if (targetPhotoField === 'bg') {
      setBgPhotoUrl(url);
    } else {
      const idx = parseInt(targetPhotoField.replace('weekly', '')) - 1;
      const updated = [...weeklyRows];
      updated[idx].photoUrl = url;
      setWeeklyRows(updated);
    }
    setShowPhotoSelector(false);
  };

  // Add/remove artists in lineup
  const handleAddArtist = () => {
    setLineup([...lineup, { name: 'NEW ARTIST', role: 'INSTRUMENT', type: 'trumpet' }]);
  };

  const handleRemoveArtist = (idx) => {
    setLineup(lineup.filter((_, i) => i !== idx));
  };

  const handleArtistChange = (idx, field, val) => {
    const updated = [...lineup];
    updated[idx][field] = val;
    setLineup(updated);
  };

  // Weekly row updates
  const handleWeeklyChange = (rowIdx, field, val) => {
    const updated = [...weeklyRows];
    updated[rowIdx][field] = val;
    setWeeklyRows(updated);
  };

  // Capture Canvas Helper
  const getCanvas = async () => {
    if (!previewRef.current) return null;
    setIsExporting(true);
    // Give state a split second to apply layouts/hide indicators
    await new Promise(r => setTimeout(r, 100));
    try {
      const isPortrait = selectedTemplate !== 'comedy-banner';
      const targetScale = isPortrait 
        ? (1080 / previewRef.current.offsetWidth) 
        : 2;

      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#120E0B',
        scale: targetScale
      });
      setIsExporting(false);
      return canvas;
    } catch (err) {
      console.error('Failed to render canvas:', err);
      setIsExporting(false);
      return null;
    }
  };

  // Download local file
  const handleDownload = async () => {
    const canvas = await getCanvas();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `magpie_poster_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Save to DB and link to selected event
  const handleSaveToDatabase = async () => {
    const canvas = await getCanvas();
    if (!canvas) {
      alert('Failed to generate poster canvas.');
      return;
    }
    
    const base64Data = canvas.toDataURL('image/jpeg', 0.8);
    const name = `Poster - ${posterTitle || bannerMain} - ${new Date().toISOString().split('T')[0]}`;
    
    const res = await saveGeneratedPoster(name, base64Data, selectedEventId || null);
    if (res.success) {
      alert('Poster generated and saved successfully to Media Library' + (selectedEventId ? ' and linked to your event!' : '!'));
      if (onSave) onSave();
    } else {
      alert('Failed to save poster: ' + res.error);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
      
      {/* LEFT COLUMN: CONTROLS & EDIT FORM */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', border: '1px solid rgba(201, 168, 76, 0.15)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Saved Presets / Modèles Enregistrés */}
        <div style={{ borderBottom: '1px solid rgba(201, 168, 76, 0.25)', paddingBottom: '1.5rem', marginBottom: '0.5rem' }}>
          <label className="section-label" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.8rem', color: 'var(--gold)' }}>
            📂 CHOOSE SAVED MODEL / MODÈLES ENREGISTRÉS
          </label>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1rem' }}>
            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="cms-input"
              style={{ flex: 1, padding: '0.8rem', fontSize: '0.9rem', background: '#000', color: 'white', border: '1px solid rgba(201, 168, 76, 0.3)' }}
            >
              <option value="">-- Select Saved Model / Choisir un modèle --</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
            {selectedPresetId && (
              <button
                type="button"
                onClick={() => {
                  const p = presets.find(x => x.id === selectedPresetId);
                  if (p) handleDeletePresetClick(p.id, p.name);
                }}
                className="btn-secondary"
                style={{ padding: '0.8rem 1.2rem', cursor: 'pointer', background: '#4A1D1D', color: '#ff8888', border: '1px solid #7c2d2d', borderRadius: '3px' }}
                title="Delete Selected Model"
              >
                🗑️ Delete
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <input
              type="text"
              placeholder="Name current setup to save as model..."
              className="cms-input"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              style={{ flex: 1, padding: '0.7rem 0.9rem', fontSize: '0.85rem' }}
            />
            <button
              type="button"
              onClick={handleSavePreset}
              className="btn-primary"
              style={{ padding: '0.7rem 1.2rem', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              💾 Save Setup
            </button>
          </div>
        </div>
        
        {/* Poster Language Selection */}
        <div>
          <label className="section-label" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.8rem' }}>POSTER LANGUAGE / LANGUE DE L'AFFICHE</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setPosterLang('fr')}
              style={{
                flex: 1, padding: '0.8rem', background: posterLang === 'fr' ? 'var(--gold)' : 'rgba(0,0,0,0.4)',
                color: posterLang === 'fr' ? 'black' : 'var(--cream)', border: '1px solid var(--gold)',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.3s'
              }}
            >
              Français (FR)
            </button>
            <button 
              onClick={() => setPosterLang('en')}
              style={{
                flex: 1, padding: '0.8rem', background: posterLang === 'en' ? 'var(--gold)' : 'rgba(0,0,0,0.4)',
                color: posterLang === 'en' ? 'black' : 'var(--cream)', border: '1px solid var(--gold)',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.3s'
              }}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Template Select */}
        <div>
          <label className="section-label" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.8rem' }}>SELECT LAYOUT TEMPLATE</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setSelectedTemplate('live-music')}
              style={{
                flex: 1, padding: '1rem', background: selectedTemplate === 'live-music' ? 'var(--gold)' : 'rgba(0,0,0,0.4)',
                color: selectedTemplate === 'live-music' ? 'black' : 'var(--cream)', border: '1px solid var(--gold)',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.3s'
              }}
            >
              Portrait: Live Music
            </button>
            <button 
              onClick={() => setSelectedTemplate('comedy-banner')}
              style={{
                flex: 1, padding: '1rem', background: selectedTemplate === 'comedy-banner' ? 'var(--gold)' : 'rgba(0,0,0,0.4)',
                color: selectedTemplate === 'comedy-banner' ? 'black' : 'var(--cream)', border: '1px solid var(--gold)',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.3s'
              }}
            >
              Landscape: Comedy Banner
            </button>
            <button 
              onClick={() => setSelectedTemplate('weekly-lineup')}
              style={{
                flex: 1, padding: '1rem', background: selectedTemplate === 'weekly-lineup' ? 'var(--gold)' : 'rgba(0,0,0,0.4)',
                color: selectedTemplate === 'weekly-lineup' ? 'black' : 'var(--cream)', border: '1px solid var(--gold)',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.3s'
              }}
            >
              Portrait: Weekly Lineup
            </button>
            <button 
              onClick={() => setSelectedTemplate('live-music-alt')}
              style={{
                flex: 1, padding: '1rem', background: selectedTemplate === 'live-music-alt' ? 'var(--gold)' : 'rgba(0,0,0,0.4)',
                color: selectedTemplate === 'live-music-alt' ? 'black' : 'var(--cream)', border: '1px solid var(--gold)',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.3s'
              }}
            >
              Portrait: Live Music Alt
            </button>
          </div>
        </div>

        {/* Load Event Data */}
        <div>
          <label className="section-label" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', color: 'var(--gold)' }}>
            🔗 LINK TO PUBLIC EVENT / LIER À UN ÉVÉNEMENT PUBLIC
          </label>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <select 
              value={selectedEventId}
              onChange={(e) => handleSelectEvent(e.target.value)}
              style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.8)', color: 'var(--cream)', border: '1px solid rgba(201, 168, 76, 0.3)', outline: 'none', fontSize: '1rem' }}
            >
              <option value="">-- Create Standalone (No Link) --</option>
              {events.map(e => {
                const d = new Date(e.date);
                return (
                  <option key={e.id} value={e.id}>
                    {d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {e.title_en || e.title_fr} ({e.type})
                  </option>
                );
              })}
            </select>

            {selectedEventId && (
              <button
                type="button"
                onClick={() => handleApplyEventPrefill(selectedEventId)}
                style={{
                  padding: '1rem 1.2rem',
                  background: 'transparent',
                  color: 'var(--gold)',
                  border: '1px solid var(--gold)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201, 168, 76, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                📥 Pre-fill / Pré-remplir
              </button>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingTop: '1.5rem' }}>
          
          {/* TEMPLATE 1 & 4: LIVE MUSIC & LIVE MUSIC ALT CONTROLS */}
          {(selectedTemplate === 'live-music' || selectedTemplate === 'live-music-alt') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>
                    Title <AlignBtn field="title" aligns={textAligns} onChange={setAlign} />
                  </label>
                  <input type="text" className="cms-input" value={posterTitle} onChange={(e) => setPosterTitle(e.target.value)} style={{ padding: '0.8rem' }} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>
                    Sub-title <AlignBtn field="subtitle" aligns={textAligns} onChange={setAlign} />
                  </label>
                  <input type="text" className="cms-input" value={posterSubTitle} onChange={(e) => setPosterSubTitle(e.target.value)} style={{ padding: '0.8rem' }} />
                </div>
              </div>

              <div>
                <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>
                  Date Details text <AlignBtn field="date" aligns={textAligns} onChange={setAlign} />
                </label>
                <input type="text" className="cms-input" value={posterDateText} onChange={(e) => setPosterDateText(e.target.value)} style={{ padding: '0.8rem' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>1st Set Time</label>
                  <input type="text" className="cms-input" value={posterTime1} onChange={(e) => setPosterTime1(e.target.value)} style={{ padding: '0.8rem' }} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>2nd Set Time</label>
                  <input type="text" className="cms-input" value={posterTime2} onChange={(e) => setPosterTime2(e.target.value)} style={{ padding: '0.8rem' }} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>Price & Sub</label>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <input type="text" className="cms-input" value={posterPrice} onChange={(e) => setPosterPrice(e.target.value)} style={{ padding: '0.8rem', width: '50%' }} />
                    <input type="text" className="cms-input" value={posterPriceSub} onChange={(e) => setPosterPriceSub(e.target.value)} style={{ padding: '0.8rem', width: '50%' }} />
                  </div>
                </div>
              </div>

              {/* Background Photo Pick */}
              <div>
                <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>BACKGROUND IMAGE</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <img src={bgPhotoUrl} alt="bg" style={{ width: '80px', height: '60px', objectFit: 'cover', border: '1px solid var(--gold)' }} />
                  <button type="button" onClick={() => openPhotoSelector('bg')} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}>Change Background Image</button>
                </div>

                {/* Gliders/Sliders for Zoom and Position Alignment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', border: '1px solid rgba(201, 168, 76, 0.1)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>
                      <span>ZOOM LEVEL: {bgZoom === 100 ? 'Auto (Cover)' : `${bgZoom}%`}</span>
                      <button type="button" onClick={() => { setBgZoom(100); setBgShiftX(0); setBgShiftY(0); setBgContrast(100); setBgGrayscale(false); setVignetteStrength(60); setBgCropTop(0); setBgCropRight(0); setBgCropBottom(0); setBgCropLeft(0); }} style={{ background: 'none', border: 'none', color: 'gray', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline' }}>Reset All</button>
                    </div>
                    <input 
                      type="range" min="50" max="250" value={bgZoom} onChange={(e) => setBgZoom(parseInt(e.target.value))} 
                      style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>
                        <span>SHIFT X: {bgShiftX > 0 ? `+${bgShiftX}` : bgShiftX}px</span>
                      </div>
                      <input 
                        type="range" min="-300" max="300" value={bgShiftX} onChange={(e) => setBgShiftX(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>
                        <span>SHIFT Y: {bgShiftY > 0 ? `+${bgShiftY}` : bgShiftY}px</span>
                      </div>
                      <input 
                        type="range" min="-300" max="300" value={bgShiftY} onChange={(e) => setBgShiftY(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  {/* Crop Sliders */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingTop: '0.8rem', marginTop: '0.4rem' }}>
                    <div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--gold)', display: 'block', marginBottom: '0.1rem' }}>CROP TOP: {bgCropTop}%</span>
                      <input 
                        type="range" min="0" max="100" value={bgCropTop} onChange={(e) => setBgCropTop(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--gold)', display: 'block', marginBottom: '0.1rem' }}>RIGHT: {bgCropRight}%</span>
                      <input 
                        type="range" min="0" max="100" value={bgCropRight} onChange={(e) => setBgCropRight(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--gold)', display: 'block', marginBottom: '0.1rem' }}>BOTTOM: {bgCropBottom}%</span>
                      <input 
                        type="range" min="0" max="100" value={bgCropBottom} onChange={(e) => setBgCropBottom(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--gold)', display: 'block', marginBottom: '0.1rem' }}>LEFT: {bgCropLeft}%</span>
                      <input 
                        type="range" min="0" max="100" value={bgCropLeft} onChange={(e) => setBgCropLeft(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingTop: '0.8rem', marginTop: '0.4rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>
                        <span>CONTRAST: {bgContrast}%</span>
                      </div>
                      <input 
                        type="range" min="50" max="150" value={bgContrast} onChange={(e) => setBgContrast(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>
                        <span>VIGNETTE: {vignetteStrength}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={vignetteStrength} onChange={(e) => setVignetteStrength(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                  </div>
                  
                  {/* Black & White Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem', borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingTop: '0.6rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--gold)', fontFamily: 'var(--font-deco)', letterSpacing: '0.05em' }}>
                      <input 
                        type="checkbox" 
                        checked={bgGrayscale} 
                        onChange={(e) => setBgGrayscale(e.target.checked)} 
                        style={{ accentColor: 'var(--gold)', cursor: 'pointer' }} 
                      />
                      <span>BLACK & WHITE (GRAYSCALE)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

              {/* Lineup Artist Rows */}
              <div>
                <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.6rem' }}>ARTIST LINEUP & INSTRUMENTS</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
                  {lineup.map((art, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: '0.6rem', alignItems: 'center' }}>
                      <input type="text" className="cms-input" value={art.name} onChange={(e) => handleArtistChange(idx, 'name', e.target.value.toUpperCase())} style={{ padding: '0.6rem', fontSize: '0.9rem' }} />
                      <input type="text" className="cms-input" value={art.role} onChange={(e) => handleArtistChange(idx, 'role', e.target.value.toUpperCase())} style={{ padding: '0.6rem', fontSize: '0.9rem' }} />
                       <select className="cms-input" value={art.type} onChange={(e) => handleArtistChange(idx, 'type', e.target.value)} style={{ padding: '0.6rem', fontSize: '0.9rem', background: '#000', color: 'white' }}>
                        <option value="trumpet">🎺 Trumpet / Horns</option>
                        <option value="bass">🎻 Contrabass / Bass</option>
                        <option value="drums">🥁 Drums / Percussion</option>
                        <option value="vocals">🎤 Vocals / Microphone</option>
                        <option value="piano">🎹 Piano / Keyboard</option>
                        <option value="guitar">🎸 Guitar / Guitare</option>
                        <option value="saxophone">🎷 Saxophone</option>
                        <option value="violin">🎻 Violin / Violon</option>
                        <option value="comedy">🎭 Comedy Mask</option>
                        <option value="cocktail">🍸 Cocktail / Bar</option>
                      </select>
                      <button onClick={() => handleRemoveArtist(idx)} style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.2)', padding: '0.6rem', cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                </div>
                <button onClick={handleAddArtist} className="btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', cursor: 'pointer' }}>+ Add Lineup Member</button>
              </div>

              <div>
                <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>
                  Bottom Tagline <AlignBtn field="tagline" aligns={textAligns} onChange={setAlign} />
                </label>
                <input type="text" className="cms-input" value={posterTagline} onChange={(e) => setPosterTagline(e.target.value)} style={{ padding: '0.8rem' }} />
              </div>

              <div>
                <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>
                  Footnote / CTA <AlignBtn field="footnote" aligns={textAligns} onChange={setAlign} />
                </label>
                <input type="text" className="cms-input" value={posterFootnote} onChange={(e) => setPosterFootnote(e.target.value)} style={{ padding: '0.8rem' }} />
              </div>

              <div>
                <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem', color: 'var(--gold)' }}>
                  Restaurant Address (Italicized on Poster)
                </label>
                <input type="text" className="cms-input" value={posterAddress} onChange={(e) => setPosterAddress(e.target.value)} style={{ padding: '0.8rem' }} />
              </div>
            </div>
          )}

          {/* TEMPLATE 2: COMEDY BANNER CONTROLS */}
          {selectedTemplate === 'comedy-banner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>Top Red Header text</label>
                <input type="text" className="cms-input" value={bannerHeader} onChange={(e) => setBannerHeader(e.target.value)} style={{ padding: '0.8rem' }} />
              </div>
              
              <div>
                <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>Main Bold Title</label>
                <input type="text" className="cms-input" value={bannerMain} onChange={(e) => setBannerMain(e.target.value)} style={{ padding: '0.8rem' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>Footer Location/Venue</label>
                  <input type="text" className="cms-input" value={bannerFooter1} onChange={(e) => setBannerFooter1(e.target.value)} style={{ padding: '0.8rem' }} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>Footer Address</label>
                  <input type="text" className="cms-input" value={bannerFooter2} onChange={(e) => setBannerFooter2(e.target.value)} style={{ padding: '0.8rem' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>Price (e.g. 10$)</label>
                  <input type="text" className="cms-input" value={bannerPrice} onChange={(e) => setBannerPrice(e.target.value)} style={{ padding: '0.8rem' }} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>Price Sub-label</label>
                  <input type="text" className="cms-input" value={bannerPriceSub} onChange={(e) => setBannerPriceSub(e.target.value)} style={{ padding: '0.8rem' }} />
                </div>
              </div>

              {/* Background Photo Pick */}
              <div style={{ marginTop: '1rem' }}>
                <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>BANNER BACKGROUND IMAGE</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <img src={bgPhotoUrl} alt="bg" style={{ width: '100px', height: '50px', objectFit: 'cover', border: '1px solid var(--gold)' }} />
                  <button type="button" onClick={() => openPhotoSelector('bg')} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}>Change Background Image</button>
                </div>

                {/* Gliders/Sliders for Zoom and Position Alignment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', border: '1px solid rgba(201, 168, 76, 0.1)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>
                      <span>ZOOM LEVEL: {bgZoom === 100 ? 'Auto (Cover)' : `${bgZoom}%`}</span>
                      <button type="button" onClick={() => { setBgZoom(100); setBgShiftX(0); setBgShiftY(0); setBgContrast(100); setBgGrayscale(false); setVignetteStrength(60); setBgCropTop(0); setBgCropRight(0); setBgCropBottom(0); setBgCropLeft(0); }} style={{ background: 'none', border: 'none', color: 'gray', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline' }}>Reset All</button>
                    </div>
                    <input 
                      type="range" min="50" max="250" value={bgZoom} onChange={(e) => setBgZoom(parseInt(e.target.value))} 
                      style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>
                        <span>SHIFT X: {bgShiftX > 0 ? `+${bgShiftX}` : bgShiftX}px</span>
                      </div>
                      <input 
                        type="range" min="-300" max="300" value={bgShiftX} onChange={(e) => setBgShiftX(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>
                        <span>SHIFT Y: {bgShiftY > 0 ? `+${bgShiftY}` : bgShiftY}px</span>
                      </div>
                      <input 
                        type="range" min="-300" max="300" value={bgShiftY} onChange={(e) => setBgShiftY(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  {/* Crop Sliders */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingTop: '0.8rem', marginTop: '0.4rem' }}>
                    <div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--gold)', display: 'block', marginBottom: '0.1rem' }}>CROP TOP: {bgCropTop}%</span>
                      <input 
                        type="range" min="0" max="100" value={bgCropTop} onChange={(e) => setBgCropTop(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--gold)', display: 'block', marginBottom: '0.1rem' }}>RIGHT: {bgCropRight}%</span>
                      <input 
                        type="range" min="0" max="100" value={bgCropRight} onChange={(e) => setBgCropRight(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--gold)', display: 'block', marginBottom: '0.1rem' }}>BOTTOM: {bgCropBottom}%</span>
                      <input 
                        type="range" min="0" max="100" value={bgCropBottom} onChange={(e) => setBgCropBottom(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--gold)', display: 'block', marginBottom: '0.1rem' }}>LEFT: {bgCropLeft}%</span>
                      <input 
                        type="range" min="0" max="100" value={bgCropLeft} onChange={(e) => setBgCropLeft(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingTop: '0.8rem', marginTop: '0.4rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>
                        <span>CONTRAST: {bgContrast}%</span>
                      </div>
                      <input 
                        type="range" min="50" max="150" value={bgContrast} onChange={(e) => setBgContrast(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>
                        <span>VIGNETTE STRENGTH: {vignetteStrength}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={vignetteStrength} onChange={(e) => setVignetteStrength(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                  </div>
                  
                  {/* Black & White Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem', borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingTop: '0.6rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--gold)', fontFamily: 'var(--font-deco)', letterSpacing: '0.05em' }}>
                      <input 
                        type="checkbox" 
                        checked={bgGrayscale} 
                        onChange={(e) => setBgGrayscale(e.target.checked)} 
                        style={{ accentColor: 'var(--gold)', cursor: 'pointer' }} 
                      />
                      <span>BLACK & WHITE (GRAYSCALE)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* TEMPLATE 3: WEEKLY LINEUP CONTROLS */}
          {selectedTemplate === 'weekly-lineup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {weeklyRows.map((row, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', border: '1px solid rgba(201, 168, 76, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ color: 'var(--gold)', margin: 0, borderBottom: '1px solid rgba(201, 168, 76, 0.1)', paddingBottom: '0.4rem' }}>DAY PROGRAM {idx + 1}</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.2rem' }}>Day & Date</label>
                      <input type="text" className="cms-input" value={row.day} onChange={(e) => handleWeeklyChange(idx, 'day', e.target.value.toUpperCase())} style={{ padding: '0.6rem', fontSize: '0.9rem' }} />
                    </div>
                    <div>
                      <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.2rem' }}>Program Title</label>
                      <input type="text" className="cms-input" value={row.title} onChange={(e) => handleWeeklyChange(idx, 'title', e.target.value.toUpperCase())} style={{ padding: '0.6rem', fontSize: '0.9rem' }} />
                    </div>
                  </div>

                  <div>
                    <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.2rem' }}>Subtitle / Hosted By</label>
                    <input type="text" className="cms-input" value={row.subtitle} onChange={(e) => handleWeeklyChange(idx, 'subtitle', e.target.value.toUpperCase())} style={{ padding: '0.6rem', fontSize: '0.9rem' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.2rem' }}>Show Times</label>
                      <input type="text" className="cms-input" value={row.time} onChange={(e) => handleWeeklyChange(idx, 'time', e.target.value.toUpperCase())} style={{ padding: '0.6rem', fontSize: '0.9rem' }} />
                    </div>
                    <div>
                      <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.2rem' }}>Price / Ticket link details</label>
                      <input type="text" className="cms-input" value={row.extra} onChange={(e) => handleWeeklyChange(idx, 'extra', e.target.value.toUpperCase())} style={{ padding: '0.6rem', fontSize: '0.9rem' }} />
                    </div>
                  </div>

                  <div>
                    <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.2rem' }}>Image Slot</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={row.photoUrl} alt="row" style={{ width: '60px', height: '65px', objectFit: 'cover', border: '1px solid var(--gold)' }} />
                      <button type="button" onClick={() => openPhotoSelector(`weekly${idx + 1}`)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }}>Change Row Image</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Global toggles */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <input 
              type="checkbox" 
              id="show-logo" 
              checked={showLogo} 
              onChange={(e) => setShowLogo(e.target.checked)} 
              style={{ width: '1.3rem', height: '1.3rem', accentColor: 'var(--gold)', cursor: 'pointer' }}
            />
            <label htmlFor="show-logo" style={{ color: 'var(--cream)', fontSize: '0.9rem', cursor: 'pointer' }}>Show Logo Header</label>
          </div>
        </div>

        {/* EXPORT BUTTONS */}
        <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid rgba(201, 168, 76, 0.15)', paddingTop: '2rem', marginTop: '1rem' }}>
          <button 
            onClick={handleDownload} 
            disabled={isExporting}
            className="btn-primary" 
            style={{ flex: 1, padding: '1.2rem', fontSize: '0.95rem', fontWeight: 'bold' }}
          >
            {isExporting ? 'GENERATING...' : '⬇️ DOWNLOAD PNG'}
          </button>
          
          <button 
            onClick={handleSaveToDatabase} 
            disabled={isExporting}
            className="btn-primary" 
            style={{ flex: 1, padding: '1.2rem', fontSize: '0.95rem', fontWeight: 'bold', background: 'var(--cream)', color: 'black' }}
          >
            {isExporting ? 'GENERATING...' : '💾 SAVE & LINK TO EVENT'}
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: LIVE HIGH-FIDELITY POSTER PREVIEW */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <h4 style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', letterSpacing: '0.1em', marginBottom: '1rem', fontSize: '0.85rem' }}>
          LIVE PREVIEW (WYSIWYG)
        </h4>

        {/* ── PREVIEW RENDER CONTAINER ── */}
        <div 
          ref={previewRef}
          id="poster-preview-area"
          style={{
            width: selectedTemplate === 'comedy-banner' ? '800px' : '410px',
            height: selectedTemplate === 'comedy-banner' ? '320px' : '729px',
            background: '#000',
            border: '2px solid var(--gold)',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Outfit, var(--font-sans)',
            color: 'var(--cream)'
          }}
        >
          
          {/* TEMPLATE 1: PORTRAIT LIVE MUSIC POSTER */}
          {selectedTemplate === 'live-music' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#000' }}>
              
              {/* 1. Background Image Layer (Spans 100% width & height) */}
              <div 
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: `url(${bgPhotoUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: `scale(${bgZoom / 100}) translate(${bgShiftX}px, ${bgShiftY}px)`,
                  transformOrigin: 'center center',
                  clipPath: `inset(${bgCropTop}% ${bgCropRight}% ${bgCropBottom}% ${bgCropLeft}%)`,
                  filter: `contrast(${bgContrast}%) ${bgGrayscale ? 'grayscale(100%)' : ''}`,
                  zIndex: 0
                }}
              />

              {/* 2. Black Vignette Radial Gradient (Edge blending centered at 78% of width - the photo column center) */}
              <div 
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'radial-gradient(circle at 78% 50%, transparent 15%, rgba(0,0,0,0.5) 55%, #000 90%)',
                  opacity: vignetteStrength / 100,
                  zIndex: 1
                }}
              />

              {/* 3. Left-to-Right Linear Gradient Overlay (Fades left side to absolute black for text readability) */}
              <div 
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to right, #000 0%, #000 45%, transparent 68%)',
                  zIndex: 2
                }}
              />

              {/* 4. Content Grid Layer (Brings back our text layout column on the left 62% side) */}
              <div style={{ 
                position: 'relative', 
                zIndex: 3, 
                display: 'flex', 
                width: '100%', 
                height: 'calc(100% - 110px)' 
              }}>
                <div style={{ 
                  width: '62%', 
                  height: '100%', 
                  padding: '1.6rem 1.2rem 0.2rem 2.2rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  alignItems: 'stretch'
                }}>
                  {/* Logo Header */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem', opacity: showLogo ? 1 : 0 }}>
                    <img src={logoUrl} alt="logo" style={{ width: '40px', height: '40px', filter: 'brightness(1.2)' }} />
                    <p style={{ margin: 0, fontFamily: 'var(--font-deco)', fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '0.15em', fontWeight: 'bold' }}>MAGPIE MAGIQUE</p>
                    <p style={{ margin: 0, fontFamily: 'var(--font-deco)', fontSize: '0.52rem', color: 'rgba(232, 218, 187, 0.5)', letterSpacing: '0.08em', fontWeight: 'bold', fontStyle: 'italic' }}>{posterAddress.toUpperCase()}</p>
                  </div>

                  {/* Left-Aligned Main Titles */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: taFlex('title'), marginTop: '0.1rem', position: 'relative' }}>
                    <h1 style={{ 
                      fontFamily: 'var(--font-serif)', fontSize: '2.8rem', margin: 0, letterSpacing: '0.15em', 
                      color: 'rgba(232, 218, 187, 0.9)', textTransform: 'uppercase', fontWeight: '800', lineHeight: 1,
                      textAlign: ta('title'), width: '100%'
                    }}>
                      {posterTitle.split(' ')[0]}
                    </h1>
                    <h2 style={{
                      fontFamily: "'Pinyon Script', cursive", fontSize: '5.2rem', margin: '-2.2rem 0 0 0',
                      color: '#9E1B1B', fontWeight: '400', lineHeight: 1,
                      textAlign: ta('title'), width: '100%', textTransform: 'none'
                    }}>
                      {getSecondWordFormatted(posterTitle)}
                    </h2>

                    {(() => {
                      const parts = posterSubTitle.split('/');
                      const subtitleAlign = ta('subtitle');
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: taFlex('subtitle'), width: '100%', margin: '0.6rem 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%' }}>
                            {subtitleAlign !== 'left' && (
                              <div style={{ flex: 1, height: '1px', background: 'rgba(201, 168, 76, 0.25)' }} />
                            )}
                            <span style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>✦</span>
                            <span style={{ fontFamily: 'var(--font-deco)', fontSize: '0.78rem', letterSpacing: '0.2em', color: 'var(--cream)', fontWeight: 'bold', textAlign: subtitleAlign }}>
                              {parts[0].trim().toUpperCase()}
                            </span>
                            <span style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>✦</span>
                            {subtitleAlign !== 'right' && (
                              <div style={{ flex: 1, height: '1px', background: 'rgba(201, 168, 76, 0.25)' }} />
                            )}
                          </div>
                          {parts[1] && (
                            <span style={{ fontFamily: 'var(--font-deco)', fontSize: '0.68rem', letterSpacing: '0.15em', color: 'var(--gold)', fontWeight: '600', marginTop: '0.2rem', textAlign: subtitleAlign, width: '100%' }}>
                              {parts[1].trim().toUpperCase()}
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    <p style={{ 
                      margin: '0.2rem 0 0 0', 
                      fontFamily: 'var(--font-deco)', 
                      fontSize: '0.78rem', 
                      color: 'rgba(232, 218, 187, 0.95)', 
                      letterSpacing: '0.08em', 
                      fontWeight: 'bold', 
                      textAlign: ta('date'), 
                      width: '100%',
                      whiteSpace: 'nowrap'
                    }}>
                      {posterDateText}
                    </p>
                  </div>

                  {/* Lineup list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', margin: '0.8rem 0' }}>
                    {lineup.map((art, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <InstrumentIcon type={art.type} />

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--cream)', letterSpacing: '0.05em', lineHeight: 1.1 }}>{art.name || 'ARTIST NAME'}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--gold)', letterSpacing: '0.05em', fontWeight: '500', marginTop: '1px' }}>{art.role || 'INSTRUMENT'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Times & Price Footer Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem', margin: '0.2rem 0' }}>
                    
                    {/* Art Deco Sets Box with Notched Corners */}
                    <div style={{ 
                      position: 'relative',
                      padding: '0.45rem 1.1rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.15rem',
                      background: 'rgba(0,0,0,0.45)',
                      flex: 1
                    }}>
                      {/* Outer notched frame segments */}
                      <div style={{ position: 'absolute', top: 0, left: '6px', right: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: '6px', right: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', left: 0, top: '6px', bottom: '6px', width: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', right: 0, top: '6px', bottom: '6px', width: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      
                      <div style={{ position: 'absolute', top: '5px', left: 0, width: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', top: 0, left: '5px', width: '1px', height: '6px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      
                      <div style={{ position: 'absolute', top: '5px', right: 0, width: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', top: 0, right: '5px', width: '1px', height: '6px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      
                      <div style={{ position: 'absolute', bottom: '5px', left: 0, width: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: '5px', width: '1px', height: '6px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      
                      <div style={{ position: 'absolute', bottom: '5px', right: 0, width: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', bottom: 0, right: '5px', width: '1px', height: '6px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      
                      {/* Inner border line */}
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px',
                        right: '3px',
                        bottom: '3px',
                        border: '1px solid rgba(201, 168, 76, 0.22)',
                        pointerEvents: 'none'
                      }} />

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, padding: '1px 0' }}>
                        <span style={{ fontSize: '0.6rem', color: 'rgba(232, 218, 187, 0.8)', fontWeight: 'bold', letterSpacing: '0.08em' }}>
                          {posterLang === 'fr' ? 'PREMIER SET' : 'FIRST SET'}
                        </span>
                        <span style={{ fontSize: '1.15rem', color: 'var(--gold)', fontWeight: 'bold', fontFamily: 'var(--font-serif)', marginTop: '1px' }}>{posterTime1}</span>
                      </div>
                      <div style={{ width: '100%', height: '1px', background: 'rgba(201, 168, 76, 0.22)', zIndex: 1, margin: '1px 0' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, padding: '1px 0' }}>
                        <span style={{ fontSize: '0.6rem', color: 'rgba(232, 218, 187, 0.8)', fontWeight: 'bold', letterSpacing: '0.08em' }}>
                          {posterLang === 'fr' ? 'DEUXIÈME SET' : 'SECOND SET'}
                        </span>
                        <span style={{ fontSize: '1.15rem', color: 'var(--gold)', fontWeight: 'bold', fontFamily: 'var(--font-serif)', marginTop: '1px' }}>{posterTime2}</span>
                      </div>
                    </div>

                    {/* Circle Price */}
                    <div style={{ 
                      width: '68px', height: '68px', 
                      border: '1px solid var(--gold)', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.45)',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '1.4rem', color: 'var(--gold)', fontWeight: 'bold', fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{posterPrice}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--cream)', fontWeight: 'bold', letterSpacing: '0.05em', marginTop: '1px' }}>{posterPriceSub}</span>
                    </div>

                  </div>

                </div>

                {/* Empty right column so the image shines through */}
                <div style={{ width: '38%', height: '100%' }} />

              </div>

              {/* Centered tagline & footnote at the bottom of the poster */}
              <div style={{ 
                position: 'absolute', 
                bottom: '26px', 
                left: '20px', 
                right: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.3rem', 
                alignItems: 'center', 
                textAlign: 'center',
                zIndex: 4
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.85rem', 
                  color: 'rgba(232, 218, 187, 0.9)', 
                  letterSpacing: '0.06em', 
                  fontWeight: '500', 
                  lineHeight: 1.35,
                  textTransform: 'uppercase',
                  width: '100%' 
                }}>
                  {posterTagline}
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.82rem', 
                  color: 'var(--gold)', 
                  letterSpacing: '0.15em', 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  width: '100%' 
                }}>
                  {posterFootnote}
                </p>
              </div>

              {/* Decorative Frame around the entire layout */}
              <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: '1px solid rgba(201, 168, 76, 0.25)', pointerEvents: 'none', zIndex: 5 }} />

            </div>
          )}

          {/* TEMPLATE 2: LANDSCAPE COMEDY BANNER */}
          {selectedTemplate === 'comedy-banner' && (
            <>
              {/* Full background picture with dark right gradient */}
              <div 
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: `url(${bgPhotoUrl})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: `scale(${bgZoom / 100}) translate(${bgShiftX}px, ${bgShiftY}px)`,
                  transformOrigin: 'center center',
                  clipPath: `inset(${bgCropTop}% ${bgCropRight}% ${bgCropBottom}% ${bgCropLeft}%)`,
                  filter: `contrast(${bgContrast}%) ${bgGrayscale ? 'grayscale(100%)' : ''}`,
                  zIndex: 0
                }}
              />
              {/* Black Vignette Radial Gradient centered at 25% (left side photo area) */}
              <div 
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'radial-gradient(circle at 25% 50%, transparent 20%, rgba(0,0,0,0.5) 60%, #000 95%)',
                  opacity: vignetteStrength / 100,
                  zIndex: 1
                }}
              />
              <div 
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to right, transparent 35%, #000 55%, #000 100%)',
                  zIndex: 2
                }}
              />

              <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem 3rem', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'right' }}>
                
                {/* Top header ribbon */}
                <div style={{ 
                  background: '#6E1E1E', color: 'white', 
                  padding: '0.4rem 1.8rem', 
                  borderRadius: '3px',
                  fontFamily: 'var(--font-deco)', 
                  fontSize: '0.9rem', 
                  letterSpacing: '0.12em',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }}>
                  {bannerHeader}
                </div>

                {/* Main Titles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.5rem' }}>
                  <h1 style={{ 
                    fontFamily: 'var(--font-serif)', fontSize: '2.4rem', margin: 0, fontWeight: '900', 
                    color: '#F4D03F', letterSpacing: '0.05em', textShadow: '2px 2px 0px black'
                  }}>
                    {bannerMain}
                  </h1>
                  {/* Thin Line separator */}
                  <div style={{ width: '150px', height: '1px', background: 'rgba(201, 168, 76, 0.45)', margin: '0.6rem 0 0.2rem auto' }} />
                </div>

                {/* Price badge */}
                {bannerPrice && (
                  <div style={{
                    position: 'absolute', bottom: '1.8rem', left: '2rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    background: 'rgba(0,0,0,0.7)',
                    border: '1px solid var(--gold)',
                    borderRadius: '50%',
                    width: '72px', height: '72px',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(201,168,76,0.3)'
                  }}>
                    <span style={{ fontSize: '1.4rem', color: 'var(--gold)', fontWeight: 'bold', fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{bannerPrice}</span>
                    <span style={{ fontSize: '0.55rem', color: 'var(--cream)', letterSpacing: '0.05em', fontWeight: 'bold' }}>{bannerPriceSub}</span>
                  </div>
                )}

                {/* Bottom right address & venue */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontFamily: 'var(--font-deco)', letterSpacing: '0.1em', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(232, 218, 187, 0.95)', fontWeight: 'bold' }}>{bannerFooter1}</span>
                  <span style={{ fontSize: '0.64rem', color: 'var(--gold)', fontWeight: 'bold' }}>{bannerFooter2}</span>
                </div>
              </div>
            </>
          )}

          {/* TEMPLATE 4: PORTRAIT LIVE MUSIC ALT — reference style */}
          {selectedTemplate === 'live-music-alt' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#000' }}>
              
              {/* 1. Background Image Layer (Spans 100% width & height) */}
              <div 
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: `url(${bgPhotoUrl})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: `scale(${bgZoom / 100}) translate(${bgShiftX}px, ${bgShiftY}px)`,
                  transformOrigin: 'center center',
                  clipPath: `inset(${bgCropTop}% ${bgCropRight}% ${bgCropBottom}% ${bgCropLeft}%)`,
                  filter: `contrast(${bgContrast}%) ${bgGrayscale ? 'grayscale(100%)' : ''}`,
                  zIndex: 0
                }}
              />

              {/* 2. Black Vignette Radial Gradient (Edge blending centered at 78% of width) */}
              <div 
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'radial-gradient(circle at 78% 50%, transparent 15%, rgba(0,0,0,0.5) 55%, #000 90%)',
                  opacity: vignetteStrength / 100,
                  zIndex: 1
                }}
              />

              {/* 3. Left-to-Right Linear Gradient Overlay (Fades left side to absolute black for text readability) */}
              <div 
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to right, #000 0%, #000 45%, transparent 68%)',
                  zIndex: 2
                }}
              />

              {/* 4. Content Grid Layer (Brings back our text layout column on the left 62% side) */}
              <div style={{ 
                position: 'relative', 
                zIndex: 3, 
                display: 'flex', 
                width: '100%', 
                height: 'calc(100% - 110px)' 
              }}>
                <div style={{ 
                  width: '62%', 
                  height: '100%', 
                  padding: '2.2rem 1.2rem 0.2rem 2.2rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  alignItems: 'stretch'
                }}>
                  {/* Logo Header */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem', opacity: showLogo ? 1 : 0 }}>
                    <img src={logoUrl} alt="logo" style={{ width: '40px', height: '40px', filter: 'brightness(1.2)' }} />
                    <p style={{ margin: 0, fontFamily: 'var(--font-deco)', fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '0.15em', fontWeight: 'bold' }}>MAGPIE MAGIQUE</p>
                    <p style={{ margin: 0, fontFamily: 'var(--font-deco)', fontSize: '0.52rem', color: 'rgba(232, 218, 187, 0.5)', letterSpacing: '0.08em', fontWeight: 'bold', fontStyle: 'italic' }}>{posterAddress.toUpperCase()}</p>
                  </div>

                  {/* Left-Aligned Main Titles */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: taFlex('title'), marginTop: '0.8rem', position: 'relative' }}>
                    <h1 style={{ 
                      fontFamily: 'var(--font-serif)', fontSize: '2.8rem', margin: 0, letterSpacing: '0.15em', 
                      color: 'rgba(232, 218, 187, 0.9)', textTransform: 'uppercase', fontWeight: '800', lineHeight: 1,
                      textAlign: ta('title'), width: '100%'
                    }}>
                      {posterTitle.split(' ')[0]}
                    </h1>
                    <h2 style={{
                      fontFamily: "'Pinyon Script', cursive", fontSize: '5.2rem', margin: '-2.2rem 0 0 0',
                      color: '#9E1B1B', fontWeight: '400', lineHeight: 1,
                      textAlign: ta('title'), width: '100%', textTransform: 'none'
                    }}>
                      {getSecondWordFormatted(posterTitle)}
                    </h2>

                    {(() => {
                      const parts = posterSubTitle.split('/');
                      const subtitleAlign = ta('subtitle');
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: taFlex('subtitle'), width: '100%', margin: '0.6rem 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%' }}>
                            {subtitleAlign !== 'left' && (
                              <div style={{ flex: 1, height: '1px', background: 'rgba(201, 168, 76, 0.25)' }} />
                            )}
                            <span style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>✦</span>
                            <span style={{ fontFamily: 'var(--font-deco)', fontSize: '0.78rem', letterSpacing: '0.2em', color: 'var(--cream)', fontWeight: 'bold', textAlign: subtitleAlign }}>
                              {parts[0].trim().toUpperCase()}
                            </span>
                            <span style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>✦</span>
                            {subtitleAlign !== 'right' && (
                              <div style={{ flex: 1, height: '1px', background: 'rgba(201, 168, 76, 0.25)' }} />
                            )}
                          </div>
                          {parts[1] && (
                            <span style={{ fontFamily: 'var(--font-deco)', fontSize: '0.68rem', letterSpacing: '0.15em', color: 'var(--gold)', fontWeight: '600', marginTop: '0.2rem', textAlign: subtitleAlign, width: '100%' }}>
                              {parts[1].trim().toUpperCase()}
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    <p style={{ 
                      margin: '0.2rem 0 0 0', 
                      fontFamily: 'var(--font-deco)', 
                      fontSize: '0.92rem', 
                      color: 'rgba(232, 218, 187, 0.95)', 
                      letterSpacing: '0.08em', 
                      fontWeight: 'bold', 
                      textAlign: ta('date'), 
                      width: '100%',
                      whiteSpace: 'nowrap'
                    }}>
                      {posterDateText}
                    </p>
                    <p style={{
                      margin: '0.8rem 0 0 0',
                      fontFamily: 'Outfit, var(--font-sans)',
                      fontSize: '0.85rem',
                      color: 'rgba(232, 218, 187, 0.9)',
                      letterSpacing: '0.08em',
                      lineHeight: 1.45,
                      textTransform: 'uppercase',
                      textAlign: ta('date'),
                      width: '100%'
                    }}>
                      {posterTagline}
                    </p>
                  </div>

                  {/* Spacer to replace lineup, keeping Times box at bottom */}
                  <div style={{ flex: 1 }} />

                  {/* Times & Price Footer Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem', margin: '0.2rem 0' }}>
                    
                    {/* Art Deco Sets Box with Notched Corners */}
                    <div style={{ 
                      position: 'relative',
                      padding: '0.45rem 1.1rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.15rem',
                      background: 'rgba(0,0,0,0.45)',
                      flex: 1
                    }}>
                      {/* Outer notched frame segments */}
                      <div style={{ position: 'absolute', top: 0, left: '6px', right: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: '6px', right: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', left: 0, top: '6px', bottom: '6px', width: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', right: 0, top: '6px', bottom: '6px', width: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      
                      <div style={{ position: 'absolute', top: '5px', left: 0, width: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', top: 0, left: '5px', width: '1px', height: '6px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      
                      <div style={{ position: 'absolute', top: '5px', right: 0, width: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', top: 0, right: '5px', width: '1px', height: '6px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      
                      <div style={{ position: 'absolute', bottom: '5px', left: 0, width: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: '5px', width: '1px', height: '6px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      
                      <div style={{ position: 'absolute', bottom: '5px', right: 0, width: '6px', height: '1px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      <div style={{ position: 'absolute', bottom: 0, right: '5px', width: '1px', height: '6px', background: 'rgba(201, 168, 76, 0.5)' }} />
                      
                      {/* Inner border line */}
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px',
                        right: '3px',
                        bottom: '3px',
                        border: '1px solid rgba(201, 168, 76, 0.22)',
                        pointerEvents: 'none'
                      }} />

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, padding: '1px 0' }}>
                        <span style={{ fontSize: '0.6rem', color: 'rgba(232, 218, 187, 0.8)', fontWeight: 'bold', letterSpacing: '0.08em' }}>
                          {posterLang === 'fr' ? 'PREMIER SET' : 'FIRST SET'}
                        </span>
                        <span style={{ fontSize: '1.15rem', color: 'var(--gold)', fontWeight: 'bold', fontFamily: 'var(--font-serif)', marginTop: '1px' }}>{posterTime1}</span>
                      </div>
                      <div style={{ width: '100%', height: '1px', background: 'rgba(201, 168, 76, 0.22)', zIndex: 1, margin: '1px 0' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, padding: '1px 0' }}>
                        <span style={{ fontSize: '0.6rem', color: 'rgba(232, 218, 187, 0.8)', fontWeight: 'bold', letterSpacing: '0.08em' }}>
                          {posterLang === 'fr' ? 'DEUXIÈME SET' : 'SECOND SET'}
                        </span>
                        <span style={{ fontSize: '1.15rem', color: 'var(--gold)', fontWeight: 'bold', fontFamily: 'var(--font-serif)', marginTop: '1px' }}>{posterTime2}</span>
                      </div>
                    </div>

                    {/* Price circle badge */}
                    {posterPrice && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--gold)',
                        borderRadius: '50%',
                        width: '58px',
                        height: '58px',
                        background: 'rgba(0,0,0,0.5)',
                        boxShadow: '0 0 12px rgba(201, 168, 76, 0.2)'
                      }}>
                        <span style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 'bold', fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{posterPrice}</span>
                        <span style={{ fontSize: '0.52rem', color: 'var(--cream)', fontWeight: 'bold', letterSpacing: '0.05em' }}>{posterPriceSub}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. Center-aligned Tagline & Footnote (Always at the very bottom of the poster frame) */}
              <div style={{
                position: 'absolute',
                bottom: '26px',
                left: '20px',
                right: '20px',
                zIndex: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.82rem',
                  color: 'var(--gold)',
                  letterSpacing: '0.15em',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {posterFootnote}
                </p>
              </div>

              {/* 6. Decorative Art Deco Double Border Frame */}
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                right: '15px',
                bottom: '15px',
                border: '2px solid rgba(201, 168, 76, 0.45)',
                pointerEvents: 'none',
                zIndex: 5
              }} />
            </div>
          )}

          {/* TEMPLATE 3: PORTRAIT WEEKLY LINEUP */}
          {selectedTemplate === 'weekly-lineup' && (
            <>
              {/* Decorative Frame */}
              <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: '1px solid rgba(201, 168, 76, 0.25)', pointerEvents: 'none', zIndex: 5 }} />

              {/* Content Layer */}
              <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', height: '100%', padding: '2.2rem', justifyContent: 'space-between' }}>
                
                {/* Logo Header */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', opacity: showLogo ? 1 : 0 }}>
                  <img src={logoUrl} alt="logo" style={{ width: '40px', height: '40px', filter: 'brightness(1.2)' }} />
                  <p style={{ margin: 0, fontFamily: 'var(--font-deco)', fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.15em', fontWeight: 'bold' }}>MAGPIE MAGIQUE</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(232, 218, 187, 0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 'bold' }}>YOUR WEEKLY ENTERTAINMENT</p>
                </div>

                <div style={{ width: '100%', height: '1px', background: 'rgba(201, 168, 76, 0.2)', margin: '0.5rem 0' }} />

                {/* Day-by-Day Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1, justifyContent: 'center' }}>
                  {weeklyRows.map((row, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', justifyContent: 'space-between', borderBottom: idx < 2 ? '1px solid rgba(201, 168, 76, 0.1)' : 'none', paddingBottom: idx < 2 ? '1rem' : 0 }}>
                      
                      {/* Left: details */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem', textAlign: 'left' }}>
                        
                        {/* Red Header Tag */}
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <span style={{ background: '#5C1D1D', color: 'white', fontSize: '0.62rem', padding: '2px 6px', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                            {row.day}
                          </span>
                        </div>

                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--cream)', fontWeight: 'bold', margin: '0.2rem 0 0 0', lineHeight: '1.2' }}>
                          {row.title}
                        </h4>
                        
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                          {row.subtitle}
                        </p>

                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem', color: 'rgba(232, 218, 187, 0.7)', fontStyle: 'italic' }}>
                          ⏰ {row.time}
                        </p>

                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(232, 218, 187, 0.5)', fontWeight: '500' }}>
                          🎟️ {row.extra}
                        </p>
                      </div>

                      {/* Right: row photo */}
                      <img 
                        src={row.photoUrl} 
                        alt="row-img" 
                        style={{ width: '90px', height: '110px', objectFit: 'cover', border: '1px solid rgba(201, 168, 76, 0.2)', flexShrink: 0 }} 
                      />

                    </div>
                  ))}
                </div>

                <div style={{ width: '100%', height: '1px', background: 'rgba(201, 168, 76, 0.2)', margin: '0.5rem 0' }} />

                {/* Footer reservations label */}
                <p style={{ margin: 0, fontFamily: 'var(--font-deco)', color: 'var(--gold)', fontSize: '0.72rem', letterSpacing: '0.15em', fontWeight: 'bold', textAlign: 'center' }}>
                  {posterLang === 'fr' ? '✦ RÉSERVATIONS RECOMMANDÉES ✦' : '✦ RESERVATIONS RECOMMENDED ✦'}
                </p>

              </div>
            </>
          )}

        </div>
      </div>

      {/* ── PHOTO BANK SELECTOR MODAL DIALOG ── */}
      {showPhotoSelector && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: 'rgba(15,12,10,0.98)', border: '1px solid var(--gold)', padding: '2.5rem', width: '100%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '0.8rem' }}>
              <h3 style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', fontSize: '1.2rem', margin: 0 }}>SELECT PICTURE FROM LIBRARY</h3>
              <button onClick={() => setShowPhotoSelector(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
              {photos.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleSelectPhoto(p.url)}
                  style={{ 
                    cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', height: '130px', position: 'relative',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <img src={p.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.3rem', fontSize: '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                </div>
              ))}
              {photos.length === 0 && (
                <p style={{ gridColumn: '1 / -1', color: 'gray', textAlign: 'center', padding: '3rem 0' }}>No photos available in Media Library.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
