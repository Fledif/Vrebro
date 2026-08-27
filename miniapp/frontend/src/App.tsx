import React, { useEffect, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import WebApp from '@twa-dev/sdk';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import { Home as HomeIcon, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import LoadingScreen from './components/LoadingScreen';
import { useCartStore } from './store/cartStore';
import WeightModal from './components/WeightModal';

const Catalog = React.lazy(() => import('./pages/Catalog'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const MyOrders = React.lazy(() => import('./pages/MyOrders'));

function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const totalCount = useCartStore((state) => state.getTotalCount());

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Головна' },
    { path: '/catalog', icon: LayoutGrid, label: 'Каталог' },
    { path: '/cart', icon: ShoppingCart, label: 'Кошик', badge: totalCount },
    { path: '/my-orders', icon: User, label: 'Профіль' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#0F0F0F] border-t border-white/[0.04] flex justify-around items-center h-14 z-50">
      {navItems.map(({ path, icon: Icon, label, badge }) => (
        <Link
          key={path}
          to={path}
          className={clsx(
            "flex flex-col items-center gap-0.5 transition-colors py-1 px-3",
            isActive(path) ? "text-brand-orange" : "text-gray-600"
          )}
        >
          <motion.div 
            className="relative"
            key={path === '/cart' ? badge : 'static'}
            initial={path === '/cart' && badge ? { scale: 1.3, rotate: -15 } : {}}
            animate={path === '/cart' && badge ? { scale: 1, rotate: 0 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Icon size={18} strokeWidth={isActive(path) ? 2.5 : 1.5} />
            {badge !== undefined && badge > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-brand-red text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none shadow-[0_0_10px_rgba(209,0,0,0.6)]">
                {badge}
              </span>
            )}
          </motion.div>
          <span className="text-[9px] font-medium">{label}</span>
        </Link>
      ))}
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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white pb-14 font-sans relative">
        <LoadingScreen />
        <WeightModal />
        <div className="flex-1 w-full bg-[#0F0F0F] relative">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 2500,
            style: {
              background: 'rgba(25, 25, 25, 0.95)',
              color: '#fff',
              border: '1px solid rgba(255, 81, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              fontWeight: 'bold',
              fontSize: '13px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#FF5100',
                secondary: '#fff',
              },
            },
          }}
        />
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Routes>
          </Suspense>
        </div>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
