'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMenuCategories, getPublicEvents, getPhotos } from '../actions-photos';
import PosterGenerator from '../../../components/PosterGenerator';
import {
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  toggleCategoryVisibility,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createPublicEvent,
  updatePublicEvent,
  deletePublicEvent,
  deletePublicEvents,
  getAllSiteContent,
  updateSiteContents
} from '../actions-cms';

export default function AdminCMS() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('menu');

  // Data states
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Modal / Form states
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null for new
  const [catForm, setCatForm] = useState({ name_fr: '', name_en: '', slug: '', tag: '', order: 0, image: '', photoId: '', isAvailable: true });

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null for new
  const [itemForm, setItemForm] = useState({ name_fr: '', name_en: '', ingredients_fr: '', ingredients_en: '', notes_fr: '', notes_en: '', price: '', isAvailable: true, photoId: '', subcategory_fr: '', subcategory_en: '' });

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // null for new
  const [eventForm, setEventForm] = useState({ date: '', title_fr: '', title_en: '', type: 'JAZZ', desc_fr: '', desc_en: '', color: '#C9A84C', photoId: '', ticketUrl: '', isRecurring: false, frequency: 'weekly', daysOfWeek: [], untilDate: '' });
  const [eventFilter, setEventFilter] = useState('ALL');
  const [selectedEventIds, setSelectedEventIds] = useState([]);

  // Restaurant info states
  const [footerAddressFr, setFooterAddressFr] = useState('');
  const [footerAddressEn, setFooterAddressEn] = useState('');
  const [footerContactFr, setFooterContactFr] = useState('');
  const [footerContactEn, setFooterContactEn] = useState('');
  const [footerHoursFr, setFooterHoursFr] = useState('');
  const [footerHoursEn, setFooterHoursEn] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [menuLayoutMode, setMenuLayoutMode] = useState('tabs'); // 'tabs' | 'cards'

  // Load everything
  async function loadData() {
    setLoading(true);
    try {
      const cats = await getMenuCategories();
      const evts = await getPublicEvents();
      const pts = await getPhotos();
      setCategories(cats || []);
      setEvents(evts || []);
      setPhotos(pts || []);
      setSelectedEventIds([]);

      // Fetch site settings content
      const siteContentRes = await getAllSiteContent();
      if (siteContentRes.success) {
        const contents = siteContentRes.contents || [];
        
        const addr = contents.find(c => c.key === 'footer_address');
        setFooterAddressFr(addr ? addr.text_fr : "380 Rue Gilford, Montréal\nQC H2J 1N4");
        setFooterAddressEn(addr ? addr.text_en : "380 Rue Gilford, Montreal\nQC H2J 1N4");

        const contact = contents.find(c => c.key === 'footer_contact');
        setFooterContactFr(contact ? contact.text_fr : "514-759-6247 (SMS ONLY)\ninfo@magpiemagique.com");
        setFooterContactEn(contact ? contact.text_en : "514-759-6247 (SMS ONLY)\ninfo@magpiemagique.com");

        const hours = contents.find(c => c.key === 'footer_hours');
        setFooterHoursFr(hours ? hours.text_fr : "Mercredi et Dimanche: 17h – minuit\nJeudi, Vendredi et Samedi: 17h – 2h\nFermé Lundi & Mardi");
        setFooterHoursEn(hours ? hours.text_en : "Wednesday and Sunday: 5pm – midnight\nThursday, Friday and Saturday: 5pm – 2am\nClosed Monday & Tuesday");

        const layout = contents.find(c => c.key === 'menu_layout_mode');
        setMenuLayoutMode(layout ? layout.text_en : 'tabs');
      }
      
      // Auto-select first category if none is selected
      if (cats && cats.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error('Error loading CMS data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session && session.user.role === 'ADMIN') {
      loadData();
    }
  }, [session]);

  if (!session || session.user.role !== 'ADMIN') {
    if (typeof window !== 'undefined') {
      router.push('/portal');
    }
    return null;
  }

  // ── CATEGORIES ACTIONS ──
  const openNewCategory = () => {
    setEditingCategory(null);
    setCatForm({ name_fr: '', name_en: '', slug: '', tag: '', order: categories.length + 1, image: '/assets/background_2.jpeg', photoId: '', isAvailable: true });
    setShowCatModal(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatForm({
      name_fr: cat.name_fr,
      name_en: cat.name_en,
      slug: cat.slug,
      tag: cat.tag || '',
      order: cat.order,
      image: cat.image,
      photoId: cat.photoId || '',
      isAvailable: cat.isAvailable !== false
    });
    setShowCatModal(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (editingCategory) {
      res = await updateMenuCategory(editingCategory.id, catForm);
    } else {
      res = await createMenuCategory(catForm);
    }

    if (res.success) {
      setShowCatModal(false);
      await loadData();
    } else {
      alert('Error: ' + res.error);
    }
  };

  const handleCatDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category? All its items will be permanently deleted!')) {
      const res = await deleteMenuCategory(id);
      if (res.success) {
        if (selectedCategoryId === id) {
          setSelectedCategoryId(categories.find(c => c.id !== id)?.id || null);
        }
        await loadData();
      } else {
        alert('Error: ' + res.error);
      }
    }
  };

  // ── ITEMS ACTIONS ──
  const openNewItem = () => {
    setEditingItem(null);
    setItemForm({ name_fr: '', name_en: '', ingredients_fr: '', ingredients_en: '', notes_fr: '', notes_en: '', price: '', isAvailable: true, photoId: '', subcategory_fr: '', subcategory_en: '' });
    setShowItemModal(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name_fr: item.name_fr,
      name_en: item.name_en,
      ingredients_fr: item.ingredients_fr || '',
      ingredients_en: item.ingredients_en || '',
      notes_fr: item.notes_fr || '',
      notes_en: item.notes_en || '',
      price: item.price,
      isAvailable: item.isAvailable,
      photoId: item.photoId || '',
      subcategory_fr: item.subcategory_fr || '',
      subcategory_en: item.subcategory_en || ''
    });
    setShowItemModal(true);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    const data = { ...itemForm, categoryId: selectedCategoryId };
    let res;
    if (editingItem) {
      res = await updateMenuItem(editingItem.id, data);
    } else {
      res = await createMenuItem(data);
    }

    if (res.success) {
      setShowItemModal(false);
      await loadData();
    } else {
      alert('Error: ' + res.error);
    }
  };

  const handleItemDelete = async (id) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      const res = await deleteMenuItem(id);
      if (res.success) {
        await loadData();
      } else {
        alert('Error: ' + res.error);
      }
    }
  };

  // ── EVENTS ACTIONS ──
  const openNewEvent = () => {
    setEditingEvent(null);
    // default date to today, formatted for datetime-local
    const today = new Date();
    const localDateTime = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    // Default untilDate is 1 month from today
    const oneMonthLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const localUntilDate = new Date(oneMonthLater.getTime() - oneMonthLater.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    setEventForm({
      date: localDateTime,
      title_fr: '',
      title_en: '',
      type: 'JAZZ',
      desc_fr: '',
      desc_en: '',
      color: '#C9A84C',
      photoId: '',
      ticketUrl: '',
      isRecurring: false,
      frequency: 'weekly',
      daysOfWeek: [],
      untilDate: localUntilDate
    });
    setShowEventModal(true);
  };

  const openEditEvent = (evt) => {
    setEditingEvent(evt);
    const dateFormatted = new Date(new Date(evt.date).getTime() - new Date(evt.date).getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEventForm({
      date: dateFormatted,
      title_fr: evt.title_fr,
      title_en: evt.title_en,
      type: evt.type,
      desc_fr: evt.desc_fr || '',
      desc_en: evt.desc_en || '',
      color: evt.color || '#C9A84C',
      photoId: evt.photoId || '',
      ticketUrl: evt.ticketUrl || '',
      isRecurring: false,
      frequency: 'weekly',
      daysOfWeek: [],
      untilDate: ''
    });
    setShowEventModal(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (editingEvent) {
      res = await updatePublicEvent(editingEvent.id, eventForm);
    } else {
      res = await createPublicEvent(eventForm);
    }

    if (res.success) {
      setShowEventModal(false);
      await loadData();
    } else {
      alert('Error: ' + res.error);
    }
  };

  const handleEventDelete = async (id) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const res = await deletePublicEvent(id);
      if (res.success) {
        await loadData();
      } else {
        alert('Error: ' + res.error);
      }
    }
  };

  const handleBulkEventDelete = async () => {
    if (selectedEventIds.length === 0) return;
    if (confirm(`Are you sure you want to delete the ${selectedEventIds.length} selected events?`)) {
      const res = await deletePublicEvents(selectedEventIds);
      if (res.success) {
        setSelectedEventIds([]);
        await loadData();
      } else {
        alert('Error: ' + res.error);
      }
    }
  };

  const handleSelectAllEvents = (filteredEvents) => {
    const allFilteredIds = filteredEvents.map(e => e.id);
    const areAllSelected = allFilteredIds.every(id => selectedEventIds.includes(id));
    
    if (areAllSelected) {
      setSelectedEventIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedEventIds(prev => [...new Set([...prev, ...allFilteredIds])]);
    }
  };

  const handleToggleEventSelect = (id) => {
    setSelectedEventIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    const res = await updateSiteContents([
      { key: 'footer_address', text_fr: footerAddressFr, text_en: footerAddressEn },
      { key: 'footer_contact', text_fr: footerContactFr, text_en: footerContactEn },
      { key: 'footer_hours', text_fr: footerHoursFr, text_en: footerHoursEn },
      { key: 'menu_layout_mode', text_fr: menuLayoutMode, text_en: menuLayoutMode }
    ]);
    setSavingSettings(false);
    if (res.success) {
      alert('Restaurant information updated successfully! Changes will reflect across the site.');
      await loadData();
    } else {
      alert('Error updating information: ' + res.error);
    }
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <main style={{ paddingTop: '10rem', minHeight: '100vh', background: 'var(--black)', color: 'var(--cream)' }}>
      <div className="portal-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <Link href="/portal" style={{ color: 'var(--gold)', fontSize: '1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          ← <span className="fr">Retour au Tableau de Bord</span><span className="en">Back to Dashboard</span>
        </Link>
        <p className="section-label">
          <span className="fr">Administration de Contenu</span>
          <span className="en">Content Management</span>
        </p>
        <h2 style={{ marginBottom: '3rem' }}>
          <span className="fr">Éditeur <em>CMS</em></span>
          <span className="en">CMS <em>Editor</em></span>
        </h2>

        {/* Tab Switcher */}
        <div className="menu-tabs" style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '1rem' }}>
          <button 
            onClick={() => setActiveTab('menu')}
            className="btn-secondary"
            style={{ 
              background: activeTab === 'menu' ? 'var(--gold)' : 'transparent',
              color: activeTab === 'menu' ? 'var(--black)' : 'var(--gold)',
              padding: '0.8rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: '1px solid var(--gold)',
              cursor: 'pointer'
            }}
          >
            <span className="fr">Menus (Plats & Boissons)</span>
            <span className="en">Menus (Food & Drinks)</span>
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className="btn-secondary"
            style={{ 
              background: activeTab === 'events' ? 'var(--gold)' : 'transparent',
              color: activeTab === 'events' ? 'var(--black)' : 'var(--gold)',
              padding: '0.8rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: '1px solid var(--gold)',
              cursor: 'pointer'
            }}
          >
            <span className="fr">Événements (Calendrier)</span>
            <span className="en">Events (Calendar)</span>
          </button>
          <button 
            onClick={() => setActiveTab('posters')}
            className="btn-secondary"
            style={{ 
              background: activeTab === 'posters' ? 'var(--gold)' : 'transparent',
              color: activeTab === 'posters' ? 'var(--black)' : 'var(--gold)',
              padding: '0.8rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: '1px solid var(--gold)',
              cursor: 'pointer'
            }}
          >
            <span className="fr">Générateur d'Affiches</span>
            <span className="en">Poster Generator</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className="btn-secondary"
            style={{ 
              background: activeTab === 'settings' ? 'var(--gold)' : 'transparent',
              color: activeTab === 'settings' ? 'var(--black)' : 'var(--gold)',
              padding: '0.8rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: '1px solid var(--gold)',
              cursor: 'pointer'
            }}
          >
            <span className="fr">Info Restaurant</span>
            <span className="en">Restaurant Info</span>
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '5rem 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--gold)', letterSpacing: '0.15em', fontFamily: 'var(--font-deco)' }}>CHARGEMENT DES DONNÉES...</p>
          </div>
        ) : (
          <div className="cms-content">
            
            {/* ── MENUS EDIT SECTION ── */}
            {activeTab === 'menu' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
                
                {/* Categories Left Pane */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', border: '1px solid rgba(201, 168, 76, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--gold)', fontSize: '1.35rem', margin: 0 }}>CATEGORIES</h3>
                    <button onClick={openNewCategory} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>+ ADD</button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {categories.map((cat) => (
                      <div 
                        key={cat.id} 
                        onClick={() => setSelectedCategoryId(cat.id)}
                        style={{ 
                          padding: '1.2rem',
                          background: selectedCategoryId === cat.id ? 'rgba(201, 168, 76, 0.08)' : 'rgba(0,0,0,0.2)',
                          border: selectedCategoryId === cat.id ? '1px solid var(--gold)' : '1px solid rgba(201, 168, 76, 0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: cat.isAvailable !== false ? 1 : 0.6
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <input 
                            type="checkbox" 
                            checked={cat.isAvailable !== false} 
                            onChange={async (e) => {
                              const newStatus = e.target.checked;
                              const res = await toggleCategoryVisibility(cat.id, newStatus);
                              if (res.success) {
                                await loadData();
                              } else {
                                alert('Error: ' + res.error);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                              width: '1.4rem', 
                              height: '1.4rem', 
                              accentColor: 'var(--gold)', 
                              cursor: 'pointer' 
                            }}
                            title="Toggle Visibility"
                          />
                          <div>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.15rem', color: selectedCategoryId === cat.id ? 'var(--gold)' : 'white' }}>{cat.name_en}</p>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(232, 218, 187, 0.5)' }}>/{cat.slug} · Order: {cat.order}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openEditCategory(cat)} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontSize: '1rem' }}>✏️</button>
                          <button onClick={() => handleCatDelete(cat.id)} style={{ background: 'none', border: 'none', color: '#E74C3C', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items Right Pane */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', border: '1px solid rgba(201, 168, 76, 0.15)' }}>
                  {selectedCategory ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(201, 168, 76, 0.1)', paddingBottom: '1rem' }}>
                        <div>
                          <h3 style={{ color: 'var(--gold)', margin: 0, fontSize: '1.6rem' }}>
                            {selectedCategory.name_en} <span style={{ fontSize: '1.25rem', fontWeight: 'normal', color: 'var(--cream)' }}>({selectedCategory.name_fr})</span>
                          </h3>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.05rem', color: 'rgba(232, 218, 187, 0.5)' }}>Tag: {selectedCategory.tag || 'none'}</p>
                        </div>
                        <button onClick={openNewItem} className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}>+ NEW ITEM</button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {selectedCategory.items && selectedCategory.items.length > 0 ? (
                          selectedCategory.items.map((item) => (
                            <div 
                              key={item.id}
                              style={{ 
                                padding: '1.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(201, 168, 76, 0.08)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                opacity: item.isAvailable ? 1 : 0.5
                              }}
                            >
                              <div style={{ flex: 1, paddingRight: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                  <h4 style={{ margin: 0, color: 'white', fontSize: '1.3rem' }}>{item.name_en} / {item.name_fr}</h4>
                                  <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '1.3rem' }}>{item.price}$</span>
                                  {!item.isAvailable && (
                                    <span style={{ fontSize: '0.8rem', color: '#E74C3C', border: '1px solid #E74C3C', padding: '1px 5px', textTransform: 'uppercase' }}>UNAVAILABLE</span>
                                  )}
                                </div>
                                {(item.subcategory_en || item.subcategory_fr) && (
                                  <div style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--gold)', background: 'rgba(201, 168, 76, 0.15)', padding: '2px 8px', border: '1px solid rgba(201, 168, 76, 0.25)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                                      {item.subcategory_en} {item.subcategory_fr ? `• ${item.subcategory_fr}` : ''}
                                    </span>
                                  </div>
                                )}
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'rgba(232, 218, 187, 0.6)', fontStyle: 'italic' }}>
                                  EN: {item.ingredients_en || 'no ingredients'} <br />
                                  FR: {item.ingredients_fr || 'pas d\'ingrédients'}
                                </p>
                                {(item.notes_en || item.notes_fr) && (
                                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(232, 218, 187, 0.85)', fontStyle: 'italic' }}>
                                    Description: {item.notes_en || item.notes_fr}
                                  </p>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                                <button onClick={() => openEditItem(item)} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>EDIT</button>
                                <button onClick={() => handleItemDelete(item.id)} style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', color: '#E74C3C', border: '1px solid #E74C3C', background: 'transparent', cursor: 'pointer' }}>DELETE</button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={{ color: 'rgba(232, 218, 187, 0.4)', textAlign: 'center', padding: '3rem 0' }}>No items in this category yet. Click "+ NEW ITEM" to add one.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'rgba(232, 218, 187, 0.4)', textAlign: 'center', padding: '5rem 0' }}>Please select or create a category in the left panel.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── EVENTS EDIT SECTION ── */}
            {activeTab === 'events' && (() => {
              const filteredEvents = events.filter(e => eventFilter === 'ALL' || e.type === eventFilter);
              const areAllFilteredSelected = filteredEvents.length > 0 && filteredEvents.every(e => selectedEventIds.includes(e.id));
              
              return (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', border: '1px solid rgba(201, 168, 76, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(201, 168, 76, 0.1)', paddingBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ color: 'var(--gold)', fontSize: '1.75rem', margin: 0 }}>PUBLIC EVENTS</h3>
                      <p style={{ margin: '0.3rem 0 0 0', fontSize: '1.05rem', color: 'rgba(232, 218, 187, 0.5)' }}>Manage calendar listings and events on the public events page.</p>
                    </div>
                    <button onClick={openNewEvent} className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '0.95rem' }}>+ CREATE EVENT</button>
                  </div>

                  {/* Filter & Selection Toolbar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem 1.5rem', border: '1px solid rgba(201, 168, 76, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span className="section-label" style={{ fontSize: '0.8rem', color: 'rgba(232, 218, 187, 0.5)' }}>FILTER:</span>
                      {['ALL', 'JAZZ', 'COMEDY', 'PRIVATE'].map((filterType) => (
                        <button
                          key={filterType}
                          onClick={() => setEventFilter(filterType)}
                          style={{
                            background: eventFilter === filterType ? 'var(--gold)' : 'transparent',
                            color: eventFilter === filterType ? 'var(--black)' : 'var(--gold)',
                            border: '1px solid var(--gold)',
                            padding: '0.4rem 1rem',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {filterType}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {filteredEvents.length > 0 && (
                        <button
                          onClick={() => handleSelectAllEvents(filteredEvents)}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(232, 218, 187, 0.3)',
                            color: 'var(--cream)',
                            padding: '0.4rem 1rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          {areAllFilteredSelected ? 'Deselect All / Tout désélectionner' : `Select All / Sélectionner tout (${filteredEvents.length})`}
                        </button>
                      )}

                      {selectedEventIds.length > 0 && (
                        <button
                          onClick={handleBulkEventDelete}
                          style={{
                            background: '#E74C3C',
                            color: 'white',
                            border: 'none',
                            padding: '0.4rem 1.2rem',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Delete Selected ({selectedEventIds.length})
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
                    {filteredEvents.map((evt) => {
                      const evtDate = new Date(evt.date);
                      const isSelected = selectedEventIds.includes(evt.id);
                      return (
                        <div 
                          key={evt.id} 
                          onClick={() => handleToggleEventSelect(evt.id)}
                          style={{ 
                            border: isSelected ? '1px solid var(--gold)' : `1px solid ${evt.color || 'rgba(201, 168, 76, 0.2)'}`,
                            background: isSelected ? 'rgba(201, 168, 76, 0.05)' : 'rgba(0,0,0,0.3)',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {/* Type indicator top right */}
                          <span style={{ 
                            position: 'absolute', 
                            top: '1.5rem', 
                            right: '1.5rem', 
                            fontSize: '0.85rem', 
                            background: evt.color || 'var(--gold)', 
                            color: 'var(--black)',
                            fontWeight: 'bold',
                            padding: '2px 8px',
                            borderRadius: '2px'
                          }}>
                            {evt.type}
                          </span>

                          <div>
                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                              <input 
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // handled by parent div click
                                style={{ transform: 'scale(1.2)', cursor: 'pointer', marginTop: '0.1rem' }}
                              />
                              <p style={{ margin: 0, fontSize: '1rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                                📅 {evtDate.toLocaleDateString('fr-FR')} @ {evtDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <h4 style={{ margin: '0 0 1rem 0', color: 'white', fontSize: '1.4rem', paddingRight: '4rem' }}>{evt.title_en} <br /><span style={{ fontSize: '1.15rem', color: 'rgba(232, 218, 187, 0.7)' }}>({evt.title_fr})</span></h4>
                            <p style={{ margin: '0 0 2rem 0', fontSize: '1.1rem', color: 'rgba(232, 218, 187, 0.6)', lineHeight: '1.4' }}>
                              EN: {evt.desc_en || 'no description'} <br />
                              FR: {evt.desc_fr || 'pas de description'}
                            </p>
                          </div>

                          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(201, 168, 76, 0.08)', paddingTop: '1.5rem' }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEditEvent(evt); }} 
                              className="btn-secondary" 
                              style={{ flex: 1, padding: '0.6rem', fontSize: '0.95rem' }}
                            >
                              EDIT
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEventDelete(evt.id); }} 
                              style={{ 
                                flex: 1, 
                                padding: '0.6rem', 
                                fontSize: '0.95rem', 
                                color: '#E74C3C', 
                                border: '1px solid #E74C3C', 
                                background: 'transparent', 
                                cursor: 'pointer' 
                              }}
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {filteredEvents.length === 0 && (
                      <p style={{ gridColumn: '1 / -1', color: 'rgba(232, 218, 187, 0.4)', textAlign: 'center', padding: '5rem 0' }}>No events match the selected filter.</p>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeTab === 'posters' && (
              <PosterGenerator 
                events={events} 
                photos={photos} 
                onSave={loadData}
                defaultAddressFr={footerAddressFr ? footerAddressFr.split('\n')[0] : ""}
                defaultAddressEn={footerAddressEn ? footerAddressEn.split('\n')[0] : ""}
              />
            )}

            {activeTab === 'settings' && (
              <div style={{ maxWidth: '700px', margin: '0 auto', background: 'rgba(15, 12, 10, 0.6)', border: '1px solid rgba(201, 168, 76, 0.15)', padding: '3rem', borderRadius: '4px' }}>
                <h3 style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', fontSize: '1.4rem', marginBottom: '2rem', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '1rem' }}>
                  <span className="fr">COORDONNÉES & HORAIRES DU RESTAURANT</span>
                  <span className="en">RESTAURANT DETAILS & HOURS</span>
                </h3>
                
                <form onSubmit={handleSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Location Address Row */}
                  <div>
                    <h4 style={{ color: 'var(--cream)', fontSize: '1rem', fontFamily: 'var(--font-serif)', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
                      <span className="fr">1. Adresse de l'établissement</span>
                      <span className="en">1. Establishment Address</span>
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.4rem' }}>FRANÇAIS</label>
                        <textarea 
                          rows={3}
                          className="cms-input" 
                          value={footerAddressFr} 
                          onChange={(e) => setFooterAddressFr(e.target.value)} 
                          style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201, 168, 76, 0.3)', color: 'var(--cream)', resize: 'vertical' }}
                        />
                      </div>
                      <div>
                        <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.4rem' }}>ENGLISH</label>
                        <textarea 
                          rows={3}
                          className="cms-input" 
                          value={footerAddressEn} 
                          onChange={(e) => setFooterAddressEn(e.target.value)} 
                          style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201, 168, 76, 0.3)', color: 'var(--cream)', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Row */}
                  <div>
                    <h4 style={{ color: 'var(--cream)', fontSize: '1rem', fontFamily: 'var(--font-serif)', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
                      <span className="fr">2. Coordonnées de Contact</span>
                      <span className="en">2. Contact Details</span>
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.4rem' }}>FRANÇAIS</label>
                        <textarea 
                          rows={3}
                          className="cms-input" 
                          value={footerContactFr} 
                          onChange={(e) => setFooterContactFr(e.target.value)} 
                          style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201, 168, 76, 0.3)', color: 'var(--cream)', resize: 'vertical' }}
                        />
                      </div>
                      <div>
                        <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.4rem' }}>ENGLISH</label>
                        <textarea 
                          rows={3}
                          className="cms-input" 
                          value={footerContactEn} 
                          onChange={(e) => setFooterContactEn(e.target.value)} 
                          style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201, 168, 76, 0.3)', color: 'var(--cream)', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Opening Hours Row */}
                  <div>
                    <h4 style={{ color: 'var(--cream)', fontSize: '1rem', fontFamily: 'var(--font-serif)', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
                      <span className="fr">3. Heures d'ouverture</span>
                      <span className="en">3. Opening Hours</span>
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.4rem' }}>FRANÇAIS</label>
                        <textarea 
                          rows={4}
                          className="cms-input" 
                          value={footerHoursFr} 
                          onChange={(e) => setFooterHoursFr(e.target.value)} 
                          style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201, 168, 76, 0.3)', color: 'var(--cream)', resize: 'vertical' }}
                        />
                      </div>
                      <div>
                        <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.4rem' }}>ENGLISH</label>
                        <textarea 
                          rows={4}
                          className="cms-input" 
                          value={footerHoursEn} 
                          onChange={(e) => setFooterHoursEn(e.target.value)} 
                          style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201, 168, 76, 0.3)', color: 'var(--cream)', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Menu Layout Switcher Option (Admin Only setting) */}
                  <div style={{ borderTop: '1px solid rgba(201, 168, 76, 0.15)', paddingTop: '1.5rem' }}>
                    <h4 style={{ color: 'var(--cream)', fontSize: '1rem', fontFamily: 'var(--font-serif)', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
                      <span className="fr">4. Affichage des Catégories du Menu</span>
                      <span className="en">4. Menu Categories Layout Mode</span>
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(232, 218, 187, 0.6)', marginBottom: '1rem', fontStyle: 'italic' }}>
                      <span className="fr">Choisissez comment les catégories du menu public seront affichées sur la page.</span>
                      <span className="en">Choose how public menu categories will be displayed on the menu page.</span>
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-deco)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                        <input 
                          type="radio" 
                          name="menuLayoutMode" 
                          value="tabs" 
                          checked={menuLayoutMode === 'tabs'}
                          onChange={() => setMenuLayoutMode('tabs')}
                          style={{ accentColor: 'var(--gold)' }}
                        />
                        <span className="fr">ONGLETS (TEXTE)</span>
                        <span className="en">TABS (TEXT)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-deco)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                        <input 
                          type="radio" 
                          name="menuLayoutMode" 
                          value="cards" 
                          checked={menuLayoutMode === 'cards'}
                          onChange={() => setMenuLayoutMode('cards')}
                          style={{ accentColor: 'var(--gold)' }}
                        />
                        <span className="fr">CARTES VISUELLES (AVEC IMAGES)</span>
                        <span className="en">IMAGE CARDS (WITH IMAGES)</span>
                      </label>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      disabled={savingSettings}
                      style={{ 
                        padding: '1.2rem 3rem', 
                        cursor: 'pointer', 
                        fontSize: '0.9rem', 
                        fontWeight: 'bold', 
                        background: 'var(--gold)', 
                        color: 'var(--black)',
                        border: 'none',
                        letterSpacing: '0.1em'
                      }}
                    >
                      {savingSettings ? (
                        <>
                          <span className="fr">ENREGISTREMENT...</span>
                          <span className="en">SAVING...</span>
                        </>
                      ) : (
                        <>
                          <span className="fr">SAUVEGARDER LES INFOS</span>
                          <span className="en">SAVE INFORMATION</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── CATEGORY MODAL OVERLAY ── */}
      {showCatModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(15,12,10,0.98)', border: '1px solid var(--gold)', padding: '3rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', fontSize: '1.4rem', marginBottom: '2rem', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '1rem' }}>
              {editingCategory ? 'EDIT CATEGORY' : 'NEW CATEGORY'}
            </h3>
            
            <form onSubmit={handleCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Name (EN)</label>
                  <input required type="text" className="cms-input" value={catForm.name_en} onChange={(e) => setCatForm({ ...catForm, name_en: e.target.value })} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Nom (FR)</label>
                  <input required type="text" className="cms-input" value={catForm.name_fr} onChange={(e) => setCatForm({ ...catForm, name_fr: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Slug (Unique URL path, e.g. "cocktails")</label>
                  <input required type="text" className="cms-input" value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Tag / Type</label>
                  <input type="text" placeholder="e.g. Creativity" className="cms-input" value={catForm.tag} onChange={(e) => setCatForm({ ...catForm, tag: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Order Index</label>
                  <input type="number" className="cms-input" value={catForm.order} onChange={(e) => setCatForm({ ...catForm, order: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Image Path Fallback</label>
                  <input type="text" className="cms-input" value={catForm.image} onChange={(e) => setCatForm({ ...catForm, image: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Link Uploaded Photo</label>
                <select 
                  className="cms-input" 
                  value={catForm.photoId} 
                  onChange={(e) => setCatForm({ ...catForm, photoId: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.8)', color: 'var(--cream)' }}
                >
                  <option value="">None / Using Image Path Fallback</option>
                  {photos.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.source})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="cat-available"
                  checked={catForm.isAvailable} 
                  onChange={(e) => setCatForm({ ...catForm, isAvailable: e.target.checked })}
                  style={{ width: '1.5rem', height: '1.5rem', accentColor: 'var(--gold)', cursor: 'pointer' }}
                />
                <label htmlFor="cat-available" style={{ color: 'var(--cream)', fontSize: '0.95rem', cursor: 'pointer', userSelect: 'none' }}>
                  Category is Visible on Public Menu (Available)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem' }}>SAVE CHANGES</button>
                <button 
                  type="button" 
                  onClick={() => setShowCatModal(false)}
                  style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid rgba(232, 218, 187, 0.3)', color: 'var(--cream)', cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MENU ITEM MODAL OVERLAY ── */}
      {showItemModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(15,12,10,0.98)', border: '1px solid var(--gold)', padding: '3rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', fontSize: '1.4rem', marginBottom: '2rem', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '1rem' }}>
              {editingItem ? 'EDIT MENU ITEM' : 'NEW MENU ITEM'}
            </h3>

            <form onSubmit={handleItemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Name (EN)</label>
                  <input required type="text" className="cms-input" value={itemForm.name_en} onChange={(e) => setItemForm({ ...itemForm, name_en: e.target.value })} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Price ($)</label>
                  <input required type="text" placeholder="e.g. 16" className="cms-input" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Nom (FR)</label>
                <input required type="text" className="cms-input" value={itemForm.name_fr} onChange={(e) => setItemForm({ ...itemForm, name_fr: e.target.value })} />
              </div>

              <div>
                <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Ingredients (EN)</label>
                <textarea rows="2" className="cms-input" value={itemForm.ingredients_en} onChange={(e) => setItemForm({ ...itemForm, ingredients_en: e.target.value })} />
              </div>

              <div>
                <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Ingrédients (FR)</label>
                <textarea rows="2" className="cms-input" value={itemForm.ingredients_fr} onChange={(e) => setItemForm({ ...itemForm, ingredients_fr: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Subcategory (EN)</label>
                  <input type="text" placeholder="e.g. Pizza" className="cms-input" value={itemForm.subcategory_en} onChange={(e) => setItemForm({ ...itemForm, subcategory_en: e.target.value })} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Sous-catégorie (FR)</label>
                  <input type="text" placeholder="e.g. Pizza" className="cms-input" value={itemForm.subcategory_fr} onChange={(e) => setItemForm({ ...itemForm, subcategory_fr: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Description (EN)</label>
                  <input type="text" placeholder="e.g. sweet • smoky" className="cms-input" value={itemForm.notes_en} onChange={(e) => setItemForm({ ...itemForm, notes_en: e.target.value })} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Description (FR)</label>
                  <input type="text" placeholder="e.g. doux • fumé" className="cms-input" value={itemForm.notes_fr} onChange={(e) => setItemForm({ ...itemForm, notes_fr: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Availability</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" checked={itemForm.isAvailable === true} onChange={() => setItemForm({ ...itemForm, isAvailable: true })} />
                      <span>Available</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" checked={itemForm.isAvailable === false} onChange={() => setItemForm({ ...itemForm, isAvailable: false })} />
                      <span style={{ color: '#E74C3C' }}>Sold Out</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Link Uploaded Photo</label>
                  <select 
                    className="cms-input" 
                    value={itemForm.photoId} 
                    onChange={(e) => setItemForm({ ...itemForm, photoId: e.target.value })}
                    style={{ background: 'rgba(0,0,0,0.8)', color: 'var(--cream)' }}
                  >
                    <option value="">None / Default</option>
                    {photos.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem' }}>SAVE CHANGES</button>
                <button 
                  type="button" 
                  onClick={() => setShowItemModal(false)}
                  style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid rgba(232, 218, 187, 0.3)', color: 'var(--cream)', cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EVENT MODAL OVERLAY ── */}
      {showEventModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(15,12,10,0.98)', border: '1px solid var(--gold)', padding: '3rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--gold)', fontFamily: 'var(--font-deco)', fontSize: '1.4rem', marginBottom: '2rem', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '1rem' }}>
              {editingEvent ? 'EDIT PUBLIC EVENT' : 'NEW PUBLIC EVENT'}
            </h3>

            <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Date & Time</label>
                  <input required type="datetime-local" className="cms-input" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Event Type</label>
                  <select 
                    className="cms-input" 
                    value={eventForm.type} 
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                    style={{ background: 'rgba(0,0,0,0.8)', color: 'var(--cream)' }}
                  >
                    <option value="JAZZ">JAZZ</option>
                    <option value="COMEDY">COMEDY</option>
                    <option value="PRIVATE">PRIVATE</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Title (EN)</label>
                  <input required type="text" className="cms-input" value={eventForm.title_en} onChange={(e) => setEventForm({ ...eventForm, title_en: e.target.value })} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Titre (FR)</label>
                  <input required type="text" className="cms-input" value={eventForm.title_fr} onChange={(e) => setEventForm({ ...eventForm, title_fr: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Description (EN)</label>
                <textarea rows="3" className="cms-input" value={eventForm.desc_en} onChange={(e) => setEventForm({ ...eventForm, desc_en: e.target.value })} />
              </div>

              <div>
                <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Description (FR)</label>
                <textarea rows="3" className="cms-input" value={eventForm.desc_fr} onChange={(e) => setEventForm({ ...eventForm, desc_fr: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Calendar Color</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="color" className="cms-input" style={{ padding: '0.2rem', height: '40px', width: '50px' }} value={eventForm.color} onChange={(e) => setEventForm({ ...eventForm, color: e.target.value })} />
                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{eventForm.color}</span>
                  </div>
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Link Event Photo</label>
                  <select 
                    className="cms-input" 
                    value={eventForm.photoId} 
                    onChange={(e) => setEventForm({ ...eventForm, photoId: e.target.value })}
                    style={{ background: 'rgba(0,0,0,0.8)', color: 'var(--cream)' }}
                  >
                    <option value="">Default/Fallback Asset</option>
                    {photos.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="section-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Eventbrite Tickets Link (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://www.eventbrite.com/e/..." 
                  className="cms-input" 
                  value={eventForm.ticketUrl} 
                  onChange={(e) => setEventForm({ ...eventForm, ticketUrl: e.target.value })} 
                />
              </div>

              {!editingEvent && (
                <div style={{ border: '1px solid rgba(201, 168, 76, 0.15)', padding: '1.5rem', marginTop: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="isRecurring" 
                      checked={eventForm.isRecurring} 
                      onChange={(e) => setEventForm({ ...eventForm, isRecurring: e.target.checked })}
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                    />
                    <label htmlFor="isRecurring" style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--gold)', cursor: 'pointer' }}>
                      <span className="fr">Récurrence : Répéter cet événement ?</span>
                      <span className="en">Recurrence: Repeat this event?</span>
                    </label>
                  </div>

                  {eventForm.isRecurring && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                          <label className="section-label" style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                            <span className="fr">Fréquence</span>
                            <span className="en">Frequency</span>
                          </label>
                          <select 
                            className="cms-input" 
                            value={eventForm.frequency} 
                            onChange={(e) => setEventForm({ ...eventForm, frequency: e.target.value })}
                            style={{ background: 'rgba(0,0,0,0.8)', color: 'var(--cream)' }}
                          >
                            <option value="weekly">Weekly / Hebdomadaire</option>
                            <option value="biweekly">Bi-weekly / Toutes les 2 semaines</option>
                            <option value="monthly">Monthly / Mensuel</option>
                          </select>
                        </div>
                        <div>
                          <label className="section-label" style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                            <span className="fr">Répéter jusqu'au</span>
                            <span className="en">Repeat Until</span>
                          </label>
                          <input 
                            required={eventForm.isRecurring}
                            type="date" 
                            className="cms-input" 
                            value={eventForm.untilDate} 
                            onChange={(e) => setEventForm({ ...eventForm, untilDate: e.target.value })} 
                          />
                        </div>
                      </div>

                      {(eventForm.frequency === 'weekly' || eventForm.frequency === 'biweekly') && (
                        <div>
                          <label className="section-label" style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.8rem' }}>
                            <span className="fr">Jours de la semaine (laisser vide pour répéter le même jour)</span>
                            <span className="en">Days of the Week (leave empty to repeat on same day as start)</span>
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {[
                              { labelFr: 'Dim', labelEn: 'Sun', value: 0 },
                              { labelFr: 'Lun', labelEn: 'Mon', value: 1 },
                              { labelFr: 'Mar', labelEn: 'Tue', value: 2 },
                              { labelFr: 'Mer', labelEn: 'Wed', value: 3 },
                              { labelFr: 'Jeu', labelEn: 'Thu', value: 4 },
                              { labelFr: 'Ven', labelEn: 'Fri', value: 5 },
                              { labelFr: 'Sam', labelEn: 'Sat', value: 6 }
                            ].map((day) => {
                              const isChecked = eventForm.daysOfWeek.includes(day.value);
                              return (
                                <button
                                  key={day.value}
                                  type="button"
                                  onClick={() => {
                                    const nextDays = isChecked
                                      ? eventForm.daysOfWeek.filter(d => d !== day.value)
                                      : [...eventForm.daysOfWeek, day.value];
                                    setEventForm({ ...eventForm, daysOfWeek: nextDays });
                                  }}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.95rem',
                                    background: isChecked ? 'var(--gold)' : 'transparent',
                                    color: isChecked ? 'var(--black)' : 'var(--gold)',
                                    border: '1px solid var(--gold)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <span className="fr">{day.labelFr}</span>
                                  <span className="en">{day.labelEn}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', borderTop: '1px solid rgba(201, 168, 76, 0.1)', paddingTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem' }}>SAVE CHANGES</button>
                <button 
                  type="button" 
                  onClick={() => setShowEventModal(false)}
                  style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid rgba(232, 218, 187, 0.3)', color: 'var(--cream)', cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled JSX matching site theme inputs */}
      <style jsx global>{`
        .cms-input {
          width: 100%;
          padding: 0.9rem;
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(201, 168, 76, 0.2);
          color: var(--cream);
          font-family: var(--font-serif);
          font-size: 1.15rem;
          box-sizing: border-box;
        }
        .cms-input:focus {
          border-color: var(--gold);
          outline: none;
          background: rgba(0,0,0,0.7);
        }
        .section-label {
          font-size: 0.9rem !important;
          letter-spacing: 0.15em;
        }
      `}</style>
    </main>
  );
}
