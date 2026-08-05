import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProduct, type Product } from '../api';
import { useCartStore } from '../store/cartStore';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const addItem = useCartStore(state => state.addItem);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (id) {
        const prod = await fetchProduct(Number(id));
        setProduct(prod);
      }
    } catch (err) {
      setError('Не вдалося завантажити дані');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center text-white px-4">
        <p className="text-gray-400 mb-6">{error || 'Товар не знайдено'}</p>
        <div className="flex gap-4">
          <button 
            onClick={loadData} 
            className="px-6 py-2 bg-gray-800 text-brand-orange rounded-full font-bold border border-gray-700 active:scale-95 transition-transform"
          >
            Спробувати ще раз
          </button>
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-2 bg-brand-orange text-white rounded-full font-bold active:scale-95 transition-transform"
          >
            Повернутися
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => navigate(-1)}
          className="bg-black/50 backdrop-blur-md p-2 rounded-full border border-gray-700/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="relative h-80 w-full bg-gray-900 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-500">Фото відсутнє</span>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="flex justify-between items-end mb-2">
        </div>
        
        <h1 className="text-3xl font-black mb-2 leading-tight">{product.name}</h1>
        
        <div className="flex items-end gap-2 mb-6">
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-red-500">
            {product.price.toLocaleString('uk-UA')}
          </span>
          <span className="text-xl text-gray-400 mb-1">
            грн
          </span>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 mb-6 border border-gray-800">
          <h3 className="font-bold text-gray-300 mb-2">Опис</h3>
          <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
            {product.description || "Опис відсутній"}
          </p>
        </div>

        {/* Add to Cart Section */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex items-center justify-between">
          <button 
            onClick={() => {
              addItem(product);
            }}
            className="w-full py-4 bg-gradient-to-r from-brand-orange to-red-500 rounded-xl font-black text-lg text-white shadow-lg shadow-brand-orange/20 active:scale-[0.98] transition-transform"
          >
            ДОДАТИ В КОШИК
          </button>
        </div>
      </div>
    </div>
  );
}
