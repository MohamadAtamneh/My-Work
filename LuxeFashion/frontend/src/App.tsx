import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Route-level code splitting — every page loads on demand so the initial
// bundle stays small (GSAP, Stripe, admin code only download when needed).
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Account = lazy(() => import('./pages/Account'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Admin = lazy(() => import('./pages/Admin'));
const InfoPage = lazy(() => import('./pages/InfoPage'));

const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen bg-white">
    <div className="w-8 h-8 border-[1.5px] border-ink border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/info/:slug" element={<InfoPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
