'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (!res) {
        setError('Une erreur est survenue lors de la connexion.');
      } else if (res.error) {
        setError('Identifiants invalides. Veuillez réessayer.');
      } else {
        router.push('/portal');
      }
    } catch (err) {
      console.error("Login client error:", err);
      setError('Erreur technique. Veuillez contacter l\'administrateur.');
    }
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
        <div className="login-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <img src="/assets/logo.svg" alt="Magpie Magique" style={{ height: '80px', marginBottom: '2rem' }} />
          <h2 style={{ fontSize: '1.8rem', color: 'var(--gold)', letterSpacing: '0.2em' }}>
            <span className="fr">Connexion <em>Employés</em></span>
            <span className="en">Staff <em>Login</em></span>
          </h2>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', color: 'rgba(232, 218, 187, 0.6)', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span className="fr">Nom d'utilisateur ou Email</span>
              <span className="en">Username or Email</span>
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="boss@magpiemagique.com"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {error && (
            <p style={{ color: 'var(--red-bright)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            <span className="fr">Se connecter</span>
            <span className="en">Log In</span>
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'rgba(232, 218, 187, 0.4)' }}>
           <span className="fr">Pas encore de compte ?</span>
           <span className="en">Need an account?</span>
           {' '}
           <a href="/register" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
             <span className="fr">Demander l'accès</span>
             <span className="en">Request access</span>
           </a>
        </div>
      </div>
    </main>
  );
}
