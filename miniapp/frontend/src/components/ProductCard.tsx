import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../api';
import { useCartStore } from '../store/cartStore';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

function getFavorites(): number[] {
  try { return JSON.parse(localStorage.getItem('vrebro_favorites') || '[]'); } catch { return []; }
}
function saveFavorites(ids: number[]) {
  localStorage.setItem('vrebro_favorites', JSON.stringify(ids));
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openWeightModal = useCartStore((state) => state.openWeightModal);
  const [isFav, setIsFav] = useState(() => getFavorites().includes(product.id));

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favs = getFavorites();
    const next = favs.includes(product.id) ? favs.filter(id => id !== product.id) : [...favs, product.id];
    saveFavorites(next);
    setIsFav(next.includes(product.id));
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.is_weighted) {
      openWeightModal(product);
    } else {
      addItem(product);
      toast.success(`${product.name} додано до кошика`);
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    }
  };

  const isOutOfStock = product.is_out_of_stock || 
    (product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity <= 0);

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col">
      <Link to={`/product/${product.id}`} className="block relative h-44 overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 active:scale-105"
            loading="lazy" 
          />
        ) : (
          <div className="w-full h-full bg-brand-charcoal flex items-center justify-center">
            <span className="text-gray-600 text-xs">Фото</span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-red-500 text-xs font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">Немає в наявності</span>
          </div>
        )}
        {/* Heart favorite button */}
        <button
          onClick={toggleFav}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all active:scale-90 ${isFav ? 'bg-red-500 text-white' : 'bg-black/40 text-white/60'}`}
        >
          <Heart size={13} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </Link>
      
      <div className="p-3 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-bold text-white mb-1 leading-tight line-clamp-2">{product.name}</h3>
        </Link>
        <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">
          {product.description || ""}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t divider">
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-black text-brand-orange">
              {product.price.toLocaleString('uk-UA')}
            </span>
            <span className="text-[10px] text-brand-orange/70 font-medium">₴ {product.is_weighted ? '/ кг' : '/ шт'}</span>
          </div>
          
          {!isOutOfStock && (
            <button 
              onClick={handleAddToCart}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-brand-red text-white flex items-center justify-center font-bold text-base active:scale-90 transition-transform"
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
