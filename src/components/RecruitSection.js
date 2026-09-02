import React, { useState } from 'react';
import { submitApplication } from '../app/portal/actions-applications';

export default function RecruitSection() {
  const [formData, setFormData] = useState({ name: '', email: '', position: '', cv: null });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('position', formData.position);
      if (formData.cv) {
        data.append('cv', formData.cv);
      }

      const res = await submitApplication(data);
      if (res.success) {
        setStatus('SENT');
      } else {
        setErrorMessage(res.error || 'Erreur lors de la soumission.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Erreur lors de la soumission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="recruit" className="recruit-section" style={{ background: 'var(--black-card)', borderTop: '1px solid rgba(201, 168, 76, 0.1)', padding: '3rem 1.5rem 2.5rem' }}>
      <div className="recruit-compact-container">
        <div className="recruit-compact-header">
          <p className="recruit-badge">
            <span className="fr">Recrutement</span>
            <span className="en">Join our Team</span>
          </p>
          <h3 className="recruit-title">
            <span className="fr">Laissez votre <em>CV</em></span>
            <span className="en">Leave your <em>CV</em></span>
          </h3>
          <p className="recruit-sub">
            <span className="fr">Nous sommes toujours à la recherche de passionnés de la mixologie et du service. Envoyez-nous votre profil pour enrichir l'expérience Magpie Magique.</span>
            <span className="en">We are always looking for people passionate about mixology and service. Send us your profile to enhance the Magpie Magique experience.</span>
          </p>
        </div>

        <div className="recruit-card">
          {status === 'SENT' ? (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <h4 style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', marginBottom: '0.5rem', fontSize: '1.3rem' }}>MERCI ! THANK YOU !</h4>
              <p style={{ fontSize: '0.95rem', color: '#ffffff' }}>Votre candidature a été envoyée avec succès.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {errorMessage && (
                <p style={{ color: '#ff6b6b', fontSize: '0.9rem', margin: 0, fontWeight: 'bold' }}>{errorMessage}</p>
              )}
              
              {/* Row 1: Name, Email, Position */}
              <div className="recruit-row-inputs">
                <input 
                  type="text" placeholder="Nom Complet / Full Name" required 
                  className="compact-input" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  type="email" placeholder="Email" required 
                  className="compact-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <select 
                  className="compact-input compact-select"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                >
                  <option value="">Poste / Position</option>
                  <option value="bartender">Bartender</option>
                  <option value="serveur">Serveur / Server</option>
                  <option value="host">Hôte / Host</option>
                  <option value="cuisine">Cuisine / Kitchen</option>
                </select>
              </div>

              {/* Row 2: File upload + Submit */}
              <div className="recruit-row-actions">
                <div className="compact-file-box">
                  <label htmlFor="cv-upload" className="compact-file-label">
                    <span>{formData.cv ? `✓ ${formData.cv.name}` : '📄 CV (PDF, DOCX)'}</span>
                  </label>
                  <input 
                    id="cv-upload" type="file" accept=".pdf,.doc,.docx" hidden 
                    onChange={(e) => setFormData({...formData, cv: e.target.files[0]})}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="compact-submit-btn"
                >
                  {isSubmitting ? (
                    <span>...</span>
                  ) : (
                    <>
                      <span className="fr">Envoyer</span>
                      <span className="en">Send</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .recruit-compact-container {
          max-width: 760px;
          margin: 0 auto;
        }
        .recruit-compact-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .recruit-badge {
          font-family: var(--font-deco);
          font-size: 0.85rem;
          letter-spacing: 0.2em;
          color: var(--gold);
          text-transform: uppercase;
          margin-bottom: 0.4rem;
          font-weight: 700;
        }
        .recruit-title {
          font-family: var(--font-deco);
          font-size: 1.8rem;
          color: var(--off-white);
          margin-bottom: 0.6rem;
          letter-spacing: 0.05em;
        }
        .recruit-title em {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--gold);
          font-weight: 300;
        }
        .recruit-sub {
          font-family: var(--font-sans), sans-serif;
          font-size: 1.02rem;
          line-height: 1.75;
          color: rgba(232, 218, 187, 0.85);
          margin: 0 auto;
          max-width: 680px;
        }
        .recruit-card {
          padding: 1.5rem 1.6rem;
          border: 1px solid rgba(201, 168, 76, 0.25);
          background: rgba(0, 0, 0, 0.4);
          border-radius: 4px;
        }
        .recruit-row-inputs {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 1fr;
          gap: 0.8rem;
        }
        .compact-input {
          width: 100%;
          height: 2.6rem;
          padding: 0 0.9rem;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(201, 168, 76, 0.3);
          color: #ffffff;
          font-family: var(--font-sans), sans-serif;
          font-size: 0.92rem;
          border-radius: 3px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }
        .compact-input:focus {
          border-color: var(--gold);
        }
        .compact-input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }
        .compact-select {
          cursor: pointer;
        }
        .recruit-row-actions {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.8rem;
          align-items: center;
        }
        .compact-file-box {
          border: 1px dashed rgba(201, 168, 76, 0.4);
          height: 2.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 1rem;
          background: rgba(201, 168, 76, 0.04);
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .compact-file-box:hover {
          background: rgba(201, 168, 76, 0.08);
          border-color: var(--gold);
        }
        .compact-file-label {
          cursor: pointer;
          color: var(--gold-light);
          font-size: 0.88rem;
          font-family: var(--font-sans), sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .compact-submit-btn {
          height: 2.6rem;
          padding: 0 1.8rem;
          background: var(--gold-gradient);
          color: #000000 !important;
          border: 1px solid var(--black);
          font-family: var(--font-deco);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border-radius: 3px;
          cursor: pointer;
          transition: filter 0.2s, transform 0.2s;
          white-space: nowrap;
        }
        .compact-submit-btn:hover {
          filter: brightness(1.1);
        }
        .compact-submit-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        @media (max-width: 680px) {
          .recruit-row-inputs {
            grid-template-columns: 1fr;
            gap: 0.6rem;
          }
          .recruit-row-actions {
            grid-template-columns: 1fr;
            gap: 0.6rem;
          }
          .compact-submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
