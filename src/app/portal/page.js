'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
      <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', letterSpacing: '0.2em' }}>CHARGEMENT...</p>
    </div>
  );

  if (!session) {
    router.push('/login');
    return null;
  }

  const isAdmin = session?.user?.role?.toLowerCase() === 'admin';
  const isManager = session.user.role === 'manager';

  const cardStyle = (id, borderOverride) => {
    const isHovered = hoveredCard === id;
    return {
      padding: '3rem',
      background: isHovered ? 'rgba(30, 24, 18, 0.65)' : 'rgba(15, 12, 9, 0.45)',
      border: isHovered ? '1px solid var(--gold)' : borderOverride || '1px solid rgba(201, 168, 76, 0.15)',
      borderRadius: '4px',
      position: 'relative',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)',
      boxShadow: isHovered ? '0 15px 35px rgba(201, 168, 76, 0.12)' : '0 4px 20px rgba(0, 0, 0, 0.3)',
      transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      cursor: 'pointer'
    };
  };

  return (
    <main className="portal-page" style={{ 
      paddingTop: '12rem', 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at 50% 50%, #17120e 0%, var(--black) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ornamental Art Deco background lines or blur */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(201, 168, 76, 0.03) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="portal-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
        
        {/* HEADER */}
        <div className="portal-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '5rem', 
          borderBottom: '1px solid rgba(201, 168, 76, 0.15)', 
          paddingBottom: '2.5rem' 
        }}>
          <div>
            <p className="section-label" style={{ letterSpacing: '0.25em', color: 'rgba(232, 218, 187, 0.6)' }}>
              <span className="fr">Bienvenue, {session.user.name}</span>
              <span className="en">Welcome, {session.user.name}</span>
            </p>
            <h2 style={{ marginBottom: 0, fontSize: '2.4rem', letterSpacing: '0.1em' }}>
              <span className="fr">Tableau de <em>Bord</em></span>
              <span className="en">Staff <em>Portal</em></span>
            </h2>
          </div>
          <button 
            onClick={() => signOut()} 
            style={{
              padding: '0.8rem 2.2rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-deco)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: 'transparent',
              color: 'var(--gold)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              cursor: 'pointer',
              borderRadius: '2px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = '1px solid var(--gold)';
              e.currentTarget.style.background = 'rgba(201, 168, 76, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = '1px solid rgba(201, 168, 76, 0.4)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span className="fr">Déconnexion</span>
            <span className="en">Sign Out</span>
          </button>
        </div>

        {/* DASHBOARD GRID */}
        <div className="portal-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '3rem', 
          marginBottom: '6rem' 
        }}>
          
          {/* MEDIA LIBRARY */}
          {isAdmin && (
            <div 
              style={cardStyle('photos', '1px solid var(--gold)')}
              onMouseEnter={() => setHoveredCard('photos')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => router.push('/portal/photos')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(201, 168, 76, 0.1)', padding: '0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ width: '1.8rem', height: '1.8rem' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-deco)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  <span className="fr">Photothèque</span>
                  <span className="en">Media Library</span>
                </h3>
              </div>
              <p className="event-desc" style={{ marginBottom: '2.5rem', minHeight: '4.5rem', fontSize: '0.9rem', color: 'var(--cream)', opacity: 0.8, lineHeight: '1.6' }}>
                <span className="fr">Gérez vos photos, renommez-les et téléchargez de nouveaux fichiers. Remplacez n'importe quelle image du site.</span>
                <span className="en">Manage your photos, rename them, and upload new ones. Replace any image on the website.</span>
              </p>
              <Link href="/portal/photos" className="btn-primary" style={{ width: '100%', padding: '1.1rem', display: 'block', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                <span className="fr">Gérer les Photos</span>
                <span className="en">Manage Photos</span>
              </Link>
            </div>
          )}

          {/* MENUS & CONTENT */}
          {isAdmin && (
            <div 
              style={cardStyle('cms')}
              onMouseEnter={() => setHoveredCard('cms')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => router.push('/portal/cms')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(201, 168, 76, 0.1)', padding: '0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ width: '1.8rem', height: '1.8rem' }}>
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-deco)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  <span className="fr">Menus & Pages</span>
                  <span className="en">Menus & Pages</span>
                </h3>
              </div>
              <p className="event-desc" style={{ marginBottom: '2.5rem', minHeight: '4.5rem', fontSize: '0.9rem', color: 'var(--cream)', opacity: 0.8, lineHeight: '1.6' }}>
                <span className="fr">Modifiez les catégories de menu, les plats, les boissons et planifiez ou filtrez les événements.</span>
                <span className="en">Update your menu categories, dishes, drinks, and schedule or filter calendar events.</span>
              </p>
              <Link href="/portal/cms" className="btn-secondary" style={{ width: '100%', padding: '1.1rem', display: 'block', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', border: '1px solid var(--gold)', color: 'var(--gold)' }} onClick={(e) => e.stopPropagation()}>
                <span className="fr">Éditer le Site</span>
                <span className="en">Edit Website</span>
              </Link>
            </div>
          )}

          {/* SCHEDULING */}
          <div 
            style={cardStyle('schedule')}
            onMouseEnter={() => setHoveredCard('schedule')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => router.push('/portal/schedule')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(201, 168, 76, 0.1)', padding: '0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ width: '1.8rem', height: '1.8rem' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-deco)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                <span className="fr">Planning</span>
                <span className="en">Scheduling</span>
              </h3>
            </div>
            <p className="event-desc" style={{ marginBottom: '2.5rem', minHeight: '4.5rem', fontSize: '0.9rem', color: 'var(--cream)', opacity: 0.8, lineHeight: '1.6' }}>
              <span className="fr">Consultez vos quarts de travail et organisez les horaires de l'équipe du restaurant.</span>
              <span className="en">Your work shifts and comprehensive team schedule management.</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
              <Link href="/portal/schedule" className="btn-secondary" style={{ width: '100%', padding: '0.9rem', display: 'block', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
                <span className="fr">Mon Calendrier</span>
                <span className="en">My Calendar</span>
              </Link>
              {(isAdmin || isManager) && (
                <Link href="/portal/schedule/manage" className="btn-primary" style={{ width: '100%', padding: '0.9rem', display: 'block', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
                  <span className="fr">Gérer les Shifts</span>
                  <span className="en">Manage All Shifts</span>
                </Link>
              )}
            </div>
          </div>

          {/* STAFF & ACCOUNTS */}
          {(isAdmin || isManager) && (
            <div 
              style={cardStyle('accounts')}
              onMouseEnter={() => setHoveredCard('accounts')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => router.push('/portal/accounts')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(201, 168, 76, 0.1)', padding: '0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ width: '1.8rem', height: '1.8rem' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-deco)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  <span className="fr">Équipe</span>
                  <span className="en">Staff</span>
                </h3>
              </div>
              <p className="event-desc" style={{ marginBottom: '2.5rem', minHeight: '4.5rem', fontSize: '0.9rem', color: 'var(--cream)', opacity: 0.8, lineHeight: '1.6' }}>
                <span className="fr">Gérez les comptes utilisateurs, affectez les rôles et approuvez les nouvelles inscriptions.</span>
                <span className="en">Manage user accounts, roles, and review registrations.</span>
              </p>
              <Link href="/portal/accounts" className="btn-secondary" style={{ width: '100%', padding: '1.1rem', display: 'block', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', border: '1px solid var(--gold)', color: 'var(--gold)' }} onClick={(e) => e.stopPropagation()}>
                <span className="fr">Gérer les Comptes</span>
                <span className="en">Manage Accounts</span>
              </Link>
            </div>
          )}

          {/* CANDIDATURES / APPLICATIONS */}
          {(isAdmin || isManager) && (
            <div 
              style={cardStyle('applications')}
              onMouseEnter={() => setHoveredCard('applications')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => router.push('/portal/applications')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(201, 168, 76, 0.1)', padding: '0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ width: '1.8rem', height: '1.8rem' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-deco)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  <span className="fr">Candidatures</span>
                  <span className="en">Applications</span>
                </h3>
              </div>
              <p className="event-desc" style={{ marginBottom: '2.5rem', minHeight: '4.5rem', fontSize: '0.9rem', color: 'var(--cream)', opacity: 0.8, lineHeight: '1.6' }}>
                <span className="fr">Consultez les candidatures reçues, visualisez et téléchargez les CVs envoyés par les candidats.</span>
                <span className="en">Review received job applications, view candidate profiles, and download their CVs.</span>
              </p>
              <Link href="/portal/applications" className="btn-secondary" style={{ width: '100%', padding: '1.1rem', display: 'block', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', border: '1px solid var(--gold)', color: 'var(--gold)' }} onClick={(e) => e.stopPropagation()}>
                <span className="fr">Voir les CVs</span>
                <span className="en">View CVs</span>
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
