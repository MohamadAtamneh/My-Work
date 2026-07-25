import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import WishlistButton from '../components/products/WishlistButton';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { fetchProducts, Product } from '../services/api';

function Wishlist() {
  const { ids } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saved = (products || []).filter((p) => ids.includes(p.id));

  return (
    <Layout>
      <Seo
        title="Your Wishlist"
        description="Your saved pieces — kept for later."
        path="/wishlist"
        noindex
      />
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-widest text-muted mb-3"
            style={{ fontFamily: 'var(--font-body)' }}>
            Saved for Later
          </p>
          <h1 className="text-5xl md:text-6xl text-ink mb-4"
            style={{ fontFamily: 'var(--font-display)' }}>
            Your Wishlist
          </h1>
          <p className="text-muted max-w-md mx-auto text-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}>
            {ids.length > 0
              ? `${ids.length} ${ids.length === 1 ? 'piece' : 'pieces'} you're keeping an eye on.`
              : 'Tap the heart on any product to keep it here.'}
          </p>
        </div>

        {error && (
          <p className="text-center text-sm text-red-600 py-16">{error}</p>
        )}

        {!error && products === null && (
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 border-[1.5px] border-ink border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!error && products !== null && saved.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted text-sm mb-8" style={{ fontFamily: 'var(--font-body)' }}>
              Your wishlist is empty — go find something you love.
            </p>
            <Link to="/shop" className="btn-primary">Shop the Collection</Link>
          </div>
        )}

        {saved.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saved.map((product) => (
              <div key={product.id} className="card group flex flex-col relative">
                <WishlistButton
                  productId={product.id}
                  className="absolute top-3 right-3 z-10"
                />
                <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[3/4]">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  />
                </Link>
                <div className="p-5 flex flex-col flex-grow">
                  <Link
                    to={`/product/${product.id}`}
                    className="text-base text-ink hover:opacity-60 transition-opacity mb-1 leading-snug"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {product.name}
                  </Link>
                  <span className="text-lg font-medium text-ink mt-2 mb-4"
                    style={{ fontFamily: 'var(--font-body)' }}>
                    ${product.price}
                  </span>
                  <button
                    onClick={() =>
                      addToCart({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1,
                        size: product.sizes[0] || 'One Size',
                      })
                    }
                    className="btn-primary w-full !py-2.5 !text-sm mt-auto"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Wishlist;
