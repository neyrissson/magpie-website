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
    <section id="recruit" className="recruit-section" style={{ background: 'var(--black-card)', borderTop: '1px solid rgba(201, 168, 76, 0.1)', padding: '5rem 2rem 3.5rem' }}>
      <div className="menu-container">
        <p className="section-label">
          <span className="fr">Recrutement</span>
          <span className="en">Join our Team</span>
        </p>
        <div className="recruit-grid">
          <div>
            <h2 className="recruit-title">
              <span className="fr">Laissez votre <em>CV</em></span>
              <span className="en">Leave your <em>CV</em></span>
            </h2>
            <p style={{ color: '#f5f0e8', lineHeight: '1.8', fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>
              <span className="fr">Nous sommes toujours à la recherche de passionnés de la mixologie et du service. Envoyez-nous votre profil pour enrichir l'expérience Magpie Magique.</span>
              <span className="en">We are always looking for people passionate about mixology and service. Send us your profile to enhance the Magpie Magique experience.</span>
            </p>
          </div>

          <div className="recruit-form-card">
            {status === 'SENT' ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', marginBottom: '1rem', fontSize: '2rem' }}>MERCI ! THANK YOU !</h3>
                <p style={{ fontSize: '1.15rem', color: '#ffffff' }}>Votre candidature a été envoyée avec succès.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {errorMessage && (
                  <p style={{ color: '#ff6b6b', fontSize: '1rem', margin: 0, fontWeight: 'bold' }}>{errorMessage}</p>
                )}
                <div className="recruit-inputs-row">
                  <input 
                    type="text" placeholder="Nom Complet / Full Name" required 
                    className="menu-item-input" 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    type="email" placeholder="Email" required 
                    className="menu-item-input"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <select 
                   className="menu-item-input"
                   onChange={(e) => setFormData({...formData, position: e.target.value})}
                   style={{ height: '3.8rem', background: 'rgba(0,0,0,0.5)', color: '#ffffff', border: '1px solid rgba(201, 168, 76, 0.35)', padding: '0 1.2rem', fontSize: '1.05rem', fontFamily: 'var(--font-sans), sans-serif' }}
                >
                    <option value="">Sélectionnez un poste / Select a position</option>
                    <option value="bartender">Bartender</option>
                    <option value="serveur">Serveur / Server</option>
                    <option value="host">Hôte / Host</option>
                    <option value="cuisine">Cuisine / Kitchen</option>
                </select>
                <div style={{ border: '2px dashed rgba(201, 168, 76, 0.4)', padding: '2rem', textAlign: 'center', background: 'rgba(201, 168, 76, 0.03)', borderRadius: '4px' }}>
                  <label htmlFor="cv-upload" style={{ cursor: 'pointer', color: 'var(--gold)', fontSize: '1.05rem', fontWeight: 'bold', display: 'block' }}>
                    <span className="fr">📄 Téléverser votre CV (PDF, DOCX)</span>
                    <span className="en">📄 Upload your CV (PDF, DOCX)</span>
                  </label>
                  <input 
                    id="cv-upload" type="file" accept=".pdf,.doc,.docx" hidden 
                    onChange={(e) => setFormData({...formData, cv: e.target.files[0]})}
                  />
                  {formData.cv && <p style={{ marginTop: '0.8rem', fontSize: '1rem', color: '#ffffff', fontWeight: 'bold' }}>✓ {formData.cv.name}</p>}
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-primary" 
                  style={{ 
                    marginTop: '1rem', 
                    width: '100%', 
                    padding: '1.3rem',
                    fontSize: '1.05rem',
                    fontWeight: 'bold',
                    opacity: isSubmitting ? 0.6 : 1, 
                    cursor: isSubmitting ? 'wait' : 'pointer' 
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="fr">Envoi en cours...</span>
                      <span className="en">Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="fr">Envoyer ma candidature</span>
                      <span className="en">Send Application</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .recruit-grid {
          display: grid;
          grid-template-columns: minmax(280px, 1fr) 1.4fr;
          gap: 4rem;
          align-items: center;
        }
        .recruit-title {
          font-size: clamp(2.2rem, 5vw, 3rem);
        }
        .recruit-form-card {
          padding: 2.5rem 2.2rem;
          border: 1px solid rgba(201, 168, 76, 0.3);
          background: rgba(0,0,0,0.4);
          border-radius: 4px;
        }
        .recruit-inputs-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
        }
        .menu-item-input {
          width: 100%;
          padding: 1.1rem 1.2rem;
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(201, 168, 76, 0.35);
          color: #ffffff;
          font-family: var(--font-sans), sans-serif;
          font-size: 1.05rem;
          border-radius: 3px;
          box-sizing: border-box;
        }
        .menu-item-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        .menu-item-input:focus {
          border-color: var(--gold);
          outline: none;
          background: rgba(0,0,0,0.7);
        }

        @media (max-width: 900px) {
          .recruit-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .recruit-form-card {
            padding: 2rem 1.5rem;
          }
          .recruit-inputs-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
