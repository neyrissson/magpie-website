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
              <h3 className="text-center" style={{ marginBottom: '3rem', color: 'var(--gold)', fontFamily: 'var(--font-deco)', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '2.2rem', fontWeight: 'bold' }}>
                <span className="fr">{categories.find(c => c.id === activeCategory)?.title_fr}</span>
                <span className="en">{categories.find(c => c.id === activeCategory)?.title_en}</span>
              </h3>
              <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {(() => {
                  const activeCatObj = categories.find(c => c.id === activeCategory);
                  if (!activeCatObj || !activeCatObj.items || activeCatObj.items.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(201, 168, 76, 0.2)', borderRadius: '4px' }}>
                        <p style={{ color: '#ffffff', fontSize: '1.3rem', fontFamily: 'var(--font-sans), sans-serif', margin: 0, opacity: 0.9 }}>
                          <span className="fr">Aucun article dans cette catégorie pour le moment.</span>
                          <span className="en">No items in this category yet.</span>
                        </p>
                      </div>
                    );
                  }

                  const { groups, defaultGroup } = getGroupedItems(activeCatObj.items);
                  const groupKeys = Object.keys(groups);

                  const renderMenuItem = (item, index, array) => {
                    const isTasting = item.name_fr?.toLowerCase().includes('dégustation') || item.name_en?.toLowerCase().includes('tasting');

                    if (isTasting) {
                      return (
                        <div key={item.id} style={{
                          gridColumn: '1 / -1',
                          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(10, 7, 5, 0.95) 100%)',
                          border: '1px solid var(--gold)',
                          borderRadius: '4px',
                          padding: '2.5rem 3rem',
                          marginBottom: '2rem',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.15)',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'inline-block', background: 'var(--gold)', color: '#000000', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '2px', marginBottom: '1.2rem', fontFamily: 'var(--font-sans), sans-serif' }}>
                            ✨ Offre Spéciale / Special Offer
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                            <div style={{ maxWidth: '75%' }}>
                              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#ffffff', margin: '0 0 0.8rem 0', fontWeight: 'bold' }}>
                                <span className="fr">{item.name_fr}</span>
                                <span className="en">{item.name_en}</span>
                              </h3>
                              <p style={{ fontSize: '1.22rem', color: '#f0eae1', fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                                <span className="fr">{item.ingredients_fr}</span>
                                <span className="en">{item.ingredients_en}</span>
                              </p>
                              {item.notes_fr && (
                                <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '0.8rem 1.2rem', borderRadius: '4px', borderLeft: '3px solid var(--gold)', color: 'var(--gold-light)', fontSize: '1.05rem', fontWeight: '500' }}>
                                  <span className="fr">💡 {item.notes_fr}</span>
                                  <span className="en">💡 {item.notes_en}</span>
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontFamily: 'var(--font-deco)', color: 'var(--gold)', fontSize: '2.4rem', fontWeight: 'bold' }}>
                                {item.price}$
                              </div>
                              <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <span className="fr">par convive</span>
                                <span className="en">per guest</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const nonTasting = array ? array.filter(i => !(i.name_fr?.toLowerCase().includes('dégustation') || i.name_en?.toLowerCase().includes('tasting'))) : [];
                    const isOddLast = nonTasting.length % 2 !== 0 && nonTasting[nonTasting.length - 1]?.id === item.id;

                    return (
                      <div 
                        key={item.id} 
                        className={`menu-card-framed ${isOddLast ? 'span-full' : ''}`}
                        style={{ opacity: item.isAvailable ? 1 : 0.5 }}
                      >
                        <div className="item-info">
                          <div className="item-name">
                            <span className="fr">{item.name_fr}</span>
                            <span className="en">{item.name_en}</span>
                            {!item.isAvailable && (
                              <span className="badge-unavailable">
                                <span className="fr">Non disponible</span>
                                <span className="en">Unavailable</span>
                              </span>
                            )}
                          </div>
                          <div className="item-desc">
                            <span className="fr">{item.ingredients_fr}</span>
                            <span className="en">{item.ingredients_en}</span>
                          </div>
                          {(item.notes_fr || item.notes_en) && (
                            <div className="item-notes">
                              <span className="fr">{item.notes_fr}</span>
                              <span className="en">{item.notes_en}</span>
                            </div>
                          )}
                        </div>
                        <div className="item-price">
                          {item.price}$
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
                      {/* Default Items (Items with no subcategory) */}
                      {defaultGroup.length > 0 && (
                        <div className="menu-grid-framed">
                          {defaultGroup.map((item, idx) => renderMenuItem(item, idx, defaultGroup))}
                        </div>
                      )}

                      {/* Grouped Items (Items with subcategories) */}
                      {groupKeys.map(groupKey => {
                        const tastingItems = groups[groupKey].items.filter(i => i.name_fr?.toLowerCase().includes('dégustation') || i.name_en?.toLowerCase().includes('tasting'));
                        const regularItems = groups[groupKey].items.filter(i => !(i.name_fr?.toLowerCase().includes('dégustation') || i.name_en?.toLowerCase().includes('tasting')));

                        return (
                          <div key={groupKey} style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', marginTop: '1rem' }}>
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
                            
                            {/* If there are tasting menu items, render them first */}
                            {tastingItems.map((item, idx) => renderMenuItem(item, idx, tastingItems))}

                            {/* Regular items in contiguous seamless gold-framed grid */}
                            {regularItems.length > 0 && (
                              <div className="menu-grid-framed">
                                {regularItems.map((item, idx) => renderMenuItem(item, idx, regularItems))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Seamless Gold-Framed Grid Styles */}
      <style jsx global>{`
        .menu-grid-framed {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
          width: 100%;
          border-top: 1px solid rgba(201, 168, 76, 0.4);
          border-left: 1px solid rgba(201, 168, 76, 0.4);
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
        }

        .menu-card-framed {
          background: rgba(13, 10, 8, 0.95);
          border-right: 1px solid rgba(201, 168, 76, 0.35);
          border-bottom: 1px solid rgba(201, 168, 76, 0.35);
          padding: 1.8rem 2.2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.2rem;
          transition: background 0.25s ease, box-shadow 0.25s ease;
          box-sizing: border-box;
        }

        .menu-card-framed:hover {
          background: rgba(24, 18, 14, 0.98);
          box-shadow: inset 0 0 25px rgba(201, 168, 76, 0.08);
        }

        .menu-card-framed.span-full {
          grid-column: 1 / -1;
        }

        .menu-card-framed .item-info {
          flex: 1;
          padding-right: 1.2rem;
        }

        .menu-card-framed .item-name {
          font-family: var(--font-serif) !important;
          font-size: 1.22rem !important;
          color: #ffffff;
          margin-bottom: 0.4rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: none !important;
          line-height: 1.35;
        }

        .menu-card-framed .badge-unavailable {
          font-size: 0.75rem;
          color: #E74C3C;
          border: 1px solid #E74C3C;
          padding: 2px 6px;
          text-transform: uppercase;
          font-family: var(--font-sans), sans-serif;
          font-weight: bold;
          margin-left: 0.8rem;
          border-radius: 2px;
        }

        .menu-card-framed .item-desc {
          font-size: 1.02rem;
          color: #e8e0d5;
          font-style: italic;
          line-height: 1.5;
          opacity: 0.92;
        }

        .menu-card-framed .item-notes {
          font-size: 0.95rem;
          color: var(--gold);
          margin-top: 0.45rem;
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        .menu-card-framed .item-price {
          font-family: var(--font-deco);
          color: var(--gold);
          font-size: 1.25rem;
          font-weight: 700;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .menu-grid-framed {
            grid-template-columns: 1fr;
          }
          .menu-card-framed {
            padding: 1.5rem 1.4rem;
          }
        }
      `}</style>
    </main>
  );
}
