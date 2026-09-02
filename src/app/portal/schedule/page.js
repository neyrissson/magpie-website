'use client';

import React from 'react';
import Link from 'next/link';
import ArtDecoCalendar from '../../../components/ArtDecoCalendar';

const mockShifts = [
  { day: 1, month: 2, title: 'Mat (Bar)', type: 'shift' },
  { day: 2, month: 2, title: 'Mat (Bar)', type: 'shift' },
  { day: 5, month: 2, title: 'Shift 17-02', type: 'shift' },
  { day: 6, month: 2, title: 'Shift 17-02', type: 'shift' },
];

export default function SchedulePage() {
  return (
    <main style={{ paddingTop: '10rem', minHeight: '100vh', background: 'var(--black)' }}>
      <div className="portal-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <Link href="/portal" style={{ color: 'var(--gold)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          ← <span className="fr">Retour au Tableau de Bord</span><span className="en">Back to Dashboard</span>
        </Link>
        <p className="section-label">
          <span className="fr">Mon Horaire</span>
          <span className="en">My Schedule</span>
        </p>
        <h2 style={{ marginBottom: '3rem' }}>
          <span className="fr">Calendrier de <em>Travail</em></span>
          <span className="en">Weekly <em>Shifts</em></span>
        </h2>

        <ArtDecoCalendar events={mockShifts} />

        <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--black-card)', border: '1px solid rgba(201, 168, 76, 0.1)' }}>
            <p style={{ fontSize: '0.9rem', color: 'rgba(232, 218, 187, 0.6)' }}>
                <span className="fr">Note: Pour toute demande de changement d'horaire, veuillez contacter le gestionnaire.</span>
                <span className="en">Note: For any schedule change requests, please contact the manager.</span>
            </p>
        </div>
      </div>
    </main>
  );
}
