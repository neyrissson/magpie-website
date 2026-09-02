'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getPhotos, 
  renamePhoto, 
  deletePhoto, 
  deletePhotos,
  getSiteImage, 
  setSiteImage, 
  uploadPhotoToSupabase,
  updatePhotoTags,
  saveEditedPhoto,
  revertPhotoToOriginal
} from '../actions-photos';

export default function PhotosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [currentHeroId, setCurrentHeroId] = useState(null);
  const [currentLogoId, setCurrentLogoId] = useState(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
  const [editingTagsId, setEditingTagsId] = useState(null);
  const [tempTags, setTempTags] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState(null);
  
  // Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [customName, setCustomName] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');

  // Photo Editor State
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [editorPhoto, setEditorPhoto] = useState(null);
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorFilters, setEditorFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    grayscale: 0,
    blur: 0,
    sepia: 0,
    opacity: 100,
  });
  const editorImgRef = useRef(null);
  const editorCanvasRef = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/portal');
      } else {
        fetchPhotos();
      }
    }
  }, [status, session]);

  async function fetchPhotos() {
    const [data, heroData, logoData] = await Promise.all([
      getPhotos(),
      getSiteImage('hero_bg'),
      getSiteImage('logo')
    ]);
    setPhotos(data);
    setSelectedPhotoIds([]);
    if (heroData) setCurrentHeroId(heroData.photoId);
    if (logoData) setCurrentLogoId(logoData.photoId);
    setLoading(false);
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let duplicateCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`UPLOADING ${i + 1} OF ${files.length}...`);
      const currentFile = files[i];
      const formData = new FormData();
      formData.append('file', currentFile);
      
      if (customName) {
        formData.append('name', files.length > 1 ? `${customName} (${i + 1})` : customName);
      } else {
        const nameWithoutExt = currentFile.name.substring(0, currentFile.name.lastIndexOf('.')) || currentFile.name;
        formData.append('name', nameWithoutExt);
      }

      const res = await uploadPhotoToSupabase(formData);
      if (res.success) {
        successCount++;
      } else if (res.error === 'DUPLICATE_NAME') {
        duplicateCount++;
      } else {
        failCount++;
      }
    }

    setUploading(false);
    setShowUpload(false);
    setFiles([]);
    setCustomName('');
    fetchPhotos();

    let msg = `Upload complete.\n\n`;
    msg += `• ${successCount} files uploaded successfully.\n`;
    if (duplicateCount > 0) {
      msg += `• ${duplicateCount} duplicate files skipped.\n`;
    }
    if (failCount > 0) {
      msg += `• ${failCount} files failed to upload.\n`;
    }
    alert(msg);
  };

  const filteredPhotos = photos.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.url.toLowerCase().includes(search.toLowerCase()) ||
                          (p.tags && p.tags.toLowerCase().includes(search.toLowerCase()));
    const matchesTag = selectedTagFilter 
      ? (p.tags && p.tags.toLowerCase().split(',').map(t => t.trim()).includes(selectedTagFilter.toLowerCase()))
      : true;
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(
    photos.flatMap(p => p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : [])
  ));

  const handleRename = async (id) => {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', newName);
    
    const res = await renamePhoto(formData);
    if (res.success) {
      setEditingId(null);
      fetchPhotos();
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this photo record? (Storage file will remain for safety)')) {
      const res = await deletePhoto(id);
      if (res.success) {
        fetchPhotos();
      }
    }
  };

  const handleTogglePhotoSelect = (id) => {
    setSelectedPhotoIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPhotos = (filteredList) => {
    const allFilteredIds = filteredList.map(p => p.id);
    const areAllSelected = allFilteredIds.every(id => selectedPhotoIds.includes(id));
    
    if (areAllSelected) {
      setSelectedPhotoIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedPhotoIds(prev => [...new Set([...prev, ...allFilteredIds])]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPhotoIds.length === 0) return;
    if (confirm(`Are you sure you want to delete the ${selectedPhotoIds.length} selected photo records? (Storage files will remain for safety)`)) {
      const res = await deletePhotos(selectedPhotoIds);
      if (res.success) {
        setSelectedPhotoIds([]);
        fetchPhotos();
      } else {
        alert(res.error || 'Failed to delete photos');
      }
    }
  };

  const handleSetHero = async (id) => {
    const res = await setSiteImage('hero_bg', id);
    if (res.success) {
      setCurrentHeroId(id);
      alert('Hero background updated!');
    } else {
      alert(res.error);
    }
  };

  const handleSetLogo = async (id) => {
    const res = await setSiteImage('logo', id);
    if (res.success) {
      setCurrentLogoId(id);
      alert('Website logo updated!');
    } else {
      alert(res.error);
    }
  };

  const handleSaveTags = async (id) => {
    const res = await updatePhotoTags(id, tempTags);
    if (res.success) {
      setEditingTagsId(null);
      fetchPhotos();
    } else {
      alert(res.error || 'Failed to update tags');
    }
  };

  if (status === 'loading' || loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
      <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', letterSpacing: '0.2em' }}>CHARGEMENT...</p>
    </div>
  );

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <main style={{ paddingTop: '10rem', minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '2rem' }}>
          <div>
            <Link href="/portal" style={{ color: 'var(--gold)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              ← <span className="fr">Retour au Tableau de Bord</span><span className="en">Back to Dashboard</span>
            </Link>
            <h2 style={{ margin: 0 }}>
              <span className="fr">Photothèque <em>Magique</em></span>
              <span className="en">Media <em>Library</em></span>
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
             <p className="section-label" style={{ marginBottom: '1rem' }}>{photos.length} PHOTOS</p>
             <button 
               onClick={() => setShowUpload(true)} 
               className="btn-primary" 
               style={{ padding: '0.8rem 1.5rem', fontSize: '0.7rem' }}
             >
               <span className="fr">+ Ajouter une Photo</span>
               <span className="en">+ Add New Photo</span>
             </button>
          </div>
        </div>

        {/* UPLOAD MODAL OVERLAY */}
        {showUpload && (
          <div style={{ 
            position: 'fixed', 
            top: 0, left: 0, 
            width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.9)', 
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ 
              width: '100%', 
              maxWidth: '500px', 
              background: '#0a0a0a', 
              padding: '3rem', 
              border: '1px solid var(--gold)',
              position: 'relative'
            }}>
              <button 
                onClick={() => setShowUpload(false)} 
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'gray', cursor: 'pointer', fontSize: '1.2rem' }}
              >✕</button>
              
              <h3 style={{ color: 'var(--gold)', marginBottom: '2rem', fontFamily: 'var(--font-deco)' }}>
                <span className="fr">Télécharger une Image</span>
                <span className="en">Upload Image</span>
              </h3>

              <form onSubmit={handleUpload}>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.8rem', letterSpacing: '0.1em' }}>
                    <span className="fr">SÉLECTIONNER LE(S) FICHIER(S)</span>
                    <span className="en">SELECT FILE(S)</span>
                  </label>
                  <input 
                    type="file" 
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    accept="image/*"
                    multiple
                    required
                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(201, 168, 76, 0.3)', color: 'white' }}
                  />
                  {files.length > 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--cream)', marginTop: '0.5rem' }}>
                      {files.length} {files.length > 1 ? 'files selected' : 'file selected'}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '3rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.8rem', letterSpacing: '0.1em' }}>DISPLAY NAME (OPTIONAL)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Autumn Jazz Night"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={uploading || files.length === 0}
                  className="btn-primary" 
                  style={{ width: '100%', padding: '1.2rem', fontWeight: 'bold', opacity: (uploading || files.length === 0) ? 0.5 : 1 }}
                >
                  {uploading ? uploadProgress : 'START UPLOAD'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        <div style={{ marginBottom: '2rem', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Rechercher une photo..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '1.2rem 1.5rem', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(201, 168, 76, 0.2)', 
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              borderRadius: '4px'
            }}
          />
          <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.5 }}>
            🔍
          </div>
        </div>

        {/* TAG QUICK FILTERS */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-deco)', letterSpacing: '0.12em' }}>
            FILTRER PAR TAG:
          </span>
          <button 
            onClick={() => setSelectedTagFilter(null)}
            style={{
              background: selectedTagFilter === null ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
              color: selectedTagFilter === null ? 'black' : 'var(--cream)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              padding: '0.6rem 1.4rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            ALL / TOUS
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTagFilter(tag)}
              style={{
                background: selectedTagFilter === tag ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                color: selectedTagFilter === tag ? 'black' : 'var(--cream)',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                padding: '0.6rem 1.4rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* SELECTION TOOLBAR */}
        {filteredPhotos.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', background: 'rgba(0,0,0,0.4)', padding: '1.2rem 2rem', border: '1px solid rgba(201, 168, 76, 0.15)' }}>
            <button
              onClick={() => handleSelectAllPhotos(filteredPhotos)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(232, 218, 187, 0.4)',
                color: 'var(--cream)',
                padding: '0.6rem 1.5rem',
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {filteredPhotos.every(p => selectedPhotoIds.includes(p.id)) ? 'Deselect All / Tout désélectionner' : `Select All / Sélectionner tout (${filteredPhotos.length})`}
            </button>
            {selectedPhotoIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                style={{
                  background: '#E74C3C',
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem 1.8rem',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🗑️ Delete Selected ({selectedPhotoIds.length})
              </button>
            )}
          </div>
        )}

        {/* GRID */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '2rem',
          paddingBottom: '5rem'
        }}>
          {filteredPhotos.map(photo => {
            const isSelected = selectedPhotoIds.includes(photo.id);
            return (
              <div 
                key={photo.id} 
                className="event-card" 
                onClick={() => handleTogglePhotoSelect(photo.id)}
                style={{ 
                  padding: '1rem', 
                  background: isSelected ? 'rgba(201, 168, 76, 0.05)' : 'rgba(255,255,255,0.02)', 
                  border: isSelected ? '1px solid var(--gold)' : '1px solid rgba(201, 168, 76, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                
                {/* Image Preview */}
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  background: `url(${encodeURI(photo.url)}) center/cover no-repeat`,
                  borderRadius: '2px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative'
                }}>
                  {/* Selection Checkbox overlay */}
                  <input 
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent div click
                    style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px', 
                      transform: 'scale(1.2)', 
                      cursor: 'pointer',
                      zIndex: 3 
                    }}
                  />

                  {currentHeroId === photo.id && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      left: '10px', 
                      background: 'var(--gold)', 
                      color: 'black', 
                      padding: '0.3rem 0.6rem', 
                      fontSize: '0.6rem', 
                      fontWeight: 'bold',
                      borderRadius: '2px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                      zIndex: 2
                    }}>
                      ACTIVE HERO
                    </div>
                  )}

                  {currentLogoId === photo.id && (
                    <div style={{ 
                      position: 'absolute', 
                      top: currentHeroId === photo.id ? '40px' : '10px', 
                      left: '10px', 
                      background: '#8B6508', 
                      color: 'white', 
                      padding: '0.3rem 0.6rem', 
                      fontSize: '0.6rem', 
                      fontWeight: 'bold',
                      borderRadius: '2px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                      zIndex: 2
                    }}>
                      ACTIVE LOGO
                    </div>
                  )}

                  {photo.source === 'supabase' && (
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '10px', 
                      right: '10px', 
                      background: 'rgba(0,0,0,0.6)', 
                      color: 'white', 
                      padding: '0.2rem 0.4rem', 
                      fontSize: '0.5rem', 
                      borderRadius: '2px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      ☁️ SUPABASE
                    </div>
                  )}
                </div>

                {/* Name / Rename Section */}
                <div style={{ padding: '0.6rem' }}>
                  {editingId === photo.id ? (
                    <div style={{ display: 'flex', gap: '0.6rem' }} onClick={(e) => e.stopPropagation()}>
                      <input 
                        autoFocus
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={{ flex: 1, padding: '0.6rem 0.8rem', background: '#111', border: '1px solid var(--gold)', color: 'white', fontSize: '1.05rem', outline: 'none' }}
                      />
                      <button onClick={() => handleRename(photo.id)} style={{ padding: '0.6rem 1rem', background: 'var(--gold)', color: 'black', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>✓</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '0.6rem 1rem', background: '#333', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ 
                        fontFamily: 'var(--font-sans), sans-serif',
                        fontSize: '1.25rem', 
                        fontWeight: 'bold', 
                        letterSpacing: '0.05em', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        maxWidth: '85%',
                        color: '#ffffff'
                      }}>
                        {photo.name}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingId(photo.id); setNewName(photo.name); }}
                        style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.8 }}
                        title="Rename"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                  
                  <div style={{ 
                    fontFamily: 'var(--font-sans), sans-serif',
                    fontSize: '0.9rem', 
                    color: '#cccccc', 
                    marginTop: '0.6rem', 
                    opacity: 0.9, 
                    fontWeight: '500',
                    wordBreak: 'break-all' 
                  }}>
                    {photo.url.startsWith('data:') ? '[Base64 Data — Generated Poster]' : photo.url}
                  </div>

                  {/* Relational Indicators */}
                  <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                     {photo.publicEvents?.length > 0 && <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '0.75rem', color: 'var(--gold)', background: 'rgba(201, 168, 76, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '2px', fontWeight: 'bold', letterSpacing: '0.08em' }}>EVENT</span>}
                     {photo.menuItems?.length > 0 && <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '0.75rem', color: 'var(--gold)', background: 'rgba(201, 168, 76, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '2px', fontWeight: 'bold', letterSpacing: '0.08em' }}>MENU</span>}
                  </div>

                  {/* Photo Tag Inline Editor */}
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }} onClick={(e) => e.stopPropagation()}>
                    <span style={{ fontSize: '0.9rem', color: 'gray' }}>🏷️</span>
                    {editingTagsId === photo.id ? (
                      <div style={{ display: 'flex', gap: '0.4rem', flex: 1 }}>
                        <input 
                          autoFocus
                          type="text" 
                          value={tempTags}
                          onChange={(e) => setTempTags(e.target.value)}
                          placeholder="jazz, comedy, logo..."
                          style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.9rem', background: '#111', border: '1px solid var(--gold)', color: 'white', outline: 'none', fontFamily: 'var(--font-sans), sans-serif' }}
                        />
                        <button onClick={() => handleSaveTags(photo.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: 'var(--gold)', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✓</button>
                        <button onClick={() => setEditingTagsId(null)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                        <span style={{ 
                          fontFamily: 'var(--font-sans), sans-serif',
                          fontSize: '0.92rem', 
                          color: 'var(--gold)', 
                          fontStyle: 'normal', 
                          letterSpacing: '0.05em', 
                          fontWeight: 'bold' 
                        }}>
                          {photo.tags ? photo.tags : 'no tags'}
                        </span>
                        <button 
                          onClick={() => { setEditingTagsId(photo.id); setTempTags(photo.tags || ''); }}
                          style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.8 }}
                          title="Edit tags"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSetHero(photo.id); }}
                        disabled={currentHeroId === photo.id}
                        style={{ 
                          flex: 1,
                          padding: '0.9rem', 
                          fontSize: '0.85rem', 
                          background: currentHeroId === photo.id ? 'transparent' : 'var(--gold)', 
                          color: currentHeroId === photo.id ? 'var(--gold)' : 'black', 
                          border: currentHeroId === photo.id ? '1px solid var(--gold)' : 'none',
                          cursor: currentHeroId === photo.id ? 'default' : 'pointer',
                          fontWeight: 'bold',
                          letterSpacing: '0.05em'
                        }}
                      >
                        {currentHeroId === photo.id ? 'HERO' : 'SET HERO'}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSetLogo(photo.id); }}
                        disabled={currentLogoId === photo.id}
                        style={{ 
                          flex: 1,
                          padding: '0.9rem', 
                          fontSize: '0.85rem', 
                          background: currentLogoId === photo.id ? 'transparent' : 'var(--gold)', 
                          color: currentLogoId === photo.id ? 'var(--gold)' : 'black', 
                          border: currentLogoId === photo.id ? '1px solid var(--gold)' : 'none',
                          cursor: currentLogoId === photo.id ? 'default' : 'pointer',
                          fontWeight: 'bold',
                          letterSpacing: '0.05em'
                        }}
                      >
                        {currentLogoId === photo.id ? 'LOGO' : 'SET LOGO'}
                      </button>
                    </div>
                    
                    {/* EDIT + REVERT row */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditorPhoto(photo); setEditingPhotoId(photo.id); setEditorFilters({ brightness: 100, contrast: 100, saturation: 100, hue: 0, grayscale: 0, blur: 0, sepia: 0, opacity: 100 }); }}
                        style={{ flex: 1, padding: '0.8rem', fontSize: '0.8rem', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '0.08em' }}
                      >
                        ✏️ EDIT
                      </button>
                      {photo.originalUrl && (
                        <button
                          onClick={async (e) => { e.stopPropagation(); if (!confirm('Revert to original image? Your edits will be lost.')) return; const res = await revertPhotoToOriginal(photo.id); if (res.success) fetchPhotos(); else alert('Revert failed.'); }}
                          style={{ flex: 1, padding: '0.8rem', fontSize: '0.8rem', background: 'rgba(255,150,0,0.1)', color: '#ffaa33', border: '1px solid rgba(255,150,0,0.25)', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '0.08em' }}
                        >
                          ↩ REVERT
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(photo.url); alert('URL copied!'); }}
                        style={{ flex: 1, padding: '0.8rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '500', letterSpacing: '0.05em' }}
                      >
                        URL
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                        style={{ flex: 1, padding: '0.8rem', fontSize: '0.8rem', background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.2)', cursor: 'pointer', fontWeight: '500', letterSpacing: '0.05em' }}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {filteredPhotos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'gray' }}>
            <p className="fr">Aucune photo trouvée.</p>
            <p className="en">No photos found.</p>
          </div>
        )}
      </div>

      {/* ── PHOTO EDITOR MODAL ── */}
      {editingPhotoId && editorPhoto && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.97)',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'var(--font-sans), sans-serif'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2rem', borderBottom: '1px solid rgba(201,168,76,0.2)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>✏️ PHOTO EDITOR</span>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>{editorPhoto.name}</span>
              {editorPhoto.originalUrl && <span style={{ color: '#ffaa33', fontSize: '0.8rem', border: '1px solid rgba(255,150,0,0.3)', padding: '0.2rem 0.6rem' }}>EDITED</span>}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  // Reset to neutral
                  setEditorFilters({ brightness: 100, contrast: 100, saturation: 100, hue: 0, grayscale: 0, blur: 0, sepia: 0, opacity: 100 });
                }}
                style={{ padding: '0.7rem 1.5rem', background: 'rgba(255,255,255,0.07)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', letterSpacing: '0.05em' }}
              >RESET</button>
              <button
                disabled={editorSaving}
                onClick={async () => {
                  setEditorSaving(true);
                  try {
                    const img = editorImgRef.current;
                    const canvas = editorCanvasRef.current;
                    if (!img || !canvas) return;
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    const { brightness, contrast, saturation, hue, grayscale, blur, sepia, opacity } = editorFilters;
                    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) grayscale(${grayscale}%) blur(${blur}px) sepia(${sepia}%) opacity(${opacity}%)`;
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                    const res = await saveEditedPhoto(editorPhoto.id, dataUrl);
                    if (res.success) {
                      fetchPhotos();
                      setEditingPhotoId(null);
                      setEditorPhoto(null);
                    } else {
                      alert('Save failed: ' + (res.error || 'Unknown error'));
                    }
                  } finally {
                    setEditorSaving(false);
                  }
                }}
                style={{ padding: '0.7rem 1.5rem', background: editorSaving ? '#555' : 'var(--gold)', color: 'black', border: 'none', cursor: editorSaving ? 'wait' : 'pointer', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.08em' }}
              >{editorSaving ? 'SAVING...' : 'SAVE & CLOSE'}</button>
              <button
                onClick={() => { setEditingPhotoId(null); setEditorPhoto(null); }}
                style={{ padding: '0.7rem 1.2rem', background: 'transparent', color: '#888', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '1.2rem' }}
              >✕</button>
            </div>
          </div>

          {/* Body: Preview + Sidebar */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

            {/* Preview */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#0a0a0a', overflow: 'hidden' }}>
              <img
                ref={editorImgRef}
                src={editorPhoto.originalUrl || editorPhoto.url}
                crossOrigin="anonymous"
                alt={editorPhoto.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  filter: `brightness(${editorFilters.brightness}%) contrast(${editorFilters.contrast}%) saturate(${editorFilters.saturation}%) hue-rotate(${editorFilters.hue}deg) grayscale(${editorFilters.grayscale}%) blur(${editorFilters.blur}px) sepia(${editorFilters.sepia}%) opacity(${editorFilters.opacity}%)`,
                  transition: 'filter 0.1s ease'
                }}
              />
              <canvas ref={editorCanvasRef} style={{ display: 'none' }} />
            </div>

            {/* Controls Sidebar */}
            <div style={{ width: '320px', flexShrink: 0, overflowY: 'auto', borderLeft: '1px solid rgba(255,255,255,0.07)', background: '#111', padding: '1.5rem' }}>
              
              {/* Section: Light */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.15em', marginBottom: '1.2rem', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>☀️ LIGHT</div>
                {[
                  { label: 'Brightness', key: 'brightness', min: 0, max: 200, def: 100 },
                  { label: 'Contrast', key: 'contrast', min: 0, max: 300, def: 100 },
                  { label: 'Exposure (Opacity)', key: 'opacity', min: 10, max: 100, def: 100 },
                ].map(({ label, key, min, max, def }) => (
                  <div key={key} style={{ marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#ccc', fontSize: '0.88rem', fontWeight: '500' }}>{label}</span>
                      <span style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 'bold', minWidth: '40px', textAlign: 'right' }}>{editorFilters[key]}</span>
                    </div>
                    <input type="range" min={min} max={max} value={editorFilters[key]}
                      onChange={e => setEditorFilters(f => ({ ...f, [key]: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#444', fontSize: '0.7rem' }}>{min}</span>
                      <button onClick={() => setEditorFilters(f => ({ ...f, [key]: def }))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.7rem' }}>reset</button>
                      <span style={{ color: '#444', fontSize: '0.7rem' }}>{max}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section: Color */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.15em', marginBottom: '1.2rem', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>🎨 COLOR</div>
                {[
                  { label: 'Saturation', key: 'saturation', min: 0, max: 300, def: 100 },
                  { label: 'Hue Rotate', key: 'hue', min: -180, max: 180, def: 0 },
                  { label: 'Sepia', key: 'sepia', min: 0, max: 100, def: 0 },
                ].map(({ label, key, min, max, def }) => (
                  <div key={key} style={{ marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#ccc', fontSize: '0.88rem', fontWeight: '500' }}>{label}</span>
                      <span style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 'bold', minWidth: '40px', textAlign: 'right' }}>{editorFilters[key]}</span>
                    </div>
                    <input type="range" min={min} max={max} value={editorFilters[key]}
                      onChange={e => setEditorFilters(f => ({ ...f, [key]: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#444', fontSize: '0.7rem' }}>{min}</span>
                      <button onClick={() => setEditorFilters(f => ({ ...f, [key]: def }))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.7rem' }}>reset</button>
                      <span style={{ color: '#444', fontSize: '0.7rem' }}>{max}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section: Effects */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.15em', marginBottom: '1.2rem', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>✨ EFFECTS</div>
                {[
                  { label: 'Grayscale (B&W)', key: 'grayscale', min: 0, max: 100, def: 0 },
                  { label: 'Blur', key: 'blur', min: 0, max: 20, def: 0 },
                ].map(({ label, key, min, max, def }) => (
                  <div key={key} style={{ marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#ccc', fontSize: '0.88rem', fontWeight: '500' }}>{label}</span>
                      <span style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 'bold', minWidth: '40px', textAlign: 'right' }}>{editorFilters[key]}</span>
                    </div>
                    <input type="range" min={min} max={max} value={editorFilters[key]}
                      onChange={e => setEditorFilters(f => ({ ...f, [key]: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#444', fontSize: '0.7rem' }}>{min}</span>
                      <button onClick={() => setEditorFilters(f => ({ ...f, [key]: def }))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.7rem' }}>reset</button>
                      <span style={{ color: '#444', fontSize: '0.7rem' }}>{max}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reset All */}
              <button
                onClick={() => setEditorFilters({ brightness: 100, contrast: 100, saturation: 100, hue: 0, grayscale: 0, blur: 0, sepia: 0, opacity: 100 })}
                style={{ width: '100%', padding: '0.9rem', background: 'rgba(255,255,255,0.04)', color: '#888', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', letterSpacing: '0.05em' }}
              >RESET ALL FILTERS</button>

              {editorPhoto.originalUrl && (
                <button
                  onClick={async () => {
                    if (!confirm('Revert to original? All edits will be lost.')) return;
                    const res = await revertPhotoToOriginal(editorPhoto.id);
                    if (res.success) { fetchPhotos(); setEditingPhotoId(null); setEditorPhoto(null); }
                    else alert('Revert failed.');
                  }}
                  style={{ width: '100%', marginTop: '0.8rem', padding: '0.9rem', background: 'rgba(255,100,0,0.08)', color: '#ffaa33', border: '1px solid rgba(255,150,0,0.2)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.05em' }}
                >↩ REVERT TO ORIGINAL</button>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
