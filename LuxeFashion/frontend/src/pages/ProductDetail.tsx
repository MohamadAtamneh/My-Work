import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import WishlistButton from '../components/products/WishlistButton';
import PriceTag from '../components/products/PriceTag';
import StarRating from '../components/products/StarRating';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchProductReviews, submitReview, deleteReviewApi, Review } from '../services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  sizes: string[];
  category: string;
  description?: string;
  salePrice?: number;
  ratingAvg?: number;
  ratingCount?: number;
  stock?: number;
}

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct]           = useState<Product | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedAngle, setSelectedAngle] = useState(0);
  const [added, setAdded]               = useState(false);

  // Reviews
  const { user } = useAuth();
  const [reviews, setReviews]           = useState<Review[]>([]);
  const [ratingInput, setRatingInput]   = useState(5);
  const [reviewText, setReviewText]     = useState('');
  const [reviewError, setReviewError]   = useState<string | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
        setSelectedSize(data.sizes?.[0] || 'One Size');
        setSelectedAngle(0); // reset the gallery when navigating between products
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    if (id) {
      fetchProductReviews(id).then(setReviews).catch(() => setReviews([]));
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addToCart({ productId: product.id, name: product.name, price: product.price,
      image: product.image, quantity: 1, size: selectedSize });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || reviewSaving) return;
    setReviewSaving(true);
    setReviewError(null);
    try {
      await submitReview(id, { rating: ratingInput, text: reviewText });
      setReviewText('');
      setRatingInput(5);
      setReviews(await fetchProductReviews(id));
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setReviewSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!id) return;
    try {
      await deleteReviewApi(id, reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      // leave the list as-is
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-40">
          <div className="w-8 h-8 border-[1.5px] border-ink border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-8 py-32 text-center">
          <h1 className="text-4xl text-ink mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Product not found
          </h1>
          <Link to="/shop" className="btn-primary">Back to Shop</Link>
        </div>
      </Layout>
    );
  }

  // Gallery of angles — fall back to the single image for older products.
  const gallery = product.images?.length ? product.images : [product.image];

  return (
    <Layout>
      <Seo
        title={product.name}
        description={
          product.description?.slice(0, 155) ||
          `${product.name} — premium ${product.category} by LuxeFashion. Free worldwide shipping and 30-day returns.`
        }
        path={`/product/${product.id}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: gallery,
          description: product.description || undefined,
          category: product.category,
          ...(product.ratingCount
            ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: product.ratingAvg,
                  reviewCount: product.ratingCount,
                },
              }
            : {}),
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price:
              product.salePrice && product.salePrice > 0 && product.salePrice < product.price
                ? product.salePrice
                : product.price,
            availability:
              product.stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          },
        }}
      />
      <div className="max-w-7xl mx-auto px-8 py-16">

        {/* Breadcrumb */}
        <Link
          to="/shop"
          className="text-sm text-muted hover:text-ink transition-colors mb-10 inline-flex items-center gap-2"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          ← Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-6">

          {/* Gallery — main angle + clickable thumbnails for the other angles */}
          <div>
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-surface relative">
              <WishlistButton productId={product.id} className="absolute top-3 right-3 z-10" />
              <img
                key={gallery[selectedAngle]}
                src={gallery[selectedAngle]}
                alt={`${product.name} — angle ${selectedAngle + 1}`}
                className="w-full h-full object-cover animate-fade-in"
              />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-3 mt-4">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSelectedAngle(i)}
                    aria-label={`View angle ${i + 1}`}
                    aria-pressed={selectedAngle === i}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                      selectedAngle === i
                        ? 'border-ink'
                        : 'border-border opacity-60 hover:opacity-100 hover:border-muted'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <span
              className="text-xs uppercase tracking-widest text-muted mb-4"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {product.category}
            </span>

            <h1
              className="text-4xl md:text-5xl text-ink mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <PriceTag price={product.price} salePrice={product.salePrice} large />
              {(product.ratingCount ?? 0) > 0 && (
                <span className="flex items-center gap-1.5">
                  <StarRating value={product.ratingAvg || 0} />
                  <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-body)' }}>
                    {product.ratingAvg} ({product.ratingCount})
                  </span>
                </span>
              )}
            </div>

            <p className="text-muted leading-relaxed mb-8 text-sm"
              style={{ fontFamily: 'var(--font-body)' }}>
              {product.description || 'Premium quality clothing from LuxeFashion. Crafted with the finest fabrics for lasting comfort and effortless style.'}
            </p>

            {/* Size selector */}
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-widest text-ink mb-4"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                Select Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="min-w-12 px-4 py-2.5 rounded-full text-sm transition-all duration-200"
                    style={{
                      fontFamily : 'var(--font-body)',
                      border     : '1.5px solid',
                      borderColor: selectedSize === size ? '#000' : '#E5E5E5',
                      background : selectedSize === size ? '#000' : 'transparent',
                      color      : selectedSize === size ? '#fff' : '#6F6F6F',
                      cursor     : 'pointer',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-primary w-full !py-4 !text-base"
            >
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-muted" style={{ fontFamily: 'var(--font-body)' }}>
              <div className="flex items-center gap-2"><span>↩</span> Free returns within 30 days</div>
              <div className="flex items-center gap-2"><span>⚡</span> Fast worldwide shipping</div>
              <div className="flex items-center gap-2"><span>✦</span> Premium quality guarantee</div>
              <div className="flex items-center gap-2"><span>🔒</span> Secure checkout</div>
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <section className="mt-24 border-t border-border pt-16">
          <h2 className="text-3xl text-ink mb-10" style={{ fontFamily: 'var(--font-display)' }}>
            Reviews {reviews.length > 0 && <span className="text-muted text-2xl">({reviews.length})</span>}
          </h2>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="max-w-2xl mb-14 space-y-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRatingInput(i)}
                    aria-label={'Rate ' + i + ' out of 5 stars'}
                    className={`text-2xl leading-none transition-colors ${
                      i <= ratingInput ? 'text-ink' : 'text-border'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                required
                placeholder="How's the fit, fabric, and quality?"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-white text-ink
                  placeholder:text-muted focus:outline-none focus:border-ink transition-colors resize-none"
              />
              {reviewError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {reviewError}
                </p>
              )}
              <button type="submit" disabled={reviewSaving}
                className="btn-primary !py-2.5 !px-6 !text-sm disabled:opacity-50">
                {reviewSaving ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted mb-14" style={{ fontFamily: 'var(--font-body)' }}>
              <Link to="/account" className="text-ink underline underline-offset-4 hover:opacity-60 transition-opacity">
                Sign in
              </Link>{' '}
              to write a review.
            </p>
          )}

          <div className="space-y-8 max-w-2xl">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted" style={{ fontFamily: 'var(--font-body)' }}>
                No reviews yet — be the first to share your thoughts.
              </p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border-b border-border pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-ink" style={{ fontFamily: 'var(--font-body)' }}>
                        {r.authorName}
                      </span>
                      <StarRating value={r.rating} />
                      {r.verifiedPurchase && (
                        <span className="text-[11px] uppercase tracking-wide text-muted"
                          style={{ fontFamily: 'var(--font-body)' }}>
                          Verified purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-body)' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                      {user?.uid === r.userId && (
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="text-xs text-red-600 hover:opacity-70 transition-opacity"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                    {r.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default ProductDetail;
