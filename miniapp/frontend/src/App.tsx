import React, { useEffect, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import { Home as HomeIcon, LayoutGrid, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';
import LoadingScreen from './components/LoadingScreen';
import { useCartStore } from './store/cartStore';

const Catalog = React.lazy(() => import('./pages/Catalog'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const MyOrders = React.lazy(() => import('./pages/MyOrders'));

import { User } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const totalCount = useCartStore((state) => state.getTotalCount());

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-brand-gray border-t border-gray-800 flex justify-around items-center h-16 z-50">
      <Link to="/" className={clsx("flex flex-col items-center transition-colors", isActive('/') ? "text-brand-orange" : "text-gray-400 hover:text-brand-orange")}>
        <HomeIcon size={20} />
        <span className="text-[10px] mt-1">Головна</span>
      </Link>
      <Link to="/catalog" className={clsx("flex flex-col items-center transition-colors", isActive('/catalog') ? "text-brand-orange" : "text-gray-400 hover:text-brand-orange")}>
        <LayoutGrid size={20} />
        <span className="text-[10px] mt-1">Каталог</span>
      </Link>
      <Link to="/cart" className={clsx("relative flex flex-col items-center transition-colors", isActive('/cart') ? "text-brand-orange" : "text-gray-400 hover:text-brand-orange")}>
        <ShoppingCart size={20} />
        <span className="text-[10px] mt-1">Кошик</span>
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {totalCount}
          </span>
        )}
      </Link>
      <Link to="/my-orders" className={clsx("flex flex-col items-center transition-colors", isActive('/my-orders') ? "text-brand-orange" : "text-gray-400 hover:text-brand-orange")}>
        <User size={20} />
        <span className="text-[10px] mt-1">Профіль</span>
      </Link>
    </nav>
  );
}

function App() {
  useEffect(() => {
    try {
      if (WebApp && typeof WebApp.ready === 'function') {
        WebApp.ready();
        WebApp.expand();
      }
    } catch (e) {
      console.warn("Not inside Telegram Web App");
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-brand-dark text-white pb-16 font-sans relative">
        <LoadingScreen />
        <main className="flex-grow overflow-x-hidden">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Routes>
          </Suspense>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
