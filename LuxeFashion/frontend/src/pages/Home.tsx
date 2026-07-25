import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import CinematicHero from '../components/hero/CinematicHero';
import ProductGrid from '../components/products/ProductGrid';
import CategoryFilter from '../components/products/CategoryFilter';

function Home() {
  const [category, setCategory] = useState('all');

  return (
    // One Layout (single sticky nav + footer) wraps BOTH the hero and the page
    // content — the hero no longer renders its own duplicate navbar.
    <Layout>
      <Seo
        title="LuxeFashion"
        description="Premium everyday clothing — modern essentials in premium fabrics, ethically sourced. Free worldwide shipping and 30-day returns."
        path="/"
      />
      {/* Full-bleed cinematic hero */}
      <CinematicHero />

      {/* Collections section */}
        <div id="collections" className="max-w-7xl mx-auto px-8 py-20 scroll-mt-20">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-widest text-muted mb-3"
              style={{ fontFamily: 'var(--font-body)' }}>
              Curated for you
            </p>
            <h2 className="text-4xl md:text-5xl text-ink"
              style={{ fontFamily: 'var(--font-display)' }}>
              Featured Collections
            </h2>
          </div>
          <CategoryFilter selected={category} onSelect={setCategory} />
          <ProductGrid category={category} />
        </div>

        {/* Story section */}
        <section id="story" className="border-t border-border scroll-mt-20">
          <div className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-4"
                style={{ fontFamily: 'var(--font-body)' }}>
                Our Philosophy
              </p>
              <h2 className="text-4xl md:text-5xl text-ink mb-6 leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}>
                Designed for{' '}
                <em style={{ color: '#6F6F6F' }}>everyday luxury.</em>
              </h2>
              <p className="text-muted leading-relaxed mb-8"
                style={{ fontFamily: 'var(--font-body)' }}>
                LuxeFashion curates modern essentials with premium fabrics, clean
                silhouettes, and a reliable fit across every season. We believe
                clothing should feel as good as it looks.
              </p>
              <Link to="/shop" className="btn-primary">
                Shop the Collection
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '✦', title: 'Premium Fabrics', desc: 'Only the finest materials, ethically sourced.' },
                { icon: '◈', title: 'Timeless Design', desc: 'Silhouettes that transcend seasonal trends.' },
                { icon: '⟳', title: 'Easy Returns',    desc: '30-day hassle-free return policy.' },
                { icon: '⊞', title: 'Free Shipping',   desc: 'On all orders, worldwide.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="p-6 border border-border rounded-2xl">
                  <div className="text-2xl mb-3" aria-hidden="true">{icon}</div>
                  <h3 className="text-sm font-medium text-ink mb-1"
                    style={{ fontFamily: 'var(--font-body)' }}>{title}</h3>
                  <p className="text-xs text-muted leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
    </Layout>
  );
}

export default Home;
