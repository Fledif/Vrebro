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
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-700/50 relative group flex flex-col">
      <Link to={`/product/${product.id}`} className="block relative h-40 bg-gray-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition duration-300 z-10" />
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover relative z-0" />
        ) : (
          <span className="text-gray-500 text-xs z-10 relative">Фото</span>
        )}
        
      </Link>
      
      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-bold text-white mb-1 leading-tight line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {product.description || "Опис відсутній"}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-700/50">
          <div>
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              {product.price.toLocaleString('uk-UA')}
            </span>
            <span className="text-xs text-gray-400 ml-1">
              грн
            </span>
          </div>
          
          {product.is_out_of_stock || (product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity <= 0) ? (
            <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">Немає</span>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-lg hover:bg-orange-500 active:scale-95 transition-transform"
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
