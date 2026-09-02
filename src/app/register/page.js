'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // MOCK SUBMISSION (Will be replaced by DB logic later)
    console.log('Registration requested:', formData);
    setSubmitted(true);
  };

  return (
    <main className="login-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--black)',
      padding: '2rem'
    }}>
      <div className="login-container" style={{ 
        width: '100%', 
        maxWidth: '450px', 
        padding: '3rem', 
        background: 'var(--black-card)', 
        border: '1px solid rgba(201, 168, 76, 0.2)',
        position: 'relative'
      }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontFamily: 'var(--font-deco)' }}>
              <span className="fr">Demande <em>Envoyée</em></span>
              <span className="en">Request <em>Sent</em></span>
            </h2>
            <p style={{ color: 'var(--cream)', lineHeight: '1.6' }}>
              <span className="fr">Votre compte est en attente de validation par l'administrateur. Vous recevrez un courriel une fois activé.</span>
              <span className="en">Your account is pending validation by the administrator. You will receive an email once activated.</span>
            </p>
            <Link href="/" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
              <span className="fr">Retour à l'accueil</span>
              <span className="en">Back Home</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="login-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--gold)', letterSpacing: '0.2em' }}>
                <span className="fr">Devenir <em>Membre</em></span>
                <span className="en">Join the <em>Staff</em></span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', color: 'rgba(232, 218, 187, 0.6)', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <span className="fr">Nom Complet</span>
                  <span className="en">Full Name</span>
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    background: 'rgba(0,0,0,0.3)', 
                    border: '1px solid rgba(201, 168, 76, 0.15)',
                    color: 'var(--cream)',
                    fontFamily: 'var(--font-serif)'
                  }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', color: 'rgba(232, 218, 187, 0.6)', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <span className="fr">Courriel</span>
                  <span className="en">Email</span>
                </label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    background: 'rgba(0,0,0,0.3)', 
                    border: '1px solid rgba(201, 168, 76, 0.15)',
                    color: 'var(--cream)',
                    fontFamily: 'var(--font-serif)'
                  }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', color: 'rgba(232, 218, 187, 0.6)', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <span className="fr">Mot de passe</span>
                  <span className="en">Password</span>
                </label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    background: 'rgba(0,0,0,0.3)', 
                    border: '1px solid rgba(201, 168, 76, 0.15)',
                    color: 'var(--cream)',
                    fontFamily: 'var(--font-serif)'
                  }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                <span className="fr">Envoyer la demande</span>
                <span className="en">Send Request</span>
              </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'rgba(232, 218, 187, 0.4)' }}>
               <span className="fr">Déjà un compte ?</span>
               <span className="en">Already have an account?</span>
               {' '}
               <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
                 <span className="fr">Se connecter</span>
                 <span className="en">Log In</span>
               </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
