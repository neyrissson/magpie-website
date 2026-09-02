'use client';

import React, { useState, useEffect } from 'react';
import { getMenuCategories } from '../portal/actions-photos';
import { getAllSiteContent } from '../portal/actions-cms';

const fallbackCategories = [
  { 
    id: 'cocktails', 
    title_fr: 'Cocktails Signatures', 
    title_en: 'Signature Cocktails', 
    image: '/assets/background_2.jpeg',
    tag: 'Creativity'
  },
  { 
    id: 'pizza', 
    title_fr: 'Pizzas Artisanales', 
    title_en: 'Artisan Pizzas', 
    image: '/assets/background_4.jpeg', 
    tag: 'Authentic'
  },
  { 
    id: 'food', 
    title_fr: 'Petites Assiettes', 
    title_en: 'Small Plates', 
    image: '/assets/background_5.jpeg', 
    tag: 'Shared'
  },
  { 
    id: 'vin', 
    title_fr: 'Vins d\'Exception', 
    title_en: 'Fine Wines', 
    image: '/assets/background_3.jpeg',
    tag: 'Elegance'
  },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('tabs'); // 'tabs' | 'cards'

  const getGroupedItems = (items) => {
    const groups = {};
    const defaultGroup = [];

    (items || []).forEach(item => {
      const key = (item.subcategory_en || '').trim();
      if (key === '') {
        defaultGroup.push(item);
      } else {
        if (!groups[key]) {
          groups[key] = {
            name_en: item.subcategory_en,
            name_fr: item.subcategory_fr || item.subcategory_en,
            items: []
          };
        }
        groups[key].items.push(item);
      }
    });

    return { groups, defaultGroup };
  };

  useEffect(() => {
    async function load() {
      // Load layout settings first
      const contentRes = await getAllSiteContent();
      if (contentRes.success) {
        const layoutObj = contentRes.contents?.find(c => c.key === 'menu_layout_mode');
        if (layoutObj) {
          setViewMode(layoutObj.text_en || 'tabs');
        }
      }

      const data = await getMenuCategories();
      // Only display categories that are marked as available/visible
      const visibleData = data ? data.filter(c => c.isAvailable !== false) : [];
      if (visibleData.length > 0) {
        // Map Prisma model to local UI structure
        const mapped = visibleData.map(c => ({
          id: c.id,
          title_fr: c.name_fr,
          title_en: c.name_en,
          image: c.photo?.url || c.image || '/assets/background_2.jpeg',
          tag: c.tag,
          items: c.items || []
        }));
        setCategories(mapped);
        setActiveCategory(mapped[0].id); // Auto-select first category
      } else {
        setCategories(fallbackCategories);
        setActiveCategory(fallbackCategories[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="menu-page" style={{ paddingTop: '12rem' }}>
      <section className="menu-intro">
        <div className="menu-container">
          <p className="section-label">
            <span className="fr">Gastronomie & Mixologie</span>
            <span className="en">Dining & Mixology</span>
          </p>
          <h2>
            <span className="fr">Nos <em>Menus</em></span>
            <span className="en">Our <em>Menus</em></span>
          </h2>
          

          {viewMode === 'tabs' ? (
            <div className="menu-tabs">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  className={`tab ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="fr">{cat.title_fr}</span>
                  <span className="en">{cat.title_en}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="events-grid" style={{ marginBottom: '5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className={`event-card featured-event cursor-pointer ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    border: activeCategory === cat.id ? '1px solid var(--gold)' : '1px solid rgba(201, 168, 76, 0.15)',
                    boxShadow: activeCategory === cat.id ? '0 0 15px rgba(201, 168, 76, 0.2)' : 'none',
                    transition: 'all 0.3s ease',
                    minHeight: '220px'
                  }}
                >
                  <div className="event-image-container" style={{ height: '140px' }}>
                    <img src={cat.image} alt={cat.title_en} className="event-image" />
                    <div className="event-image-overlay"></div>
                  </div>
                  <div className="event-content" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minHeight: 'auto' }}>
                    <div className="event-title" style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', color: activeCategory === cat.id ? 'var(--gold)' : 'var(--cream)', transition: 'color 0.3s' }}>
                      <span className="fr">{cat.title_fr}</span>
                      <span className="en">{cat.title_en}</span>
                    </div>
                    {cat.tag && (
                      <div className="event-tag" style={{ position: 'static', marginTop: '0.6rem', display: 'inline-block', alignSelf: 'flex-start', fontSize: '0.65rem', padding: '2px 8px' }}>
                        {cat.tag}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeCategory && (
            <div className="menu-details reveal-fade" style={{ marginTop: '5rem', opacity: 1, transform: 'translateY(0)' }}>
              <div className="hero-divider"></div>
              <h3 className="text-center" style={{ marginBottom: '3rem', color: 'var(--gold)', fontFamily: 'var(--font-deco)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                <span className="fr">{categories.find(c => c.id === activeCategory)?.title_fr}</span>
                <span className="en">{categories.find(c => c.id === activeCategory)?.title_en}</span>
              </h3>
              <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {(() => {
                  const activeCatObj = categories.find(c => c.id === activeCategory);
                  if (!activeCatObj || !activeCatObj.items || activeCatObj.items.length === 0) {
                    return (
                      <p style={{ textAlign: 'center', color: 'rgba(232, 218, 187, 0.4)', padding: '3rem 0' }}>
                        <span className="fr">Aucun article dans cette catégorie pour le moment.</span>
                        <span className="en">No items in this category yet.</span>
                      </p>
                    );
                  }

                  const { groups, defaultGroup } = getGroupedItems(activeCatObj.items);
                  const groupKeys = Object.keys(groups);

                  const renderMenuItem = (item) => (
                    <div key={item.id} className="menu-item" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'baseline', 
                      borderBottom: '1px dotted rgba(201, 168, 76, 0.2)', 
                      paddingBottom: '1.5rem',
                      opacity: item.isAvailable ? 1 : 0.5
                    }}>
                      <div className="item-info" style={{ paddingRight: '2rem' }}>
                        <div className="item-name" style={{ 
                          fontFamily: 'var(--font-serif)', 
                          fontSize: '1.45rem', 
                          color: 'var(--cream)', 
                          marginBottom: '0.5rem',
                          fontWeight: '600'
                        }}>
                          <span className="fr">{item.name_fr}</span>
                          <span className="en">{item.name_en}</span>
                          {!item.isAvailable && (
                            <span style={{ fontSize: '0.85rem', color: '#E74C3C', marginLeft: '1rem', border: '1px solid #E74C3C', padding: '2px 6px', textTransform: 'uppercase', fontFamily: 'var(--font-deco)' }}>
                              <span className="fr">Non disponible</span>
                              <span className="en">Unavailable</span>
                            </span>
                          )}
                        </div>
                        <div className="item-desc" style={{ 
                          fontSize: '1.1rem', 
                          color: 'rgba(232, 218, 187, 0.6)', 
                          fontStyle: 'italic',
                          lineHeight: '1.4'
                        }}>
                          <span className="fr">{item.ingredients_fr}</span>
                          <span className="en">{item.ingredients_en}</span>
                        </div>
                        {(item.notes_fr || item.notes_en) && (
                          <div className="item-notes" style={{
                            fontSize: '0.95rem',
                            color: 'var(--gold)',
                            marginTop: '0.5rem',
                            opacity: 0.8
                          }}>
                            <span className="fr">{item.notes_fr}</span>
                            <span className="en">{item.notes_en}</span>
                          </div>
                        )}
                      </div>
                      <div className="item-price" style={{ 
                        fontFamily: 'var(--font-deco)', 
                        color: 'var(--gold)', 
                        fontSize: '1.45rem', 
                        fontWeight: '600' 
                      }}>
                        {item.price}$
                      </div>
                    </div>
                  );

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                      {/* Default Items (Items with no subcategory) */}
                      {defaultGroup.length > 0 && (
                        <div className="menu-grid" style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                          gap: '3rem',
                          width: '100%'
                        }}>
                          {defaultGroup.map(renderMenuItem)}
                        </div>
                      )}

                      {/* Grouped Items (Items with subcategories) */}
                      {groupKeys.map(groupKey => (
                        <div key={groupKey} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', marginTop: '1.5rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(201, 168, 76, 0.35))' }} />
                            <h4 style={{
                              fontFamily: 'var(--font-deco)',
                              color: 'var(--gold)',
                              fontSize: '1.25rem',
                              letterSpacing: '0.2em',
                              textTransform: 'uppercase',
                              margin: 0,
                              textAlign: 'center'
                            }}>
                              <span className="fr">{groups[groupKey].name_fr}</span>
                              <span className="en">{groups[groupKey].name_en}</span>
                            </h4>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(201, 168, 76, 0.35))' }} />
                          </div>
                          
                          <div className="menu-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                            gap: '3rem',
                            width: '100%'
                          }}>
                            {groups[groupKey].items.map(renderMenuItem)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
