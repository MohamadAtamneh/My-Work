/**
 * Seed the Firestore `products` collection with example catalog data.
 *
 * Usage:  npm run seed
 *
 * Idempotent — products whose name already exists are skipped, so it is safe
 * to run multiple times. `createdAt` is staggered so the New Arrivals view
 * (newest first, "NEW" badge on items < 14 days old) is meaningful.
 */
import { db } from './config/firebase';

interface SeedProduct {
  name: string;
  price: number;
  image: string;
  /** Computed from GALLERIES at seed time — not defined inline per product. */
  images?: string[];
  sizes: string[];
  category: string;
  description: string;
  stock: number;
  createdAt: string;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

// Stable Unsplash CDN URLs (fashion/apparel product shots).
const img = (id: string) => `https://images.unsplash.com/${id}?q=80&w=800&auto=format&fit=crop`;

// Multi-angle galleries per product (photo IDs; first ID = the main angle,
// matching the product's `image` field). Existing products in the database
// get these added as their `images` array when the seed runs.
const GALLERIES: Record<string, string[]> = {
  'Essential Cotton Tee': [
    'photo-1521572163474-6864f9cf17ab',
    'photo-1620799140408-edc6dcb6d633',
    'photo-1618354691373-d851c5c3a990',
  ],
  'Slim-Fit Selvedge Jeans': [
    'photo-1542272604-787c3835535d',
    'photo-1541099649105-f69ad21f3246',
    'photo-1582418702059-97ebafb35d09',
  ],
  'Linen Button-Down Shirt': [
    'photo-1596755094514-f87e34085b2c',
    'photo-1602810318383-e386cc2a3ccf',
    'photo-1598033129183-c4f50c736f10',
  ],
  'Wool-Blend Overcoat': [
    'photo-1591047139829-d91aecb6caea',
    'photo-1544022613-e87ca75a784a',
    'photo-1520975954732-35dd22299614',
  ],
  'Silk Slip Dress': [
    'photo-1595777457583-95e059d581b8',
    'photo-1496747611176-843222e1e57c',
    'photo-1572804013309-59a88b7e92f1',
  ],
  'Cashmere Crew Sweater': [
    'photo-1576871337622-98d48d1cf531',
    'photo-1434389677669-e08b4cac3105',
    'photo-1445205170230-053b83016050',
  ],
  'Pleated Wide-Leg Trousers': [
    'photo-1594633312681-425c7b97ccd1',
    'photo-1583496661160-fb5886a13d44',
    'photo-1509631179647-0177331693ae',
  ],
  'Belted Trench Coat': [
    'photo-1539533018447-63fcce2678e3',
    'photo-1525507119028-ed4c629a60a3',
    'photo-1490481651871-ab68de25d43d',
  ],
  'Retro Runner Sneakers': [
    'photo-1549298916-b41d501d3772',
    'photo-1595950653106-6c9ebd614d3a',
    'photo-1560343090-f0409e92791a',
  ],
  'Minimal White Sneakers': [
    'photo-1600185365483-26d7a4cc7519',
    'photo-1600269452121-4f2416e55c28',
    'photo-1608231387042-66d1773070a5',
  ],
  'Leather Heeled Sandals': [
    'photo-1543163521-1bf539c55dd2',
    'photo-1520639888713-7851133b1ed0',
  ],
  'Leather Tote Bag': [
    'photo-1548036328-c9fa89d128fa',
    'photo-1584917865442-de89df76afd3',
    'photo-1591561954557-26941169b49e',
  ],
  'Aviator Sunglasses': [
    'photo-1572635196237-14b3f281503f',
    'photo-1511499767150-a48a237f0083',
    'photo-1508296695146-257a814070b4',
  ],
  'Classic Chronograph Watch': [
    'photo-1524805444758-089113d48a6d',
    'photo-1524592094714-0f0654e20314',
    'photo-1522312346375-d1a52e2b99b3',
  ],
};

const PRODUCTS: SeedProduct[] = [
  // ── Men ──────────────────────────────────────────────────────────────────
  {
    name: 'Essential Cotton Tee',
    price: 45,
    image: img('photo-1521572163474-6864f9cf17ab'),
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    category: 'men',
    description:
      'A wardrobe cornerstone cut from heavyweight organic cotton. Pre-washed for a broken-in feel with a clean, tailored drape.',
    stock: 40,
    createdAt: daysAgo(1),
  },
  {
    name: 'Slim-Fit Selvedge Jeans',
    price: 120,
    image: img('photo-1542272604-787c3835535d'),
    sizes: ['28', '30', '32', '34', '36'],
    category: 'men',
    description:
      'Japanese selvedge denim in a modern slim fit. Rigid at first, moulds to you with every wear — fades that tell your story.',
    stock: 25,
    createdAt: daysAgo(3),
  },
  {
    name: 'Linen Button-Down Shirt',
    price: 95,
    image: img('photo-1596755094514-f87e34085b2c'),
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'men',
    description:
      'Breathable European linen with a relaxed collar. The shirt you reach for from the first warm day to the last.',
    stock: 18,
    createdAt: daysAgo(9),
  },
  {
    name: 'Wool-Blend Overcoat',
    price: 260,
    image: img('photo-1591047139829-d91aecb6caea'),
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'men',
    description:
      'A sharply tailored overcoat in an Italian wool blend. Fully lined, cut to layer cleanly over knitwear all winter.',
    stock: 10,
    createdAt: daysAgo(21),
  },

  // ── Women ────────────────────────────────────────────────────────────────
  {
    name: 'Silk Slip Dress',
    price: 180,
    image: img('photo-1595777457583-95e059d581b8'),
    sizes: ['XS', 'S', 'M', 'L'],
    category: 'women',
    description:
      'Bias-cut mulberry silk that moves like water. Adjustable straps and a midi length — evening elegance, daytime ease.',
    stock: 15,
    createdAt: daysAgo(2),
  },
  {
    name: 'Cashmere Crew Sweater',
    price: 150,
    image: img('photo-1576871337622-98d48d1cf531'),
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    category: 'women',
    description:
      'Grade-A Mongolian cashmere, knitted for a featherweight feel with serious warmth. A forever piece in a timeless cut.',
    stock: 22,
    createdAt: daysAgo(5),
  },
  {
    name: 'Pleated Wide-Leg Trousers',
    price: 110,
    image: img('photo-1594633312681-425c7b97ccd1'),
    sizes: ['XS', 'S', 'M', 'L'],
    category: 'women',
    description:
      'High-rise, wide-leg trousers with sharp front pleats. Fluid crepe fabric that drapes beautifully from desk to dinner.',
    stock: 14,
    createdAt: daysAgo(12),
  },
  {
    name: 'Belted Trench Coat',
    price: 240,
    image: img('photo-1539533018447-63fcce2678e3'),
    sizes: ['XS', 'S', 'M', 'L'],
    category: 'women',
    description:
      'The definitive trench — water-resistant cotton gabardine, horn buttons, and a waist-defining belt. Iconic, seasonless.',
    stock: 9,
    createdAt: daysAgo(26),
  },

  // ── Footwear ─────────────────────────────────────────────────────────────
  {
    name: 'Retro Runner Sneakers',
    price: 140,
    image: img('photo-1549298916-b41d501d3772'),
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    category: 'footwear',
    description:
      'Vintage-inspired runners with a cushioned EVA midsole and suede overlays. All-day comfort with throwback attitude.',
    stock: 20,
    createdAt: daysAgo(4),
  },
  {
    name: 'Minimal White Sneakers',
    price: 125,
    image: img('photo-1600185365483-26d7a4cc7519'),
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    category: 'footwear',
    description:
      'Full-grain leather uppers on a clean cupsole. No logos, no noise — the minimalist sneaker that goes with everything.',
    stock: 24,
    createdAt: daysAgo(8),
  },
  {
    name: 'Leather Heeled Sandals',
    price: 160,
    image: img('photo-1543163521-1bf539c55dd2'),
    sizes: ['36', '37', '38', '39', '40', '41'],
    category: 'footwear',
    description:
      'Sculptural block heel and buttery leather straps. Comfortable enough for hours, elegant enough for any occasion.',
    stock: 11,
    createdAt: daysAgo(17),
  },

  // ── Accessories ──────────────────────────────────────────────────────────
  {
    name: 'Leather Tote Bag',
    price: 175,
    image: img('photo-1548036328-c9fa89d128fa'),
    sizes: ['One Size'],
    category: 'accessories',
    description:
      'Vegetable-tanned leather that develops a rich patina. Fits a 14" laptop, with a suede-lined interior pocket.',
    stock: 12,
    createdAt: daysAgo(6),
  },
  {
    name: 'Aviator Sunglasses',
    price: 130,
    image: img('photo-1572635196237-14b3f281503f'),
    sizes: ['One Size'],
    category: 'accessories',
    description:
      'Classic aviator frames with polarised lenses and 100% UV protection. Lightweight metal build, timeless silhouette.',
    stock: 30,
    createdAt: daysAgo(11),
  },
  {
    name: 'Classic Chronograph Watch',
    price: 220,
    image: img('photo-1524805444758-089113d48a6d'),
    sizes: ['One Size'],
    category: 'accessories',
    description:
      'Swiss quartz chronograph in a brushed steel case with a leather strap. Sapphire crystal, 5ATM water resistance.',
    stock: 8,
    createdAt: daysAgo(15),
  },
];

const seed = async () => {
  const snapshot = await db.collection('products').get();
  const byName = new Map(
    snapshot.docs.map((d) => [(d.data() as { name?: string }).name, d.ref]),
  );

  let added = 0;
  let migrated = 0;
  for (const product of PRODUCTS) {
    const gallery = GALLERIES[product.name];
    const images = gallery ? gallery.map(img) : [product.image];
    const doc = { ...product, images };

    const existing = byName.get(product.name);
    if (existing) {
      // Product already exists — migrate it by adding the multi-angle gallery.
      await existing.update({ images });
      console.log(`  migrate ${product.name} (+${images.length} angles)`);
      migrated++;
      continue;
    }
    await db.collection('products').add(doc);
    console.log(`  add     ${product.name} — ${product.category} — ${product.price}`);
    added++;
  }

  console.log(`\nSeed complete: ${added} added, ${migrated} migrated.`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

