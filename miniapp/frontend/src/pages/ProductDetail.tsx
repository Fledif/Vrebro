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

  const isOutOfStock = product?.is_out_of_stock || 
    (product?.stock_quantity !== null && product?.stock_quantity !== undefined && product?.stock_quantity <= 0);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-white px-4">
        <p className="text-gray-400 mb-6">{error || 'Товар не знайдено'}</p>
        <div className="flex gap-3">
          <button onClick={loadData} className="btn-secondary text-sm">Спробувати ще раз</button>
          <button onClick={() => navigate(-1)} className="btn-primary text-sm">Повернутися</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-24">
      {/* Back Button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Product Image */}
      <div className="relative h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A] z-10" />
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-brand-charcoal flex items-center justify-center">
            <span className="text-gray-600">Фото відсутнє</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 -mt-12 relative z-20">
        <h1 className="text-2xl font-black mb-2 leading-tight">{product.name}</h1>
        
        <div className="flex items-end gap-1.5 mb-5">
          <span className="text-3xl font-black text-brand-orange text-glow-orange">
            {product.price.toLocaleString('uk-UA')}
          </span>
          <span className="text-lg text-gray-500 mb-0.5">грн</span>
        </div>

        {product.description && (
          <div className="glass-card rounded-2xl p-4 mb-5">
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2">Опис</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}

        {/* CTA */}
        {isOutOfStock ? (
          <button 
            disabled
            className="w-full py-4 bg-brand-charcoal rounded-xl font-bold text-base text-red-500/70 border border-red-500/10 cursor-not-allowed"
          >
            НЕМАЄ В НАЯВНОСТІ
          </button>
        ) : (
          <button 
            onClick={() => addItem(product)}
            className="w-full py-4 btn-primary text-base"
          >
            ДОДАТИ В КОШИК
          </button>
        )}
      </div>
    </div>
  );
}
