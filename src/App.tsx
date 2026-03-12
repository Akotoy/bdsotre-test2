import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Cabinet from './pages/Cabinet';
import ProductDetails from './pages/ProductDetails';
import CreatorShop from './pages/CreatorShop';
import Constructor from './pages/Constructor'; // Added Constructor import
import SellerLogin from './pages/SellerLogin';
import SellerDashboard from './pages/SellerDashboard';
import { AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useProductStore } from './store/productStore';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="popLayout">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<CreatorShop />} />
          {/* Blogger shops */}
          <Route path="shop/:slug" element={<CreatorShop />} />
          <Route path=":slug" element={<CreatorShop />} />
          {/* Constructor */}
          <Route path="constructor/:slug" element={<Constructor />} />
          {/* Product */}
          <Route path="product/:id" element={<ProductDetails />} />
          {/* Purchase flow */}
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          {/* User profile */}
          <Route path="me" element={<Cabinet />} />
          <Route path="cabinet" element={<Navigate to="/me" replace />} />
          {/* Hide old routes */}
          <Route path="catalog" element={<Navigate to="/" replace />} />
          <Route path="admin" element={<Navigate to="/" replace />} />
          <Route path="seller" element={<Navigate to="/seller/login" replace />} />
        </Route>

        {/* Seller Portal (Outside main Layout) */}
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const { fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
