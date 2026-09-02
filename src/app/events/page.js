'use client';

import React, { useState, useEffect } from 'react';
import ArtDecoCalendar from '../../components/ArtDecoCalendar';
import { getPublicEvents } from '../portal/actions-photos';

const EVENT_TYPES = [
  { 
    id: 'jazz', 
    title_fr: 'Jazz Live', 
    title_en: 'Live Jazz', 
    image: '/assets/Raf_Jazz.JPG',
    tag: 'Café-Concert',
    date_fr: 'Tous les Vendredis & Samedis',
    date_en: 'Every Friday & Saturday',
    desc_fr: 'Laissez-vous emporter par les notes vibrantes d\'un saxophone dans notre décor feutré.',
    desc_en: 'Let yourself be carried away by the vibrant notes of a saxophone in our cozy setting.'
  },
  { 
    id: 'comedy', 
    title_fr: 'Humour & Cocktails', 
    title_en: 'Comedy & Cocktails', 
    image: '/assets/microphone.png',
    tag: 'Comedy Night',
    date_fr: 'Tous les Mercredis',
    date_en: 'Every Wednesday',
    desc_fr: 'Venez découvrir les nouveaux talents de l\'humour dans une ambiance décontractée et tamisée.',
    desc_en: 'Discover emerging comedy talent in a relaxed, dimly lit atmosphere.'
  },
  { 
    id: 'private', 
    title_fr: 'Événements Privés & Photoshoots', 
    title_en: 'Private Events & Photoshoots', 
    image: '/assets/background_6.jpeg',
    tag: 'Private Service',
    date_fr: 'Sur réservation',
    date_en: 'By Reservation',
    desc_fr: 'Plongez dans un décor exclusif pour vos soirées privées, lancements ou cocktails corporatifs.',
    desc_en: 'Immerse your guests in an exclusive setting for private parties, launches, or corporate cocktails.'
  },
];



export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState(null); // 'jazz' | 'comedy' | 'private' | null
  const [dbEvents, setDbEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublicEvents();
        setDbEvents(data || []);
      } catch (err) {
        console.error('Error loading calendar events:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const calendarEvents = dbEvents.map(e => {
    const d = new Date(e.date);
    return {
      id: e.id,
      day: d.getDate(),
      month: d.getMonth(),
      title: e.title_en || e.title_fr,
      title_en: e.title_en,
      title_fr: e.title_fr,
      desc_en: e.desc_en,
      desc_fr: e.desc_fr,
      type: e.type ? e.type.toLowerCase() : 'jazz',
      color: e.color,
      photoUrl: e.photo?.url || null,
      ticketUrl: e.ticketUrl || null
    };
  });

  const displayCalendarEvents = calendarEvents;

  // Filter events passed to the calendar
  const filteredCalendarEvents = activeFilter
    ? displayCalendarEvents.filter(e => e.type === activeFilter)
    : displayCalendarEvents;

  return (
    <main className="events-page" style={{ paddingTop: '12rem' }}>
      <section className="events-feature">
        <div className="events-container">
          <p className="section-label">
            <span className="fr">À venir</span>
            <span className="en">Upcoming</span>
          </p>
          <h2>
            <span className="fr">Événements <em>& Live</em></span>
            <span className="en">Events <em>& Live</em></span>
          </h2>
          
          <div className="events-grid">
            {EVENT_TYPES.map((type) => (
              <div 
                key={type.id} 
                className={`event-card featured-event cursor-pointer ${activeFilter === type.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(activeFilter === type.id ? null : type.id)}
                style={{
                  border: activeFilter === type.id ? '1px solid var(--gold)' : '1px solid rgba(201, 168, 76, 0.15)',
                  boxShadow: activeFilter === type.id ? '0 0 15px rgba(201, 168, 76, 0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="event-image-container">
                  <img src={type.image} alt={type.title_en} className="event-image" />
                  <div className="event-image-overlay"></div>
                </div>
                <div className="event-content">
                  <div className="event-date">
                    <span className="fr">{type.date_fr}</span>
                    <span className="en">{type.date_en}</span>
                  </div>
                  <div className="event-title">
                    <span className="fr" dangerouslySetInnerHTML={{ __html: type.title_fr }}></span>
                    <span className="en" dangerouslySetInnerHTML={{ __html: type.title_en }}></span>
                  </div>
                  <div className="event-desc">
                    <span className="fr">{type.desc_fr}</span>
                    <span className="en">{type.desc_en}</span>
                  </div>
                  <div className="event-tag">{type.tag}</div>
                </div>
              </div>
            ))}
          </div>

          {/* DYNAMIC CALENDAR */}
          <div className="calendar-section" style={{ marginTop: '8rem' }}>
            <div className="hero-divider"></div>
            <h3 className="text-center" style={{ marginBottom: '3rem', color: 'var(--gold)', fontFamily: 'var(--font-deco)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
              <span className="fr">
                {activeFilter 
                  ? `Calendrier — ${activeFilter === 'jazz' ? 'Jazz' : activeFilter === 'comedy' ? 'Humour' : 'Privé'}` 
                  : 'Calendrier Mensuel'}
              </span>
              <span className="en">
                {activeFilter 
                  ? `Calendar — ${activeFilter === 'jazz' ? 'Jazz' : activeFilter === 'comedy' ? 'Comedy' : 'Private'} Events` 
                  : 'Monthly Calendar'}
              </span>
            </h3>

            {activeFilter && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                <button 
                  onClick={() => setActiveFilter(null)}
                  style={{
                    padding: '0.6rem 1.8rem',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-deco)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    background: 'transparent',
                    color: 'var(--gold)',
                    border: '1px solid var(--gold)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--black)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)'; }}
                >
                  <span className="fr">× Réinitialiser le filtre (Voir tous)</span>
                  <span className="en">× Clear Filter (Show All)</span>
                </button>
              </div>
            )}
            
            <div className="calendar-container" style={{ marginTop: '5rem' }}>
              <ArtDecoCalendar events={filteredCalendarEvents} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
