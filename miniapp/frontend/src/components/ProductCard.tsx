import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../api';
import { useCartStore } from '../store/cartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl overflow-hidden relative group flex flex-col">
      <Link to={`/product/${product.id}`} className="block relative h-48 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300 z-10" />
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover relative z-0 transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <span className="text-gray-500 text-xs z-10 relative">Фото</span>
        )}
      </Link>
      
      <div className="p-3 flex-1 flex flex-col relative z-20">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-base font-bold text-white mb-1 leading-tight line-clamp-2 drop-shadow-md">{product.name}</h3>
        </Link>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
          {product.description || "Опис відсутній"}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
          <div className="flex items-baseline">
            <span className="text-lg font-black text-white text-glow drop-shadow-[0_0_8px_rgba(255,81,0,0.8)]">
              {product.price.toLocaleString('uk-UA')}
            </span>
            <span className="text-[10px] text-gray-400 ml-1">
              грн
            </span>
          </div>
          
          {product.is_out_of_stock || (product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity <= 0) ? (
            <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-lg backdrop-blur-sm border border-red-500/20">Немає</span>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white flex items-center justify-center font-bold text-lg hover:shadow-[0_0_15px_rgba(255,81,0,0.5)] active:scale-95 transition-all border border-orange-300/30"
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
