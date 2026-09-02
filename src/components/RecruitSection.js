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
    <section id="recruit" className="recruit-section" style={{ background: 'var(--black-card)', borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingBottom: '10rem' }}>
      <div className="menu-container">
        <p className="section-label">
          <span className="fr">Recrutement</span>
          <span className="en">Join our Team</span>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '8rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem' }}>
              <span className="fr">Laissez votre <em>CV</em></span>
              <span className="en">Leave your <em>CV</em></span>
            </h2>
            <p style={{ color: 'rgba(232, 218, 187, 0.6)', lineHeight: '1.8' }}>
              <span className="fr">Nous sommes toujours à la recherche de passionnés de la mixologie et du service. Envoyez-nous votre profil pour enrichir l'expérience Magpie Magique.</span>
              <span className="en">We are always looking for people passionate about mixology and service. Send us your profile to enhance the Magpie Magique experience.</span>
            </p>
          </div>

          <div style={{ padding: '3rem', border: '1px solid rgba(201, 168, 76, 0.15)', background: 'rgba(0,0,0,0.2)' }}>
            {status === 'SENT' ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', marginBottom: '1rem' }}>MERCI ! THANK YOU !</h3>
                <p style={{ fontSize: '0.9rem' }}>Votre candidature a été envoyée avec succès.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {errorMessage && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: 0 }}>{errorMessage}</p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
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
                   style={{ height: '3.5rem', background: 'rgba(0,0,0,0.3)', color: 'var(--cream)', border: '1px solid rgba(201, 168, 76, 0.2)', padding: '0 1rem' }}
                >
                    <option value="">Sélectionnez un poste / Select a position</option>
                    <option value="bartender">Bartender</option>
                    <option value="serveur">Serveur / Server</option>
                    <option value="host">Hôte / Host</option>
                    <option value="cuisine">Cuisine / Kitchen</option>
                </select>
                <div style={{ border: '1px dashed rgba(201, 168, 76, 0.3)', padding: '2rem', textAlign: 'center' }}>
                  <label htmlFor="cv-upload" style={{ cursor: 'pointer', color: 'var(--gold)', fontSize: '0.9rem' }}>
                    <span className="fr">+ Téléverser votre CV (PDF)</span>
                    <span className="en">+ Upload your CV (PDF)</span>
                  </label>
                  <input 
                    id="cv-upload" type="file" accept=".pdf,.doc,.docx" hidden 
                    onChange={(e) => setFormData({...formData, cv: e.target.files[0]})}
                  />
                  {formData.cv && <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>{formData.cv.name}</p>}
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-primary" 
                  style={{ 
                    marginTop: '1rem', 
                    width: '100%', 
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
        .menu-item-input {
          width: 100%;
          padding: 1rem;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(201, 168, 76, 0.15);
          color: var(--cream);
          font-family: var(--font-serif);
        }
        .menu-item-input:focus {
          border-color: var(--gold);
          outline: none;
        }
      `}</style>
    </section>
  );
}
