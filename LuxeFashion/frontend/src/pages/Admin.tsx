import { useState, useEffect, useRef, FormEvent, DragEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../config/firebase';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
  ProductInput,
} from '../services/api';

const CATEGORIES = ['men', 'women', 'accessories', 'footwear'];
const EMPTY: ProductInput = { name: '', price: 0, image: '', sizes: [], category: 'men', description: '', stock: 0, salePrice: 0 };

// Shared form styling ג€” matches the LuxeFashion design system (ink/border/surface).
const inputClass =
  'w-full border border-border rounded-xl px-4 py-3 text-sm bg-white text-ink ' +
  'placeholder:text-muted focus:outline-none focus:border-ink transition-colors';
const labelClass = 'block text-xs uppercase tracking-widest text-ink font-medium mb-2';

// Price label for catalogue rows — sale price with the original in parentheses
// when discounted. (USD = the dollar sign, written as an escape to keep editors happy.)
const USD = '$';
const priceLabel = (p: Product): string =>
  p.salePrice && p.salePrice > 0 && p.salePrice < p.price
    ? USD + p.salePrice + ' (was ' + USD + p.price + ')'
    : USD + p.price;

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [sizesText, setSizesText] = useState('S,M,L');
  const [anglesText, setAnglesText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    setListLoading(true);
    try {
      setProducts(await fetchProducts());
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Failed to load products' });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadProducts();
  }, [isAdmin]);

  const set = (key: keyof ProductInput, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload a dropped / picked image to Firebase Storage and use its URL.
  const handleImageFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ kind: 'error', text: 'Please choose an image file (PNG, JPG, WebPג€¦)' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ kind: 'error', text: 'Image is too large ג€” please use a file under 5 MB.' });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const snapshot = await uploadBytes(
        storageRef(storage, `products/${Date.now()}-${safeName}`),
        file,
      );
      const url = await getDownloadURL(snapshot.ref);
      set('image', url);
    } catch (err) {
      setMessage({
        kind: 'error',
        text: err instanceof Error ? `Image upload failed: ${err.message}` : 'Image upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleImageFile(e.dataTransfer.files?.[0]);
  };

  const onFilePicked = (e: ChangeEvent<HTMLInputElement>) => {
    handleImageFile(e.target.files?.[0]);
    e.target.value = ''; // allow picking the same file again
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // Gallery of angles ג€” the main image is always the first angle.
      const extraAngles = anglesText
        .split(',')
        .map((s) => s.trim())
        .filter((u) => u && u !== form.image);
      const payload: ProductInput = {
        ...form,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        salePrice: Number(form.salePrice) || 0,
        sizes: sizesText.split(',').map((s) => s.trim()).filter(Boolean),
        images: [form.image, ...extraAngles],
      };
      if (payload.salePrice && payload.salePrice >= payload.price) {
        setMessage({ kind: 'error', text: 'Sale price must be lower than the regular price (use 0 for no sale).' });
        setSaving(false);
        return;
      }
      if (editingId) {
        await updateProduct(editingId, payload);
        setMessage({ kind: 'success', text: `"${payload.name}" updated.` });
      } else {
        await createProduct(payload);
        setMessage({ kind: 'success', text: `"${payload.name}" added to the catalogue.` });
      }
      setForm(EMPTY);
      setSizesText('S,M,L');
      setAnglesText('');
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      image: p.image,
      sizes: p.sizes,
      category: p.category,
      description: p.description || '',
      stock: p.stock ?? 0,
      salePrice: p.salePrice ?? 0,
    });
    setSizesText(p.sizes.join(','));
    // Extra angles = the gallery minus the main image (which has its own field).
    setAnglesText((p.images || []).slice(1).join(', '));
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    setMessage(null);
    try {
      await deleteProduct(id);
      setMessage({ kind: 'success', text: 'Product deleted.' });
      await loadProducts();
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Delete failed' });
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

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-8 py-40 text-center">
          <p className="text-xs uppercase tracking-widest text-muted mb-3"
            style={{ fontFamily: 'var(--font-body)' }}>
            Restricted
          </p>
          <h1 className="text-4xl md:text-5xl text-ink mb-4"
            style={{ fontFamily: 'var(--font-display)' }}>
            Admins <em style={{ color: '#6F6F6F' }}>only.</em>
          </h1>
          <p className="text-muted text-sm mb-10" style={{ fontFamily: 'var(--font-body)' }}>
            You must be signed in with an admin account to manage products.
          </p>
          <Link to="/account" className="btn-primary">Go to Account</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo title="Admin" description="Product catalogue administration." path="/admin" noindex />
      <div className="max-w-7xl mx-auto px-8 py-20">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted mb-3"
            style={{ fontFamily: 'var(--font-body)' }}>
            Admin
          </p>
          <h1 className="text-4xl md:text-5xl text-ink mb-3"
            style={{ fontFamily: 'var(--font-display)' }}>
            Product <em style={{ color: '#6F6F6F' }}>management.</em>
          </h1>
          <p className="text-muted text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            Add, edit and curate the LuxeFashion catalogue.
          </p>
        </div>

        {/* Feedback banner */}
        {message && (
          <p
            className={`max-w-3xl mb-8 text-sm rounded-xl px-4 py-3 border ${
              message.kind === 'error'
                ? 'text-red-600 bg-red-50 border-red-200'
                : 'text-ink bg-surface border-border'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {message.text}
          </p>
        )}

        {/* ג”€ג”€ Add / edit form ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */}
        <form onSubmit={handleSubmit} className="card p-8 mb-16 max-w-3xl space-y-6">
          <h2 className="text-3xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {editingId ? 'Edit Product' : 'Add a Product'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="product-name" className={labelClass}>Name</label>
              <input id="product-name" className={inputClass} value={form.name}
                onChange={(e) => set('name', e.target.value)} placeholder="Essential Cotton Tee" required />
            </div>
            <div>
              <label htmlFor="product-price" className={labelClass}>Price (USD)</label>
              <input id="product-price" className={inputClass} type="number" step="0.01" min="0"
                value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="95" required />
            </div>
            <div>
              <label htmlFor="product-sale-price" className={labelClass}>Sale Price (0 = no sale)</label>
              <input id="product-sale-price" className={inputClass} type="number" step="0.01" min="0"
                value={form.salePrice ?? 0} onChange={(e) => set('salePrice', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label htmlFor="product-category" className={labelClass}>Category</label>
              <select id="product-category" className={`${inputClass} capitalize`} value={form.category}
                onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="product-stock" className={labelClass}>Stock</label>
              <input id="product-stock" className={inputClass} type="number" min="0"
                value={form.stock ?? 0} onChange={(e) => set('stock', e.target.value)} placeholder="20" />
            </div>
          </div>

          {/* Image ג€” drag & drop / click to upload, or paste a URL */}
          <div>
            <label className={labelClass}>Product Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                dragActive ? 'border-ink bg-surface' : 'border-border hover:border-muted'
              }`}
            >
              {form.image ? (
                <img src={form.image} alt="Product preview"
                  className="mx-auto mb-4 h-36 w-36 rounded-xl object-cover border border-border" />
              ) : (
                <svg className="mx-auto mb-4 w-8 h-8 text-muted" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              )}
              <p className="text-sm text-muted" style={{ fontFamily: 'var(--font-body)' }}>
                {uploading
                  ? 'Uploadingג€¦'
                  : form.image
                    ? 'Drop a new image here or click to replace it'
                    : 'Drag & drop an image here, or click to browse'}
              </p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={onFilePicked} />
            <input className={`${inputClass} mt-3`} value={form.image}
              onChange={(e) => set('image', e.target.value)}
              placeholder="ג€¦or paste an image URL (https://ג€¦)" required />
          </div>

          {/* Extra angles ג€” shown on hover in the shop and as a gallery on the product page */}
          <div>
            <label htmlFor="product-angles" className={labelClass}>Additional Angles</label>
            <input id="product-angles" className={inputClass} value={anglesText}
              onChange={(e) => setAnglesText(e.target.value)}
              placeholder="https://ג€¦ , https://ג€¦" />
            <p className="text-xs text-muted mt-2" style={{ fontFamily: 'var(--font-body)' }}>
              Comma-separated image URLs for other angles ג€” shoppers see them on hover in the shop
              and as a clickable gallery on the product page.
            </p>
            {anglesText.trim() && (
              <div className="flex flex-wrap gap-2 mt-3">
                {anglesText.split(',').map((s) => s.trim()).filter(Boolean).map((url) => (
                  <img key={url} src={url} alt="Angle preview"
                    className="w-12 h-14 object-cover rounded-lg border border-border" />
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="product-sizes" className={labelClass}>Sizes</label>
            <input id="product-sizes" className={inputClass} value={sizesText}
              onChange={(e) => setSizesText(e.target.value)} placeholder="S,M,L,XL" />
            <p className="text-xs text-muted mt-2" style={{ fontFamily: 'var(--font-body)' }}>
              Separate sizes with commas ג€” e.g. S,M,L,XL or 40,41,42
            </p>
          </div>

          <div>
            <label htmlFor="product-description" className={labelClass}>Description</label>
            <textarea id="product-description" className={`${inputClass} resize-none`} rows={4}
              value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="A short, evocative description of the pieceג€¦" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || uploading}
              className="btn-primary px-8 disabled:opacity-50">
              {saving ? 'Savingג€¦' : editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary px-8"
                onClick={() => { setEditingId(null); setForm(EMPTY); setSizesText('S,M,L'); setAnglesText(''); setMessage(null); }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* ג”€ג”€ Catalogue list ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ */}
        <div className="flex items-end justify-between mb-6 max-w-3xl">
          <h2 className="text-3xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            Catalogue
          </h2>
          <p className="text-xs uppercase tracking-widest text-muted"
            style={{ fontFamily: 'var(--font-body)' }}>
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {listLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-[1.5px] border-ink border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="card p-10 text-center max-w-3xl">
            <p className="text-muted text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              No products yet. Add your first one above.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {products.map((p) => (
              <div key={p.id} className="card flex items-center gap-5 p-4">
                <img src={p.image} alt={p.name}
                  className="w-16 h-20 object-cover rounded-xl border border-border flex-shrink-0" />
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg text-ink truncate"
                    style={{ fontFamily: 'var(--font-display)' }}>
                    {p.name}
                  </h3>
                  <p className="text-xs uppercase tracking-wide text-muted"
                    style={{ fontFamily: 'var(--font-body)' }}>
                    {p.category} · {priceLabel(p)} · stock {p.stock ?? 0}
                  </p>
                </div>
                <button onClick={() => startEdit(p)}
                  className="text-sm text-ink underline underline-offset-4 hover:opacity-60 transition-opacity flex-shrink-0"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(p.id)}
                  className="text-sm text-red-600 hover:opacity-70 transition-opacity flex-shrink-0"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Admin;
