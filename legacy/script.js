document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    let currentLang = localStorage.getItem('magpie-lang') || 'fr';
    
    // Set initial language
    document.body.className = `lang-${currentLang}`;
    document.querySelectorAll('.lang-opt').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === currentLang);
    });

    // Language Toggle logic
    const langSwitcher = document.getElementById('lang-switcher');
    langSwitcher.addEventListener('click', (e) => {
        const opt = e.target.closest('.lang-opt');
        if (!opt) return;
        
        currentLang = opt.dataset.lang;
        localStorage.setItem('magpie-lang', currentLang);
        
        document.body.className = `lang-${currentLang}`;
        document.querySelectorAll('.lang-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        
        // Refresh menu with new language (only if on menu page)
        const activeTab = document.querySelector('.tab.active');
        if (activeTab && typeof updateMenu === 'function') updateMenu(activeTab.dataset.category);
    });

    // Nav scroll effect
    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(10, 7, 5, 0.98)';
            nav.style.padding = '0.8rem 3rem';
        } else {
            nav.style.background = 'linear-gradient(to bottom, rgba(10,7,5,0.98), transparent)';
            nav.style.padding = '1rem 3rem';
        }
    });

    // --- GSAP HERO ANIMATIONS (PERFECT L-CORNER SLIDING) ---
    const heroPath = document.getElementById('hero-path');
    if (heroPath) {
        const pathLength = heroPath.getTotalLength();
        
        // We want two segments (L-corners). 
        const segment = 40; 
        const gap = (pathLength / 2) - segment;
        
        gsap.set(heroPath, {
            strokeDasharray: `${segment}, ${gap}, ${segment}, ${gap}`,
            strokeDashoffset: segment / 2 
        });

        // Animate offset to make them slide around
        gsap.to(heroPath, {
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom+=50% top",
                scrub: 2.5
            },
            strokeDashoffset: (segment / 2) - pathLength, 
            ease: "none"
        });
    }

    // Removed hero-bg parallax to improve performance and prevent lag

    // Hero Scroll Animation (Homepage only)
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        gsap.to(".hero-content", {
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            },
            y: -100,
            opacity: 0,
            ease: "none"
        });
    }

    // Menu Tab Switching
    const tabs = document.querySelectorAll('.tab');
    const menuGrid = document.getElementById('menu-grid');

    const menuData = {
        cocktails: {
            fr: [
                { name: "DATE NIGHT", ing: "Gin, Miel, Lavande, Pois Papillon, Lime", notes: "Floral, Romantique, Métamorphose", price: "15$" },
                { name: "SKITTLE MARTINI", ing: "Limoncello, Schnapps de Pêche, Vodka, Pomme, Grenadine, Lime", notes: "Sucré, Electrique, Assumé", price: "14$" },
                { name: "THE EMBER ROOM", ing: "Rye, Compari, Amaro Nonino, Chocolat", notes: "Fumé, Doux-amer, Aromatique", price: "19$" },
                { name: "PLATEAU HEATWAVE", ing: "Tequila, Mangue, Lime, Jalapeño, Ginger Beer", notes: "Tropical, Epicé, Rafraîchissant", price: "16$" },
                { name: "TIRAMISU MARTINI", ing: "Vodka, crème de cacao, liqueur de café, vanille, mascarpone", notes: "Velouté, Gourmand, Décadent", price: "18$" }
            ],
            en: [
                { name: "DATE NIGHT", ing: "Gin, Honey, Lavender, Butterfly Pea, Lime", notes: "Floral, Romantic, Color-Changing", price: "15$" },
                { name: "SKITTLE MARTINI", ing: "Limoncello, Peach Schnapps, Vodka, Green Apple, Grenadine, Lime", notes: "Sweet, Electric, Bold", price: "14$" },
                { name: "THE EMBER ROOM", ing: "Rye, Campari, Amaro Nonino, Chocolate", notes: "Smoky, Bitter-Sweet, Aromatic", price: "19$" },
                { name: "PLATEAU HEATWAVE", ing: "Tequila, Mango, Lime, Jalapeño, Ginger Beer", notes: "Tropical, Spicy, Refreshing", price: "16$" },
                { name: "TIRAMISU MARTINI", ing: "Vodka, cacao cream, coffee liqueur, vanilla, mascarpone", notes: "Velvety, Indulgent, Decadent", price: "18$" }
            ]
        },
        vin: {
            fr: [
                { section: "Vin Rouge" },
                { name: "Domaine du Rocheman Syrah (2018)", desc: "France", price: "11$ / 40$" },
                { name: "Chateau Bourgogne Pinot Noir (2022)", desc: "France", price: "13$ / 50$" },
                { name: "Brolio Ricasoli Chianti Classico (2023)", desc: "Italie", price: "15$ / 58$" },
                { name: "Albahra Envinate (2021)", desc: "Espagne", price: "13$ / 50$" },
                { name: "Spatburgunder Kabinett Trocken (2020)", desc: "Allemagne", price: "15$ / 58$" },
                { name: "Val Pedro Doaro (2016)", desc: "Portugal", price: "16$ / 62$" },
                
                { section: "Vin Blanc" },
                { name: "Chablis 1er Cru Chardonnay (2023)", desc: "France", price: "18$ / 68$" },
                { name: "Le Grand Ballon Sauvignon Blanc (2024)", desc: "France", price: "16$ / 60$" },
                { name: "Bourgogne Chardonnay (2025)", desc: "France", price: "15$ / 56$" },
                { name: "Santa Margherita Pinot Grigio (2024)", desc: "Italie", price: "11$ / 40$" },
                
                { section: "Vin Rosé" },
                { name: "Cotes des Roses Syrah (2022)", desc: "France", price: "13$ / 50$" },
                { name: "Miraval Provence (2024)", desc: "France", price: "15$ / 58$" },
                
                { section: "Vin Mousseux" },
                { name: "Chateau Moncontour Vouvray (2022)", desc: "France", price: "68$" },
                { name: "Viticoltori Prosecco (2024)", desc: "Italie", price: "11$ / 40$" },
                { name: "Sumarroca Cava (2021)", desc: "Espagne", price: "13$ / 50$" },
                
                { section: "Champagne" },
                { name: "Laurent-Perrier Champagne Brut (2020)", desc: "France", price: "150$" },
                
                { section: "Vin de Glace" },
                { name: "Pinnacle Harmonie (2019)", desc: "Canada", price: "13$ / 50$" }
            ],
            en: [
                { section: "Red Wine" },
                { name: "Domaine du Rocheman Syrah (2018)", desc: "France", price: "11$ / 40$" },
                { name: "Chateau Bourgogne Pinot Noir (2022)", desc: "France", price: "13$ / 50$" },
                { name: "Brolio Ricasoli Chianti Classico (2023)", desc: "Italy", price: "15$ / 58$" },
                { name: "Albahra Envinate (2021)", desc: "Spain", price: "13$ / 50$" },
                { name: "Spatburgunder Kabinett Trocken (2020)", desc: "Germany", price: "15$ / 58$" },
                { name: "Val Pedro Doaro (2016)", desc: "Portugal", price: "16$ / 62$" },
                
                { section: "White Wine" },
                { name: "Chablis 1er Cru Chardonnay (2023)", desc: "France", price: "18$ / 68$" },
                { name: "Le Grand Ballon Sauvignon Blanc (2024)", desc: "France", price: "16$ / 60$" },
                { name: "Bourgogne Chardonnay (2025)", desc: "France", price: "15$ / 56$" },
                { name: "Santa Margherita Pinot Grigio (2024)", desc: "Italy", price: "11$ / 40$" },
                
                { section: "Rosé Wine" },
                { name: "Cotes des Roses Syrah (2022)", desc: "France", price: "13$ / 50$" },
                { name: "Miraval Provence (2024)", desc: "France", price: "15$ / 58$" },
                
                { section: "Sparkling Wine" },
                { name: "Chateau Moncontour Vouvray (2022)", desc: "France", price: "68$" },
                { name: "Viticoltori Prosecco (2024)", desc: "Italy", price: "11$ / 40$" },
                { name: "Sumarroca Cava (2021)", desc: "Spain", price: "13$ / 50$" },
                
                { section: "Champagne" },
                { name: "Laurent-Perrier Champagne Brut (2020)", desc: "France", price: "150$" },
                
                { section: "Ice Wine" },
                { name: "Pinnacle Harmonie (2019)", desc: "Canada", price: "13$ / 50$" }
            ]
        },
        mocktails: {
            fr: [
                { name: "Soft Silk", ing: "Hibiscus, lime, soda", notes: "Sirop de rose", price: "12$" },
                { name: "Gossip Girl", ing: "Fruit de la passion, gingembre", notes: "Menthe fraîche", price: "12$" }
            ],
            en: [
                { name: "Soft Silk", ing: "Hibiscus, lime, soda", notes: "Rose syrup", price: "12$" },
                { name: "Gossip Girl", ing: "Passion fruit, ginger", notes: "Fresh mint", price: "12$" }
            ]
        }
    };

    function updateMenu(category) {
        menuGrid.innerHTML = '';
        const items = menuData[category][currentLang];
        items.forEach(item => {
            if (item.section) {
                const sectionHeader = document.createElement('div');
                sectionHeader.className = 'menu-section-header';
                sectionHeader.innerHTML = `<h3>${item.section}</h3>`;
                menuGrid.appendChild(sectionHeader);
            } else {
                const itemElement = document.createElement('div');
                itemElement.className = `menu-item ${category} reveal-fade`;
                
                if (category === 'cocktails' || category === 'mocktails') {
                    itemElement.innerHTML = `
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-ingredients">${item.ing}</div>
                            <div class="item-notes">${item.notes}</div>
                        </div>
                        <div class="item-price">${item.price}</div>
                    `;
                } else {
                    itemElement.innerHTML = `
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-desc">${item.desc}</div>
                        </div>
                        <div class="item-price">${item.price}</div>
                    `;
                }
                menuGrid.appendChild(itemElement);
            }
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateMenu(tab.dataset.category);
        });
    });

    // Simple Reveal Animation on Scroll (Fallback for dynamic elements)
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.event-card, .info-block').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // Initial menu load (only if on menu page)
    if (menuGrid) {
        updateMenu('cocktails');
    }
});
