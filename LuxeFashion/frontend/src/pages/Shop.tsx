import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import CategoryFilter from '../components/products/CategoryFilter';
import ProductGrid from '../components/products/ProductGrid';

function Shop() {
  const { category: routeCategory } = useParams();
  const [searchParams] = useSearchParams();
  // /shop?sort=new → New Arrivals mode (reached from the "New Arrivals" nav CTA)
  const isNewArrivals = searchParams.get('sort') === 'new';
  // /shop?q=… → search mode (submitted from the header search bar)
  const searchQuery = (searchParams.get('q') || '').trim();
  const isSearch = searchQuery.length > 0;

  const [selectedCategory, setSelectedCategory] = useState(routeCategory || 'all');

  // Keep the filter in sync when the route changes (e.g. footer "Men" link
  // clicked while already on /shop — previously the old category stayed active).
  useEffect(() => {
    setSelectedCategory(routeCategory || 'all');
  }, [routeCategory]);

  return (
    <Layout>
      <Seo
        title={isSearch ? `Search: ${searchQuery}` : isNewArrivals ? 'New Arrivals' : 'Shop All Collections'}
        description={
          isSearch
            ? `Search results for ${searchQuery} across the LuxeFashion collection.`
            : isNewArrivals
              ? 'The latest drops from LuxeFashion — fresh silhouettes added in the last two weeks.'
              : 'Shop timeless pieces for every occasion — premium fabrics, clean silhouettes, free worldwide shipping.'
        }
        path={routeCategory ? `/shop/${routeCategory}` : '/shop'}
      />
      <div className="max-w-7xl mx-auto px-8 py-20">

        {/* Page header */}
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-widest text-muted mb-3"
            style={{ fontFamily: 'var(--font-body)' }}>
            {isSearch ? 'Search' : isNewArrivals ? 'Just Landed' : 'Explore'}
          </p>
          <h1 className="text-5xl md:text-6xl text-ink mb-4"
            style={{ fontFamily: 'var(--font-display)' }}>
            {isSearch ? `Results for “${searchQuery}”` : isNewArrivals ? 'New Arrivals' : 'All Collections'}
          </h1>
          <p className="text-muted max-w-md mx-auto text-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}>
            {isSearch
              ? 'Pieces matching your search across every collection.'
              : isNewArrivals
                ? 'The latest drops, newest first — fresh silhouettes added in the last two weeks carry the NEW mark.'
                : 'Timeless pieces for every occasion — crafted for those who move with intention.'}
          </p>
        </div>

        {!isNewArrivals && !isSearch && (
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        )}
        <ProductGrid
          category={isNewArrivals || isSearch ? 'all' : selectedCategory}
          sort={isNewArrivals ? 'new' : 'default'}
          query={isSearch ? searchQuery : undefined}
        />
      </div>
    </Layout>
  );
}

export default Shop;
