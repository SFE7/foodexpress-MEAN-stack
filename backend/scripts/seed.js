/**
 * FILE: backend/scripts/seed.js
 * ROLE: Database sample-data script.
 * USED BY / TALKS TO: Run manually with Node.
 * KEY IDEA: Seed data resets demo records safely.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const Dish = require('../models/Dish');
const Order = require('../models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodexpress';

function roundAmount(value) {
  return Math.round(value * 1000) / 1000;
}

function buildOrderPayload({ client, restaurant, items, adresseLivraison, modePaiement, statut, remarque, createdAt }) {
  const articles = items.map(({ dish, quantite }) => ({
    plat: dish._id,
    nom: dish.nom,
    quantite,
    prixUnitaire: dish.prix,
  }));
  const sousTotal = roundAmount(articles.reduce((sum, item) => sum + item.quantite * item.prixUnitaire, 0));
  const fraisLivraison = restaurant.fraisLivraison;
  const total = roundAmount(sousTotal + fraisLivraison);

  return {
    client: client._id,
    restaurant: restaurant._id,
    articles,
    adresseLivraison,
    sousTotal,
    fraisLivraison,
    total,
    modePaiement,
    statut,
    remarque: remarque || '',
    createdAt,
    updatedAt: createdAt,
  };
}

async function seed() {
  console.log(`Connecting to MongoDB (${MONGO_URI})...`);
  await mongoose.connect(MONGO_URI, { dbName: 'foodexpress' });
  console.log(`Connected to database: ${mongoose.connection.name}`);

  // 1. Clear existing data
  await Promise.all([
    Order.deleteMany({}),
    Dish.deleteMany({}),
    Category.deleteMany({}),
    Restaurant.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('Cleared existing collections.');

  // 2. Users (1 admin, 2 restaurateurs, 3 clients) - passwords hashed via User pre-save hook
  const admin = await User.create({
    nom: 'Admin',
    prenom: 'FoodExpress',
    email: 'admin@foodexpress.tn',
    telephone: '+216 71 000 001',
    password: 'Admin123!',
    role: 'admin',
    isActive: true,
  });

  const [restaurateur1, restaurateur2] = await Promise.all([
    User.create({
      nom: 'Ben Ali',
      prenom: 'Karim',
      email: 'karim@foodexpress.tn',
      telephone: '+216 22 345 678',
      password: 'Test1234!',
      role: 'restaurateur',
      isActive: true,
    }),
    User.create({
      nom: 'Trabelsi',
      prenom: 'Salma',
      email: 'salma@foodexpress.tn',
      telephone: '+216 55 876 543',
      password: 'Test1234!',
      role: 'restaurateur',
      isActive: true,
    }),
  ]);

  const [client1, client2, client3] = await Promise.all([
    User.create({
      nom: 'Gharbi',
      prenom: 'Ines',
      email: 'ines@foodexpress.tn',
      telephone: '+216 20 111 222',
      password: 'Test1234!',
      role: 'client',
      isActive: true,
    }),
    User.create({
      nom: 'Mansouri',
      prenom: 'Yassine',
      email: 'yassine@foodexpress.tn',
      telephone: '+216 21 333 444',
      password: 'Test1234!',
      role: 'client',
      isActive: true,
    }),
    User.create({
      nom: 'Bouazizi',
      prenom: 'Amine',
      email: 'amine@foodexpress.tn',
      telephone: '+216 98 555 666',
      password: 'Test1234!',
      role: 'client',
      isActive: true,
    }),
  ]);

  // 3. General cuisine categories (restaurant: null)
  await Category.insertMany([
    { nom: 'Pizza', description: 'Pizzas au feu de bois et classiques', restaurant: null },
    { nom: 'Fast-food', description: 'Burgers, tacos et sandwichs rapides', restaurant: null },
    { nom: 'Tunisien', description: 'Cuisine tunisienne authentique', restaurant: null },
    { nom: 'Italien', description: 'Pates fraiches, pizzas et tiramisu', restaurant: null },
  ]);

  // 4. Restaurants (4 validated + 1 pending)
  const [pizzaHouse, burgerSpot, darTounsi, bellaNapoli, tacosExpress] = await Restaurant.insertMany([
    {
      nom: 'Pizza House',
      description: 'Pizzas artisanales cuites au feu de bois et pates fraiches italiennes.',
      adresse: '14 Avenue Habib Bourguiba, Tunis',
      typeCuisine: 'Italien',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      fraisLivraison: 3.5,
      horaires: '11:00 - 23:30',
      isOpen: true,
      status: 'validated',
      owner: restaurateur1._id,
    },
    {
      nom: 'Burger Spot',
      description: 'Smash burgers gourmets, frites maison et milkshakes frais.',
      adresse: '8 Rue du Lac Windermere, Les Berges du Lac, Tunis',
      typeCuisine: 'Fast-food',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      fraisLivraison: 4,
      horaires: '11:30 - 00:00',
      isOpen: true,
      status: 'validated',
      owner: restaurateur2._id,
    },
    {
      nom: 'Dar Tounsi',
      description: 'Saveurs tunisiennes traditionnelles : couscous, lablabi, ojja et bricks croustillants.',
      adresse: '25 Avenue de Carthage, La Marsa',
      typeCuisine: 'Tunisien',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
      fraisLivraison: 3,
      horaires: '10:30 - 22:30',
      isOpen: true,
      status: 'validated',
      owner: restaurateur2._id,
    },
    {
      nom: 'Bella Napoli',
      description: 'Veritable pizza napolitaine a pate fermentee 48h et burrata fraiche.',
      adresse: '5 Rue de la Liberte, Sousse',
      typeCuisine: 'Pizza',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
      fraisLivraison: 4.5,
      horaires: '12:00 - 23:00',
      isOpen: true,
      status: 'validated',
      owner: restaurateur1._id,
    },
    {
      nom: 'Tacos Express',
      description: 'Tacos gratinés et sandwichs generosos prepares a la commande.',
      adresse: '31 Avenue Jean Jaures, Tunis',
      typeCuisine: 'Fast-food',
      image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=80',
      fraisLivraison: 3,
      horaires: '11:00 - 23:00',
      isOpen: true,
      status: 'pending',
      owner: restaurateur1._id,
    },
  ]);

  // 5. Per-restaurant categories
  const [
    phEntrees,
    phPizzas,
    phDesserts,
    phBoissons,
    bsEntrees,
    bsSandwichs,
    bsDesserts,
    bsBoissons,
    dtEntrees,
    dtPlats,
    dtDesserts,
    dtBoissons,
    bnPizzas,
    bnPlats,
    bnBoissons,
    teSandwichs,
  ] = await Category.insertMany([
    { nom: 'Entrees', description: 'Antipasti et salades fraiches', restaurant: pizzaHouse._id },
    { nom: 'Pizzas', description: 'Pizzas cuites au four a pierre', restaurant: pizzaHouse._id },
    { nom: 'Desserts', description: 'Douceurs italiennes maison', restaurant: pizzaHouse._id },
    { nom: 'Boissons', description: 'Sodas, eaux et jus frais', restaurant: pizzaHouse._id },

    { nom: 'Entrees', description: 'Starters croustillants', restaurant: burgerSpot._id },
    { nom: 'Sandwichs', description: 'Burgers et sandwichs signatures', restaurant: burgerSpot._id },
    { nom: 'Desserts', description: 'Brownies et cookies', restaurant: burgerSpot._id },
    { nom: 'Boissons', description: 'Boissons fraiches et milkshakes', restaurant: burgerSpot._id },

    { nom: 'Entrees', description: 'Salades et bricks tunisiens', restaurant: darTounsi._id },
    { nom: 'Plats principaux', description: 'Plats traditionnels mijotes', restaurant: darTounsi._id },
    { nom: 'Desserts', description: 'Patisseries orientales', restaurant: darTounsi._id },
    { nom: 'Boissons', description: 'Citronnade et the a la menthe', restaurant: darTounsi._id },

    { nom: 'Pizzas', description: 'Pizzas napolitaines', restaurant: bellaNapoli._id },
    { nom: 'Plats principaux', description: 'Pates et lasagnes', restaurant: bellaNapoli._id },
    { nom: 'Boissons', description: 'Boissons italiennes', restaurant: bellaNapoli._id },

    { nom: 'Sandwichs', description: 'Tacos et wraps', restaurant: tacosExpress._id },
  ]);

  // 6. Dishes (19 dishes in DT, including unavailable ones)
  const dishes = await Dish.insertMany([
    // Pizza House (5)
    {
      nom: 'Pizza Margherita',
      description: 'Sauce tomate San Marzano, mozzarella fior di latte et basilic frais.',
      prix: 16.5,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: phPizzas._id,
      restaurant: pizzaHouse._id,
    },
    {
      nom: 'Pizza 4 Fromages',
      description: 'Mozzarella, gorgonzola, parmesan et chevre fondant.',
      prix: 21.0,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: phPizzas._id,
      restaurant: pizzaHouse._id,
    },
    {
      nom: 'Bruschetta Tomate Basilic',
      description: 'Pain grille a l ail, tomates cerises marinees et huile d olive.',
      prix: 8.5,
      image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: phEntrees._id,
      restaurant: pizzaHouse._id,
    },
    {
      nom: 'Tiramisu Classique',
      description: 'Mascarpone onctueux, biscuits imbibes au cafe expresso.',
      prix: 9.0,
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
      disponible: false,
      categorie: phDesserts._id,
      restaurant: pizzaHouse._id,
    },
    {
      nom: 'Limonade Italienne',
      description: 'Citron frais petillant et menthe.',
      prix: 4.5,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: phBoissons._id,
      restaurant: pizzaHouse._id,
    },

    // Burger Spot (5)
    {
      nom: 'Double Smash Burger',
      description: 'Double steak hache grille, cheddar affine, pickles et sauce maison.',
      prix: 18.0,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: bsSandwichs._id,
      restaurant: burgerSpot._id,
    },
    {
      nom: 'Crispy Chicken Burger',
      description: 'Filet de poulet pane croustillant, salade iceberg et sauce miel moutarde.',
      prix: 15.5,
      image: 'https://images.unsplash.com/photo-1615557960916-5f4791effe9d?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: bsSandwichs._id,
      restaurant: burgerSpot._id,
    },
    {
      nom: 'Onion Rings & Sauce BBQ',
      description: 'Rondelles d oignon croustillantes servies avec sauce barbecue fumee.',
      prix: 7.5,
      image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: bsEntrees._id,
      restaurant: burgerSpot._id,
    },
    {
      nom: 'Brownie Chocolat Noir',
      description: 'Coeur fondant aux eclats de noisettes.',
      prix: 8.0,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
      disponible: false,
      categorie: bsDesserts._id,
      restaurant: burgerSpot._id,
    },
    {
      nom: 'Milkshake Vanille',
      description: 'Glace vanille Bourbon mixee avec lait frais et chantilly.',
      prix: 7.0,
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: bsBoissons._id,
      restaurant: burgerSpot._id,
    },

    // Dar Tounsi (5)
    {
      nom: 'Brik a l Oeuf & Thon',
      description: 'Feuille de malsouka croustillante farcie au thon, persil, capres et oeuf.',
      prix: 5.5,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: dtEntrees._id,
      restaurant: darTounsi._id,
    },
    {
      nom: 'Couscous Royal Agneau',
      description: 'Semoule fine, gigot d agneau tendre, pois chiches et legumes de saison.',
      prix: 24.0,
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: dtPlats._id,
      restaurant: darTounsi._id,
    },
    {
      nom: 'Ojja Merguez',
      description: 'Sauce tomate relevee aux epices tunisiennes, merguez grillees et oeufs.',
      prix: 16.0,
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: dtPlats._id,
      restaurant: darTounsi._id,
    },
    {
      nom: 'Makroudh aux Dattes',
      description: 'Patisserie traditionnelle aux dattes deglet nour et miel.',
      prix: 6.5,
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: dtDesserts._id,
      restaurant: darTounsi._id,
    },
    {
      nom: 'Citronnade Maison',
      description: 'Citronnade fraiche pressee du jour.',
      prix: 4.0,
      image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: dtBoissons._id,
      restaurant: darTounsi._id,
    },

    // Bella Napoli (3)
    {
      nom: 'Pizza Burrata & Roquette',
      description: 'Tomates concassees, burrata cremeuse entiere et roquette fraiche.',
      prix: 23.5,
      image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: bnPizzas._id,
      restaurant: bellaNapoli._id,
    },
    {
      nom: 'Lasagnes Bolognaise',
      description: 'Couches de pates fraiches, ragout de boeuf mijote et bechamel gratinee.',
      prix: 19.5,
      image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: bnPlats._id,
      restaurant: bellaNapoli._id,
    },
    {
      nom: 'Eau Minerale Petillante',
      description: 'Bouteille 50cl bien fraiche.',
      prix: 3.0,
      image: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=600&auto=format&fit=crop&q=80',
      disponible: false,
      categorie: bnBoissons._id,
      restaurant: bellaNapoli._id,
    },

    // Tacos Express (1)
    {
      nom: 'Tacos Poulet Marine',
      description: 'Galette garnie de poulet marine, frites et sauce fromagere.',
      prix: 13.0,
      image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&auto=format&fit=crop&q=80',
      disponible: true,
      categorie: teSandwichs._id,
      restaurant: tacosExpress._id,
    },
  ]);

  const [
    margherita,
    quatreFromages,
    bruschetta,
    ,
    limonade,
    doubleSmash,
    crispyChicken,
    onionRings,
    ,
    milkshake,
    brik,
    couscous,
    ojja,
    makroudh,
    citronnade,
    burrataPizza,
    lasagnes,
  ] = dishes;

  // 7. Orders (10 orders covering all 6 statuses)
  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);

  await Order.insertMany([
    buildOrderPayload({
      client: client1,
      restaurant: pizzaHouse,
      items: [
        { dish: margherita, quantite: 2 },
        { dish: limonade, quantite: 2 },
      ],
      adresseLivraison: '12 Rue de Palestine, Tunis',
      modePaiement: 'livraison',
      statut: 'en_attente',
      remarque: 'Bien chaude svp',
      createdAt: hoursAgo(0.5),
    }),
    buildOrderPayload({
      client: client2,
      restaurant: burgerSpot,
      items: [
        { dish: doubleSmash, quantite: 2 },
        { dish: onionRings, quantite: 1 },
        { dish: milkshake, quantite: 2 },
      ],
      adresseLivraison: '44 Avenue de la Liberte, Tunis',
      modePaiement: 'en_ligne',
      statut: 'en_attente',
      remarque: 'Sans oignons dans un burger',
      createdAt: hoursAgo(1),
    }),
    buildOrderPayload({
      client: client3,
      restaurant: darTounsi,
      items: [
        { dish: couscous, quantite: 2 },
        { dish: brik, quantite: 2 },
        { dish: citronnade, quantite: 2 },
      ],
      adresseLivraison: '9 Impasse des Jasmins, La Marsa',
      modePaiement: 'livraison',
      statut: 'acceptee',
      createdAt: hoursAgo(2),
    }),
    buildOrderPayload({
      client: client1,
      restaurant: pizzaHouse,
      items: [
        { dish: quatreFromages, quantite: 1 },
        { dish: bruschetta, quantite: 2 },
      ],
      adresseLivraison: '12 Rue de Palestine, Tunis',
      modePaiement: 'en_ligne',
      statut: 'acceptee',
      createdAt: hoursAgo(3),
    }),
    buildOrderPayload({
      client: client2,
      restaurant: bellaNapoli,
      items: [
        { dish: burrataPizza, quantite: 2 },
        { dish: lasagnes, quantite: 1 },
      ],
      adresseLivraison: '18 Boulevard 14 Janvier, Sousse',
      modePaiement: 'livraison',
      statut: 'en_preparation',
      createdAt: hoursAgo(4),
    }),
    buildOrderPayload({
      client: client3,
      restaurant: burgerSpot,
      items: [
        { dish: crispyChicken, quantite: 3 },
        { dish: milkshake, quantite: 1 },
      ],
      adresseLivraison: '7 Rue du Lac Toba, Les Berges du Lac',
      modePaiement: 'en_ligne',
      statut: 'en_livraison',
      createdAt: hoursAgo(6),
    }),
    buildOrderPayload({
      client: client1,
      restaurant: pizzaHouse,
      items: [
        { dish: margherita, quantite: 3 },
        { dish: quatreFromages, quantite: 1 },
      ],
      adresseLivraison: '12 Rue de Palestine, Tunis',
      modePaiement: 'livraison',
      statut: 'livree',
      createdAt: hoursAgo(20),
    }),
    buildOrderPayload({
      client: client2,
      restaurant: darTounsi,
      items: [
        { dish: ojja, quantite: 2 },
        { dish: makroudh, quantite: 2 },
      ],
      adresseLivraison: '44 Avenue de la Liberte, Tunis',
      modePaiement: 'livraison',
      statut: 'livree',
      createdAt: hoursAgo(30),
    }),
    buildOrderPayload({
      client: client3,
      restaurant: burgerSpot,
      items: [{ dish: doubleSmash, quantite: 1 }],
      adresseLivraison: '7 Rue du Lac Toba, Les Berges du Lac',
      modePaiement: 'en_ligne',
      statut: 'livree',
      createdAt: hoursAgo(48),
    }),
    buildOrderPayload({
      client: client1,
      restaurant: darTounsi,
      items: [{ dish: couscous, quantite: 1 }],
      adresseLivraison: '12 Rue de Palestine, Tunis',
      modePaiement: 'livraison',
      statut: 'annulee',
      remarque: 'Client indisponible',
      createdAt: hoursAgo(72),
    }),
  ]);

  console.log('\nSeed completed successfully!');
  console.log(`- Users: 6 (1 admin, 2 restaurateurs, 3 clients)`);
  console.log(`- Categories: ${await Category.countDocuments()} (4 general + 16 per-restaurant)`);
  console.log(`- Restaurants: ${await Restaurant.countDocuments()} (4 validated, 1 pending)`);
  console.log(`- Dishes: ${await Dish.countDocuments()}`);
  console.log(`- Orders: ${await Order.countDocuments()}`);

  console.log('\n=== Test Credentials ===');
  console.log(`Admin        : ${admin.email} / Admin123!`);
  console.log(`Restaurateur1: ${restaurateur1.email} / Test1234! (owns Pizza House, Bella Napoli, Tacos Express [pending])`);
  console.log(`Restaurateur2: ${restaurateur2.email} / Test1234! (owns Burger Spot, Dar Tounsi)`);
  console.log(`Client 1     : ${client1.email} / Test1234!`);
  console.log(`Client 2     : ${client2.email} / Test1234!`);
  console.log(`Client 3     : ${client3.email} / Test1234!`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }
  process.exit(1);
});
