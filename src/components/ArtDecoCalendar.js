'use client';

import React, { useState } from 'react';

const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function ArtDecoCalendar({ events = [], type = 'public', filter = null }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lang, setLang] = useState('fr');
  const [logoUrl, setLogoUrl] = useState('/assets/logo.svg');

  React.useEffect(() => {
    // Read initial language selection
    const saved = localStorage.getItem('magpie-lang') || 'fr';
    setLang(saved);

    // Watch for class changes on document.body (lang-fr / lang-en)
    const observer = new MutationObserver(() => {
      const current = document.body.className.includes('lang-en') ? 'en' : 'fr';
      setLang(current);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Fetch site logo
    async function fetchLogo() {
      try {
        const { getSiteLogoUrl } = await import('../app/portal/actions-cms');
        const res = await getSiteLogoUrl();
        if (res.success && res.url) {
          setLogoUrl(res.url);
        }
      } catch (err) {
        console.error('Failed to load logo in calendar:', err);
      }
    }
    fetchLogo();

    return () => observer.disconnect();
  }, []);

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday-start
  };

  const month = currentMonth.getMonth();
  const year = currentMonth.getFullYear();
  const numDays = daysInMonth(month, year);
  const startDay = firstDayOfMonth(month, year);

  const monthNames = [
    "JANVIER / JANUARY", "FÉVRIER / FEBRUARY", "MARS / MARCH", "AVRIL / APRIL",
    "MAI / MAY", "JUIN / JUNE", "JUILLET / JULY", "AOÛT / AUGUST",
    "SEPTEMBRE / SEPTEMBER", "OCTOBRE / OCTOBER", "NOVEMBRE / NOVEMBER", "DÉCEMBRE / DECEMBER"
  ];

  const filteredEvents = filter ? events.filter(e => e.type === filter) : events;

  return (
    <div className="calendar-root" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', background: 'var(--black-card)', border: '1px solid rgba(201, 168, 76, 0.2)', padding: '2rem' }}>
      <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(201, 168, 76, 0.1)' }}>
        <button 
          onClick={() => setCurrentMonth(new Date(year, month - 1))}
          style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '1.2rem' }}>
          «
        </button>
        <h4 style={{ fontFamily: 'var(--font-deco)', color: 'var(--gold)', letterSpacing: '0.2rem' }}>
          {monthNames[month].split(' / ')[lang === 'en' ? 1 : 0]} {year}
        </h4>
        <button 
          onClick={() => setCurrentMonth(new Date(year, month + 1))}
          style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '1.2rem' }}>
          »
        </button>
      </div>

      <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'rgba(201, 168, 76, 0.1)' }}>
        {daysOfWeek.map(day => (
          <div key={day} style={{ padding: '1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--gold)', fontWeight: '700', letterSpacing: '0.1rem' }}>
            {day}
          </div>
        ))}
        
        {[...Array(startDay)].map((_, i) => (
          <div key={`empty-${i}`} style={{ background: 'rgba(0,0,0,0.1)', height: '100px' }}></div>
        ))}

        {[...Array(numDays)].map((_, i) => {
          const day = i + 1;
          const dayEvents = filteredEvents.filter(e => e.day === day && e.month === month);
          
          return (
            <div key={day} style={{ background: 'var(--black-card)', height: '120px', padding: '0.5rem', position: 'relative', border: '1px solid rgba(201, 168, 76, 0.05)', overflowY: 'auto' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(232, 218, 187, 0.4)', fontFamily: 'var(--font-deco)', fontWeight: 'bold' }}>{day}</span>
              <div className="day-events" style={{ marginTop: '0.5rem' }}>
                {dayEvents.map((e, idx) => (
                  <div 
                    key={idx} 
                    onClick={(ev) => { ev.stopPropagation(); setSelectedEvent(e); }}
                    style={{ 
                      fontSize: '0.65rem', 
                      padding: '3px 6px', 
                      background: e.color || 'var(--gold)', 
                      color: 'var(--black)', 
                      marginBottom: '3px', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      transition: 'transform 0.2s',
                    }}
                    title={e.title}
                  >
                    {e.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── EVENT DETAILS MODAL OVERLAY ── */}
      {selectedEvent && (
        <div 
          onClick={() => setSelectedEvent(null)}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.92)', 
            backdropFilter: 'blur(8px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 9999,
            padding: '2rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: 'rgba(18, 14, 11, 0.98)', 
              border: '2px solid var(--gold)', 
              boxShadow: '0 10px 50px rgba(0, 0, 0, 0.95)',
              width: '100%', 
              maxWidth: '850px', 
              maxHeight: '90vh', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              borderRadius: '2px'
            }}
          >
            {/* Poster / Image Section */}
            {selectedEvent.photoUrl ? (
              <div style={{ flex: '1 1 400px', background: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRight: '1px solid rgba(201, 168, 76, 0.15)', minHeight: '400px' }}>
                <img 
                  src={selectedEvent.photoUrl} 
                  alt={selectedEvent.title} 
                  style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }} 
                />
              </div>
            ) : (
              <div style={{ flex: '1 1 300px', background: '#090807', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRight: '1px solid rgba(201, 168, 76, 0.15)', minHeight: '350px', padding: '2.5rem' }}>
                <img 
                  src={logoUrl} 
                  alt="Magpie Magique" 
                  style={{ width: '80px', height: '80px', filter: 'brightness(1.1)', marginBottom: '1.5rem', opacity: 0.65 }} 
                />
                <p style={{ fontFamily: 'var(--font-deco)', color: 'rgba(232, 218, 187, 0.4)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>MAGPIE MAGIQUE</p>
              </div>
            )}

            {/* Details Section */}
            <div style={{ flex: '1 1 350px', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '450px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <span style={{ 
                    fontFamily: 'var(--font-deco)', 
                    fontSize: '0.85rem', 
                    color: 'var(--gold)', 
                    border: '1px solid var(--gold)', 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '2px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    {selectedEvent.type.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    style={{ background: 'none', border: 'none', color: 'rgba(232, 218, 187, 0.6)', cursor: 'pointer', fontSize: '2rem', padding: 0, lineHeight: 0.5 }}
                  >
                    ×
                  </button>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--cream)', margin: '0 0 2rem 0', fontWeight: 'bold', lineHeight: '1.2' }}>
                  {lang === 'en' 
                    ? (selectedEvent.title_en || selectedEvent.title) 
                    : (selectedEvent.title_fr || selectedEvent.title)}
                </h3>

                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(201, 168, 76, 0.15)', paddingTop: '1.5rem' }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-deco)', color: 'var(--gold)', fontSize: '1.1rem', letterSpacing: '0.08em', fontWeight: 'bold' }}>
                    📅 {monthNames[selectedEvent.month].split(' / ')[lang === 'en' ? 1 : 0]} {selectedEvent.day}, {year}
                  </p>
                </div>

                <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {lang === 'en' ? (
                    <p style={{ margin: 0, fontSize: '1.15rem', color: 'var(--cream)', opacity: 0.9, lineHeight: '1.6' }}>
                      {selectedEvent.desc_en || selectedEvent.desc_fr || 'Join us for this exceptional evening at Magpie Magique.'}
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '1.15rem', color: 'var(--cream)', opacity: 0.9, lineHeight: '1.6' }}>
                      {selectedEvent.desc_fr || selectedEvent.desc_en || 'Rejoignez-nous pour cette soirée exceptionnelle au Magpie Magique.'}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(201, 168, 76, 0.15)', paddingTop: '1.8rem', marginTop: '2rem' }}>
                {selectedEvent.ticketUrl && (
                  <a 
                    href={selectedEvent.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'block',
                      width: '100%', 
                      padding: '1.2rem', 
                      background: 'transparent', 
                      color: 'var(--gold)', 
                      border: '1px solid var(--gold)', 
                      fontWeight: 'bold', 
                      fontSize: '1rem',
                      cursor: 'pointer',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      marginBottom: '1rem'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201, 168, 76, 0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {lang === 'en' ? 'Get Tickets 🎫' : 'Billetterie 🎫'}
                  </a>
                )}

                <p style={{ fontFamily: 'var(--font-deco)', color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '0.05em', textAlign: 'center', margin: '0 0 1.2rem 0' }}>
                  {lang === 'en' ? '✦ RESERVATIONS RECOMMENDED ✦' : '✦ RÉSERVATIONS RECOMMANDÉES ✦'}
                </p>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  style={{ 
                    width: '100%', 
                    padding: '1.2rem', 
                    background: 'var(--gold)', 
                    color: 'black', 
                    border: 'none', 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    cursor: 'pointer',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
                >
                  {lang === 'en' ? 'CLOSE' : 'FERMER'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
