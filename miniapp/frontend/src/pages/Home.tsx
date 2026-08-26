import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, type Product } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const prods = await fetchProducts();
      const top = prods.slice(0, 4);
      setPopularProducts(top);
    } catch (err) {
      console.error("Failed to fetch popular products", err);
      setError("Не вдалося завантажити дані");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      {/* Hero Section */}
      <div className="text-center mb-10 mt-8">
        <div className="inline-flex flex-col items-start mb-4" style={{ transform: 'rotate(-2deg)' }}>
          <span className="text-white text-3xl font-black italic leading-[0.85] ml-3" style={{ WebkitTextStroke: '1px #8B0000' }}>В</span>
          <div className="flex items-baseline">
            <span className="text-white text-4xl font-black italic leading-none" style={{ WebkitTextStroke: '1.5px #8B0000' }}>Ре</span>
            <span className="text-4xl font-black italic leading-none text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-700">БРО</span>
          </div>
        </div>
        <p className="text-gray-500 mt-3 text-sm">Свіжі продукти. Швидке замовлення. Якісний сервіс.</p>
        
        <Link 
          to="/catalog" 
          className="mt-6 block w-full py-4 btn-primary text-center text-lg"
        >
          ПЕРЕЙТИ В КАТАЛОГ
        </Link>
      </div>
      
      {/* Popular Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          🔥 Популярне
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-8 glass-card rounded-2xl p-6">
            <span className="text-gray-400 mb-4">{error}</span>
            <button 
              onClick={loadData}
              className="btn-secondary text-sm"
            >
              Спробувати ще раз
            </button>
          </div>
        ) : popularProducts.length === 0 ? (
          <div className="flex justify-center items-center py-8 text-gray-500">
            Товарів не знайдено
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-4 px-4">
            {popularProducts.map(product => (
              <div key={product.id} className="min-w-[170px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
