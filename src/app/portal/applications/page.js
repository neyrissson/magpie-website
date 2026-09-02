'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApplications, deleteApplication } from '../actions-applications';

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const role = session?.user?.role?.toLowerCase();
      if (role !== 'admin' && role !== 'manager') {
        router.push('/portal');
      } else {
        loadApplications();
      }
    }
  }, [status, session, router]);

  const loadApplications = async () => {
    setLoading(true);
    const data = await getApplications();
    setApplications(data);
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer la candidature de "${name}" ?`)) return;
    const res = await deleteApplication(id);
    if (res.success) {
      setApplications(prev => prev.filter(app => app.id !== id));
    } else {
      alert('Erreur lors de la suppression: ' + res.error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
        <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', letterSpacing: '0.2em' }}>CHARGEMENT DES CANDIDATURES...</p>
      </div>
    );
  }

  return (
    <main style={{ 
      paddingTop: '10rem', 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at 50% 50%, #17120e 0%, var(--black) 100%)',
      paddingBottom: '8rem',
      fontFamily: 'var(--font-sans), sans-serif'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
        
        {/* TOP NAVIGATION / BREADCRUMB */}
        <div style={{ marginBottom: '2.5rem' }}>
          <Link href="/portal" style={{ 
            color: 'var(--gold)', 
            textDecoration: 'none', 
            fontSize: '0.85rem', 
            letterSpacing: '0.1em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: 0.8
          }}>
            ← Retour au Tableau de Bord
          </Link>
        </div>

        {/* HEADER */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          borderBottom: '1px solid rgba(201, 168, 76, 0.2)', 
          paddingBottom: '2rem',
          marginBottom: '3.5rem' 
        }}>
          <div>
            <p style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Portail Recrutement
            </p>
            <h1 style={{ color: '#ffffff', fontSize: '2.4rem', margin: 0, fontFamily: 'var(--font-deco)', letterSpacing: '0.08em' }}>
              CANDIDATURES <span style={{ color: 'var(--gold)' }}>& CVs</span>
            </h1>
          </div>
          <span style={{ 
            background: 'rgba(201, 168, 76, 0.12)', 
            color: 'var(--gold)', 
            padding: '0.5rem 1.2rem', 
            borderRadius: '20px', 
            fontSize: '0.85rem',
            fontWeight: 'bold',
            letterSpacing: '0.05em'
          }}>
            {applications.length} candidature{applications.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* LIST OF CANDIDATES */}
        {applications.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '6rem 2rem', 
            background: 'rgba(15, 12, 9, 0.45)', 
            border: '1px dashed rgba(201, 168, 76, 0.2)', 
            borderRadius: '4px' 
          }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--cream)', opacity: 0.8, marginBottom: '0.5rem' }}>
              Aucune candidature reçue pour le moment.
            </p>
            <p style={{ color: 'gray', fontSize: '0.85rem' }}>
              Dès qu'un candidat soumet son CV via la page d'accueil, il apparaîtra directement ici.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {applications.map(app => {
              const formattedDate = new Date(app.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={app.id} 
                  style={{
                    background: 'rgba(20, 16, 12, 0.6)',
                    border: '1px solid rgba(201, 168, 76, 0.18)',
                    borderRadius: '4px',
                    padding: '1.8rem 2.2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* CANDIDATE INFO */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem' }}>
                      <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.3rem', fontWeight: 'bold', letterSpacing: '0.04em' }}>
                        {app.name}
                      </h3>
                      <span style={{
                        background: 'rgba(201, 168, 76, 0.15)',
                        color: 'var(--gold)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase'
                      }}>
                        {app.position}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#bbb' }}>
                      <div>
                        ✉️ <a href={`mailto:${app.email}`} style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: '500' }}>{app.email}</a>
                      </div>
                      <div style={{ color: 'gray' }}>
                        📅 Reçu le {formattedDate}
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {app.cv_url && app.cv_url !== 'No file provided' ? (
                      <a 
                        href={app.cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{
                          background: 'var(--gold)',
                          color: '#000000',
                          padding: '0.75rem 1.4rem',
                          borderRadius: '2px',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          letterSpacing: '0.08em',
                          textDecoration: 'none',
                          textTransform: 'uppercase',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'opacity 0.2s'
                        }}
                      >
                        📄 Voir le CV
                      </a>
                    ) : (
                      <span style={{ color: 'gray', fontSize: '0.8rem', fontStyle: 'italic' }}>Aucun fichier</span>
                    )}

                    <button 
                      onClick={() => handleDelete(app.id, app.name)}
                      style={{
                        background: 'rgba(255, 60, 60, 0.1)',
                        color: '#ff6b6b',
                        border: '1px solid rgba(255, 60, 60, 0.25)',
                        padding: '0.75rem 1.1rem',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em'
                      }}
                      title="Supprimer la candidature"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
