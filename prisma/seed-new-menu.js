import prisma from '../src/lib/prisma.js';

async function seed() {
  console.log('Seeding new menu items from PDF...');

  const categories = await prisma.menuCategory.findMany();
  const catMap = {};
  categories.forEach(c => {
    catMap[c.slug] = c.id;
  });

  console.log('Found categories:', catMap);

  // Clear existing items in these categories to have a clean, up-to-date menu
  await prisma.menuItem.deleteMany({
    where: {
      categoryId: { in: Object.values(catMap) }
    }
  });

  const items = [
    // ── COCKTAILS SIGNATURES ──
    {
      categoryId: catMap['cocktails'],
      name_fr: 'Date Night',
      name_en: 'Date Night',
      ingredients_fr: 'Gin, Miel, Lavande, Pois Papillon, Lime',
      ingredients_en: 'Gin, Honey, Lavender, Butterfly Pea, Lime',
      notes_fr: 'Floral • Romantique • Métamorphose',
      notes_en: 'Floral • Romantic • Metamorphosis',
      price: '15',
      subcategory_fr: 'Créations Maison',
      subcategory_en: 'House Creations'
    },
    {
      categoryId: catMap['cocktails'],
      name_fr: 'The Ember Room',
      name_en: 'The Ember Room',
      ingredients_fr: 'Rye, Campari, Amaro Nonino, Chocolat',
      ingredients_en: 'Rye, Campari, Amaro Nonino, Chocolate',
      notes_fr: 'Fumé • Doux-amer • Aromatique',
      notes_en: 'Smoky • Bittersweet • Aromatic',
      price: '18',
      subcategory_fr: 'Créations Maison',
      subcategory_en: 'House Creations'
    },
    {
      categoryId: catMap['cocktails'],
      name_fr: 'Skittle Martini',
      name_en: 'Skittle Martini',
      ingredients_fr: 'Limoncello, Schnapps de Pêche, Vodka, Pomme, Grenadine, Lime',
      ingredients_en: 'Limoncello, Peach Schnapps, Vodka, Apple, Grenadine, Lime',
      notes_fr: 'Sucré • Électrique • Assumé',
      notes_en: 'Sweet • Electric • Bold',
      price: '16',
      subcategory_fr: 'Créations Maison',
      subcategory_en: 'House Creations'
    },
    {
      categoryId: catMap['cocktails'],
      name_fr: 'Plateau Heatwave',
      name_en: 'Plateau Heatwave',
      ingredients_fr: 'Tequila, Mangue, Lime, Jalapeño, Bière de Gingembre',
      ingredients_en: 'Tequila, Mango, Lime, Jalapeño, Ginger Beer',
      notes_fr: 'Tropical • Épicé • Rafraîchissant',
      notes_en: 'Tropical • Spicy • Refreshing',
      price: '19',
      subcategory_fr: 'Créations Maison',
      subcategory_en: 'House Creations'
    },
    {
      categoryId: catMap['cocktails'],
      name_fr: 'Tiramisu Martini',
      name_en: 'Tiramisu Martini',
      ingredients_fr: 'Vodka, Crème de Cacao, Liqueur de Café, Vanille, Mascarpone',
      ingredients_en: 'Vodka, Crème de Cacao, Coffee Liqueur, Vanilla, Mascarpone',
      notes_fr: 'Velouté • Gourmand • Décadent',
      notes_en: 'Velvety • Indulgent • Decadent',
      price: '14',
      subcategory_fr: 'Créations Maison',
      subcategory_en: 'House Creations'
    },

    // ── MOCKTAILS (SANS ALCOOL) ──
    {
      categoryId: catMap['mocktails'],
      name_fr: 'Nojito',
      name_en: 'Nojito',
      ingredients_fr: 'Menthe fraîche, lime pressée, sucre de canne, eau pétillante',
      ingredients_en: 'Fresh mint, squeezed lime, cane sugar, sparkling water',
      notes_fr: 'Frais & Désaltérant',
      notes_en: 'Crisp & Refreshing',
      price: '9',
      subcategory_fr: 'Sans Alcool',
      subcategory_en: 'Alcohol-Free'
    },
    {
      categoryId: catMap['mocktails'],
      name_fr: 'Date Night (Mocktail)',
      name_en: 'Date Night (Mocktail)',
      ingredients_fr: 'Distillat botanique sans alcool, miel, lavande, pois papillon, lime',
      ingredients_en: 'Non-alcoholic botanical blend, honey, lavender, butterfly pea, lime',
      notes_fr: 'Floral • Romantique • Métamorphose',
      notes_en: 'Floral • Romantic • Metamorphosis',
      price: '10',
      subcategory_fr: 'Sans Alcool',
      subcategory_en: 'Alcohol-Free'
    },
    {
      categoryId: catMap['mocktails'],
      name_fr: 'Skittle Martini (Mocktail)',
      name_en: 'Skittle Martini (Mocktail)',
      ingredients_fr: 'Agrumes, nectar de pêche, pomme, grenadine, lime',
      ingredients_en: 'Citrus blend, peach nectar, apple, grenadine, lime',
      notes_fr: 'Sucré • Électrique • Fruité',
      notes_en: 'Sweet • Electric • Fruity',
      price: '10',
      subcategory_fr: 'Sans Alcool',
      subcategory_en: 'Alcohol-Free'
    },
    {
      categoryId: catMap['mocktails'],
      name_fr: 'Plateau Heatwave (Mocktail)',
      name_en: 'Plateau Heatwave (Mocktail)',
      ingredients_fr: 'Mangue, lime, jalapeño, bière de gingembre artisanale',
      ingredients_en: 'Mango, lime, jalapeño, craft ginger beer',
      notes_fr: 'Tropical • Épicé • Rafraîchissant',
      notes_en: 'Tropical • Spicy • Refreshing',
      price: '10',
      subcategory_fr: 'Sans Alcool',
      subcategory_en: 'Alcohol-Free'
    },

    // ── VINS & BULLES ──
    {
      categoryId: catMap['wine'],
      name_fr: 'Côtes du Rhône, Syrah',
      name_en: 'Côtes du Rhône, Syrah',
      ingredients_fr: 'Vallée du Rhône, France',
      ingredients_en: 'Rhône Valley, France',
      notes_fr: 'Verre 13$ • Bouteille 50$',
      notes_en: 'Glass $13 • Bottle $50',
      price: '13 / 50',
      subcategory_fr: 'Vin Rouge',
      subcategory_en: 'Red Wine'
    },
    {
      categoryId: catMap['wine'],
      name_fr: 'Bourgogne, Pinot Noir',
      name_en: 'Bourgogne, Pinot Noir',
      ingredients_fr: 'Bourgogne, France',
      ingredients_en: 'Burgundy, France',
      notes_fr: 'Verre 15$ • Bouteille 58$',
      notes_en: 'Glass $15 • Bottle $58',
      price: '15 / 58',
      subcategory_fr: 'Vin Rouge',
      subcategory_en: 'Red Wine'
    },
    {
      categoryId: catMap['wine'],
      name_fr: 'Ser Lapo, Chianti Classico',
      name_en: 'Ser Lapo, Chianti Classico',
      ingredients_fr: 'Toscane, Italie',
      ingredients_en: 'Tuscany, Italy',
      notes_fr: 'Verre 17$ • Bouteille 62$',
      notes_en: 'Glass $17 • Bottle $62',
      price: '17 / 62',
      subcategory_fr: 'Vin Rouge',
      subcategory_en: 'Red Wine'
    },
    {
      categoryId: catMap['wine'],
      name_fr: 'Le Grand Ballon, Sauvignon Blanc',
      name_en: 'Le Grand Ballon, Sauvignon Blanc',
      ingredients_fr: 'Val de Loire, France',
      ingredients_en: 'Loire Valley, France',
      notes_fr: 'Verre 13$ • Bouteille 50$',
      notes_en: 'Glass $13 • Bottle $50',
      price: '13 / 50',
      subcategory_fr: 'Vin Blanc',
      subcategory_en: 'White Wine'
    },
    {
      categoryId: catMap['wine'],
      name_fr: 'Santa Margherita, Pinot Grigio',
      name_en: 'Santa Margherita, Pinot Grigio',
      ingredients_fr: 'Valdadige, Italie',
      ingredients_en: 'Valdadige, Italy',
      notes_fr: 'Verre 15$ • Bouteille 58$',
      notes_en: 'Glass $15 • Bottle $58',
      price: '15 / 58',
      subcategory_fr: 'Vin Blanc',
      subcategory_en: 'White Wine'
    },
    {
      categoryId: catMap['wine'],
      name_fr: 'La Chablisienne, Chablis',
      name_en: 'La Chablisienne, Chablis',
      ingredients_fr: 'Bourgogne, France',
      ingredients_en: 'Burgundy, France',
      notes_fr: 'Verre 18$ • Bouteille 68$',
      notes_en: 'Glass $18 • Bottle $68',
      price: '18 / 68',
      subcategory_fr: 'Vin Blanc',
      subcategory_en: 'White Wine'
    },
    {
      categoryId: catMap['wine'],
      name_fr: 'Sumarroca Gran Reserva, Brut',
      name_en: 'Sumarroca Gran Reserva, Brut',
      ingredients_fr: 'Cava, Penedès, Espagne',
      ingredients_en: 'Cava, Penedès, Spain',
      notes_fr: 'Verre 16$ • Bouteille 58$',
      notes_en: 'Glass $16 • Bottle $58',
      price: '16 / 58',
      subcategory_fr: 'Bulles & Champagne',
      subcategory_en: 'Sparkling & Champagne'
    },
    {
      categoryId: catMap['wine'],
      name_fr: 'Laurent-Perrier Champagne, Chardonnay',
      name_en: 'Laurent-Perrier Champagne, Chardonnay',
      ingredients_fr: 'Champagne, France — Bouteille prestige',
      ingredients_en: 'Champagne, France — Prestige bottle',
      notes_fr: 'Bouteille 150$',
      notes_en: 'Bottle $150',
      price: '150',
      subcategory_fr: 'Bulles & Champagne',
      subcategory_en: 'Sparkling & Champagne'
    },

    // ── BIÈRES PRESSION ──
    {
      categoryId: catMap['beer'],
      name_fr: 'Guinness',
      name_en: 'Guinness',
      ingredients_fr: 'Stout irlandaise crémeuse servie à l\'azote',
      ingredients_en: 'Creamy Irish dry stout served on nitrogen tap',
      notes_fr: 'Pinte',
      notes_en: 'Pint',
      price: '9',
      subcategory_fr: 'Bière Pression',
      subcategory_en: 'Draft Beer'
    },
    {
      categoryId: catMap['beer'],
      name_fr: 'Sapporo',
      name_en: 'Sapporo',
      ingredients_fr: 'Lager japonaise dorée, nette et rafraîchissante',
      ingredients_en: 'Crisp, golden Japanese lager',
      notes_fr: 'Pinte',
      notes_en: 'Pint',
      price: '9',
      subcategory_fr: 'Bière Pression',
      subcategory_en: 'Draft Beer'
    },
    {
      categoryId: catMap['beer'],
      name_fr: 'NEIPA, Unibroue',
      name_en: 'NEIPA, Unibroue',
      ingredients_fr: 'New England IPA québécoise aux arômes tropicaux',
      ingredients_en: 'Quebec NEIPA with lush tropical hop aromas',
      notes_fr: 'Pinte',
      notes_en: 'Pint',
      price: '9',
      subcategory_fr: 'Bière Pression',
      subcategory_en: 'Draft Beer'
    },
    {
      categoryId: catMap['beer'],
      name_fr: 'Cidre, Rabaska',
      name_en: 'Cider, Rabaska',
      ingredients_fr: 'Cidre artisanal québécois vivifiant',
      ingredients_en: 'Crisp artisanal Quebec cider',
      notes_fr: 'Pinte',
      notes_en: 'Pint',
      price: '9',
      subcategory_fr: 'Bière Pression',
      subcategory_en: 'Draft Beer'
    },

    // ── NOURRITURE (LA CUISINE SECRÈTE) ──
    // Pizzas
    {
      categoryId: catMap['food'],
      name_fr: 'Pizza au Pepperoni',
      name_en: 'Pepperoni Pizza',
      ingredients_fr: 'Pepperoni 100 % bœuf, mozzarella, sauce tomate maison',
      ingredients_en: 'All-beef pepperoni, mozza, homemade tomato sauce',
      price: '24',
      subcategory_fr: 'Pizzas Artisanales',
      subcategory_en: 'Artisanal Pizzas'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Pizza aux Trois Fromages',
      name_en: '3-Cheese Pizza',
      ingredients_fr: 'Mozza, cheddar blanc, Queen Elizabeth Bleu',
      ingredients_en: 'Mozza, white cheddar, Queen Elizabeth Bleu',
      price: '24',
      subcategory_fr: 'Pizzas Artisanales',
      subcategory_en: 'Artisanal Pizzas'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Pizza aux Truffes',
      name_en: 'Truffle Pizza',
      ingredients_fr: 'Sauce béchamel aux truffes maison, champignons des bois, mozzarella, roquette, parmesan, huile d\'olive',
      ingredients_en: 'Homemade truffle-bechamel sauce, wild mushrooms, mozza, arugula, parmesan, olive oil',
      price: '26',
      subcategory_fr: 'Pizzas Artisanales',
      subcategory_en: 'Artisanal Pizzas'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Pizza à la Burratina',
      name_en: 'Burratina Pizza',
      ingredients_fr: 'Sauce tomate maison, burratina, miel piquant, roquette, huile aux herbes',
      ingredients_en: 'Homemade tomato sauce, burratina, hot honey, arugula, herb oil',
      price: '26',
      subcategory_fr: 'Pizzas Artisanales',
      subcategory_en: 'Artisanal Pizzas'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Pizza au Prosciutto',
      name_en: 'Prosciutto Pizza',
      ingredients_fr: 'Sauce tomate maison, mozza, cheddar blanc affiné, prosciutto, roquette, huile au paprika, parmesan',
      ingredients_en: 'Homemade tomato sauce, mozza, aged white cheddar, prosciutto, arugula, paprika oil, parmesan',
      price: '25',
      subcategory_fr: 'Pizzas Artisanales',
      subcategory_en: 'Artisanal Pizzas'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Signature Magpie',
      name_en: 'Signature Magpie Pizza',
      ingredients_fr: 'Sauce tomate maison, mozzarella, cheddar blanc affiné, fromage bleu, prosciutto, échalotes confites, miel piquant',
      ingredients_en: 'Homemade tomato sauce, mozza, aged white cheddar, bleu cheese, prosciutto, confit shallots, hot honey',
      price: '28',
      subcategory_fr: 'Pizzas Artisanales',
      subcategory_en: 'Artisanal Pizzas'
    },

    // Collations
    {
      categoryId: catMap['food'],
      name_fr: 'Olives Marinées',
      name_en: 'Marinated Olives',
      ingredients_fr: 'Orange, romarin, piments de Calabre, ail',
      ingredients_en: 'Orange, rosemary, Calabrian chili, garlic',
      price: '8',
      subcategory_fr: 'Collations',
      subcategory_en: 'Bar Snacks'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Mélange de Noix Épicées',
      name_en: 'Spiced Nut Mix',
      ingredients_fr: 'Herbes, poivre de Cayenne, cassonade brune',
      ingredients_en: 'Herbs, cayenne pepper, brown sugar',
      price: '7',
      subcategory_fr: 'Collations',
      subcategory_en: 'Bar Snacks'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Frites Coupées à la Main',
      name_en: 'Hand-Cut Fries',
      ingredients_fr: 'Pommes de terre fraîches, sel de mer, aïoli maison',
      ingredients_en: 'Fresh hand-cut potatoes, sea salt, house aioli',
      price: '9',
      subcategory_fr: 'Collations',
      subcategory_en: 'Bar Snacks'
    },

    // Entrées
    {
      categoryId: catMap['food'],
      name_fr: 'Tartare de Saumon',
      name_en: 'Salmon Tartare',
      ingredients_fr: 'Cornichons maison, pommes pailles, mayonnaise épicée avec frites et croûtons',
      ingredients_en: 'House pickles, straw potatoes, spicy mayo, served with fries and croutons',
      notes_fr: 'Entrée 21$ • Repas 35$',
      notes_en: 'Appetizer $21 • Main $35',
      price: '21 / 35',
      subcategory_fr: 'Entrées',
      subcategory_en: 'Appetizers'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Frites à la Truffe',
      name_en: 'Truffle Fries',
      ingredients_fr: 'Frites coupées à la main, béchamel, truffe, échalotes confites, parmesan',
      ingredients_en: 'Hand-cut fries, bechamel, truffle, confit shallots, parmesan',
      price: '16',
      subcategory_fr: 'Entrées',
      subcategory_en: 'Appetizers'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Burratina',
      name_en: 'Burratina',
      ingredients_fr: 'Tomates anciennes, vinaigre de xérès, pain maison',
      ingredients_en: 'Heirloom tomatoes, sherry vinegar, homemade bread',
      price: '22',
      subcategory_fr: 'Entrées',
      subcategory_en: 'Appetizers'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Arancini au Fromage Fumé',
      name_en: 'Smoked Cheese Arancini',
      ingredients_fr: 'Thym, vin blanc, caciocavallo, parmesan, aïoli aux herbes, fumée de hickory, tomates cerises confites au miel',
      ingredients_en: 'Thyme, white wine, caciocavallo, parmesan, herb aioli, hickory smoke, honey-confit cherry tomatoes',
      price: '18',
      subcategory_fr: 'Entrées',
      subcategory_en: 'Appetizers'
    },

    // Plats Principaux
    {
      categoryId: catMap['food'],
      name_fr: 'Agneau à la Scottadito',
      name_en: 'Lamb Scottadito',
      ingredients_fr: 'Côtes d\'agneau cuites à point et servies avec un pesto à la menthe',
      ingredients_en: 'Lamb chops cooked to perfection and served with mint pesto',
      notes_fr: 'Menu Dégustation : +7$',
      notes_en: 'Tasting Menu : +$7',
      price: '26',
      subcategory_fr: 'Plats Principaux',
      subcategory_en: 'Main Courses'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Salade César aux Crevettes Grillées',
      name_en: 'Grilled Shrimp Caesar Salad',
      ingredients_fr: 'Cœurs de romaine, sauce César maison, anchois marinés, prosciutto croustillant, croûtons maison, parmigiano-reggiano',
      ingredients_en: 'Romaine hearts, house Caesar dressing, marinated anchovies, crispy prosciutto, croutons, parmigiano-reggiano',
      price: '32',
      subcategory_fr: 'Plats Principaux',
      subcategory_en: 'Main Courses'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Risotto aux Truffes',
      name_en: 'Truffle Risotto',
      ingredients_fr: 'Vin blanc, thym, truffes et champignons des bois, roquette, parmesan, huile aux herbes',
      ingredients_en: 'White wine, thyme, truffle and wild mushrooms, arugula, parmesan, herb oil',
      price: '28',
      subcategory_fr: 'Plats Principaux',
      subcategory_en: 'Main Courses'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Steak-Frites',
      name_en: 'Steak Frites',
      ingredients_fr: 'Contrefilet vieilli sur place, frites maison, sauce au poivre vert. Cuisson recommandée : medium saignant',
      ingredients_en: 'Dry-aged striploin, hand-cut fries, green peppercorn sauce. Recommended: medium rare',
      notes_fr: 'Menu Dégustation : +16$',
      notes_en: 'Tasting Menu : +$16',
      price: '50',
      subcategory_fr: 'Plats Principaux',
      subcategory_en: 'Main Courses'
    },

    // Desserts
    {
      categoryId: catMap['food'],
      name_fr: 'Gâteau au Fromage',
      name_en: 'Cheesecake',
      ingredients_fr: 'Coulis de fruits frais et chocolat blanc',
      ingredients_en: 'Fresh fruit coulis and white chocolate',
      notes_fr: 'Menu Dégustation : +2$',
      notes_en: 'Tasting Menu : +$2',
      price: '12',
      subcategory_fr: 'Desserts',
      subcategory_en: 'Desserts'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Crème Brûlée',
      name_en: 'Crème Brûlée',
      ingredients_fr: 'Vanille de Madagascar et sucre caramélisé',
      ingredients_en: 'Madagascar vanilla and caramelized crust',
      price: '11',
      subcategory_fr: 'Desserts',
      subcategory_en: 'Desserts'
    },
    {
      categoryId: catMap['food'],
      name_fr: 'Tiramisu',
      name_en: 'Tiramisu',
      ingredients_fr: 'Biscuits savoiardi, mascarpone onctueux, espresso italien, cacao',
      ingredients_en: 'Savoiardi ladyfingers, rich mascarpone, Italian espresso, cocoa',
      price: '9',
      subcategory_fr: 'Desserts',
      subcategory_en: 'Desserts'
    },

    // Menu Dégustation
    {
      categoryId: catMap['food'],
      name_fr: 'Menu Dégustation 3 Services',
      name_en: '3-Course Tasting Menu',
      ingredients_fr: 'Une entrée au choix, un plat principal au choix, et un dessert au choix parmi notre carte',
      ingredients_en: 'Choice of one appetizer, one main course, and one dessert from our menu',
      notes_fr: '59$ par personne pour une expérience gastronomique complète',
      notes_en: '$59 per guest for the full dining experience',
      price: '59',
      subcategory_fr: 'Expérience Dégustation',
      subcategory_en: 'Tasting Experience'
    }
  ];

  console.log(`Inserting ${items.length} menu items...`);
  await prisma.menuItem.createMany({
    data: items
  });

  console.log('✅ Menu seeded successfully!');
}

seed()
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
