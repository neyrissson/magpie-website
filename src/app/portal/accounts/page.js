'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountManagement() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState([
    { id: 'u1', name: 'Jean Dupont', email: 'jean@example.com', role: 'employee', status: 'pending' },
    { id: 'u2', name: 'Marie Leclerc', email: 'marie@example.com', role: 'employee', status: 'pending' },
  ]);

  if (!session || session.user.role !== 'admin') {
    router.push('/portal');
    return null;
  }

  const handleAction = (userId, action) => {
    // MOCK ACTION
    console.log(`User ${userId} was ${action}`);
    setPendingUsers(pendingUsers.filter(u => u.id !== userId));
  };

  return (
    <main style={{ paddingTop: '10rem', minHeight: '100vh', background: 'var(--black)' }}>
      <div className="portal-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <Link href="/portal" style={{ color: 'var(--gold)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          ← <span className="fr">Retour au Tableau de Bord</span><span className="en">Back to Dashboard</span>
        </Link>
        <p className="section-label">
          <span className="fr">Administration</span>
          <span className="en">Administration</span>
        </p>
        <h2 style={{ marginBottom: '3rem' }}>
          <span className="fr">Validation <em>Employés</em></span>
          <span className="en">Account <em>Validation</em></span>
        </h2>

        <div className="account-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pendingUsers.length === 0 ? (
            <p style={{ color: 'rgba(232, 218, 187, 0.4)', fontStyle: 'italic' }}>Aucune demande en attente. / No pending requests.</p>
          ) : (
            pendingUsers.map(user => (
              <div key={user.id} className="event-card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                <div>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '0.2rem', fontFamily: 'var(--font-deco)' }}>{user.name}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(232, 218, 187, 0.6)' }}>{user.email}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => handleAction(user.id, 'rejected')} className="btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.7rem', color: 'var(--red-bright)', borderColor: 'var(--red-bright)' }}>
                    <span className="fr">Rejeter</span>
                    <span className="en">Reject</span>
                  </button>
                  <button onClick={() => handleAction(user.id, 'validated')} className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.7rem' }}>
                    <span className="fr">Valider</span>
                    <span className="en">Approve</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
